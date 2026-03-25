"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrandAuthService } from "@/src/lib/api/brand/brandAuthService";
import { apiClient } from "@/src/lib/api/client";
import { ProductService } from "@/src/lib/api";
import { Edit2, X, Plus } from "lucide-react";

export default function BrandDashboard() {
  const [brand, setBrand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    image: '',
    imageFile: null as File | null,
    description: '',
    instagram: '',
    facebook: '',
    twitter: '',
    uploading: false,
    uploadProgress: 0,
  });
  const router = useRouter();

  useEffect(() => {
    // Check if brand is logged in
    const currentBrand = BrandAuthService.getCurrentBrand();
    if (!currentBrand) {
      router.push("/brand-login");
      return;
    }
    console.log('[BrandDashboard] Current brand from localStorage:', currentBrand);
    setBrand(currentBrand);

    // Fetch fresh brand profile data from backend to get latest image
    const fetchBrandProfile = async () => {
      try {
        const freshBrand = await BrandAuthService.getBrandProfile();
        if (freshBrand) {
          console.log('[BrandDashboard] Fresh brand profile from backend:', freshBrand);
          console.log('[BrandDashboard] Profile image:', freshBrand.profileImage);
          setBrand(freshBrand);
        }
      } catch (error) {
        console.error('[BrandDashboard] Error fetching brand profile:', error);
        // Continue with localStorage data if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchBrandProfile();
  }, [router]);

  // Sync editFormData with brand data when modal opens
  useEffect(() => {
    if (isEditModalOpen && brand) {
      setEditFormData({
        image: brand.profileImage?.url || brand.profileImage || '',
        imageFile: null,
        description: brand.description || '',
        instagram: brand.instagram || '',
        facebook: brand.facebook || '',
        twitter: brand.twitter || '',
        uploading: false,
        uploadProgress: 0,
      });
    }
  }, [isEditModalOpen, brand]);

  const handleLogout = () => {
    BrandAuthService.logout();
    router.push("/brand-login");
  };

  const handleFetchProducts = async () => {
    if (!brand) return;

    try {
      setProductsLoading(true);
      setProductsError(null);
      console.log('[BrandDashboard] Fetching products for brand:', brand.id);

      const response = await ProductService.getProducts({ limit: 100 });
      console.log('[BrandDashboard] Products response:', response);

      const productsData = Array.isArray(response)
        ? response
        : (response as any)?.data || [];

      // Filter products by brand ID
      const brandProducts = productsData.filter((product: any) => {
        const productBrandId = typeof product.brandId === 'object'
          ? (product.brandId as any)?._id
          : product.brandId;
        return productBrandId === brand.id || productBrandId === brand.brandName;
      });

      console.log('[BrandDashboard] Filtered brand products:', brandProducts);
      setProducts(brandProducts);
      setIsProductsModalOpen(true);
    } catch (error: any) {
      console.error('[BrandDashboard] Error fetching products:', error);
      setProductsError('Failed to load products: ' + (error.message || 'Unknown error'));
    } finally {
      setProductsLoading(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setEditFormData((prev) => ({
          ...prev,
          image: imageUrl,
          imageFile: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async () => {
    if (!brand) return;

    try {
      setEditFormData((prev) => ({ ...prev, uploading: true }));

      console.log('[handleSaveEdit] Starting save process');

      let response;

      // Check if we have a new image file to upload
      if (editFormData.imageFile) {
        console.log('[handleSaveEdit] Uploading image and updating profile via FormData');
        const formData = new FormData();
        formData.append('file', editFormData.imageFile);

        // Append other fields to FormData
        if (editFormData.description) formData.append('description', editFormData.description);
        if (editFormData.instagram) formData.append('instagram', editFormData.instagram);
        if (editFormData.facebook) formData.append('facebook', editFormData.facebook);
        if (editFormData.twitter) formData.append('twitter', editFormData.twitter);

        // Send single request with FormData
        response = await BrandAuthService.updateProfile(formData);
      } else {
        console.log('[handleSaveEdit] Updating profile data via JSON');
        // No new image, just update text fields
        const profileUpdateData = {
          description: editFormData.description,
          instagram: editFormData.instagram,
          facebook: editFormData.facebook,
          twitter: editFormData.twitter,
        };

        // Send single request with JSON
        response = await BrandAuthService.updateProfile(profileUpdateData);
      }

      console.log('[handleSaveEdit] Update successful:', response);

      // Fetch fresh brand profile to get updated data and ensure UI sync
      const freshBrand = await BrandAuthService.getBrandProfile();
      if (freshBrand) {
        setBrand(freshBrand);
        // Update localStorage with fresh data
        localStorage.setItem('brand_user', JSON.stringify({
          id: freshBrand.id,
          brandName: freshBrand.brandName,
          ownerEmail: freshBrand.ownerEmail,
          status: freshBrand.status,
          profileImage: freshBrand.profileImage,
          description: freshBrand.description,
          instagram: freshBrand.instagram,
          facebook: freshBrand.facebook,
          twitter: freshBrand.twitter,
          token: BrandAuthService.getToken()
        }));
      }

      setIsEditModalOpen(false);
      alert('Brand profile updated successfully!');
    } catch (error: any) {
      console.error('Error saving brand profile:', error);
      alert('Error updating profile: ' + (error.message || 'Unknown error'));
    } finally {
      setEditFormData((prev) => ({ ...prev, uploading: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {/* {brand.brandName} */}Admin Dashboard
              </h1>
              {/* <p className="text-gray-600 dark:text-gray-400">
                {brand.ownerEmail}
              </p> */}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {/* Welcome to Your Brand Dashboard */}
            {brand.brandName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {brand.ownerEmail}
          </p>

          {/* Status Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Brand Status
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {brand.status}
              </p>
              {brand.status === "Active" && (
                <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                  ✓ Your brand is active
                </p>
              )}
            </div>

            {brand?.profileImage && (
              <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg flex items-center justify-center">
                {typeof brand.profileImage === "string" ? (
                  <img
                    key={brand.profileImage}
                    src={brand.profileImage}
                    alt={brand.brandName}
                    className="max-w-sm h-auto rounded-lg"
                    onError={(e) => {
                      console.error('Failed to load image:', brand.profileImage);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : brand.profileImage?.url ? (
                  <img
                    key={brand.profileImage.url}
                    src={brand.profileImage.url}
                    alt={brand.brandName}
                    className="max-w-sm h-auto rounded-lg"
                    onError={(e) => {
                      console.error('Failed to load image:', brand.profileImage?.url);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <p>No profile image URL</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/brand/dashboard/upload-products')}
                className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-left"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  Upload Products
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add new products to your catalog
                </p>
              </button>
              <button className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  View Orders
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Check your recent orders
                </p>
              </button>
              <button
                onClick={handleFetchProducts}
                className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-left"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  Products
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View all products
                </p>
              </button>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-left"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  Edit Profile
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Update brand information
                </p>
              </button>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-900 dark:text-blue-200">
              More features coming soon. Stay tuned!
            </p>
          </div>
        </div>
      </main>

      {/* Products Modal */}
      {isProductsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 p-8 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header with Brand Image */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                {brand?.profileImage && (
                  <div className="flex-shrink-0">
                    {typeof brand.profileImage === "string" ? (
                      <img
                        src={brand.profileImage}
                        alt={brand.brandName}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          console.error('Failed to load brand image:', brand.profileImage);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : brand.profileImage?.url ? (
                      <img
                        src={brand.profileImage.url}
                        alt={brand.brandName}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          console.error('Failed to load brand image:', brand.profileImage?.url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {brand.brandName} - Products
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Total: {products.length} product{products.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {/* <button
                onClick={() => setIsProductsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex-shrink-0"
              >
                <X size={24} />
              </button> */}
            </div>

            {/* Loading State */}
            {productsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {productsError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-900 dark:text-red-200">{productsError}</p>
              </div>
            )}

            {/* Products Table */}
            {!productsLoading && products.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Product Name</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Category</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Price</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Stock</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id || product.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{product.name}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{product.category || 'Uncategorized'}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          ${(product.price || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{product.stock || product.stockQuantity || 0}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.status === 'active' || product.isActive
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                            }`}>
                            {product.status || (product.isActive ? 'Active' : 'Inactive')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Empty State */}
            {!productsLoading && products.length === 0 && !productsError && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No products found</p>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsProductsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md mx-4 p-8  relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Brand Profile
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              className="space-y-6"
            >
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Image
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label htmlFor="imageUpload" className="cursor-pointer block">
                    {editFormData.image ? (
                      <div className="space-y-3 flex flex-col items-center">
                        <img
                          src={editFormData.image}
                          alt="Preview"
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                            Click to change image
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            or drag and drop
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 flex flex-col items-center justify-center py-4">
                        <Plus className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                          Upload Brand Image
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  About Brand
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Write about your brand..."
                />
              </div>

              {/* Social Media Links */}
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Social Media Links
                </h3>

                {/* Instagram */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.instagram}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, instagram: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://instagram.com/brandname"
                  />
                </div>

                {/* Facebook */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.facebook}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, facebook: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://facebook.com/brandname"
                  />
                </div>

                {/* Twitter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.twitter}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, twitter: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://twitter.com/brandname"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editFormData.uploading}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
                >
                  {editFormData.uploading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
