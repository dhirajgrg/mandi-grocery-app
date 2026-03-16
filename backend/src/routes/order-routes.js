import { Router } from "express";
import { protect, allowRoles } from "../middlewares/auth-middlewares.js";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  deleteOrder,
  getAllOrders,
  updateOrderStatus,
  getAdminStats,
} from "../controllers/order-controllers.js";

const router = Router();

router.use(protect);

// Admin routes (must be before /:id to avoid conflicts)
router.get("/admin/stats", allowRoles("admin"), getAdminStats);
router.get("/admin/all", allowRoles("admin"), getAllOrders);
router.patch("/admin/:id/status", allowRoles("admin"), updateOrderStatus);

// Customer routes
router.post("/", allowRoles("customer"), placeOrder);
router.get("/", allowRoles("customer"), getMyOrders);
router.patch("/:id/cancel", allowRoles("customer"), cancelOrder);
router.delete("/:id", allowRoles("customer"), deleteOrder);
router.get("/:id", getOrderById);

export default router;
