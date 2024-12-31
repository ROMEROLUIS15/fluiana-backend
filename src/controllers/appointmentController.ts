import e, { Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import { Op, where } from 'sequelize';
import { Therapist, User } from '../models';
import catchError from '../middlewares/catchError';

class AppointmentController {
    // Create a new appointment (only for therapists)
    public createAppointment = catchError(async(req: Request, res: Response): Promise<void> => {

            const authenticatedUserId = req.userId;
            const { userId, startTime, endTime, patientId } = req.body;
            console.log("PatientId: ", patientId)

            // Check if the authenticated user is a therapist
            const authenticatedUser = await User.findByPk(authenticatedUserId);
            // console.log("Authenticated user: ", authenticatedUser)
            if (!authenticatedUser || authenticatedUser.role !== 'therapist') {
                res.status(403).json({ ok: false, message: 'Only therapists can create appointments' });
                return;
            }

            // Check if the provided therapistId exists and is a therapist
            const therapist = await Therapist.findOne({where: { userId: authenticatedUserId }});
            const therapistId = therapist?.therapistId;
            if (!therapist) {
                res.status(400).json({ ok: false, message: 'Therapist not found' });
                return;
            }

            // Check if the userId (patient) exists, if provided
            if (userId) {
                const patient = await User.findByPk(patientId);
                if (!patient) {
                    res.status(400).json({ ok: false, message: 'Patient not found' });
                    return;
                }
            }
            
            const patient = await User.findByPk(patientId);
            // Check for appointment conflicts
            const hasConflict = await Appointment.findOne({
                where: {
                    therapistId,
                    [Op.or]: [
                        { startTime: { [Op.between]: [startTime, endTime] } },
                        { endTime: { [Op.between]: [startTime, endTime] } }
                    ]
                }
            });

            if (hasConflict) {
                res.status(400).json({ ok: false, message: 'Therapist already has an appointment in this time range' });
                return;
            }

            // Create the appointment
            if(patient){

                const newAppointment = await Appointment.create({ 
                    therapistId, 
                    userId: patientId, // This will be null if not provided
                    startTime, 
                    endTime, 
                    notes: patient.username,
                    status: userId ? 'reserved' : 'available' // If there is a userId, the appointment is reserved; otherwise, it is available
                });
                res.status(201).json({ ok: true, appointment: newAppointment });
            }

    })

    // This function gets all appointments for the user
    public findAllAppointments = catchError(async(req: Request, res: Response): Promise<void> => {
    
            const authenticatedUserId = req.userId;
            const {
                page = 1,
                limit = 10,
                startDate,
                endDate,
                status
            } = req.query;

            const parsedPage = parseInt(page as string, 10);
            const parsedLimit = parseInt(limit as string, 10);
            const offset = (parsedPage - 1) * parsedLimit;

            // Check the role of the authenticated user
            const user = await User.findByPk(authenticatedUserId);
            if (!user) {
                res.status(404).json({ ok: false, message: 'User not found' });
                return;
            }

            const whereClause: any = {};

            if (user.role === 'therapist') {
                const therapist = await Therapist.findOne({ where: { userId: authenticatedUserId } });
                if (!therapist) {
                    res.status(404).json({ ok: false, message: 'Therapist not found' });
                    return;
                }
                whereClause.therapistId = therapist.therapistId;
            } else {
                whereClause.userId = authenticatedUserId;
            }

            if (status) whereClause.status = status;
            if (startDate || endDate) {
                whereClause.startTime = {};
                if (startDate) whereClause.startTime[Op.gte] = new Date(startDate as string);
                if (endDate) whereClause.startTime[Op.lte] = new Date(endDate as string);
            }

            const { count, rows } = await Appointment.findAndCountAll({
                where: whereClause,
                limit: parsedLimit,
                offset: offset,
                include: [
                    {
                        model: Therapist,
                        as: 'therapist',
                        include: [{
                            model: User,
                            attributes: ['userId', 'username', 'email']
                        }]
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['userId', 'username', 'email']
                    }
                ],
                order: [['startTime', 'ASC']]
            });

            const totalPages = Math.ceil(count / parsedLimit);

            res.status(200).json({
                ok: true,
                appointments: rows,
                currentPage: parsedPage,
                totalPages: totalPages,
                totalItems: count
            });
    })
    public async getAppointmentByTherapistId(req: Request, res: Response): Promise<void>{
        const{ therapistId } = req.params;

        try {
            const appointments = await Appointment.findAll({
                where:{therapistId}
            })

            if(!appointments || appointments.length < 1){
                res.status(404).json({ok: false, message: "Therapist has no appointments"})
            }

            res.status(200).json({ok: true, data: appointments})

        } catch (error) {
            // console.log("Error in server", error)
            res.status(500).json({ok: false, message: "Internal server error"})
        }
        
    }

    // Update an existing appointment (only for therapists)
    public updateAppointment = catchError(async(req: Request, res: Response): Promise<void> => {
      
            const { appointmentId } = req.params;
            const { startTime, endTime, notes, status } = req.body;

            const appointment = await Appointment.findByPk(appointmentId);
            if (!appointment) {
                res.status(404).json({ ok: false, message: 'Appointment not found' });
                return;
            }

            appointment.startTime = startTime || appointment.startTime;
            appointment.endTime = endTime || appointment.endTime;
            appointment.notes = notes || appointment.notes;
            appointment.status = status || appointment.status;

            await appointment.save();
            res.json({ ok: true, appointment });
    })

    // Delete an appointment (only for therapists)
    public deleteAppointment = catchError(async(req: Request, res: Response): Promise<void> => {

            const { appointmentId } = req.params;
          
    
            const appointment = await Appointment.findByPk(appointmentId, {
                include: [{
                    model: Therapist,
                    as: 'therapist',
                    attributes: ['therapistId']
                }]
            });
    
            if (!appointment) {
                res.status(404).json({ ok: false, message: 'Appointment not found' });
                return;
            }
    
            
           

            await appointment.destroy();
            res.json({ ok: true, message: 'Appointment deleted' });
    })

    //Cancel appointment. Not delete but only change availability to cancelled
    public async cancelAppointment (req: Request, res: Response):Promise<void>{
        const { appointmentId } = req.params
        try {
            const appointment = await Appointment.findByPk(appointmentId)
            if(!appointment){
                res.status(404).json({ok: false, message: "No appointment found with this ID"})
            }

            await Appointment.update( 
                { status: "cancelled" },
                { where: { appointmentId } } // Ensure the correct field is used here
            );

            res.status(200).json({
                ok: true,
                message: "Appointment successfully canceled",
            });
        } catch (error) {
            console.log("Error in cancelAppointment controller: ", error)
            res.status(500).json({ok: false, message: "Internal server Error", error: error})
        }
    }


    // Check availability of an appointment
    public checkAvailability = catchError(async(req: Request, res: Response): Promise<void> => {

            const { appointmentId } = req.params;

            const appointment = await Appointment.findByPk(appointmentId);
            if (!appointment) {
                res.status(404).json({ ok: false, message: 'Appointment not found' });
                return;
            }

            if (appointment.status !== 'available') {
                res.status(400).json({ ok: false, message: 'Appointment is not available' });
                return;
            }

            res.json({ ok: true, available: true, appointment });
    })

    // Reserve an appointment
    public reserveAppointment = catchError(async(req: Request, res: Response): Promise<void> => {

            const { appointmentId } = req.params;
            const { userId } = req.body;

            const appointment = await Appointment.findByPk(appointmentId);
            if (!appointment || appointment.status !== 'available') {
                res.status(400).json({ ok: false, message: 'Appointment is not available' });
                return;
            }

            appointment.userId = userId;
            appointment.status = 'reserved';

            await appointment.save();
            res.json({ ok: true, appointment });
    })
}

export default new AppointmentController();