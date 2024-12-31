import { Request, Response } from 'express';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { Op } from 'sequelize';
import dotenv from 'dotenv';
import { SessionChannel } from '../models/SessionChannel';
dotenv.config();

class SessionChannelController {

    public async listSessionChannels(req: Request, res: Response): Promise<void> {
        const sessionChannel = await SessionChannel.findOne({
            where: {
                userId: req.params.userId
            }
        });

        res.status(200).json({
            ok: true,
            data: sessionChannel
        });
    }

    public async findSessionChannel(req: Request, res: Response){
        const sessionChannel = await SessionChannel.findOne({
            where: {
                userId: req.params.userId,
                channelName: req.params.channelName
            }
        });

        res.status(200).json({
            ok: true,
            data: sessionChannel
        });
    }

    public async createSessionChanel(req: Request, res: Response): Promise<void> {
        //const userId = req.body.userId;
        const uid = req.body.uid ? parseInt(req.body.uid as string, 10):0;
        //const channelName = req.body.channelName as string;
        const {userId, channelName, dateSession, hourSession, media, nameTheme, therapistId} = req.body;
        try {
            const app_id = process.env.APP_ID;
            const app_certificate = process.env.APP_CERTIFICATE;
            if(!app_id || !app_certificate){
                res.status(400).json({ message: 'Missing APP_ID or APP_CERTIFICATE' });
                return;
            }
            const role = RtcRole.PUBLISHER;
            const expireTime = 3600; // token válido por 1 hora
            const currentTime = Math.floor(Date.now() / 1000);
            const privilegeExpireTime = currentTime + expireTime;

            const token = RtcTokenBuilder.buildTokenWithUid(
                app_id,
                app_certificate,
                channelName,
                uid,
                role,
                privilegeExpireTime
            );

            const agoraChannel = await SessionChannel.create({
                userId,
                dateSession,
                hourSession,
                media,
                nameTheme: nameTheme?nameTheme:null,
                therapistId: therapistId?Number(therapistId):null,
                channelName,
                uid,
                role,
                privilegeExpireTime,
                token
            });

            res.status(200).json({
                ok: true,
                message: "Sala creada correctamente la sesión",
                agoraChannel
            });

        }catch (error){
            console.log(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default new SessionChannelController();