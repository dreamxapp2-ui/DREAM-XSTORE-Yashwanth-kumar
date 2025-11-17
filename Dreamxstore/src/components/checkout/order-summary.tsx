'use client';

import { useCart } from '@/src/contexts/CartContext';
import { CheckCircle } from 'lucide-react';

export default function OrderSummary() {
  const { cart } = useCart();

  const getTotalPrice = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const getTotalItems = () => cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="sticky top-8 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

      {/* Items List */}
      <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
        {cart.map((item) => (
          <div key={item._id} className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">{item.title}</p>
              <p className="text-xs text-gray-600 mt-1">Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold text-gray-900 text-sm">₹{item.price * item.quantity}</p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Subtotal ({getTotalItems()} items)</span>
          <span className="font-semibold text-gray-900">₹{getTotalPrice()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Shipping</span>
          <span className="font-semibold text-green-600">Free</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Tax</span>
          <span className="font-semibold text-gray-900">₹0</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between mb-6">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-lg font-bold text-gray-900">₹{getTotalPrice()}</span>
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
        <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
        <span className="text-sm text-gray-700">Secure checkout guaranteed</span>
      </div>
    </div>
  );
}
