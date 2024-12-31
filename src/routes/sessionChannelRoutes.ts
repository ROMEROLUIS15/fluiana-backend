import { Router } from 'express';
import SessionChannelController from '../controllers/SessionChannelController';
import catchError from '../middlewares/catchError';
const router = Router();

router.get('/:userId', catchError(SessionChannelController.listSessionChannels));
router.get('/:userId/:channelName', catchError(SessionChannelController.findSessionChannel));
router.post('/', catchError(SessionChannelController.createSessionChanel));

export default router;