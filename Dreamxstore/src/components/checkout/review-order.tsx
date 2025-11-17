'use client';

import { useState } from 'react';
import { CheckCircle, Loader } from 'lucide-react';
import { useCart } from '@/src/contexts/CartContext';
import { useToast } from '@/src/contexts/ToastContext';
import PaymentService from '@/src/lib/api/services/paymentService';

interface ReviewOrderProps {
  shippingData: any;
  paymentData: any;
  onPrevious: () => void;
  onComplete: () => void;
}

export default function ReviewOrder({ 
  shippingData, 
  paymentData, 
  onPrevious, 
  onComplete 
}: ReviewOrderProps) {
  const { cart } = useCart();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const totalAmount = getTotalPrice();

      // Open Razorpay checkout and handle payment
      await PaymentService.createOrderAndOpenCheckout(
        totalAmount,
        async (paymentId, signature, orderId) => {
          try {
            console.log('[ReviewOrder] Payment successful:', { paymentId, orderId });
            
            // Verify payment on backend
            const verifyResponse = await PaymentService.verifyPayment(
              orderId,
              paymentId,
              signature
            );

            if (verifyResponse.success) {
              showToast('Order placed successfully!', 'success', 4000);
              // Clear cart
              localStorage.removeItem('cart');
              setTimeout(() => onComplete(), 1500);
            } else {
              showToast(verifyResponse.error || 'Payment verification failed', 'error', 4000);
            }
          } catch (error: any) {
            console.error('[ReviewOrder] Error verifying payment:', error);
            showToast('Failed to verify payment', 'error', 4000);
          } finally {
            setIsProcessing(false);
          }
        },
        (error) => {
          console.error('[ReviewOrder] Payment failed:', error);
          showToast(error || 'Payment failed', 'error', 4000);
          setIsProcessing(false);
        }
      );
    } catch (error: any) {
      console.error('[ReviewOrder] Error in handlePlaceOrder:', error);
      showToast(error.message || 'Failed to process payment', 'error', 4000);
      setIsProcessing(false);
    }
  };

  const getTotalPrice = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="bg-white rounded-lg">
      {/* Order Review */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Review</h2>

        {/* Shipping Address */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-900 font-medium">{shippingData?.firstName} {shippingData?.lastName}</p>
            <p className="text-gray-600 text-sm mt-2">{shippingData?.address}</p>
            <p className="text-gray-600 text-sm">{shippingData?.city}, {shippingData?.state} {shippingData?.postalCode}</p>
            <p className="text-gray-600 text-sm mt-2">{shippingData?.phone}</p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-900 font-medium">
              {paymentData?.paymentMethod === 'card' && `Credit/Debit Card ending in ${paymentData?.cardNumber?.slice(-4)}`}
              {paymentData?.paymentMethod === 'upi' && 'UPI / Digital Payment'}
              {paymentData?.paymentMethod === 'netbanking' && 'Net Banking'}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between items-center pb-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button 
          onClick={onPrevious}
          className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
        >
          Previous
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader size={20} className="animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Place Order
            </>
          )}
        </button>
      </div>
    </div>
  );
}
