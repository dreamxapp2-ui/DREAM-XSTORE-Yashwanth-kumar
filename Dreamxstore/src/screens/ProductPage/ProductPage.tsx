import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Heart, Share2, ShoppingBag, Star, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import DownloadButton from "../../components/DownloadButton";

export const ProductPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productSlug } = useParams<{ productSlug: string }>();
  const { cart, addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const addToBagButtonRef = useRef<HTMLButtonElement>(null);

  // Get cart total items for display
  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Product data - you can expand this to handle different products based on productSlug
  const getProductData = (slug: string | undefined) => {
    console.log("Getting product data for slug:", slug);
    
    // Default product data
    const defaultProduct = {
      id: 1,
      name: "Oversized t shirt",
      subtitle: "Rock the fandom with the \"FANDOM\" T-shirt!",
      description: "Live the anime life with the \"EAT SLEEP ANIME REPEAT\" T-shirt! This rich green beauty, crafted from 100% cotton and a 250gsm fabric, provides an oversized fit that's perfect for casual coolness. The back design with iconic symbols and text is a playful nod to every anime fan's routine.",
      originalPrice: 1399,
      salePrice: 699,
      discount: 50,
      rating: 4.5,
      reviews: 128,
      sizes: ["S", "M", "L", "XL", "XXL"],
      images: [
        "https://i.postimg.cc/fRWRqwYP/GPT-model.png",
        "https://i.postimg.cc/j5W9hzrq/Screenshot-2025-07-04-213323-removebg-preview.jpg",
        "https://i.postimg.cc/j5W9hzrq/Screenshot-2025-07-04-213323-removebg-preview.jpg"
      ],
      features: [
        "100% Cotton",
        "250gsm Fabric",
        "Oversized Fit",
        "Back Design with Iconic Symbols",
        "Machine Washable"
      ],
      inStock: true,
      slug: "oversized-t-shirt"
    };

    // You can add more products here based on the slug
    const products: { [key: string]: typeof defaultProduct } = {
      "oversized-t-shirt": defaultProduct,
      "art-addicts-t-shirt": {
        ...defaultProduct,
        id: 2,
        name: "ART ADDICTS T-SHIRT",
        subtitle: "Express your artistic side with this unique design",
        description: "A premium quality t-shirt for art enthusiasts. Made with high-quality materials and featuring an exclusive artistic design that speaks to your creative soul.",
        originalPrice: 2837,
        salePrice: 1999,
        discount: 30,
        slug: "art-addicts-t-shirt",
        images: [
          "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
          "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
          "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop"
        ]
      },
      "art-addicts-t-shirt-2": {
        ...defaultProduct,
        id: 3,
        name: "ART ADDICTS T-SHIRT V2",
        subtitle: "Second edition of our popular art design",
        description: "The second edition of our popular art addicts design with improved quality and new artistic elements.",
        originalPrice: 2837,
        salePrice: 1899,
        discount: 33,
        slug: "art-addicts-t-shirt-2",
        images: [
          "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
          "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
          "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop"
        ]
      },
      "art-addicts-t-shirt-3": {
        ...defaultProduct,
        id: 4,
        name: "ART ADDICTS T-SHIRT V3",
        subtitle: "Third edition with premium materials",
        description: "The third edition featuring premium materials and an exclusive artistic collaboration.",
        originalPrice: 2837,
        salePrice: 2199,
        discount: 22,
        slug: "art-addicts-t-shirt-3",
        images: [
          "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
          "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
          "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop"
        ]
      },
      "art-addicts-t-shirt-4": {
        ...defaultProduct,
        id: 5,
        name: "ART ADDICTS T-SHIRT V4",
        subtitle: "Limited edition artistic design",
        description: "Limited edition with exclusive artistic design and premium finishing.",
        originalPrice: 2837,
        salePrice: 2299,
        discount: 19,
        slug: "art-addicts-t-shirt-4",
        images: [
          "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
          "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
          "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop"
        ]
      },
      "art-addicts-t-shirt-5": {
        ...defaultProduct,
        id: 6,
        name: "ART ADDICTS T-SHIRT V5",
        subtitle: "Latest collection piece",
        description: "The latest addition to our art addicts collection with modern design elements.",
        originalPrice: 2837,
        salePrice: 2399,
        discount: 15,
        slug: "art-addicts-t-shirt-5",
        images: [
          "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
          "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
          "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop"
        ]
      }
    };

    const foundProduct = products[slug || "oversized-t-shirt"];
    console.log("Found product:", foundProduct);
    return foundProduct || defaultProduct;
  };

  const product = getProductData(productSlug);

  // Enhanced scroll to top logic that respects back navigation
  useEffect(() => {
    console.log("ProductPage mounted with slug:", productSlug);
    console.log("Current URL:", window.location.href);
    console.log("Location state:", location.state);
    console.log("Product found:", product);
    
    // Check if this is coming from the landing page (direct navigation)
    const isFromLandingPage = location.state?.fromLandingPage;
    
    // Check if this is a back navigation
    const navigationType = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.type;
    const isBackNavigation = navigationType === 'back_forward';
    
    // Check if browser back button was used
    const wasBackButton = window.history.state?.fromBack;
    
    // Check if there's a referrer from the same domain (internal navigation)
    const isInternalNavigation = document.referrer && document.referrer.includes(window.location.origin);
    
    console.log("Navigation analysis:", {
      isFromLandingPage,
      navigationType,
      isBackNavigation,
      wasBackButton,
      isInternalNavigation,
      referrer: document.referrer
    });
    
    // Only scroll to top if it's a direct navigation (not back navigation)
    const shouldScrollToTop = isFromLandingPage && !isBackNavigation && !wasBackButton;
    
    if (shouldScrollToTop) {
      console.log("Scrolling to top for direct navigation");
      // Scroll to top immediately when the component loads (only for direct navigation)
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      
      // Also ensure document body is scrolled to top
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } else {
      console.log("Skipping scroll to top - this appears to be back navigation");
    }

    // Set history state to track that we're on a product page
    window.history.replaceState(
      { ...window.history.state, fromProductPage: true }, 
      '', 
      window.location.href
    );
    
  }, [productSlug, location.state]);

  // Real-time rating state
  const [currentRating, setCurrentRating] = useState(product.rating);
  const [totalReviews, setTotalReviews] = useState(product.reviews);

  // Simulate real-time rating updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random rating updates (in real app, this would come from websocket/API)
      const randomUpdate = Math.random();
      if (randomUpdate > 0.95) { // 5% chance of rating update
        const newRating = Math.random() * 5;
        setCurrentRating(prev => {
          const updated = ((prev * totalReviews) + newRating) / (totalReviews + 1);
          return Math.round(updated * 10) / 10; // Round to 1 decimal
        });
        setTotalReviews(prev => prev + 1);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [totalReviews]);

  // Touch handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && selectedImage < product.images.length - 1) {
      setSelectedImage(prev => prev + 1);
    }
    if (isRightSwipe && selectedImage > 0) {
      setSelectedImage(prev => prev - 1);
    }
  };

  // Enhanced Add to Cart with Jump Animation
  const handleAddToBag = () => {
    if (isAnimating) return; // Prevent multiple clicks during animation
    
    setIsAnimating(true);
    
    // Create animated product image
    const createJumpingProduct = () => {
      const productImage = document.querySelector('.main-product-image') as HTMLImageElement;
      const cartIcon = document.querySelector('.cart-icon-header') as HTMLElement;
      
      if (!productImage || !cartIcon) {
        console.log("Required elements not found for animation");
        return;
      }

      // Create a clone of the product image
      const flyingProduct = productImage.cloneNode(true) as HTMLImageElement;
      flyingProduct.style.position = 'fixed';
      flyingProduct.style.zIndex = '9999';
      flyingProduct.style.width = '60px';
      flyingProduct.style.height = '60px';
      flyingProduct.style.objectFit = 'cover';
      flyingProduct.style.borderRadius = '8px';
      flyingProduct.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
      flyingProduct.style.transition = 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      flyingProduct.style.pointerEvents = 'none';
      
      // Get positions
      const productRect = productImage.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();
      
      // Set initial position
      flyingProduct.style.left = `${productRect.left + productRect.width / 2 - 30}px`;
      flyingProduct.style.top = `${productRect.top + productRect.height / 2 - 30}px`;
      
      // Add to DOM
      document.body.appendChild(flyingProduct);
      
      // Animate to cart with a nice arc
      setTimeout(() => {
        const deltaX = cartRect.left + cartRect.width / 2 - 30 - (productRect.left + productRect.width / 2 - 30);
        const deltaY = cartRect.top + cartRect.height / 2 - 30 - (productRect.top + productRect.height / 2 - 30);
        
        // Create a parabolic path
        flyingProduct.style.transform = `translate(${deltaX}px, ${deltaY - 100}px) scale(0.3) rotate(360deg)`;
        flyingProduct.style.opacity = '0.8';
        
        // Second part of animation - drop into cart
        setTimeout(() => {
          flyingProduct.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.1) rotate(720deg)`;
          flyingProduct.style.opacity = '0';
        }, 600);
        
        // Remove element and show success
        setTimeout(() => {
          if (document.body.contains(flyingProduct)) {
            document.body.removeChild(flyingProduct);
          }
          
          // Add cart bounce animation
          cartIcon.style.transform = 'scale(1.3)';
          cartIcon.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
          
          setTimeout(() => {
            cartIcon.style.transform = 'scale(1)';
          }, 300);
          
          setIsAnimating(false);
        }, 1200);
      }, 100);
    };

    // Start the animation
    createJumpingProduct();
    

    // Add to cart (match CartContext structure)
    const cartItem = {
      _id: product.slug, // or product.id if you want
      title: product.name,
      price: product.salePrice,
      quantity: quantity,
      image: product.images[0],
      category: "T-Shirts", // or derive from product/category if available
      selectedSize: selectedSize
    };

    addToCart(cartItem);
    
    // Show simple success message
    setShowAddedMessage(true);
    setTimeout(() => {
      setShowAddedMessage(false);
    }, 3000);
  };

  const handlePayNow = () => {
    console.log("Pay now:", {
      product: product.name,
      size: selectedSize,
      quantity: quantity,
      price: product.salePrice,
      total: product.salePrice * quantity
    });
    // You can integrate with payment gateway here
    alert(`Proceeding to payment for ${quantity} x ${product.name} (Size: ${selectedSize})\nTotal: ₹${product.salePrice * quantity}`);
  };

  const handleShare = async () => {
    // Create the full URL for the product - ensure we use the correct base URL
    const baseUrl = window.location.origin;
    const productUrl = `${baseUrl}/product/${product.slug}`;
    
    console.log("Sharing URL:", productUrl);
    console.log("Current location:", window.location);
    
    const shareData = {
      title: `${product.name} - Dream X Store`,
      text: `Check out this amazing ${product.name}! ${product.subtitle} Only ₹${product.salePrice} (${product.discount}% OFF). Shop now at Dream X Store!`,
      url: productUrl,
    };

    try {
      // Check if Web Share API is supported and can share
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        console.log('Successfully shared via Web Share API');
        return;
      }
      
      // If Web Share API is supported but canShare returns false, try anyway
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('Successfully shared via Web Share API (fallback)');
        return;
      }
      
      // If Web Share API is not supported, show custom share menu
      setShowShareMenu(true);
      
    } catch (error) {
      console.log("Web Share API error:", error);
      // Type guard for error
      if (typeof error === 'object' && error !== null && 'name' in error) {
        if ((error as any).name !== 'AbortError') {
          setShowShareMenu(true);
        }
      } else {
        setShowShareMenu(true);
      }
    }
  };

  const handleCustomShare = (platform: string) => {
    const baseUrl = window.location.origin;
    const productUrl = `${baseUrl}/product/${product.slug}`;
    const shareText = `Check out this amazing ${product.name}! ${product.subtitle} Only ₹${product.salePrice} (${product.discount}% OFF). Shop now at Dream X Store!`;
    
    let shareLink = '';
    
    switch (platform) {
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productUrl)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'copy':
        // Copy to clipboard
        navigator.clipboard.writeText(productUrl).then(() => {
          // Show success message
          const successMessage = document.createElement('div');
          successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
          successMessage.textContent = '✓ Product link copied to clipboard!';
          document.body.appendChild(successMessage);
          
          setTimeout(() => {
            if (document.body.contains(successMessage)) {
              document.body.removeChild(successMessage);
            }
          }, 3000);
        }).catch(() => {
          alert(`Copy this link: ${productUrl}`);
        });
        setShowShareMenu(false);
        return;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
    
    setShowShareMenu(false);
  };

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleRatingClick = (rating: number) => {
    if (!hasRated) {
      setUserRating(rating);
      setHasRated(true);
      
      // Update the overall rating
      const newOverallRating = ((currentRating * totalReviews) + rating) / (totalReviews + 1);
      setCurrentRating(Math.round(newOverallRating * 10) / 10);
      setTotalReviews(prev => prev + 1);
    }
  };

  const nextImage = () => {
    setSelectedImage(prev => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage(prev => (prev - 1 + product.images.length) % product.images.length);
  };

  // Handle cart navigation
  const handleCartClick = () => {
    navigate('/cart');
  };

  const RatingComponent = ({ 
    rating, 
    onRate, 
    interactive = false, 
    size = "w-4 h-4" 
  }: { 
    rating: number; 
    onRate?: (rating: number) => void; 
    interactive?: boolean; 
    size?: string; 
  }) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${size} cursor-${interactive ? 'pointer' : 'default'} transition-colors ${
            i < Math.floor(rating) 
              ? 'fill-yellow-400 text-yellow-400' 
              : i < rating 
                ? 'fill-yellow-200 text-yellow-400' 
                : interactive && i < hoverRating
                  ? 'fill-yellow-200 text-yellow-400'
                  : 'text-gray-300'
          }`}
          onClick={() => interactive && onRate && onRate(i + 1)}
          onMouseEnter={() => interactive && setHoverRating(i + 1)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        />
      ))}
    </div>
  );

  // If product not found, show error message
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} className="bg-black text-white hover:bg-gray-800">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Success Message at Bottom Center */}
      {showAddedMessage && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg">
            <p className="text-sm font-medium whitespace-nowrap">
              ✓ Item successfully added to cart
            </p>
          </div>
        </div>
      )}

      {/* Custom Share Menu Overlay */}
      {showShareMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50" 
            onClick={() => setShowShareMenu(false)} 
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 p-6 animate-in slide-in-from-bottom duration-300">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Share this product</h3>
              <p className="text-gray-600 text-sm">{product.name}</p>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              {/* WhatsApp */}
              <button
                onClick={() => handleCustomShare('whatsapp')}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <span className="text-xs text-gray-600">WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleCustomShare('facebook')}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-xs text-gray-600">Facebook</span>
              </button>

              {/* Twitter */}
              <button
                onClick={() => handleCustomShare('twitter')}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-[#1DA1F2] rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </div>
                <span className="text-xs text-gray-600">Twitter</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={() => handleCustomShare('copy')}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600">Copy Link</span>
              </button>
            </div>

            <Button
              onClick={() => setShowShareMenu(false)}
              variant="outline"
              className="w-full rounded-[30px] h-12"
            >
              Cancel
            </Button>
          </div>
        </>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-[40px] hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <h1 className="text-lg font-medium text-center flex-1 mx-4 truncate">
            {product.name.toUpperCase()}
          </h1>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="h-10 w-10 rounded-[40px] hover:bg-gray-100"
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-10 w-10 rounded-[40px] hover:bg-gray-100"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            {/* Download Button */}
            <DownloadButton
              type="image-url"
              imageUrl={product.images[selectedImage]}
              filename={`${product.name}_image.jpg`}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-[40px] hover:bg-gray-100"
            />
            {/* Cart Icon with Count - Clickable */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCartClick}
                className="h-10 w-10 rounded-[40px] hover:bg-gray-100 cart-icon-header"
              >
                <ShoppingBag className="h-5 w-5 text-gray-600" />
              </Button>
              
              {/* Cart Items Badge - Show only if items > 0 */}
              {totalCartItems > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                  {totalCartItems > 99 ? '99+' : totalCartItems}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8 lg:p-8">
          {/* Left - Images (Equal width to right content) */}
          <div className="space-y-4">
            {/* Main Image with Swipe Navigation */}
            <div className="relative aspect-square bg-gray-50 rounded-[1px] overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover main-product-image"
              />
              
              {/* Navigation Arrows for Desktop */}
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow-md"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow-md"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Image Indicators */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === selectedImage ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-[1px] overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-black' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right - Product Info (Equal width to left content) */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-light text-black mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{product.subtitle}</p>
              
              {/* Real-time Rating Display */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <RatingComponent rating={currentRating} size="w-5 h-5" />
                  <span className="text-lg font-medium">{currentRating}</span>
                  <span className="text-sm text-gray-600">({totalReviews} reviews)</span>
                  <Badge className="bg-green-100 text-green-600 hover:bg-green-100 text-xs">
                    Live Rating
                  </Badge>
                </div>
                
                {/* User Rating Section */}
                {!hasRated ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Rate this product:</p>
                    <RatingComponent 
                      rating={hoverRating || userRating} 
                      onRate={handleRatingClick}
                      interactive={true}
                      size="w-6 h-6"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-green-600">Thanks for rating!</p>
                    <RatingComponent rating={userRating} size="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-medium text-black">₹{product.salePrice}</span>
                <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
                <Badge className="bg-red-100 text-red-600 hover:bg-red-100">
                  {product.discount}% OFF
                </Badge>
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-medium mb-3">Size</h3>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-[1px] ${
                      selectedSize === size 
                        ? 'bg-black text-white' 
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-medium mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange('decrease')}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-[1px]"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange('increase')}
                  className="h-10 w-10 rounded-[1px]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons - Add to Bag and Pay Now */}
            <div className="flex gap-3">
              <Button
                ref={addToBagButtonRef}
                onClick={handleAddToBag}
                disabled={isAnimating}
                variant="outline"
                className={`flex-1 h-14 border-black text-black hover:bg-gray-50 rounded-[30px] text-lg font-medium transition-all duration-300 ${
                  isAnimating ? 'scale-95 opacity-75' : 'hover:scale-105'
                }`}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {isAnimating ? 'ADDING...' : 'ADD TO BAG'}
              </Button>
              <Button
                onClick={handlePayNow}
                className="flex-1 h-14 bg-blue-600 text-white hover:bg-blue-700 rounded-[30px] text-lg font-medium"
              >
                PAY NOW
              </Button>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="text-lg font-medium mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
              <p className="text-sm text-gray-500 italic">
                "Eat, sleep, anime, repeat – a warrior's path to eternal inspiration!"
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-medium mb-3">Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600">
                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Mobile Images with Swipe */}
          <div className="px-4 py-4">
            <div 
              ref={imageContainerRef}
              className="relative aspect-square bg-gray-50 rounded-[1px] overflow-hidden mb-4"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover main-product-image"
              />
              
              {/* Image Indicators for Mobile */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === selectedImage ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Mobile Thumbnails */}
            <div className="flex gap-2 justify-center">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-[1px] overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-black' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Product Info */}
          <div className="px-4 space-y-6">
            <div>
              <h1 className="text-2xl font-light text-black mb-2">{product.name}</h1>
              <p className="text-base text-gray-600 mb-3">{product.subtitle}</p>
              
              {/* Mobile Real-time Rating */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <RatingComponent rating={currentRating} size="w-4 h-4" />
                  <span className="text-base font-medium">{currentRating}</span>
                  <span className="text-sm text-gray-600">({totalReviews})</span>
                  <Badge className="bg-green-100 text-green-600 hover:bg-green-100 text-xs">
                    Live
                  </Badge>
                </div>
                
                {/* Mobile User Rating */}
                {!hasRated ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Rate this product:</p>
                    <RatingComponent 
                      rating={hoverRating || userRating} 
                      onRate={handleRatingClick}
                      interactive={true}
                      size="w-5 h-5"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-green-600">Thanks for rating!</p>
                    <RatingComponent rating={userRating} size="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Mobile Price */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className="text-2xl font-medium text-black">₹{product.salePrice}</span>
                <span className="text-lg text-gray-500 line-through">₹{product.originalPrice}</span>
                <Badge className="bg-red-100 text-red-600 hover:bg-red-100 text-xs">
                  {product.discount}% OFF
                </Badge>
              </div>
            </div>

            {/* Mobile Size Selection */}
            <div>
              <h3 className="text-base font-medium mb-3">Size</h3>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 rounded-[1px] text-sm ${
                      selectedSize === size 
                        ? 'bg-black text-white' 
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Mobile Quantity */}
            <div>
              <h3 className="text-base font-medium mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange('decrease')}
                  disabled={quantity <= 1}
                  className="h-9 w-9 rounded-[1px]"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-base font-medium w-6 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange('increase')}
                  className="h-9 w-9 rounded-[1px]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Description */}
            <div>
              <h3 className="text-base font-medium mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed text-sm mb-3">{product.description}</p>
              <p className="text-xs text-gray-500 italic">
                "Eat, sleep, anime, repeat – a warrior's path to eternal inspiration!"
              </p>
            </div>

            {/* Mobile Features */}
            <div className="pb-24">
              <h3 className="text-base font-medium mb-3">Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600 text-sm">
                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3">
          <Button
            onClick={handleAddToBag}
            disabled={isAnimating}
            variant="outline"
            className={`flex-1 h-12 border-black text-black hover:bg-gray-50 rounded-[30px] text-base font-medium transition-all duration-300 ${
              isAnimating ? 'scale-95 opacity-75' : 'hover:scale-105'
            }`}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            {isAnimating ? 'ADDING...' : 'ADD TO BAG'}
          </Button>
          <Button
            onClick={handlePayNow}
            className="flex-1 h-12 bg-blue-600 text-white hover:bg-blue-700 rounded-[30px] text-base font-medium"
          >
            PAY NOW
          </Button>
        </div>
      </div>
    </div>
  );
};