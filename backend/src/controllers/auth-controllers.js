import crypto from "crypto";
import User from "../models/user-models.js";
import catchAsync from "../utils/catchAsync-utils.js";
import AppError from "../utils/appError-utils.js";
import ApiResponse from "../utils/apiResponse-utils.js";
import SendEmail from "../utils/email-utils.js";
import { jwtSignToken } from "../utils/jwtToken-utils.js";
import { uploadProfilePicToImageKit } from "../utils/imagekit-utils.js";

const buildAuthCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  };
};

//REGISTER NEW USER
export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, mobile } = req.body;

  if (!name || !email || !password || !passwordConfirm || !mobile) {
    return next(new AppError("Please enter value for all inputs", 400));
  }

  if (!/^\d{10}$/.test(mobile)) {
    return next(new AppError("Mobile number must be exactly 10 digits", 400));
  }
  if (password !== passwordConfirm) {
    return next(new AppError("password and passwordconfirm don not match!"));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("User already exists", 403));
  }

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    mobile,
    role: "customer",
  });

  // Generate email verification token
  const verificationToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  const token = jwtSignToken({ id: newUser.id, email, role: newUser.role });
  const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  // Send verification email (includes welcome message)
  const emailSender = new SendEmail(newUser, verificationURL);
  await emailSender.sendVerification();

  res.cookie("token", token, buildAuthCookieOptions());

  //hide password from response
  newUser.password = undefined;
  res
    .status(201)
    .json(new ApiResponse(201, "User signup successfully", newUser));
});

//LOGIN USER
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("please provide email or password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const token = jwtSignToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  user.password = undefined;

  res
    .status(200)
    .cookie("token", token, buildAuthCookieOptions())
    .json(new ApiResponse(200, "User signed in successfully!", user));
});

// LOGOUT USER
export const logout = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    })
    .json(new ApiResponse(200, "User logged out successfully!", {}));
});

//GET ME
export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully", { user }));
});

//  CHANGED PASSWORD SECURE
export const changePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  if (!req.user.emailVerified) {
    return next(
      new AppError("Please verify your email before changing password", 403),
    );
  }

  if (newPassword !== confirmNewPassword) {
    return next(new AppError("New passwords do not match", 400));
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(oldPassword, user.password))) {
    return next(new AppError("The password you entered is incorrect", 401));
  }

  user.password = newPassword;
  user.passwordConfirm = confirmNewPassword;

  await user.save();

  user.password = undefined;
  user.passwordConfirm = undefined;

  res.status(200).json(
    new ApiResponse(200, "Password updated successfully!", {
      user,
    }),
  );
});

//FORGET PASSWORD
export const forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });
  const resetURL = `${process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`}/reset-password/${resetToken}`;

  await new SendEmail(user, resetURL).sendPasswordReset();
  res.status(200).json(new ApiResponse(200, "Token sent to email", null));
});

//RESET PASSWORD
export const resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = req.params.resetToken || req.body.token;
  const { password, passwordConfirm } = req.body;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });
  const token = jwtSignToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });
  user.password = undefined;
  res
    .status(200)
    .cookie("token", token, buildAuthCookieOptions())
    .json(new ApiResponse(200, "Password reset successfully", user));
});

//EMAIL VERIFICATION
export const verifyEmail = catchAsync(async (req, res, next) => {
  const verificationToken = req.params.verificationToken || req.body.token;
  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, "Email verified successfully", null));
});

//RESEND VERIFICATION EMAIL
export const resendVerificationEmail = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  if (user.emailVerified) {
    return next(new AppError("Email already verified", 400));
  }
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  const verificationURL = `${process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`}/verify-email/${verificationToken}`;
  await new SendEmail(user, verificationURL).sendVerification();
  res
    .status(200)
    .json(new ApiResponse(200, "Verification email sent successfully", null));
});

// GET ALL USERS (ADMIN ONLY)
export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select(
    "-passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires",
  );
  res
    .status(200)
    .json(new ApiResponse(200, "Users fetched successfully", { users }));
});

// DELETE USER (ADMIN ONLY)
export const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    return next(new AppError("You cannot delete your own account", 400));
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json(new ApiResponse(200, "User deleted successfully", null));
});

// UPDATE PROFILE PIC (ANY AUTHENTICATED USER)
export const updateProfilePic = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please upload an image", 400));
  }

  const imageUrl = await uploadProfilePicToImageKit(req.file);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePic: imageUrl },
    { new: true },
  );

  res.status(200).json(new ApiResponse(200, "Profile picture updated", user));
});

// UPDATE NAME (ANY AUTHENTICATED USER)
export const updateName = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return next(new AppError("Name is required", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name: name.trim() },
    { new: true, runValidators: true },
  );

  res.status(200).json(new ApiResponse(200, "Name updated successfully", user));
});

// UPDATE USER (ADMIN ONLY)
export const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const updates = {};
  if (typeof isActive === "boolean") updates.isActive = isActive;

  if (Object.keys(updates).length === 0) {
    return next(new AppError("No fields to update", 400));
  }

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "User updated successfully", { user }));
});
