import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import catchAsync from "../utils/catchAsync-utils.js";
import AppError from "../utils/appError-utils.js";
import ApiResponse from "../utils/apiResponse-utils.js";
import Order from "../models/Order.js";
import { getIO } from "../socket.js";

// Calculate total applying percentage discount per item
const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
    return total + item.quantity * discountedPrice;
  }, 0);
};

// ========================
// CUSTOMER ENDPOINTS
// ========================

// POST /api/v1/orders — Place order from cart
export const placeOrder = catchAsync(async (req, res, next) => {
  if (!req.user.emailVerified) {
    return next(
      new AppError("Please verify your email before placing an order", 403),
    );
  }

  const { lat, lng, address, paymentMethod, orderType } = req.body;

  if (orderType !== "takeaway" && !address) {
    return next(new AppError("Delivery address is required", 400));
  }

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart || cart.items.length === 0) {
    return next(new AppError("Your cart is empty", 400));
  }

  // Validate all products still exist and are available, refresh prices
  const orderItems = [];
  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return next(
        new AppError(`Product ${item.productId} no longer exists`, 400),
      );
    }
    if (!product.isAvailable) {
      return next(
        new AppError(`"${product.name}" is currently unavailable`, 400),
      );
    }
    orderItems.push({
      productId: product._id,
      quantity: item.quantity,
      price: product.price,
      discount: product.discount || 0,
    });
  }

  const totalAmount = calculateTotal(orderItems);

  const order = await Order.create({
    userId: req.user._id,
    items: orderItems,
    totalAmount,
    orderType: orderType || "delivery",
    deliveryLocation:
      orderType === "takeaway"
        ? { address: "Takeaway - Store Pickup" }
        : { lat: lat || 0, lng: lng || 0, address },
    paymentMethod: paymentMethod || "cod",
  });

  // Clear the cart after placing order
  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  await order.populate("items.productId");

  // Notify admins in real-time
  try {
    getIO().to("admins").emit("order_update", {
      type: "new_order",
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      customerName: req.user.name,
      createdAt: order.createdAt,
    });
  } catch {
    // socket not critical
  }

  res
    .status(201)
    .json(new ApiResponse(201, "Order placed successfully", { order }));
});

// GET /api/v1/orders — Get my orders (customer)
export const getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({
    userId: req.user._id,
    deletedByUser: { $ne: true },
  })
    .populate("items.productId")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, "Orders fetched successfully", { orders }));
});

// GET /api/v1/orders/:id — Get single order detail (customer)
export const getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("items.productId");

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Customers can only view their own orders
  if (
    req.user.role !== "admin" &&
    order.userId.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("Permission denied", 403));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Order fetched successfully", { order }));
});

// PATCH /api/v1/orders/:id/cancel — Cancel order (customer, only if pending)
export const cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (order.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Permission denied", 403));
  }

  if (order.status !== "pending") {
    return next(
      new AppError(
        "Order can only be cancelled when it is in pending status",
        400,
      ),
    );
  }

  order.status = "cancelled";
  await order.save();
  await order.populate("items.productId");

  // Notify admins in real-time
  try {
    getIO().to("admins").emit("order_update", {
      type: "order_cancelled",
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerName: req.user.name,
    });
  } catch {
    // socket not critical
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Order cancelled successfully", { order }));
});

// DELETE /api/v1/orders/:id — Soft-delete cancelled order (customer)
export const deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (order.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Permission denied", 403));
  }

  if (order.status !== "cancelled") {
    return next(new AppError("Only cancelled orders can be deleted", 400));
  }

  order.deletedByUser = true;
  await order.save();

  res.status(200).json(new ApiResponse(200, "Order deleted successfully"));
});

// ========================
// ADMIN ENDPOINTS
// ========================

const VALID_STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

// GET /api/v1/orders/admin/all — Get all orders (admin)
export const getAllOrders = catchAsync(async (req, res, next) => {
  const { status } = req.query;

  const filter = {};
  if (status) {
    filter.status = status;
  }

  const orders = await Order.find(filter)
    .populate("items.productId")
    .populate("userId", "name email mobile")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, "All orders fetched successfully", { orders }));
});

