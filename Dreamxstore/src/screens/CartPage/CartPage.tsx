import React, { useState, useEffect } from 'react';
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, ShoppingBag, Trash2, CheckCircle, ChevronRight, LogOut, X } from 'lucide-react';
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
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 lg:p-12 relative overflow-hidden">
      {/* Background Tech Accent (Subtle Grid) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px] border border-gray-100 relative z-10">
        
        {/* LEFT SIDEBAR - Navigation Tabs */}
        <div className="w-full md:w-64 bg-[#f8f8f8] p-8 flex flex-col gap-4 border-r border-gray-100">
           <div className="mb-8">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-6">
                 <ShoppingBag className="text-[#bef264] w-6 h-6" />
              </div>
           </div>

           {/* Tab: Your Cart (Active) */}
           <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-800 rounded-2xl shadow-xl transition-transform group-hover:scale-[1.02]"></div>
              <button className="relative w-full p-5 flex items-center justify-between text-white z-10">
                 <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-tight">Your Cart</span>
                 </div>
                 <ChevronRight className="w-4 h-4 text-white/40" />
              </button>
           </div>

           {/* Tab: Auth (Inactive) */}
           <button 
             onClick={() => router.push('/login')}
             className="w-full p-5 flex items-center justify-between text-gray-400 hover:text-black hover:bg-white rounded-2xl transition-all border border-transparent hover:border-gray-100"
           >
              <div className="flex items-center gap-3">
                 <LogOut className="w-5 h-5 rotate-180" />
                 <span className="text-xs font-black uppercase tracking-tight">Sign In / Sign Up</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-200" />
           </button>

           <div className="mt-auto">
              <button onClick={() => router.push('/home')} className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-black transition-colors flex items-center gap-2">
                 <ArrowLeft className="w-3 h-3" /> Back to Store
              </button>
           </div>
        </div>

        {/* RIGHT CONTENT - Cart Items */}
        <div className="flex-1 flex flex-col bg-white">
           {/* Header */}
           <div className="p-10 pb-6 flex justify-between items-center">
              <div>
                 <h2 className="text-4xl font-black text-gray-900 leading-none">Your Cart</h2>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">Inventory Management</p>
              </div>
              <button onClick={() => router.push('/home')} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                 <X className="w-5 h-5 text-gray-400" />
              </button>
           </div>

           {/* List Area */}
           <div className="flex-1 overflow-y-auto px-10 py-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2 uppercase">Empty Chamber</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">No utility selected for deployment</p>
                  <Button onClick={() => router.push('/home')} className="bg-black text-[#bef264] rounded-full px-10 font-black italic uppercase">Deploy Shopping</Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {cart.map((item) => (
                    <div key={item._id} className="flex items-center gap-8 group">
                       {/* Item Image */}
                       <div className="w-24 h-24 bg-[#f8f8f8] rounded-[1.5rem] p-2 flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                          <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                       </div>

                       {/* Item Info */}
                       <div className="flex-1 min-w-0">
                          <h3 className="font-black text-lg text-gray-900 uppercase truncate leading-tight">{item.title}</h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                             {item.selectedSize ? `Size: ${item.selectedSize}` : 'Universal Fit'}
                          </p>
                          
                          {/* Quantity Controls */}
                          <div className="mt-4 flex items-center gap-1 bg-gray-50 w-fit p-1 rounded-xl border border-gray-100">
                             <button onClick={() => removeFromCart(item._id)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                             </button>
                             <div className="w-8 h-8 flex items-center justify-center text-xs font-black">{item.quantity}</div>
                             <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition-colors font-black">
                                +
                             </button>
                          </div>
                       </div>

                       {/* Item Price */}
                       <div className="text-right">
                          <p className="text-xl font-black text-gray-900 tracking-tight">₹{item.price * item.quantity}</p>
                       </div>
                    </div>
                  ))}
                </div>
              )}
           </div>

           {/* Footer / Summary */}
           {cart.length > 0 && (
             <div className="p-10 pt-6 border-t border-gray-50">
                <div className="flex items-center justify-center gap-3 mb-10">
                   <div className="w-8 h-8 rounded-full bg-[#bef264]/10 flex items-center justify-center text-black">
                      <CheckCircle className="w-4 h-4" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Free US Delivery Applied</p>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-baseline gap-4">
                      <span className="text-xl font-bold text-gray-400 uppercase tracking-[0.2em] italic">Total</span>
                      <span className="text-4xl font-black text-gray-900 tracking-tighter">₹{getTotalPrice()}</span>
                   </div>

                   <button 
                     onClick={handleCheckout}
                     className="bg-black text-[#bef264] px-12 h-16 rounded-[2rem] flex items-center gap-4 font-black uppercase italic hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                   >
                     <span>Check Out</span>
                     <ChevronRight className="w-5 h-5" />
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Legacy/Floating items if any */}
      {statusMessage && (
        <div className={`fixed bottom-8 right-8 p-4 rounded-2xl font-black uppercase italic shadow-2xl z-[100] ${isError ? 'bg-red-500 text-white' : 'bg-[#bef264] text-black animate-bounce'}`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
};