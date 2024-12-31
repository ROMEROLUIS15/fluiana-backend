import { DataTypes, Model } from "sequelize";
import  sequelize  from '../config/database';
import { Therapist } from "./Therapist";

export class Speciality extends Model {
    public specialityId!: number;
    // public therapistId!: number;
    public speciality!: string;
}

Speciality.init({
    specialityId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // therapistId: {
    //     type: DataTypes.INTEGER,
    //     references: {
    //         model: Therapist,
    //         key: 'therapistId'
    //     },
    // },
    speciality: {
        type: DataTypes.STRING,
    },
 }, {
    sequelize,
    modelName:'Speciality',
    tableName:'speciality',
 });
 