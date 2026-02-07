import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/UserModel.js';

dotenv.config();

// --- Serialization and Deserialization (No Change) ---
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// --- Get the Superadmin list from .env ---
// This splits the string "email1,email2" into an array ["email1", "email2"]
const superadminEmails = process.env.SUPERADMIN_EMAILS ? 
                         process.env.SUPERADMIN_EMAILS.split(',').map(e => e.trim()) : 
                         [];

// --- The Main Google Strategy (Updated) ---
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;

      // 1. Check if user is in our new Superadmin list
      if (superadminEmails.includes(email)) {
        // --- This is the new logic ---
        // User is a superadmin. Find or create them with this role.
        try {
          let user = await User.findOneAndUpdate(
            { email: email }, // Find user by email
            { // Data to set/update
              googleId: profile.id,
              name: profile.displayName,
              profilePicture: profile.photos[0].value,
              role: 'superadmin', // <-- ASSIGN SUPERADMIN ROLE
            },
            { 
              upsert: true, // If user doesn't exist, create them
              new: true    // Return the new/updated document
            }
          );
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }

      // 2. If not an admin, proceed with normal role logic
      let role = 'student';
      if (email.endsWith('@bracu.ac.bd')) {
        role = 'faculty';
      } else if (!email.endsWith('@g.bracu.ac.bd')) {
        // Block non-BRACU emails
        return done(new Error('Invalid email domain.'), null);
      }

      // 3. Find or create a normal user
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        } else {
          const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: email,
            role: role, // This will be 'student'
            profilePicture: profile.photos[0].value,
          });

          await newUser.save();
          return done(null, newUser);
        }
      } catch (err) {
        return done(err, null);
      }
    }
  )
);