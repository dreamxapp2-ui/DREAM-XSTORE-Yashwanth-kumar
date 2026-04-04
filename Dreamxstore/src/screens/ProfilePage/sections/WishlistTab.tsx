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
    originalPrice: number;
    discount: number;
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

  const handleWishlistToggle = async (productId: string, isWishlisted: boolean) => {
    // isWishlisted=false means user wants to remove
    if (!isWishlisted) {
      try {
        console.log('[WishlistTab] Removing product:', productId);
        await UserService.removeFromWishlist(productId);
        setWishlistItems(wishlistItems.filter((item) => {
          const pid = item.productId?._id || item.productId;
          return pid !== productId;
        }));
        console.log('[WishlistTab] Product removed successfully');
      } catch (err: any) {
        console.error('[WishlistTab] Error removing item:', err);
        const errorMessage = err?.message || 'Failed to remove item from wishlist';
        alert(errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-black" />
          <p className="text-xs font-black uppercase italic tracking-widest text-gray-400">Loading Vault...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border border-gray-100 rounded-[2.5rem] bg-white">
        <CardContent className="p-12 text-center">
          <p className="text-red-500 font-black uppercase italic mb-6">{error}</p>
          <Button
            onClick={fetchWishlist}
            className="bg-black text-[#bef264] hover:bg-black/90 rounded-full px-8 py-3 font-black uppercase italic text-xs"
          >
            Retry Sync
          </Button>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-6">
        <h2 className="text-2xl font-black italic uppercase tracking-tight text-black">Saved Vault</h2>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#bef264] bg-black px-4 py-1.5 rounded-full">{wishlistItems.length} ENTRIES</span>
      </div>

      {wishlistItems.length === 0 ? (
        <Card className="border border-gray-50 bg-[#fcfcfc] rounded-[3rem]">
          <CardContent className="p-16 text-center">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-gray-200" />
             </div>
            <p className="text-sm font-black uppercase italic text-gray-400">Vault currently vacant.</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="mt-8 bg-black text-[#bef264] hover:bg-[#bef264] hover:text-black rounded-full px-10 py-5 font-black uppercase italic text-xs transition-all shadow-xl shadow-[#bef264]/10"
            >
              Explore Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlistItems.map((item) => {
            const product = item.productId;
            
            // Skip if product has been deleted
            if (!product) {
              console.warn('[WishlistTab] Product not found for wishlist item:', item._id);
              return null;
            }

            const productImage = product.images?.[0] || '/placeholder-product.png';

            return (
              <div key={item._id} className="relative group transition-all duration-500 hover:-translate-y-2">
                <ProductCard
                  id={product._id}
                  title={product.name}
                  brand={product.brandName || 'Unknown Brand'}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discount={product.discount}
                  image={productImage}
                  onWishlistToggle={handleWishlistToggle}
                  useCustomWishlistHandler={true}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
