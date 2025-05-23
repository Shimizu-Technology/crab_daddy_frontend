import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../shared/api/apiClient';
import { LoadingSpinner } from '../../../shared/components/ui';

// Define the possible response types from the payment intent API
interface PaymentIntentResponse {
  success: boolean;
  client_secret?: string;
  free_order?: boolean;
  small_order?: boolean;
  order_id?: string;
  errors?: string[];
  status?: string;
}

interface StripeCheckoutProps {
  amount: string;
  currency?: string;
  publishableKey: string;
  testMode: boolean;
  onPaymentSuccess: (details: {
    status: string;
    transaction_id: string;
    payment_id?: string; // Added for webhook lookups
    payment_intent_id?: string; // Added to explicitly track the payment intent ID
    amount: string;
  }) => void;
  onPaymentError: (error: Error) => void;
}

// Create a ref type for accessing the component from parent
export interface StripeCheckoutRef {
  processPayment: () => Promise<boolean>;
}

export const StripeCheckout = React.forwardRef<StripeCheckoutRef, StripeCheckoutProps>((props, ref) => {
  const {
    amount,
    currency = 'USD',
    publishableKey,
    testMode,
    onPaymentSuccess,
    onPaymentError
  } = props;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [isFreeOrder, setIsFreeOrder] = useState(false);
  const [isSmallOrder, setIsSmallOrder] = useState(false);
  const [specialOrderId, setSpecialOrderId] = useState<string | null>(null);

  // Use refs to track initialization state
  const stripeLoaded = useRef(false);
  const paymentIntentCreated = useRef(false);
  const elementsInitialized = useRef(false);
  const paymentElementMounted = useRef(false);
  const paymentElementRef = useRef<HTMLDivElement>(null);

  // Load Stripe.js - only once
  useEffect(() => {
    if (stripeLoaded.current || testMode) {
      setLoading(false);
      return;
    }

    stripeLoaded.current = true;
    
    if (!publishableKey) {
      setError('Stripe publishable key is missing');
      setLoading(false);
      return;
    }

    if ((window as any).Stripe) {
      setStripe((window as any).Stripe(publishableKey));
      setLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      setStripe((window as any).Stripe(publishableKey));
      setLoading(false);
    };
    script.onerror = () => {
      setError('Failed to load Stripe.js');
      setLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [publishableKey, testMode]);

  // Create payment intent - only once
  useEffect(() => {
    // For test mode, just create a fake client secret
    if (testMode && !clientSecret) {
      setClientSecret(`test_secret_${Math.random().toString(36).substring(2, 15)}`);
      return;
    }

    // Skip if already created, missing stripe, already have client secret, or have an error
    if (paymentIntentCreated.current || !stripe || clientSecret || error) {
      return;
    }

    paymentIntentCreated.current = true;
    
    const createPaymentIntent = async () => {
      try {
        // Get restaurant ID from localStorage or use default
        const restaurantId = localStorage.getItem('restaurant_id') || '4';
        
        const response = await api.post<PaymentIntentResponse>('/stripe/create_intent', {
          amount,
          currency,
          restaurant_id: restaurantId // Include restaurant_id for tenant isolation
        });
        
        // Check if this is a free or small order
        if (response && (response.free_order || response.small_order)) {
          if (response.free_order) {
            setIsFreeOrder(true);
          } else if (response.small_order) {
            setIsSmallOrder(true);
          }
          setSpecialOrderId(response.order_id || `special_${Math.random().toString(36).substring(2, 10)}`);
          setLoading(false);
          return;
        }
        
        // Normal paid order with client secret
        if (response && response.client_secret) {
          setClientSecret(response.client_secret);
        } else if (response && response.success) {
          // This is a successful response but doesn't have a client secret
          // (could be a free or small order that wasn't caught above)
          setIsSmallOrder(true);
          setSpecialOrderId(`special_${Math.random().toString(36).substring(2, 10)}`);
          setLoading(false);
        } else {
          throw new Error('No client secret returned');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to create payment intent');
        onPaymentError(err);
      }
    };

    createPaymentIntent();
  }, [stripe, testMode, clientSecret, error, amount, currency, onPaymentError]);

  // Initialize Stripe Elements - only once
  useEffect(() => {
    if (elementsInitialized.current || testMode || !stripe || !clientSecret || isFreeOrder || isSmallOrder) {
      return;
    }
    
    elementsInitialized.current = true;
    
    const elementsInstance = stripe.elements({
      clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#E87230',
        },
      },
      // Configure payment flow
      paymentMethodCreation: 'manual',
      // Minimize billing address collection
      billingAddressCollection: 'never'
    });
    setElements(elementsInstance);
  }, [stripe, clientSecret, testMode]);

  // Mount payment element when elements is ready
  useEffect(() => {
    // Skip if already mounted or if we're in test mode or if elements isn't ready or if it's a special order
    if (paymentElementMounted.current || testMode || !elements || !paymentElementRef.current || isFreeOrder || isSmallOrder) {
      return;
    }
    
    // Mark as mounted to prevent creating multiple elements
    paymentElementMounted.current = true;
    
    // Create and mount the payment element with payment method configuration
    const paymentElement = elements.create('payment', {
      // Configure payment methods to prioritize card and digital wallets
      payment_method_types: ['card', 'apple_pay', 'google_pay', 'cashapp'],
      defaultValues: {
        billingDetails: {
          name: '',
          email: '',
          phone: ''
        }
      }
    });
    
    // Mount the element
    paymentElement.mount(paymentElementRef.current);
    
    // Cleanup function to unmount element when component unmounts
    return () => {
      if (paymentElementMounted.current && paymentElement) {
        try {
          paymentElement.unmount();
        } catch (err) {
          console.log('Error unmounting Stripe element:', err);
          // Ignore errors during unmount - element might already be destroyed
        }
        paymentElementMounted.current = false;
      }
    };
  }, [elements, testMode]);

  // Process payment function - exposed to parent via ref
  const processPayment = async (): Promise<boolean> => {
    if (processing) return false;
    
    setProcessing(true);
    
    // Application test mode - simulate successful payment
    if (testMode) {
      setTimeout(() => {
        // Generate a Stripe-like test payment intent ID
        // This format matches what Stripe would generate in their test mode
        const testId = `pi_test_${Math.random().toString(36).substring(2, 15)}`;
        onPaymentSuccess({
          status: 'succeeded',
          transaction_id: testId,
          payment_id: testId, // Use the same ID for payment_id
          payment_intent_id: testId, // Also include as payment_intent_id
          amount: amount,
        });
        setProcessing(false);
      }, 1000);
      return true;
    }
    
    // Handle free orders
    if (isFreeOrder) {
      setTimeout(() => {
        onPaymentSuccess({
          status: 'succeeded',
          transaction_id: specialOrderId || `free_${Math.random().toString(36).substring(2, 10)}`,
          payment_id: specialOrderId || undefined, 
          payment_intent_id: specialOrderId || undefined,
          amount: '0',
        });
        setProcessing(false);
      }, 500);
      return true;
    }
    
    // Handle free or small orders
    if (isFreeOrder || isSmallOrder) {
      setTimeout(() => {
        onPaymentSuccess({
          status: 'succeeded',
          transaction_id: specialOrderId || `special_${Math.random().toString(36).substring(2, 10)}`,
          payment_id: specialOrderId || undefined, 
          payment_intent_id: specialOrderId || undefined,
          amount: isFreeOrder ? '0' : '0.50',
        });
        setProcessing(false);
      }, 500);
      return true;
    }
    
    // Live mode - need stripe and elements
    if (!stripe || !elements || !clientSecret) {
      setProcessing(false);
      return false;
    }
    
    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/order-confirmation',
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
        onPaymentError(new Error(submitError.message || 'Payment failed'));
        return false;
      } 
      
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        onPaymentSuccess({
          status: paymentIntent.status,
          transaction_id: paymentIntent.id,
          payment_id: paymentIntent.id, // Store payment_id for webhook lookups
          payment_intent_id: paymentIntent.id, // Explicitly include payment_intent_id
          amount: (paymentIntent.amount / 100).toString(), // Convert from cents
        });
        return true;
      } 
      
      // Handle other statuses
      if (paymentIntent) {
        const errorMsg = `Payment status: ${paymentIntent.status}`;
        setError(errorMsg);
        onPaymentError(new Error(errorMsg));
      } else {
        setError('Payment failed with unknown error');
        onPaymentError(new Error('Payment failed with unknown error'));
      }
      
      return false;
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      onPaymentError(err);
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Expose the processPayment method to parent component
  React.useImperativeHandle(ref, () => ({
    processPayment
  }), [processPayment]);

  if (loading && !isFreeOrder) {
    return (
      <div className="flex justify-center items-center p-4">
        <LoadingSpinner className="w-8 h-8" />
        <span className="ml-2">Loading Stripe...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p>Error: {error}</p>
        <p className="mt-2">Please try another payment method or contact support.</p>
      </div>
    );
  }

  return (
    <div className="stripe-checkout-container">
      {/* Free order view */}
      {isFreeOrder ? (
        <div className="bg-green-50 border border-green-100 p-3 mb-4 rounded-md">
          <p className="font-bold text-green-700 inline-block mr-2">FREE ORDER</p>
          <span className="text-green-700">No payment required. Click the button below to complete your order.</span>
        </div>
      ) : isSmallOrder ? (
        <div className="bg-blue-50 border border-blue-100 p-3 mb-4 rounded-md">
          <p className="font-bold text-blue-700 inline-block mr-2">SMALL ORDER</p>
          <span className="text-blue-700">Small orders are processed without requiring card details. Click the button below to complete your order.</span>
        </div>
      ) : testMode ? (
        <div>
          <div className="bg-yellow-50 border border-yellow-100 p-3 mb-4 rounded-md">
            <p className="font-bold text-yellow-700 inline-block mr-2">TEST MODE</p>
            <span className="text-yellow-700">Payments will be simulated without processing real cards.</span>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Enter your card details to complete your payment.</h3>
          
            {/* Card Number */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">Card Number</label>
              <input 
                type="text"
                defaultValue="4111 1111 1111 1111"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="4111 1111 1111 1111 (Test Card)"
                readOnly={processing}
              />
            </div>
            
            {/* Two columns for expiry and CVV */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Expiration Date</label>
                <input
                  type="text"
                  defaultValue="12/25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MM/YY"
                  readOnly={processing}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">CVV</label>
                <input
                  type="text"
                  defaultValue="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123"
                  readOnly={processing}
                />
              </div>
            </div>
          </div>
          
          {/* No submit button - parent will call processPayment */}
          
          {/* Processing indicator removed in favor of full-screen overlay */}
        </div>
      ) : (
        // Live mode with actual Stripe Elements
        !elements ? (
          <div className="flex justify-center items-center p-4">
            <LoadingSpinner className="w-8 h-8" />
            <span className="ml-2">Preparing checkout...</span>
          </div>
        ) : (
          <div>
            <div id="payment-element" ref={paymentElementRef} className="mb-6">
              {/* Payment Element will be mounted here by the useEffect hook */}
            </div>
            
            {/* No submit button - parent will call processPayment */}
            
            {/* Processing indicator removed in favor of full-screen overlay */}
          </div>
        )
      )}
    </div>
  );
});

// Add display name for better debugging
StripeCheckout.displayName = 'StripeCheckout';
