"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { X, Menu, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../../../contexts/CartContext";
import { UserService } from '@/src/lib/api/services/userService';

export const HeroSection = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { cart } = useCart();
  const router = useRouter();

  // Load user from localStorage on client side only
  // useEffect(() => {
  //   const loadUser = () => {
  //     if (typeof window !== 'undefined') {
  //       const u = localStorage.getItem("dreamx_user");
  //       setUser(u ? JSON.parse(u) : null);
  //     }
  //   };

  //   loadUser();

  //   const onStorage = () => {
  //     loadUser();
  //   };

  //   window.addEventListener("storage", onStorage);
  //   return () => window.removeEventListener("storage", onStorage);
  // }, []);
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
        console.log('Profile load error (user may not be logged in):', error);
        setUser(null);
      }
    };

    loadProfileData();
  }, []);


  const navLinks = [
    { text: "Home", path: "/home", className: "whitespace-nowrap" },
    { text: "About us", path: "/about" },
    { text: "Services", path: "/services" },
    { text: "Contact", path: "/contact" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCartClick = () => {
    router.push('/cart');
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <header className="w-full h-[65px] bg-white border-b border-gray-100 shadow-sm">
        <div className="w-full h-full mx-auto relative flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <img
              src="https://i.postimg.cc/sx24cHZb/image-89.png"
              alt="Dream X Store"
              className="h-14 sm:h-16 w-auto object-contain py-1"
            />
          </Link>

          {/* Desktop Navigation - Properly positioned */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 2xl:gap-8 flex-shrink-0">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.path}
                className={`font-mono font-normal text-black text-base xl:text-lg hover:text-[#004d84] transition-colors p-0 h-auto whitespace-nowrap ${link.className || ""}`}
              >
                {link.text}
              </Link>
            ))}

            {/* CTA Button or User Avatar with Name */}
            {user ? (
              <div className="relative group">
                <Button
                  variant="ghost"
                  className="min-w-[120px] max-w-[200px] h-[34px] xl:h-[42px] 2xl:h-[34px] rounded-[1px] px-4 flex items-center gap-2 cursor-pointer bg-transparent hover:bg-gray-100"
                  onClick={() => router.push('/profile')}
                >
                  <span className="font-mono font-normal text-[#004d84] text-[12px] xl:text-[14px] 2xl:text-[14px]">
                    {user.username}
                  </span>
                  <svg className="w-4 h-4 ml-1 text-[#004d84]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </Button>
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 pointer-events-auto group-hover:pointer-events-auto group-focus-within:pointer-events-auto" tabIndex={-1}>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => router.push('/profile')}
                  >
                    Profile
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => {
                      localStorage.removeItem('dreamx_user');
                      setUser(null);
                      window.dispatchEvent(new Event('storage'));
                      router.push('/');
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Button
                className="w-[90px] xl:w-[120px] 2xl:w-[110px] h-[30px] xl:h-[42px] 2xl:h-[34px] bg-[#f0ff7f] rounded-[1px] hover:bg-[#e5f570] transition-colors ml-4 xl:ml-6 2xl:ml-8 flex-shrink-0 flex items-center justify-center"
                onClick={() => router.push("/login")}
              >
                <span className="font-mono font-normal text-[#004d84] text-[10px] xl:text-[12px] 2xl:text-[12px] whitespace-nowrap leading-none mr-[0px]">
                  Get Started
                </span>
              </Button>
            )}

            {/* Shopping Bag Icon - Bigger size */}
            <div className="relative pl-2 group flex-shrink-0 ">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCartClick}
                className="w-[40px] h-[40px] xl:w-[44px] xl:h-[44px] 2xl:w-[48px] 2xl:h-[48px] hover:bg-gray-100 rounded-full transition-all duration-300 cursor-pointer shadow-md shadow-gray-200 hover:shadow-md"
              >
                <ShoppingBag className="w-6 h-6 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 text-gray-700 hover:text-[#004d84] transition-colors " />
              </Button>

              {/* Cart Items Badge - Show only if items > 0 */}
              {totalItems > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4  bg-red-500 text-white text-xs  font-bold rounded-full flex items-center justify-center shadow-sm">
                  {totalItems > 99 ? '99+' : totalItems}
                </div>
              )}

              {/* Hover tooltip */}
              <div className="absolute top-full right-0 mt-2 w-16 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Cart
                <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Button - Responsive sizing */}
          <Button
            variant="ghost"
            className="lg:hidden p-2 h-auto flex-shrink-0"
            onClick={toggleMobileMenu}
          >
            <Menu className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={toggleMobileMenu}
          />
        )}

        {/* Mobile Menu - Fixed positioning */}
        <div className={`fixed top-0 right-0 h-full w-[70vw] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
          {/*  Added fixed to avoid overflow  */}
          <div className="flex flex-col fixed-h-[calc(100vh-180px)]">
            {/* Mobile Menu Header with Logo and Cart */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <img
                  src="https://i.postimg.cc/sx24cHZb/image-89.png"
                  alt="Dream X Store"
                  className="h-10 w-auto object-contain"
                />

                {/* Mobile Cart Icon - Bigger */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCartClick}
                    className="w-10 h-10 hover:bg-gray-100 rounded-full "
                  >
                    <ShoppingBag className="w-6 h-6 text-gray-700" />
                  </Button>
                  {totalItems > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {totalItems > 99 ? '99+' : totalItems}
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                className="p-2 h-auto"
                onClick={toggleMobileMenu}
              >
                <X className="w-6 h-6 text-gray-600" />
              </Button>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 px-6 py-12 flex flex-col justify-center">
              <div className="space-y-8 text-center">
                {navLinks.map((link, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6">
                    <Link
                      href={link.path}
                      onClick={toggleMobileMenu}
                      className="text-2xl font-bold text-black p-0 h-auto font-mono uppercase tracking-wider hover:text-[#004d84] transition-colors"
                    >
                      {link.text.toUpperCase()}
                    </Link>
                  </div>
                ))}

                {/* Get Started Button in Menu */}
                <div className="pt-4">
                  {user ? (
                    <Button
                      variant="ghost"
                      className="w-auto h-[34px] xl:h-[42px] 2xl:h-[34px] rounded-[1px] px-4 flex items-center gap-2 bg-transparent hover:bg-gray-100"
                      onClick={() => { toggleMobileMenu(); router.push('/profile'); }}
                    >
                      <span className="font-mono font-normal text-[#004d84] text-[12px] xl:text-[14px] 2xl:text-[14px]">
                        {user.username}
                      </span>
                    </Button>
                  ) : (
                    <Button
                      variant="link"
                      onClick={() => router.push("/login")}
                      className="text-2xl font-bold text-black p-0 h-auto font-mono uppercase tracking-wider hover:text-[#004d84] transition-colors"
                    >
                      GET STARTED
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};