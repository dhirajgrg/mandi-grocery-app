import { Router } from "express";
import {
  sendSignupOtp,
  signup,
  login,
  logout,
  changePassword,
  sendChangePasswordOtp,
  getMe,
  getAllUsers,
  deleteUser,
  updateProfilePic,
  updateName,
  updateUser,
  updateProfile,
  getAdminContact,
  forgotPassword,
  verifyOtp,
  resetPassword,
  sendVerificationOtp,
  verifyMobile,
} from "../controllers/auth-controllers.js";
import { protect, allowRoles } from "../middlewares/auth-middlewares.js";
import { profilePicUpload } from "../middlewares/upload-middlewares.js";
import userValidation from "../validators/user-validation.js";
const router = Router();

router.post("/send-signup-otp", userValidation, sendSignupOtp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protect, logout);
router.post("/send-change-password-otp", protect, sendChangePasswordOtp);
router.post("/changePassword", protect, changePassword);
router.get("/me", protect, getMe);

// OTP / Password reset (public)
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// Phone verification (authenticated)
router.post("/send-verification-otp", protect, sendVerificationOtp);
router.post("/verify-mobile", protect, verifyMobile);

// Public admin contact info
router.get("/admin-contact", getAdminContact);

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

// Update name (any authenticated user)
router.patch("/update-name", protect, updateName);

// Update profile (address, name — any authenticated user)
router.patch("/update-profile", protect, updateProfile);

export default router;
