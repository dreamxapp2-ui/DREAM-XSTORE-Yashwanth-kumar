'use client';

import { useState } from 'react';

interface PaymentFormProps {
  onContinue: (data: any) => void;
  onPrevious: () => void;
  initialData?: any;
}

export default function PaymentForm({ onContinue, onPrevious, initialData }: PaymentFormProps) {
  const [formData, setFormData] = useState(initialData || {
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onContinue({ ...formData, paymentMethod });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg">
      {/* Payment Method */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>

        {/* Payment Options */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer"
            onClick={() => setPaymentMethod('card')}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
              className="w-4 h-4 accent-blue-600"
            />
            <label className="ml-4 flex-1 cursor-pointer font-medium text-gray-900">
              Credit / Debit Card
            </label>
          </div>

          <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer"
            onClick={() => setPaymentMethod('upi')}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="upi"
              checked={paymentMethod === 'upi'}
              onChange={() => setPaymentMethod('upi')}
              className="w-4 h-4 accent-blue-600"
            />
            <label className="ml-4 flex-1 cursor-pointer font-medium text-gray-900">
              UPI / Digital Payment
            </label>
          </div>

          <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer"
            onClick={() => setPaymentMethod('netbanking')}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="netbanking"
              checked={paymentMethod === 'netbanking'}
              onChange={() => setPaymentMethod('netbanking')}
              className="w-4 h-4 accent-blue-600"
            />
            <label className="ml-4 flex-1 cursor-pointer font-medium text-gray-900">
              Net Banking
            </label>
          </div>
        </div>

        {/* Card Details (show only if card is selected) */}
        {paymentMethod === 'card' && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Details</h3>

            {/* Cardholder Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleChange}
                required={paymentMethod === 'card'}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>

            {/* Card Number */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                required={paymentMethod === 'card'}
                maxLength={19}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234 5678 9012 3456"
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  required={paymentMethod === 'card'}
                  maxLength={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  required={paymentMethod === 'card'}
                  maxLength={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123"
                />
              </div>
            </div>
          </>
        )}

        {/* Billing Address */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Billing Address
          </label>
          <input
            type="text"
            name="billingAddress"
            value={formData.billingAddress}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Same as shipping"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button 
          type="button"
          onClick={onPrevious}
          className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
        >
          Previous
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