// PATCH /api/v1/orders/admin/:id/status — Update order status (admin)
export const updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new AppError("Please provide a status", 400));
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  const allowedTransitions = VALID_STATUS_TRANSITIONS[order.status];
  if (!allowedTransitions || !allowedTransitions.includes(status)) {
    return next(
      new AppError(
        `Cannot change status from "${order.status}" to "${status}"`,
        400,
      ),
    );
  }

  order.status = status;
  await order.save();
  await order.populate("items.productId");
  await order.populate("userId", "name email mobile");

  // Notify the customer in real-time
  try {
    getIO().to(`user:${order.userId._id}`).emit("order_status_changed", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
    });
    // Also notify admins so all admin dashboards stay in sync
    getIO().to("admins").emit("order_update", {
      type: "status_changed",
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
    });
  } catch {
    // socket not critical
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, `Order status updated to "${status}"`, { order }),
    );
});

// GET /api/v1/orders/admin/stats — Dashboard stats (admin)
export const getAdminStats = catchAsync(async (req, res, next) => {
  const [stats] = await Order.aggregate([
    {
      $facet: {
        overall: [
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        "$status",
                        [
                          "confirmed",
                          "packed",
                          "out_for_delivery",
                          "delivered",
                        ],
                      ],
                    },
                    "$totalAmount",
                    0,
                  ],
                },
              },
              deliveredRevenue: {
                $sum: {
                  $cond: [{ $eq: ["$status", "delivered"] }, "$totalAmount", 0],
                },
              },
              cancelledCount: {
                $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
              },
              cancelledRevenue: {
                $sum: {
                  $cond: [{ $eq: ["$status", "cancelled"] }, "$totalAmount", 0],
                },
              },
            },
          },
        ],
        byStatus: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              amount: { $sum: "$totalAmount" },
            },
          },
        ],
        dailyOrders: [
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              orders: { $sum: 1 },
              revenue: { $sum: "$totalAmount" },
              cancelled: {
                $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
              },
              delivered: {
                $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
              },
            },
          },
          { $sort: { _id: 1 } },
          { $limit: 30 },
        ],
        cancelledByUser: [
          { $match: { status: "cancelled" } },
          {
            $group: {
              _id: "$userId",
              count: { $sum: 1 },
              totalLost: { $sum: "$totalAmount" },
              orderNumbers: { $push: "$orderNumber" },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              count: 1,
              totalLost: 1,
              orderNumbers: 1,
              "user.name": 1,
              "user.email": 1,
            },
          },
        ],
        recentOrders: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              totalAmount: 1,
              status: 1,
              createdAt: 1,
              "user.name": 1,
              "user.email": 1,
            },
          },
        ],
        byPaymentMethod: [
          {
            $group: {
              _id: "$paymentMethod",
              count: { $sum: 1 },
              amount: { $sum: "$totalAmount" },
            },
          },
        ],
      },
    },
  ]);

  const overall = stats.overall[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    deliveredRevenue: 0,
    cancelledCount: 0,
    cancelledRevenue: 0,
  };
  const statusMap = {};
  for (const s of stats.byStatus) {
    statusMap[s._id] = { count: s.count, amount: Math.round(s.amount) };
  }
  const paymentMap = {};
  for (const p of stats.byPaymentMethod) {
    paymentMap[p._id] = { count: p.count, amount: Math.round(p.amount) };
  }

  res.status(200).json(
    new ApiResponse(200, "Admin stats fetched", {
      totalOrders: overall.totalOrders,
      totalRevenue: Math.round(overall.totalRevenue),
      deliveredRevenue: Math.round(overall.deliveredRevenue),
      cancelledCount: overall.cancelledCount,
      cancelledRevenue: Math.round(overall.cancelledRevenue),
      ordersByStatus: statusMap,
      dailyOrders: stats.dailyOrders.map((d) => ({
        date: d._id,
        orders: d.orders,
        revenue: Math.round(d.revenue),
        cancelled: d.cancelled,
        delivered: d.delivered,
      })),
      cancelledByUser: stats.cancelledByUser,
      recentOrders: stats.recentOrders,
      byPaymentMethod: paymentMap,
    }),
  );
});
