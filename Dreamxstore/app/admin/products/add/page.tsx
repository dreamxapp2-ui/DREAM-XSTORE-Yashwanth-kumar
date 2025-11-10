'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AdminService } from '@/src/lib/api/admin/adminService';

interface FormData {
  name: string;
  description: string;
  longDescription: string;
  category: string;
  subCategory: string;
  brandId: string;
  brandName?: string;
  price: number;
  originalPrice: number;
  discount: number;
  stockQuantity: number;
  sizes: string[];
  features: string[];
  tags: string[];
  images: string[];
}

interface Brand {
  id: string;
  name: string;
  brandName: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    longDescription: '',
    category: '',
    subCategory: '',
    brandId: '',
    price: 0,
    originalPrice: 0,
    discount: 0,
    stockQuantity: 0,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    features: [],
    tags: [],
    images: [],
  });

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true);
        console.log('[AddProduct] Fetching brands...');
        const response = await AdminService.getBrands({ limit: 1000 });
        console.log('[AddProduct] Brands response:', response);
        
        const brandsData = Array.isArray(response) ? response : (response as any)?.data || [];
        console.log('[AddProduct] Extracted brands:', brandsData);
        
        // Map brands to include both id and name
        const mappedBrands = brandsData.map((brand: any) => ({
          id: brand.id || brand._id,
          name: brand.name || brand.brandName,
          brandName: brand.name || brand.brandName,
        }));
        
        setBrands(mappedBrands);
      } catch (error) {
        console.error('[AddProduct] Error fetching brands:', error);
        setError('Failed to load brands');
      } finally {
        setBrandsLoading(false);
      }
    };

    fetchBrands();
  }, []);

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
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: name === 'price' || name === 'originalPrice' || name === 'discount' || name === 'stockQuantity' 
          ? parseFloat(value) || 0 
          : value,
      };
      // When brand is selected, also set brandName
      if (name === 'brandId') {
        const selectedBrand = brands.find(b => b.id === value);
        if (selectedBrand) {
          updated.brandName = selectedBrand.name;
        }
      }
      return updated;
    });
  };

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  // ... existing code ...

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      console.log('[AddProduct] Uploading images:', { count: files.length });

      // Upload images to Cloudinary
      const uploadedImages = await AdminService.uploadProductImages(
        files,
        (progress) => {
          console.log('[AddProduct] Upload progress:', progress);
          setUploadProgress(progress);
        }
      );

      console.log('[AddProduct] Images uploaded:', uploadedImages);

      // Extract URLs from uploaded images
      const newUrls = uploadedImages.map((img: any) => img.url);
      setImageUrls((prev) => [...prev, ...newUrls]);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newUrls],
      }));

      // Reset file input
      if (e.target) {
        e.target.value = '';
      }

      setUploadProgress(0);
    } catch (error: any) {
      console.error('[AddProduct] Image upload error:', error);
      setError(error?.message || 'Failed to upload images');
      setUploadProgress(0);
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
      return;
    }

    if (formData.images.length === 0) {
      setError('Please add at least one product image');
      return;
    }

    if (!formData.category || !formData.brandId) {
      setError('Please select category and brand');
      return;
    }

    if (formData.price <= 0 || formData.originalPrice <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      console.log('[AddProduct] Submitting product:', formData);

      const response = await AdminService.addProduct(formData);
      console.log('[AddProduct] Product created successfully:', response);
      
      alert('Product added successfully!');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('[AddProduct] Error adding product:', error);
      const errorMessage = error?.message || error?.data?.message || 'Failed to add product';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
              {brandsLoading ? (
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600">
                  Loading brands...
                </div>
              ) : brands.length === 0 ? (
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600">
                  No brands available
                </div>
              ) : (
                <select
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              )}
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
          {/* <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
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
                value={formData.originalPrice}
                onChange={handleInputChange}
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
                value={formData.discount}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div> */}
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
        </div>

        {/* Stock Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stock</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Sizes Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Sizes</h2>
          <div className="flex flex-wrap gap-3">
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
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
