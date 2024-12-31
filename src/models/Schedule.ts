import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Therapist } from './';

export class Schedule extends Model {
    public scheduleId!: number;
    public therapistId!: number;
    public weekDay!: string;
    public startHour!: string;
    public endHour!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Schedule.init( {
    scheduleId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    therapistId: {
        type: DataTypes.INTEGER,
        references: {
          model: Therapist,
          key: 'therapistId'
        }
    },
    weekDay: {
      type: DataTypes.STRING
    },
    startHour: {
      type: DataTypes.STRING
    },
    endHour: {
      type: DataTypes.STRING
      }
    
  },{
    sequelize,
    tableName: "schedule",
    }
);