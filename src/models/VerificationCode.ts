import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class VerificationCode extends Model {
    public id!: number;
    public email!: string;
    public code!: string;
    public createdAt!: Date;
    public isVerified!: boolean;
}

VerificationCode.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'verification_codes',
        timestamps: false, // Disable automatic timestamps
    }
);


export default VerificationCode;
