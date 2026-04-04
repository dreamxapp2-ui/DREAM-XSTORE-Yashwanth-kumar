"use client";

import React, { useState, useEffect } from "react";
import { ProductService } from "../../src/lib/api/services/productService";
import type { Product } from "../../src/lib/api/services/productService";
import Link from "next/link";
import { Star, ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import WishlistButton from "../../src/components/WishlistButton";

const CATEGORIES = [
  "All",
  "T-Shirts",
  "Hoodies",
  "Jeans",
  "Dresses",
  "Footwear",
  "Accessories",
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const filters: any = { page, limit: 20, sortBy };
        if (selectedCategory !== "All") filters.category = selectedCategory;
        if (searchQuery.trim()) filters.search = searchQuery.trim();
        const response = await ProductService.getProducts(filters);
        setProducts(response.data || []);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("[Products] Failed to fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, selectedCategory, sortBy, searchQuery]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004d84]"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004d84]"
          >
            <option value="createdAt">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="rating">Top Rated</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? "bg-[#004d84] text-white border-[#004d84]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No products available yet</p>
            <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {products.map((product) => (
                <Link
                  key={product._id}
                  href={`/product/${product._id}`}
                  className="bg-white rounded-2xl p-3 group transition-all hover:shadow-xl hover:-translate-y-1 relative"
                >
                  <div className="absolute top-4 right-4 z-10">
                    <WishlistButton
                      productId={product._id}
                      className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-xl overflow-hidden aspect-[4/5] flex items-center justify-center mb-3">
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="px-1">
                    <div className="flex items-center gap-1 text-xs text-yellow-500 mb-1">
                      <Star className="w-3 h-3 fill-yellow-500" />
                      <span className="text-gray-400 font-bold">
                        {product.rating || 0}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm font-extrabold text-[#004d84]">
                      ₹{typeof product.price === "number" ? product.price.toLocaleString("en-IN") : product.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-white border disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-white border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
