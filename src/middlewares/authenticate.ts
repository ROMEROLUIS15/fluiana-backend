// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { User } from "../models/User";
// import { Op } from "sequelize";

// declare global {
//     namespace Express {
//         interface Request {
//             userId: number;
//         }
//     }
// }

// export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
//     const headerToken = req.headers['authorization'];

//     if (headerToken !== undefined && headerToken.startsWith('Bearer ')) {
//         try {
//             const token = headerToken.split(" ")[1];
//             //console.log('Token received:', token);

//             const JWT_SECRET = process.env.JWT_SECRET;
//             if (!JWT_SECRET) {
//                 throw new Error('JWT secret is not defined.');
//             }

//             // Verificar el token y extraer el payload
//             const payload = jwt.verify(token, JWT_SECRET) as {
//                 userId: number;
//                 iat: number;
//                 exp: number; 
//             };

//             // Check if the token has expired
//             if (Date.now() >= payload.exp * 1000) {
//                 return res.status(401).json({
//                     message: "Token has expired"
//                 });
//             }

//             // Buscar al administrador en la base de datos
//             const admin = await User.findOne({ 
//                 where: { userId: payload.userId, role: 'admin' }
//             });

//             if (!admin) {
//                 return res.status(401).json({ message: 'Admin not found' });
//             }

//             //Verificar si el perfil fue actualizado después de la emisión del token
//             if (admin.lastProfileUpdate && payload.iat * 1000 < new Date(admin.lastProfileUpdate).getTime()) {
//                 return res.status(401).json({
//                     message: 'Token invalid. The profile has been updated. Please log in again.'
//                 });
//             }

//             // asignar el userId al request
//             req.userId = payload.userId;
//             //console.log('Authenticated userId:', req.userId);
//             next();
//         } catch (error) {
//             console.error('Error verifying token:', error);
//             if (error instanceof jwt.TokenExpiredError) {
//                 return res.status(401).json({
//                     message: "Token has expired"
//                 });
//             }
//             res.status(401).json({
//                 message: "Invalid token"
//             });
//         }
//     } else {
//         console.log('No authorization header or invalid format');
//         res.status(401).json({
//             message: "Unauthorized"
//         });
//     }
// }

// export default validateToken;
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            userId: number;
        }
    }
}

export const validateToken = (req: Request, res: Response, next: NextFunction) => {
    const headerToken = req.headers['authorization'];
    if (headerToken && headerToken.startsWith('Bearer ')) {
        try {
            const token = headerToken.split(" ")[1];
            const JWT_SECRET = process.env.JWT_SECRET;
            if (!JWT_SECRET) {
                throw new Error('JWT secret is not defined.');
            }

            // Verify the JWT and extract the payload
            const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
            // console.log("payload: ", payload)

            // Populate req.userId
            req.userId = payload.userId;

            // Proceed to the next middleware
            next();
        } catch (error) {
            res.status(401).json({ message: "Invalid or expired token" });
        }
    } else {
        res.status(401).json({ message: "Unauthorized: No token provided" });
    }
};

export default validateToken;
