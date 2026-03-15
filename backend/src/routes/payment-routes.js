import { Router } from "express";
import { protect, allowRoles } from "../middlewares/auth-middlewares.js";
import {
  initiateEsewaPayment,
  verifyEsewaPayment,
} from "../controllers/payment-controllers.js";

const router = Router();

router.post(
  "/esewa/initiate",
  protect,
  allowRoles("customer"),
  initiateEsewaPayment,
);
router.post("/esewa/verify", protect, verifyEsewaPayment);

export default router;
