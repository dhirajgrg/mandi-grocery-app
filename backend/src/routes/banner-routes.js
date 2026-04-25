import express from "express";
import {
  getAllBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/banner-controllers.js";
import { protect, allowRoles } from "../middlewares/auth-middlewares.js";
import { bannerImageUpload } from "../middlewares/upload-middlewares.js";

const router = express.Router();

// Public
router.get("/", getAllBanners);

// Admin only
router.use(protect, allowRoles("admin"));
router.get("/all", getAllBannersAdmin);
router.post("/", bannerImageUpload.single("image"), createBanner);
router
  .route("/:id")
  .put(bannerImageUpload.single("image"), updateBanner)
  .delete(deleteBanner);

export default router;
