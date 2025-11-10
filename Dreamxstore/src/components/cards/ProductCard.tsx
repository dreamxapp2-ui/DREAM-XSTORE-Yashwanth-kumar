'use client';

import { Heart } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface ProductCardProps {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  onWishlistToggle?: (id: string, isWishlisted: boolean) => void;
  onClick?: () => void;
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
}: ProductCardProps) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isWishlisted;
    setIsWishlisted(newState);
    onWishlistToggle?.(id, newState);
  };

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
      className="w-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      {/* Product Image Section */}
      <div className="relative bg-gray-200 aspect-square flex items-center justify-center overflow-hidden">
        <button
          onClick={handleWishlistClick}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className="w-6 h-6"
            strokeWidth={1.5}
            fill={isWishlisted ? '#ef4444' : 'none'}
            color={isWishlisted ? '#ef4444' : '#1f2937'}
          />
        </button>
        <Image
          src={image}
          alt={title}
          width={400}
          height={400}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Details Section */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
          {title}
        </h2>

        {/* Brand */}
        <p className="text-sm text-blue-600 font-medium">{`by ${brand}`}</p>

        {/* Pricing */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-2xl font-bold text-gray-900">₹{price}</span>
          <span className="text-lg text-gray-400 line-through">₹{originalPrice}</span>
          <span className="text-sm font-semibold text-green-600">{discount}% off</span>
        </div>

        {/* Buy Button */}
        <button
          onClick={handleCardClick}
          className="w-full bg-black text-white py-3 px-4 rounded-full font-medium hover:bg-gray-900 transition-colors active:scale-95 duration-150"
        >
          Sale price: ₹{price}
        </button>
      </div>
    </div>
  );
}
