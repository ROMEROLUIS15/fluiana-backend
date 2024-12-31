import express from 'express';
import passport from 'passport';

const router = express.Router();

/**
 * Auth Routes
 * Handles authentication using Passport.js for Google OAuth.
 */

// Start Google authentication.
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'] // Access user's profile and email
}));

// Google callback route after authentication.
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/login'); // Redirect to the dashboard on successful login
    }
);

// Logout route for users.
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/'); // Redirect to the homepage after logout
    });
});

// Protected route to get user profile.
router.get('/profile', ensureAuthenticated, (req, res) => {
    res.json({ user: req.user });
});

// Middleware to check if user is authenticated.
function ensureAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.isAuthenticated()) {
        return next(); // Proceed if authenticated
    }
    res.status(401).json({ message: 'Unauthorized' });
}

export default router;