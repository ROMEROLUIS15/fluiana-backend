import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(403).json({ ok: false, message: 'User ID is missing' });
    }

    const user = await User.findByPk(userId);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ ok: false, message: 'Access denied, admin role required' });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Internal server error' });
  }
};
