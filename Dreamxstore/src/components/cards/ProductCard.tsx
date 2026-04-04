'use client';

import { Heart } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WishlistButton from '../WishlistButton';

export interface ProductCardProps {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  // Optional callback when wishlist state changes - receives (productId, newWishlistStatus)
  onWishlistToggle?: (productId: string, isWishlisted: boolean) => void;
  onClick?: () => void;
  // Option to disable internal wishlist handling and use custom handler instead
  useCustomWishlistHandler?: boolean;
}

export default function ProductCard({
  id,
  title,
  brand,
  price,
  originalPrice,
  discount,
  image,
  onWishlistToggle,
  onClick,
  useCustomWishlistHandler = false,
}: ProductCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation to product detail page
      router.push(`/products/${id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="w-full bg-[#f8f8f8] rounded-[2.5rem] overflow-hidden group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
    >
      {/* Product Image Section */}
      <div className="relative bg-white aspect-[4/5] flex items-center justify-center overflow-hidden m-2 rounded-[2rem]">
        <div className="absolute top-4 right-4 z-10">
          {useCustomWishlistHandler ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onWishlistToggle?.(id, false);
              }}
              className="bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-sm"
              title="Remove from wishlist"
            >
              <Heart size={20} className="fill-red-500 stroke-red-500" />
            </button>
          ) : (
            <WishlistButton
              productId={id}
              className="bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-sm"
              onWishlistChange={(isWishlisted) => {
                onWishlistToggle?.(id, isWishlisted);
              }}
            />
          )}
        </div>
        <Image
          src={image}
          alt={title}
          width={400}
          height={400}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
      </div>

      {/* Product Details Section */}
      <div className="p-4 pt-1 space-y-1">
        <h2 className="text-sm font-black text-gray-900 line-clamp-1 opacity-80 uppercase tracking-tight">
          {brand}
        </h2>
        <h3 className="text-base font-bold text-gray-900 line-clamp-1 leading-tight mb-1">
          {title}
        </h3>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-black text-black">₹{price}</span>
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-white text-xs font-black">→</span>
          </div>
        </div>
      </div>
    </div>

  );
}
