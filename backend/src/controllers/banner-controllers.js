import Banner from "../models/Banner.js";
import catchAsync from "../utils/catchAsync-utils.js";
import AppError from "../utils/appError-utils.js";
import ApiResponse from "../utils/apiResponse-utils.js";
import { uploadBannerImageToImageKit } from "../utils/imagekit-utils.js";

// Default banners to seed when collection is empty
const defaultBanners = [
  {
    title: "Fresh Groceries,",
    highlight: "Delivered Fast",
    description:
      "Shop from a wide range of fresh fruits, vegetables, dairy, and everyday essentials at the best prices.",
    ctaText: "Shop Now",
    ctaLink: "/products",
    isActive: true,
    order: 0,
  },
  {
    title: "Deals of the Day,",
    highlight: "Up to 40% Off",
    description:
      "Grab amazing discounts on handpicked fresh produce and pantry staples. Limited time offers!",
    ctaText: "View Deals",
    ctaLink: "/deals",
    isActive: true,
    order: 1,
  },
  {
    title: "Farm Fresh,",
    highlight: "100% Organic",
    description:
      "Sourced directly from local farms. Enjoy the freshest organic fruits and vegetables every day.",
    ctaText: "Explore",
    ctaLink: "/products",
    isActive: true,
    order: 2,
  },
];

// GET /api/v1/banners — public
export const getAllBanners = catchAsync(async (req, res) => {
  let banners = await Banner.find({ isActive: true }).sort("order");
  if (banners.length === 0) {
    banners = await Banner.insertMany(defaultBanners);
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Banners fetched successfully", { banners }));
});

// GET /api/v1/banners/all — admin (includes inactive)
export const getAllBannersAdmin = catchAsync(async (req, res) => {
  let banners = await Banner.find().sort("order");
  if (banners.length === 0) {
    banners = await Banner.insertMany(defaultBanners);
  }
  res
    .status(200)
    .json(new ApiResponse(200, "All banners fetched", { banners }));
});

// POST /api/v1/banners — admin
export const createBanner = catchAsync(async (req, res, next) => {
  let imageUrl = "";
  if (req.file) {
    imageUrl = await uploadBannerImageToImageKit(req.file);
  }

  const banner = await Banner.create({
    image: imageUrl,
    title: req.body.title || "",
    highlight: req.body.highlight || "",
    description: req.body.description || "",
    ctaText: req.body.ctaText || "Shop Now",
    ctaLink: req.body.ctaLink || "/products",
    isActive: req.body.isActive !== "false",
    order: Number(req.body.order) || 0,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Banner created successfully", { banner }));
});

// PUT /api/v1/banners/:id — admin
export const updateBanner = catchAsync(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    return next(new AppError("Banner not found", 404));
  }

  if (req.file) {
    banner.image = await uploadBannerImageToImageKit(req.file);
  }

  const fields = [
    "title",
    "highlight",
    "description",
    "ctaText",
    "ctaLink",
    "order",
  ];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      banner[field] =
        field === "order" ? Number(req.body[field]) : req.body[field];
    }
  }

  if (req.body.isActive !== undefined) {
    banner.isActive =
      req.body.isActive === "true" || req.body.isActive === true;
  }

  await banner.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Banner updated successfully", { banner }));
});

// DELETE /api/v1/banners/:id — admin
export const deleteBanner = catchAsync(async (req, res, next) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) {
    return next(new AppError("Banner not found", 404));
  }

  res.status(200).json(new ApiResponse(200, "Banner deleted successfully"));
});
