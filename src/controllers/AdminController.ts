import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Speciality, Therapist, User } from '../models';
import EmailService from '../services/EmailService';
import bcryptjs from 'bcryptjs';
import { Plan } from '../models/Plan';
import { io } from '../index';
import catchError from '../middlewares/catchError';


class AdminController {

    // Suspends a user's account, updates suspension reason and time
    public suspendAccount = catchError(async(req: Request, res:Response): Promise<void> => {

      const { reasonSuspension, suspensionTime, email, userId } = req.body;
      console.log("User form req.body: ", req.body)

          const user = await User.findOne({where:{userId}})
          if(!user){
            res.status(404).json({ok: false, message: "User does not exist??"})
          }
          const suspendAccount = await User.update(
            {
              suspension: true,
              reasonSuspension,
              suspensionDate: new Date(),
              suspensionTime

            },
            {
              where:{email}
            }
          )
          
          res.status(200).json({ok: true, message: "User suspended successfully"})
    })
  
    // Accepts a user's account and sends an acceptance email
    public acceptAccount = catchError(async(req: Request, res: Response): Promise<Response> => {

            const { email, description } = req.body;
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            await Therapist.update({ status: 'active' }, { where: { userId: user.userId } });
            // const emailService = new EmailService();
            // try {
            //     await emailService.sendEmail(email, 'Account Accepted');
            // } catch (emailError) {
            //     console.error('Email sending failed:', emailError);
            //     return res.status(500).json({ ok: false, message: 'Failed to send email' });
            // }
            return res.status(201).json({ ok: true, message: 'Account acceptance email sent successfully' });
    });

    // controller rejects a user account and sends an email notification
    public denyAccount = catchError(async (req: Request, res: Response): Promise<void> => {
        const { email, description } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        await User.update({ status: 'suspended' }, { where: { userId: user.userId } });
        const emailService = new EmailService();
        await emailService.sendEmail(email, 'Account Rejected', description);
        res.status(201).json({ ok: true, message: 'Account rejection email sent successfully' });
    });

