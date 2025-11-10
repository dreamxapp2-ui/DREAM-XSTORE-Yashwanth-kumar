"use client";

import React, { useEffect } from "react";
import { CartProvider } from "../src/contexts/CartContext";

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

  return <CartProvider>{children}</CartProvider>;
}
