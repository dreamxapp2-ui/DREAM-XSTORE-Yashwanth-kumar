"use client";

import React from "react";
import { CartProvider } from "../src/contexts/CartContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
