import express from 'express';
import userRoutes from './routes/userRoutes';
import authRoute from './routes/authRoute';
import therapistRoutes from './routes/therapistRoutes';
import blogRoutes from './routes/blogRoutes';
import noteTemplateRoutes from './routes/noteTemplateRoutes';
import diaryNoteRoutes from './routes/diaryNoteRoutes';
import noteSharingRoutes from './routes/noteSharingRoutes';
import tipRoutes from './routes/tipRoutes';
import favoriteTipRoutes from './routes/favoriteTipRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import adminRoutes from './routes/adminRoute'
import sessionsRoutes from './routes/sessionChannelRoutes';
import paymentsRoutes from './routes/paymentRoutes';
import questionareRoutes from './routes/QuestionnaireRoute'

const router = express.Router();

router.use('/users', userRoutes);
router.use('/auth', authRoute);
router.use('/therapists', therapistRoutes);
router.use('/therapist-blogs', blogRoutes);
router.use('/diary-notes', diaryNoteRoutes);
router.use('/note-templates', noteTemplateRoutes);
router.use('/note-sharing', noteSharingRoutes);
router.use('/tips', tipRoutes);
router.use('/favorite-tip', favoriteTipRoutes);
router.use('/appointments', appointmentRoutes)
// router.use('/chats', chatRoutes);
// router.use('/messages', messageRoutes);
router.use('/admin', adminRoutes)
router.use('/sessions-channel', sessionsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/questionare', questionareRoutes);


export default router;