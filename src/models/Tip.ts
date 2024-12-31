import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Therapist } from './Therapist';

export class Tip extends Model {
    public tipId!: number;
    public therapistId!: number;
    public title!: string;
    public subTitle!: string;
    public description!: string;
    public tipImage!: string

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Tip.init({
    tipId: {
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
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subTitle: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tipImage: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Tip',
    tableName: "tips",
});