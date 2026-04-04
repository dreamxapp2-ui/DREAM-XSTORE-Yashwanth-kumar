"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8 py-16">
        {/* Success Icon */}
        <div className="relative inline-flex">
          <div className={`w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto ${showConfetti ? 'animate-bounce' : ''}`}>
            <CheckCircle className="w-14 h-14 text-green-600" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-gray-900">Order Placed!</h1>
          <p className="text-gray-500 text-lg">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left space-y-4">
          {orderId && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Order ID</span>
              <span className="text-sm font-bold text-gray-900 font-mono">{orderId}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Status</span>
            <span className="text-sm font-bold text-green-600">Confirmed</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Estimated Delivery</span>
            <span className="text-sm font-bold text-gray-900">5-7 Business Days</span>
          </div>
          <hr className="border-gray-100" />
          <p className="text-xs text-gray-400">
            You will receive an email confirmation with tracking details once your order ships.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Package className="w-4 h-4" />
            View My Orders
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
        >
          <Home className="w-3 h-3" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
