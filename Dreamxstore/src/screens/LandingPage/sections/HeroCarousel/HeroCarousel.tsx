"use client"
import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../../../components/ui/button";
import { apiClient } from "@/src/lib/api/client";

interface Slide {
  id?: number;
  _id?: string;
  image: string;
  title: string;
  description?: string;
  buttonText: string;
  link: string;
  bgColor?: string;
}

export const HeroCarousel = ()=> {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await apiClient.get('/banners');
        
        if (data && data.length > 0) {
          setSlides(data);
        } else {
          setSlides([
            {
              id: 1,
              image: "https://i.postimg.cc/sx24cHZb/image-89.png", 
              title: "UP TO 75% OFF WITH CODE",
              description: "Limited time offer on all premium collections",
              buttonText: "Get it now",
              link: "/products",
              bgColor: "#bef264" 
            },
            {
              id: 2,
              image: "https://i.postimg.cc/sx24cHZb/image-89.png",
              title: "New Summer Collection",
              buttonText: "Shop Now",
              link: "/products",
              bgColor: "#f3f4f6"
            }
          ]);
        }
      } catch (error) {
        console.error('[HeroCarousel] Error fetching banners:', error);
        setSlides([
           {
              id: 1,
              image: "https://i.postimg.cc/sx24cHZb/image-89.png",
              title: "UP TO 75% OFF WITH CODE",
              description: "Limited time offer on all premium collections",
              buttonText: "Get it now",
              link: "/products",
              bgColor: "#bef264"
            }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (!isHovered && slides.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, slides.length]);

  if (loading) return <div className="w-full h-[200px] bg-gray-100 animate-pulse rounded-2xl mx-auto max-w-7xl mt-4" />;
  if (slides.length === 0) return null;

  return (
    <section 
      className="relative w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-6 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide._id || slide.id || index}
            className="relative w-full flex-shrink-0 bg-[#bef264] rounded-[2rem] overflow-hidden min-h-[160px] sm:min-h-[220px] flex items-center"
            style={{ backgroundColor: slide.bgColor || '#bef264' }}
          >
            {/* Left Content */}
            <div className="flex-1 p-6 sm:p-10 z-10">
              <span className="text-sm font-bold text-gray-800 opacity-80 uppercase tracking-wider">UP TO</span>
              <h2 className="text-2xl sm:text-3xl md:text-3xl font-extrabold text-black mt-2 leading-tight max-w-[200px] sm:max-w-xs">
                {slide.title}
              </h2>
              <Button 
                onClick={() => window.location.href = slide.link}
                className="mt-4 bg-black text-white hover:bg-gray-900 rounded-full px-6 py-4 text-sm font-bold transition-all hover:scale-105"
              >
                {slide.buttonText}
              </Button>
            </div>

            {/* Right Image */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 sm:w-1/2 flex items-center justify-center overflow-hidden opacity-30 sm:opacity-100">
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="h-[140%] object-contain rotate-[-15deg] transform translate-x-4 sm:translate-x-10"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-black w-6' : 'bg-black/20'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}