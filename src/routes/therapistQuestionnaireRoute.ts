import express from 'express';
import TherapistQuestionnaireController from '../controllers/TherapistQuestionnaireController';
import validateToken from '../middlewares/authenticate';
import catchError from '../middlewares/catchError';

const router = express.Router();

router.post('/', catchError(TherapistQuestionnaireController.createTherapistQuestionnaire));

router.get('/:id', catchError(TherapistQuestionnaireController.getTherapistQuestionnaireById));

router.put('/:id', catchError(TherapistQuestionnaireController.updateTherapistQuestionnaire));

router.delete('/:id', catchError(TherapistQuestionnaireController.deleteTherapistQuestionnaire));

export default router;
