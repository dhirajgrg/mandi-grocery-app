import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import catchAsync from "../utils/catchAsync-utils.js";
import AppError from "../utils/appError-utils.js";
import ApiResponse from "../utils/apiResponse-utils.js";
import Order from "../models/Order.js";
import { getIO } from "../socket.js";
import { sendSMS } from "../utils/sms-utils.js";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

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
  // Only allow orders between 7:00 AM and 9:00 PM Nepal Time (UTC+5:45)
  const now = new Date();
  const nepalOffset = 5 * 60 + 45; // minutes
  const nepalMinutes =
    now.getUTCHours() * 60 + now.getUTCMinutes() + nepalOffset;
  const nepalHour = Math.floor((nepalMinutes % 1440) / 60);
  if (nepalHour < 7 || nepalHour >= 21) {
    return next(
      new AppError(
        "Orders can only be placed between 7:00 AM and 9:00 PM",
        400,
      ),
    );
  }

  const { lat, lng, address, paymentMethod, orderType } = req.body;

  if (!address) {
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

  // Mock SMS to console for new order
  console.log(
    `\n📦 [NEW ORDER] #${order.orderNumber} placed by ${req.user.name} (+977${req.user.mobile}) — Rs.${Math.round(order.totalAmount)}\n`,
  );

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

// POST /api/v1/orders/:id/reorder — Add items from a past order back to cart
export const reorder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (order.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Permission denied", 403));
  }

  // Validate products still exist and are available
  const validItems = [];
  const unavailable = [];
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isAvailable) {
      unavailable.push(item.productId);
      continue;
    }
    validItems.push({
      productId: product._id,
      quantity: item.quantity,
      price: product.price,
      discount: product.discount || 0,
    });
  }

  if (validItems.length === 0) {
    return next(
      new AppError(
        "None of the items in this order are available anymore",
        400,
      ),
    );
  }

  // Upsert into cart
  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    cart = await Cart.create({
      userId: req.user._id,
      items: [],
      totalAmount: 0,
    });
  }

  for (const item of validItems) {
    const existing = cart.items.find(
      (ci) => ci.productId.toString() === item.productId.toString(),
    );
    if (existing) {
      existing.quantity = item.quantity;
      existing.price = item.price;
      existing.discount = item.discount;
    } else {
      cart.items.push(item);
    }
  }

  // Recalculate totalAmount
  cart.totalAmount = cart.items.reduce((sum, ci) => {
    const discounted = ci.price * (1 - (ci.discount || 0) / 100);
    return sum + discounted * ci.quantity;
  }, 0);

  await cart.save();
  await cart.populate("items.productId");

  const message =
    unavailable.length > 0
      ? `${validItems.length} item(s) added to cart. ${unavailable.length} item(s) are no longer available.`
      : "All items added to cart";

  res.status(200).json(new ApiResponse(200, message, { cart }));
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
    .populate("userId", "name mobile")
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

  // Deduct stock when order is delivered
  if (status === "delivered") {
    const updatedProducts = [];
    for (const item of order.items) {
      const updated = await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stockQuantity: -item.quantity } },
        { new: true },
      );
      if (updated) {
        updatedProducts.push({
          _id: updated._id,
          name: updated.name,
          stockQuantity: updated.stockQuantity,
          lowStockThreshold: updated.lowStockThreshold,
          isAvailable: updated.isAvailable,
        });
      }
    }
    // Notify all clients about stock changes
    try {
      getIO().emit("stock_updated", { products: updatedProducts });
    } catch {
      // socket not critical
    }
  }

  order.status = status;
  await order.save();
  await order.populate("items.productId");
  await order.populate("userId", "name mobile");

  const statusLabel = STATUS_LABELS[status] || status;

  // Mock SMS notification to console
  if (order.userId?.mobile) {
    await sendSMS(
      order.userId.mobile,
      `Order #${order.orderNumber} update: Your order is now "${statusLabel}". Thank you for shopping with Mandi!`,
    );
  }

  // Notify the customer in real-time
  try {
    getIO()
      .to(`user:${order.userId._id}`)
      .emit("order_status_changed", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        statusLabel,
        message: `Your order #${order.orderNumber} is now ${statusLabel}`,
      });
    // Also notify admins so all admin dashboards stay in sync
    getIO().to("admins").emit("order_update", {
      type: "status_changed",
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel,
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

// POST /api/v1/orders/admin/bulk-delete — Bulk delete orders (admin)
export const bulkDeleteOrders = catchAsync(async (req, res, next) => {
  const { orderIds } = req.body;

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return next(new AppError("Please provide an array of order IDs", 400));
  }

  const result = await Order.deleteMany({ _id: { $in: orderIds } });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `${result.deletedCount} order(s) deleted successfully`,
      ),
    );
});

