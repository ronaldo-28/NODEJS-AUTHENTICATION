// controllers/userController.js
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// !!! SECURITY WARNING !!!
// DO NOT hardcode credentials. Use environment variables.
// Example using dotenv (install with npm install dotenv):
// require('dotenv').config();
// const emailUser = process.env.EMAIL_USER;
// const emailPass = process.env.EMAIL_PASS;

// Configure Nodemailer (Replace hardcoded values with environment variables)
const transporter = nodemailer.createTransport({
  service: "gmail", // Or your email provider
  auth: {
    // user: emailUser, // Use environment variable
    // pass: emailPass, // Use environment variable
    user: "mafronfernandes28@gmail.com", // <-- INSECURE - Replace with process.env.EMAIL_USER
    pass: "mozn nnox ajgu clit", // <-- INSECURE - Replace with process.env.EMAIL_PASS (Use App Password for Gmail)
  },
});

// --- Core Page Rendering ---

module.exports.homepage = function (req, res) {
  if (req.isAuthenticated()) {
    return res.render("home", {
      title: "Home", // Added title
    });
  }
  // If not authenticated, passport's checkAuthentication middleware
  // should ideally handle the redirect, but this is a fallback.
  req.flash("error", "Please log in to view this page.");
  return res.redirect("/login");
};

module.exports.signupPage = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }
  return res.render("signup", {
    title: "Sign Up", // Added title
  });
};

module.exports.loginPage = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }
  return res.render("login", {
    title: "Login", // Added title
  });
};

// --- Authentication Actions ---

module.exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirm_Password } = req.body;

    if (password !== confirm_Password) {
      req.flash("error", "Passwords do not match. Please try again.");
      return res.redirect("back"); // Redirect back to signup form
    }

    if (password.length < 6) {
      req.flash("error", "Password should be at least 6 characters long.");
      return res.redirect("back");
    }

    const existUser = await User.findOne({ email: email });
    if (existUser) {
      req.flash("error", "An account with that email address already exists.");
      return res.redirect("back");
    }

    // Create user (hashing handled by Mongoose pre-save hook)
    await User.create({
      name: name,
      email: email,
      password: password,
    });

    req.flash("success", "Signup successful! Please login.");
    return res.redirect("/login");
  } catch (error) {
    console.error("Error during signup:", error);
    req.flash("error", "Oops! Something went wrong during signup.");
    return res.redirect("back"); // Redirect back on error
  }
};

// Called by Passport strategy AFTER successful local authentication
module.exports.signin = (req, res) => {
  // The user is already authenticated by Passport at this point (req.user exists)
  console.log(
    `[Controller: signin] Login successful for user: ${req.user.email}`
  );
  // Passport local strategy should set flash message on success/failure
  // You can add one here if Passport doesn't, or override it.
  // req.flash('success', 'Logged in successfully!'); // Example
  return res.redirect("/home");
};

// Called after successful Google authentication
// Often the same logic as local signin redirect
module.exports.googleCallbackSignin = (req, res) => {
  console.log(
    `[Controller: googleCallbackSignin] Google login successful for user: ${req.user.email}`
  );
  req.flash("success", "Logged in successfully with Google!");
  return res.redirect("/home");
};

module.exports.destroy = function (req, res, next) {
  // req.logout requires a callback function
  req.logout(function (error) {
    if (error) {
      console.error("Error during logout:", error);
      req.flash("error", "Error logging out.");
      // Decide how to handle logout error, maybe redirect home anyway?
      // Or pass the error to the next middleware if you have an error handler
      return next(error);
    }
    req.flash("success", "You have logged out successfully.");
    res.redirect("/login"); // Redirect to login after successful logout
  });
};

// --- Change Password (for logged-in users) ---

// Renders the change password form (e.g., /change-password GET)
module.exports.renderChangePasswordForm = (req, res) => {
  // Assumes passport.checkAuthentication middleware ran in the route
  res.render("change_password", {
    // Ensure you have 'change_password.ejs'
    title: "Change Password",
  });
};

