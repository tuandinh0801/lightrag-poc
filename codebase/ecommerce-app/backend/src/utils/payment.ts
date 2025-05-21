import Stripe from 'stripe';
import logger from './logger';

// Initialize Stripe with API key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'dummy_key_for_development';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16', // Use the latest API version
});

/**
 * Create a payment intent with Stripe
 * @param amount Amount in cents
 * @param currency Currency code (default: 'usd')
 * @param metadata Additional metadata
 * @returns Payment intent
 */
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      payment_method_types: ['card'],
    });
    
    logger.info(`Payment intent created: ${paymentIntent.id}`);
    return paymentIntent;
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Retrieve a payment intent by ID
 * @param paymentIntentId Payment intent ID
 * @returns Payment intent
 */
export const retrievePaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    logger.error(`Error retrieving payment intent ${paymentIntentId}:`, error);
    throw error;
  }
};

/**
 * Confirm a payment intent
 * @param paymentIntentId Payment intent ID
 * @param paymentMethodId Payment method ID
 * @returns Confirmed payment intent
 */
export const confirmPaymentIntent = async (
  paymentIntentId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
    
    logger.info(`Payment intent confirmed: ${paymentIntent.id}`);
    return paymentIntent;
  } catch (error) {
    logger.error(`Error confirming payment intent ${paymentIntentId}:`, error);
    throw error;
  }
};

/**
 * Cancel a payment intent
 * @param paymentIntentId Payment intent ID
 * @returns Canceled payment intent
 */
export const cancelPaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    
    logger.info(`Payment intent canceled: ${paymentIntent.id}`);
    return paymentIntent;
  } catch (error) {
    logger.error(`Error canceling payment intent ${paymentIntentId}:`, error);
    throw error;
  }
};

/**
 * Create a refund for a payment intent
 * @param paymentIntentId Payment intent ID
 * @param amount Amount to refund (in cents)
 * @param reason Reason for refund
 * @returns Refund
 */
export const createRefund = async (
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> => {
  try {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };
    
    if (amount) {
      refundParams.amount = amount;
    }
    
    if (reason) {
      refundParams.reason = reason;
    }
    
    const refund = await stripe.refunds.create(refundParams);
    
    logger.info(`Refund created: ${refund.id} for payment intent ${paymentIntentId}`);
    return refund;
  } catch (error) {
    logger.error(`Error creating refund for payment intent ${paymentIntentId}:`, error);
    throw error;
  }
};

/**
 * Create a customer in Stripe
 * @param email Customer email
 * @param name Customer name
 * @param metadata Additional metadata
 * @returns Customer
 */
export const createCustomer = async (
  email: string,
  name: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Customer> => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    
    logger.info(`Customer created: ${customer.id}`);
    return customer;
  } catch (error) {
    logger.error('Error creating customer:', error);
    throw error;
  }
};

/**
 * Add a payment method to a customer
 * @param customerId Customer ID
 * @param paymentMethodId Payment method ID
 * @returns Payment method
 */
export const attachPaymentMethod = async (
  customerId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> => {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    
    logger.info(`Payment method ${paymentMethod.id} attached to customer ${customerId}`);
    return paymentMethod;
  } catch (error) {
    logger.error(`Error attaching payment method ${paymentMethodId} to customer ${customerId}:`, error);
    throw error;
  }
};

/**
 * Convert order amount to cents for Stripe
 * @param amount Amount in dollars
 * @returns Amount in cents
 */
export const convertToCents = (amount: number): number => {
  return Math.round(amount * 100);
};
