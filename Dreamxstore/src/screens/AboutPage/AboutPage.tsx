import React from "react";
import { HeroSection } from "../LandingPage/sections/HeroSection";
import { Footer } from "../LandingPage/sections/Footer";
import { FloatingChatButton } from "../LandingPage/sections/FloatingChatButton";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

export const AboutPage = () => {
  const teamMembers = [
    {
      name: "Vision",
      role: "Our Mission",
      description: "To create a revolutionary platform that empowers emerging brands and connects innovative creators with customers worldwide."
    },
    {
      name: "Innovation",
      role: "Our Focus",
      description: "We celebrate creativity, originality, and forward-thinking in every product category we feature."
    },
    {
      name: "Community",
      role: "Our Values",
      description: "Building authentic connections between brands, creators, and customers who share a passion for unique, quality products."
    }
  ];

  const milestones = [
    {
      year: "2024",
      title: "The Beginning",
      description: "DreamX Store was founded with a vision to revolutionize online shopping for new and emerging brands."
    },
    {
      year: "2025",
      title: "Growing Together",
      description: "Partnered with 100+ innovative brands and launched our AI-powered fashion stylist, Racan."
    },
    {
      year: "Future",
      title: "Expanding Horizons",
      description: "Building a global marketplace that celebrates creativity and empowers brands to reach new heights."
    }
  ];

  const values = [
    {
      title: "Authenticity",
      description: "We showcase genuine, innovative products from real creators and brands."
    },
    {
      title: "Quality First",
      description: "Every brand on our platform meets our high standards for quality and innovation."
    },
    {
      title: "Customer Focus",
      description: "Your experience matters. We're committed to exceptional service and support."
    },
    {
      title: "Sustainability",
      description: "We support brands that prioritize ethical practices and sustainable production."
    }
  ];

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
                    About DreamX Store
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                    A platform dedicated to showcasing innovative brands and connecting visionary creators with customers who appreciate quality and originality.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Our Story Section */}
          <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
              <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-black leading-tight">
                  Our Story
                </h2>
                
                <div className="space-y-6 text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                  <p>
                    DreamX Store was born from a simple observation: incredible new brands struggle to find their audience in an oversaturated marketplace. We saw talented creators with innovative products that deserved a spotlight, and customers seeking something different from the usual shopping experience.
                  </p>
                  <p>
                    We created a curated platform exclusively for new and emerging brands—a space where innovation thrives, creativity is celebrated, and every product tells a unique story. From fashion and accessories to lifestyle products and beyond, we handpick brands that push boundaries and redefine their categories.
                  </p>
                  <p>
                    Today, DreamX Store is more than a marketplace. It's a community of creators, dreamers, and customers who believe in supporting fresh ideas and authentic craftsmanship. Together, we're building a new way to shop—one that values originality, quality, and the human stories behind every product.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Our Values Grid */}
          <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-[#f8f8f8]">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
              <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-black leading-tight text-center">
                  What We Stand For
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {values.map((value, index) => (
                    <Card key={index} className="border border-gray-200 bg-white rounded-[1px] shadow-none">
                      <CardContent className="p-6 sm:p-8">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-[#f1ff8c] rounded-[1px] flex items-center justify-center border border-black">
                              <span className="text-sm sm:text-base font-medium text-black">
                                {index + 1}
                              </span>
                            </div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-black">
                              {value.title}
                            </h3>
                          </div>
                          <p className="text-sm sm:text-base text-gray-600 leading-relaxed pl-12 sm:pl-14">
                            {value.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Journey/Timeline Section */}
          <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
              <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-black leading-tight">
                  Our Journey
                </h2>

                <div className="space-y-6 sm:space-y-8">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex gap-4 sm:gap-6">
                      {/* Year Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f1ff8c] rounded-[1px] flex items-center justify-center border border-black">
                          <span className="text-xs sm:text-sm font-medium text-black">
                            {milestone.year}
                          </span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 space-y-2 sm:space-y-3">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-black">
                          {milestone.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Team/Values Cards */}
          <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-[#f8f8f8]">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
              <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-black leading-tight text-center">
                  What Drives Us
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  {teamMembers.map((member, index) => (
                    <Card key={index} className="border border-gray-200 bg-white rounded-[1px] shadow-none">
                      <CardContent className="p-6 sm:p-8 text-center space-y-4">
                        {/* Icon or Image placeholder */}
                        <div className="w-16 h-16 mx-auto bg-[#f1ff8c] rounded-full flex items-center justify-center border border-black">
                          <span className="text-2xl font-medium text-black">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-xl sm:text-2xl font-medium text-black">
                            {member.name}
                          </h3>
                          <p className="text-sm sm:text-base text-[#004d84] font-medium">
                            {member.role}
                          </p>
                          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                            {member.description}
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
                  Join the DreamX Community
                </h2>
                
                <p className="text-lg sm:text-xl md:text-2xl font-light text-black leading-relaxed">
                  Discover unique products from innovative brands
                </p>

                <Card className="border-2 border-black bg-[#f1ff8c] rounded-t-[12px] rounded-b-[8px] shadow-none">
                  <CardContent className="p-6 sm:p-8 md:p-10 text-center space-y-4 sm:space-y-6">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-black">
                      Ready to explore something new?
                    </h3>
                    
                    <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                      Browse our curated collection of innovative brands and find your next favorite product.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Button 
                        onClick={() => window.location.href = '/'}
                        className="bg-[#004d84] hover:bg-[#003d6a] text-white font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-[30px] text-sm sm:text-base transition-all duration-300 hover:scale-105 shadow-none"
                      >
                        Shop Now
                      </Button>
                      <Button 
                        onClick={() => window.location.href = '/services'}
                        className="bg-white hover:bg-gray-50 text-[#004d84] font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-[30px] text-sm sm:text-base border-2 border-[#004d84] transition-all duration-300 hover:scale-105 shadow-none"
                      >
                        Partner With Us
                      </Button>
                    </div>
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
