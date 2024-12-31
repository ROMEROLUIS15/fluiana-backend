import { Router } from 'express';
import catchError from '../middlewares/catchError';
import FavoriteTipController from '../controllers/FavoriteTipController';

const router = Router();

router.get('/favorites-tips/:userId', FavoriteTipController.getAllFavoritesTips);
router.post('/create-favorite', catchError(FavoriteTipController.createFavoriteTip));
router.put('/update-favorite', catchError(FavoriteTipController.updateFavoriteTip))
router.delete('/delete-favorite/:userId', catchError(FavoriteTipController.deleteFavoriteTip))

export default router;