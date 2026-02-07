import express from 'express';
import passport from 'passport';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const CLIENT_URL = process.env.CLIENT_URL;

// --- 1. The Login Route ---
// This is the URL the user clicks on ("Login with Google")
// It kicks off the Passport authentication process
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'], // What we ask Google for
}));

// --- 2. The Callback Route ---
// This is the URL Google redirects to after the user logs in
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${CLIENT_URL}/login/failed`, // Redirect on fail
  }),
  (req, res) => {
    // Successful authentication, redirect to the React app's dashboard.
    res.redirect(`${CLIENT_URL}/dashboard`);
  }
);

// --- 3. The "Get User" Route ---
// A route our React app can call to check if a user is still logged in
router.get('/me', (req, res) => {
  if (req.user) {
    // req.user is added by Passport.js
    res.status(200).json({
      success: true,
      message: 'User is authenticated',
      user: req.user,
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'User is not authenticated',
    });
  }
});



// --- 4. The Logout Route ---
router.get('/logout', (req, res, next) => {
  req.logout((err) => { // req.logout() is a Passport function
    if (err) { return next(err); }
    req.session.destroy();
    res.redirect(CLIENT_URL); // Redirect to the client's home page
  });
});

export default router;