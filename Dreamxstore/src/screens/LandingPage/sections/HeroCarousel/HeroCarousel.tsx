"use client"
import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../../../components/ui/button";


export const HeroCarousel = ()=> {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Slide data
  const slides = [
    {
      id: 1,
      image: "https://i.pinimg.com/736x/79/dc/2d/79dc2d469bd69bf718498a88a4647f33.jpg",
      title: "AI Racan your Fashion Stylist",
      buttonText: "Try Racan",
      link: "https://racan-ai.vercel.app"
    },
    {
      id: 2,
      image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
      title: "Urban Style",
      buttonText: "Shop Now",
      link: "/urban-style"
    },
    {
      id: 3,
      image: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
      title: "Premium Quality",
      buttonText: "Explore",
      link: "/premium-collection"
    },
    {
      id: 4,
      image: "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
      title: "New Arrivals",
      buttonText: "View All",
      link: "/new-arrivals"
    }
  ];

  // Auto-advance slides every 6 seconds
  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }

    // Reset
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleButtonClick = (e: React.MouseEvent, slide: typeof slides[0]) => {
    e.preventDefault();
    e.stopPropagation();
    if (slide.link) {
      if (slide.link.startsWith('http')) {
        window.open(slide.link, '_blank');
      } else {
        window.location.href = slide.link;
      }
    }
  };

  const handleIndicatorClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide(index);
  };

  // Handle background click for navigation on desktop
  const handleBackgroundClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.slide-indicators')) {
      return;
    }

    if (carouselRef.current) {
      const rect = carouselRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const carouselWidth = rect.width;
      const isLeftSide = mouseX < carouselWidth / 2;
      
      if (isLeftSide) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
  };

  return (
    <section 
      ref={carouselRef}
      className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[450px] xl:h-[520px] overflow-hidden z-10 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleBackgroundClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%) translateZ(0)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative w-full h-full flex-shrink-0"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30" />
            
            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 z-20">
              {/* Title - Top Left */}
              <div className="flex-shrink-0">
                <h2 className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light tracking-wide drop-shadow-lg">
                  {slide.title}
                </h2>
              </div>

              {/* Action Button - Bottom Left */}
              <div className="flex-shrink-0 self-start">
                <Button 
                  onClick={(e) => handleButtonClick(e, slide)}
                  className="bg-white text-[#004d84] hover:bg-gray-50 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 text-sm sm:text-base md:text-lg lg:text-xl font-semibold rounded-sm shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 h-[48px] sm:h-[56px] md:h-[64px] lg:h-[68px] xl:h-[69px] cursor-pointer border-2 border-transparent hover:border-white/20"
                >
                  {slide.buttonText}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20 slide-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={(e) => handleIndicatorClick(e, index)}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white w-4 sm:w-6' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </section>
  );
}