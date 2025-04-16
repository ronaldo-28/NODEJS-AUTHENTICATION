const express = require("express");
const passport = require("passport");
const router = express.Router();

// import the controllers actions
const user_Controller = require("../controllers/userController"); // Ensure this path is correct

// === CORE PAGES ===
// rendering the home page
// Added passport.checkAuthentication to protect the route
router.get("/home", passport.checkAuthentication, user_Controller.homepage);

// rendering the signup page (root route)
router.get("/", user_Controller.signupPage);

// rendering login page
router.get("/login", user_Controller.loginPage);

// === AUTHENTICATION ACTIONS ===
// Local signup
router.post("/signup", user_Controller.signup);

// Local signin
router.post(
  "/signin",
  // Optional: Middleware to log request body
  // (req, res, next) => {
  //   console.log("POST /signin received. Body:", req.body);
  //   next();
  // },
  passport.authenticate("local", {
    // successRedirect: '/home', // We handle success in the controller action
    failureRedirect: "/login", // Redirect back to login on failure
    failureFlash: true, // Enable flash messages for failures
  }),
  user_Controller.signin // Controller action called only on successful authentication
);

// Log out route
router.get("/logout", user_Controller.destroy);

// === GOOGLE OAUTH ROUTES ===
// Initiates Google authentication
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], // Request access to profile and email
  })
);

// Google callback route (handles the redirect from Google)
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login", // Redirect to login on failure
    failureFlash: true, // Optional: Flash message on Google auth failure
  }),
  user_Controller.googleCallbackSignin // Use dedicated callback controller action
);

// === PASSWORD MANAGEMENT ===

// --- Change Password (for logged-in users) ---
router.get(
  "/change-password",
  passport.checkAuthentication, // Ensure user is logged in
  user_Controller.renderChangePasswordForm // Controller to render the form
);
router.post(
  "/change-password",
  passport.checkAuthentication, // Ensure user is logged in
  user_Controller.handleChangePassword // Controller to handle form submission
);

// --- Forgot Password (for logged-out users) ---
router.get("/forgot-password", user_Controller.renderForgotPasswordForm);
router.post("/forgot-password", user_Controller.handleForgotPasswordRequest);

// --- Reset Password via Token ---
router.get("/reset-password/:token", user_Controller.renderResetPasswordForm);
router.post("/reset-password/:token", user_Controller.handleResetPassword);

// === REMOVED/DEPRECATED ROUTES ===
// router.get("/reset", ...)  <-- DELETED
// router.post("/reset", ...) <-- DELETED
// router.get("/some-path", ...) <-- DELETED

module.exports = router;
