// import { Router } from 'express';
// import NoteSharingController from '../controllers/NoteSharingController';
// import catchError from '../middlewares/catchError';
// import validateToken from '../middlewares/authenticate';
// import { validateShareNote, validateUpdateNoteSharing } from '../middlewares/validatorsNotes';

// const router = Router();

// // Aplicar middleware de autenticación a todas las rutas
// router.use(validateToken);

// // Crear una nueva compartición de nota
// router.post('/share', validateShareNote, catchError(NoteSharingController.shareNote));

// // Obtener notas compartidas con un usuario
// router.get('/shared-notes/users/:userId', catchError(NoteSharingController.getSharedNotes));

// // Obtener notas compartidas con un terapeuta
// router.get('/shared-notes/therapists/:therapistId', catchError(NoteSharingController.getSharedNotes));

// // Actualizar la compartición de una nota
// router.put('/share/:shareId', validateUpdateNoteSharing, catchError(NoteSharingController.updateNoteSharing));

// // Eliminar la compartición de una nota
// //router.delete('/share/:shareId', catchError(NoteSharingController.unshareNote));

// export default router;

import { Router } from 'express';
import NoteSharingController from '../controllers/NoteSharingController';
import catchError from '../middlewares/catchError';
import validateToken from '../middlewares/authenticate';
import { validateShareNote, validateUpdateNoteSharing } from '../middlewares/validatorsNotes';

const router = Router();

// Apply authentication middleware to all routes
router.use(validateToken);

// Create a new note sharing
router.post('/share', validateShareNote, catchError(NoteSharingController.shareNote));

// Get notes shared with a user
router.get('/shared-notes/users/:userId', catchError(NoteSharingController.getSharedNotes));

// Get notes shared with a therapist
router.get('/shared-notes/therapists/:therapistId', catchError(NoteSharingController.getSharedNotes));

// Update the sharing of a note
router.put('/share/:shareId', validateUpdateNoteSharing, catchError(NoteSharingController.updateNoteSharing));

// Delete the sharing of a note
//router.delete('/share/:shareId', catchError(NoteSharingController.unshareNote));

export default router;