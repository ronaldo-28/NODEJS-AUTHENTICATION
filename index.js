const express = require("express");
const expresslayouts = require("express-ejs-layouts");
const path = require("path"); // Good practice for joining paths
const db = require("./config/mongoose"); // Ensure mongoose connects

// --- Initialize App FIRST ---
const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable for port if available

// --- Core Middleware ---
// Serve static files (CSS, JS, images) from the 'assets' directory
app.use(express.static(path.join(__dirname, "assets")));
// Parse URL-encoded bodies (HTML form submissions)
app.use(express.urlencoded({ extended: false })); // Only need this ONCE
// Parse JSON bodies (if you build APIs) - Optional
// app.use(express.json());

// --- EJS and Layouts Setup ---
app.use(expresslayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// Optional: Extract styles/scripts defined in views into the layout
app.set("layout extractStyles", true);
app.set("layout extractScript", true);

// --- Authentication & Session Middleware ---
const passport = require("passport");
// Corrected typos in require paths/variables if necessary
const localStrategy = require("./config/passport_local_stretegy"); // Check filename
const googleStrategy = require("./config/passport-google-oauth2-stretegy"); // Check filename

const session = require("express-session");
const flash = require("connect-flash");
const customMiddleware = require("./config/middleware");
// Optional: MongoStore for persistent sessions in production
// const MongoStore = require('connect-mongo');

// Session Middleware (BEFORE Passport Session)
app.use(
  session({
    name: "user_auth_session", // Choose a descriptive name
    // === SECURITY: Change secret and use environment variables ===
    secret: process.env.SESSION_SECRET || "a_default_weak_secret", // Replace default!
    saveUninitialized: false, // Don't save sessions that are not initialized
    resave: false, // Don't save session if unmodified
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Example: 24 hours
      // secure: process.env.NODE_ENV === 'production', // Enable in production (HTTPS needed)
      httpOnly: true, // Prevent client-side JS access
    },
    // === Optional: Use MongoStore for Production ===
    // store: MongoStore.create({
    //     mongoUrl: process.env.MONGODB_URI || 'your_mongodb_connection_string', // From env var
    //     autoRemove: 'interval',
    //     autoRemoveInterval: 10 // In minutes. Default
    // })
  })
);

// Passport Initialization & Session Integration (AFTER Express Session)
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser); // Your custom middleware to set res.locals.user

// Flash Message Middleware (AFTER Session and Passport)
app.use(flash());
app.use(customMiddleware.setflash); // Your custom middleware to set res.locals.flash

// --- Routes ---
// Use the main router defined in ./routes/index.js
app.use("/", require("./routes"));

// --- Start Server ---
app.listen(PORT, (err) => {
  if (err) {
    console.error(`Error starting server: ${err}`);
    return;
  }
  console.log(`Server is running successfully on port: ${PORT}`);
});
module.exports = app;