"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { Search, Bell, ShoppingBag, User, Menu, X, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../../../contexts/CartContext";
import { UserService } from '@/src/lib/api/services/userService';

export const LandingHeader = () => {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const { cart } = useCart();
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

    // Listen for storage changes
    const handleStorageChange = () => {
      loadProfileData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "About us", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" }
  ];

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-[100]">
      <div className="w-full h-[70px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Left: Hamburger & LogoIcon */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-10 w-10 text-gray-700 hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
          
          <Link href="/home" className="flex-shrink-0">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="https://i.postimg.cc/sx24cHZb/image-89.png" 
                alt="DREAM X" 
                className="w-10 h-10 object-contain hover:scale-110 transition-transform"
              />
            </div>
          </Link>
        </div>

        {/* Center: Search Bar - Expanded since links are removed */}
        <div className="flex-1 max-w-xl mx-8 hidden sm:block">
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </span>
            <input
              type="text"
              placeholder="Search for products, brands..."
              className="w-full h-[45px] pl-10 pr-4 rounded-full bg-[#f8f8f8] border-none focus:ring-2 focus:ring-[#bef264]/20 transition-all text-sm text-gray-700 placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full text-black hover:bg-gray-50 relative"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/cart')}
            className="w-10 h-10 rounded-full bg-black text-white hover:bg-gray-900 shadow-md relative group active:scale-95 transition-transform"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {totalItems}
              </span>
            )}
          </Button>

          {/* User Profile */}
          <div 
            className="relative"
            onMouseEnter={() => setIsProfileHovered(true)}
            onMouseLeave={() => setIsProfileHovered(false)}
          >
            <div className="w-10 h-10 rounded-full bg-[#bef264]/20 border border-[#bef264]/40 flex items-center justify-center overflow-hidden cursor-pointer transition-transform hover:scale-105 active:scale-95">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-[#004d84]" />
              )}
            </div>

            {/* Profile Dropdown */}
            {isProfileHovered && (
              <div className="absolute right-0 mt-0 pt-2 w-48 transition-all animate-in fade-in slide-in-from-top-2 duration-200 z-[110]">
                <div className="bg-white rounded-[2px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden py-2">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hi, {user?.username || user?.firstName || user?.name?.split(' ')[0] || 'Guest'}</p>
                    <p className="text-xs font-bold text-gray-900 truncate">{user?.email || (user ? '' : 'Welcome back')}</p>
                  </div>
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[#004d84] transition-colors rounded-[2px]">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors rounded-[2px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer Overlay */}
      <div 
        className={`fixed inset-0 top-[70px] bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />
      
      {/* Drawer Menu */}
      <div className={`fixed top-[70px] left-0 h-screen w-full sm:w-[350px] bg-white z-[120] transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
        <div className="flex flex-col p-8 gap-10">
          <div className="space-y-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Navigation</p>
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
          
          <div className="mt-10 pt-10 border-t border-gray-100 space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-[#bef264]/20 flex items-center justify-center text-[#004d84]">
                 <ShoppingBag className="w-6 h-6" />
               </div>
               <div>
                 <p className="font-black text-gray-900">Your Cart</p>
                 <p className="text-xs text-gray-400 font-bold">{totalItems} Items waiting</p>
               </div>
            </div>
            <Button 
               onClick={() => { setIsMenuOpen(false); router.push('/home'); }}
               className="w-full bg-[#004d84] text-white rounded-full h-14 font-black shadow-lg shadow-blue-900/10"
            >
               Explore Store
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
