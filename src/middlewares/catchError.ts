import { Request, Response, NextFunction } from 'express';

const catchError = (controller: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await controller(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};

export default catchError;
