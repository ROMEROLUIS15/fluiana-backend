import express from 'express';
import { PaymentController } from '../controllers/PaymentController';
import validateToken from '../middlewares/authenticate';

const router = express.Router();


// Ruta para crear el pago de un plan - ensure the user is authenticated
router.get('/create', validateToken, PaymentController.createPayment);

router.post('/subscription', validateToken, PaymentController.createSubscription);
router.put('/cancel/:id', validateToken, PaymentController.cancelSubscription);


// Webhook para recibir notificaciones de MercadoPago
// You might not need `validateToken` here if the webhook is from MercadoPago and doesn't carry a token
router.post('/webhook/mercadopago', PaymentController.paymentNotification);

// Rutas de estado del pago
router.get('/failure', validateToken, PaymentController.failure);
router.get('/success', validateToken, PaymentController.success);
router.get('/pending', validateToken, PaymentController.pending);
router.get('/subscribed', PaymentController.subscribed);



export default router;
