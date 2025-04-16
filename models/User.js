// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto"); // Import crypto

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    // Add fields for password reset
    resetPasswordToken: {
      type: String,
      required: false, // Only required when reset is initiated
    },
    resetPasswordExpires: {
      type: Date,
      required: false, // Only required when reset is initiated
    },
  },
  { timestamps: true }
);

// --- Hashing Middleware --- (Keep this as is)
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// --- Password Comparison Method --- (Keep this as is)
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// --- Method to generate reset token ---
UserSchema.methods.generatePasswordResetToken = function () {
  this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  // Set expiry time (e.g., 1 hour from now)
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour in milliseconds
};

const User = mongoose.model("user", UserSchema);
module.exports = User;
