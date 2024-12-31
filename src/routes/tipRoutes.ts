import { Router } from 'express';
import catchError from '../middlewares/catchError';
import TipController from '../controllers/TipController';
const multiparty = require('connect-multiparty');

const router = Router();

const mdTipImg = multiparty({uploadDir: 'src/uploads/tips'});

router.get('/', TipController.getAllTips);
router.get('/tip/:tipId', catchError(TipController.getTipById))
router.get('/my-therapist-tips/:therapistId', TipController.getMyTherapistTips)
router.post('/create-tip', mdTipImg, catchError(TipController.createTip));

export default router;