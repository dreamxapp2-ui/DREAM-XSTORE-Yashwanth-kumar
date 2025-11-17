"use client";

import React, { useEffect } from "react";
import { CartProvider } from "../src/contexts/CartContext";
import { ToastProvider } from "../src/contexts/ToastContext";
import { ToastDisplay } from "../src/components/Toast/ToastDisplay";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize MSW in development
    if (process.env.NODE_ENV === 'development') {
      import('../src/mocks/browser').then(({ worker }) => {
        worker.start({ 
          onUnhandledRequest: 'warn',
        }).catch((error) => {
          console.error('MSW failed to start:', error);
        });
      }).catch((error) => {
        console.error('Failed to import MSW:', error);
      });
    }
  }, []);

  return (
    <ToastProvider>
      <CartProvider>{children}</CartProvider>
      <ToastDisplay />
    </ToastProvider>
  );
}
