import React, { useEffect } from "react";
import { HeroSection } from "./sections/HeroSection";
import { HeroCarousel } from "./sections/HeroCarousel";
import { BrandMarquee } from "./sections/BrandMarquee";
import { OverallSection } from "./sections/OverallSection";
import { ProductSection } from "./sections/ProductSection";
import { TrendingFashionCarousel } from "./sections/TrendingFashionCarousel";
import { TrendingFashionCards } from "./sections/TrendingFashionCards";
import { Footer } from "./sections/Footer";
import { FloatingChatButton } from "./sections/FloatingChatButton";

export const LandingPage = () => {
  // Handle scroll restoration when returning from product page
  useEffect(() => {
    const handleScrollRestoration = () => {
      const clickedProduct = sessionStorage.getItem('clickedProduct');
      
      if (clickedProduct) {
        try {
          const productData = JSON.parse(clickedProduct);
          console.log("Restoring scroll to product:", productData);
          
          // Clear the stored data immediately to prevent multiple attempts
          sessionStorage.removeItem('clickedProduct');
          
          // Ultra-smooth scroll function with optimized performance
          const ultraSmoothScrollToElement = (element: HTMLElement, duration = 1200) => {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + window.pageYOffset;
            
            // Calculate offset to center the element (accounting for header)
            const headerHeight = 100;
            const viewportHeight = window.innerHeight;
            const elementHeight = rect.height;
            const offset = Math.max(50, (viewportHeight - elementHeight) / 2 - headerHeight);
            
            const targetScrollPosition = Math.max(0, elementTop - offset);
            const startScrollPosition = window.pageYOffset;
            const verticalDistance = targetScrollPosition - startScrollPosition;
            
            // Handle horizontal scrolling for the product container
            const scrollContainer = element.closest('.overflow-x-auto');
            let horizontalScrollNeeded = false;
            let horizontalStartPosition = 0;
            let horizontalTargetPosition = 0;
            let horizontalDistance = 0;
            
            if (scrollContainer && productData.containerInfo) {
              horizontalStartPosition = scrollContainer.scrollLeft;
              horizontalTargetPosition = productData.containerInfo.scrollLeft;
              horizontalDistance = horizontalTargetPosition - horizontalStartPosition;
              horizontalScrollNeeded = Math.abs(horizontalDistance) > 5;
              
              console.log("Horizontal scroll setup:", {
                current: horizontalStartPosition,
                target: horizontalTargetPosition,
                distance: horizontalDistance,
                needed: horizontalScrollNeeded
              });
            }
            
            // Use high-precision timing for ultra-smooth animation
            let startTime: number | null = null;
            let lastTime: number | null = null;
            
            // Ultra-smooth easing function (ease-out-quart for very smooth deceleration)
            const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
            
            // Optimized animation function with requestAnimationFrame
            const animateUltraSmooth = (currentTime: number) => {
              if (startTime === null) {
                startTime = currentTime;
                lastTime = currentTime;
              }
              
              // Calculate smooth progress
              const timeElapsed = currentTime - startTime;
              const progress = Math.min(timeElapsed / duration, 1);
              
              // Apply ultra-smooth easing
              const easedProgress = easeOutQuart(progress);
              
              // Calculate positions with sub-pixel precision
              const currentVerticalPosition = startScrollPosition + (verticalDistance * easedProgress);
              
              // Smooth vertical scroll with sub-pixel precision
              window.scrollTo({
                top: currentVerticalPosition,
                behavior: 'auto' // We handle the smoothness manually
              });
              
              // Smooth horizontal scroll if needed
              if (horizontalScrollNeeded && scrollContainer) {
                const currentHorizontalPosition = horizontalStartPosition + (horizontalDistance * easedProgress);
                scrollContainer.scrollTo({
                  left: currentHorizontalPosition,
                  behavior: 'auto' // Manual smoothness for consistency
                });
              }
              
              // Continue animation until complete
              if (progress < 1) {
                lastTime = currentTime;
                requestAnimationFrame(animateUltraSmooth);
              } else {
                // Animation complete - add subtle visual feedback
                console.log("Ultra-smooth scroll animation completed");
                
                // Very subtle and smooth highlight effect
                element.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                element.style.transform = 'scale(1.02)';
                element.style.boxShadow = '0 8px 32px rgba(241, 255, 140, 0.3), 0 4px 16px rgba(0, 0, 0, 0.1)';
                element.style.borderRadius = '8px';
                element.style.zIndex = '20';
                
                // Subtle glow effect
                element.style.outline = '2px solid rgba(241, 255, 140, 0.6)';
                element.style.outlineOffset = '4px';
                
                // Remove effects smoothly
                setTimeout(() => {
                  element.style.transform = 'scale(1)';
                  element.style.boxShadow = '';
                  element.style.outline = '';
                  element.style.outlineOffset = '';
                  element.style.borderRadius = '';
                  element.style.zIndex = '';
                  
                  // Clean up transition
                  setTimeout(() => {
                    element.style.transition = '';
                  }, 1000);
                }, 1500);
              }
            };
            
            // Start the ultra-smooth animation
            requestAnimationFrame(animateUltraSmooth);
          };
          
          // Optimized element detection with better timing
          const attemptScrollRestoration = (attempt = 1, maxAttempts = 15) => {
            console.log(`Ultra-smooth scroll restoration attempt ${attempt}/${maxAttempts}`);
            
            // Try multiple selectors for better element detection
            let productElement = document.getElementById(`product-${productData.slug}`);
            
            if (!productElement) {
              productElement = document.querySelector(`[data-product-slug="${productData.slug}"]`);
            }
            
            if (!productElement) {
              productElement = document.querySelector(`[data-product-id="${productData.id}"]`);
            }
            
            if (productElement) {
              console.log("Found product element, starting ultra-smooth scroll...");
              
              // Ensure the element is visible and properly rendered
              const rect = productElement.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                // Small delay to ensure layout is stable
                setTimeout(() => {
                  ultraSmoothScrollToElement(productElement, 1000); // 1 second ultra-smooth animation
                }, 50);
                return true;
              } else {
                console.log("Element found but not properly rendered, retrying...");
              }
            }
            
            if (attempt < maxAttempts) {
              // Optimized retry timing
              const delay = Math.min(80 + (attempt * 40), 400);
              console.log(`Product element not found, retrying in ${delay}ms...`);
              setTimeout(() => attemptScrollRestoration(attempt + 1, maxAttempts), delay);
              return false;
            } else {
              // Fallback with ultra-smooth scroll
              console.log("Max attempts reached, using ultra-smooth fallback");
              const fallbackPosition = productData.scrollPosition || 0;
              
              // Ultra-smooth fallback scroll
              const startPosition = window.pageYOffset;
              const distance = fallbackPosition - startPosition;
              const duration = 800;
              let startTime: number | null = null;
              
              const animateFallback = (currentTime: number) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                
                // Ultra-smooth easing for fallback
                const easedProgress = 1 - Math.pow(1 - progress, 4);
                const currentPosition = startPosition + (distance * easedProgress);
                
                window.scrollTo({
                  top: currentPosition,
                  behavior: 'auto'
                });
                
                if (progress < 1) {
                  requestAnimationFrame(animateFallback);
                }
              };
              
              requestAnimationFrame(animateFallback);
              return false;
            }
          };
          
          // Optimized startup timing
          const startRestoration = () => {
            if (document.readyState === 'complete') {
              // Minimal delay for ultra-smooth experience
              setTimeout(() => attemptScrollRestoration(), 100);
            } else {
              window.addEventListener('load', () => {
                setTimeout(() => attemptScrollRestoration(), 100);
              }, { once: true });
            }
          };
          
          // Start the restoration process
          startRestoration();
          
        } catch (error) {
          console.error("Error parsing clicked product data:", error);
          sessionStorage.removeItem('clickedProduct');
        }
      }
    };

    // Enhanced detection for returning from product page
    const isReturningFromProduct = 
      document.referrer.includes('/product/') || 
      sessionStorage.getItem('clickedProduct') !== null ||
      window.history.state?.fromProductPage ||
      window.performance?.navigation?.type === 2;
    
    console.log("Is returning from product:", isReturningFromProduct);
    
    if (isReturningFromProduct) {
      // Disable browser's automatic scroll restoration
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      
      // Optimized restoration timing
      if (document.readyState === 'complete') {
        setTimeout(handleScrollRestoration, 50);
      } else {
        window.addEventListener('load', () => {
          setTimeout(handleScrollRestoration, 50);
        }, { once: true });
      }
      
      // Re-enable automatic scroll restoration after our restoration
      setTimeout(() => {
        if ('scrollRestoration' in history) {
          history.scrollRestoration = 'auto';
        }
      }, 2000);
    }
    
    // Handle browser back/forward navigation
    const handlePopState = (event: PopStateEvent) => {
      console.log("PopState event:", event);
      if (event.state?.fromProductPage || sessionStorage.getItem('clickedProduct')) {
        if ('scrollRestoration' in history) {
          history.scrollRestoration = 'manual';
        }
        
        setTimeout(() => {
          handleScrollRestoration();
          setTimeout(() => {
            if ('scrollRestoration' in history) {
              history.scrollRestoration = 'auto';
            }
          }, 2000);
        }, 100);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('load', handleScrollRestoration);
      
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);

  return (
    <div className="bg-white w-full min-h-screen">
      <div className="bg-white w-full max-w-none mx-auto relative">
        {/* Hero Section - Fixed Navigation */}
        <HeroSection />
        
        {/* Main Content - Add top padding to account for fixed header */}
        <main className="pt-0">
          {/* Hero Carousel - Auto-sliding section */}
          <HeroCarousel />
          
          {/* Brand Marquee - Animated brand logos */}
          <BrandMarquee />
          
          {/* Overall Section - New section with image and content */}
          <OverallSection />
          
          {/* Product Section - Category buttons and horizontal scroll products */}
          <ProductSection />
          
          {/* Trending Fashion Carousel - New carousel section */}
          <TrendingFashionCarousel />
          
          {/* Trending Fashion Cards - New cards section */}
          <TrendingFashionCards />
        </main>

        {/* Footer */}
        <Footer />

        {/* Floating Chat Button */}
        <FloatingChatButton />
      </div>
    </div>
  );
};