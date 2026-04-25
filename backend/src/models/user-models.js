import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "User must have a name"],
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    password: {
      type: String,
      required: [true, "User must have a password"],
      minlength: 4,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on CREATE and SAVE
        validator: function (value) {
          return value === this.password;
        },
        message: "Passwords are not the same",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: "Mobile number must be exactly 10 digits",
      },
    },
    profilePic: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    mobileVerified: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otpExpires: Date,
  },
  {
    timestamps: true,
  },
);

// 1. HASH PASSWORD
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm field so it's not saved to DB
  this.passwordConfirm = undefined;
});

// 2. UPDATE PASSWORD CHANGE TIMESTAMP
userSchema.pre("save", function () {
  if (!this.isModified("password") || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;
});

// 3. INSTANCE METHOD: COMPARE PASSWORD
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// 4. INSTANCE METHOD: GENERATE PASSWORD RESET TOKEN
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// 5. INSTANCE METHOD: CHECK IF PASSWORD CHANGED AFTER TOKEN ISSUED
userSchema.methods.changePasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return jwtTimeStamp < passwordChangedTime;
  }
  return false;
};

const User = model("user", userSchema);
export default User;
