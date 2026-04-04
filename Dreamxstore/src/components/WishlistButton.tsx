"use client";

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { UserService } from '../lib/api/services/userService';
import { TokenManager } from '../lib/api/tokenManager';

// Module-level dedup: all WishlistButtons on the same page share one API call
let _wishlistFetchPromise: Promise<Set<string>> | null = null;
let _wishlistCache: { ids: Set<string>; ts: number } | null = null;
const CACHE_TTL = 10_000; // 10 seconds

async function fetchWishlistIds(): Promise<Set<string>> {
  if (_wishlistCache && Date.now() - _wishlistCache.ts < CACHE_TTL) {
    return _wishlistCache.ids;
  }
  if (_wishlistFetchPromise) return _wishlistFetchPromise;

  _wishlistFetchPromise = (async () => {
    try {
      const response = await UserService.getWishlist(1, 100);
      let items: any[] = [];
      if (Array.isArray(response)) items = response;
      else if (response?.data) items = response.data;

      const ids = new Set<string>();
      items.forEach((item: any) => {
        const pid = item.productId?._id || item.productId?.id || item.productId;
        if (pid) ids.add(pid);
      });
      _wishlistCache = { ids, ts: Date.now() };
      return ids;
    } finally {
      _wishlistFetchPromise = null;
    }
  })();

  return _wishlistFetchPromise;
}

export function invalidateWishlistCache() {
  _wishlistCache = null;
}

interface WishlistButtonProps {
  productId: string;
  className?: string;
  onWishlistChange?: (isWishlisted: boolean) => void;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  className = '',
  onWishlistChange
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if product is in wishlist on mount
  useEffect(() => {
    checkWishlistStatus();
  }, [productId]);

  const checkWishlistStatus = async () => {
    try {
      const token = TokenManager.getToken();
      if (!token) return;

      const ids = await fetchWishlistIds();
      setIsWishlisted(ids.has(productId));
    } catch (error) {
      console.error('[WishlistButton] Error checking wishlist:', error);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!TokenManager.getToken()) {
      alert('Please login to add items to wishlist');
      return;
    }

    setLoading(true);
    // Optimistically update UI immediately so heart turns red instantly
    const newWishlistStatus = !isWishlisted;
    setIsWishlisted(newWishlistStatus);
    
    try {
      if (newWishlistStatus) {
        await UserService.addToWishlist(productId);
      } else {
        await UserService.removeFromWishlist(productId);
      }

      // Invalidate cache so other buttons pick up the change
      invalidateWishlistCache();

      // Notify parent component
      onWishlistChange?.(newWishlistStatus);
    } catch (error: any) {
      console.error('[WishlistButton] Error toggling wishlist:', error);
      const errorMessage = error?.message || 'Failed to update wishlist';
      
      // If got "already in wishlist" error, keep the heart red
      if (newWishlistStatus && error?.status === 400 && error?.message?.includes('already')) {
        setIsWishlisted(true);
      } else {
        // Real error - revert the optimistic update
        setIsWishlisted(!newWishlistStatus);
        alert('Failed to update wishlist: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleWishlistToggle}
      disabled={loading}
      className={`transition-all duration-300 ${className}`}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={24}
        className={`transition-all duration-300 ${
          isWishlisted
            ? 'fill-red-500 stroke-red-500'
            : 'fill-none stroke-gray-400 hover:stroke-red-500'
        }`}
      />
    </button>
  );
};

export default WishlistButton;
