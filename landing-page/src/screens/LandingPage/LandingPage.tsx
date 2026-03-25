"use client";

import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Menu, ShoppingBag, X } from "lucide-react";

export const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { text: "Home", path: "#home" },
    { text: "About us", path: "#about" },
    { text: "Services", path: "#services" },
    { text: "Contact", path: "#contact" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Header/Navigation */}
      <header className="w-full h-[65px] bg-white border-b border-gray-100 shadow-sm fixed top-0 z-50">
        <div className="w-full h-full mx-auto relative flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          {/* Logo */}
          <a href="/" className="flex items-center flex-shrink-0">
            <img
              src="https://i.postimg.cc/xTVNmCps/Dream-X-Store.png"
              alt="Dream X Store"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 2xl:gap-8 flex-shrink-0">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.path}
                className="[font-family:'Azeret_Mono',Helvetica] font-normal text-black text-base xl:text-lg hover:text-[#004d84] transition-colors"
              >
                {link.text}
              </a>
            ))}

            {/* Get Started Button */}
            <Button
              className="w-[90px] xl:w-[120px] 2xl:w-[110px] h-[30px] xl:h-[42px] 2xl:h-[34px] bg-[#f0ff7f] rounded-[1px] hover:bg-[#e5f570] transition-colors ml-4 xl:ml-6 2xl:ml-8 flex-shrink-0 flex items-center justify-center"
              onClick={() => alert("Get Started clicked!")}
            >
              <span className="[font-family:'Azeret_Mono',Helvetica] font-normal text-[#004d84] text-[10px] xl:text-[12px] 2xl:text-[12px] whitespace-nowrap leading-none">
                Get Started
              </span>
            </Button>

            {/* Shopping Bag Icon */}
            <div className="relative pl-2 group flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => alert("Cart clicked!")}
                className="w-[40px] h-[40px] xl:w-[44px] xl:h-[44px] 2xl:w-[48px] 2xl:h-[48px] hover:bg-gray-100 rounded-full transition-all duration-300 cursor-pointer shadow-md shadow-gray-200 hover:shadow-md"
              >
                <ShoppingBag className="w-6 h-6 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 text-gray-700 hover:text-[#004d84] transition-colors" />
              </Button>
              <div className="absolute top-full right-0 mt-2 w-16 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Cart
              </div>
            </div>
          </nav>

          {/* Mobile Menu Button */}
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

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 right-0 h-full w-[70vw] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <img
                src="https://i.postimg.cc/xTVNmCps/Dream-X-Store.png"
                alt="Dream X Store"
                className="h-7 w-auto object-contain"
              />
              <Button
                variant="ghost"
                className="p-2 h-auto"
                onClick={toggleMobileMenu}
              >
                <X className="w-6 h-6 text-gray-600" />
              </Button>
            </div>

            {/* Mobile Menu Links */}
            <div className="flex-1 px-6 py-12 flex flex-col justify-center space-y-8 text-center">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.path}
                  onClick={toggleMobileMenu}
                  className="text-2xl font-bold text-black font-mono uppercase tracking-wider hover:text-[#004d84] transition-colors"
                >
                  {link.text.toUpperCase()}
                </a>
              ))}
              <Button
                className="bg-[#f0ff7f] text-[#004d84] hover:bg-[#e5f570] rounded-[1px]"
                onClick={() => alert("Get Started clicked!")}
              >
                GET STARTED
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-[65px]">
        {/* Hero Section */}
        <section className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 [font-family:'Azeret_Mono',Helvetica]">
              Welcome to Dream X Store
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover unique, innovative products from emerging brands. Your gateway to discovering quality, creativity, and originality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-[#f0ff7f] text-[#004d84] hover:bg-[#e5f570] px-8 py-3 text-lg"
                onClick={() => alert("Explore Products clicked!")}
              >
                Explore Products
              </Button>
              <Button
                variant="outline"
                className="px-8 py-3 text-lg border-[#004d84] text-[#004d84]"
                onClick={() => alert("Learn More clicked!")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="about" className="w-full py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <h2 className="text-4xl font-bold text-center text-black mb-16 [font-family:'Azeret_Mono',Helvetica]">
              Why Choose Dream X Store?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Unique Products",
                  description: "Discover products you won't find anywhere else",
                },
                {
                  title: "Emerging Brands",
                  description: "Support innovative creators and new brands",
                },
                {
                  title: "Quality Assured",
                  description: "Every product is carefully curated for quality",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-8 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-2xl font-bold text-[#004d84] mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="w-full py-20 bg-[#f0ff7f]">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">
            <h2 className="text-4xl font-bold text-black mb-6 [font-family:'Azeret_Mono',Helvetica]">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Join thousands of customers discovering amazing products from emerging brands.
            </p>
            <Button
              className="bg-[#004d84] text-white hover:bg-[#003d6b] px-10 py-4 text-lg"
              onClick={() => alert("Join Now clicked!")}
            >
              Join Now
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-lg mb-4">Dream X Store</h4>
              <p className="text-gray-400">
                Connecting innovative brands with customers worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#home" className="hover:text-white transition">Home</a></li>
                <li><a href="#about" className="hover:text-white transition">About</a></li>
                <li><a href="#services" className="hover:text-white transition">Services</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@dreamxstore.com</li>
                <li>Phone: +91 630-133-8677</li>
                <li>Location: Raleigh, NC</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Dream X Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};
