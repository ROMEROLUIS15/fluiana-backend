import { Router } from 'express';
import ChatController from '../controllers/ChatController';
//Chat routes
const router = Router();

// Crear un nuevo chat
router.post('/', ChatController.createChat);

// Obtener chats por usuario
router.get('/user/:userId', ChatController.getChatByUser);

// Obtener chats por terapeuta
router.get('/therapist/:therapistId', ChatController.getChatsByTherapist);
// Obtener un chat específico de un terapeuta
router.get('/therapist/:therapistId/chat/:chatId', ChatController.getChatByTherapistAndChatId);

export default router;
