"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import { UserService } from '../lib/api/services/userService';
import WishlistButton from './WishlistButton';

interface WishlistItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    rating: number;
    reviewsCount: number;
    brandName: string;
  };
  addedAt: string;
}

interface WishlistPageProps {
  title?: string;
  emptyStateText?: string;
}

const WishlistPage: React.FC<WishlistPageProps> = ({
  title = 'My Wishlist',
  emptyStateText = 'Your wishlist is empty. Start adding your favorite products!'
}) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchWishlist();
  }, [page]);

  const fetchWishlist = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await UserService.getWishlist(page, 12);
      console.log('[WishlistPage] Response:', response);
      
      // Handle response - backend returns { success, data: [], pagination: {} }
      let data: WishlistItem[] = [];
      let pagination: any = null;
      
      if (Array.isArray(response)) {
        data = response;
      } else if ((response as any)?.data) {
        data = (response as any).data;
        pagination = (response as any).pagination;
      }
      
      setWishlist(data);
      setTotalPages(pagination?.pages || 1);
      setTotalItems(pagination?.total || data.length);
      console.log('[WishlistPage] Wishlist loaded:', data.length, 'items');
    } catch (err: any) {
      console.error('[WishlistPage] Error fetching wishlist:', err);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await UserService.removeFromWishlist(productId);
      setWishlist(wishlist.filter((item) => {
        const pid = item.productId?._id || item.productId;
        return pid !== productId;
      }));
      setTotalItems(totalItems - 1);
    } catch (err: any) {
      console.error('[WishlistPage] Error removing item:', err);
      const errorMessage = err?.message || 'Failed to remove item from wishlist';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <button
          onClick={fetchWishlist}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{emptyStateText}</p>
        <a
          href="/products"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
        >
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {totalItems > 0 && (
          <span className="text-sm text-gray-600">({totalItems} items)</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {wishlist.map((item) => {
          const product = item.productId;
          if (!product) return null;

          return (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-200 overflow-hidden group">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}

                {/* Wishlist Button */}
                <div className="absolute top-2 right-2">
                  <WishlistButton
                    productId={product._id}
                    className="bg-white/90 hover:bg-white p-2 rounded-full"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                {/* Brand */}
                <p className="text-xs text-gray-500 mb-1">{product.brandName}</p>

                {/* Product Name */}
                <h3 className="font-semibold text-gray-800 text-sm mb-2 truncate">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-xs ${
                          star <= product.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">
                    ({product.reviewsCount})
                  </span>
                </div>

                {/* Price */}
                <p className="text-lg font-bold text-gray-900 mb-3">
                  ₹{product.price.toLocaleString()}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      // TODO: Add to cart functionality
                      console.log('Adding to cart:', product._id);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemoveItem(product._id)}
                    className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded transition-colors ${
                page === p
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
