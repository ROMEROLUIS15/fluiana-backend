import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({
        ok: false,
        message: 'Internal Server Error',
        error: err.message,
    });
};

export default errorHandler;
