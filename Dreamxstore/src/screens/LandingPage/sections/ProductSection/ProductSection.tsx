"use client";

import React, { useState } from "react";
import { useCart } from "../../../../contexts/CartContext";
import { Button } from "../../../../components/ui/button";
import { Sliders, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import WishlistButton from "../../../../components/WishlistButton";

export const ProductSection = () => {
  const [activeCategory, setActiveCategory] = useState("Men");
  const router = useRouter();

  const categories = ["Woman", "Men", "Kids", "Sport", "New"];

  // Sample products for frontend testing
  const products = [
    {
      _id: "60f8c2b5e1b2c8a1b8e4d111",
      name: "D2 Utility Dryvent Jacket",
      price: "$572",
      image: "https://i.postimg.cc/fRWRqwYP/GPT-model.png",
      rating: 4.9,
      slug: "d2-utility-dryvent-jacket"
    },
    {
      _id: "60f8c2b5e1b2c8a1b8e4d222",
      name: "GEL-1130",
      price: "$112",
      image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400",
      rating: 4.8,
      slug: "gel-1130"
    },
    {
       _id: "60f8c2b5e1b2c8a1b8e4d333",
       name: "Sporty Hoodie",
       price: "$85",
       image: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=400",
       rating: 4.7,
       slug: "sporty-hoodie"
    }
  ];

  const handleProductClick = (product: any) => {
    router.push(`/product/${product.slug}`);
  };

  return (
    <section className="w-full py-8 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Category Bar */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto scrollbar-hide">
          <Button variant="ghost" size="icon" className="bg-[#004d84] text-white rounded-full flex-shrink-0 w-12 h-12 shadow-lg hover:bg-[#003a64]">
            <Sliders className="w-6 h-6 rotate-90" />
          </Button>
          
          <div className="flex items-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-8 py-3 rounded-full text-sm font-semibold transition-all whitespace-nowrap shadow-sm border border-gray-100 ${
                  activeCategory === category 
                  ? "bg-[#004d84] text-white" 
                  : "bg-white text-gray-400 hover:text-gray-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Most Popular</h2>
          <Button variant="link" className="text-gray-500 font-semibold p-0 h-auto hover:text-gray-700">
            See All
          </Button>
        </div>

        {/* Product Grid - Middle Mobile Style */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product) => (
            <div 
              key={product._id}
              onClick={() => handleProductClick(product)}
              className="bg-[#f8f8f8] rounded-3xl p-3 cursor-pointer group transition-all hover:shadow-xl hover:-translate-y-1 relative"
            >
              {/* Wishlist Button */}
              <div className="absolute top-4 right-4 z-10">
                <WishlistButton 
                  productId={product._id}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                />
              </div>

              {/* Image Container */}
              <div className="bg-white rounded-2xl overflow-hidden aspect-[4/5] flex items-center justify-center mb-3">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info */}
              <div className="px-1">
                <div className="flex items-center gap-1 text-xs text-yellow-500 mb-1">
                  <Star className="w-3 h-3 fill-yellow-500" />
                  <span className="text-gray-400 font-bold">{product.rating}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
                <p className="text-sm font-extrabold text-[#004d84]">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};