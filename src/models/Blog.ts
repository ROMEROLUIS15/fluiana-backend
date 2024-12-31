import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Therapist } from './Therapist';

export class Blog extends Model {
    public blogId!: number;
    public therapistId!: number;
    public title!: string;
    public content!: string;
    public category?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Blog.init(
    {
        blogId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        therapistId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Therapist,
                key: 'therapistId',
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
        category: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'blogs',
    }
);


