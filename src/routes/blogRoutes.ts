import { Router } from 'express';
import BlogController from '../controllers/BlogController';
import validateToken from '../middlewares/authenticate';

const router = Router();

router.post('/create-blog', validateToken, BlogController.createBlog);

router.get('/blogs', validateToken, BlogController.getAllBlogs);

router.get('/blogs/:id', validateToken,BlogController.getBlogById);

router.get('/therapist/:therapistId/blogs', validateToken, BlogController.getBlogsByTherapist);

export default router;
