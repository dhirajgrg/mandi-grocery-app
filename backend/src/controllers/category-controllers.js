import Category from "../models/Category.js";
import catchAsync from "../utils/catchAsync-utils.js";
import AppError from "../utils/appError-utils.js";
import ApiResponse from "../utils/apiResponse-utils.js";

// GET /api/v1/categories
export const getAllCategories = catchAsync(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res
    .status(200)
    .json(
      new ApiResponse(200, "Categories fetched successfully", { categories }),
    );
});

// POST /api/v1/categories
export const createCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return next(new AppError("Category name is required", 400));
  }

  const existing = await Category.findOne({
    name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
  });
  if (existing) {
    return next(new AppError("Category already exists", 409));
  }

  const category = await Category.create({ name: name.trim() });
  res
    .status(201)
    .json(new ApiResponse(201, "Category created successfully", { category }));
});

// DELETE /api/v1/categories/:id
export const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Category deleted successfully", null));
});
