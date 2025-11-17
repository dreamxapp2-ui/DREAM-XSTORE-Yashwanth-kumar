'use client';

import React from 'react';
import { useToast } from '@/src/contexts/ToastContext';
import { Button } from '@/src/components/ui/button';

export const ToastDemo: React.FC = () => {
  const { showToast } = useToast();

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-3 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-black mb-4">Toast Notification Demo</h3>
      
      <Button
        onClick={() => showToast('Operation completed successfully!', 'success', 4000)}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        Show Success Toast
      </Button>

      <Button
        onClick={() => showToast('An error occurred while processing your request', 'error', 4000)}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        Show Error Toast
      </Button>

      <Button
        onClick={() => showToast('Please review your input before continuing', 'warning', 4000)}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        Show Warning Toast
      </Button>

      <Button
        onClick={() => showToast('This is informational content', 'info', 4000)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        Show Info Toast
      </Button>

      <Button
        onClick={() => 
          showToast('Item added to your cart', 'success', 4000, {
            label: 'View Cart',
            onClick: () => alert('Navigate to cart')
          })
        }
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
      >
        Show Toast with Action
      </Button>

      <Button
        onClick={() => {
          showToast('Multiple toasts can appear together!', 'info', 3000);
          setTimeout(() => {
            showToast('They stack nicely', 'success', 3000);
          }, 500);
        }}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        Show Multiple Toasts
      </Button>

      <Button
        onClick={() => showToast('This message will not auto-dismiss', 'warning', 0)}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
      >
        Show Persistent Toast
      </Button>
    </div>
  );
};
