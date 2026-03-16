import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import catchAsync from "../utils/catchAsync-utils.js";
import AppError from "../utils/appError-utils.js";
import ApiResponse from "../utils/apiResponse-utils.js";
import {
  buildEsewaFormData,
  verifyEsewaResponse,
} from "../utils/esewa-utils.js";
import { getIO } from "../socket.js";

// Calculate total applying percentage discount per item
const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
    return total + item.quantity * discountedPrice;
  }, 0);
};

// POST /api/v1/payment/esewa/initiate
export const initiateEsewaPayment = catchAsync(async (req, res, next) => {
  const { lat, lng, address } = req.body;

  if (!address) {
    return next(new AppError("Delivery address is required", 400));
  }

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart || cart.items.length === 0) {
    return next(new AppError("Your cart is empty", 400));
  }

  // Validate products and build order items
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

  const totalAmount = Math.round(calculateTotal(orderItems));

  // Reuse an existing unpaid eSewa order for this user to avoid duplicates
  let order = await Order.findOne({
    userId: req.user._id,
    paymentMethod: "esewa",
    paymentStatus: "unpaid",
    status: "pending",
  });

  if (order) {
    // Update existing unpaid order with fresh cart data
    order.items = orderItems;
    order.totalAmount = totalAmount;
    order.deliveryLocation = { lat: lat || 0, lng: lng || 0, address };
    await order.save();
  } else {
    order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryLocation: { lat: lat || 0, lng: lng || 0, address },
      paymentMethod: "esewa",
      paymentStatus: "unpaid",
      status: "pending",
    });
  }

  // Cart is NOT cleared here — it will be cleared only after eSewa payment is verified.
  // This ensures the cart is preserved if the customer cancels on the payment gateway.

  // Build eSewa form data with UUID
  const { formData, transactionUuid, paymentUrl } =
    buildEsewaFormData(totalAmount);

  order.transactionId = transactionUuid;
  await order.save();

  // Notify admins about new eSewa order
  try {
    getIO().to("admins").emit("new_order", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      customerName: req.user.name,
      createdAt: order.createdAt,
    });
  } catch {
    // socket not critical
  }

  res.status(200).json(
    new ApiResponse(200, "eSewa payment initiated", {
      orderId: order._id,
      esewaFormData: formData,
      esewaPaymentUrl: paymentUrl,
    }),
  );
});

// POST /api/v1/payment/esewa/verify
export const verifyEsewaPayment = catchAsync(async (req, res, next) => {
  const { encodedData } = req.body;

  if (!encodedData) {
    return next(new AppError("Payment data is required", 400));
  }

  let decodedData;
  try {
    decodedData = verifyEsewaResponse(encodedData);
  } catch (err) {
    return next(
      new AppError(err.message || "Payment verification failed", 400),
    );
  }

  const { transaction_uuid, total_amount, transaction_code } = decodedData;

  // Find the order by transaction UUID
  const order = await Order.findOne({ transactionId: transaction_uuid });
  if (!order) {
    return next(new AppError("Order not found for this transaction", 404));
  }

  if (order.paymentStatus === "paid") {
    return res
      .status(200)
      .json(new ApiResponse(200, "Payment already verified", { order }));
  }

  // Verify amount matches
  const paidAmount = parseFloat(String(total_amount).replace(/,/g, ""));
  if (paidAmount !== order.totalAmount) {
    return next(new AppError("Payment amount mismatch", 400));
  }

  // Mark payment as complete
  order.paymentStatus = "paid";
  order.transactionId = transaction_code || transaction_uuid;
  await order.save();
  await order.populate("items.productId");

  // Clear the customer's cart now that payment is confirmed
  const cart = await Cart.findOne({ userId: order.userId });
  if (cart) {
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Payment verified successfully", { order }));
});
