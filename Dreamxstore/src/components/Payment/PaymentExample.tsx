'use client';

import React, { useState } from 'react';
import RazorpayPaymentUI from './RazorpayPaymentUI';
import { Card, CardContent } from '../ui/card';
import { useToast } from '@/src/contexts/ToastContext';

/**
 * Example component showing how to use RazorpayPaymentUI
 * This demonstrates the payment flow with order details
 */
export const PaymentExample: React.FC = () => {
  const { showToast } = useToast();
  const [orderId, setOrderId] = useState('order_1A2B3C4D5E6F7G8H');
  const [amount, setAmount] = useState(2500);

  const handlePaymentSuccess = (response: any) => {
    console.log('Payment Success:', response);
    showToast('Payment completed successfully!', 'success', 4000);
    // Handle successful payment - send verification to backend
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment Error:', error);
    showToast(`Payment error: ${error.description}`, 'error', 5000);
    // Handle payment error
  };

  const paymentDetails = {
    amount: amount,
    currency: 'INR',
    orderId: orderId,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '9876543210',
    description: 'Order for Dream X Store products',
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto mt-8">
        {/* Payment UI Component */}
        <RazorpayPaymentUI
          paymentDetails={paymentDetails}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />

        {/* Order Details Card */}
        <Card className="mt-6 border border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Product 1</span>
                <span className="font-medium">₹1500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Product 2</span>
                <span className="font-medium">₹800</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">₹200</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-blue-600">₹{amount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentExample;
