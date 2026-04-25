import express from "express";
import {
  getAllCategories,
  createCategory,
  deleteCategory,
} from "../controllers/category-controllers.js";
import { protect, allowRoles } from "../middlewares/auth-middlewares.js";

const router = express.Router();

// Public
router.route("/").get(getAllCategories);

// Admin only
router.use(protect, allowRoles("admin"));
router.route("/").post(createCategory);
router.route("/:id").delete(deleteCategory);

export default router;
