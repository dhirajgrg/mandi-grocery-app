import express from "express";
import {
  getAllProducts,
  searchProducts,
  getProductById,
  getProductRecommendations,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product-controllers.js";
import { protect, allowRoles } from "../middlewares/auth-middlewares.js";
import { productImageUpload } from "../middlewares/upload-middlewares.js";

const router = express.Router();

// Public routes
router.route("/").get(getAllProducts);
router.route("/search").get(searchProducts);
router.route("/:id").get(getProductById);
router.route("/:id/recommendations").get(getProductRecommendations);

// Admin only routes for Create/Update/Delete
router.use(protect, allowRoles("admin"));

router.route("/").post(productImageUpload.single("image"), createProduct);
router
  .route("/:id")
  .put(productImageUpload.single("image"), updateProduct)
  .delete(deleteProduct);

export default router;
