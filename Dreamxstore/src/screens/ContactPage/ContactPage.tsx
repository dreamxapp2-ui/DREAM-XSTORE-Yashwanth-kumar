"use client";

import React, { useState } from "react";
import { HeroSection } from "../LandingPage/sections/HeroSection";
import { Footer } from "../LandingPage/sections/Footer";
import { FloatingChatButton } from "../LandingPage/sections/FloatingChatButton";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: ["support@dreamxstore.com", "partnerships@dreamxstore.com"],
      link: "mailto:support@dreamxstore.com"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+91 630-133-8677", "Mon-Fri: 9AM - 6PM IST"],
      link: "tel:+916301338677"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["Raleigh, NC 27603", "Charlotte, NC 28217"],
      link: "#locations"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Friday: 9AM - 6PM", "Saturday: 10AM - 4PM"],
      link: null
    }
  ];

  const faqs = [
    {
      question: "How do I become a brand partner?",
      answer: "Contact us via WhatsApp or use the form below. We'll guide you through our onboarding process."
    },
    {
      question: "What's your return policy?",
      answer: "We offer a 30-day return policy for most products. Check our Refund Policy page for details."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we ship within India. International shipping will be available soon."
    },
    {
      question: "How can I track my order?",
      answer: "You'll receive a tracking number via email once your order ships. You can also check your order status in your profile."
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    }, 1500);
  };

  const handleWhatsAppContact = () => {
    window.open("https://wa.me/916301338677", "_blank");
  };

  return (
    <div className="bg-white w-full min-h-screen">
      <div className="bg-white w-full max-w-none mx-auto relative">
        {/* Hero Section - Fixed Navigation */}
        <HeroSection />
        
        {/* Main Content */}
        <main className="pt-0">
          {/* Hero Banner */}
          <section className="w-full bg-[#004d84] py-0">
            <div className="w-full py-12 sm:py-16 md:py-20 lg:py-24">
              <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight">
                    Get in Touch
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                    Have questions? We're here to help. Reach out to us through any of the channels below.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information Cards */}
          <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {contactInfo.map((info, index) => (
                    <Card key={index} className="border border-gray-200 bg-white rounded-[1px] shadow-none hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6 text-center space-y-4">
                        <div className="w-12 h-12 mx-auto bg-[#f1ff8c] rounded-full flex items-center justify-center border border-black">
                          <info.icon className="w-6 h-6 text-[#004d84]" />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-lg sm:text-xl font-medium text-black">
                            {info.title}
                          </h3>
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-sm sm:text-base text-gray-600">
                              {detail}
                            </p>
                          ))}
                        </div>

                        {info.link && (
                          <Button
                            variant="link"
                            className="text-[#004d84] hover:text-[#003d6a] p-0 h-auto text-sm font-medium"
                            onClick={() => info.link && (window.location.href = info.link)}
                          >
                            Contact
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Contact Form Section */}
          <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-[#f8f8f8]">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
              <div className="max-w-4xl mx-auto">
                <div className="text-center space-y-4 mb-8 sm:mb-12">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-black leading-tight">
                    Send Us a Message
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-gray-600">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>
                </div>

                <Card className="border border-gray-200 bg-white rounded-[1px] shadow-none">
                  <CardContent className="p-6 sm:p-8 md:p-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name and Email Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84] focus:border-transparent"
                            placeholder="John Doe"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84] focus:border-transparent"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      {/* Phone and Subject Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84] focus:border-transparent"
                            placeholder="+91 1234567890"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                            Subject *
                          </label>
                          <input
                            type="text"
                            id="subject"
                            name="subject"
                            required
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84] focus:border-transparent"
                            placeholder="How can we help?"
                          />
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium text-gray-700">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleInputChange}
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84] focus:border-transparent resize-none"
                          placeholder="Tell us more about your inquiry..."
                        />
                      </div>

                      {/* Submit Status Messages */}
                      {submitStatus === "success" && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-[1px]">
                          Thank you! Your message has been sent successfully. We'll get back to you soon.
                        </div>
                      )}

                      {submitStatus === "error" && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[1px]">
                          Something went wrong. Please try again or contact us directly.
                        </div>
                      )}

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#004d84] hover:bg-[#003d6a] text-white font-medium px-6 py-4 rounded-[30px] text-base transition-all duration-300 hover:scale-105 shadow-none disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Send className="w-5 h-5" />
                            Send Message
                          </span>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
              <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-black leading-tight">
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {faqs.map((faq, index) => (
                    <Card key={index} className="border border-gray-200 bg-white rounded-[1px] shadow-none">
                      <CardContent className="p-6 sm:p-8">
                        <div className="space-y-3">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-[#f1ff8c] rounded-[1px] flex items-center justify-center border border-black">
                              <span className="text-sm font-medium text-black">
                                {index + 1}
                              </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-medium text-black pt-1">
                              {faq.question}
                            </h3>
                          </div>
                          <p className="text-sm sm:text-base text-gray-600 leading-relaxed pl-12">
                            {faq.answer}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* WhatsApp CTA Section */}
          <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-[#f8f8f8]">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
              <div className="max-w-3xl mx-auto">
                <Card className="border-2 border-black bg-[#f1ff8c] rounded-t-[12px] rounded-b-[8px] shadow-none">
                  <CardContent className="p-6 sm:p-8 md:p-10 text-center space-y-4 sm:space-y-6">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-black">
                      Prefer to chat directly?
                    </h3>
                    
                    <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                      Connect with us on WhatsApp for instant support and quick responses.
                    </p>

                    <Button 
                      onClick={handleWhatsAppContact}
                      className="bg-[#25D366] hover:bg-[#20BA5A] text-white font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-[30px] text-sm sm:text-base border-0 transition-all duration-300 hover:scale-105 shadow-none"
                    >
                      Chat on WhatsApp
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer />

        {/* Floating Chat Button */}
        <FloatingChatButton />
      </div>
    </div>
  );
};
