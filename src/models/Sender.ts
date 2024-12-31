import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import { Therapist } from './Therapist';
interface SenderAttributes {
  id: number;
  type: 'patient' | 'therapist';
  userId?: number;
  therapistId?: number;
}

//Sender model
interface SenderCreationAttributes extends Optional<SenderAttributes, 'id'> {}

class Sender extends Model<SenderAttributes, SenderCreationAttributes> implements SenderAttributes {
  public id!: number;
  public type!: 'patient' | 'therapist';
  public userId?: number;
  public therapistId?: number;

  // Asociaciones
  public readonly user?: User;
  public readonly therapist?: Therapist;
}

Sender.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('patient', 'therapist'),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'userId',
      },
      unique: true, // Un Sender está asociado a un único User o Therapist
    },
    therapistId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Therapist,
        key: 'therapistId',
      },
      unique: true, // Un Sender está asociado a un único User o Therapist
    },
  },
  {
    sequelize,
    tableName: 'senders',
    timestamps: false,
    validate: {
      eitherUserOrTherapist() {
        if (
          (this.userId && this.therapistId) ||
          (!this.userId && !this.therapistId)
        ) {
          throw new Error(
            'Sender debe estar asociado a un User o un Therapist, pero no ambos.'
          );
        }
      },
    },
  }
);

export default Sender;