    // controller updates an admin's profile information, including password if provided
    public updateAdminProfile = catchError(async (req: Request, res: Response): Promise<void> => {
        const { userId, username, email, currentPassword, newPassword } = req.body;
        const admin = await User.findOne({ where: { userId, role: 'admin' } });
        if (!admin) {
            res.status(404).json({ message: 'Admin not found' });
            return;
        }
        if (currentPassword) {
            const isPasswordValid = await bcryptjs.compare(currentPassword, admin.password);
            if (!isPasswordValid) {
                res.status(400).json({ message: 'The current password is incorrect' });
                return;
            }
        } else {
            res.status(400).json({ message: 'The current password is required to modify sensitive data' });
            return;
        }
        if (newPassword && await bcryptjs.compare(newPassword, admin.password)) {
            res.status(400).json({ message: 'The new password cannot be the same as the current password' });
            return;
        }
        if (email && email !== admin.email) {
            const existingEmail = await User.findOne({ where: { email, userId: { [Op.ne]: admin.userId } } });
            if (existingEmail) {
                res.status(400).json({ message: 'The email is already in use by another user' });
                return;
            }
        }
        const updateData: any = { username, email };
        if (newPassword) {
            if (newPassword.length < 8) {
                res.status(400).json({ message: 'The new password must be at least 8 characters long' });
                return;
            }
            const specialCharRegex = /[!@#$%^&*(),.?":{}|<>+\-_=[\]\\;']/;
            if (!specialCharRegex.test(newPassword)) {
                res.status(400).json({
                    errors: [{
                        field: 'newPassword',
                        message: 'The new password must contain at least one special character'
                    }]
                });
                return;
            }
            updateData.password = await bcryptjs.hash(newPassword, 10);
        }
        await User.update(updateData, { where: { userId } });
        const updatedAdmin = await User.findOne({ where: { userId } });
        if (!updatedAdmin) {
            res.status(500).json({ message: 'Error updating the admin profile' });
            return;
        }
        updatedAdmin.lastProfileUpdate = new Date();
        await updatedAdmin.save();
        //io.emit('adminProfileUpdated', { userId, username, email });
        res.status(200).json({
            message: 'Admin profile updated successfully. Please log in again to continue.',
        });
    });

    // controller retrieves a list of pending therapist account requests
    public getTherapistRequests = catchError(async (req: Request, res: Response): Promise<void> => {
        const therapistRequests = await User.findAll({
            where: { role: 'therapist', status: 'pending' },
            attributes: ['userId', 'username', 'email', 'createdAt']
        });
        res.status(200).json(therapistRequests);
    });

    // controller processes a therapist account request (accept or reject)
    public handleTherapistRequest = catchError(async (req: Request, res: Response): Promise<void> => {
        const { userId, action, description } = req.body;
        const therapist = await User.findOne({ where: { userId, role: 'therapist', status: 'pending' } });
        if (!therapist) {
            res.status(404).json({ message: 'Therapist request not found' });
            return;
        }
        const newStatus = action === 'accept' ? 'active' : 'rejected';
        await User.update({ status: newStatus }, { where: { userId } });
        const emailService = new EmailService();
        const subject = action === 'accept' ? 'Account Accepted' : 'Account Rejected';
        await emailService.sendEmail(therapist.email, subject, description);
        res.status(200).json({ message: `Therapist request ${action}ed successfully` });
    });

    // controller toggles a user's account status between active and suspended
    public toggleUserAccount = catchError(async (req: Request, res: Response): Promise<void> => {
        const { userId, action } = req.body;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const newStatus = action === 'suspend' ? 'suspended' : 'active';
        await User.update({ status: newStatus }, { where: { userId } });
        res.status(200).json({ message: `User account ${action}ed successfully` });
    });

    // controller updates an existing subscription plan
    public updatePlan = catchError(async (req: Request, res: Response): Promise<void> => {
        const { planId, namePlan, description, amount, publico, individualSessions, groupSessions } = req.body;
        console.log("Req body: ", req.body)
        if (!namePlan || !description || amount <= 0 || !publico || !individualSessions || !groupSessions) {
            res.status(400).json({
                message: 'The fields namePlan, description, amount, and type are required, and amount must be a number greater than zero.',
            });
            return;
        }
        const plan = await Plan.findByPk(planId);
        if (!plan) {
            res.status(404).json({ message: 'Plan not found' });
            return;
        }
        await Plan.update({ namePlan, description, amount, individualSessions, publico, groupSessions}, { where: { planId } });
        //io.emit('planUpdated', { planId, namePlan, description, amount, type });
        res.status(200).json({ message: 'Plan updated successfully' });
    });

    // controller adds a new subscription plan
    public addPlan = catchError(async (req: Request, res: Response): Promise<void> => {
        // console.log("Req body: ", req.body)
        const { namePlan, description, amount, publico, individualSessions, groupSessions } = req.body;
        if (!namePlan || !description || amount <= 0 || !publico || !individualSessions || !groupSessions)  {
            res.status(400).json({ message: 'The fields namePlan, description, amount, and type are required, and amount must be greater than zero.' });
            return;
        }
        const newPlan = await Plan.create({ namePlan, description, amount, publico, individualSessions, groupSessions });
        //io.emit('planAdded', newPlan);
        res.status(201).json({ message: 'Plan added successfully', plan: newPlan });
    });

    // Controller for editing therapist details
    public editTherapist = catchError(async (req: Request, res: Response): Promise<void> => {
    // Extracting therapistId from route parameters and updates from request body
    const { therapistId } = req.params;
    const updates = req.body;
    console.log("Updates per body: ", updates);

    // Finding the therapist by therapistId
    const therapist = await Therapist.findOne({ where: { therapistId } });
    
    // Finding the associated user by userId in updates
    const user = await User.findOne({ where: { userId: updates.userId } });

    // Checking if both therapist and user exist
    if (!therapist || !user) {
        res.status(404).json({ ok: false, message: "Therapist not found or does not exist" });
        return;
    }

    // Checking if the email provided in updates is already in use by another therapist
    const possibleExistingUser = await Therapist.findOne({
        include: {
            model: User,
            where: {
                email: updates.email
            }
        },
        where: {
            userId: { [Op.ne]: updates.userId } // Exclude the current userId
        }
    });

    // If the email is already in use, send a response with a 400 status code
    if (possibleExistingUser) {
        res.status(400).json({
            ok: false,
            message: "Email already in use"
        });
        return;
    }

    // Update the user and therapist details with the provided updates
    await user?.update(updates);
    await therapist?.update(updates);

    // Send a success response
    res.status(200).json({
        ok: true,
        message: "Therapist edited successfully"
    });
    });

    // Get New Therapists
    public async getNewTherapists(_req: Request, res:Response): Promise<void>{
        try {
            const newTherapists = await Therapist.findAll({
                where: {status: "pending"},
                include: [
                    {
                        model: User,
                        attributes: ['username', 'email', 'gender', 'birthday', 'location', 'phone'],
                    },
                    {
                        model: Speciality,
                        
                    }
                ]
            })
            res.status(200).json(newTherapists)
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }


    // controller retrieves all subscription plans
    public getAllPlans = catchError(async (req: Request, res: Response): Promise<void> => {
        const plans = await Plan.findAll();
        res.status(200).json(plans);
    });

    // controller retrieves a specific subscription plan by its ID
    public getPlanById = catchError(async (req: Request, res: Response): Promise<void> => {
        const { planId } = req.params;
        const plan = await Plan.findByPk(planId);
        if (!plan) {
            res.status(404).json({ message: 'Plan not found' });
            return;
        }
        res.status(200).json(plan);
    });

    // controller retrieves user data by user ID, excluding the password
    public getUserData = catchError(async (req: Request, res: Response): Promise<void> => {
        const { userId } = req.params;
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json(user);
    });

    public async getAdmin(req: Request, res:Response): Promise<void>{
        try {
            const admin = await User.findOne({where: {role: "admin"}})
            if(!admin){
                res.status(404).json({message: "No admin"})
            }
            res.status(200).json(admin)
        } catch (error) {
            console.log("Error in getAdmin function: ", error)
            res.status(500).json({message: "Internal server error"})
        }
    }

}



export default new AdminController();