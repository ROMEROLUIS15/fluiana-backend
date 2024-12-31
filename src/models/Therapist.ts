import { Model, DataTypes } from "sequelize";
import  sequelize  from "../config/database";
import { Speciality } from "./Speciality";
import { User } from "./User";

export class Therapist extends Model {
    public therapistId!: number;
    public userId!: number;
    public registrationNum!: string;
    public speciality!: string;
    public aboutme!: string;
    public phrase!: string;
    public status!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public addSpeciality!: (speciality: Speciality) => Promise<void>;
}

Therapist.init({
    therapistId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "userId",
        },
    },
    registrationNum: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    aboutme: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phrase: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'pending'
    }
    },{
    sequelize,
    modelName: 'Therapist',
    tableName: 'therapists',
    timestamps: true,
    }
);

