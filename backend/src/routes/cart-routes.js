import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart-controllers.js";
import { protect } from "../middlewares/auth-middlewares.js";

const router = express.Router();

// All cart routes require a logged-in user
router.use(protect);

router.route("/").get(getCart);
router.route("/add").post(addToCart);
router.route("/update").put(updateCartItem);
router.route("/remove").delete(removeFromCart);
router.route("/clear").delete(clearCart);

export default router;
