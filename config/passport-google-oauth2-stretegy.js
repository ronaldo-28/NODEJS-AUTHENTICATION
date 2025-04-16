// config/passport-google-oauth2-stretegy.js (or similar name)
const passport = require("passport");
require("dotenv").config();
// Use require("passport-google-oauth20").Strategy for newer versions/consistency
// but require("passport-google-oauth").OAuth2Strategy works too
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const crypto = require("crypto");
const User = require("../models/User");

// tell passport to use new strategy for google login
passport.use(
  new GoogleStrategy( // Use GoogleStrategy consistently
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Keep your actual ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Keep your actual Secret
      // **** THIS IS THE KEY CHANGE ****
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // Use port 3000
      passReqToCallback: true, // Keep if needed, often not necessary with async/await
    },
    // Verify function
    async (request, accessToken, refreshToken, profile, done) => {
      // Corrected 'refreseToken' typo
      try {
        // console.log("Google Profile:", profile); // Useful for debugging

        // Find user by Google profile email
        const user = await User.findOne({ email: profile.emails[0].value });

        // If user exists, log them in
        if (user) {
          console.log("Google auth: Existing user found:", user.email);
          return done(null, user); // Pass the existing user
        } else {
          // If user doesn't exist, create a new one
          console.log(
            "Google auth: User not found, creating new user for:",
            profile.emails[0].value
          );
          const newUser = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            // Generate a random password for Google users (they won't use it directly)
            // Hashing will be applied by the pre-save hook in your User model
            password: crypto.randomBytes(20).toString("hex"),
            // You might want to add a field like 'googleId: profile.id'
            // if you want to link accounts or handle users who sign up
            // locally and then use Google later.
          });
          console.log("Google auth: New user created:", newUser.email);
          return done(null, newUser); // Pass the newly created user
        }
      } catch (error) {
        console.error("Error in Google Strategy:", error);
        return done(error, null); // Pass error to Passport
      }
    }
  )
);

// Export passport - Make sure serialize/deserialize are defined elsewhere
// (likely in your passport_local_strategy.js or a central passport config file)
module.exports = passport; // This might be redundant if passport is already configured/exported elsewhere
