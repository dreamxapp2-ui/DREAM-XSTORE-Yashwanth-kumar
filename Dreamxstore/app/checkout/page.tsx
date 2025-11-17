'use client';

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import StepIndicator from '@/src/components/checkout/step-indicator';
import ShippingForm from '@/src/components/checkout/shipping-form';
import PaymentForm from '@/src/components/checkout/payment-form';
import ReviewOrder from '@/src/components/checkout/review-order';
import OrderSummary from '@/src/components/checkout/order-summary';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const [shippingData, setShippingData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  const handleShippingContinue = (data: any) => {
    setShippingData(data);
    setCurrentStep(2);
  };

  const handlePaymentContinue = (data: any) => {
    setPaymentData(data);
    setCurrentStep(3);
  };

  const handleReviewComplete = () => {
    // Handle order completion
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <StepIndicator currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <ShippingForm 
                onContinue={handleShippingContinue}
                initialData={shippingData}
              />
            )}
            {currentStep === 2 && (
              <PaymentForm 
                onContinue={handlePaymentContinue}
                onPrevious={() => setCurrentStep(1)}
                initialData={paymentData}
              />
            )}
            {currentStep === 3 && (
              <ReviewOrder 
                shippingData={shippingData}
                paymentData={paymentData}
                onPrevious={() => setCurrentStep(2)}
                onComplete={handleReviewComplete}
              />
            )}
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