// Handles the submission of the change password form (e.g., /change-password POST)
module.exports.handleChangePassword = async (req, res) => {
  // Assumes passport.checkAuthentication middleware ran in the route
  // No need to check req.isAuthenticated() again here if middleware is used

  try {
    const { oldpassword, newpassword, confirm_newpassword } = req.body;
    const userId = req.user.id; // Get user ID from the authenticated session

    // Basic validations
    if (!oldpassword || !newpassword || !confirm_newpassword) {
      req.flash("error", "Please fill in all password fields.");
      return res.redirect("back");
    }

    if (newpassword !== confirm_newpassword) {
      req.flash("error", "New passwords do not match.");
      return res.redirect("back");
    }

    if (newpassword.length < 6) {
      req.flash("error", "New password must be at least 6 characters long.");
      return res.redirect("back");
    }

    // Find the currently logged-in user
    const user = await User.findById(userId);

    // This check is technically redundant if checkAuthentication middleware works,
    // but good for robustness.
    if (!user) {
      req.flash("error", "User not found. Please log in again.");
      req.logout((err) => {
        if (err) console.error("Logout error:", err);
      });
      return res.redirect("/login");
    }

    // Compare the provided old password with the stored hash
    const isMatch = await user.comparePassword(oldpassword);

    if (!isMatch) {
      req.flash("error", "Incorrect current password.");
      console.log(
        "Change Password Failed: Incorrect current password for user:",
        user.email
      );
      return res.redirect("back");
    }

    // If old password matches, update to the new password
    user.password = newpassword; // Assign plain new password
    await user.save(); // The pre-save hook will hash the new password

    console.log("Password updated successfully for user:", user.email);
    req.flash("success", "Password updated successfully!");
    res.redirect("/home"); // Redirect after successful change
  } catch (error) {
    console.error("Error during password change:", error);
    req.flash("error", "Oops! Something went wrong while changing password.");
    return res.redirect("back");
  }
};

// --- Forgot/Reset Password (for logged-out users) ---

// Render the form to request a password reset (e.g., /forgot-password GET)
module.exports.renderForgotPasswordForm = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/home"); // Don't show if logged in
  }
  return res.render("forgot_password", {
    title: "Forgot Password",
  });
};

