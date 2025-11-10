import React from "react";

export const BrandMarquee = ()=> {
  // Brand data - using the provided images and additional brands
  const brands = [
    {
      id: 1,
      name: "Dream X Store",
      logo: "https://i.postimg.cc/nzjMpJ7C/Dream-X-Store.png",
    },
    {
      id: 2,
      name: "Brand Logo",
      logo: "https://i.postimg.cc/CMnkxnGs/image-1.png",
    },
    {
      id: 3,
      name: "Nike",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png",
    },
    {
      id: 4,
      name: "Adidas",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png",
    },
    {
      id: 5,
      name: "Puma",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Puma-Logo.png",
    },
    {
      id: 6,
      name: "Under Armour",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Under-Armour-Logo.png",
    }
  ];

  // Duplicate brands for seamless loop
  const duplicatedBrands = [...brands, ...brands, ...brands];

  return (
    <section className="w-full bg-black py-4 sm:py-6 md:py-4 lg:py-6 xl:py-8 overflow-hidden zoom-fix no-scroll-x">
      <div className="relative zoom-fix">
        {/* Marquee Container */}
        <div className="flex animate-marquee items-center zoom-fix">
          {duplicatedBrands.map((brand, index) => (
            <div
              key={`${brand.id}-${index}`}
              className="flex-shrink-0 mx-3 sm:mx-4 md:mx-4 lg:mx-6 xl:mx-8 flex items-center justify-center zoom-fix"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-6 sm:h-8 md:h-6 lg:h-7 xl:h-8 w-auto object-contain filter brightness-0 invert opacity-70 hover:opacity-100 transition-opacity duration-300 zoom-fix"
              />
            </div>
          ))}
        </div>

        {/* Gradient Overlays for smooth fade effect */}
        <div className="absolute top-0 left-0 w-8 sm:w-12 md:w-12 lg:w-16 xl:w-20 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none zoom-fix" />
        <div className="absolute top-0 right-0 w-8 sm:w-12 md:w-12 lg:w-16 xl:w-20 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none zoom-fix" />
      </div>
    </section>
  );
};