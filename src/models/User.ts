import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';
import bcryptjs from 'bcryptjs';
import { defaultValueSchemable } from 'sequelize/types/utils'
import { Therapist } from './Therapist';
import { Plan } from './Plan'


export class User extends Model {
  public userId!: number;
  public assignedTherapeutId!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public gender!: string;
  public birthday!: Date;
  public location!: string;
  public phone!: string;
  public role!: 'patient' | 'admin' | 'therapist';
  public userImage!: string;
  public googleId?: string;
  public suspension?: boolean;
  public reasonSuspension?: string;
  public suspensionTime?: string;
  public suspensionDate?: Date;
  public status!: 'pending' | 'active' | 'suspended' | 'unsubscribed' | 'cancelled';
  public adminToken?: string;
  public lastProfileUpdate!: Date;
  public mercadoPagoEmail?: string; // New field
  public planId?: number | null
  public startDate?: Date;
  public cancelDate?: Date | null;
  public plan?: any
  public subscriptionId?: string | null

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    assignedTherapeutId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Therapist,
        key: 'therapistId',
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('patient', 'admin', 'therapist'),
      allowNull: false,
      defaultValue: 'patient',
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },

    suspension: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    reasonSuspension: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    suspensionTime: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    suspensionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'unsubscribed', 'suspended', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    adminToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastProfileUpdate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Plan,
        key: 'planId'
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    cancelDate : {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    mercadoPagoEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    subscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    }
  },
  {
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await bcryptjs.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password') && user.password) {
          user.password = await bcryptjs.hash(user.password, 10);
        }
      },
    },
    sequelize,
    modelName: 'User',
    tableName: 'users',
  }
);

export default User;