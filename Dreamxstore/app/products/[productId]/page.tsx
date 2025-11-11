'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Heart, Share2, ShoppingCart, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProductService, type Product } from '@/src/lib/api';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [selectedSize, setSelectedSize] = useState('S');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCartClick = () => {
    router.push('/cart');
  };

  // Fetch product on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[ProductDetail] Fetching product:', productId);
        const fetchedProduct = await ProductService.getProductById(productId);
        console.log('[ProductDetail] Product loaded:', fetchedProduct);
        setProduct(fetchedProduct);
        
        // Set initial size to first available size
        if (fetchedProduct.sizes && fetchedProduct.sizes.length > 0) {
          setSelectedSize(fetchedProduct.sizes[0]);
        }
      } catch (err: any) {
        console.error('[ProductDetail] Error fetching product:', err);
        setError(err?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const nextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToBag = async () => {
    try {
      setLoading(true);
      console.log('Adding to bag:', {
        productId,
        size: selectedSize,
        quantity,
      });
      // TODO: Implement add to cart API
      alert('Added to bag!');
    } catch (error) {
      console.error('Error adding to bag:', error);
      alert('Failed to add to bag');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!product) return;
    try {
      setLoading(true);
      console.log('Processing payment:', {
        productId,
        size: selectedSize,
        quantity,
        totalPrice: product.price * quantity,
      });
      // TODO: Implement payment API
      alert('Redirecting to payment...');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Share this product: ' + window.location.href);
    }
  };

  // Loading state
  if (loading && !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white ">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-2 md:px-8">
          <ChevronLeft className="w-6 h-6 cursor-pointer" onClick={() => window.history.back()} />
          <h1 className="text-lg font-bold font-sans tracking-wide uppercase">{product?.name || 'Product'}</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsWishlisted(!isWishlisted)}>
              <Heart
                className="w-5 h-5 cursor-pointer"
                fill={isWishlisted ? 'red' : 'none'}
                color={isWishlisted ? 'red' : 'currentColor'}
              />
            </button>
            <button onClick={handleShare}>
              <Share2 className="w-5 h-5 cursor-pointer" />
            </button>
            <div className="relative  group flex-shrink-0 ">
              <button
                onClick={handleCartClick}
                className="w-[40px] h-[40px] xl:w-[44px] xl:h-[44px] 2xl:w-[48px] 2xl:h-[48px] hover:bg-gray-100 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center"
              >
                <ShoppingBag className="w-4 h-4 xl:w-5 xl:h-5  text-gray-700 hover:text-gray-900 transition-colors" />
              </button>
              
              {/* Cart Items Badge - Show only if items > 0 */}
              {totalItems > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 bg-red-500 text-white text-xs xl:text-sm 2xl:text-base font-bold rounded-full flex items-center justify-center shadow-sm">
                  {totalItems > 99 ? '99+' : totalItems}
                </div>
              )}
              
              {/* Hover tooltip */}
              <div className="absolute top-full right-0 mt-2 w-16 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Cart
                <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
          </div>
        </div>
      </header>
        <div className='px-20'>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 py-8 md:px-8">
        {/* Left: Image Carousel */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
            <img
              src={product?.images?.[currentImageIndex] || '/placeholder.svg'}
              alt="Product"
              className="w-full h-full object-cover"
            />

            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 hover:bg-gray-200 transition"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 hover:bg-gray-200 transition"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {product?.images?.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition ${
                    idx === currentImageIndex ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2">
            {product?.images?.map((thumb, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-20 h-20 rounded border-2 overflow-hidden transition ${
                  idx === currentImageIndex ? 'border-black' : 'border-gray-200'
                }`}
              >
                <img
                  src={thumb || '/placeholder.svg'}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="space-y-6">
          {/* Title and Description */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold capitalize">{product.name}</h1>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Brand */}
          {/* I leave this for another dev that can upgrade to go to the the page of brand. */}
          <div className="text-sm text-purple-600 font-medium ">
            <button onClick={() => {}} className="text-gray-600 font-medium rounded-full border-2 border-gray-300 px-2 py-1 hover:bg-gray-100 hover:border-purple-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md">
                by {product?.brandName || 'Unknown'}</button></div>

          {/* Ratings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl text-yellow-400  ">
                  {i < Math.floor(product.rating ?? 0) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <span className="font-semibold">{product.rating}</span>
              <span className="text-gray-600">({product.reviewsCount ?? 0} reviews)</span>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                Live Rating
              </span>
            </div>

            {/* Rate This Product */}
            <div>
              <p className="text-sm font-medium mb-2">Rate this product:</p>
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setUserRating(i + 1)} 
                    className="text-2xl transition hover:scale-110"
                    >
                    <span className={i < userRating ? 'text-yellow-400' : 'text-gray-400'}>
                        {i < userRating ? '★' : '☆'}
                    </span>
                    </button>
                ))}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
            <span className="text-3xl font-bold">₹{product.price}</span>
            <span className="text-lg text-gray-400 line-through">₹{product.originalPrice}</span>
            <span className="bg-red-100 text-red-600 font-bold px-2 py-1 text-sm rounded">
              {product.discount}% OFF
            </span>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Size</label>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 border-2 rounded font-semibold transition ${
                    selectedSize === size ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Quantity</label>
            <div className="flex items-center gap-4 w-fit">
              <button
                onClick={decrementQuantity}
                className="border border-gray-300 rounded-lg p-2 hover:bg-gray-100 transition"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <button
                onClick={incrementQuantity}
                className="border border-gray-300 rounded-lg p-2 hover:bg-gray-100 transition"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleAddToBag}
              disabled={loading}
              className="flex-1 border-2 border-black rounded-full py-3 font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingBag className="w-5 h-5" />
              {loading ? 'ADDING...' : 'ADD TO BAG'}
            </button>
            <button
              onClick={handlePayNow}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded-full py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'PROCESSING...' : 'PAY NOW'}
            </button>
          </div>

          {/* Stock Status */}
          {!product.inStock && (
            <div className="bg-red-100 text-red-700 p-3 rounded text-sm font-medium">Out of Stock</div>
          )}

          {/* Description */}
          <div className="border-t border-gray-200 pt-6 space-y-3">
            <h3 className="text-lg font-bold font-sans">Description</h3>
            <p className="text-gray-700 leading-relaxed">{product.longDescription}</p>
            <p className="text-gray-500 italic text-sm">
              "eat, sleep, anime, repeat - a warrior's path to eternal inspiration!"
            </p>
          </div>
          <div className="pt-6 space-y-3">
            <h3 className="text-xl font-bold font-sans">Features</h3>
            <p className='px-4'>
            {product.features?.map((feature, idx) => (
              <li key={idx} className="text-gray-700 leading-relaxed ">{feature}</li>
            ))} 
            </p>           
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
