import { Router } from 'express';
import NoteTemplateController from '../controllers/NoteTemplateController';
import catchError from '../middlewares/catchError';
import validateToken from '../middlewares/authenticate';

const router = Router();

router.post('/', catchError(NoteTemplateController.createNoteTemplate));

router.get('/', catchError(NoteTemplateController.getNoteTemplates));

router.get('/:templateId', catchError(NoteTemplateController.getNoteTemplateById));

router.put('/note-templates/:templateId', catchError(NoteTemplateController.updateNoteTemplate));

router.delete('/note-templates/:templateId', catchError(NoteTemplateController.deleteNoteTemplate));

export default router;
