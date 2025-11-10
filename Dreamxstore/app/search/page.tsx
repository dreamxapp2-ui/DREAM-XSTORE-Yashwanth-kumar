// 'use client';

// import { useState, useEffect } from 'react';
// import { useSearchParams } from 'next/navigation';
// import { Search, ChevronLeft } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { ProductCard, type ProductCardProps } from '@/src/components/cards';

// export default function SearchPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
//   const [filteredProducts, setFilteredProducts] = useState<(ProductCardProps & { category: string })[]>([]);
//   const [isSearching, setIsSearching] = useState(false);

//   // Mock all products database
//   const allProducts: (ProductCardProps & { category: string })[] = [
//     {
//       id: '1',
//       title: 'Oversized T-Shirt',
//       brand: 'ROCKAGE',
//       price: 699,
//       originalPrice: 1399,
//       discount: 50,
//       image: 'https://images.unsplash.com/photo-1618183479302-1e0aa382c36b?w=400&q=80',
//       category: 't-shirts',
//     },
//     {
//       id: '2',
//       title: 'Classic Hoodies',
//       brand: 'ROCKAGE',
//       price: 1299,
//       originalPrice: 2499,
//       discount: 48,
//       image: 'https://images.unsplash.com/photo-1556821552-5f43077dd5e5?w=400&q=80',
//       category: 'hoodies',
//     },
//     {
//       id: '3',
//       title: 'Casual Jackets',
//       brand: 'ROCKAGE',
//       price: 2499,
//       originalPrice: 4999,
//       discount: 50,
//       image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400&q=80',
//       category: 'jackets',
//     },
//     {
//       id: '4',
//       title: 'Trendy Shoes',
//       brand: 'ROCKAGE',
//       price: 3999,
//       originalPrice: 7999,
//       discount: 50,
//       image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
//       category: 'shoes',
//     },
//     {
//       id: '5',
//       title: 'Basic T-Shirt White',
//       brand: 'ROCKAGE',
//       price: 499,
//       originalPrice: 999,
//       discount: 50,
//       image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
//       category: 't-shirts',
//     },
//     {
//       id: '6',
//       title: 'Premium Hoodies Grey',
//       brand: 'ROCKAGE',
//       price: 1599,
//       originalPrice: 3199,
//       discount: 50,
//       image: 'https://images.unsplash.com/photo-1567898622838-f88db80811ce?w=400&q=80',
//       category: 'hoodies',
//     },
//     {
//       id: '7',
//       title: 'Winter Jacket Black',
//       brand: 'ROCKAGE',
//       price: 2999,
//       originalPrice: 5999,
//       discount: 50,
//       image: 'https://images.unsplash.com/photo-1539533057440-7814a3d7b26f?w=400&q=80',
//       category: 'jackets',
//     },
//     {
//       id: '8',
//       title: 'Sports Shoes',
//       brand: 'ROCKAGE',
//       price: 4499,
//       originalPrice: 8999,
//       discount: 50,
//       image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
//       category: 'shoes',
//     },
//     {
//       id: '9',
//       title: 'Designer Accessories',
//       brand: 'ROCKAGE',
//       price: 899,
//       originalPrice: 1799,
//       discount: 50,
//       image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
//       category: 'accessories',
//     },
//   ];

//   // Handle search
//   useEffect(() => {
//     if (searchQuery.trim()) {
//       setIsSearching(true);
//       // Simulate search delay
//       const timer = setTimeout(() => {
//         const query = searchQuery.toLowerCase();
//         const results = allProducts.filter(
//           (product) =>
//             product.title.toLowerCase().includes(query) ||
//             product.brand.toLowerCase().includes(query) ||
//             product.category.toLowerCase().includes(query)
//         );
//         setFilteredProducts(results);
//         setIsSearching(false);
//         console.log(`[Search] Found ${results.length} results for "${searchQuery}"`);
//       }, 300);

//       return () => clearTimeout(timer);
//     } else {
//       setFilteredProducts([]);
//     }
//   }, [searchQuery]);

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
//     }
//   };

//   const handleWishlistToggle = (id: string, isWishlisted: boolean) => {
//     console.log(`Product ${id} wishlisted:`, isWishlisted);
//     // TODO: Implement wishlist API call
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Search Bar */}
//       <div className="sticky top-16 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-20 py-4">
//         <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
//           <div className="relative">
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="Search products, brands, categories..."
//               className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
//               autoFocus
//             />
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//           </div>
//         </form>
//       </div>

//       {/* Content */}
//       <div className="px-4 sm:px-6 lg:px-20 py-8">
//         {isSearching ? (
//           <div className="flex justify-center items-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
//           </div>
//         ) : searchQuery.trim() ? (
//           <>
//             <div className="space-y-4 mb-8">
//               <h2 className="text-2xl font-bold text-gray-900">
//                 Search Results for "<span className="text-blue-600">{searchQuery}</span>"
//               </h2>
//               <p className="text-gray-600">Found {filteredProducts.length} product(s)</p>
//             </div>

//             {filteredProducts.length > 0 ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                 {filteredProducts.map((product) => (
//                   <ProductCard
//                     key={product.id}
//                     id={product.id}
//                     title={product.title}
//                     brand={product.brand}
//                     price={product.price}
//                     originalPrice={product.originalPrice}
//                     discount={product.discount}
//                     image={product.image}
//                     onWishlistToggle={handleWishlistToggle}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12">
//                 <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                 <p className="text-gray-500 text-lg">No products found matching your search</p>
//                 <p className="text-gray-400 text-sm mt-2">Try a different search term</p>
//               </div>
//             )}
//           </>
//         ) : (
//           <div className="text-center py-12">
//             <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <p className="text-gray-500 text-lg">Start typing to search products</p>
//             <p className="text-gray-400 text-sm mt-2">Search by product name, brand, or category</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProductCard, type ProductCardProps } from '@/src/components/cards';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filteredProducts, setFilteredProducts] = useState<(ProductCardProps & { category: string })[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock DB
  const allProducts: (ProductCardProps & { category: string })[] = [
    {
      id: '1',
      title: 'Oversized T-Shirt',
      brand: 'ROCKAGE',
      price: 699,
      originalPrice: 1399,
      discount: 50,
      image: 'https://images.unsplash.com/photo-1618183479302-1e0aa382c36b?w=400&q=80',
      category: 't-shirts',
    },
    {
      id: '2',
      title: 'Classic Hoodies',
      brand: 'ROCKAGE',
      price: 1299,
      originalPrice: 2499,
      discount: 48,
      image: 'https://images.unsplash.com/photo-1556821552-5f43077dd5e5?w=400&q=80',
      category: 'hoodies',
    },
    {
      id: '3',
      title: 'Casual Jackets',
      brand: 'ROCKAGE',
      price: 2499,
      originalPrice: 4999,
      discount: 50,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400&q=80',
      category: 'jackets',
    },
    {
      id: '4',
      title: 'Trendy Shoes',
      brand: 'ROCKAGE',
      price: 3999,
      originalPrice: 7999,
      discount: 50,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
      category: 'shoes',
    },
  ];

  // Search logic
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);

      const timer = setTimeout(() => {
        const query = searchQuery.toLowerCase();
        const results = allProducts.filter(
          (product) =>
            product.title.toLowerCase().includes(query) ||
            product.brand.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );
        setFilteredProducts(results);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
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
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
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
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </motion.div>
        </form>
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
                      key={product.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.03 }}
                      className="transition-transform"
                    >
                      <ProductCard
                        id={product.id}
                        title={product.title}
                        brand={product.brand}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        discount={product.discount}
                        image={product.image}
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
