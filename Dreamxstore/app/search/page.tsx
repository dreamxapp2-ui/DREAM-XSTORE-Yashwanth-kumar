'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProductService } from '../../src/lib/api/services/productService';
import { ProductCard } from '../../src/components/cards';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: string[];
  category: string;
  brandName?: string;
  rating?: number;
  reviewsCount?: number;
}

import { Suspense } from 'react';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sync searchQuery state with URL params
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Search using backend API
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      console.log('[Search] Searching for:', searchQuery);
      const response = await ProductService.searchProducts(searchQuery);
      
      // The API returns PaginatedResponse<Product> which has a 'data' property (the array)
      const products = response.data || [];
      
      setFilteredProducts(products);
      console.log('[Search] Found', products.length, 'products');
    } catch (error) {
      console.error('[Search] Error:', error);
      setFilteredProducts([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleWishlistToggle = (id: string, isWishlisted: boolean) => {
    console.log(`Product ${id} wishlisted:`, isWishlisted);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 90 },
    },
  };

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 lg:px-20 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="w-full px-4 py-3 pl-12 rounded-full border border-gray-200 shadow-sm 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              autoFocus
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-20 py-8">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="loading"
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex justify-center items-center py-12"
            >
              <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
            </motion.div>
          ) : searchQuery.trim() ? (
            <motion.div
              key="results"
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Search Results for "<span className="text-blue-600">{searchQuery}</span>"
                </h2>
                <p className="text-gray-600">Found {filteredProducts.length} product(s)</p>
              </div>

              {filteredProducts.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product._id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.03 }}
                      className="transition-transform"
                    >
                      <ProductCard
                        id={product._id}
                        title={product.name}
                        brand={product.brandName || 'Unknown'}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        discount={product.discount}
                        image={product.images?.[0] || '/placeholder.svg'}
                        onWishlistToggle={handleWishlistToggle}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  variants={fadeVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="text-center py-12"
                >
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No products found matching your search</p>
                  <p className="text-gray-400 text-sm mt-2">Try different keywords</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="start"
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-center py-12"
            >
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Start typing to search products</p>
              <p className="text-gray-400 text-sm mt-2">Search by product name, brand, or category</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex text-center items-center justify-center py-12">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
