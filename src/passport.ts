import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Op } from 'sequelize';
import User from './models/User';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  throw new Error('Missing required Google OAuth environment variables');
}

// Configure the Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email'], // Scopes to get user information (without openid)
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if the profile has emails
        if (!profile.emails || profile.emails.length === 0) {
            return done(new Error('No email found'), undefined);
        }

        const email = profile.emails[0].value;

        // Find an existing user by email or Google ID
        let user = await User.findOne({ 
            where: { 
                [Op.or]: [{ email }, { googleId: profile.id }]
            } 
        });

        if (!user) {
            // Create a new user if not found
            user = await User.create({
                username: profile.displayName,
                email: email,
                role: 'patient',
                googleId: profile.id
            });
        } else if (!user.googleId) {
            // Update the user if Google ID is missing
            user.googleId = profile.id;
            await user.save();
        }

        done(null, user); // Pass the user to the next middleware
    } catch (error) {
        done(error as Error, undefined);
    }
}));

// Serialize user to store in session
passport.serializeUser((user: any, done) => {
    done(null, user.userId);
});

// Deserialize user from session
passport.deserializeUser(async (id: string | number, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user); // Return the user to the request
    } catch (error) {
        done(error as Error, null);
    }
});

export default passport;