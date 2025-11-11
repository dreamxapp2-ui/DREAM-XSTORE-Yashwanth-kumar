'use client';

import { useState, useEffect } from 'react';
import { ProductCard, type ProductCardProps } from '@/src/components/cards';
import { ProductService, type Product } from '@/src/lib/api';

export default function FeaturedProducts() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[FeaturedProducts] Fetching products...');
        const response = await ProductService.getProducts({ limit: 20 });
        console.log('[FeaturedProducts] Products response:', response);
        
        const productsData = Array.isArray(response) ? response : (response as any)?.data || [];
        console.log('[FeaturedProducts] Extracted products:', productsData);
        
        setProducts(productsData);
      } catch (err: any) {
        const errorMessage = err?.message || err?.toString?.() || 'Failed to load products';
        console.error('[FeaturedProducts] Error fetching products:', {
          message: errorMessage,
          status: err?.status,
          code: err?.code,
          fullError: err,
        });
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Extract unique categories from products
  const categories = [
    { id: 'all', name: 'All Products' },
    ...Array.from(new Set(products.map(p => p.category)))
      .map(cat => ({
        id: cat.toLowerCase().replace(/\s+/g, '-'),
        name: cat
      }))
  ];

  // Filter products based on selected category
  const filteredProducts = selectedCategory && selectedCategory !== 'all'
    ? products.filter((p) => p.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory)
    : products;

  const handleWishlistToggle = (id: string, isWishlisted: boolean) => {
    console.log(`Product ${id} wishlisted:`, isWishlisted);
    // TODO: Implement wishlist API call
  };

  // Loading state
  if (loading) {
    return (
      <section className="px-4 sm:px-6 lg:px-20 py-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-600">Discover our latest collections and best sellers</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="px-4 sm:px-6 lg:px-20 py-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-600">Discover our latest collections and best sellers</p>
          </div>
          <div className="text-center text-red-600">{error}</div>
        </div>
      </section>
    );
  }

  // ... existing code ...
  return (
    <section className="px-4 sm:px-6 lg:px-20 py-12">
      <div className="space-y-8">
        {/* Section Header */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          <p className="text-gray-600">Discover our latest collections and best sellers</p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-b border-gray-200 pb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium text-sm sm:text-base transition-all duration-200 whitespace-nowrap ${
                selectedCategory === category.id || (selectedCategory === null && category.id === 'all')
                  ? 'bg-black text-white'
                  : 'border border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                id={product._id}
                title={product.name}
                brand={product?.brandName || 'Unknown'}
                price={product.price}
                originalPrice={product.originalPrice}
                discount={product.discount}
                image={product.images?.[0] || '/placeholder.svg'}
                onWishlistToggle={handleWishlistToggle}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No products found in this category</p>
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="flex justify-center pt-8">
          <button className="px-8 py-3 border border-gray-300 rounded-full text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}
