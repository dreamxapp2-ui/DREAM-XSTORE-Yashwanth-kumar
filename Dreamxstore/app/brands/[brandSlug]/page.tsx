'use client';

import { Heart, Instagram, Twitter,Globe,Facebook , Radio, Edit2, X, Plus, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminAuthService from '@/src/lib/api/admin/authService';
import { AdminService } from '@/src/lib/api/admin/adminService';
import { ProductService } from '@/src/lib/api';
import { ProductCard } from '@/src/components/cards';

interface Product {
  _id: string;
  name: string;
  images?: string[];
  rating?: number;
  reviewsCount?: number;
  price: number;
  originalPrice: number;
  discount: number;
  category: string;
  brandId?: string;
}

interface Brand {
  id: string;
  brandName: string;
  location: string;
  productCount: number;
  followers: number;
  sales: number;
  logo?: string;
  description?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
}

export default function BrandProfilePage() {
  const params = useParams();
  const brandSlug = params.brandSlug as string;
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [brandProductsLoading, setBrandProductsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  // Helper function to convert Buffer to displayable image URL
  const convertBufferToImageUrl = (profileImage: any, contentType: string = 'image/jpeg'): string => {
    if (!profileImage) {
      console.log('[convertBufferToImageUrl] No profileImage provided');
      return '';
    }
    
    try {
      console.log('[convertBufferToImageUrl] Converting image, type:', typeof profileImage, 'contentType:', contentType);
      
      // If it's already a string (URL), return as is
      if (typeof profileImage === 'string') {
        console.log('[convertBufferToImageUrl] Image is already a string URL');
        return profileImage;
      }
      
      // If it's an object with data property (mongoose Buffer), use the data
      if (profileImage.data) {
        console.log('[convertBufferToImageUrl] Converting from object.data format');
        const bytes = new Uint8Array(profileImage.data);
        const blob = new Blob([bytes], { type: contentType });
        const url = URL.createObjectURL(blob);
        console.log('[convertBufferToImageUrl] Created URL from object.data:', url);
        return url;
      }
      
      // If it's a direct array/buffer
      if (Array.isArray(profileImage) || profileImage instanceof Uint8Array) {
        console.log('[convertBufferToImageUrl] Converting from array/Uint8Array format');
        const blob = new Blob([new Uint8Array(profileImage)], { type: contentType });
        const url = URL.createObjectURL(blob);
        console.log('[convertBufferToImageUrl] Created URL from array:', url);
        return url;
      }
      
      console.warn('[convertBufferToImageUrl] Unknown image format:', typeof profileImage);
      return '';
    } catch (error) {
      console.error('[convertBufferToImageUrl] Error converting buffer to URL:', error);
      return '';
    }
  };

  useEffect(() => {
    // Check if user is superadmin using AdminAuthService
    const isSuperAdmin = AdminAuthService.isSuperAdmin();
    console.log('[BrandProfile] Is superadmin:', isSuperAdmin);
    setIsSuperAdmin(isSuperAdmin);
    
    // Fetch brand data from API
    loadBrandData();
  }, [brandSlug]);

  // Sync editFormData with brand data when modal opens
  useEffect(() => {
    if (isEditModalOpen && brand) {
      console.log('[BrandProfile] Modal opened, syncing form data with brand:', brand);
      setEditFormData({
        image: brand.logo || '',
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

  const loadBrandData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[BrandProfile] Loading brand:', brandSlug);
      
      // Fetch brand by slug - assuming the API endpoint or we can use getBrands and filter
      // For now, we'll fetch all brands and filter by slug
      const brandsResponse = await AdminService.getBrands({ limit: 100 });
      console.log('[BrandProfile] Raw brands response:', brandsResponse);
      
      const brandsData = Array.isArray(brandsResponse) ? brandsResponse : (brandsResponse as any)?.data || [];
      console.log('[BrandProfile] Brands data array:', brandsData);
      console.log('[BrandProfile] First brand sample:', brandsData[0]);
      
      const foundBrand = brandsData.find((b: any) => 
        b.name?.toLowerCase().replace(/\s+/g, '-') === brandSlug ||
        b.id === brandSlug
      );
      
      console.log('[BrandProfile] Found brand:', foundBrand);
      
      if (foundBrand) {
        // Map API response to Brand interface
        // Handle profileImage - can be URL string or object with {url, publicId}
        let profileImageUrl = '';
        if (foundBrand.profileImage) {
          if (typeof foundBrand.profileImage === 'string') {
            // Old format: direct URL or buffer
            profileImageUrl = foundBrand.profileImage;
          } else if (foundBrand.profileImage.url) {
            // New format: {url, publicId}
            profileImageUrl = foundBrand.profileImage.url;
          }
        }
        
        console.log('[BrandProfile] Profile image:', {
          hasProfileImage: !!profileImageUrl,
          url: profileImageUrl
        });
        const brand: Brand = {
          id: foundBrand.id,
          brandName: foundBrand.name || foundBrand.brandName,
          location: foundBrand.location,
          productCount: foundBrand.productCount || 0,
          followers: foundBrand.followerCount || 0,
          sales: 0,
          logo: profileImageUrl,
          description: foundBrand.description,
          instagram: foundBrand.socialLinks?.instagram || foundBrand.instagram || '',
          facebook: foundBrand.socialLinks?.facebook || foundBrand.facebook || '',
          twitter: foundBrand.socialLinks?.twitter || foundBrand.twitter || '',
          website: foundBrand.socialLinks?.website || foundBrand.website || ''
        };
        
        console.log('[BrandProfile] Final brand object:', brand);
        
        setBrand(brand);
        setEditFormData({
          image: brand.logo || '',
          imageFile: null,
          description: brand.description || '',
          instagram: brand.instagram || '',
          facebook: brand.facebook || '',
          twitter: brand.twitter || '',
          uploading: false,
          uploadProgress: 0,
        });
        
        // Fetch products for this brand
        await loadBrandProducts(foundBrand.id);
      } else {
        setError('Brand not found');
      }
    } catch (error) {
      console.error('[BrandProfile] Error loading brand:', error);
      console.error('[BrandProfile] Error details:', {
        message: (error as any)?.message,
        stack: (error as any)?.stack
      });
      setError('Failed to load brand data');
    } finally {
      setLoading(false);
    }
  };

  // ... existing code ...
  const loadBrandProducts = async (brandId: string) => {
    try {
      setBrandProductsLoading(true);
      console.log('[BrandProfile] Fetching products for brand:', brandId);
      
      // Fetch all products and filter by brand
      const response = await ProductService.getProducts({ limit: 100 });
      console.log('[BrandProfile] Products response:', response);
      
      const productsData = Array.isArray(response) ? response : (response as any)?.data || [];
      console.log('[BrandProfile] All products:', productsData);
      
      // Filter products by brand ID
      // brandId can be a string or an object depending on population status
      const brandProducts = productsData.filter((p: Product) => {
        const pBrandId = typeof p.brandId === 'object' ? (p.brandId as any)?._id : p.brandId;
        return pBrandId === brandId;
      });
      console.log('[BrandProfile] Filtered products for brand:', brandProducts);
      
      setProducts(brandProducts);
    } catch (err: any) {
      console.error('[BrandProfile] Error fetching brand products:', err);
    } finally {
      setBrandProductsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!brand) return;
    
    try {
      console.log('[BrandProfile] Saving brand profile...');
      console.log('[BrandProfile] Current brand ID:', brand.id);
      console.log('[BrandProfile] Edit form data:', editFormData);
      
      // Upload image to Cloudinary first if there's a new file
      let cloudinaryImageUrl: string | null = null;
      let cloudinaryPublicId: string | null = null;
      if (editFormData.imageFile) {
        try {
          setEditFormData(prev => ({ ...prev, uploading: true, uploadProgress: 0 }));
          console.log('[BrandProfile] Uploading image to Cloudinary...');
          const uploadedImages = await AdminService.uploadBrandImages(
            [editFormData.imageFile],
            (progress: number) => {
              console.log('[BrandProfile] Upload progress:', progress);
              setEditFormData(prev => ({ ...prev, uploadProgress: progress }));
            }
          );
          cloudinaryImageUrl = uploadedImages[0]?.url;
          cloudinaryPublicId = uploadedImages[0]?.publicId;
          console.log('[BrandProfile] Image uploaded successfully:', { url: cloudinaryImageUrl, publicId: cloudinaryPublicId });
          console.log('[BrandProfile] uploadedImages response:', uploadedImages);
          console.log('[BrandProfile] uploadedImages[0]:', uploadedImages[0]);
        } catch (uploadError: any) {
          console.error('[BrandProfile] Image upload failed:', uploadError);
          alert(`Failed to upload image: ${uploadError?.message || 'Unknown error'}`);
          setEditFormData(prev => ({ ...prev, uploading: false, uploadProgress: 0 }));
          return;
        }
      }
      
      // Now update the brand profile with the data
      // Send image URL to backend if it was uploaded
      const updateData: any = {
        description: editFormData.description,
        instagram: editFormData.instagram,
        facebook: editFormData.facebook,
        twitter: editFormData.twitter,
      };
      
      // If image was uploaded, add it to update data
      if (cloudinaryImageUrl && cloudinaryPublicId) {
        updateData.profileImage = {
          url: cloudinaryImageUrl,
          publicId: cloudinaryPublicId
        };
      }
      
      console.log('[BrandProfile] Before sending to backend - cloudinaryImageUrl:', cloudinaryImageUrl);
      console.log('[BrandProfile] Before sending to backend - cloudinaryPublicId:', cloudinaryPublicId);
      console.log('[BrandProfile] updateData.profileImage:', updateData.profileImage);
      const response = await AdminService.updateBrandProfile(brand.id, updateData);
      console.log('[BrandProfile] Update response:', response);
      
      // Update the brand state immediately with the new image if it was uploaded
      if (cloudinaryImageUrl && brand) {
        console.log('[BrandProfile] Updating brand state with new image:', cloudinaryImageUrl);
        setBrand({
          ...brand,
          logo: cloudinaryImageUrl
        });
      }
      
      console.log('[BrandProfile] Reloading brand data...');
      await loadBrandData();
      console.log('[BrandProfile] Brand data reloaded');
      
      console.log('[BrandProfile] Brand profile updated successfully');
      setIsEditModalOpen(false);
      alert('Brand profile updated successfully!');
    } catch (error: any) {
      console.error('[BrandProfile] Error saving brand profile:', error);
      const errorMessage = error?.message || error?.data?.message || 'Failed to update brand profile';
      console.error('[BrandProfile] Error details:', {
        message: errorMessage,
        status: error?.status,
        code: error?.code,
        fullError: error
      });
      alert(`Failed to update brand profile: ${errorMessage}`);
    } finally {
      setEditFormData(prev => ({ ...prev, uploading: false, uploadProgress: 0 }));
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFormData({ ...editFormData, imageFile: file });
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Brand not found</p>
      </div>
    );
  }

  const discountPercent = Math.round(((brand.productCount / 100) * 10));

  return (
    <div className="min-h-screen bg-white px-20">
      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-r from-gray-600 to-gray-900 overflow-hidden">
        {/* <img 
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop" 
          alt="Store banner" 
          className="w-full h-full object-cover" 
        /> */}
        {brand.logo ? (
              <img 
                src={brand.logo} 
                alt={brand.brandName}
                className="w-full h-full object-cover"
              />
            ) : (
               <img 
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop" 
              alt="Store banner" 
              className="w-full h-full object-cover" 
            /> 
              
            )}

        {/* Store info overlay with edit button */}
        <div className="absolute bottom-6 left-6 flex items-center gap-4 ">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center font-bold text-xs text-center p-2 relative group cursor-pointer hover:opacity-80 transition-opacity overflow-hidden">
            {/* {brand.logo ? (
              <img 
                src={brand.logo} 
                alt={brand.brandName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>DREAM X<br />STORE</span>
            )} */}
            <span>DREAM X<br />STORE</span>
            <button 
              onClick={() => {
                if (isSuperAdmin) {
                  setIsEditModalOpen(true);
                } else {
                  alert('Only superadmin can edit brand profile');
                }
              }}
              className="absolute -top-1 -right-1 bg-purple-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity "
              title={isSuperAdmin ? 'Edit profile image' : 'Only superadmin can edit'}
            >
              <Edit2 size={12} />
            </button>
          </div>
          <div>
            <h1 className="text-white text-3xl font-bold">{brand.brandName}</h1>
            <p className="text-gray-200">{brand.location}</p>
          </div>
        </div>
      </div>

      {/* Stats and Follow Section */}
      <div className="px-6 py-8 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-12">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{brand.productCount}</p>
              <p className="text-gray-600">Products</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{brand.followers.toLocaleString()}</p>
              <p className="text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{brand.sales}</p>
              <p className="text-gray-600">Sales</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsFollowing(!isFollowing)}
            className={`${isFollowing ? 'bg-gray-300 hover:bg-gray-400 text-gray-800' : 'bg-blue-600 hover:bg-blue-700 text-white'} px-8 py-2 rounded-full font-medium transition-colors`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
            {/* {brand.instagram && (
              <a href={brand.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-gray-400">
                <Instagram size={24} />
              </a>
            )}
            {brand.facebook && (
              <a href={brand.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-gray-400">
                <Facebook size={24} />
              </a>
            )}
            {brand.website && (
              <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-gray-400">
                <Globe size={24} />
              </a>
            )} */}
            {/* this is for another dev, just added api for the logo will appear auto. in the dataset of brand model need to add this data, I left it and you can delete
            the above three*/}
            {brand.instagram && (
              <a 
                href={brand.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-800 hover:text-gray-400 transition-all duration-300 ease-in-out hover:scale-110 hover:rotate-[-5deg]"
              >
                <Instagram size={24} />
              </a>
            )}
            {brand.facebook && (
              <a 
                href={brand.facebook} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-800 hover:text-gray-400 transition-all duration-300 ease-in-out hover:scale-110 hover:rotate-[-5deg]"
              >
                <Facebook size={24} />
              </a>
            )}
            {brand.website && (
              <a 
                href={brand.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-800 hover:text-gray-400 transition-all duration-300 ease-in-out hover:scale-110 hover:rotate-[-5deg]"
              >
                <Globe size={24} />
              </a>
            )}
           
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 border-b">
        <div className="max-w-7xl mx-auto flex gap-8">
          <button 
            onClick={() => setActiveTab('products')}
            className={`py-4 px-4 font-medium ${activeTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-gray-900'}`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`py-4 px-4 font-medium ${activeTab === 'about' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-gray-900'}`}
          >
            About
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`py-4 px-4 font-medium ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-gray-900'}`}
          >
            Reviews
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'products' && (
        <div className="px-4 sm:px-6 lg:px-20 py-12">
          <div className="space-y-8">
            {brandProductsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    title={product.name}
                    brand={brand?.brandName || 'Unknown'}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    discount={product.discount}
                    image={product.images?.[0] || '/placeholder.svg'}
                    onWishlistToggle={(id, isWishlisted) => {
                      console.log(`Product ${id} wishlisted:`, isWishlisted);
                      // TODO: Implement wishlist API call
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found for this brand</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-8 relative">

              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {brand.brandName}</h2>
              <p className="text-gray-600 mb-4">
                {brand.description || 'No description available for this brand yet.'}
              </p>
   
              <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700 flex items-center gap-1">
              <span className="font-medium">
                <MapPin size={16} />
              </span>
              {brand.location}
            </p>
                {brand.website && (
              <a 
                href={brand.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-700 hover:text-blue-400 transition-all   flex items-center gap-1"
              >
                <Globe size={16} /> {brand.website}
              </a>
            )}
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Brand Status</h2>
            <p className="text-gray-700">
              <span className="font-medium">Total Products:</span> {brand.productCount}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Total Sales:</span> {brand.sales}
            </p>
          </div>
        </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
              <p className="text-gray-600">No reviews yet. Be the first to review this brand!</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 p-8 relative">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Brand Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-6">
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
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
                        <img src={editFormData.image} alt="Preview" className="w-24 h-24 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Click to change image</p>
                          <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 flex flex-col items-center justify-center py-4">
                        <Plus className="w-16 h-16 text-gray-400" />
                        <p className="text-sm text-gray-600 font-medium">Upload Brand Image</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* About/Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About Brand</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Write about your brand..."
                />
              </div>

              {/* Social Media Links */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900">Social Media Links</h3>
                
                {/* Instagram */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                  <input
                    type="url"
                    value={editFormData.instagram}
                    onChange={(e) => setEditFormData({ ...editFormData, instagram: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://instagram.com/brandname"
                  />
                </div>

                {/* Facebook */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                  <input
                    type="url"
                    value={editFormData.facebook}
                    onChange={(e) => setEditFormData({ ...editFormData, facebook: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://facebook.com/brandname"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
                  <input
                    type="url"
                    value={editFormData.twitter}
                    onChange={(e) => setEditFormData({ ...editFormData, twitter: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://twitter.com/brandname"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
