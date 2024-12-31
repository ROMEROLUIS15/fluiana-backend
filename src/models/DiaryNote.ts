import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { User } from './User';

export class DiaryNote extends Model {
    public noteId!: number;
    public userId!: number;
    public title!: string;
    public content!: string;
    public date!: Date;
    public reminder?: Date;
    public sharedWith!: number[];

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

DiaryNote.init({
    noteId: {
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
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    reminder: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    sharedWith: {
        type: DataTypes.JSON,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: 'diary_notes',
});

export default DiaryNote;
