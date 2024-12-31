import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

interface FlexibleValidationError {
    msg: string;
    [key: string]: any;
}

const getErrorField = (err: FlexibleValidationError): string => {
    return (err as any).path || (err as any).param || (err as any).location || 'unknown';
};

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array().map((err: FlexibleValidationError) => ({
                field: getErrorField(err),
                message: err.msg
            }))
        });
    }

    next();
};

export default validateRequest;