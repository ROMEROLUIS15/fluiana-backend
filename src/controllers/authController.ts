// import { Request, Response } from 'express';
// import passport from 'passport';
// import { User } from '../models';

// class AuthController {

//     // Inicia la autenticación con Google
//     public googleAuth(req: Request, res: Response): void {
//         passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
//     }

//     // Callback de Google después de la autenticación
//     public googleAuthCallback(req: Request, res: Response): void {
//         passport.authenticate('google', { failureRedirect: '/login' }, async (err, user) => {
//             if (err) {
//                 return res.status(500).json({ message: 'Internal server error' });
//             }
//             if (!user) {
//                 return res.status(401).json({ message: 'Unauthorized' });
//             }

//             try {
//                 // Aquí puedes realizar cualquier lógica adicional, como asignar roles
//                 // o configurar datos adicionales en la sesión.
                
//                 // Regresa una respuesta con los datos del usuario
//                 res.status(200).json({
//                     ok: true,
//                     user,
//                     message: 'User authenticated successfully'
//                 });
//             } catch (error) {
//                 console.error(error);
//                 res.status(500).json({ message: 'Internal server error' });
//             }
//         })(req, res);
//     }

//     // Manejar la creación de usuarios
//     public async createUser(req: Request, res: Response): Promise<void> {
//         const { id, displayName, emails } = req.user as any; // Asegúrate de tener la información del usuario en req.user

//         try {
//             // Comprueba si el usuario ya existe
//             const existingUser = await User.findOne({ where: { googleId: id } });

//             if (!existingUser) {
//                 // Crea un nuevo usuario si no existe
//                 const newUser = await User.create({
//                     googleId: id,
//                     username: displayName,
//                     email: emails[0].value,
//                     role: 'user', // o 'therapist' según tu lógica
//                 });

//                 res.status(201).json({
//                     ok: true,
//                     user: newUser,
//                     message: 'User created successfully'
//                 });
//             } else {
//                 res.status(200).json({
//                     ok: true,
//                     user: existingUser,
//                     message: 'User authenticated successfully'
//                 });
//             }
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ message: 'Internal server error' });
//         }
//     }
// }

// export default new AuthController();
