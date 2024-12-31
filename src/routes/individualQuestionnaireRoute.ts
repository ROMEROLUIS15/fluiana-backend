import express from 'express';
import IndividualQuestionnaireController from '../controllers/IndividualQuestionnaireController';
import validateToken from '../middlewares/authenticate';
import catchError from '../middlewares/catchError';

const router = express.Router();

router.post('/', catchError(IndividualQuestionnaireController.createQuestionnaire));

router.get('/:id', catchError(IndividualQuestionnaireController.getQuestionnaireById));

export default router;