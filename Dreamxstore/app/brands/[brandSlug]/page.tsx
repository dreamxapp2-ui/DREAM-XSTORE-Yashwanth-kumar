'use client';

import { Heart, Instagram, Twitter, Globe, Facebook, MapPin, Star, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminService } from '@/src/lib/api/admin/adminService';
import { ProductService } from '@/src/lib/api';
import { Button } from '@/src/components/ui/button';

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
  slug?: string;
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
  const router = useRouter();
  const brandSlug = params.brandSlug as string;
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    loadBrandData();
  }, [brandSlug]);

  const loadBrandData = async () => {
    try {
      setLoading(true);
      const brandsResponse = await AdminService.getPublicBrands({ limit: 100 });
      const brandsData = Array.isArray(brandsResponse) ? brandsResponse : (brandsResponse as any)?.data || [];
      
      const foundBrand = brandsData.find((b: any) => 
        b.name?.toLowerCase().replace(/\s+/g, '-') === brandSlug ||
        b.id === brandSlug
      );
      
      if (foundBrand) {
        let profileImageUrl = foundBrand.profileImage?.url || foundBrand.profileImage || '';
        
        const brandObj: Brand = {
          id: foundBrand.id,
          brandName: foundBrand.name || foundBrand.brandName,
          location: foundBrand.location || 'Global',
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
        
        setBrand(brandObj);
        await loadBrandProducts(foundBrand.id);
      } else {
        setError('Brand not found');
      }
    } catch (err) {
      console.error('Error loading brand:', err);
      setError('Failed to load brand data');
    } finally {
      setLoading(false);
    }
  };

  const loadBrandProducts = async (brandId: string) => {
    try {
      const response = await ProductService.getProducts({ limit: 100 });
      const productsData = Array.isArray(response) ? response : (response as any)?.data || [];
      
      const brandProducts = productsData.filter((p: any) => {
        const pBrandId = typeof p.brandId === 'object' ? p.brandId?._id : p.brandId;
        return pBrandId === brandId;
      });
      
      setProducts(brandProducts);
    } catch (err) {
      console.error('Error fetching brand products:', err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004d84]"></div></div>;
  if (error || !brand) return <div className="min-h-screen flex items-center justify-center bg-white"><p className="text-red-500 font-bold">{error || 'Brand not found'}</p></div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Banner */}
      <div className="relative h-[25vh] sm:h-[35vh] w-full bg-[#1a1a1a] overflow-hidden">
        {brand.logo && (
          <img src={brand.logo} alt="banner" className="w-full h-full object-cover opacity-30 blur-sm scale-110" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Brand Profile Header */}
      <div className="container mx-auto px-6 -mt-20 relative z-10 flex flex-col items-center">
        <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full p-2 shadow-2xl border-4 border-white mb-6 overflow-hidden flex items-center justify-center">
          <img 
            src={brand.logo || 'https://via.placeholder.com/150'} 
            alt={brand.brandName} 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900">{brand.brandName}</h1>
            <CheckCircle className="w-6 h-6 fill-[#004d84] text-white" />
          </div>
          <div className="flex items-center justify-center gap-3 text-gray-400 font-bold mb-6">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {brand.location}</span>
            <span>•</span>
            <span>{brand.productCount} Products</span>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => setIsFollowing(!isFollowing)}
              className={`rounded-full px-10 h-12 font-black transition-all ${
                isFollowing 
                ? "bg-gray-100 text-gray-900 hover:bg-gray-200" 
                : "bg-[#004d84] text-white hover:bg-[#003a64]"
              }`}
            >
              {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
            </Button>
            <div className="flex items-center gap-3">
              {[Instagram, Twitter, Globe, Facebook].map((Icon, i) => (
                <button key={i} className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="w-full max-w-2xl grid grid-cols-3 gap-8 py-8 border-y border-gray-100 mb-12">
          {[
            { label: 'Followers', value: brand.followers.toLocaleString() },
            { label: 'Products', value: brand.productCount },
            { label: 'Sales', value: brand.sales }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Brand Products Section */}
        <div className="w-full max-w-7xl mb-20 px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-gray-900">Featured items</h2>
            <p className="text-gray-400 font-bold">{products.length} Items found</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {products.map((product) => (
              <div 
                key={product._id}
                onClick={() => router.push(`/product/${product.slug || product._id}`)}
                className="bg-[#f8f8f8] rounded-3xl p-3 cursor-pointer group transition-all hover:shadow-xl hover:-translate-y-1 relative"
              >
                <div className="absolute top-4 right-4 z-10">
                  <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="bg-white rounded-2xl overflow-hidden aspect-[4/5] flex items-center justify-center mb-3">
                  <img src={product.images?.[0] || 'https://via.placeholder.com/300'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="px-1">
                  <div className="flex items-center gap-1 text-xs text-yellow-500 mb-1">
                    <Star className="w-3 h-3 fill-yellow-500" />
                    <span className="text-gray-400 font-bold">{product.rating || 4.5}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
                  <p className="text-sm font-extrabold text-[#004d84]">${product.price}</p>
                </div>
              </div>
            ))}
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-[3rem]">
              <p className="text-gray-400 font-bold">No products found for this brand yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
