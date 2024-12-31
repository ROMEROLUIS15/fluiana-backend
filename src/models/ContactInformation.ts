import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Therapist } from './Therapist';

export class ContactInformation extends Model {
    public contactInfoId!: number;
    public therapistId!: number;
    public description!: string;

}



ContactInformation.init({
    contactInfoId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Add fields for contact information here
    therapistId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Therapist,
          key: 'therapistId'
        }
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'ContactInformation',
    tableName: "contactInformations",
});