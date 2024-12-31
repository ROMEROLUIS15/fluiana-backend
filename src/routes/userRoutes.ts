import { Router } from 'express';
import { fieldValidator } from '../middlewares';
import { body } from 'express-validator';
import multer from 'multer';
import UserController from '../controllers/UserController';
import validateToken from '../middlewares/authenticate';
import { storageImg } from '../config/userImageUpload';
import AdminController from '../controllers/AdminController';
import catchError from '../middlewares/catchError';
const multiparty = require('connect-multiparty');

const router = Router();
const upload = multer({ storage: storageImg });

const mdUserImg = multiparty({uploadDir: 'src/uploads/users'});



router.get('/users', UserController.getAllUsers); 

router.post('/users/patient', [
    body("username", "El nombre es obligatorio").notEmpty().isString(),
    body("email", "El email es obligatorio").notEmpty().isString(),
    body("password", "La contraseña es obligatoria").isLength({
      min: 8,
    }).isString(),
    body("gender", "El genero es obligatorio").notEmpty().isString(),
    body("birthday", "El cumpleaños es obligatorio").notEmpty().isDate(),
    body("location", "La localidad es obligatoria").isString().notEmpty(),
    body("phone", "El numero celular es obligatorio").isString().notEmpty(),
    fieldValidator
  ],
  UserController.createUserPatient);
  
  
  //router.post("/email", UserController.findPatientByEmail)
  
  router.get('/', validateToken, UserController.getAllUsers);
  
  
  router.post('/login', UserController.login);
  
  router.get('/news', validateToken, UserController.getNewsUsers);
  
  
  
  //-----------------Admin Routes ----------------------------//
  
  router.patch('/suspendAccount', AdminController.suspendAccount)
  router.post('/denyAccount', AdminController.denyAccount);
  router.patch('/edit/:userId', UserController.editUser);
  router.patch('/editTherapist/:therapistId', AdminController.editTherapist)

router.post('/acceptAccount', AdminController.acceptAccount);



//routes for validations
router.post('/validate-email', UserController.validateEmail)

router.post('/verify-code', UserController.verifyCode)

router.put('/reset-password', UserController.resetPassword)

// router.put('/update-profile-user', mdUserImg, catchError(UserController.updatePerfilUser))
router.put('/update-profile-user', upload.single('userImage'), catchError(UserController.updatePerfilUser));

router.put('/update-paymentMethod', UserController.updateUserPayment)


export default router;