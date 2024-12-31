import { Request, Response } from 'express';
import { Op } from 'sequelize';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import EmailService from '../services/EmailService';
import { Therapist, User } from "../models";
import generateVerificationCode from '../services/generateVerificationCode';
import VerificationCode from '../models/VerificationCode';
import dotenv from 'dotenv';
import { getFilePath, unlinkFile } from '../utils/auth';
import { PaymentMethod } from '../models/PaymentMethod';
import catchError from '../middlewares/catchError';
import Chat from '../models/Chat';
import Plan from '../models/Plan';
import Sender from '../models/Sender';
dotenv.config();

class UserController {

  // Gets all users from the database excluding their passwords
  public async getAllUsers(req: Request, res: Response): Promise<void> {
    console.log("Getting all users")
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] }
      });
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Creates a new user with patient role and their basic information
  public async createUserPatient(req: Request, res: Response): Promise<void> {
    const { username, email, password, gender, birthday, location, phone } =
      req.body;
    // Compruebo la existencia del usuario en DB
    // await sequelize.sync({});
    const userExist = await User.findOne({
      where: { email: email },
    });
    if (userExist) {
      res.status(400).json({
        ok: false,
        message: "User exist",
      });
      return;
    }
    try {
      // Crea el usuario en la DB
      const user = await User.create({
        username,
        email,
        password,
        gender,
        birthday,
        location,
        phone,
        role: "patient",
        userImage: null,
      });
      res.status(200).json({
        ok: true,
        message: "User patient created succesfully",
        user
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // public async findPatientByEmail(req: Request, res: Response): Promise<void> {
  //     try {
  //       const { email } = req.body;
  //       console.log("Email in body: ", email);

  //       // Buscamos el paciente por correo electrónico
  //       const patient = await User.findOne({
  //         where: { email: email, role: 'patient' }, // Aseguramos que sea un paciente
  //         include: [
  //           {
  //             model: Sender,
  //             as: 'sender', // Relación con Sender
  //             attributes: ['id'], // Solo necesitamos el senderId
  //           },
  //           {
  //             model: Chat,
  //             as:"chat",
  //             where: { status: 'active' }, // Solo buscamos chats activos
  //           },
  //         ],
  //       });



  //     // Respondemos con los datos del paciente
  //     res.json(patient);
  //     console.log(patient);
  //     } catch (error) {
  //       res.status(500).json({ message: 'Server error', error });
  //     }
  //   }


  // Updates user information and validates email uniqueness
  public async editUser(req: Request, res: Response): Promise<void> {
    console.log('Request received:', req.params);
    const { userId } = req.params
    const updates = req.body;

    try {

      const user = await User.findOne({ where: { userId: userId } })

      if (!user) {
        res.status(404).json({
          ok: false,
          message: 'User not found',
        });
        return;
      }

      const possibleExistingUser = await User.findOne({ where: { email: updates.email, userId: { [Op.ne]: userId } } })
      if (possibleExistingUser) {
        res.status(400).json({
          ok: false,
          message: "Email already in use"
        })
        return
      }

      await user.update(updates);
      res.status(200).json({
        ok: true, message: 'Usuario Editado exitosamente', status: 201
      });



    } catch (error) {
      res.status(500).send({ ok: false, message: 'Error occured in editUser' });
    }
  }

  // Handles user authentication and generates JWT token for valid credentials
  public async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validamos si el usuario existe en la base de datos
      const user = await User.findOne({
          where: { email: email },
          include: {
              model: Plan, // Include the associated Plan model
              as: 'plan',
              attributes: ['planId', 'namePlan', 'amount', 'groupSessions', 'individualSessions', 'description'], // Specify which fields to include from the Plan model
          }
      });

      if (!user) {
        return res.status(400).json({
          message: `User with email ${email} not found in database`
        });
      }

      // Verificamos si el usuario tiene una contraseña (en caso de que sea registrado por Google)
      if (!user.password) {
        return res.status(400).json({
          message: 'User registered with Google. Please login via Google.'
        });
      }

      // Validamos la contraseña
      const passwordValid = await bcryptjs.compare(password, user.password);
      if (!passwordValid) {
        return res.status(400).json({
          message: 'Incorrect password'
        });
      }

      // Verificamos el rol del usuario
      const role = user.role;
      if (role !== 'admin' && role !== 'therapist' && role !== 'patient') {
        return res.status(403).json({
          message: 'Unauthorized role'
        });
      }

      const currentDate = new Date();
      if (user.startDate && user.status ==="cancelled") {
          const startDate = new Date(user.startDate);
          const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)); // Convert milliseconds to days

          if (diffDays > 30) {
              // Update user status to 'unsubscribed' if more than 30 days have passed
              user.status = 'unsubscribed';
              user.subscriptionId = null;
              user.planId = null;
              await user.save();
          }
      }

      // Generamos el payload del token, incluyendo el rol del usuario
      const payload = { userId: user.userId, role: user.role };

      // Generamos el token JWT
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        throw new Error('JWT secret is not defined. Set it in the environment variables.');
      }

      const token = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Enviar la respuesta con los datos del usuario y el token
      res.json({
        ok: true,
        message: "Login exitoso",
        data: {
          token,
          userId: user.userId,
          username: user.username,
          email: user.email,
          role: user.role,
          userImage: user.userImage,
          assignedTherapeutId: user.assignedTherapeutId,
          plan: user.plan,
          subscriptionId: user.subscriptionId,
          status: user.status,
          startDate: user.startDate,
          cancelDate: user.cancelDate
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: (error as Error).message,
      });
    }
  }

  // Retrieves a list of new users pending approval status
  public async getNewsUsers(req: Request, res: Response): Promise<void> {
    try {
      // Lista de los nuevos usuarios pendientes de aprobacion o rechazo
      const users = await User.findAll({
        attributes: ['id', 'fullname', 'specialty', 'certificatenumber', 'email', 'status'],
        where: { status: 'Pendiente' },
        order: [['createdAt', 'DESC']]
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  //Función de Rechazo de cuenta, con envio a correo Electronico
  public async denyAccount(req: Request, res: Response): Promise<void> {
    try {
      const { email, description } = req.body;
      // Buscamos el usuario a actualizar el estado
      const user = await User.findOne({ where: { email: email } });

      const updUser = await User.update({ status: 'Denied' },
        {
          where: {
            id: user?.userId,
          },
        },
      );

      const emailService = new EmailService();
      emailService.sendEmail(email, 'Account Denied', description);
      res.status(201).json({
        ok: true, message: 'Account email rejected, successfully sent', status: 201
      })
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  //CONTROLLER FOR SENDING VERIFICATION CODE TO EMAIL
  public validateEmail = catchError(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    // Check if the user exists in the database
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      res.status(404).json({ ok: false, message: "No user exists with this email." });
      return;
    }

    // Check if a verification code has already been sent to this email
    const existingCodeEntry = await VerificationCode.findOne({ where: { email: email } });
    if (existingCodeEntry) {
      res.status(400).json({ ok: false, message: "A code has already been sent to this email. Please verify your email." });
      return;
    }

    // Generate a new verification code
    const verificationCode = generateVerificationCode(6);
    await VerificationCode.create({ email: email, code: verificationCode });

    // Send the verification code to the email
    const emailService = new EmailService();
    //await emailService.sendEmail(email, "Verification Code", `Your verification code is: ${verificationCode}`);
    await emailService.sendEmail(email, "Recovery code for your Fluiana account", verificationCode);

    res.status(200).json({ ok: true, message: "A verification code has been sent to your email." });
  })

  //CONTROLLER FOR VERIFYING THE CODE SENT WHEN THE EMAIL HAS BEEN CHECK
  public verifyCode = catchError(async (req: Request, res: Response): Promise<void> => {
    const { email, verificationCode } = req.body;

    // Check if a verification entry exists for the given email
    const verificationEntry = await VerificationCode.findOne({ where: { email: email } });
    if (!verificationEntry) {
      res.status(404).json({ ok: false, message: "No verification code found for this email." });
      return;
    }

    // Validate the provided verification code
    if (verificationEntry.code !== verificationCode) {
      res.status(400).json({ ok: false, message: "Verification code is incorrect." });
      return;
    }

    // Mark the code as verified in the database
    await VerificationCode.update({ isVerified: true }, { where: { email: email } });
    res.status(200).json({ ok: true, message: "Verification successful." });
  })

  //CONTROLLER TO UPDATE PASSWORD
  public resetPassword = catchError(async (req: Request, res: Response): Promise<void> => {
    const { email, newPassword, confirmPassword } = req.body;

    // Check that all required fields are present
    if (!email || !newPassword || !confirmPassword) {
      res.status(400).json({ message: 'Email, new password, and confirm password are required' });
      return;
    }

    // Check that the new password and confirm password match
    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    // Verify that the user has a valid verification code
    const verificationEntry = await VerificationCode.findOne({ where: { email } });
    if (!verificationEntry || !verificationEntry.isVerified) {
      res.status(400).json({ message: 'Verification code is required or invalid' });
      return;
    }

    // Hash the new password before updating it
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update the user's password in the database
    await User.update({ password: hashedPassword }, { where: { email: email } });

    // Delete the verification code after updating the password
    await VerificationCode.destroy({ where: { email } });

    res.status(200).json({ message: 'Password updated successfully.' });
  })

  // public async updatePerfilUser(req: Request, res: Response): Promise<void> {
  //     req.body.userImage = '';
  //     const files: any = req.files as {
  //         [fieldname: string]: Express.Multer.File[];
  //     }| undefined;  // Make `files` possibly undefined to handle cases with no file upload

  //     if (files && files.userImage) {
  //         req.body.userImage = getFilePath(files.userImage);
  //     }

  //     const { userId, username, email, password } = req.body;


  //     try{
  //         // Traemos los datos del usuario por el ID
  //         const user = await User.findOne({ where: {userId: userId} })

  //         if(req.body.userImage !== ''){
  //             // si existe la ruta de la imagen del usuario en la tabla lo eliminamos
  //             if (user?.userImage) unlinkFile(user?.userImage);
  //         }else {
  //             // Si no hay imagen, no la eliminamos
  //             req.body.userImage = user?.userImage;
  //         }

  //         const userImage = req.body.userImage;
  //         console.log("Body: ", req.body)

  //         // Comparamos si hubo cambios en el email del usuario
  //         if (user?.email !== email){
  //             // Verificamos si el nuevo email ya está en uso
  //             const emailExists = await User.findOne({ where: { email: email } });
  //             // si existe, finalizamos la transaccion y retornamos el mensaje de error
  //             if (emailExists) {
  //                 res.status(400).json({ ok: false, message: 'El email ya está en uso' });
  //                 return;
  //             }
  //         }

  //         if ( password !== undefined || password.trim().length !== 0) {
  //             const hashedPassword = await bcryptjs.hash(password, 10);
  //             // Actualizamos los datos del usuario
  //             await User.update({ username: username, email: email, password: hashedPassword, userImage: userImage }, { where: { userId: userId } });
  //         }else {
  //             // Actualizamos los datos del usuario
  //             await User.update({ username: username, email: email, userImage: userImage }, { where: { userId: userId } });
  //         }

  //         res.status(201).json({
  //             ok: true, message: 'Se realizo correctamente la actualización de los datos del Usuario', status: 201
  //         });
  //     } catch (error) {
  //         if (req.body.userImage) unlinkFile(req.body.userImage);
  //         res.status(500).send({ ok: false, message: 'Ha ocurrido un error actualizando los datos del usuario', error: error});
  //     }
  // }
  public async updatePerfilUser(req: Request, res: Response): Promise<void> {
    const { userId, username, email, password } = req.body;
    const userImage = req.file ? getFilePath(req.file) : null; // Check if a file was uploaded

    console.log("Body: ", req.body);
    console.log("Uploaded file: ", userImage); // Log the uploaded file information

    try {
      // Fetch user data by userId
      const user = await User.findOne({ where: { userId: userId } });

      if (userImage) {
        // If there's a new image, delete the old one if it exists
        if (user?.userImage) unlinkFile(user.userImage);
      } else {
        // If no new image, keep the old one
        req.body.userImage = user?.userImage;
      }

      // Handle email uniqueness and password hashing as previously implemented
      if (user?.email !== email) {
        const emailExists = await User.findOne({ where: { email: email } });
        if (emailExists) {
          res.status(400).json({ ok: false, message: 'El email ya está en uso' });
          return;
        }
      }

      // Update user information
      if (password) {
        const hashedPassword = await bcryptjs.hash(password, 10);
        await User.update({ username, email, password: hashedPassword, userImage }, { where: { userId } });
      } else {
        await User.update({ username, email, userImage }, { where: { userId } });
      }

      res.status(201).json({
        ok: true,
        message: 'Se realizo correctamente la actualización de los datos del Usuario',
        status: 201
      });
    } catch (error) {
      if (userImage) unlinkFile(userImage); // Clean up the uploaded file if there's an error
      res.status(500).send({ ok: false, message: 'Ha ocurrido un error actualizando los datos del usuario', error });
    }
  }




  // Updates or creates user payment method information
  public updateUserPayment = catchError(async (req: Request, res: Response): Promise<void> => {
    const { userId, cardNumber, nameHolder, expirationDate, securityCode, planId } = req.body;
    try {
      const paymentMethod = await PaymentMethod.findOne({ where: { userId: userId } });

      if (!paymentMethod) {
        // Si no existe el metodo de pago del usuario lo creamos
        await PaymentMethod.create({ userId: userId, cardNumber: cardNumber, nameHolder: nameHolder, expirationDate: expirationDate, securityCode: securityCode, planId: planId });
      } else {
        // Si ya existe el metodo de pago del usuario lo actualizamos
        await PaymentMethod.update({ cardNumber: cardNumber, nameHolder: nameHolder, expirationDate: expirationDate, securityCode: securityCode, planId: planId }, { where: { userId: userId } });
      }

      res.status(201).json({
        ok: true, message: 'Se realizo correctamente la actualización del metodo de pago del Usuario', status: 201
      });
    } catch (error) {
      res.status(500).send({ ok: false, message: 'Ha ocurrido un error actualizando los datos del metodo de pago del Usuario' });
    }
  })

}


export default new UserController();
