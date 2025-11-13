"use client";

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { UserService } from '../lib/api/services/userService';
import { TokenManager } from '../lib/api/tokenManager';

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
      console.log('[WishlistButton] Token available:', !!token);
      
      const user = TokenManager.getUser();
      console.log('[WishlistButton] User from TokenManager:', user);
      console.log('[WishlistButton] User wishlist:', user?.wishlist);
      
      if (user?.wishlist) {
        const inWishlist = user.wishlist.some((item: any) => item.productId === productId);
        console.log('[WishlistButton] Product in wishlist:', inWishlist);
        setIsWishlisted(inWishlist);
      }
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
      console.log('[WishlistButton] Toggling wishlist for product:', productId);
      console.log('[WishlistButton] New wishlist status:', newWishlistStatus);
      
      let response: any;
      if (newWishlistStatus) {
        // Add to wishlist
        console.log('[WishlistButton] Adding to wishlist...');
        response = await UserService.addToWishlist(productId);
        console.log('[WishlistButton] Add response:', response);
      } else {
        // Remove from wishlist
        console.log('[WishlistButton] Removing from wishlist...');
        response = await UserService.removeFromWishlist(productId);
        console.log('[WishlistButton] Remove response:', response);
      }

      // Update user in TokenManager - handle { success, user } and direct user formats
      if (response) {
        console.log('[WishlistButton] Response received:', response);
        const userData = (response as any)?.user || response;
        TokenManager.setUser(userData);
      }

      // Also refresh the full profile to ensure sync
      try {
        const updatedResponse = await UserService.getProfile();
        console.log('[WishlistButton] Updated response:', updatedResponse);
        const updatedUser = (updatedResponse as any)?.user || updatedResponse;
        TokenManager.setUser(updatedUser);
      } catch (profileError) {
        console.warn('[WishlistButton] Could not fetch updated profile:', profileError);
      }

      // Notify parent component
      onWishlistChange?.(newWishlistStatus);
    } catch (error: any) {
      console.error('[WishlistButton] Error toggling wishlist:', error);
      console.error('[WishlistButton] Error type:', typeof error);
      console.error('[WishlistButton] Error keys:', Object.keys(error || {}));
      console.error('[WishlistButton] Error message:', error?.message);
      const errorMessage = error?.message || 'Failed to update wishlist';
      
      // If got "already in wishlist" error, it means the product IS in wishlist
      // Keep the heart red and don't show alert
      if (newWishlistStatus && error?.status === 400 && error?.message?.includes('already')) {
        console.log('[WishlistButton] Product already in wishlist, keeping heart red');
        // Ensure state is synced with server reality
        setIsWishlisted(true);
      } else {
        // Real error - revert the optimistic update and sync with server
        console.log('[WishlistButton] Real error, reverting to server state');
        await checkWishlistStatus();
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
