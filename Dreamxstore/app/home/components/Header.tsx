"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, ShoppingBag, User, Menu, X, ChevronDown, LogOut, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/src/contexts/CartContext";
import { UserService } from '@/src/lib/api/services/userService';
import { TokenManager } from '@/src/lib/api/tokenManager';
import { Button } from "@/src/components/ui/button";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          setUser(null);
          return;
        }
        const response = await UserService.getProfile();
        const profile = (response as any)?.user || response;
        setUser(profile);
      } catch (error) {
        console.log('Profile load error:', error);
        setUser(null);
      }
    };

    loadProfileData();

    // Listen for storage changes (login/logout)
    const handleStorageChange = (e: StorageEvent | Event) => {
      loadProfileData();
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-window updates
    window.addEventListener('auth-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    TokenManager.logout();
    window.location.href = '/login';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileOpen || isCartOpen) {
        // Simple heuristic: if the click target isn't inside a menu-related element
        const target = event.target as HTMLElement;
        if (!target.closest('.menu-trigger')) {
          setIsProfileOpen(false);
          setIsCartOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen, isCartOpen]);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "About us", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" }
  ];

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-[100]">
      <div className="w-full h-[70px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-20">
        {/* Left: Hamburger & Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-10 w-10 text-gray-700 hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
          {/* Left: Branding & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-12 w-12 flex items-center justify-center">
               <img 
                 src="https://i.postimg.cc/sx24cHZb/image-89.png" 
                 alt="DREAM X" 
                 className="w-11 h-11 object-contain hover:scale-110 transition-transform"
               />
            </div>
          </Link>
        </div>
        </div>

        {/* Center: Search Bar (Hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#004d84] transition-colors" />
            <input
              type="text"
              placeholder="Search for premium products..."
              className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-[#bef264]/30 transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full text-gray-600 hover:bg-gray-100 relative hidden sm:flex"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>

          <div className="relative menu-trigger">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsCartOpen(!isCartOpen);
                setIsProfileOpen(false);
              }}
              className={`w-10 h-10 rounded-full transition-all relative shadow-md ${isCartOpen ? 'bg-[#bef264] text-black' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-colors ${isCartOpen ? 'bg-black text-[#bef264]' : 'bg-[#bef264] text-black'}`}>
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Cart Dropdown Preview */}
            {isCartOpen && (
              <div className="absolute right-0 mt-3 w-[300px] sm:w-[380px] z-[110] transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-white rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase italic">Your Cargo ({totalItems})</h3>
                    <Link href="/cart" onClick={() => setIsCartOpen(false)} className="text-[10px] font-black text-[#004d84] underline uppercase">View Full Cart</Link>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                      <div className="py-8 text-center text-xs font-bold text-gray-400 italic">Cargo bay is empty</div>
                    ) : (
                      cart.map((item) => (
                        <div key={item._id} className="flex gap-3 group">
                           <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0">
                             <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                           </div>
                           <div className="flex-1 min-w-0">
                             <h4 className="text-[11px] font-black text-gray-900 truncate leading-tight">{item.title}</h4>
                             <p className="text-[10px] font-bold text-gray-400 mt-0.5">{item.selectedSize} • Qty: {item.quantity}</p>
                             <p className="text-xs font-black text-black mt-1">${(item.price * item.quantity).toFixed(0)}</p>
                           </div>
                           <button 
                             onClick={() => removeFromCart(item._id)}
                             className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      ))
                    )}
                  </div>
                  {cart.length > 0 && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-[10px] font-black text-gray-400 uppercase">Subtotal</span>
                         <span className="text-lg font-black text-black">
                           ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(0)}
                         </span>
                      </div>
                      <Button 
                        onClick={() => {
                          setIsCartOpen(false);
                          router.push('/cart');
                        }}
                        className="w-full bg-black text-[#bef264] hover:bg-gray-800 rounded-2xl h-12 font-black text-xs uppercase italic"
                      >
                        Secure Checkout
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative menu-trigger">
            <div 
              className="flex items-center gap-2 pl-2 py-1 cursor-pointer group"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsCartOpen(false);
              }}
            >
              <div className={`w-9 h-9 rounded-full border flex items-center justify-center overflow-hidden transition-all group-hover:scale-105 ${isProfileOpen ? 'bg-[#bef264] border-black scale-105' : 'bg-[#bef264]/20 border-[#bef264]/40'}`}>
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className={`w-5 h-5 ${isProfileOpen ? 'text-black' : 'text-[#004d84]'}`} />
                )}
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-xs font-black text-gray-900 group-hover:text-[#004d84]">
                  {user?.username || user?.firstName || user?.name || 'Guest'}
                </span>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-black' : ''}`} />
              </div>
            </div>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 sm:w-64 max-w-[calc(100vw-2rem)] z-[110] transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-[2px] shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-5 py-4 border-b border-gray-50 mb-2 bg-[#fcfcfc]">
                    <p className="text-[10px] font-black text-[#bef264] uppercase tracking-widest italic mb-1">Identity Verified</p>
                    <p className="text-base font-black text-gray-900 truncate leading-none mb-1">{user?.username || user?.firstName || user?.name || 'Guest User'}</p>
                    <p className="text-[10px] font-bold text-gray-400 truncate">{user?.email || (user ? '' : 'unregistered_access')}</p>
                  </div>
                  
                  <div className="px-2 space-y-1">
                    <Link 
                      href="/profile" 
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-black text-gray-700 hover:bg-[#bef264]/10 hover:text-black rounded-[2px] transition-all"
                    >
                      <div className="w-8 h-8 rounded-[2px] bg-gray-50 flex items-center justify-center">
                         <User className="w-4 h-4" />
                      </div>
                      <span>Profile</span>
                    </Link>
                    
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50 rounded-[2px] transition-all"
                    >
                      <div className="w-8 h-8 rounded-[2px] bg-red-50 flex items-center justify-center">
                         <LogOut className="w-4 h-4" />
                      </div>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hamburger Menu Overlay (Animated) */}
      <div 
        className={`fixed inset-0 top-[70px] bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />
      
      <div className={`fixed top-[70px] left-0 h-screen w-full sm:w-[350px] bg-white z-[100] transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
        <div className="flex flex-col p-8 gap-8">
          <div className="space-y-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Menu Navigation</p>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block text-2xl font-black text-gray-900 hover:text-[#004d84] hover:pl-2 transition-all duration-300"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="mt-auto pt-10 grid grid-cols-2 gap-4">
             <div className="bg-gray-50 p-4 rounded-2xl">
               <p className="text-xl font-black text-gray-900">10k+</p>
               <p className="text-[10px] text-gray-400 font-bold uppercase">Happy users</p>
             </div>
             <div className="bg-gray-50 p-4 rounded-2xl">
               <p className="text-xl font-black text-gray-900">24/7</p>
               <p className="text-[10px] text-gray-400 font-bold uppercase">Support</p>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
}
