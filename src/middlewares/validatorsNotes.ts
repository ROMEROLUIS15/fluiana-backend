import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';

export const validateShareNote = [
  body('noteId').isInt().withMessage('noteId must be an integer'),
  body('sharedWithUserId').optional().isInt().withMessage('sharedWithUserId must be an integer'),
  body('sharedWithTherapistId').optional().isInt().withMessage('sharedWithTherapistId must be an integer'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateUpdateNoteSharing = [
  param('shareId').isInt().withMessage('shareId must be an integer'),
  body('sharedWithUserId').optional().isInt().withMessage('sharedWithUserId must be an integer'),
  body('sharedWithTherapistId').optional().isInt().withMessage('sharedWithTherapistId must be an integer'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];