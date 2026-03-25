'use client';

import { Plus, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AdminService } from '@/src/lib/api/admin/adminService';
import { useToast } from '@/src/contexts/ToastContext';

interface Product {
  id: string;
  _id?: string;
  name: string;
  brand?: string;
  brandId?: any;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  stockQuantity: number;
  inStock: boolean;
  hasSizes?: boolean;
  sizeStock?: { [key: string]: number };
  sizes?: string[];
}

export default function ProductsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Products] Fetching products...');
      
      const response = await AdminService.getProducts({ limit: 100 });
      console.log('[Products] API Response:', response);
      
      // Handle different response structures
      const productsData = Array.isArray(response) 
        ? response 
        : (response as any)?.data || [];
      
      console.log('[Products] Extracted products:', productsData);
      setProducts(productsData);
      showToast('Products loaded successfully', 'success');
    } catch (error: any) {
      console.error('[Products] Error fetching products:', error);
      setError('Failed to load products');
      showToast('Failed to load products', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string | undefined) => {
    if (!productId) {
      showToast('Invalid product ID', 'error');
      return;
    }

    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await AdminService.deleteProduct(productId);
      showToast('Product deleted successfully', 'success');
      // Refresh the products list
      fetchProducts();
    } catch (error: any) {
      console.error('[Products] Delete error:', error);
      showToast('Failed to delete product', 'error');
    }
  };

  const categories = ['All', ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product inventory</p>
        </div>
        <button
          onClick={() => router.push('/admin/products/add')}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-gray-600 mt-4">Loading products...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category === 'All' ? null : category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      (category === 'All' && selectedCategory === null) ||
                      (category !== 'All' && selectedCategory === category)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Brand</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock Details</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id || product._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.brand || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      ₹{product.price}
                      <span className="text-gray-500 line-through ml-2">₹{product.originalPrice}</span>
                    </td>
                    {/* Stock Details Cell */}
                    <td className="px-6 py-4 text-sm">
                      {product.hasSizes ? (
                        /* Size-based Stock */
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-gray-700 mb-2">Size Stock:</div>
                          <div className="grid grid-cols-4 gap-1">
                            {product.sizes?.map((size: string) => (
                              <div key={size} className="flex flex-col items-center">
                                <span className="text-xs font-semibold text-gray-900">{size}</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  (product.sizeStock?.[size] || 0) > 0
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {product.sizeStock?.[size] || 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Default Stock */
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-gray-700">Total Stock:</div>
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            product.stockQuantity > 0
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stockQuantity}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/products/${product.id || product._id}`)}
                          className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id || product._id)}
                          className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No products found</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No products yet</p>
          <button
            onClick={() => router.push('/admin/products/add')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Plus size={20} />
            Add your first product
          </button>
        </div>
      )}
    </div>
  );
}
