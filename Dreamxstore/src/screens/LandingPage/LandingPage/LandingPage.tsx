"use client";

import React from "react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { HeroSection } from "./sections/HeroSection";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, MessageSquare } from "lucide-react";

const MainBannerSection = dynamic(() => import("./sections/MainBannerSection").then((mod) => mod.MainBannerSection));
const ProductCategoriesSection = dynamic(() => import("./sections/ProductCategoriesSection").then((mod) => mod.ProductCategoriesSection));
const TrendingFashionSection = dynamic(() => import("./sections/TrendingFashionSection").then((mod) => mod.TrendingFashionSection));

export const LandingPage = (): JSX.Element => {
  const router = useRouter();
  // Category buttons data
  const categoryButtons = [
    {
      id: 1,
      label: "Shirts",
      bgColor: "bg-[#f1f1f1]",
      textColor: "text-[#004d84]",
      active: false,
    },
    {
      id: 2,
      label: "T-Shirts",
      bgColor: "bg-[#f1ff8c]",
      textColor: "text-black",
      active: true,
    },
    {
      id: 3,
      label: "Hoodies",
      bgColor: "bg-[#f1ff8c]",
      textColor: "text-black",
      active: true,
    },
  ];

  // View more section data
  const viewMoreSections = [
    { id: 1, title: "T-shirts For Men", top: "top-[2271px]" },
    {
      id: 2,
      title: "Trending Fashion",
      top: "top-[4115px]",
      topButton: "top-[4145px]",
    },
  ];

  // Fashion images data
  const fashionImages = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1069&q=80",
      aspect: "aspect-[1069/702]",
      imgWidth: 1069,
      imgHeight: 702,
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=636&q=80",
      aspect: "aspect-[636/702]",
      imgWidth: 636,
      imgHeight: 702,
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=636&q=80",
      aspect: "aspect-[636/702]",
      imgWidth: 636,
      imgHeight: 702,
    },
    {
      id: 4,
      src: "https://i.pinimg.com/736x/12/1a/19/121a19547bf539371da903dc253178d1.jpg",
      aspect: "aspect-[1076/702]",
      imgWidth: 1076,
      imgHeight: 702,
    },
  ];

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-[1920px] relative">
        {/* Hero Section */}
        <div className="relative w-[1932px]">
          <HeroSection />
          <Image
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1920&q=80"
            alt="Hero Banner"
            width={1920}
            height={899}
            className="w-[1920px] h-[899px] mt-[167px] object-cover"
          />

          <Card className="absolute w-[237px] h-[89px] top-[805px] left-[108px] bg-white rounded-none shadow-[0px_4px_10px_#00000040] border-none group cursor-pointer hover:bg-[#f1ff8c] transition-colors">
            <div className="absolute w-[173px] top-[20px] left-[32px] font-mono font-bold text-[#004d84] text-[40px] group-hover:text-black transition-colors">
              Buy Now
            </div>
          </Card>

          <Badge className="absolute w-[68px] h-[68px] top-[582px] left-[1809px] bg-[#edededf5] rounded-full shadow-[0px_4px_10px_#00000040] p-0 flex items-center justify-center">
            <Search className="w-8 h-8 text-[#004d84]" />
          </Badge>
        </div>

        {/* Brand Banner */}
        <div className="w-full h-32 bg-gray-50 flex items-center justify-center border-b border-gray-100">
          <img 
            src="https://i.postimg.cc/sx24cHZb/image-89.png" 
            alt="Dream X Store" 
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Main Banner Section */}
        <MainBannerSection />

        {/* Brand Marquee Section */}
        <div className="w-full bg-black py-20 overflow-hidden border-y border-white/10 mt-12 flex items-center">
          <div className="flex animate-marquee whitespace-nowrap gap-32 items-center">
            {[
              { name: "NIKE", src: "https://img.icons8.com/?size=100&id=19623&format=png&color=FFFFFF", showName: false },
              { name: "ADIDAS", src: "https://img.icons8.com/?size=100&id=34543&format=png&color=FFFFFF", showName: false },
              { name: "PUMA", src: "https://img.icons8.com/?size=100&id=3nFQK2eI2Iq4&format=png&color=FFFFFF", showName: false },
              { name: "UNDER ARMOUR", src: "https://www.logo.wine/a/logo/Under_Armour/Under_Armour-Logo.wine.svg", showName: false },
              { name: "RACAN", src: "https://i.postimg.cc/1R9sp8Qp/image-41.png", showName: true },
              { name: "DREAM X", src: "https://i.postimg.cc/sx24cHZb/image-89.png", showName: true }
            ].map((brand, i) => (
              <div key={i} className="flex items-center gap-12 group cursor-pointer transition-all duration-500">
                <div className="opacity-40 group-hover:opacity-100 transition-all transform group-hover:scale-125 duration-700">
                  <img
                    src={brand.src}
                    alt={brand.name}
                    className={`h-16 w-auto object-contain ${brand.name === 'UNDER ARMOUR' ? 'brightness-100 invert' : ''}`}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${brand.name}&background=004d84&color=fff`;
                    }}
                  />
                </div>
                {brand.showName && (
                  <span className="text-6xl font-mono font-black text-white/5 group-hover:text-white transition-all tracking-[0.3em] uppercase">
                    {brand.name}
                  </span>
                )}
              </div>
            ))}
            {/* Seamless loop duplicate */}
            {[
              { name: "NIKE", src: "https://img.icons8.com/?size=100&id=19623&format=png&color=FFFFFF", showName: false },
              { name: "ADIDAS", src: "https://img.icons8.com/?size=100&id=34543&format=png&color=FFFFFF", showName: false },
              { name: "PUMA", src: "https://img.icons8.com/?size=100&id=3nFQK2eI2Iq4&format=png&color=FFFFFF", showName: false },
              { name: "UNDER ARMOUR", src: "https://www.logo.wine/a/logo/Under_Armour/Under_Armour-Logo.wine.svg", showName: false },
              { name: "RACAN", src: "https://i.postimg.cc/1R9sp8Qp/image-41.png", showName: true },
              { name: "DREAM X", src: "https://i.postimg.cc/sx24cHZb/image-89.png", showName: true }
            ].map((brand, i) => (
              <div key={`dup-${i}`} className="flex items-center gap-12 group cursor-pointer transition-all duration-500">
                <div className="opacity-40 group-hover:opacity-100 transition-all transform group-hover:scale-125 duration-700">
                  <img
                    src={brand.src}
                    alt={brand.name}
                    className={`h-16 w-auto object-contain ${brand.name === 'UNDER ARMOUR' ? 'brightness-100 invert' : ''}`}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${brand.name}&background=004d84&color=fff`;
                    }}
                  />
                </div>
                {brand.showName && (
                  <span className="text-6xl font-mono font-black text-white/5 group-hover:text-white transition-all tracking-[0.3em] uppercase">
                    {brand.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: fit-content;
            animation: marquee 30s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>

        {/* Category Buttons */}
        <div className="flex justify-center gap-6 mt-8">
          {categoryButtons.map((button) => (
            <Button
              key={button.id}
              className={`${button.bgColor} ${button.textColor} h-[74px] rounded-[68.9px] border border-solid border-black shadow-[0px_4px_10px_#00000040] [-webkit-text-stroke:1px_#000000] font-mono font-medium text-[32px]`}
            >
              {button.label}
            </Button>
          ))}
        </div>

        {/* T-shirts For Men Section Header */}
        <div className="max-w-[1717px] mx-auto mt-20 mb-8 flex justify-between items-center px-4">
          <h3 className="font-mono font-black text-black text-5xl tracking-tighter uppercase">
            T-shirts For Men
          </h3>

          <Button
            variant="link"
            className="font-mono font-bold text-[#0e6eff] text-2xl flex items-center gap-2 group transition-all"
            onClick={() => router.push("/products?category=t-shirts")}
          >
            <span>View More</span>
            <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>

        {/* Product Categories Section */}
        <ProductCategoriesSection />

        {/* Trending Fashion Section */}
        <TrendingFashionSection />

        {/* The duplicate Trending Fashion title was removed as it's now part of the section */}

        {/* Fashion Images Grid */}
        <div className="max-w-[1800px] mx-auto px-10 mt-20 mb-20">
          <div className="grid grid-cols-12 gap-8">
            {/* First Row */}
            <div className="col-span-8">
              <div className={`relative w-full ${fashionImages[0].aspect} overflow-hidden rounded-2xl shadow-xl transition-transform hover:scale-[1.02] duration-500`}>
                <Image
                  src={fashionImages[0].src}
                  alt="Fashion item"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="col-span-4">
              <div className={`relative w-full ${fashionImages[1].aspect} overflow-hidden rounded-2xl shadow-xl transition-transform hover:scale-[1.02] duration-500`}>
                <Image
                  src={fashionImages[1].src}
                  alt="Fashion item"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            {/* Second Row */}
            <div className="col-span-4 mt-8">
              <div className={`relative w-full ${fashionImages[2].aspect} overflow-hidden rounded-2xl shadow-xl transition-transform hover:scale-[1.02] duration-500`}>
                <Image
                  src={fashionImages[2].src}
                  alt="Fashion item"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="col-span-8 mt-8">
              <div className={`relative w-full ${fashionImages[3].aspect} overflow-hidden rounded-2xl shadow-xl transition-transform hover:scale-[1.02] duration-500`}>
                <Image
                  src={fashionImages[3].src}
                  alt="Fashion item"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-[1920px] h-[784px] mt-[136px] bg-[#00428e]">
          <div className="absolute w-[535px] top-[317px] left-[695px] font-mono font-normal text-white text-9xl whitespace-nowrap">
            Footer
          </div>

          <div className="absolute w-[218px] top-[76px] left-[86px] font-sans font-normal text-white text-[40px]">
            Dream X<br />
            Store
          </div>
        </div>

        {/* Chat Button */}
        <Button className="fixed w-[84px] h-[84px] bottom-[40px] right-[40px] bg-[#f1ff8c] rounded-full border-2 border-solid border-black p-0 shadow-2xl hover:scale-110 active:scale-95 transition-all z-50">
          <MessageSquare className="w-10 h-10 text-black" />
        </Button>
      </div>
    </div>
  );
};
