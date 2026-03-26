import { apiClient } from '../client';

export interface CreateOrderResponse {
  success: boolean;
  data?: {
    orderId: string;
    amount: number;
    currency: string;
    createdAt: string;
  };
  error?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  data?: {
    orderId: string;
    paymentId: string;
  };
  error?: string;
}

export interface RazorpayOrderDetails {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

class PaymentService {
  /**
   * Create a Razorpay order via payment API
   */
  static async createOrder(
    amount: number,
    currency: string = 'INR',
    description: string = 'Dream X Store Order'
  ): Promise<CreateOrderResponse> {
    try {
      console.log('[PaymentService] Creating order:', { amount, currency });

      const response = await apiClient.post<CreateOrderResponse>('/payment/create-order', {
        amount,
        currency,
        description,
      });

      console.log('[PaymentService] Order created successfully:', response);
      return response;
    } catch (error: any) {
      console.error('[PaymentService] Error creating order:', error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create order',
      };
    }
  }

  /**
   * Verify payment signature
   */
  static async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<VerifyPaymentResponse> {
    try {
      console.log('[PaymentService] Verifying payment:', razorpayPaymentId);

      const response = await apiClient.post<VerifyPaymentResponse>('/payment/verify', {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      console.log('[PaymentService] Payment verified successfully:', response);
      return response;
    } catch (error: any) {
      console.error('[PaymentService] Error verifying payment:', error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Payment verification failed',
      };
    }
  }

  /**
   * Load Razorpay script from CDN
   */
  static loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if script already loaded
      if (document.getElementById('razorpay-script')) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('[PaymentService] Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('[PaymentService] Failed to load Razorpay script');
        resolve(false);
      };

      document.body.appendChild(script);
    });
  }

  /**
   * Open Razorpay checkout modal
   */
  static async openRazorpayCheckout(
    orderData: RazorpayOrderDetails,
    onSuccess: (paymentId: string, signature: string) => void,
    onFailure: (error: string) => void
  ): Promise<void> {
    try {
      // Load Razorpay script if not already loaded
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Get user email from localStorage
      const userEmail = this.getUserEmail();

      // Access Razorpay from window
      const razorpay = (window as any).Razorpay;
      if (!razorpay) {
        throw new Error('Razorpay not available');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Dream X Store',
        description: 'Complete your purchase',
        image: '/logo.png', // Optional: your company logo
        handler: (response: any) => {
          console.log('[PaymentService] Payment response:', response);
          onSuccess(response.razorpay_payment_id, response.razorpay_signature);
        },
        prefill: {
          email: userEmail || '',
          contact: '',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: () => {
            onFailure('Payment cancelled');
          },
        },
      };

      const razorpayInstance = new razorpay(options);
      razorpayInstance.open();
    } catch (error: any) {
      console.error('[PaymentService] Error opening checkout:', error.message);
      onFailure(error.message || 'Failed to open payment checkout');
    }
  }

  /**
   * Get user email from localStorage
   */
  private static getUserEmail(): string {
    try {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('dreamx_user');
        if (userData) {
          const user = JSON.parse(userData);
          return user.email || '';
        }
      }
    } catch (error) {
      console.error('[PaymentService] Error getting user email:', error);
    }
    return '';
  }

  /**
   * Create order and open Razorpay checkout
   */
  static async createOrderAndOpenCheckout(
    amount: number,
    onSuccess: (paymentId: string, signature: string, orderId: string) => void,
    onFailure: (error: string) => void
  ): Promise<void> {
    try {
      // Step 1: Create order on payment API
      const orderResponse = await this.createOrder(amount);

      if (!orderResponse.success || !orderResponse.data) {
        onFailure(orderResponse.error || 'Failed to create order');
        return;
      }

      const orderData: RazorpayOrderDetails = {
        id: orderResponse.data.orderId,
        entity: 'order',
        amount: orderResponse.data.amount,
        amount_paid: 0,
        amount_due: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        receipt: `order_${Date.now()}`,
        status: 'created',
        attempts: 0,
        notes: {},
        created_at: Math.floor(new Date(orderResponse.data.createdAt).getTime() / 1000),
      };

      // Step 2: Open Razorpay checkout
      await this.openRazorpayCheckout(
        orderData,
        (paymentId, signature) => {
          onSuccess(paymentId, signature, orderData.id);
        },
        onFailure
      );
    } catch (error: any) {
      console.error('[PaymentService] Error in createOrderAndOpenCheckout:', error.message);
      onFailure(error.message || 'Payment process failed');
    }
  }
}

export default PaymentService;
