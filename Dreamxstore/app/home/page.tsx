'use client';

import Header from '@/app/home/components/Header';
import HeroCarousel from '@/app/home/components/HeroCarousel';
import FeaturedProducts from '@/app/home/components/FeaturedProducts';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroCarousel />
      {/* <CategorySection /> */}
      <FeaturedProducts />
      
      {/* Additional sections will be added here */}
      {/* Best Sellers */}
      {/* Testimonials */}
      {/* Newsletter */}
      {/* Footer */}
    </div>
  );
}
