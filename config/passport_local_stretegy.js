// config/passport_local_stretegy.js
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy; // Corrected casing
const User = require("../models/User");
// const bcrypt = require('bcrypt'); // Not directly needed here anymore

// authentication using passport
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true, // Allows us to use req.flash inside the callback
    },
    async function (req, email, password, done) {
      console.log(`[Passport Strategy] Attempting login for: ${email}`); // Log attempt
      try {
        let user = await User.findOne({ email: email });

        if (!user) {
          console.log(`[Passport Strategy] User not found: ${email}`); // Log failure reason
          req.flash("error", "Incorrect email or password.");
          return done(null, false); // Signal failure
        }
        console.log(`[Passport Strategy] User found: ${user.email}`); // Log user found

        const isMatch = await user.comparePassword(password);
        console.log(
          `[Passport Strategy] Password match result for ${email}: ${isMatch}`
        ); // Log comparison result

        if (!isMatch) {
          console.log(`[Passport Strategy] Password mismatch for: ${email}`); // Log failure reason
          req.flash("error", "Incorrect email or password.");
          return done(null, false); // Signal failure
        }

        console.log(
          `[Passport Strategy] Authentication successful for: ${email}`
        ); // Log success
        // req.flash("success", "Logged in successfully!"); // Optional: Set success flash
        return done(null, user); // Signal success
      } catch (error) {
        console.error("[Passport Strategy] Error:", error); // Log any caught errors
        req.flash("error", "An error occurred during login.");
        return done(error); // Signal error
      }
    }
  )
);

// serializing the user to decide which key is to be kept in cookie
passport.serializeUser(function (user, done) {
  done(null, user.id); // Store only the user ID in the session
});

// deserializing the user from the key in the cookies
passport.deserializeUser(async function (id, done) {
  try {
    let user = await User.findById(id);
    if (!user) {
      console.log("User not found during deserialize:", id);
      return done(null, false); // User associated with session ID not found
    }
    // console.log("User deserialized:", user.email); // Optional logging
    return done(null, user); // User found, pass user object to req.user
  } catch (error) {
    console.error("Error during deserializeUser:", error);
    return done(error); // Signal error
  }
});

// check user authenticated middleware
passport.checkAuthentication = function (req, res, next) {
  // if user is authenticated then pass request to the next function(controllers action)
  if (req.isAuthenticated()) {
    // console.log("User is authenticated (checkAuthentication)"); // Can be noisy
    return next();
  }
  // if user is not authenticated
  console.log("User not authenticated, redirecting to login");
  req.flash("error", "Please log in to view this page."); // Inform user why they are redirected
  return res.redirect("/login"); // Redirect to login page
};

// set authenticated user for views middleware
passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    // req.user contains the current signed-in user from the session cookie
    // send this to the locals for the views
    res.locals.user = req.user;
    // console.log("Authenticated user set for views:", req.user.email); // Optional logging
  } else {
    // console.log("No authenticated user to set for views"); // Optional logging
  }
  next();
};

module.exports = passport;
