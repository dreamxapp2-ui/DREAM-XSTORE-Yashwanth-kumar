import React from "react";
import { Button } from "../../../../components/ui/button";
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import DownloadButton from "../../../../components/DownloadButton";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Footer navigation data
  const footerSections = [
    {
      title: "COMPANY",
      links: [
        { name: "Home", href: "/" },
        { name: "How to do", href: "/how-to" },
        { name: "Catalog", href: "/catalog" },
        { name: "Resources", href: "/resources" },
      ]
    },
    {
      title: "DISCOVER",
      links: [
        { name: "Customers", href: "/customers" },
        { name: "Freelancers", href: "/freelancers" },
        { name: "Dream X", href: "/dream-x" },
      ]
    },
    {
      title: "ABOUT",
      links: [
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Join", href: "/join" },
      ]
    },
    {
      title: "LEGAL",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms & Conditions", href: "/terms" },
        { name: "Refund Policy", href: "/refund" },
        { name: "Shipping Policy", href: "/shipping" },
      ]
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/dreamxstore", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/dreamxstore", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/dreamxstore", label: "Twitter" },
    { icon: Youtube, href: "https://youtube.com/dreamxstore", label: "YouTube" },
  ];

  const contactInfo = [
    {
      city: "Raleigh",
      address: "123 N. Harrington Street",
      details: "Raleigh, NC 27603",
      phone: "919.833.4413"
    },
    {
      city: "Charlotte", 
      address: "250 East Peterson Drive",
      details: "Charlotte, NC 28217",
      phone: "704.333.7772"
    }
  ];

  return (
    <footer className="bg-[#2a2a2a] text-white font-['Poppins',sans-serif]">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 md:py-20 lg:py-24">
        {/* Top Section - Logo and Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mb-12 lg:mb-16">
          {/* Logo and Brand Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-['Poppins',sans-serif] font-light tracking-wider">
                Dream X Store
              </h3>
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110"
                  asChild
                >
                  <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                    <social.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </a>
                </Button>
              ))}
            </div>
            
            {/* Download Catalog Button */}
            <DownloadButton
              type="catalog"
              variant="link"
              className="text-gray-600 hover:text-black text-sm p-0 h-auto transition-colors font-['Poppins',sans-serif]"
            >
              Download Catalog
            </DownloadButton>
          </div>

          {/* Navigation Sections */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4 sm:space-y-6">
                <h4 className="text-sm sm:text-base font-['Poppins',sans-serif] font-semibold tracking-wider text-white uppercase">
                  {section.title}
                </h4>
                <ul className="space-y-2 sm:space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Button
                        variant="link"
                        className="text-gray-300 hover:text-white text-sm sm:text-base font-['Poppins',sans-serif] font-light p-0 h-auto transition-colors duration-300"
                        asChild
                      >
                        <a href={link.href}>{link.name}</a>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="border-t border-gray-600 pt-8 lg:pt-12 mb-8 lg:mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {contactInfo.map((location) => (
              <div key={location.city} className="space-y-3">
                <h5 className="text-lg sm:text-xl font-['Poppins',sans-serif] font-semibold text-white">
                  {location.city}
                </h5>
                <div className="space-y-2 text-gray-300 text-sm sm:text-base font-['Poppins',sans-serif]">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                    <div>
                      <p>{location.address}</p>
                      <p>{location.details}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <p>{location.phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section - Bright Yellow Background */}
      <div className="bg-[#f1ff8c] py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="text-center space-y-4 sm:space-y-6">
            <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-['Poppins',sans-serif] font-light text-black tracking-wide">
              Let's work <span className="font-semibold">together</span>
            </h3>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 md:gap-12">
              <Button
                variant="link"
                className="text-black hover:text-gray-700 text-base sm:text-lg md:text-xl font-['Poppins',sans-serif] font-medium underline p-0 h-auto transition-colors"
                asChild
              >
                <a href="/contact">Get in Touch</a>
              </Button>
              <Button
                variant="link"
                className="text-black hover:text-gray-700 text-base sm:text-lg md:text-xl font-['Poppins',sans-serif] font-medium underline p-0 h-auto transition-colors"
                asChild
              >
                <a href="/careers">Careers</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Light Gray Background */}
      <div className="bg-[#f5f5f5] text-black">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Left Side - Social Icons */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 hover:bg-black/10 rounded-none transition-all duration-300"
                asChild
              >
                <a href="https://linkedin.com/company/dreamxstore" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <span className="text-black font-bold text-sm">in</span>
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 hover:bg-black/10 rounded-none transition-all duration-300"
                asChild
              >
                <a href="https://instagram.com/dreamxstore" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="w-4 h-4 text-black" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 hover:bg-black/10 rounded-none transition-all duration-300"
                asChild
              >
                <a href="https://facebook.com/dreamxstore" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="w-4 h-4 text-black" />
                </a>
              </Button>
            </div>

            {/* Right Side - Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 text-sm font-['Poppins',sans-serif]">
              <div>
              </div>
              <div>
              <p className="font-semibold">Racan ai X Dream world</p>
              </div>
            </div>
          </div>

          {/* Copyright and Legal Links */}
          <div className="border-t border-gray-300 mt-6 pt-6 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm font-['Poppins',sans-serif] text-gray-600">©{currentYear} Cline Design</p>
            <div className="flex space-x-4 text-sm font-['Poppins',sans-serif]">
              <Button
                variant="link"
                className="text-gray-600 hover:text-black text-sm p-0 h-auto transition-colors font-['Poppins',sans-serif]"
                asChild
              >
                <a href="/terms">Terms of Use</a>
              </Button>
              <Button
                variant="link"
                className="text-gray-600 hover:text-black text-sm p-0 h-auto transition-colors font-['Poppins',sans-serif]"
                asChild
              >
                <a href="/privacy">Privacy Policy</a>
              </Button>
            </div>
          </div>
        </div>

        {/* Large Dream X Store Logo at Bottom - Black Version */}
        <div className="pb-8 sm:pb-12 md:pb-16 lg:pb-20 overflow-hidden">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <img
                src="https://i.postimg.cc/sx24cHZb/image-89.png"
                alt="Dream X Store Logo"
                className="h-16 sm:h-20 md:h-24 lg:h-32 xl:h-40 w-auto object-contain opacity-30 filter brightness-0"
                style={{ filter: 'brightness(0) opacity(0.3)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};