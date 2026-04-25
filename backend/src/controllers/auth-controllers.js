import User from "../models/user-models.js";
import catchAsync from "../utils/catchAsync-utils.js";
import AppError from "../utils/appError-utils.js";
import ApiResponse from "../utils/apiResponse-utils.js";
import { jwtSignToken } from "../utils/jwtToken-utils.js";
import { uploadProfilePicToImageKit } from "../utils/imagekit-utils.js";
import { generateOTP, sendOTP, sendWelcomeSMS } from "../utils/sms-utils.js";

// Temporary in-memory store for pending signups (before OTP verification)
// In production, use Redis or a DB collection with TTL
const pendingSignups = new Map();

// In-memory OTP rate limiter: key → { count, blockedUntil }
// Max 5 OTP requests per key, then 15-minute cooldown
const otpRateLimiter = new Map();
const OTP_MAX_REQUESTS = 5;
const OTP_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

function checkOtpRateLimit(key) {
  const now = Date.now();
  const entry = otpRateLimiter.get(key);

  if (entry) {
    if (entry.blockedUntil && now < entry.blockedUntil) {
      const waitMinutes = Math.ceil((entry.blockedUntil - now) / 60000);
      return { allowed: false, waitMinutes };
    }
    if (entry.blockedUntil && now >= entry.blockedUntil) {
      otpRateLimiter.delete(key);
    } else {
      entry.count += 1;
      if (entry.count > OTP_MAX_REQUESTS) {
        entry.blockedUntil = now + OTP_COOLDOWN_MS;
        return { allowed: false, waitMinutes: 15 };
      }
      return { allowed: true, remaining: OTP_MAX_REQUESTS - entry.count };
    }
  }

  otpRateLimiter.set(key, { count: 1, blockedUntil: null });
  return { allowed: true, remaining: OTP_MAX_REQUESTS - 1 };
}

// Auto-cleanup expired entries every 10 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [mobile, data] of pendingSignups) {
      if (now > data.otpExpires) pendingSignups.delete(mobile);
    }
    for (const [key, data] of otpRateLimiter) {
      if (data.blockedUntil && now > data.blockedUntil + OTP_COOLDOWN_MS) {
        otpRateLimiter.delete(key);
      }
    }
  },
  10 * 60 * 1000,
);

const buildAuthCookieOptions = (rememberMe = false) => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  };
};

// STEP 1: SEND SIGNUP OTP (validates data, sends OTP, stores pending signup)
export const sendSignupOtp = catchAsync(async (req, res, next) => {
  const { name, mobile, password, passwordConfirm } = req.body;

  if (!name || !mobile || !password || !passwordConfirm) {
    return next(new AppError("Please enter value for all inputs", 400));
  }

  if (!/^\d{10}$/.test(mobile)) {
    return next(new AppError("Mobile number must be exactly 10 digits", 400));
  }
  if (password !== passwordConfirm) {
    return next(
      new AppError("Password and confirm password do not match!", 400),
    );
  }

  const existingUser = await User.findOne({ mobile });
  if (existingUser) {
    return next(
      new AppError("User with this mobile number already exists", 403),
    );
  }

  // Rate limit check
  const rateKey = `signup:${mobile}`;
  const rateCheck = checkOtpRateLimit(rateKey);
  if (!rateCheck.allowed) {
    return next(
      new AppError(
        `Too many OTP requests. Please wait ${rateCheck.waitMinutes} minutes before trying again.`,
        429,
      ),
    );
  }

  const otp = generateOTP();

  // Store pending signup data in memory
  pendingSignups.set(mobile, {
    name,
    mobile,
    password,
    passwordConfirm,
    otp,
    otpExpires: Date.now() + OTP_EXPIRY_MS,
  });

  await sendOTP(mobile, otp);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "OTP sent to your mobile number. Please verify to complete registration.",
        { remainingResends: rateCheck.remaining },
      ),
    );
});

// STEP 2: VERIFY OTP & CREATE USER
export const signup = catchAsync(async (req, res, next) => {
  const { mobile, otp, rememberMe } = req.body;

  if (!mobile || !otp) {
    return next(new AppError("Mobile number and OTP are required", 400));
  }

  const pending = pendingSignups.get(mobile);

  if (!pending) {
    return next(
      new AppError(
        "No pending registration found. Please start signup again.",
        400,
      ),
    );
  }

  if (pending.otp !== otp || Date.now() > pending.otpExpires) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

  // Double-check no user was created in the meantime
  const existingUser = await User.findOne({ mobile });
  if (existingUser) {
    pendingSignups.delete(mobile);
    return next(
      new AppError("User with this mobile number already exists", 403),
    );
  }

  const newUser = await User.create({
    name: pending.name,
    mobile: pending.mobile,
    password: pending.password,
    passwordConfirm: pending.passwordConfirm,
    role: "customer",
    mobileVerified: true,
  });

  // Cleanup pending signup
  pendingSignups.delete(mobile);

  // Send welcome SMS
  await sendWelcomeSMS(mobile, pending.name);

  const token = jwtSignToken({ id: newUser.id, mobile, role: newUser.role });

  res.cookie("token", token, buildAuthCookieOptions(!!rememberMe));

  //hide password from response
  newUser.password = undefined;
  res
    .status(201)
    .json(new ApiResponse(201, "Account created successfully!", newUser));
});

//LOGIN USER
export const login = catchAsync(async (req, res, next) => {
  const { mobile, password, rememberMe } = req.body;

  if (!mobile || !password) {
    return next(new AppError("Please provide mobile number and password", 400));
  }

  const user = await User.findOne({ mobile }).select("+password");

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError("Incorrect mobile number or password", 401));
  }

  const token = jwtSignToken({
    id: user._id,
    mobile: user.mobile,
    role: user.role,
  });

  user.password = undefined;

  res
    .status(200)
    .cookie("token", token, buildAuthCookieOptions(!!rememberMe))
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

