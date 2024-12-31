import { Router } from 'express';
import DiaryNoteController from '../controllers/DiaryNoteController'
import validateToken from '../middlewares/authenticate';
import catchError from '../middlewares/catchError';

const router = Router();

router.post('/', 
    // validateToken,
     DiaryNoteController.createDiaryNote);

router.get('/', validateToken, DiaryNoteController.getDiaryNotes);

router.get('/user-diary/:userId', catchError(DiaryNoteController.getDiaryByUser)) 

router.get('/:noteId', validateToken, DiaryNoteController.getDiaryNoteById); 

router.put('/diary-notes/:noteId', DiaryNoteController.updateDiaryNote);

router.delete('/diary-notes/:noteId', validateToken, DiaryNoteController.deleteDiaryNote);
 
export default router;
