'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BrandService } from '@/src/lib/api/brand/brandService';
import { BrandAuthService } from '@/src/lib/api/brand/brandAuthService';
import { useToast } from '@/src/contexts/ToastContext';

interface FormData {
  name: string;
  description: string;
  longDescription: string;
  category: string;
  subCategory: string;
  price: number;
  originalPrice: number;
  discount: number;
  stockQuantity: number;
  sizeStock: { [key: string]: number };
  sizes: string[];
  features: string[];
  tags: string[];
  images: string[];
  weight?: number;
  length?: number;
  breadth?: number;
  height?: number;
}

export default function BrandUploadProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [hasSizes, setHasSizes] = useState(true);
  const [brand, setBrand] = useState<any>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    longDescription: '',
    category: '',
    subCategory: '',
    price: 0,
    originalPrice: 0,
    discount: 0,
    stockQuantity: 0,
    sizeStock: {
      'XS': 0,
      'S': 0,
      'M': 0,
      'L': 0,
      'XL': 0,
      'XXL': 0,
      'XXXL': 0,
    },
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    features: [],
    tags: [],
    images: [],
    weight: undefined,
    length: undefined,
    breadth: undefined,
    height: undefined,
  });

  // Check authentication and get brand info
  useEffect(() => {
    const currentBrand = BrandAuthService.getCurrentBrand();
    if (!currentBrand) {
      router.push('/brand-login');
      return;
    }
    setBrand(currentBrand);
  }, [router]);

  const categories = [
    'T-Shirts',
    'Hoodies',
    'Jackets',
    'Shoes',
    'Accessories',
    'Bags',
    'Pants',
    'Dresses',
  ];

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'originalPrice' || name === 'discount' || name === 'stockQuantity' || name === 'weight' || name === 'length' || name === 'breadth' || name === 'height'
        ? parseFloat(value) || (name === 'weight' || name === 'length' || name === 'breadth' || name === 'height' ? undefined : 0)
        : value,
    }));
  };

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleSizeStockChange = (size: string, stock: number) => {
    setFormData((prev) => ({
      ...prev,
      sizeStock: {
        ...prev.sizeStock,
        [size]: stock,
      },
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      console.log('[BrandUploadProduct] Uploading images:', { count: files.length });

      const uploadedImages = await BrandService.uploadProductImages(
        files,
        (progress) => {
          console.log('[BrandUploadProduct] Upload progress:', progress);
          setUploadProgress(progress);
        }
      );

      console.log('[BrandUploadProduct] Images uploaded:', uploadedImages);

      const newUrls = uploadedImages.map((img: any) => img.url);
      setImageUrls((prev) => [...prev, ...newUrls]);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newUrls],
      }));

      if (e.target) {
        e.target.value = '';
      }

      setUploadProgress(0);
      showToast('Images uploaded successfully', 'success');
    } catch (error: any) {
      console.error('[BrandUploadProduct] Image upload error:', error);
      setError(error?.message || 'Failed to upload images');
      setUploadProgress(0);
      showToast('Failed to upload images', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature],
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name || !formData.description || !formData.longDescription) {
      setError('Please fill in all required fields');
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    if (formData.images.length === 0) {
      setError('Please add at least one product image');
      showToast('Please add at least one product image', 'warning');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      showToast('Please select a category', 'warning');
      return;
    }

    if (formData.price <= 0 || formData.originalPrice <= 0) {
      setError('Price must be greater than 0');
      showToast('Price must be greater than 0', 'warning');
      return;
    }

    try {
      setLoading(true);
      console.log('[BrandUploadProduct] Submitting product:', formData);

      const totalStock = hasSizes 
        ? Object.values(formData.sizeStock).reduce((sum, stock) => sum + stock, 0)
        : formData.stockQuantity;
      
      const submitData = {
        ...formData,
        stockQuantity: totalStock,
        hasSizes: hasSizes,
      };

      const response = await BrandService.createProduct(submitData);
      console.log('[BrandUploadProduct] Product created successfully:', response);
      
      showToast('Product uploaded successfully!', 'success');
      router.push('/brand/dashboard');
    } catch (error: any) {
      console.error('[BrandUploadProduct] Error adding product:', error);
      const errorMessage = error?.message || error?.data?.message || 'Failed to add product';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!brand) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload New Product</h1>
          <p className="text-gray-600 mt-1">Add a new product to {brand.brandName}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-8">
        {/* Basic Information Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Oversized T-Shirt"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category</label>
              <input
                type="text"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleInputChange}
                placeholder="e.g., Summer Collection"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium">
                {brand.brandName}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the product (max 500 chars)"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Long Description *</label>
            <textarea
              name="longDescription"
              value={formData.longDescription}
              onChange={handleInputChange}
              placeholder="Detailed description of the product (max 2000 chars)"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Pricing Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price || ''}
                onChange={handleInputChange}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹) *</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice || ''}
                onChange={handleInputChange}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%) *</label>
              <input
                type="number"
                name="discount"
                value={formData.discount || ''}
                onChange={handleInputChange}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Stock Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stock Management</h2>
          
          {/* Stock Type Toggle */}
          <div className="mb-6 flex gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="stockType"
                checked={hasSizes}
                onChange={() => setHasSizes(true)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Size-based Stock (S, M, L, XL, etc.)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="stockType"
                checked={!hasSizes}
                onChange={() => setHasSizes(false)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Default Stock (Books, Digital, etc.)</span>
            </label>
          </div>

          {/* Size-based Stock */}
          {hasSizes ? (
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              {/* Available Sizes */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Available Sizes</h3>
                <div className="flex flex-wrap gap-3 mb-6">
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        formData.sizes.includes(size)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size-based Stock Input */}
              {formData.sizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Stock for Each Size</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.sizes.map((size) => (
                      <div key={size}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {size}
                        </label>
                        <input
                          type="number"
                          value={formData.sizeStock[size] || 0}
                          onChange={(e) => handleSizeStockChange(size, parseInt(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Stock Display */}
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Stock:</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {Object.values(formData.sizeStock).reduce((sum, stock) => sum + stock, 0)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Default Stock */
            <div className="bg-gray-50 rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Stock Quantity *</label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                placeholder="Enter total stock quantity"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-2">For products without size variations (books, digital products, etc.)</p>
            </div>
          )}
        </div>

        {/* Images Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Images *</h2>
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Upload Images</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload size={32} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {uploading ? `Uploading... ${uploadProgress}%` : 'Click to upload or drag images'}
                  </span>
                  <span className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
                </label>
              </div>
              
              {/* Upload Progress Bar */}
              {uploading && (
                <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Image List with Previews */}
            {imageUrls.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {imageUrls.length} image(s) uploaded
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {imageUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square"
                    >
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={24} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Weight & Dimensions Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weight & Dimensions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight || ''}
                onChange={handleInputChange}
                placeholder="e.g., 0.5"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Length (cm)</label>
              <input
                type="number"
                name="length"
                value={formData.length || ''}
                onChange={handleInputChange}
                placeholder="e.g., 25"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Breadth (cm)</label>
              <input
                type="number"
                name="breadth"
                value={formData.breadth || ''}
                onChange={handleInputChange}
                placeholder="e.g., 20"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height || ''}
                onChange={handleInputChange}
                placeholder="e.g., 30"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="e.g., 100% Cotton"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Features List */}
            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-2 rounded-full">
                    <span className="text-sm">{feature}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-purple-700 hover:text-purple-900"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="e.g., anime, oversized"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Tags List */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-2 rounded-full">
                    <span className="text-sm">#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="text-gray-800 hover:text-gray-900"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-8 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading Product...' : 'Upload Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
