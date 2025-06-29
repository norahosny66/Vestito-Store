import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51ReqRBPvYhY0SUYRvpAzdGbeKt8EZKRQHXNBGgppo8Xk1x5uY49HrWiwpFn4yPO2zhd7jYXs2IWClfee9Ycol6AS004BvX7qHN';

export const stripePromise = loadStripe(stripePublishableKey);

export interface PaymentIntentData {
  amount: number; // in cents
  currency: string;
  customizationId: string;
  userEmail: string;
  description: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

// For demo purposes, we'll simulate Stripe integration
export const createPaymentIntent = async (data: PaymentIntentData): Promise<{ clientSecret: string; paymentIntentId: string } | null> => {
  try {
    // In a real app, this would call your backend API
    // For demo, we'll simulate the response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      clientSecret: `pi_demo_${Date.now()}_secret_demo`,
      paymentIntentId: `pi_demo_${Date.now()}`
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return null;
  }
};

export const confirmPayment = async (
  stripe: any,
  clientSecret: string,
  paymentMethod: any
): Promise<PaymentResult> => {
  try {
    // For demo purposes, simulate successful payment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      paymentIntentId: `pi_demo_${Date.now()}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};