// src/controllers/messageController.ts

import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { Therapist } from '../models/Therapist';
import sequelize from '../config/database';
import Sender from '../models/Sender';
import Chat from '../models/Chat';
import { StarredMessage } from '../models/StarredMessage';

class MessageController {
    // Crear un nuevo mensaje
    public async createMessage(req: Request, res: Response): Promise<void> {
        const { chatId, senderId, content, isStarred, isRead } = req.body;

        if (!chatId || !senderId || !content || !isRead) {
            res.status(400).json({ message: 'chatId, senderId y content son requeridos' });
            return;
        }

        const transaction = await sequelize.transaction();

        try {
            // Verificar si el chat existe y está activo
            const chat = await Chat.findByPk(chatId, { transaction });
            if (!chat || chat.status !== 'active') {
                await transaction.rollback();
                res.status(404).json({ message: 'Chat no encontrado o inactivo' });
                return;
            }

            // Verificar si el sender existe
            const sender = await Sender.findByPk(senderId, { transaction });
            if (!sender) {
                await transaction.rollback();
                res.status(404).json({ message: 'Sender no encontrado' });
                return;
            }

            // Opcional: Verificar que el sender pertenece al chat
            // Esto depende de cómo defines qué usuarios pueden enviar mensajes en un chat
            // Por ejemplo, si el chat es entre un User y un Therapist, y el sender debe ser uno de ellos
            if (
                (sender.type === 'patient' && chat.userId !== sender.userId) ||
                (sender.type === 'therapist' && chat.therapistId !== sender.therapistId)
            ) {
                await transaction.rollback();
                res.status(403).json({ message: 'Sender no está asociado a este chat' });
                return;
            }

            // Crear el mensaje
            const message = await Message.create({
                chatId: chatId,
                senderId : senderId,
                content: content,
                isRead: isRead ?? false
            }, { transaction });

            await transaction.commit();

            res.status(201).json(message);
        } catch (error) {
            await transaction.rollback();
            console.error('Error creating message:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Obtener mensajes de un chat específico
    public async getMessages(req: Request, res: Response): Promise<void> {
        const { chatId } = req.params;

        try {
            const messages = await Message.findAll({
                where: { chatId },
                order: [['createdAt', 'ASC']],
                include: [
                    {
                        model: Sender,
                        as: 'sender',
                        include: [
                            {
                                model: User,
                                as: 'user',
                                attributes: ['userId', 'username', 'email'],
                            },
                            {
                                model: Therapist,
                                as: 'therapist',
                                attributes: ['therapistId'],
                            },
                        ],
                    },
                ],
            });

            res.status(200).json(messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Marcar un mensaje como destacado
    public async toggleStarredMessage(req: Request, res: Response): Promise<void> {
        const chatId = parseInt(req.params.chatId, 10); 
        const messageId = parseInt(req.params.messageId, 10); // Convertir messageId a número
        const senderId = req.userId; // El ID del usuario actual (o terapeuta)
    
        if (isNaN(messageId)) {
          res.status(400).json({ message: 'El ID del mensaje no es válido' });
          return;
        }
      
        try {
          const message = await Message.findOne({
            where : {id: messageId},
          });
          console.log("message",message)
          if (!message) {
            res.status(404).json({ message: 'Mensaje no encontrado' });
            return;
          }
      
          // Verifica si ya está destacado por este usuario
          const existingStar = await StarredMessage.findOne({
            where: { messageId, senderId, chatId },
          });
      
          if (existingStar) {
            // Si ya está destacado, lo elimina
            await existingStar.destroy();
            res.status(200).json({ message: 'Mensaje desmarcado como destacado' });
          } else {
            // Si no está destacado, lo agrega
            const starMessage = {
                messageId: messageId,
                senderId: message.senderId,
                starredBySenderId: senderId,
                chatId:chatId,
                content: message?.content,
                createdAt: message.createdAt
              }
            await StarredMessage.create(starMessage);
            res.status(201).json({ message: 'Mensaje marcado como destacado' });
          }
        } catch (error) {
          console.error('Error al alternar el destacado del mensaje:', error);
          res.status(500).json({ message: 'Error interno del servidor' });
        }
      }
    
     // Obtener todos los mensajes destacados de un chat para un usuario
    public async getStarredMessages(req: Request, res: Response): Promise<void> {
    const { chatId } = req.params;

    try {
        // Busca los mensajes destacados para el chat y el usuario
        const starredMessages = await StarredMessage.findAll({
            where: { chatId },
            include: [
                {
                    model: Message, 
                    as: "message",
                    attributes: ['id', 'content', 'senderId', 'createdAt', 'isRead',],
                },
                {
                    model: Sender,
                    as: "userWhoStarred", // Alias para el usuario que destacó el mensaje
                    attributes: ['id'], 
                },
                {
                    model: Sender,
                    as: "originalSender", // Alias para el remitente original
                    attributes: ['id'], // Incluye cualquier atributo relevante del remitente original
                },
            ],
        });
        // Transformar la respuesta para enviar los detalles completos del mensaje
        const formattedMessages = starredMessages.map((starred:any) => ({
            id: starred.id,
            messageId: starred.messageId,
            content: starred.message.content,
            senderId: starred.originalSender.id,
            starredBySenderId: starred.userWhoStarred.id,
            createdAt: starred.message.createdAt,
            isRead: starred.message.isRead,
        }));
        console.log(formattedMessages)
        res.json(formattedMessages);
    } catch (error) {
        console.error('Error al obtener mensajes destacados:', error);
        res.status(500).json({ message: 'Error al obtener mensajes destacados' });
    }
}

  
}

export default new MessageController();


