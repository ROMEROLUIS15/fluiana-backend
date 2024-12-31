import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class IndividualQuestionnaire extends Model {
  public questionnaireId!: number;
  public title!: string;
  public type!: string;
  public questions!: Question[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

interface Option {
  id: number;
  optionText: string;
}

interface Question {
  id: number;
  questionText: string;
  type: 'multiple-choice' | 'text';
  options?: Option[];
}

IndividualQuestionnaire.init(
  {
    questionnaireId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Title cannot be empty' },
        len: [1, 255] // Reasonable length constraint
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['survey', 'assessment', 'feedback']] // Example of restricting type values
      }
    },
    questions: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidQuestions(value: Question[]) {
          if (!Array.isArray(value)) {
            throw new Error('Questions must be an array of objects.');
          }

          // Comprehensive validation for questions
          value.forEach((question) => {
            if (!question.id || typeof question.id !== 'number') {
              throw new Error('Each question must have a numeric id.');
            }

            if (!question.questionText || typeof question.questionText !== 'string') {
              throw new Error('Each question must have a non-empty question text.');
            }

            if (!['multiple-choice', 'text'].includes(question.type)) {
              throw new Error('Question type must be either "multiple-choice" or "text".');
            }

            // Validate multiple-choice specific requirements
            if (question.type === 'multiple-choice') {
              if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
                throw new Error('Multiple-choice questions must have at least one option.');
              }

              question.options.forEach((option) => {
                if (!option.id || typeof option.id !== 'number') {
                  throw new Error('Each option must have a numeric id.');
                }
                if (!option.optionText || typeof option.optionText !== 'string') {
                  throw new Error('Each option must have a non-empty option text.');
                }
              });
            }
          });
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'IndividualQuestionnaire',
    tableName: 'individual_questionnaires',
    // Optional: Add scopes for common queries
    defaultScope: {
      attributes: { exclude: ['questions'] }, // Optionally exclude large JSON field by default
    },
  }
);

export default IndividualQuestionnaire;