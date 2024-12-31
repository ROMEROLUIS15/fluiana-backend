import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { TherapistQuestionnaire } from './TherapistQuestionnaire'; // Importing the therapist questionnaire model

// Define the structure of a response
export interface QuestionResponseData {
    questionId: number;
    responseText?: string;
    selectedOptionIds?: number[];
}

export class TherapistQuestionnaireResponse extends Model {
    public responseId!: number;
    public therapistId!: string;
    public questionnaireId!: number;
    public responses!: QuestionResponseData[];
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

TherapistQuestionnaireResponse.init(
    {
        responseId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        therapistId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Therapist ID cannot be empty' },
            },
        },
        questionnaireId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'therapist_questionnaires',
                key: 'questionnaireId',
            },
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
                        if (!response.questionId || typeof response.questionId !== 'number') {
                            throw new Error('Each response must have a numeric questionId.');
                        }

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
        modelName: 'TherapistQuestionnaireResponse',
        tableName: 'therapist_questionnaire_responses',

        // Optional: Add hooks or indexes
        hooks: {
            beforeValidate: (instance: TherapistQuestionnaireResponse) => {
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

        // Add an index on therapistId and questionnaireId for faster querying
        indexes: [
            {
                fields: ['therapistId', 'questionnaireId'],
            },
        ],
    }
);

// Set up associations
TherapistQuestionnaireResponse.belongsTo(TherapistQuestionnaire, {
    foreignKey: 'questionnaireId',
    as: 'questionnaire',
});

TherapistQuestionnaire.hasMany(TherapistQuestionnaireResponse, {
    foreignKey: 'questionnaireId',
    as: 'responses',
});

export default TherapistQuestionnaireResponse;
