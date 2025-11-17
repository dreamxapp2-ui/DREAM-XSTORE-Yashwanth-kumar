import { MapPin, CreditCard, Eye } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: 'Step 01', title: 'Shipping', icon: MapPin },
    { number: 2, label: 'Step 02', title: 'Payment', icon: CreditCard },
    { number: 3, label: 'Step 03', title: 'Review', icon: Eye },
  ];

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          {/* Step Circle and Info */}
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= step.number
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              <step.icon size={24} />
            </div>
            <div>
              <p
                className={`text-xs font-medium ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>
              <p
                className={`text-base font-semibold ${
                  currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {step.title}
              </p>
            </div>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
          )}
        </div>
      ))}
    </div>
  );
}
