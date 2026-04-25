import { Router } from "express";
import { protect, allowRoles } from "../middlewares/auth-middlewares.js";
import {
  getShopStatus,
  toggleShopStatus,
} from "../controllers/settings-controllers.js";

const router = Router();

router.get("/shop-status", getShopStatus);
router.patch("/shop-status", protect, allowRoles("admin"), toggleShopStatus);

export default router;
