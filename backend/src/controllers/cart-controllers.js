import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import catchAsync from "../utils/catchAsync-utils.js";
import AppError from "../utils/appError-utils.js";
import ApiResponse from "../utils/apiResponse-utils.js";

// Calculate total applying percentage discount per item
const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
    return total + item.quantity * discountedPrice;
  }, 0);
};

// Helper: get or create cart for a user
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [], totalAmount: 0 });
  }
  return cart;
};

// GET /api/v1/cart
export const getCart = catchAsync(async (req, res, next) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate("items.productId");

  res
    .status(200)
    .json(new ApiResponse(200, "Cart fetched successfully", { cart }));
});

// POST /api/v1/cart/add
export const addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const normalizedQuantity = Number(quantity);

  if (
    !productId ||
    Number.isNaN(normalizedQuantity) ||
    normalizedQuantity <= 0
  ) {
    return next(
      new AppError("Please provide valid productId and quantity", 400),
    );
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (!product.isAvailable) {
    return next(new AppError("Product is currently unavailable", 400));
  }

  const cart = await getOrCreateCart(req.user._id);

  const itemIndex = cart.items.findIndex(
    (p) => p.productId.toString() === productId,
  );

  if (itemIndex > -1) {
    // Item already in cart — update quantity and refresh price/discount
    cart.items[itemIndex].quantity += normalizedQuantity;
    cart.items[itemIndex].price = product.price;
    cart.items[itemIndex].discount = product.discount || 0;
  } else {
    // New item — push to cart
    cart.items.push({
      productId,
      quantity: normalizedQuantity,
      price: product.price,
      discount: product.discount || 0,
    });
  }

  cart.totalAmount = calculateTotal(cart.items);
  await cart.save();
  await cart.populate("items.productId");

  res
    .status(200)
    .json(new ApiResponse(200, "Item added to cart successfully", { cart }));
});

// PUT /api/v1/cart/update
export const updateCartItem = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const normalizedQuantity = Number(quantity);

  if (!productId || Number.isNaN(normalizedQuantity)) {
    return next(
      new AppError("Please provide productId and quantity to update", 400),
    );
  }

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const itemIndex = cart.items.findIndex(
    (p) => p.productId.toString() === productId,
  );

  if (itemIndex === -1) {
    return next(new AppError("Item not found in cart", 404));
  }

  if (normalizedQuantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = normalizedQuantity;
  }

  cart.totalAmount = calculateTotal(cart.items);
  await cart.save();
  await cart.populate("items.productId");

  res
    .status(200)
    .json(new ApiResponse(200, "Cart updated successfully", { cart }));
});

// DELETE /api/v1/cart/remove
export const removeFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return next(new AppError("Please provide productId to remove", 400));
  }

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId,
  );
  cart.totalAmount = calculateTotal(cart.items);

  await cart.save();
  await cart.populate("items.productId");

  res
    .status(200)
    .json(
      new ApiResponse(200, "Item removed from cart successfully", { cart }),
    );
});

// DELETE /api/v1/cart/clear
export const clearCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Cart cleared successfully", { cart }));
});
