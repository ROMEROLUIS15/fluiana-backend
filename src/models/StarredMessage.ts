import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Sender from './Sender';
import { Message } from './Message';
import Chat from './Chat';

interface StarredMessageAttributes {
  id?: number;
  chatId: number;
  messageId: number;
  senderId: number;
  starredBySenderId: number;
  content: string,
  createdAt?: Date;
}

class StarredMessage extends Model<StarredMessageAttributes> implements StarredMessageAttributes {
  public id!: number;
  public chatId!: number;
  public messageId!: number;
  public senderId!: number;
  public starredBySenderId!: number;
  public content! : string;

  // Asociaciones
  public readonly message?: Message;
  public readonly sender?: Sender;
  public readonly chat?: Chat;
}

StarredMessage.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    messageId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'messages',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    senderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'senders',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    starredBySenderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'senders',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    content: {
        type: DataTypes.TEXT, // Campo adicional para guardar el contenido
        allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    chatId: { // Identificar el chat específico
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: "chats",
            key: "id"
        },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  },
  {
    sequelize,
    tableName: 'starred_messages',
    timestamps: false,
  }
);

export { StarredMessage };
