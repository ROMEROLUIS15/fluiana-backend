import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Therapist } from './Therapist';
import User from './User';

export class Appointment extends Model {
  public appointmentId!: number;
  public therapistId!: number;
  public userId?: number;
  public startTime!: Date;
  public endTime!: Date;
  public status!: 'available' | 'reserved' | 'confirmed' | 'cancelled';
  public notes?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Appointment.init(
  {
    appointmentId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    therapistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
          model: Therapist,
          key: 'therapistId',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'userId',
      },
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('available', 'reserved', 'confirmed', 'cancelled'),
      allowNull: false,
      defaultValue: 'available',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'appointments',
  }
);