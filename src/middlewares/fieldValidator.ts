import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator"

export const fieldValidator = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            ok: false,
            errors: errors.mapped()
        })
    }
    next()
}