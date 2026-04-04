'use client';

import { useState } from 'react';
import { CheckCircle, Loader } from 'lucide-react';
import { useCart } from '@/src/contexts/CartContext';
import { useToast } from '@/src/contexts/ToastContext';
import PaymentService from '@/src/lib/api/services/paymentService';
import ShipmentService, { ShipmentOrderData } from '@/src/lib/api/shipmentService';
import InventoryService from '@/src/lib/api/inventoryService';
import UserOrderService from '@/src/lib/api/services/orderService';

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
  const [shipmentCreated, setShipmentCreated] = useState(false);
  const [shipmentId, setShipmentId] = useState<number | null>(null);

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
              showToast('Payment successful! Processing order...', 'success', 3000);
              
              // Reduce stock after payment verification
              await reduceInventoryStock();
              
              // Create shipment after successful payment
              await createShipmentOrder(orderId, paymentId);
              
              // SAVE ORDER TO DATABASE
              await UserOrderService.createOrder({
                items: cart,
                shippingData,
                total: totalAmount,
                paymentStatus: 'completed',
                paymentMethod: paymentData?.paymentMethod || 'card'
              });
              
              // Clear cart
              localStorage.removeItem('cart');
              setTimeout(() => onComplete(), 2000);
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

  const handleDummyPayment = async () => {
    setIsProcessing(true);
    showToast('Initiating Dummy Payment...', 'info', 2000);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate ~20% failure rate for testing
      const paymentSuccess = Math.random() > 0.2;
      
      if (!paymentSuccess) {
        showToast('Dummy payment was declined. Please try again.', 'error', 4000);
        setIsProcessing(false);
        return;
      }
      
      const mockOrderId = `dummy_order_${Date.now()}`;
      const mockPaymentId = `dummy_pay_${Date.now()}`;
      
      console.log('[ReviewOrder] Dummy payment successful:', { mockOrderId, mockPaymentId });
      showToast('Dummy Payment successful! Processing order...', 'success', 3000);
      
      // SAVE ORDER TO DATABASE FIRST - if this fails, don't proceed
      await UserOrderService.createOrder({
        items: cart,
        shippingData,
        total: getTotalPrice(),
        paymentStatus: 'completed',
        paymentMethod: paymentData?.paymentMethod || 'card'
      });
      
      // Non-blocking side effects
      await reduceInventoryStock();
      await createShipmentOrder(mockOrderId, mockPaymentId);
      
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('storage'));
      setTimeout(() => onComplete(), 2000);
      
    } catch (error) {
      console.error('[ReviewOrder] Error in dummy payment:', error);
      showToast('Dummy payment failed', 'error', 4000);
      setIsProcessing(false);
    }
  };

  const reduceInventoryStock = async () => {
    try {
      console.log('[ReviewOrder] Reducing inventory stock...');

      // Transform cart items to inventory format
      const inventoryItems = InventoryService.transformCartToInventory(cart);

      const result = await InventoryService.reduceStock(inventoryItems);

      if (result && result.success) {
        console.log('[ReviewOrder] Stock reduced successfully:', result.results);
      } else if (result && result.errors) {
        console.error('[ReviewOrder] Stock reduction had errors:', result.errors);
      }
    } catch (error: any) {
      console.error('[ReviewOrder] Error reducing stock (non-blocking):', error);
      // Don't throw - order is already paid, inventory can be adjusted manually
    }
  };

  const createShipmentOrder = async (razorpayOrderId: string, razorpayPaymentId: string) => {
    try {
      console.log('[ReviewOrder] Creating shipment order...');

      // Calculate total weight and dimensions from cart items
      const totalWeight = cart.reduce((weight, item) => {
        // Default weight of 0.5kg per item if not specified
        return weight + (0.5 * item.quantity);
      }, 0);

      // Prepare order items for Shiprocket
      const orderItems = cart.map(item => ({
        name: item.title,
        sku: item._id || `SKU-${item.title}`,
        units: item.quantity,
        selling_price: item.price,
      }));

      // Prepare shipment order data
      const shipmentOrderData: ShipmentOrderData = {
        order_id: razorpayOrderId,
        order_date: new Date().toISOString().split('T')[0],
        pickup_location: 'Main Warehouse', // TODO: Get from settings or config
        billing_customer_name: shippingData.firstName,
        billing_last_name: shippingData.lastName,
        billing_address: shippingData.address,
        billing_city: shippingData.city,
        billing_state: shippingData.state,
        billing_country: shippingData.country || 'India',
        billing_pincode: shippingData.postalCode,
        billing_email: shippingData.email || 'customer@example.com',
        billing_phone: shippingData.phone,
        shipping_is_billing: true,
        order_items: orderItems,
        payment_method: 'Prepaid',
        sub_total: getTotalPrice(),
        weight: totalWeight,
        length: 30, // Default dimensions - can be calculated from cart
        breadth: 20,
        height: 10,
      };

      const shipmentResponse = await ShipmentService.createShipmentOrder(shipmentOrderData);
      
      console.log('[ReviewOrder] Shipment created:', shipmentResponse);
      setShipmentId(shipmentResponse.shipment_id);
      setShipmentCreated(true);
      
      showToast('Shipment created successfully!', 'success', 3000);

      // Optionally assign AWB and request pickup automatically
      // This can be done in background or by admin
      
    } catch (error: any) {
      console.error('[ReviewOrder] Error creating shipment:', error);
      showToast('Order placed but shipment creation failed. Contact support.', 'warning', 5000);
      // Don't throw error - order is already paid
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
        <div className="flex gap-4">
          <button
            onClick={handleDummyPayment}
            disabled={isProcessing}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isProcessing ? <Loader size={20} className="animate-spin" /> : <CheckCircle size={20} />}
            Dummy Payment
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader size={20} className="animate-spin" />
                Processing...
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
    </div>
  );
}
