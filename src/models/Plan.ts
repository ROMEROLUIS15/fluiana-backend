// import { Model, DataTypes } from 'sequelize';
// import sequelize from '../config/database';

// export class Plan extends Model {
//     public planId!: number;
//     public namePlan!: string;
//     public description!: string;
//     public amount!: number;
//     public type!: number;

//     public readonly createdAt!: Date;
//     public readonly updatedAt!: Date;
// }

// Plan.init({
//     planId: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     namePlan: DataTypes.STRING,
//     description: DataTypes.STRING,
//     amount: DataTypes.FLOAT,
//     type: DataTypes.STRING,
// }, {
//     sequelize,
//     modelName: 'Plan',
//     tableName: "plans",
// });

import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class Plan extends Model {
    public planId!: number;
    public namePlan!: string;
    public description!: string;
    public amount!: number;
    public publico!: string;
    public individualSessions!: string;
    public groupSessions!: string;
    public type!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Plan.init({
    planId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    namePlan: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "The plan name cannot be empty."
            }
        }
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "The description cannot be empty."
            }
        }
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            isFloat: {
                msg: "The amount must be a floating point number."
            },
            min: {
                args: [0.01],
                msg: "The amount must be greater than zero."
            }
        }
    },
  
    
    publico: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    individualSessions: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    groupSessions: {
        type: DataTypes.STRING,
        allowNull: false
    }

}, {
    sequelize,
    modelName: 'Plan',
    tableName: 'plans',
});

export default Plan;
