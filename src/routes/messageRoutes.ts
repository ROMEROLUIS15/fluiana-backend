import { Router } from 'express';
import MessageController from '../controllers/MessageController';

const router = Router();

// Crear un nuevo mensaje
router.post('/', MessageController.createMessage);

// Obtener mensajes de un chat
router.get('/:chatId', MessageController.getMessages);


// Marcar/desmarcar un mensaje como destacado
router.patch('/star/:messageId', MessageController.toggleStarredMessage);

// Obtener mensajes destacados de un chat
router.get('/starredMessages/:chatId', MessageController.getStarredMessages);

export default router;

