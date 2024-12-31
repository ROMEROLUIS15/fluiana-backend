import express from 'express';
import TherapistController from '../controllers/TherapistController';
// import authMiddleware from '../middlewares/authenticate';
import { fieldValidator } from '../middlewares';
import { body } from 'express-validator';
import multer from 'multer';
import { storage } from '../config/multerConfig';
import { storageTherapistImg } from '../config/therapistImageUpload';
import catchError from '../middlewares/catchError';

const multiparty = require('connect-multiparty');

const router = express.Router();
const upload = multer({ storage: storageTherapistImg });

const therapistImg = multiparty({uploadDir: 'src/uploads/therapist'});

router.post('/create-therapist', 
    upload.fields([{ name: 'certificates', maxCount: 2 }, { name: 'document', maxCount: 1 }]),[
    body("username", "El nombre es obligatorio").notEmpty().isString(),
    body("email", "El email es obligatorio").notEmpty().isString(),
    body("password", "La contraseña es obligatoria").isLength({
      min: 8,
    }).isString(),
    body("gender", "El genero es obligatorio").notEmpty().isString(),
    body("birthday", "El cumpleaños es obligatorio").notEmpty().isDate(),
    body("location", "La localidad es obligatoria").isString().notEmpty(),
    body("phone", "El numero celular es obligatorio").isString().notEmpty(),
    body("specialities", "La especialidad es obligatoria").isArray().notEmpty(),
    body("registration", "El genero es obligatorio").notEmpty().isString(),
    body("schedules", "El cronograma es obligatorio").notEmpty().isArray(),
    fieldValidator
    ],
    TherapistController.createUserTherapist); 



  router.get('/therapists', TherapistController.getAllTherapists)
router.get('/therapist/:id', TherapistController.getTherapistById);
router.get('/patients/:therapistId', catchError(TherapistController.getUsersByTherapist))
 
router.post("/email", catchError(TherapistController.findTherapistByEmail))


router.put('/update-therapist-profile', upload.single('userImage'), TherapistController.updateTherapistProfile);

router.put('/profile/specialities', TherapistController.updateSpecialities);

router.put('/profile/change-therapist',
//  authMiddleware, 
 TherapistController.changeTherapist);

export default router;
