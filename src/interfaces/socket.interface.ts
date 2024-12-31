import { Message } from '../models/Message';

export interface ServerToClientEvents {
  receiveMessage: (message: Message) => void;
  updateStarredMessage: (data: { messageId: number; isStarred: boolean; senderId: number }) => void;
  error: (data: { message: string }) => void;
  messagesMarkedAsRead: (data: { chatId: number; affectedRows: number }) => void;
  noMessagesToMark: (data: { chatId: number }) => void;
  joinedChat: (data: { ok: boolean; message: string }) => void;
  joinedChatError: (data: { message: string }) => void;
  leftChat: (data: { ok: boolean; message: string }) => void;
  leftChatError: (data: { message: string }) => void;
  joinedAllChats: (data: { message: string; chatIds: number[] }) => void;
  noChatsFound: (data: { message: string }) => void;

  // Agregar el evento messageStarred
  messageStarred: ( starMessage: any ) => void;
  messageUnstarred: (data: { messageId: number; starredBySenderId: number }) => void;
}


export interface ClientToServerEvents {
  sendMessage: (data: { chatId: number; senderId: number; content: string }) => void;
  receiveMessage: (message: Message) => void;
  starMessage: (data: { messageId: number, senderId: number, chatId: number}) => void;
  unstarMessage: (data: { ids: number, starredBySenderId: number}) => void;
  updateStarredMessage: (data: { messageId: number; isStarred: boolean; senderId: number }) => void;
  markMessagesAsRead: (data: { chatId: number }) => void;
  joinChat: (chatId: number) => void;
  leaveChat: (chatId: number) => void;

  // Nuevo evento para que el terapeuta solicite unirse a los chats
  therapistJoinChats: (therapistId: number) => void;
  // Agregar el evento messageStarred
  messageStarred: ( starMessage: any ) => void;
  messageUnstarred: (data: { ids: number; starredBySenderId: number }) => void;
}
