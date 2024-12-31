import { Request, Response } from 'express';
import { MercadoPagoConfig, Preference,  } from 'mercadopago';
import User from '../models/User';
import Plan from '../models/Plan';
import { Console } from 'console';
import axios from 'axios'; // Use axios for making HTTP requests to Mercado Pago
import { AxiosError } from 'axios';
import { abort } from 'process';



const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const country = process.env.COUNTRY

if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN is not defined in the environment variables");
}

// Create the MercadoPago client
const client = new MercadoPagoConfig({ accessToken });


// Create the preference object
const preference = new Preference(client);

export class PaymentController {
    static async failure(req: Request, res: Response) {
        return res.json({ message: 'Failed to process payment notification' });
    }

    // Handle success redirection
    static async success(req: Request, res: Response) {
        try {
            const {
                collection_id,
                collection_status,
                external_reference, // This should be the userId
                payment_id,
                payment_type,
                preference_id,
                merchant_order_id,
            } = req.query;

            console.log('Payment Success Data:', req.query);

            // Find the user using `external_reference`
            const user = await User.findByPk(external_reference as string);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Update the user's status based on payment collection_status
            if (collection_status === 'approved') {
                user.status = 'active';
                user.suspension = false; // Unsuspend the user if applicable
                user.reasonSuspension = undefined;
                user.suspensionDate = undefined;
                user.suspensionTime = undefined;
            } else if (collection_status === 'pending') {
                user.status = 'pending';
            } else {
                user.status = 'suspended';
                user.suspension = true;
                user.reasonSuspension = 'Payment failed or cancelled';
                user.suspensionDate = new Date();
            }

            // Save the user with the updated status
            await user.save();

            // Optionally, log payment details to a Payments table or log for tracking
            console.log(`User ${user.userId} status updated to ${user.status}`);

            res.json({
                message: 'Payment processed successfully',
                userStatus: user.status,
            });
        } catch (error) {
            console.error('Error processing payment success:', error);
            res.status(500).json({ message: 'Failed to process payment details' });
        }
    }
    static async pending(req: Request, res: Response) {
        return res.json({ message: 'Payment is pending. Please wait for confirmation.' });
    }
    static async subscribed(req: Request, res: Response) {
        try {
            const { preapproval_id } = req.query;

            // Log incoming query data
            console.log('Subscription Callback Data:', req.query);

            if (!preapproval_id) {
                return res.status(400).json({ message: 'Missing required parameter: preapproval_id' });
            }

            // Fetch preapproval details from Mercado Pago
            console.log(`Fetching preapproval details for ID: ${preapproval_id}`);
            const mercadoPagoResponse = await axios.get(`https://api.mercadopago.com/preapproval/${preapproval_id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Replace with your Mercado Pago access token
                },
            });

            const preapprovalData = mercadoPagoResponse.data;

            // Log preapproval data
            console.log('Preapproval Data:', preapprovalData);

            // Validate the subscription status
            if (preapprovalData.status !== 'authorized') {
                return res.status(400).json({ message: 'Subscription is not authorized' });
            }

            // Log user ID from external_reference
            const userId = preapprovalData.external_reference;

            // Find the user using `external_reference`
            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({ message: `User with ID not found` });
            }

            // Log user data before updating
            console.log('User found:', user);

            // Update user subscription status
            user.status = 'active';
            user.suspension = false;
            user.reasonSuspension = undefined;
            user.suspensionDate = undefined;
            user.suspensionTime = undefined;

            await user.save();

            res.json({
                message: 'Subscription processed successfully',
                userStatus: user.status,
            });
        } catch (error) {
            console.error('Error processing subscription callback:', error);
            res.status(500).json({ message: 'Failed to process subscription details' });
        }
    }


    static async createSubscription(req: Request, res: Response) {
        const { planId, userId } = req.body
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found or Mercado Pago Email not found' });
        const plan = await Plan.findByPk(planId);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        try {
            const preapprovalData = {
                payer_email: 'test_user_2075158944@testuser.com',
                back_url: 'https://watson-however-span-mike.trycloudflare.com',
                reason: 'Plan prueba2',
                //en external_refernce: juntamos el id del usuario y el id del plan para que se mande esta info en el webhook para actualizar la base de datos
                external_reference: `${user.userId}:${plan.planId}`, 
                auto_recurring: {
                  frequency: 1,
                  frequency_type: 'months',
                  transaction_amount: plan.amount,
                  currency_id: country, // Use MXN for Mexico
                  start_date: '2024-12-03T00:44:03.351Z',
                  end_date: '2025-12-03T00:44:03.353Z'
                },
              };
              
              
            // console.log("before axios", preapprovalData);

            const response = await axios.post(
                'https://api.mercadopago.com/preapproval',
                preapprovalData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if(user){
                user.subscriptionId = response.data.id
                await user.save()
            }

            res.status(200).json({ subscription_link: response.data.init_point });
        } catch (error: unknown) {  // Type 'unknown' for 'error'
            console.error("Error creating subscription:");

            if (axios.isAxiosError(error)) {  // Check if error is an AxiosError
                console.error("Status Code:", error.response?.status);
                console.error("Response Data:", JSON.stringify(error.response?.data, null, 2));
                res.status(500).json({
                    message: 'Failed to create subscription', 
                    error: error.response?.data
                });
            } else {
                console.error("Error Message:", (error as Error).message);  // Cast to Error type
                res.status(500).json({ message: 'Unexpected error occurred' });
            }
        }
    }

    static async cancelSubscription(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { status } = req.body;
    
        // Early validation for status
        if (!status || status !== "cancelled") {
            res.status(400).json({ ok: false, message: "Invalid or missing 'status'. Only 'cancelled' is allowed." });
            return;  // Explicit return after response to fulfill Promise<void> requirement
        }
    
        // Find user with the given subscriptionId
        const user = await User.findOne({ where: { subscriptionId: id } });
        if (!user) {
            res.status(404).json({ ok: false, message: 'User with given subscription ID not found.' });
            return;  // Explicit return after response to fulfill Promise<void> requirement
        }

    
        try {
            // Make the API request to MercadoPago to update the subscription status
        
            const { data } = await axios.put(`https://api.mercadopago.com/preapproval/${id}`,
                { status },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
    
            // Check if the status was updated successfully
            if (data.status === 'cancelled') {
                // Update the user subscription data in the database
                user.subscriptionId = null;
                user.status = 'cancelled'
                user.cancelDate = new Date();
                await user.save();
    
                // Send success response
                res.status(200).json({ ok: true, message: "Plan cancelled successfully" });
            } else {
                // Handle unexpected status or failure to cancel
                res.status(400).json({
                    ok: false,
                    message: `Failed to cancel the subscription. MercadoPago status: ${data.status}`,
                });
            }
        } catch (error: any) {
            // Handle any error during the API request
            console.error('Error cancelling preapproval:', error.response?.data || error.message);
            res.status(500).json({
                error: 'Failed to update preapproval status',
                details: error.response?.data || error.message,
            });
        }
    }
    

    // Crear preferencia de pago para el plan del usuario
    static async createPayment(req: Request, res: Response){
        try {
            const userId = req.userId;
            const user = await User.findByPk(userId);
            if (!user) return res.status(404).json({ message: 'User not found' });
            const plan = await Plan.findByPk(userId);
            if (!plan) return res.status(404).json({ message: 'Plan not found' });
            // Find user and plan from the database
            // Construct the preference object
            const preferenceData = {
                items: [
                    {
                        id: plan.planId.toString(),  // Convert to string
                        title: plan.namePlan,      // Plan name
                        description: plan.description,  // Optional description
                        quantity: 1,               // Quantity
                        unit_price: plan.amount,   // Unit price
                        currency_id: 'ARS',        // Currency (ARS for Argentina)
                    }
                ],
                payer: {
                    email: user.mercadoPagoEmail  // User email
                },
                back_urls: {
                    success: 'http://localhost:3000/api/payments/success',   // URL for success callback
                    failure: 'http://localhost:3000/api/payments/failure',   // URL for failure callback
                    pending: 'http://localhost:3000/api/payments/pending'    // URL for pending callback
                },
                external_reference: userId.toString(), // Add this to identify user in success endpoint
                auto_return: 'approved',     // Behavior after payment (approved, etc.)
                notification_url: 'https://tu-backend.com/webhook/mercadopago',  // URL for receiving payment notifications
            };

            // Create the preference and await the response
            const response = await preference.create({
                body: preferenceData
            });
            // console.log(response);

            // Send the init_point back to the client
            res.status(200).json({ init_point: response.init_point });

        } catch (error) {
            console.error('Error creating payment:', error);
            res.status(500).json({ message: 'Failed to create payment' });
        }
    }

    // Webhook para recibir notificaciones de pago de MercadoPago
    static async paymentNotification(req: Request, res: Response) {
        try {
            const { type, data } = req.body;
            // console.log("2", req.body)
            console.log("Req in paymentNotification: ", req.body)
            //todo esto para cuando ya sea confirmado el pago
            if (type === 'payment') {
                // Use Mercado Pago SDK to get payment details
                // const paymentResponse = await preference.get(data.id);
                // const paymentResponse: any = await preference.get(data.id);
                const paymentResponse = await axios.get(`https://api.mercadopago.com/v1/payments/${data.id}`,{
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                })

                const paymentData = paymentResponse.data
                const [userId, planId] = paymentData.external_reference.split(":").map(Number);
                
                // console.log("User IDDDD: ", userId)
                // console.log("Plan ID: ", planId)

                const user = await User.findByPk(userId)
                const plan = await Plan.findByPk(planId)
                if(!user) res.status(400).json({ok: false, message: "User of that ID not found"})
                if(!plan) res.status(400).json({ok: false, message: "Plan of that ID not found"})
                
                if(user && plan){
                    user.planId = plan.planId;
                    user.status = "active"
                    user.cancelDate = null
                    user.startDate = new Date()
                    await user.save();
                }
                
                
                
                // const userId = paymentResponse.external_reference;

                // // Update the user's status based on the payment status
                // const user = await User.findByPk(userId);
                // if (user) {
                //     user.status = paymentResponse === 'approved' ? 'active' : 'suspended';
                //     await user.save();
                // }
            }

            res.status(200).json({ok: true, message: "User's plan and start date updated successfully"});
        } catch (error) {
            console.error('Error in payment notification:', error);
            res.status(500).json({ message: 'Failed to process payment notification' });
        }
    }
}