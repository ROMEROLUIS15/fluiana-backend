import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Message } from '../models/Message';
import sequelize from '../config/database';
import Sender from '../models/Sender';
import Chat from '../models/Chat';
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from '../interfaces/socket.interface'; // Asegúrate de importar las interfaces correctamente
import { StarredMessage } from '../models/StarredMessage';

interface SocketData {
  userId: number;
  therapistId: number;
}

const initializeSocket = (server: HTTPServer) => {
  const io = new Server<ServerToClientEvents, ClientToServerEvents, SocketData>(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
  });

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, SocketData>) => {
    console.log('Nuevo cliente conectado:', socket.id);

    // Manejar la unión a una sala de chat
    socket.on('joinChat', async (chatId: number) => {
      try {
        const chat = await Chat.findByPk(chatId);
        if (chat) {
          console.log(chatId)
          
          socket.join(`chat_${chatId}`);
          console.log(`Socket ${socket.id} unido a chat_${chatId}`);
          socket.emit('joinedChat', { ok: true, message: `Unido a chat_${chatId}` });
        } else {
          socket.emit('joinedChatError', { message: 'Chat no encontrado' });
        }
      } catch (error) {
        console.error('Error al unirse al chat:', error);
        socket.emit('joinedChatError', { message: 'Error al unirse al chat' });
      }
    });

    // Manejar la conexión del terapeuta y unirlo a todas las salas de sus chats activos
  socket.on('therapistJoinChats', async (therapistId: number) => {
    try {
      // Encontrar todos los chats activos de este terapeuta
      const activeChats = await Chat.findAll({
        where: { therapistId, status: 'active' }
      });

      if (activeChats.length > 0) {
        // Unir al terapeuta a cada sala (room) de chat activo
        activeChats.forEach((chat) => {
          const roomName = `chat_${chat.id}`;
          socket.join(roomName);
          console.log(`Terapeuta ${therapistId} unido a la sala ${roomName}`);
        });

        socket.emit('joinedAllChats', {
          message: `Unido a ${activeChats.length} chats`,
          chatIds: activeChats.map(chat => chat.id),
        });
      } else {
        socket.emit('noChatsFound', { message: 'No se encontraron chats activos.' });
      }
    } catch (error) {
      console.error('Error al unir al terapeuta a los chats:', error);
      socket.emit('error', { message: 'Error al unirse a los chats.' });
    }
  });

    // Manejar la salida de una sala de chat
    socket.on('leaveChat', async (chatId: number) => {
      try {
        const room = `chat_${chatId}`;
        socket.leave(room);
        console.log(`Socket ${socket.id} salió de ${room}`);
        socket.emit('leftChat', { ok: true, message: `Saliste de ${room}` });
      } catch (error) {
        console.error('Error al salir del chat:', error);
        socket.emit('leftChatError', { message: 'Error al salir del chat.' });
      }
    });

    // Manejar el envío de mensajes
    socket.on('sendMessage', async (data) => {
      const { chatId, senderId, content } = data;

      if (!chatId || !senderId || !content) {
        socket.emit('error', { message: 'chatId, senderId y content son requeridos.' });
        return;
      }

      const transaction = await sequelize.transaction();

      try {
        // Verificar que el chat exista y esté activo
        const chat = await Chat.findByPk(chatId, { transaction });
        if (!chat || chat.status !== 'active') {
          await transaction.rollback();
          socket.emit('error', { message: 'Chat no encontrado o inactivo.' });
          return;
        }

        // Verificar que el sender exista
        const sender = await Sender.findByPk(senderId, { transaction });
        if (!sender) {
          await transaction.rollback();
          socket.emit('error', { message: 'Sender no encontrado.' });
          return;
        }

        // Verificar que el sender pertenece al chat
        if (
          (sender.type === 'patient' && chat.userId !== sender.userId) ||
          (sender.type === 'therapist' && chat.therapistId !== sender.therapistId)
        ) {
          await transaction.rollback();
          socket.emit('error', { message: 'Sender no está asociado a este chat.' });
          return;
        }

        // Crear el mensaje
        const message = await Message.create(
          {
            chatId: chatId,
            senderId: senderId,
            content: content,
            isRead: false,
          },
          { transaction }
        );
        
        await transaction.commit()
        
        // Emitir el mensaje a todos los clientes en la sala del chat
        io.to(`chat_${chatId}`).emit('receiveMessage', message);
      } catch (error) {
        await transaction.rollback();
        console.error('Error al enviar mensaje via Socket.io:', error);
        socket.emit('error', { message: 'Error al enviar el mensaje.' });
      }
    });

    // Manejar la marcación de mensajes como leídos
    socket.on('markMessagesAsRead', async ({ chatId }) => {
      try {
        // Validar chatId
        if (typeof chatId !== 'number') {
          socket.emit('error', { message: 'chatId debe ser un número.' });
          return;
        }

        const [affectedRows] = await Message.update(
          { isRead: true },
          {
            where: {
              chatId: chatId,
              isRead: false,
            },
          }
        );

        if (affectedRows > 0) {
          console.log(`Mensajes en chat ${chatId} marcados como leídos.`);
          socket.emit('messagesMarkedAsRead', { chatId, affectedRows });
        } else {
          console.log(`No se encontraron mensajes no leídos en chat ${chatId}.`);
          socket.emit('noMessagesToMark', { chatId });
        }
      } catch (error) {
        console.error("Error al marcar mensajes como leídos:", error);
        socket.emit('error', { message: 'Error al marcar mensajes como leídos.' });
      }
    });

    // Evento para destacar un mensaje
    socket.on('starMessage', async (data) => {
      const { messageId, senderId, chatId } = data;

      try {
        const message = await Message.findOne({ where: { id: messageId } });
        if (!message) {
          socket.emit('error', { message: 'El mensaje no existe.' });
          return;
        }

        // Verificar si ya está destacado por este usuario
        const existingStar = await StarredMessage.findOne({
          where: { messageId, starredBySenderId: senderId },
        });

        if (existingStar) {
          socket.emit('error', { message: 'Ya has destacado este mensaje.' });
          return;
        }

        // Destacar el mensaje y obtener el registro creado
        const newStarMessage = await StarredMessage.create({
          messageId,
          senderId: message.senderId,
          starredBySenderId: senderId,
          chatId,
          content: message.content,
          createdAt: message.createdAt,
        });

        // Usar el registro creado para incluir el ID
        const starMessage = {
          id: newStarMessage.id, // ID generado por la base de datos
          messageId: newStarMessage.messageId,
          senderId: newStarMessage.senderId,
          starredBySenderId: newStarMessage.starredBySenderId,
          chatId: newStarMessage.chatId,
          content: newStarMessage.content,
          createdAt: message.createdAt,
        };

        // Notificar a todos los usuarios del chat
        io.to(`chat_${chatId}`).emit('messageStarred', starMessage);
      } catch (error) {
        console.error('Error al destacar mensaje:', error);
        socket.emit('error', { message: 'Error al destacar el mensaje.' });
      }
    });

    
    // Evento para quitar un mensaje de destacado
    socket.on('unstarMessage', async (data) => {
      const { ids, starredBySenderId } = data;

      const id = ids
      try {
        // Verificar que el mensaje destacado existe
        const existingStar = await StarredMessage.findOne({
          where: { id, starredBySenderId },
        });
    
        if (!existingStar) {
          socket.emit('error', { message: 'El mensaje no está destacado o no tienes permiso para quitarlo.' });
          return;
        }
    
        // Quitar el mensaje de destacado
        await existingStar.destroy();
    
        // Notificar a todos los usuarios del chat
        io.to(`chat_${existingStar.chatId}`).emit('messageUnstarred', { ids, starredBySenderId });
      } catch (error) {
        console.error('Error al quitar destacado:', error);
        socket.emit('error', { message: 'Error al quitar el mensaje de destacado.' });
      }
    });
    

    // Manejar la desconexión
    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  return io;
};

export default initializeSocket;





