import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import { Therapist } from './Therapist';

export class SessionChannel extends Model {
    public sessionChanelId!: number;
    public userId!: number;
    public dateSession!: Date;
    public hourSession!: string;
    public media!: string;
    public nameTheme!: string;
    public channelName!: string;
    public therapistId!: number;
    public uid!: string;
    public role?: string;
    public privilegeExpireTime?: string;
    public token?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SessionChannel.init(
    {
        sessionChanelId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'userId',
            },
        },
        dateSession: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        hourSession: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        media: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nameTheme: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        therapistId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Therapist,
                key: 'therapistId',
            },
        },
        channelName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        uid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        privilegeExpireTime: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        token: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    },
    {
        sequelize,
        modelName: 'SessionChannel',
        tableName: 'sessionchannel',
        timestamps: true,
    }
)