// GET /api/v1/orders/admin/stats — Dashboard stats (admin)
export const getAdminStats = catchAsync(async (req, res, next) => {
  const { trendingPeriod = "monthly" } = req.query;

  // Build date filter for trending items based on period
  const now = new Date();
  let trendingDateFilter;
  if (trendingPeriod === "daily") {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    trendingDateFilter = { createdAt: { $gte: dayStart } };
  } else if (trendingPeriod === "yearly") {
    const yearStart = new Date(now.getFullYear(), 0, 1);
    trendingDateFilter = { createdAt: { $gte: yearStart } };
  } else {
    // monthly (default)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    trendingDateFilter = { createdAt: { $gte: monthStart } };
  }

  // Today boundaries for time breakdown
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

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
              "user.mobile": 1,
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
              "user.mobile": 1,
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
        trendingProducts: [
          { $match: { status: { $ne: "cancelled" }, ...trendingDateFilter } },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.productId",
              totalSold: { $sum: "$items.quantity" },
              totalRevenue: {
                $sum: {
                  $multiply: [
                    "$items.quantity",
                    {
                      $multiply: [
                        "$items.price",
                        {
                          $subtract: [
                            1,
                            {
                              $divide: [
                                { $ifNull: ["$items.discount", 0] },
                                100,
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
          { $sort: { totalSold: -1 } },
          { $limit: 8 },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "product",
            },
          },
          { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              totalSold: 1,
              totalRevenue: 1,
              "product.name": 1,
              "product.images": 1,
              "product.unit": 1,
            },
          },
        ],
        activeOrderTracking: [
          {
            $match: {
              status: {
                $in: ["pending", "confirmed", "packed", "out_for_delivery"],
              },
            },
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              totalAmount: { $sum: "$totalAmount" },
            },
          },
        ],
        todayOrdersByTime: [
          {
            $match: {
              createdAt: { $gte: todayStart, $lt: todayEnd },
            },
          },
          {
            $group: {
              _id: {
                hour: { $hour: "$createdAt" },
              },
              count: { $sum: 1 },
              revenue: { $sum: "$totalAmount" },
              delivery: {
                $sum: {
                  $cond: [{ $eq: ["$orderType", "delivery"] }, 1, 0],
                },
              },
              takeaway: {
                $sum: {
                  $cond: [{ $eq: ["$orderType", "takeaway"] }, 1, 0],
                },
              },
            },
          },
          { $sort: { "_id.hour": 1 } },
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

  // Active order tracking
  const activeTracking = {};
  for (const s of stats.activeOrderTracking || []) {
    activeTracking[s._id] = {
      count: s.count,
      amount: Math.round(s.totalAmount),
    };
  }

  // Today's orders by time of day (morning: 7-12, afternoon: 12-17, evening: 17-21)
  const timeSlots = { morning: 0, afternoon: 0, evening: 0 };
  const timeRevenue = { morning: 0, afternoon: 0, evening: 0 };
  const timeDelivery = { morning: 0, afternoon: 0, evening: 0 };
  const timeTakeaway = { morning: 0, afternoon: 0, evening: 0 };
  for (const t of stats.todayOrdersByTime || []) {
    const h = t._id.hour;
    const slot =
      h >= 7 && h < 12
        ? "morning"
        : h >= 12 && h < 17
          ? "afternoon"
          : h >= 17 && h < 21
            ? "evening"
            : null;
    if (!slot) continue;
    timeSlots[slot] += t.count;
    timeRevenue[slot] += t.revenue;
    timeDelivery[slot] += t.delivery;
    timeTakeaway[slot] += t.takeaway;
  }

  // Low-stock products
  const lowStockProducts = await Product.find({
    $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] },
    isAvailable: true,
  })
    .select("name stockQuantity lowStockThreshold images unit category")
    .sort({ stockQuantity: 1 })
    .limit(10)
    .lean();

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
      trendingProducts: (stats.trendingProducts || []).map((t) => ({
        productId: t._id,
        name: t.product?.name || "Unknown",
        image: t.product?.images?.[0] || null,
        unit: t.product?.unit || "",
        totalSold: t.totalSold,
        totalRevenue: Math.round(t.totalRevenue),
      })),
      activeOrderTracking: activeTracking,
      todayByTime: Object.keys(timeSlots).map((slot) => ({
        slot,
        orders: timeSlots[slot],
        revenue: Math.round(timeRevenue[slot]),
        delivery: timeDelivery[slot],
        takeaway: timeTakeaway[slot],
      })),
      lowStockProducts: lowStockProducts.map((p) => ({
        _id: p._id,
        name: p.name,
        stock: p.stockQuantity,
        threshold: p.lowStockThreshold,
        image: p.images?.[0] || null,
        unit: p.unit,
        category: p.category,
      })),
    }),
  );
});
