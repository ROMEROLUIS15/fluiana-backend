import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Therapist } from './';

export class Document extends Model {
    public documentId!: number;
    public userId!: number;
    public typeDocument!: string;
    public name!: string;
    public formatDocument!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Document.init( {
    documentId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    typeDocument: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    },
    formatDocument: {
      type: DataTypes.STRING
    },
    therapistId: {
      type: DataTypes.INTEGER,
      references: {
        model: Therapist,
        key: 'therapistId'
      }
    }
  },{
    sequelize,
    tableName: "document",
    }
);
  