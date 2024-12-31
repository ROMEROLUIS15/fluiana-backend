import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { User } from './User';

export class NoteTemplate extends Model {
    public templateId!: number;
    public userId!: number;
    public title!: string;
    public content!: string;
    public reminder?: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

NoteTemplate.init({
    templateId: {
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
    reminder: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: 'note_templates',
});

export default NoteTemplate;
