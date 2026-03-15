import Product from "../models/Product.js";
import catchAsync from "../utils/catchAsync-utils.js";
import AppError from "../utils/appError-utils.js";
import ApiResponse from "../utils/apiResponse-utils.js";
import { uploadProductImageToImageKit } from "../utils/imagekit-utils.js";

const parseProductPayload = (body) => {
  const payload = { ...body };

  delete payload.images;

  if (payload.price !== undefined) {
    payload.price = Number(payload.price);
  }

  if (payload.stockQuantity !== undefined) {
    payload.stockQuantity = Number(payload.stockQuantity);
  }

  if (payload.discount === "" || payload.discount === null) {
    payload.discount = 0;
  } else if (payload.discount !== undefined) {
    payload.discount = Number(payload.discount);
  }

  // Parse boolean fields sent as strings from FormData
  for (const key of ["isAvailable", "isOrganic", "isFresh"]) {
    if (payload[key] !== undefined) {
      payload[key] = payload[key] === "true" || payload[key] === true;
    }
  }

  return payload;
};

// GET /api/products
export const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find();

  res
    .status(200)
    .json(new ApiResponse(200, "Products fetched successfully", { products }));
});

// GET /api/products/search
export const searchProducts = catchAsync(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return next(new AppError("Search query is required", 400));
  }

  const products = await Product.find({
    $text: { $search: q },
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Products searched successfully", { products }));
});

// GET /api/products/:id
export const getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Product fetched successfully", { product }));
});

// GET /api/products/:id/recommendations
export const getProductRecommendations = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const recommendations = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  }).limit(6);

  res.status(200).json(
    new ApiResponse(200, "Recommendations fetched successfully", {
      products: recommendations,
    }),
  );
});

// POST /api/products
export const createProduct = catchAsync(async (req, res, next) => {
  const payload = parseProductPayload(req.body);
  const imageUrl = await uploadProductImageToImageKit(req.file);

  payload.images = [imageUrl];

  const newProduct = await Product.create(payload);

  res.status(201).json(
    new ApiResponse(201, "Product created successfully", {
      product: newProduct,
    }),
  );
});

// PUT /api/products/:id
export const updateProduct = catchAsync(async (req, res, next) => {
  const payload = parseProductPayload(req.body);

  if (req.file) {
    const imageUrl = await uploadProductImageToImageKit(req.file);
    payload.images = [imageUrl];
  }

  const product = await Product.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Product updated successfully", { product }));
});

// DELETE /api/products/:id
export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Product deleted successfully", null));
});
