import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { IndividualQuestionnaire } from './IndividualQuestionnaire'; // Importing the questionnaire model for association

// Define the structure of a response
export interface QuestionResponseData {
    questionId: number;
    responseText?: string;
    selectedOptionIds?: number[];
}

export class QuestionResponse extends Model {
    public responseId!: number;
    public userId!: string;
    public questionnaireId!: number;
    public responses!: QuestionResponseData[];
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

QuestionResponse.init(
    {
        responseId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'User ID cannot be empty' }
            }
        },
        questionnaireId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'individual_questionnaires',
                key: 'questionnaireId'
            }
        },
        responses: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                isValidResponses(value: QuestionResponseData[]) {
                    if (!Array.isArray(value)) {
                        throw new Error('Responses must be an array of objects.');
                    }

                    value.forEach((response) => {
                        // Validate that each response has a questionId
                        if (!response.questionId || typeof response.questionId !== 'number') {
                            throw new Error('Each response must have a numeric questionId.');
                        }

                        // Ensure either responseText or selectedOptionIds is provided
                        if (
                            (!response.responseText || typeof response.responseText !== 'string') &&
                            (!response.selectedOptionIds || !Array.isArray(response.selectedOptionIds))
                        ) {
                            throw new Error('Each response must have either a text response or selected option(s).');
                        }

                        // If selectedOptionIds is provided, validate it
                        if (response.selectedOptionIds) {
                            if (!response.selectedOptionIds.every(id => typeof id === 'number')) {
                                throw new Error('Selected option IDs must be numeric.');
                            }
                        }
                    });
                },
            },
        },
    },
    {
        sequelize,
        modelName: 'IndividualQuestionResponse',
        tableName: 'individual_questionnaire_responses',

        // Optional: Add hooks or indexes
        hooks: {
            beforeValidate: (instance: QuestionResponse) => {
                // Optional: Add any pre-validation logic
                if (instance.responses) {
                    // Ensure responses are unique per question within the response
                    const uniqueQuestionIds = new Set(instance.responses.map(r => r.questionId));
                    if (uniqueQuestionIds.size !== instance.responses.length) {
                        throw new Error('Duplicate question responses are not allowed.');
                    }
                }
            }
        },

        // Add an index on userId and questionnaireId for faster querying
        indexes: [
            {
                fields: ['userId', 'questionnaireId']
            }
        ]
    }
);

// Set up associations
QuestionResponse.belongsTo(IndividualQuestionnaire, {
    foreignKey: 'questionnaireId',
    as: 'questionnaire'
});

IndividualQuestionnaire.hasMany(QuestionResponse, {
    foreignKey: 'questionnaireId',
    as: 'responses'
});

export default QuestionResponse;