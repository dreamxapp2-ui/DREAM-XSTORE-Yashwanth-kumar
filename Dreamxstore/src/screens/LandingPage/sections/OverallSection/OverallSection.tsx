import React from "react";
import { Button } from "../../../../components/ui/button";

export const OverallSection = (): JSX.Element => {
  return (
    <section className="w-full bg-[#f8f8f8] py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        {/* Desktop Layout - Side by Side */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 2xl:gap-10">
          {/* Left - Image (Larger) */}
          <div className="w-1/2 xl:w-[55%]">
            <div className="relative">
              <img
                src="https://i.pinimg.com/736x/af/d8/19/afd81915d44b185091fc7ac2242ea724.jpg"
                alt="Men's Collection"
                className="w-full h-[400px] lg:h-[450px] xl:h-[500px] object-cover"
              />
              {/* Overlay Text on Image - Removed OVERALL text */}
              <div className="absolute top-4 left-4 text-white">
                <p className="text-xs font-medium tracking-wider uppercase"></p>
                <p className="text-xs font-medium tracking-wider uppercase"></p>
              </div>
              <div className="absolute bottom-6 left-4 text-white">
                <p className="text-xs font-medium tracking-wider uppercase mb-1"></p>
              </div>
            </div>
          </div>

          {/* Right - Content (Smaller but well-proportioned) */}
          <div className="w-1/2 xl:w-[45%] flex flex-col justify-center space-y-6 xl:space-y-8">
            <div className="space-y-4 xl:space-y-6">
              <h3 className="text-3xl xl:text-4xl 2xl:text-5xl font-light text-gray-900 leading-tight">
                Hey, welcome to DreamX!
              </h3>

              <div className="space-y-4 xl:space-y-5">
                <p className="text-lg xl:text-xl 2xl:text-2xl text-gray-800 leading-relaxed">
                  <span className="font-semibold">#GetCustomClothing</span> tailored just for you from your favorite brands and styles.
                  Discover exclusive, made-for-you fashion picks and personalize your wardrobe like never before.
                </p>
              </div>
            </div>

            <div className="flex justify-start">
              <Button className="bg-[#f1ff8c] hover:bg-[#e9f87a] text-black font-semibold px-12 xl:px-14 py-6 xl:py-7 rounded-full text-xl xl:text-2xl border border-black transition-all duration-300 hover:scale-105">
                Join Now
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden space-y-8">
          {/* Image */}
          <div className="relative">
            <img
              src="https://i.pinimg.com/736x/af/d8/19/afd81915d44b185091fc7ac2242ea724.jpg"
              alt="Men's Collection"
              className="w-full h-[250px] sm:h-[300px] object-cover "
            />
            {/* Overlay Text on Image - Removed OVERALL text */}
            <div className="absolute top-4 left-4 text-white">
              <p className="text-xs sm:text-sm font-medium tracking-wider uppercase"></p>
              <p className="text-xs sm:text-sm font-medium tracking-wider uppercase"></p>
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-xs sm:text-sm font-medium tracking-wider uppercase mb-1"></p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 px-2">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 leading-tight">
              Hey, welcome to DreamX!
            </h3>

            <div className="space-y-4">
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-800 leading-relaxed">
                <span className="font-semibold">#GetCustomClothing</span> tailored just for you from your favorite brands and styles.
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-800 leading-relaxed">
                Discover exclusive, made-for-you fashion picks and personalize your wardrobe like never before.
              </p>
            </div>

            {/* Button aligned to left on mobile */}
            <div className="flex justify-start pt-4">
              <Button className="bg-[#f1ff8c] hover:bg-[#e9f87a] text-black font-semibold px-12 py-6 rounded-full text-xl border border-black transition-all duration-300 hover:scale-105">
                Join Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};