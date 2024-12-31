import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import { Tip } from './Tip';

export class FavoriteTip extends Model {
    public favoriteTipId!: number;
    public userId!: number;
    public tipId!: number;
    public isFavorite!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

FavoriteTip.init({
    favoriteTipId: {
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
    tipId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Tip,
            key: "tipId",
        },
    },
    isFavorite: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    }
}, {
    sequelize,
    modelName: 'FavoriteTip',
    tableName: "favoritesTips",
});