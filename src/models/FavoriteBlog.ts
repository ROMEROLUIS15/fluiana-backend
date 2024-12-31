import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import { Blog } from './Blog';

export class FavoriteBlog extends Model {
    public favoriteBlogId!: number;
    public userId!: number;
    public blogId!: number;
    public isFavorite!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

FavoriteBlog.init({
    favoriteBlogId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "userId",
        },
    },
    blogId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Blog,
            key: "blogId",
        },
    },
    isFavorite: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    }
}, {
    sequelize,
    modelName: 'FavoriteBlog',
    tableName: "favoritesBlogs",
});
