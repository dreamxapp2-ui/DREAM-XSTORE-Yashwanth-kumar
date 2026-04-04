"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, ShoppingBag, User, Menu, X, ChevronDown, LogOut, Trash2 } from "lucide-react";
import { ProductService, Product } from '@/src/lib/api/services/productService';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/src/contexts/CartContext";
import { UserService } from '@/src/lib/api/services/userService';
import { TokenManager } from '@/src/lib/api/tokenManager';
import { Button } from "@/src/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
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
      if (isProfileOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.menu-trigger')) {
          setIsProfileOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  // Fetch live suggestions as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await ProductService.searchProducts(searchQuery, { limit: 5 });
        let products: Product[] = [];
        if (response.data && Array.isArray(response.data)) {
          products = response.data;
        } else if ((response as any).data?.data && Array.isArray((response as any).data.data)) {
          products = (response as any).data.data;
        } else if (Array.isArray(response)) {
          products = response as unknown as Product[];
        }
        setSearchSuggestions(products.slice(0, 5));
      } catch {
        setSearchSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') setIsSearchFocused(false);
  };

  const handleSuggestionClick = (product: Product) => {
    setSearchQuery(product.name);
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    router.push(`/product/${product._id}`);
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" }
  ];

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-[100]">
      <div className="w-full h-[70px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-20 relative">
        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-0 bg-white z-[120] flex items-center px-4 gap-3 lg:hidden"
            >
              <div className="flex-1 relative" ref={searchRef}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search products..."
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-[#bef264]/30 text-sm font-medium"
                />
                
                {/* Mobile Suggestions */}
                {searchQuery.trim() && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[60vh] overflow-y-auto">
                    {isLoadingSuggestions ? (
                      <div className="px-6 py-4 text-sm text-gray-400 flex items-center gap-3">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-200 border-t-[#004d84] rounded-full"></span>
                        Searching...
                      </div>
                    ) : searchSuggestions.length > 0 ? (
                      <>
                        {searchSuggestions.map((product) => (
                          <button
                            key={product._id}
                            onMouseDown={() => {
                              handleSuggestionClick(product);
                              setIsMobileSearchOpen(false);
                            }}
                            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0"
                          >
                            <img src={product.images?.[0]} alt="" className="w-10 h-10 object-cover rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                              <p className="text-xs text-gray-400">₹{product.price}</p>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : null}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSearchOpen(false)}
                className="w-10 h-10 rounded-full text-gray-500"
              >
                <X className="w-6 h-6" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left: Hamburger & Logo */}
        <div className={`flex items-center gap-4 ${isMobileSearchOpen ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
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
        <div className="hidden lg:flex flex-1 max-w-xl mx-8" ref={searchRef}>
          <div className="relative w-full group">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#004d84] transition-colors cursor-pointer z-10" 
              onClick={handleSearch}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search for premium products..."
              className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-[#bef264]/30 transition-all text-sm font-medium"
            />
            
            {/* Suggestions Dropdown */}
            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[110]">
                {isLoadingSuggestions ? (
                  <div className="px-6 py-4 text-sm text-gray-400 flex items-center gap-3">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-200 border-t-[#004d84] rounded-full"></span>
                    Searching products...
                  </div>
                ) : searchSuggestions.length > 0 ? (
                  <>
                    <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-50">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Matches</p>
                    </div>
                    {searchSuggestions.map((product) => (
                      <button
                        key={product._id}
                        onMouseDown={() => handleSuggestionClick(product)}
                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#bef264]/5 text-left transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                          {product.images?.[0] && (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 truncate group-hover:text-[#004d84] transition-colors">{product.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-[#004d84]">₹{product.price}</p>
                        </div>
                      </button>
                    ))}
                    <button
                      onMouseDown={handleSearch}
                      className="w-full px-4 py-3 text-xs font-black text-center border-t border-gray-50 hover:bg-[#bef264] transition-all uppercase tracking-widest"
                    >
                      See all for "{searchQuery}"
                    </button>
                  </>
                ) : (
                  <div className="px-6 py-10 text-center">
                    <Search className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-400">No products found matching your search</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile/Tablet Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className={`w-10 h-10 rounded-full transition-all flex lg:hidden ${isMobileSearchOpen ? 'bg-[#bef264] text-black' : 'text-black hover:bg-gray-100'}`}
            title={isMobileSearchOpen ? "Close Search" : "Search Products"}
          >
            {isMobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full text-gray-600 hover:bg-gray-100 relative hidden sm:flex"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>

          <div className="relative">
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full transition-all relative shadow-md bg-black text-white hover:bg-gray-800"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm bg-[#bef264] text-black">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Profile Dropdown */}
          <div className="relative menu-trigger">
            <div 
              className="flex items-center gap-2 pl-2 py-1 cursor-pointer group"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
              }}
            >
              <div className={`w-9 h-9 rounded-full border flex items-center justify-center overflow-hidden transition-all group-hover:scale-105 ${isProfileOpen ? 'bg-[#bef264] border-black scale-105' : 'bg-[#bef264]/20 border-[#bef264]/40'}`}>
                {(user?.hero_image?.url || user?.hero_image || user?.profilePicture) ? (
                  <img 
                    src={typeof user.hero_image === 'object' ? user.hero_image.url : (user.hero_image || user.profilePicture)} 
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
