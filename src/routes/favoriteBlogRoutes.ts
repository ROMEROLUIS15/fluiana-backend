import { Router } from 'express';
import catchError from '../middlewares/catchError';
import FavoriteBlogController from '../controllers/FavoriteBlogController';

const router = Router();

router.get('/favorites-blogs/:userId', FavoriteBlogController.getMyFavoritesBlogs);
router.post('/create-update-favorite', catchError(FavoriteBlogController.createUpdateFavoriteBlog));

export default router;