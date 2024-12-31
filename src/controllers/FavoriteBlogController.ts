import { Request, Response } from 'express';
import { FavoriteBlog } from '../models/FavoriteBlog';
import { Blog } from '../models/Blog';

class FavoriteBlogController {
    public async getMyFavoritesBlogs(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const favorites = await FavoriteBlog.findAll({
                where: { userId, isFavorite: true },
                include: [
                    {
                        model: Blog,
                        attributes: ['blogId','title', 'content', 'category']
                    },
                ],
            });

            res.status(200).json({
                ok: true,
                data: favorites
            });
        } catch(error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    public async createUpdateFavoriteBlog(req: Request, res: Response): Promise<void> {
        const { userId, blogId, isFavorite } = req.body;
        try{
            const favorite = await FavoriteBlog.findOne({
                where: { userId, blogId }
            });

            if(favorite){
                await favorite.update({ isFavorite });
            }else{
                await FavoriteBlog.create({ userId, blogId, isFavorite });
            }

            res.status(200).json({
                ok: true,
                message: 'Favorite created successfully'
            });
        } catch(error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default new FavoriteBlogController();