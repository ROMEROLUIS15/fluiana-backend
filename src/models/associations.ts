import { DiaryNote } from './DiaryNote';
import { NoteSharing } from './NoteSharing';
import { User } from './User';
import { Therapist } from './Therapist';
import TherapistQuestionnaire from './TherapistQuestionnaire';
import { Speciality } from './Speciality';
import { Schedule } from './Schedule';
import { PaymentMethod } from './PaymentMethod';
import { Plan } from './Plan';
import IndividualQuestionnaire from './IndividualQuestionnaire';
import { Document } from './Document';
import { Blog } from './Blog';
import { FavoriteBlog } from './FavoriteBlog';
import { FavoriteTip } from './FavoriteTip';
import { Tip } from './Tip';
import { Appointment } from './Appointment';
import {Message} from './Message'; // Importa el modelo Message
import Chat from './Chat'; // Importa el modelo Chat
import Sender from './Sender';
import { ContactInformation } from './ContactInformation';
import { StarredMessage } from './StarredMessage';
export function setupAssociations() {
  // DiaryNote and NoteSharing
  DiaryNote.hasMany(NoteSharing, { foreignKey: 'noteId', as: 'sharedNotes' });
  NoteSharing.belongsTo(DiaryNote, { foreignKey: 'noteId', as: 'diaryNote' });

  // NoteSharing and User
  NoteSharing.belongsTo(User, { foreignKey: 'sharedWithUserId', as: 'sharedWithUser' });
  User.hasMany(NoteSharing, { foreignKey: 'sharedWithUserId', as: 'sharedNotesSharedByUser' });

  // NoteSharing and Therapist
  NoteSharing.belongsTo(Therapist, { foreignKey: 'sharedWithTherapistId', as: 'sharedWithTherapist' });
  Therapist.hasMany(NoteSharing, { foreignKey: 'sharedWithTherapistId', as: 'sharedNotesSharedByTherapist' });

  // ContactInformation y Therapist
  ContactInformation.belongsTo(Therapist, { foreignKey: 'therapistId', as: 'therapist' });
  Therapist.hasMany(ContactInformation, { foreignKey: 'therapistId', as: 'contactInformations' });


  // Therapist and User
  Therapist.belongsTo(User, { foreignKey: "userId" });
  User.hasMany(Therapist, { foreignKey: "userId" });

  // Un terapeuta tiene muchos usuarios
  Therapist.hasMany(User, { foreignKey: 'therapistId', as: 'users' });
  
  // Un usuario pertenece a un terapeuta
  User.belongsTo(Therapist, { foreignKey: 'therapistId', as: 'therapist' });

  // TherapistQuestionnaire and User
  TherapistQuestionnaire.belongsTo(User, { foreignKey: 'userId', as: 'therapist' });

  // Speciality and Therapist
  Speciality.belongsToMany(Therapist, { 
    through: 'TherapistSpeciality',
    foreignKey: 'specialityId',
    otherKey: 'therapistId',
});
  Therapist.belongsToMany(Speciality, { 
    through: 'TherapistSpeciality',
    foreignKey: 'therapistId',
    otherKey: 'specialityId',
 });

  // Schedule and Therapist
  Schedule.belongsTo(Therapist, { foreignKey: 'therapistId' });
  Therapist.hasMany(Schedule, { foreignKey: 'therapistId' });

  //Plan and User
  User.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

  // PaymentMethod and User
  PaymentMethod.belongsTo(User, { foreignKey: 'userId' });
  User.hasOne(PaymentMethod, { foreignKey: 'userId' });

  // PaymentMethod and Plan
  PaymentMethod.belongsTo(Plan, { foreignKey: 'planId' });
  Plan.hasOne(PaymentMethod, { foreignKey: 'planId' });

  // IndividualQuestionnaire and User
  IndividualQuestionnaire.belongsTo(User, { foreignKey: 'userId' });

  // Document and Therapist
  Document.belongsTo(Therapist, { foreignKey: 'therapistId' });
  Therapist.hasMany(Document, { foreignKey: 'therapistId' });

  // Blog and Therapist
  Blog.belongsTo(Therapist, { foreignKey: 'therapistId' });
  Therapist.hasMany(Blog, { foreignKey: 'therapistId' });

  FavoriteBlog.belongsTo(User, { foreignKey: "userId" });
  User.hasMany(FavoriteBlog, { foreignKey: "userId" });

  FavoriteBlog.belongsTo(Blog, { foreignKey: "blogId" });
  Blog.hasMany(FavoriteBlog, { foreignKey: "blogId" });

  FavoriteTip.belongsTo(User, { foreignKey: "userId" });
  User.hasMany(FavoriteTip, { foreignKey: "userId" });

  FavoriteTip.belongsTo(Tip, { foreignKey: "tipId" });
  Tip.hasMany(FavoriteTip, { foreignKey: "tipId" });

  Tip.belongsTo(Therapist, { foreignKey: "therapistId" });
  Therapist.hasMany(Tip, { foreignKey: "therapistId" });

  Appointment.belongsTo(Therapist, { foreignKey: 'therapistId', as: 'therapist' });
  Therapist.hasMany(Appointment, { foreignKey: 'therapistId', as: 'appointments' });

  Appointment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasMany(Appointment, { foreignKey: 'userId', as: 'appointments' });

  Therapist.belongsTo(User, { foreignKey: "userId" });
  User.hasMany(Therapist, { foreignKey: "userId" });

  // Asociación Paciente - Chat (Uno a Uno)
  User.hasOne(Chat, { foreignKey: 'userId', as: 'chat' });
  Chat.belongsTo(User, { foreignKey: 'userId', as: 'patient' });

  // Asociación Terapeuta - Chat (Uno a Muchos)
  Therapist.hasMany(Chat, { foreignKey: 'therapistId', as: 'chats' });
  Chat.belongsTo(Therapist, { foreignKey: 'therapistId', as: 'therapist' });

  // Asociación Chat - Mensajes (Uno a Muchos)
  Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages' });
  Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });

  // Asociación Sender - Message (Uno a Muchos)
  Sender.hasMany(Message, { foreignKey: 'senderId', as: 'messages' });
  Message.belongsTo(Sender, { foreignKey: 'senderId', as: 'sender' });

  // Asociación User - Sender (Uno a Uno)
  User.hasOne(Sender, {
    foreignKey: 'userId',
    as: 'sender',
  });
  Sender.belongsTo(User, {
    foreignKey: 'userId',
    as: 'patient',
  });

  // Asociación Therapist - Sender (Uno a Uno)
  Therapist.hasOne(Sender, {
    foreignKey: 'therapistId',
    as: 'sender',
  });
  Sender.belongsTo(Therapist, {
    foreignKey: 'therapistId',
    as: 'therapist',
  });

  // Asociación Message - StarredMessage (Uno a Muchos)
  Message.hasMany(StarredMessage, { foreignKey: 'messageId', as: 'starredBy' });
  StarredMessage.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });

  // Asociación Sender - StarredMessage (Uno a Muchos)
  Sender.hasMany(StarredMessage, { foreignKey: 'senderId', as: 'starredMessages' });
  StarredMessage.belongsTo(Sender, { foreignKey: 'senderId', as: 'originalSender' });
  

  // Asociación Sender - StarredMessage (Uno a Muchos)
  Sender.hasMany(StarredMessage, { foreignKey: 'starredBySenderId', as: 'starredBySenderId' });
  StarredMessage.belongsTo(Sender, { foreignKey: 'starredBySenderId', as: 'userWhoStarred' });

  // Asociación Chat - StarredMessage (Uno a Muchos)
  Chat.hasMany(StarredMessage, { foreignKey: 'chatId', as: 'starredMessages' });
  StarredMessage.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });

}
