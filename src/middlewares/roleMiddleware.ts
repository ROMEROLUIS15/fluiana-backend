import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Authentication middleware to verify JWT and attach `userId` to the request
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
      return res.status(401).json({ ok: false, message: 'Token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
      if (err) {
          return res.status(403).json({ ok: false, message: 'Invalid token' });
      }

      // Log the decoded token to verify structure
    //   console.log("Decoded token:", decoded);

      // Assign `userId` to `req` from the decoded token
      req.userId = (decoded as { userId: number }).userId;

      // Verify `req.userId` was set correctly
    //   console.log("req.userId:", req.userId);

      next();
  });
};

// Middleware to check if the user is a therapist
export const isTherapist = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(403).json({ ok: false, message: 'User ID is missing' });
    }

    const user = await User.findByPk(userId);

    if (!user || user.role !== 'therapist') {
        return res.status(403).json({ ok: false, message: 'Access denied, therapist role required' });
    }

    req.body.therapistId = userId; // Set the therapistId for use in the route handler

    next();
};

export default { authenticateToken, isTherapist };
