import { Request, Response } from 'express';
import { FavoriteTip } from '../models/FavoriteTip';
import { Tip } from '../models/Tip';

class FavoriteTipController {
    public async getAllFavoritesTips(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const favorites = await FavoriteTip.findAll({
                where: { userId, isFavorite: true },
                include: [
                    {
                        model: Tip,
                        attributes: ['tipId', 'title', 'description', 'tipImage', 'category', 'therapistId']
                    }
                ]
            });

            res.status(200).json({
                ok: true,
                data: favorites
            });
        } catch(error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    public async createFavoriteTip(req: Request, res: Response): Promise<void> {
        const { userId, tipId } = req.body;
        try {
            const favorite = await FavoriteTip.create({ userId, tipId, isFavorite: true });
            res.status(201).json({
                ok: true,
                message: 'Favorite created successfully',
                data: favorite
            });
        } catch (error) {
            console.log("Error: ", error)
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    public async updateFavoriteTip(req: Request, res: Response): Promise<void> {
        const { userId, tipId, isFavorite } = req.body;
        try {
            const favorite = await FavoriteTip.findOne({
                where: { userId, tipId }
            });
            
            if (favorite) {
                await favorite.update({ isFavorite });
                res.status(200).json({
                    ok: true,
                    message: 'Favorite updated successfully'
                });
            } else {
                res.status(404).json({ message: 'Favorite not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    public async deleteFavoriteTip(req: Request, res: Response): Promise<void> {
        const { userId } = req.params;
        const { tipId } = req.body;
        try {
            const favorite = await FavoriteTip.findOne({
                where: { userId, tipId }
            });
            
            if (favorite) {
                await favorite.destroy();
                res.status(200).json({
                    ok: true,
                    message: 'Favorite tip deleted successfully'
                });
            } else {
                res.status(404).json({ message: 'Favorite tip not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default new FavoriteTipController();