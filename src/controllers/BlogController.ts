import { Request, Response } from 'express';
import { Blog } from '../models/Blog';
import { Therapist } from '../models/Therapist';
import { Op } from 'sequelize';
import catchError from '../middlewares/catchError';

class BlogController {
    // Create a new blog
    public createBlog = catchError(async(req: Request, res: Response): Promise<void> => {
        const { title, content, category } = req.body;
        const therapistId = req.userId; // Therapist ID from authenticated user

        // Validate input data
        if (!title || !content || !category) {
            res.status(400).json({
                ok: false,
                message: 'Title, content, and category are required.'
            });
            return;
        }

        // Check if the therapist exists
        const therapist = await Therapist.findByPk(therapistId);
        if (!therapist) {
            res.status(404).json({
                ok: false,
                message: 'Therapist not found.'
            });
            return;
        }

        // Ensure the therapist ID matches the logged-in user; otherwise, deny access.
        if (therapistId !== therapist.therapistId) {
            res.status(403).json({
                ok: false,
                message: 'Unauthorized. Therapist ID does not match the logged-in user.'
            });
            return;
        }

        // Create the new blog post
        const newBlog = await Blog.create({
            title,
            content,
            category,
            therapistId
        });

        // Send successful response
        res.status(201).json({
            ok: true,
            message: 'Blog created successfully.',
            data: newBlog
        });
    })
    
    // Get all blogs with optional title filter
    public getAllBlogs = catchError(async(req: Request, res: Response): Promise<void> => {
        const { title } = req.query;
        const filters: any = {};
    
        // Apply title filter if provided
        if (title) {
            filters.title = { [Op.like]: `%${title}%` }; // Use LIKE pattern for partial matches
        }
    
        const blogs = await Blog.findAll({
            where: filters,
            include: [
                {
                    model: Therapist,
                    attributes: ['therapistId', 'userImage']
                }
            ]
        });
    
        res.status(200).json({
            ok: true,
            data: blogs
        });
    })
    
    // Get a specific blog by ID
    public getBlogById = catchError(async(req: Request, res: Response): Promise<void> => {
        const { id } = req.params;

        const blog = await Blog.findByPk(id, {
            include: [
                {
                    model: Therapist,
                    attributes: ['therapistId', 'userImage']
                }
            ]
        });

        if (!blog) {
            res.status(404).json({
                ok: false,
                message: 'Blog not found.'
            });
            return;
        }

        res.status(200).json({
            ok: true,
            data: blog
        });
    })

    // Filter blogs written by a specific therapist
    public getBlogsByTherapist = catchError(async(req: Request, res: Response): Promise<void> => {
        const { therapistId } = req.params;

        const blogs = await Blog.findAll({
            where: { therapistId },
            include: [
                {
                    model: Therapist,
                    attributes: ['therapistId', 'userImage']
                }
            ]
        });

        if (blogs.length === 0) {
            res.status(404).json({
                ok: false,
                message: 'No blogs found for this therapist.'
            });
            return;
        }

        res.status(200).json({
            ok: true,
            data: blogs
        });
    })
}

export default new BlogController();
