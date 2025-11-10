'use client';

import dynamic from 'next/dynamic';

// Dynamically import HeroCarousel from LandingPage sections
const HeroCarouselFromLanding = dynamic(
  () => import('@/src/screens/LandingPage/sections/HeroCarousel').then(mod => mod.HeroCarousel),
  { loading: () => <div className="w-full h-96 bg-gray-200 animate-pulse" /> }
);

export default function HeroCarousel() {
  return (
    <div className="w-full">
      <HeroCarouselFromLanding />
    </div>
  );
}
