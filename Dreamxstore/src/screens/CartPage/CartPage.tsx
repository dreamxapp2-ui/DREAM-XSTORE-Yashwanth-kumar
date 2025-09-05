/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import DownloadButton from '../../components/DownloadButton';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

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
    navigate('/');
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
          `${import.meta.env.VITE_PAY_API_URL || ""}/orders/get-delivery-price`,
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

  // Checkout logic with backend order creation and Razorpay
  const handleCheckout = async () => {
    // Only check required fields (exclude pickup_location)
    const requiredFields = [
      'billing_customer_name',
      'billing_address',
      'billing_city',
      'billing_pincode',
      'billing_state',
      'billing_country',
      'billing_email',
      'billing_phone',
    ];
    for (const key of requiredFields) {
      if (!billingDetails[key as keyof typeof billingDetails]) {
        alert('Please fill all billing details.');
        return;
      }
    }
    setIsProcessing(true);
    setStatusMessage("");
    setIsError(false);
    // Try to get token from localStorage, fallback to dreamx_user if not found
    let token = localStorage.getItem("token");
    if (!token || token.trim() === "") {
      const userStr = localStorage.getItem("dreamx_user");
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj.token) {
            token = userObj.token;
          }
        } catch {}
      }
    }
    // Check if token is valid and not expired
    const isTokenValid = () => {
      if (!token) return false;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
      } catch (e) {
        return false;
      }
    };
    if (!token || token.trim() === "" || !isTokenValid()) {
      setStatusMessage("You must be logged in to checkout. Please log in and try again.");
      setIsError(true);
      setIsProcessing(false);
      return;
    }
    // Defensive: ensure all cart items have valid _id (24 hex chars) and price is a number, and send only required fields
    const validCart = cart
      .filter(item => typeof item._id === 'string' && /^[a-fA-F0-9]{24}$/.test(item._id))
      .map(item => ({
        _id: item._id,
        title: item.title,
        category: item.category || '',
        size: item.selectedSize || '',
        price: typeof item.price === 'number' ? item.price : parseInt(String(item.price).replace(/[^\d]/g, '')),
        quantity: item.quantity,
        image: item.image || '',
      }));
    if (validCart.length !== cart.length) {
      setStatusMessage('One or more cart items are invalid. Please remove and re-add your products.');
      setIsError(true);
      setIsProcessing(false);
      console.error('[Checkout] Invalid cart items:', cart);
      return;
    }
    // Log outgoing payload for debugging
    const outgoingPayload = {
      address: billingDetails.billing_address,
      items: validCart,
      totals,
      ...billingDetails
    };
    console.log('[Checkout] Outgoing payload to /getorderid:', outgoingPayload);
    try {
      await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      // Prepare orderData for Razorpay prefill and notes
      const orderData = {
        totals,
        billing_customer_name: billingDetails.billing_customer_name,
        billing_email: billingDetails.billing_email,
        billing_phone: billingDetails.billing_phone,
        address: billingDetails.billing_address,
      };
      const UAT_PAY_API_URL = import.meta.env.VITE_PAY_API_URL || "";
      // Validate amount
      const amount = Number(orderData.totals.total);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount value');
      }
      // Only send amount to backend
      const response = await axios.post(
        `${UAT_PAY_API_URL}/getorderid`,
        outgoingPayload,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      const data = response.data;
      console.log("[Checkout] backend response:", data);
      if (!data.orderid || !data.orderid.id) {
        setStatusMessage("Failed to get payment order id.");
        setIsError(true);
        setIsProcessing(false);
        return;
      }
      // Razorpay expects amount in paise (integer)
      const amountPaise = Math.round(amount * 100);
      console.log("[Checkout] Razorpay amount (paise):", amountPaise);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: amountPaise + "",
        currency: "INR",
        name: "Dream X Store",
        description: "Order Payment",
        order_id: data.orderid.id,
        handler: async function (response: any) {
          try {
            await axios.post(`${UAT_PAY_API_URL}/verifypayment`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }, {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              }
            });
            // Optionally show success message or redirect
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError);
          }
        },
        prefill: {
          name: orderData.billing_customer_name,
          email: orderData.billing_email,
          contact: orderData.billing_phone
        },
        notes: {
          address: orderData.address
        },
        theme: { color: "#3399cc" },
      };
      // @ts-ignore
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      setStatusMessage("✅ Thank you for your purchase please complete payment!.");
      setIsError(false);
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.error('Invalid request:', error.response.data);
        setStatusMessage('Invalid payment request. Please check your details.');
      } else {
        console.error("[Checkout] Payment error:", error);
        setStatusMessage("Failed to initiate payment. Please try again.");
      }
      setIsError(true);
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-[40px] hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-700" />
            <h1 className="text-lg font-semibold">Shopping Bag</h1>
            {getTotalItems() > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {getTotalItems()}
              </span>
            )}
          </div>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mb-6" />
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Your bag is empty</h2>
            <p className="text-gray-500 mb-6 max-w-md">
              Looks like you haven't added anything to your bag yet. Start shopping to fill it up!
            </p>
            <Button 
              onClick={handleContinueShopping}
              className="bg-black text-white hover:bg-gray-800 px-8 py-3 rounded-[30px]"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          /* Cart Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Items in your bag</h2>
                <Button
                  variant="ghost"
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Clear all
                </Button>
              </div>

              {cart.map((item) => (
                <Card key={item._id} className="border border-gray-200 rounded-[1px] overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div 
                        className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-[1px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                        // onClick={() => handleProductClick(item.slug)}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 
                            className="font-medium text-lg text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                            // onClick={() => handleProductClick(item.slug)}
                          >
                            {item.title}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-500 hover:text-red-700 h-8 w-8 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mb-4">₹{item.price}</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="h-8 w-8 rounded-[1px]"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="h-8 w-8 rounded-[1px]"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary & Billing */}
            <div className="lg:col-span-1">
              <Card className="border border-gray-200 rounded-[1px] sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span>₹{getTotalPrice()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>₹0</span>
                    </div>
                    <hr className="my-3" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{getTotalPrice()}</span>
                    </div>
                  </div>
                  <form className="space-y-3 mb-3">
                    <input type="text" name="billing_customer_name" value={billingDetails.billing_customer_name} onChange={handleBillingChange} placeholder="Full Name" className="w-full px-4 py-2 border rounded-lg mb-2" />
                    <input type="text" name="billing_address" value={billingDetails.billing_address} onChange={handleBillingChange} placeholder="Address" className="w-full px-4 py-2 border rounded-lg mb-2" />
                    <input type="text" name="billing_city" value={billingDetails.billing_city} onChange={handleBillingChange} placeholder="City" className="w-full px-4 py-2 border rounded-lg mb-2" />
                    <input type="text" name="billing_pincode" value={billingDetails.billing_pincode} onChange={handleBillingChange} placeholder="Pincode" className="w-full px-4 py-2 border rounded-lg mb-2" />
                    <input type="text" name="billing_state" value={billingDetails.billing_state} onChange={handleBillingChange} placeholder="State" className="w-full px-4 py-2 border rounded-lg mb-2" />
                    <input type="text" name="billing_country" value={billingDetails.billing_country} onChange={handleBillingChange} placeholder="Country" className="w-full px-4 py-2 border rounded-lg mb-2" />
                    <input type="email" name="billing_email" value={billingDetails.billing_email} onChange={handleBillingChange} placeholder="Email" className="w-full px-4 py-2 border rounded-lg mb-2" />
                    <input type="tel" name="billing_phone" value={billingDetails.billing_phone} onChange={handleBillingChange} placeholder="Phone" className="w-full px-4 py-2 border rounded-lg mb-2" />
                  </form>
                  <div className="space-y-3">
                    <Button 
                      onClick={handleCheckout}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-[30px] h-12 text-base font-medium"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                    </Button>
                    <Button 
                      onClick={handleContinueShopping}
                      variant="outline"
                      className="w-full border-black text-black hover:bg-gray-50 rounded-[30px] h-12 text-base font-medium"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                  {statusMessage && (
                    <div className={`mt-4 p-3 rounded text-center text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{statusMessage}</div>
                  )}
                  
                  {/* Download Options */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
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
                  
                  {orderSuccess && (
                    <div className="flex items-center justify-center mt-3 py-2 text-green-600 font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Order placed successfully!
                    </div>
                  )}
                  {/* Security Badge */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>Secure checkout guaranteed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};