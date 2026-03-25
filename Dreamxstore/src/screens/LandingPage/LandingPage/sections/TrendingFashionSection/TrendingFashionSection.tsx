import React from "react";
import { Button } from "../../../../../components/ui/button";
import { Card } from "../../../../../components/ui/card";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export const TrendingFashionSection = (): JSX.Element => {
  return (
    <section className="relative w-full min-h-[920px] bg-white border-y border-[#004d84]/10 py-20 px-4">
      <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 px-[108px]">

        {/* Product Image Section */}
        <div className="relative w-full lg:w-1/2 flex items-center justify-center">
          <div className="absolute w-[80%] h-[80%] bg-[#f1ff8c]/20 rounded-full blur-[120px] -z-10" />
          <div className="relative w-[643px] h-[643px] rounded-3xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] transform -rotate-3 hover:rotate-0 transition-transform duration-700">
            <img
              src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=643&q=80"
              alt="Polo Ralph Lauren Linen Shirt"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Navigation Arrows */}
          <button className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 bg-white shadow-xl rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer z-10">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-16 bg-white shadow-xl rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer z-10">
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Product Details Section */}
        <div className="w-full lg:w-1/2 flex flex-col gap-8">
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 fill-[#f1ff8c] text-[#f1ff8c]" />)}
            <span className="text-gray-400 font-mono ml-2">(128 Reviews)</span>
          </div>

          <h3 className="text-6xl font-black tracking-tighter text-black leading-tight">
            Polo Ralph Lauren<br />
            <span className="text-[#004d84]">CUSTOM FIT LINEN SHIRT</span>
          </h3>

          <div className="flex items-baseline gap-4">
            <span className="text-5xl font-black text-[#ff4d4d]">£180.00</span>
            <span className="text-xl text-gray-400 font-mono">VAT included</span>
          </div>

          <div className="flex items-center gap-6 mt-4">
            <div className="w-16 h-16 bg-black rounded-full border-4 border-[#f1ff8c] cursor-pointer hover:scale-110 transition-transform" />
            <div className="w-16 h-16 bg-[#004d84] rounded-full hover:scale-110 transition-transform cursor-pointer" />
            <div className="w-16 h-16 bg-gray-200 rounded-full hover:scale-110 transition-transform cursor-pointer" />
          </div>

          <div className="mt-8">
            <Button className="h-[90px] w-full max-w-[400px] bg-black text-[#f1ff8c] rounded-full font-mono font-black text-3xl uppercase tracking-widest hover:bg-[#004d84] transition-all transform hover:-translate-y-2 shadow-2xl">
              Shop Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
