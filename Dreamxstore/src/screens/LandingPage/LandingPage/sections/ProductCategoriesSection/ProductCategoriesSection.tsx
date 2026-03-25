import React from "react";
import { Card, CardContent } from "../../../../../components/ui/card";
import { Heart, ShoppingBag } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../../../../components/ui/carousel";

export const ProductCategoriesSection = (): JSX.Element => {
  // Product data for mapping with high-quality fashion images
  const products = [
    {
      id: 1,
      name: "URBAN STREET T-SHIRT",
      price: "Rs. 2,999.00",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=625&q=80",
    },
    {
      id: 2,
      name: "MINIMALIST OVERSIZED TEE",
      price: "Rs. 1,837.00",
      image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=625&q=80",
    },
    {
      id: 3,
      name: "GRAPHIC ART REBORN",
      price: "Rs. 3,499.00",
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=625&q=80",
    },
    {
      id: 4,
      name: "PREMIUM COTTON POLO",
      price: "Rs. 2,499.00",
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=625&q=80",
    },
    {
      id: 5,
      name: "VINTAGE WASHED TEE",
      price: "Rs. 2,837.00",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=625&q=80",
    },
  ];

  return (
    <section className="w-full py-20 bg-white">
      <div className="container mx-auto px-[108px]">
        <h2 className="text-5xl font-black mb-12 tracking-tighter">NEW ARRIVALS</h2>

        <Carousel
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-8">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-8 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <Card className="border-0 rounded-3xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-500">
                  <CardContent className="p-0">
                    <div className="relative w-full h-[625px]">
                      {/* Product Image */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                      {/* Top Action (Wishlist) */}
                      <button className="absolute top-6 right-6 w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#ff4d4d] transition-colors group/btn">
                        <Heart className="w-7 h-7 text-white group-hover/btn:fill-white" />
                      </button>

                      {/* Bottom Action (Add to Cart) */}
                      <button className="absolute bottom-[40px] right-6 w-16 h-16 bg-[#f1ff8c] rounded-2xl flex items-center justify-center hover:bg-black hover:text-[#f1ff8c] transition-all transform hover:rotate-12">
                        <ShoppingBag className="w-8 h-8" />
                      </button>

                      {/* Text Overlays */}
                      <div className="absolute bottom-[40px] left-8 flex flex-col gap-2">
                        <p className="font-mono font-black text-white text-3xl uppercase tracking-tighter max-w-[200px] leading-none">
                          {product.name}
                        </p>
                        <p className="font-mono font-bold text-[#f1ff8c] text-2xl">
                          {product.price}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-[-50px] w-14 h-14 bg-black text-white border-none hover:bg-[#004d84]" />
          <CarouselNext className="right-[-50px] w-14 h-14 bg-black text-white border-none hover:bg-[#004d84]" />
        </Carousel>
      </div>
    </section>
  );
};
