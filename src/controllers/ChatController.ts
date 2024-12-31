import { Request, Response } from 'express';
import { User } from '../models/User';
import { Therapist } from '../models/Therapist';
import sequelize from '../config/database';
import Sender from '../models/Sender';
import Chat from '../models/Chat';
import { Message } from '../models/Message';
//Chat controller
class ChatController {
    // Crear un nuevo chat entre un user y un therapist
    public async createChat(req: Request, res: Response): Promise<void> {
        const { userId, therapistId } = req.body;

        if (!userId || !therapistId) {
            res.status(400).json({ message: 'userId y therapistId son requeridos' });
            return;
        }

        const transaction = await sequelize.transaction();

        try {
            // Verificar si el user y therapist existen
            const user = await User.findByPk(userId, { transaction });
            const therapist = await User.findByPk(userId, { transaction });

            if (!user || user.role !== 'patient') {
                await transaction.rollback();
                res.status(404).json({ message: 'User no encontrado o rol incorrecto' });
                return;
            }

            

            // Verificar si el paciente ya tiene un chat activo
            const existingChat = await Chat.findOne({
                where: {
                    userId,
                    status: 'active',
                },
                transaction,
            });

            if (existingChat) {
                await transaction.rollback();
                res.status(400).json({ message: 'El paciente ya tiene un chat activo.' });
                return;
            }

            // Crear el chat
            const chat = await Chat.create({
                userId,
                therapistId,
                status: 'active',
            }, { transaction });

            await transaction.commit();

            res.status(201).json(chat);
        } catch (error) {
            await transaction.rollback();
            console.error('Error creating chat:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Obtener todos los chats de un user
    public async getChatByUser(req: Request, res: Response): Promise<void> {
        const { userId } = req.params;
    
        try {
            const chat = await Chat.findOne({
                where: { userId },
                include: [
                    { 
                        model: Therapist, 
                        as: 'therapist', 
                        include: [{ model: Sender, as: 'sender', include: [{ model: User, as: 'patient' }, { model: Therapist, as: 'therapist' }] }] 
                    },
                    { model: Message, as: 'messages' },
                ],
            });
    
            if (chat) {
                res.status(200).json(chat);
            } else {
                res.status(404).json({ message: 'Chat not found' });
            }
        } catch (error) {
            console.error('Error fetching chat:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    

    // Obtener todos los chats de un therapist
public async getChatsByTherapist(req: Request, res: Response): Promise<void> {
    const { therapistId } = req.params;

    try {
        const chats = await Chat.findAll({
            where: { therapistId },
            include: [
                { 
                    model: User, 
                    as: 'patient', 
                    include: [
                        { 
                            model: Sender, 
                            as: 'sender', 
                            include: [
                                { model: User, as: 'patient' }, 
                                { model: Therapist, as: 'therapist' }
                            ] 
                        }
                    ]
                },
                { model: Message, as: 'messages' },
            ],
        });

        res.status(200).json(chats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

public async getChatByTherapistAndChatId(req: Request, res: Response): Promise<void> {
    const { therapistId, chatId } = req.params;

    try {
        const chat = await Chat.findOne({
            where: { id: chatId, therapistId },
            include: [
                {
                    model: User,
                    as: 'patient',
                    include: [
                        {
                            model: Sender,
                            as: 'sender',
                            include: [
                                { model: User, as: 'patient' },
                                { model: Therapist, as: 'therapist' }
                            ]
                        }
                    ]
                },
                { model: Message, as: 'messages' },
            ],
        });

        if (chat) {
            res.status(200).json(chat);
        } else {
            res.status(404).json({ message: 'Chat no encontrado para este terapeuta' });
        }
    } catch (error) {
        console.error('Error fetching chat:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

    // Cerrar un chat
    public async closeChat(req: Request, res: Response): Promise<void> {
        const { chatId } = req.params;

        try {
            const chat = await Chat.findByPk(chatId);
            if (!chat) {
                res.status(404).json({ message: 'Chat no encontrado' });
                return;
            }

            chat.status = 'closed';
            await chat.save();

            res.status(200).json({ message: 'Chat cerrado exitosamente', chat });
        } catch (error) {
            console.error('Error closing chat:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default new ChatController();
