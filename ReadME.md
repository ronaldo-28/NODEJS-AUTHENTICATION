# Node.js Authentication System

A comprehensive Node.js application demonstrating user authentication features including local signup/login, Google OAuth 2.0, password management (change, forgot, reset), session management, flash messages, and a light/dark theme toggle.

## Features

- **User Registration:** Sign up with Name, Email, and Password.
- **Local Authentication:** Login using Email and Password.
- **Google OAuth 2.0:** Login/Signup using a Google account.
- **Password Hashing:** Securely stores passwords using `bcrypt`.
- **Session Management:** Uses `express-session` for user sessions.
- **Protected Routes:** Middleware (`passport.checkAuthentication`) ensures only logged-in users can access certain pages.
- **Flash Messages:** Provides user feedback using `connect-flash` and `Noty`.
- **Password Management:**
  - **Change Password:** Logged-in users can change their password.
  - **Forgot Password:** Users can request a password reset link via email.
  - **Reset Password:** Users can set a new password using a secure token sent via email.
- **Email Notifications:** Uses `nodemailer` to send password reset emails.
- **Theme Toggle:** Light/Dark theme switching with persistence using `localStorage`.
- **Environment Variable Configuration:** Uses `.env` file for sensitive credentials.

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** Passport.js (`passport-local`, `passport-google-oauth20`)
- **Templating:** EJS (Embedded JavaScript templates), `express-ejs-layouts`
- **Security:** `bcrypt` (Password Hashing), `crypto` (Token Generation)
- **Session:** `express-session`
- **Flash Messages:** `connect-flash`, Noty.js
- **Email:** Nodemailer
- **Styling:** CSS, Bootstrap 5, Font Awesome
- **Environment Variables:** `dotenv`

## Prerequisites

- Node.js (v14 or later recommended)
- npm or yarn
- MongoDB (Local instance or a cloud service like MongoDB Atlas)

## Setup and Installation

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Environment Variables:**

    - Create a `.env` file in the root directory.
    - Copy the contents of `.env.example` into `.env`.
    - Fill in the required values:
      - `MONGODB_URI`: Your MongoDB connection string.
      - `SESSION_SECRET`: A long, random string for session security.
      - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
      - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret.
      - `GOOGLE_CALLBACK_URL`: Your Google OAuth Callback URL (e.g., `http://localhost:3000/auth/google/callback`). **Ensure this matches your Google Cloud Console setup.**
      - `EMAIL_USER`: Your Gmail address (or email service username).
      - `EMAIL_PASS`: Your Gmail App Password (recommended for security) or email service password.
      - `PORT` (Optional): The port the application will run on (defaults to 3000).

    ```dotenv
    # .env Example Content
    MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority
    SESSION_SECRET=replace_this_with_a_very_strong_random_secret_key
    GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
    GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_gmail_app_password # Use App Password for Gmail
    PORT=3000
    ```

4.  **Database Setup:**

    - Ensure your MongoDB server is running or your MongoDB Atlas cluster is accessible.
    - The application will connect using the `MONGODB_URI` from your `.env` file.

5.  **Google Cloud Console Setup:**

    - Go to the [Google Cloud Console](https://console.cloud.google.com/).
    - Create a new project or select an existing one.
    - Go to "APIs & Services" > "Credentials".
    - Create an "OAuth client ID".
    - Select "Web application" as the application type.
    - Add an "Authorized JavaScript origin" (e.g., `http://localhost:3000`).
    - Add an "Authorized redirect URI" (e.g., `http://localhost:3000/auth/google/callback`). **This MUST match `GOOGLE_CALLBACK_URL` in your `.env` file.**
    - Copy the generated Client ID and Client Secret into your `.env` file.

6.  **Email Setup (Gmail Example):**
    - If using Gmail, it's highly recommended to use an **App Password**.
    - Enable 2-Step Verification for your Google Account.
    - Go to your Google Account settings > Security > App passwords.
    - Generate a new App Password for "Mail" on "Other (Custom name)" (e.g., "NodeAuthApp").
    - Use the generated 16-character App Password as `EMAIL_PASS` in your `.env` file.

## Running the Application

```bash
npm start
# or
# node index.js
```
