import { Request, Response } from 'express';
import { TherapistQuestionnaire } from '../models/TherapistQuestionnaire';
import { IndividualQuestionnaire } from '../models/IndividualQuestionnaire';
import { TherapistQuestionnaireResponse } from '../models/TherapistQuestionnaireResponse';
import { QuestionResponse } from '../models/IndividualQuestionnaireResponses';
import catchError from '../middlewares/catchError';

class QuestionnaireController {
    // Get all therapist questionnaire responses
    public getTherapistQuestionnaireResponses = catchError(async (req: Request, res: Response): Promise<void> => {
        try {
            const responses = await TherapistQuestionnaireResponse.findAll({
                attributes: ['responseId', 'therapistId', 'questionnaireId', 'responses', 'createdAt', 'updatedAt']
            });

            res.status(200).json({
                ok: true,
                data: responses,
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: 'Failed to fetch therapist questionnaire responses',
                error: error,
            });
        }
    });

    // Get therapist questionnaire response by ID
    public getTherapistQuestionnaireResponseById = catchError(async (req: Request, res: Response): Promise<void> => {
        try {
            const { responseId } = req.params;
            const response = await TherapistQuestionnaireResponse.findByPk(responseId);

            if (!response) {
                res.status(404).json({
                    ok: false,
                    message: 'Therapist questionnaire response not found'
                });
                return;
            }

            res.status(200).json({
                ok: true,
                data: response,
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: 'Failed to fetch therapist questionnaire response',
                error: error,
            });
        }
    });

    // Get all individual questionnaire responses
    public getIndividualQuestionnaireResponses = catchError(async (req: Request, res: Response): Promise<void> => {
        try {
            const responses = await QuestionResponse.findAll({
                attributes: ['responseId', 'userId', 'questionnaireId', 'responses', 'createdAt', 'updatedAt']
            });

            res.status(200).json({
                ok: true,
                data: responses,
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: 'Failed to fetch individual questionnaire responses',
                error: error,
            });
        }
    });

    // Get individual questionnaire response by ID
    public getIndividualQuestionnaireResponseById = catchError(async (req: Request, res: Response): Promise<void> => {
        try {
            const { responseId } = req.params;
            const response = await QuestionResponse.findByPk(responseId);

            if (!response) {
                res.status(404).json({
                    ok: false,
                    message: 'Individual questionnaire response not found'
                });
                return;
            }

            res.status(200).json({
                ok: true,
                data: response,
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: 'Failed to fetch individual questionnaire response',
                error: error,
            });
        }
    });

    // Get all therapist questionnaires
    public getTherapistQuestionnaires = catchError(async (req: Request, res: Response): Promise<void> => {
        try {
            const questionnaires = await TherapistQuestionnaire.findAll({
                attributes: ['questionnaireId', 'title', 'type', 'questions', 'createdAt', 'updatedAt']
            });

            res.status(200).json({
                ok: true,
                data: questionnaires,
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: 'Failed to fetch therapist questionnaires',
                error: error,
            });
        }
    });

    // Get therapist questionnaire by ID
    public getTherapistQuestionnaireById = catchError(async (req: Request, res: Response): Promise<void> => {
        try {
            const { questionnaireId } = req.params;
            const questionnaire = await TherapistQuestionnaire.findByPk(questionnaireId);

            if (!questionnaire) {
                res.status(404).json({
                    ok: false,
                    message: 'Therapist questionnaire not found'
                });
                return;
            }

            res.status(200).json({
                ok: true,
                data: questionnaire,
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: 'Failed to fetch therapist questionnaire',
                error: error,
            });
        }
    });

    // Get all individual questionnaires
    public getIndividualQuestionnaires = catchError(async (req: Request, res: Response): Promise<void> => {
        try {
            const questionnaires = await IndividualQuestionnaire.findAll({
                attributes: ['questionnaireId', 'title', 'type', 'questions', 'createdAt', 'updatedAt', 'userId']
            });

            res.status(200).json({
                ok: true,
                data: questionnaires,
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: 'Failed to fetch questionnaires',
                error: error,
            });
        }
    });

    // Get individual questionnaire by ID
    public getIndividualQuestionnaireById = catchError(async (req: Request, res: Response): Promise<void> => {
        try {
            const { questionnaireId } = req.params;
            const questionnaire = await IndividualQuestionnaire.findByPk(questionnaireId);

            if (!questionnaire) {
                res.status(404).json({
                    ok: false,
                    message: 'Individual questionnaire not found',
                });
                return;
            }

            res.status(200).json({
                ok: true,
                data: questionnaire,
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: 'Failed to fetch individual questionnaire',
                error: error,
            });
        }
    })
    // Create therapist questionnaire
    public createTherapistQuestionnaire = catchError(async (req: Request, res: Response): Promise<void> => {
        try {
            const { title, type, questions } = req.body;

            const questionnaire = await TherapistQuestionnaire.create({
                title,
                type,
                questions
            });

            res.status(201).json({
                ok: true,
                data: questionnaire,
                message: 'Therapist questionnaire created successfully'
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: 'Failed to create therapist questionnaire',
                error: error,
            });
        }
    });

    // Create individual questionnaire
    public createIndividualQuestionnaire = catchError(async (req: Request, res: Response): Promise<void> => {
        try {
            const { title, type, questions } = req.body;

            const questionnaire = await IndividualQuestionnaire.create({
                title,
                type,
                questions
            });

            res.status(201).json({
                ok: true,
                data: questionnaire,
                message: 'Individual questionnaire created successfully'
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: 'Failed to create individual questionnaire',
                error: error,
            });
        }
    });

    // Create therapist questionnaire response
    public createTherapistQuestionnaireResponse = catchError(async (req: Request, res: Response): Promise<void> => {
        try {
            const { therapistId, questionnaireId, responses } = req.body;

            // Validate that the questionnaire exists
            const questionnaire = await TherapistQuestionnaire.findByPk(questionnaireId);
            if (!questionnaire) {
                res.status(404).json({
                    ok: false,
                    message: 'Therapist questionnaire not found'
                });
                return;
            }

            const response = await TherapistQuestionnaireResponse.create({
                therapistId,
                questionnaireId,
                responses
            });

            res.status(201).json({
                ok: true,
                data: response,
                message: 'Therapist questionnaire response created successfully'
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: 'Failed to create therapist questionnaire response',
                error: error,
            });
        }
    });

    // Create individual questionnaire response
    public createIndividualQuestionnaireResponse = catchError(async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId, questionnaireId, responses } = req.body;

            // Validate that the questionnaire exists
            const questionnaire = await IndividualQuestionnaire.findByPk(questionnaireId);
            if (!questionnaire) {
                res.status(404).json({
                    ok: false,
                    message: 'Individual questionnaire not found'
                });
                return;
            }

            const response = await QuestionResponse.create({
                userId,
                questionnaireId,
                responses
            });

            res.status(201).json({
                ok: true,
                data: response,
                message: 'Individual questionnaire response created successfully'
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: 'Failed to create individual questionnaire response',
                error: error,
            });
        }
    });
}

export default new QuestionnaireController();