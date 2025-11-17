import React, { useState, useEffect } from 'react';
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, ShoppingBag, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useRouter } from 'next/navigation';
import DownloadButton from '../../components/DownloadButton';
import RazorpayPaymentUI from '../../components/Payment/RazorpayPaymentUI';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  // Address management
  const [addresses, setAddresses] = useState<{id: string, text: string}[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState<{charge: number, eta: string} | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");
  const [couponCode, setCouponCode] = useState('');
  const [totals, setTotals] = useState({ tax: 0, shipping: 0, subtotal: 0, total: 0 });
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState('');
  const [backendOrderId, setBackendOrderId] = useState('');
  const [token, setToken] = useState('');
  const [billingDetails, setBillingDetails] = useState({
    billing_customer_name: '',
    billing_address: '',
    billing_city: '',
    billing_pincode: '',
    billing_state: '',
    billing_country: '',
    billing_email: '',
    billing_phone: '',
    pickup_location: '',
  });

  useEffect(() => {
    // Load addresses from localStorage if needed
    const saved = localStorage.getItem('addresses');
    if (saved) setAddresses(JSON.parse(saved));
  }, []);

  useEffect(() => {
    // Update totals when cart or shipping changes
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const tax = 0;
    const shipping = totals.shipping || 0;
    const total = subtotal + tax + shipping;
    setTotals({ tax, shipping, subtotal, total });
  }, [cart, totals.shipping]);

  const getTotalItems = () => cart.reduce((total, item) => total + item.quantity, 0);
  const getTotalPrice = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleContinueShopping = () => {
    router.push('/home');
  };

  const clearCart = () => {
    localStorage.removeItem('cart');
    window.location.reload();
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillingDetails({
      ...billingDetails,
      [e.target.name]: e.target.value
    });
  };

  function loadScript(src: string) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Address add
  const handleAddAddress = () => {
    if (billingDetails.billing_address.trim() !== '') {
      const newEntry = { id: uuidv4(), text: billingDetails.billing_address };
      const updated = [...addresses, newEntry];
      setAddresses(updated);
      setNewAddress('');
      localStorage.setItem('addresses', JSON.stringify(updated));
      setBillingDetails(prev => ({ ...prev, billing_address: '' }));
    }
  };

  // Pin code delivery check
  const handlePinChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPin(value);
    setDeliveryInfo(null);
    setPinError("");
    let pickup_postcode = "560066";
    if (cart.length > 0 && (cart[0] as any).pincode) {
      pickup_postcode = (cart[0] as any).pincode;
    }
    if (value.length === 6) {
      setPinLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PAY_API_URL || ""}/orders/get-delivery-price`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pickup_postcode, delivery_postcode: value })
          }
        );
        if (!res.ok) throw new Error("Invalid pin or server error");
        const data = await res.json();
        setTotals(t => ({ ...t, shipping: Number(data.delivery_cost), total: t.subtotal + t.tax + Number(data.delivery_cost) }));
        setDeliveryInfo({ charge: data.delivery_cost, eta: data.estimated_delivery_days });
      } catch (err) {
        setPinError("Could not fetch delivery info for this pin.");
      } finally {
        setPinLoading(false);
      }
    }
  };

  // Remove address
  const handleRemoveAddress = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem('addresses', JSON.stringify(updated));
  };

  const handleCheckout = () => {
    // Redirect to checkout page
    router.push('/checkout');
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      showToast('Verifying payment...', 'info', 0);
      const UAT_PAY_API_URL = process.env.NEXT_PUBLIC_PAY_API_URL || "";
      await axios.post(`${UAT_PAY_API_URL}/payment/verify`, {
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      showToast('Payment verified successfully! Order confirmed.', 'success', 4000);
      setOrderSuccess(true);
      // Clear cart after successful payment
      localStorage.removeItem('cart');
      // Redirect to home or order confirmation page
      setTimeout(() => router.push('/home'), 2000);
    } catch (verifyError) {
      console.error('Payment verification failed:', verifyError);
      showToast('Payment verification failed', 'error', 4000);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    showToast(`Payment error: ${error?.description || 'Unknown error'}`, 'error', 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button 
            onClick={() => router.back()}
            className="text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex items-center gap-2">
            <ShoppingBag size={24} className="text-gray-800" />
            <span className="text-xl font-bold text-gray-900">Shopping Bag</span>
            {getTotalItems() > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                {getTotalItems()}
              </span>
            )}
          </div>
          
          <div className="w-6" />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mb-6" />
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Your bag is empty</h2>
            <p className="text-gray-500 mb-6 max-w-md">
              Looks like you haven't added anything to your bag yet. Start shopping to fill it up!
            </p>
            <button 
              onClick={handleContinueShopping}
              className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column - Items */}
            <div className="lg:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Items in your bag</h2>
                <button 
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-600 font-semibold"
                >
                  Clear all
                </button>
              </div>

              {/* Product Cards */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item._id} className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-32 w-32 rounded-lg object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {item.title}
                            </h3>
                            {item.selectedSize && (
                              <p className="mt-1 text-sm text-gray-600">Size: {item.selectedSize}</p>
                            )}
                            <p className="mt-3 text-xl font-bold text-gray-900">₹{item.price}</p>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        {/* Quantity Display */}
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">Quantity: <span className="font-semibold text-gray-900">{item.quantity}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>

                {/* Summary Items */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Subtotal ({getTotalItems()} items)</span>
                    <span className="font-semibold text-gray-900">₹{getTotalPrice()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Shipping</span>
                    <span className="font-semibold text-green-500">Free</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-700">Tax</span>
                    <span className="font-semibold text-gray-900">₹0</span>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">₹{getTotalPrice()}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 space-y-3">
                  <button 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full rounded-full bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                  </button>
                  <button 
                    onClick={handleContinueShopping}
                    className="w-full rounded-full border-2 border-gray-900 py-3 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Continue Shopping
                  </button>
                </div>

                {/* Error/Status Message */}
                {statusMessage && (
                  <div className={`mt-4 p-3 rounded text-center text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {statusMessage}
                  </div>
                )}

                {/* Download Options */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Download Options</h4>
                  <div className="flex gap-2">
                    <DownloadButton
                      type="catalog"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Catalog
                    </DownloadButton>
                    <DownloadButton
                      type="user-data"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      My Data
                    </DownloadButton>
                  </div>
                </div>

                {/* Success Message */}
                {orderSuccess && (
                  <div className="mt-4 flex items-center justify-center py-2 text-green-600 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Order placed successfully!
                  </div>
                )}

                {/* Security Badge */}
                <div className="mt-6 flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Secure checkout guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};