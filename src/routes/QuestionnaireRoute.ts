import { Router } from 'express';
import QuestionnaireController from '../controllers/QuestionnaireController';

const router = Router();

// Therapist questionnaire responses routes
router.get('/therapist-questionnaire-responses', QuestionnaireController.getTherapistQuestionnaireResponses);
router.get('/therapist-questionnaire-responses/:responseId', QuestionnaireController.getTherapistQuestionnaireResponseById);
router.post('/therapist-questionnaire-responses', QuestionnaireController.createTherapistQuestionnaireResponse);

// Individual questionnaire responses routes
router.get('/individual-questionnaire-responses', QuestionnaireController.getIndividualQuestionnaireResponses);
router.get('/individual-questionnaire-responses/:responseId', QuestionnaireController.getIndividualQuestionnaireResponseById);
router.post('/individual-questionnaire-responses', QuestionnaireController.createIndividualQuestionnaireResponse);

// Therapist questionnaires routes
router.get('/therapist-questionnaire', QuestionnaireController.getTherapistQuestionnaires);
router.get('/therapist-questionnaire/:questionnaireId', QuestionnaireController.getTherapistQuestionnaireById);
router.post('/therapist-questionnaire', QuestionnaireController.createTherapistQuestionnaire);

// Individual questionnaires routes
router.get('/individual-questionnaire', QuestionnaireController.getIndividualQuestionnaires);
router.get('/individual-questionnaire/:questionnaireId', QuestionnaireController.getIndividualQuestionnaireById);
router.post('/individual-questionnaire', QuestionnaireController.createIndividualQuestionnaire);

export default router;