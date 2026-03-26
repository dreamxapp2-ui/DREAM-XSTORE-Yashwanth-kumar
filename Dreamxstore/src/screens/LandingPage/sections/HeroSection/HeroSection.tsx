"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { Search, Bell, ShoppingBag, User, Menu, X, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../../../contexts/CartContext";
import { UserService } from '@/src/lib/api/services/userService';

export const HeroSection = () => {
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
          
          <Link href="/home" className="flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center">
              {/* Logo - Red D shape */}
              <svg viewBox="0 0 40 40" className="w-8 h-8 fill-red-500">
                <path d="M10 5 C 10 5, 25 5, 30 15 C 35 25, 25 35, 10 35 L 10 5 Z M 15 10 L 15 30 C 20 30, 25 25, 25 20 C 25 15, 20 10, 15 10 Z" />
              </svg>
            </div>
            <span className="text-xl font-black text-gray-900 hidden sm:block">DREAM X</span>
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 ml-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-sm font-bold text-gray-700 hover:text-[#004d84] transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xs mx-4 hidden lg:block">
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-4 h-4 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-10 pl-9 pr-4 rounded-full bg-gray-50 border-none focus:ring-1 focus:ring-[#004d84] text-xs transition-all"
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
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/cart')}
            className="w-10 h-10 rounded-full bg-black text-white hover:bg-gray-800 relative shadow-md shadow-black/10"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#bef264] text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {totalItems}
              </span>
            )}
          </Button>

          {/* Profile Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsProfileHovered(true)}
            onMouseLeave={() => setIsProfileHovered(false)}
          >
            <div className="flex items-center gap-2 pl-2 py-1 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-[#bef264]/20 border border-[#bef264]/40 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-[#004d84]" />
                )}
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-xs font-black text-gray-900 group-hover:text-[#004d84]">
                  {user?.name?.split(' ')[0] || 'Guest'}
                </span>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isProfileHovered ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Hover Menu */}
            {isProfileHovered && (
              <div className="absolute right-0 mt-0 pt-2 w-48 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden py-2">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">User Details</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Guest'}</p>
                  </div>
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[#004d84] transition-colors">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
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
        </div>
      </div>
    </header>
  );
};