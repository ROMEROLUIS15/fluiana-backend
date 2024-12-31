import { Router } from 'express';
import AdminController from '../controllers/AdminController';
import validateToken from '../middlewares/authenticate';
import { isAdmin } from '../middlewares/isAdminMiddleware';
import catchError from '../middlewares/catchError';
import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest';

const router = Router();

// Routes for Plans
router.get('/admin', catchError(AdminController.getAdmin))
// router.get('/plans', catchError(AdminController.getAllPlans))
router.get('/plans', validateToken, catchError(AdminController.getAllPlans));

router.get('/plans/:planId', validateToken, isAdmin, catchError(AdminController.getPlanById));

// router.post('/plans', catchError(AdminController.addPlan));
router.post('/plans', validateToken, isAdmin, catchError(AdminController.addPlan));
router.patch('/updated-plan', catchError(AdminController.updatePlan))

router.put('/plans/:planId', validateToken, isAdmin, catchError(AdminController.updatePlan));


// Routes for user account management
router.post('/users/accept',  catchError(AdminController.acceptAccount));
// router.post('/users/accept', validateToken, isAdmin, catchError(AdminController.acceptAccount));

router.post('/users/deny', catchError(AdminController.denyAccount));
// router.post('/users/deny', validateToken, isAdmin, catchError(AdminController.denyAccount));

router.put('/update-adminProfile',
    // validateToken,
    // isAdmin,
    [
        body('userId')
            .isInt().withMessage('User ID must be an integer')
            .notEmpty().withMessage('User ID is required'),
        body('username')
            .isString().notEmpty().withMessage('Username is required'),
        body('email')
            .isEmail().withMessage('Valid email is required'),
        body('currentPassword')
            .isString().notEmpty().withMessage('Current password is required'),
        body('newPassword')
            .optional() // This makes the field optional
            .custom((value) => {
                // If value is null or empty string, return true (valid)
                if (value === null || value === "") {
                    return true;
                }
                // If it contains a value, then apply further checks
                if (value.length < 8) {
                    throw new Error('New password must be at least 8 characters long');
                }
                if (!/[0-9]/.test(value)) {
                    throw new Error('New password must contain a number');
                }
                if (!/[A-Z]/.test(value)) {
                    throw new Error('New password must contain an uppercase letter');
                }
                if (!/[!@#$%^&*]/.test(value)) {
                    throw new Error('New password must contain a special character');
                }
                return true; // Valid
            }),
        body('phone')
            .optional()
            .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Phone number must be in a valid format')
    ],
    validateRequest,
    catchError(AdminController.updateAdminProfile));



router.put('/users/toggle-account', validateToken, isAdmin, catchError(AdminController.toggleUserAccount));

// Routes for therapist requests
router.get('/new-therapists', catchError(AdminController.getNewTherapists))
router.get('/therapists/requests', validateToken, isAdmin, catchError(AdminController.getTherapistRequests));

router.post('/therapists/handle-request', validateToken, isAdmin, catchError(AdminController.handleTherapistRequest));

// Route to get data for a specific user
router.get('/users/:userId', validateToken, isAdmin, catchError(AdminController.getUserData));

export default router;
