import { Request, Response } from 'express';
import { Tip } from '../models/Tip';
import { getFilePath } from '../utils/auth';
import { Therapist} from '../models';
import { User } from '../models'

class TipController {
    public async getAllTips(req: Request, res: Response): Promise<void> {
        try {
            const tips = await Tip.findAll();

            res.status(200).json({
                ok: true,
                data: tips
            });
        } catch(error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    public async getMyTherapistTips(req: Request, res: Response): Promise<void> {
        const { therapistId } = req.params;

        try{
            const tips = await Tip.findAll({
                where: { therapistId }
            });

            res.status(200).json({
                ok: true,
                data: tips
            });
        } catch(error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    public async createTip(req: Request, res: Response): Promise<void> {
        try {
            req.body.tipImage = '';
            const files: any = req.files as {
                [fieldname: string]: Express.Multer.File[];
            };

            if (files.tipImage) {
                req.body.tipImage = getFilePath(files.tipImage);
            }

            const { userId, title, subTitle, description, category, tipImage } = req.body;

            const therapist = await Therapist.findOne({where: {userId: userId}});

            const newTip = await Tip.create({
                therapistId: therapist?.therapistId, 
                title,
                subTitle,
                description,
                category,
                tipImage
            });

            res.status(201).json({
                ok: true,
                message: 'Tip created successfully.',
                data: newTip
            });

        } catch(error){
            res.status(500).json({ message: error });
        }
    }

    public async getTipById(req: Request, res: Response):Promise<void>{
        const {tipId} = req.params;

        try {
            const tip = await Tip.findOne({
                where:{tipId},
                include: [
                    {
                        model: Therapist,
                        include: [
                            {
                                model: User,
                                attributes: ["username"]
                            }
                        ]    
                    }
                ]
            })
            if(!tip){
                res.status(404).json({ok: false, message: `Tip with id: ${tipId} not found`})
            }
            // console.log("Tip: ", tip)
            res.status(200).json({ok:true, data: tip})
        } catch (error) {
            res.status(500).json({message: error})
        }
    }
}

export default new TipController();