import React from "react";
import { Footer } from "../LandingPage/sections/Footer";
import { FloatingChatButton } from "../LandingPage/sections/FloatingChatButton";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

export const ServicesPage = (): JSX.Element => {
  const services = [
    {
      id: 1,
      title: "Onboarding New Brands",
      description: "We make joining DreamX World simple and seamless. Our onboarding process helps new brands set up their digital storefront quickly and efficiently.",
      cta: "Get Started: Contact us on WhatsApp to begin your journey!"
    },
    {
      id: 2,
      title: "Helping Brands Grow Online",
      description: "We don't just list your products—we help you grow with expert advice in digital marketing, social media promotion, and customer engagement.",
      features: [
        "Tailored Marketing Strategies for increased visibility",
        "Performance Analytics to understand your audience",
        "Collaborative Support with regular check-ins"
      ]
    },
    {
      id: 3,
      title: "Delivering Real Innovation",
      description: "DreamX World showcases truly innovative products that push boundaries with unique designs, sustainable practices, and cutting-edge technology."
    },
    {
      id: 4,
      title: "Additional Services for Brand Success",
      features: [
        "Product Photography & Branding: High-quality visuals to make your products stand out",
        "Customer Service Management: We handle inquiries and support, so you can focus on creating",
        "Exclusive Launches & Events: Spotlight opportunities for new collections and collaborations",
        "Community Building: Connect with like-minded creators and customers through our platform"
      ]
    }
  ];

  const whyPartnerPoints = [
    {
      title: "Exclusive Marketplace",
      description: "We only feature new brands, ensuring your products get the attention they deserve."
    },
    {
      title: "Innovation-Driven",
      description: "We celebrate creativity and forward-thinking in every category."
    },
    {
      title: "End-to-End Support",
      description: "From onboarding to growth, we're with you at every stage."
    },
    {
      title: "Authentic Experience",
      description: "Shoppers come to DreamX World expecting something new—deliver it with us."
    }
  ];

  const handleWhatsAppContact = () => {
    window.open("https://wa.me/916301338677", "_blank");
  };

  return (
    <div className="bg-white w-full min-h-screen">
      <div className="bg-white w-full max-w-none mx-auto relative">
        {/* Main Content */}
        <main className="pt-0">
          {/* Hero Banner with Full Width Image */}
          <section className="w-full bg-[#C17A47] py-0">

            {/* Full Width Image 

             <div className="w-full">
              <img
                src="https://i.postimg.cc/3wpW1wkC/Chat-GPT-Image-Jul-6-2025-09-12-08-AM.png"
                alt="DreamX Store Services"
                className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] object-cover"
              />
            </div>
            
            */}
           
            {/* Hero Content - Overlaid on colored background */}
            <div className="w-full py-12 sm:py-16 md:py-20 lg:py-24">
              <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight">
                    Our Services at DreamX World
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                    DreamX World is a launchpad for emerging brands ready to make their mark in the digital world. We're dedicated exclusively to new and innovative brands.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
              <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16 md:space-y-20">
                {services.map((service, index) => (
                  <Card key={service.id} className="border border-gray-200 bg-white rounded-[1px] shadow-none">
                    <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12">
                      <div className="space-y-4 sm:space-y-6">
                        {/* Number and Title */}
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-[#f1ff8c] rounded-[1px] flex items-center justify-center border border-black">
                            <span className="text-sm sm:text-base font-medium text-black">
                              {service.id}
                            </span>
                          </div>
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-black leading-tight">
                            {service.title}
                          </h3>
                        </div>

                        {/* Description */}
                        <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                          {service.description}
                        </p>

                        {/* Features List */}
                        {service.features && (
                          <ul className="space-y-2 sm:space-y-3">
                            {service.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 bg-[#f1ff8c] rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* CTA */}
                        {service.cta && (
                          <div className="pt-2">
                            <p className="text-sm sm:text-base font-medium text-[#004d84]">
                              {service.cta}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Why Partner With Us Section */}
          <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-[#f8f8f8]">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
              <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-black leading-tight">
                  Why Partner With Us?
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {whyPartnerPoints.map((point, index) => (
                    <Card key={index} className="border border-gray-200 bg-white rounded-[1px] shadow-none">
                      <CardContent className="p-6 sm:p-8">
                        <div className="space-y-3 sm:space-y-4">
                          <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-black">
                            {point.title}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                            {point.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action Section */}
          <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
              <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-black leading-tight">
                  Join DreamX World Today
                </h2>
                
                <p className="text-lg sm:text-xl md:text-2xl font-light text-black leading-relaxed">
                  Let's grow together!
                </p>

                {/* WhatsApp Contact Box with rounded top */}
                <Card className="border-2 border-black bg-[#f1ff8c] rounded-t-[12px] rounded-b-[8px] shadow-none">
                  <CardContent className="p-6 sm:p-8 md:p-10 text-center space-y-4 sm:space-y-6">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-black">
                      Contact us on WhatsApp
                    </h3>
                    
                    <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                      Get started and learn how we can help your brand thrive online.
                    </p>

                    <Button 
                      onClick={handleWhatsAppContact}
                      className="bg-[#25D366] hover:bg-[#20BA5A] text-white font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-[30px] text-sm sm:text-base border-0 transition-all duration-300 hover:scale-105 shadow-none"
                    >
                      Start Your Journey
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