import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import { Plan } from './Plan';

export class PaymentMethod extends Model {
    public paymentMethodId!: number;
    public userId!: number;
    public cardNumber!: string;
    public nameHolder!: string;
    public expirationDate!: string;
    public securityCode!: string;
    public planId!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

PaymentMethod.init( {
    documentId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
          model: User,
          key: 'userId'
        }
    },
    cardNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    nameHolder: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    expirationDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    securityCode: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    planId: {
        type: DataTypes.INTEGER,
        references: {
          model: Plan,
          key: 'planId'
        }
    }
},
{
    sequelize,
    modelName: 'PaymentMethod',
    tableName: "paymentMethods",
});