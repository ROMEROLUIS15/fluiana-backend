import { Model, DataTypes, Optional  } from 'sequelize';
import sequelize from '../config/database';
import { User } from './User';
import { Therapist } from './Therapist';
import {Message} from './Message';

interface ChatAttributes {
  id: number;
  userId: number;
  therapistId: number;
  status: 'active' | 'closed';
  createdAt?: Date;
  updatedAt?: Date;
}

//Chat Model
interface ChatCreationAttributes extends Optional<ChatAttributes, 'id' | 'status'> {}

class Chat extends Model<ChatAttributes, ChatCreationAttributes> implements ChatAttributes {
  public id!: number;
  public userId!: number;
  public therapistId!: number;
  public status!: 'active' | 'closed';
  
  // Asociaciones
  public readonly user?: User;
  public readonly therapist?: Therapist;
  public readonly messages?: Message[];
}

Chat.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'userId',
      },
      unique: true, // Asegura un solo chat activo por paciente
    },
    therapistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Therapist,
        key: 'therapistId',
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'closed'),
      allowNull: false,
      defaultValue: 'active',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'chats',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId'],
        where: {
          status: 'active',
        },
      },
    ],
  }
);

export default Chat;
