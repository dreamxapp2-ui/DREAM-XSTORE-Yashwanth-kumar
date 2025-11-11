'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Heart, Trash2, Loader } from 'lucide-react';
import { UserService } from '../../../lib/api/services/userService';
import ProductCard from '../../../components/cards/ProductCard';

interface WishlistItemData {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    rating?: number;
    reviewsCount?: number;
    brandName?: string;
  };
  addedAt: string;
}

interface WishlistTabProps {
  wishlist?: any[];
}

export const WishlistTab: React.FC<WishlistTabProps> = ({ wishlist: initialWishlist }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[WishlistTab] Fetching wishlist...');
      const response = await UserService.getWishlist();
      console.log('[WishlistTab] Response:', response);

      // Extract wishlist data from response
      let data: WishlistItemData[] = [];
      if (Array.isArray(response)) {
        data = response;
      } else if ((response as any)?.data) {
        data = (response as any).data;
      }

      console.log('[WishlistTab] Wishlist loaded:', data.length, 'items');
      setWishlistItems(data);
    } catch (err: any) {
      console.error('[WishlistTab] Error fetching wishlist:', err);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      console.log('[WishlistTab] Removing product:', productId);
      await UserService.removeFromWishlist(productId);
      setWishlistItems(wishlistItems.filter((item) => item.productId._id !== productId));
      console.log('[WishlistTab] Product removed successfully');
    } catch (err: any) {
      console.error('[WishlistTab] Error removing item:', err);
      const errorMessage = err?.message || 'Failed to remove item from wishlist';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-[#004d84]" />
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border border-gray-200 rounded-[1px]">
        <CardContent className="p-8 text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <Button
            onClick={fetchWishlist}
            className="bg-[#004d84] hover:bg-[#003d6a] rounded-none"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">My Wishlist</h2>
        <span className="text-sm text-gray-600">{wishlistItems.length} items</span>
      </div>

      {wishlistItems.length === 0 ? (
        <Card className="border border-gray-200 rounded-[1px]">
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">Your wishlist is empty</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="mt-4 bg-[#004d84] hover:bg-[#003d6a] rounded-none"
            >
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const product = item.productId;
            // Calculate discount if originalPrice is available
            const originalPrice = (product as any)?.originalPrice || product.price * 1.2;
            const discount = Math.round(
              ((originalPrice - product.price) / originalPrice) * 100
            );
            const productImage = product.images?.[0] || '/placeholder-product.png';

            return (
              <div key={item._id} className="relative">
                <ProductCard
                  id={product._id}
                  title={product.name}
                  brand={product.brandName || 'Unknown Brand'}
                  price={product.price}
                  originalPrice={originalPrice}
                  discount={discount}
                  image={productImage}
                  onWishlistToggle={() => handleRemoveItem(product._id)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
