import { Router } from 'express';
import AppointmentController from '../controllers/appointmentController';
import validateToken from '../middlewares/authenticate'
// import isTherapist from '../middlewares/roleMiddleware';
import { authenticateToken, isTherapist } from '../middlewares/roleMiddleware';
import catchError from '../middlewares/catchError';

const router = Router();

router.post('/',authenticateToken, isTherapist, catchError(AppointmentController.createAppointment));

router.patch('/cancel/:appointmentId', catchError(AppointmentController.cancelAppointment))

router.get('/', catchError(AppointmentController.findAllAppointments));

router.put('/:appointmentId', isTherapist, catchError(AppointmentController.updateAppointment));

router.get('/:therapistId', catchError(AppointmentController.getAppointmentByTherapistId))

router.delete('/:appointmentId', authenticateToken, isTherapist,  catchError(AppointmentController.deleteAppointment));

router.get('/:appointmentId/availability',  catchError(AppointmentController.checkAvailability));

router.post('/:appointmentId/reserve',  catchError(AppointmentController.reserveAppointment));

export default router;
