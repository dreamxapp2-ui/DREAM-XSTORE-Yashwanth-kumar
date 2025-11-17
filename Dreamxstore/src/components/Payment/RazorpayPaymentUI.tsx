'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Lock, CreditCard, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { useToast } from '@/src/contexts/ToastContext';

interface PaymentDetails {
  amount: number;
  currency: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
}

interface RazorpayPaymentUIProps {
  paymentDetails: PaymentDetails;
  onPaymentSuccess?: (response: any) => void;
  onPaymentError?: (error: any) => void;
  isProcessing?: boolean;
}

export const RazorpayPaymentUI: React.FC<RazorpayPaymentUIProps> = ({
  paymentDetails,
  onPaymentSuccess,
  onPaymentError,
  isProcessing = false,
}) => {
  const { showToast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentClick = async () => {
    try {
      setPaymentStatus('processing');
      setErrorMessage('');
      showToast('Loading payment gateway...', 'info', 0);

      // Load Razorpay script
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      
      if (!res) {
        throw new Error('Failed to load Razorpay script');
      }

      const amountInPaise = Math.round(paymentDetails.amount * 100);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: amountInPaise.toString(),
        currency: paymentDetails.currency,
        name: 'Dream X Store',
        description: paymentDetails.description,
        order_id: paymentDetails.orderId,
        prefill: {
          name: paymentDetails.customerName,
          email: paymentDetails.customerEmail,
          contact: paymentDetails.customerPhone,
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus('idle');
            showToast('Payment cancelled', 'warning', 3000);
          },
        },
        handler: (response: any) => {
          setPaymentStatus('success');
          showToast('Payment successful! Confirming order...', 'success', 4000);
          if (onPaymentSuccess) {
            onPaymentSuccess(response);
          }
        },
      };

      // @ts-ignore
      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', (response: any) => {
        setPaymentStatus('error');
        const errorMsg = response.error.description || 'Payment failed';
        setErrorMessage(errorMsg);
        showToast(`Payment failed: ${errorMsg}`, 'error', 5000);
        if (onPaymentError) {
          onPaymentError(response.error);
        }
      });

      // Open Razorpay modal with payment methods
      paymentObject.open();
      showToast('Please select your payment method and complete payment', 'info', 5000);
    } catch (error: any) {
      setPaymentStatus('error');
      const errorMsg = error.message || 'Failed to initiate payment';
      setErrorMessage(errorMsg);
      showToast(errorMsg, 'error', 4000);
      if (onPaymentError) {
        onPaymentError(error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-gray-200 rounded-lg shadow-md overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Secure Payment</h2>
            </div>
            <p className="text-blue-100">Complete your purchase securely with Razorpay</p>
          </div>

          {/* Payment Details */}
          <div className="p-6 space-y-4">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono font-medium text-gray-900">{paymentDetails.orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount:</span>
                <span className="text-2xl font-bold text-gray-900">
                  ₹{paymentDetails.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium text-gray-900">{paymentDetails.currency}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                Billing Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  {paymentDetails.customerName}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  {paymentDetails.customerEmail}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  {paymentDetails.customerPhone}
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {paymentStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-900">Payment Successful!</p>
                  <p className="text-sm text-green-700">Your order is being processed.</p>
                </div>
              </motion.div>
            )}

            {paymentStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Payment Failed</p>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </motion.div>
            )}

            {/* Security Info */}
            <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
              <Lock className="w-4 h-4 flex-shrink-0 text-green-600" />
              <span>Your payment is secured and encrypted by Razorpay</span>
            </div>

            {/* Payment Button */}
            <motion.div
              whileHover={{ scale: paymentStatus === 'idle' && !isProcessing ? 1.02 : 1 }}
              whileTap={{ scale: paymentStatus === 'idle' && !isProcessing ? 0.98 : 1 }}
            >
              <Button
                onClick={handlePaymentClick}
                disabled={isProcessing || paymentStatus === 'processing' || paymentStatus === 'success'}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg transition-all duration-200"
              >
                {paymentStatus === 'processing' || isProcessing ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : paymentStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Payment Completed
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Pay ₹{paymentDetails.amount.toLocaleString('en-IN')} Securely
                  </>
                )}
              </Button>
            </motion.div>

            {/* Additional Info */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                By clicking "Pay Securely", you agree to our Terms & Conditions and Privacy Policy.
                Your transaction is protected by Razorpay's advanced security.
              </p>
            </div>

            {/* Payment Methods Info */}
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm font-semibold text-gray-900 mb-2">Accepted Payment Methods:</p>
              <div className="flex flex-wrap gap-2">
                {['Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'Wallets'].map((method) => (
                  <span key={method} className="text-xs bg-white border border-blue-200 rounded px-2 py-1 text-gray-700">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RazorpayPaymentUI;