// Handle the submission of the forgot password form (e.g., /forgot-password POST)
module.exports.handleForgotPasswordRequest = async (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }
  try {
    const user = await User.findOne({ email: req.body.email });

    // Security: Always show the same success message regardless of whether the user exists
    // This prevents attackers from guessing valid email addresses.
    req.flash(
      "success",
      "If an account with that email exists, a password reset link has been sent."
    );

    if (!user) {
      console.log(
        "Forgot Password Request: User not found for email:",
        req.body.email
      );
      return res.redirect("/forgot-password");
    }

    // Generate token and expiry (using the method from User model)
    user.generatePasswordResetToken();
    // Save token and expiry, skip other validations (like password required) for this save.
    await user.save({ validateBeforeSave: false });

    // Create Reset URL
    const resetURL = `${req.protocol}://${req.get("host")}/reset-password/${
      user.resetPasswordToken
    }`;

    // Send Email
    const mailOptions = {
      to: user.email,
      // CHANGE THIS 'from' address and App Name
      from: '"Your App Name" <your_app_noreply@example.com>',
      subject: "Password Reset Request",
      text:
        `You are receiving this email because you (or someone else) requested a password reset for your account.\n\n` +
        `Please click on the following link, or paste it into your browser to complete the process:\n\n` +
        `${resetURL}\n\n` +
        `This link will expire in one hour.\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      // html: `<p>You requested a password reset...</p><a href="${resetURL}">Reset Password</a>...` // Consider an HTML version too
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Password reset email sent successfully to:", user.email);
    } catch (mailError) {
      console.error("Error sending password reset email:", mailError);
      // Update flash message to indicate email sending failure
      req.flash("error", "Could not send reset email. Please try again later.");
      // We still redirect 'successfully' from the perspective of the request handler
      // because we don't want to reveal the email error details directly to the user.
      return res.redirect("/forgot-password");
    }

    // Redirect back to the form page with the success message
    res.redirect("/forgot-password");
  } catch (error) {
    console.error("Error handling forgot password request:", error);
    req.flash(
      "error",
      "An error occurred processing your request. Please try again."
    );
    res.redirect("/forgot-password");
  }
};

// Render the form to set a new password using token (e.g., /reset-password/:token GET)
module.exports.renderResetPasswordForm = async (req, res) => {
  if (req.isAuthenticated()) {
    // Logged-in users shouldn't typically use the token reset form
    req.flash(
      "info",
      "You are already logged in. Use 'Change Password' if needed."
    );
    return res.redirect("/home");
  }
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token is valid and not expired
    });

    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/forgot-password"); // Redirect to request a new token
    }

    // Token is valid, render the reset form
    res.render("reset_password_form", {
      title: "Reset Password",
      token: req.params.token, // Pass token to the view's form action
    });
  } catch (error) {
    console.error("Error rendering reset password form:", error);
    req.flash("error", "An error occurred. Please try again.");
    res.redirect("/forgot-password");
  }
};

// Handle the submission of the new password via token (e.g., /reset-password/:token POST)
module.exports.handleResetPassword = async (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/home"); // Shouldn't happen if checks are in place
  }
  try {
    // Find user by token again, ensure it's still valid *at the time of submission*
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/forgot-password");
    }

    const { password, confirm_password } = req.body;

    // Basic validations
    if (!password || !confirm_password) {
      req.flash("error", "Please enter and confirm your new password.");
      return res.redirect("back"); // Redirect back to the token form
    }
    if (password !== confirm_password) {
      req.flash("error", "New passwords do not match.");
      return res.redirect("back");
    }
    if (password.length < 6) {
      req.flash("error", "New password must be at least 6 characters long.");
      return res.redirect("back");
    }

    // Set the new password (pre-save hook will hash it)
    user.password = password;
    // IMPORTANT: Clear the reset token fields so it can't be reused
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save(); // Save the user with the new password and cleared token

    // Optional: Log the user in automatically after successful reset using req.login
    // req.login(user, (err) => {
    //   if (err) {
    //      console.error("Error auto-logging in after password reset:", err);
    //      req.flash("error", "Could not log you in automatically. Please log in manually.");
    //      return res.redirect('/login');
    //    }
    //    console.log("User auto-logged in after password reset:", user.email);
    //    req.flash("success", "Password reset successful! You are now logged in.");
    //    return res.redirect("/home");
    // });

    // If not auto-logging in:
    console.log(
      "Password has been reset successfully via token for:",
      user.email
    );
    req.flash(
      "success",
      "Your password has been reset successfully. Please log in."
    );
    res.redirect("/login");
  } catch (error) {
    console.error("Error handling password reset via token:", error);
    req.flash("error", "An error occurred while resetting the password.");
    // Redirect back to the specific token reset page on error
    // It might be better to redirect to /forgot-password if the token might now be invalid
    res.redirect(`/reset-password/${req.params.token}`); // Or res.redirect('/forgot-password');
  }
};

// --- Deprecated Reset Functions (Commented Out) ---
/*
// rendering reset page (This seems redundant if using Change/Forgot Password flows)
module.exports.resetPage = function (req, res) {
  console.warn("Accessing deprecated /resetPage route");
  if (req.isAuthenticated()) {
     // Redirect to the new change password form
     return res.redirect('/change-password');
  }
  // If not authenticated, they should use forgot password
  req.flash("error", "Please log in to change your password or use 'Forgot Password'.");
  return res.redirect("/login");
};

// password reset functionality (This seems redundant if using handleChangePassword)
module.exports.reset = async (req, res) => {
   console.warn("Accessing deprecated /reset POST route");
   // Redirect or delegate to the new handleChangePassword logic if possible
   // Or simply remove this route and function entirely.
   req.flash("error", "This function is deprecated.");
   return res.redirect('/login');
};
*/
