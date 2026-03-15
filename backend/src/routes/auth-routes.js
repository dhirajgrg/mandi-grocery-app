import { Router } from "express";
import {
  signup,
  login,
  logout,
  changePassword,
  forgetPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  getAllUsers,
  deleteUser,
  updateProfilePic,
  updateUser,
} from "../controllers/auth-controllers.js";
import { protect, allowRoles } from "../middlewares/auth-middlewares.js";
import { profilePicUpload } from "../middlewares/upload-middlewares.js";
import userValidation from "../validators/user-validation.js";
const router = Router();

router.post("/signup", userValidation, signup);
router.post("/login", login);
router.post("/logout", protect, logout);
router.post("/changePassword", protect, changePassword);
router.post("/forgetPassword", forgetPassword);
router.post("/resetPassword/:resetToken", resetPassword);
router.post("/resetPassword", resetPassword);
router.post("/verifyEmail/:verificationToken", verifyEmail);
router.post("/verifyEmail", verifyEmail);
router.post("/resendVerificationEmail", resendVerificationEmail);

// Admin-only user management
router.get("/users", protect, allowRoles("admin"), getAllUsers);
router.delete("/users/:id", protect, allowRoles("admin"), deleteUser);
router.patch("/users/:id", protect, allowRoles("admin"), updateUser);

// Profile pic upload (any authenticated user)
router.post(
  "/profile-pic",
  protect,
  profilePicUpload.single("profilePic"),
  updateProfilePic,
);

export default router;