// SEND OTP FOR PASSWORD CHANGE (authenticated)
export const sendChangePasswordOtp = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  // Rate limit check
  const rateKey = `changepw:${user._id}`;
  const rateCheck = checkOtpRateLimit(rateKey);
  if (!rateCheck.allowed) {
    return next(
      new AppError(
        `Too many OTP requests. Please wait ${rateCheck.waitMinutes} minutes before trying again.`,
        429,
      ),
    );
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = Date.now() + OTP_EXPIRY_MS;
  await user.save({ validateBeforeSave: false });

  await sendOTP(user.mobile, otp);

  res.status(200).json(
    new ApiResponse(200, "OTP sent to your mobile number", {
      remainingResends: rateCheck.remaining,
    }),
  );
});

// CHANGE PASSWORD WITH OTP VERIFICATION
export const changePassword = catchAsync(async (req, res, next) => {
  const { otp, newPassword, confirmNewPassword } = req.body;

  if (!otp || !newPassword || !confirmNewPassword) {
    return next(
      new AppError("OTP, new password and confirm password are required", 400),
    );
  }

  if (newPassword !== confirmNewPassword) {
    return next(new AppError("New passwords do not match", 400));
  }

  const user = await User.findOne({
    _id: req.user._id,
    otp,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

  user.password = newPassword;
  user.passwordConfirm = confirmNewPassword;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  user.password = undefined;
  user.passwordConfirm = undefined;

  res.status(200).json(
    new ApiResponse(200, "Password updated successfully!", {
      user,
    }),
  );
});

// GET ALL USERS (ADMIN ONLY)
export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select(
    "-passwordResetToken -passwordResetExpires",
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
  const { isActive, name, role } = req.body;

  const updates = {};
  if (typeof isActive === "boolean") updates.isActive = isActive;
  if (name && name.trim()) updates.name = name.trim();
  if (role && ["admin", "customer"].includes(role)) updates.role = role;

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

// UPDATE OWN PROFILE (ANY AUTHENTICATED USER)
export const updateProfile = catchAsync(async (req, res, next) => {
  const { address, name } = req.body;

  const updates = {};
  if (name && name.trim()) updates.name = name.trim();
  if (typeof address === "string") updates.address = address.trim();

  if (Object.keys(updates).length === 0) {
    return next(new AppError("No fields to update", 400));
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Profile updated successfully", user));
});

// GET ADMIN CONTACT INFO (PUBLIC)
export const getAdminContact = catchAsync(async (req, res) => {
  const admin = await User.findOne({ role: "admin" }).select(
    "name mobile profilePic",
  );
  res
    .status(200)
    .json(
      new ApiResponse(200, "Admin contact fetched", { contact: admin || {} }),
    );
});

// FORGOT PASSWORD - SEND OTP
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { mobile } = req.body;

  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return next(
      new AppError("Please provide a valid 10-digit mobile number", 400),
    );
  }

  const user = await User.findOne({ mobile });
  if (!user) {
    return next(new AppError("No account found with this mobile number", 404));
  }

  // Rate limit check
  const rateKey = `forgot:${mobile}`;
  const rateCheck = checkOtpRateLimit(rateKey);
  if (!rateCheck.allowed) {
    return next(
      new AppError(
        `Too many OTP requests. Please wait ${rateCheck.waitMinutes} minutes before trying again.`,
        429,
      ),
    );
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = Date.now() + OTP_EXPIRY_MS;
  await user.save({ validateBeforeSave: false });

  await sendOTP(mobile, otp);

  res.status(200).json(
    new ApiResponse(200, "OTP sent to your mobile number", {
      remainingResends: rateCheck.remaining,
    }),
  );
});

// VERIFY OTP (for forgot password)
export const verifyOtp = catchAsync(async (req, res, next) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return next(new AppError("Mobile number and OTP are required", 400));
  }

  const user = await User.findOne({
    mobile,
    otp,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

  res.status(200).json(new ApiResponse(200, "OTP verified successfully", {}));
});

// RESET PASSWORD WITH OTP
export const resetPassword = catchAsync(async (req, res, next) => {
  const { mobile, otp, password, passwordConfirm } = req.body;

  if (!mobile || !otp || !password || !passwordConfirm) {
    return next(new AppError("All fields are required", 400));
  }

  if (password !== passwordConfirm) {
    return next(new AppError("Passwords do not match", 400));
  }

  const user = await User.findOne({
    mobile,
    otp,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.status(200).json(new ApiResponse(200, "Password reset successfully", {}));
});

// SEND VERIFICATION OTP (for phone verification after signup)
export const sendVerificationOtp = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.mobileVerified) {
    return next(new AppError("Mobile number already verified", 400));
  }

  // Rate limit check
  const rateKey = `verify:${user._id}`;
  const rateCheck = checkOtpRateLimit(rateKey);
  if (!rateCheck.allowed) {
    return next(
      new AppError(
        `Too many OTP requests. Please wait ${rateCheck.waitMinutes} minutes before trying again.`,
        429,
      ),
    );
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = Date.now() + OTP_EXPIRY_MS;
  await user.save({ validateBeforeSave: false });

  await sendOTP(user.mobile, otp);

  res.status(200).json(
    new ApiResponse(200, "Verification OTP sent", {
      remainingResends: rateCheck.remaining,
    }),
  );
});

// VERIFY MOBILE NUMBER
export const verifyMobile = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return next(new AppError("OTP is required", 400));
  }

  const user = await User.findOne({
    _id: req.user._id,
    otp,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

  user.mobileVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(
      new ApiResponse(200, "Mobile number verified successfully", { user }),
    );
});
