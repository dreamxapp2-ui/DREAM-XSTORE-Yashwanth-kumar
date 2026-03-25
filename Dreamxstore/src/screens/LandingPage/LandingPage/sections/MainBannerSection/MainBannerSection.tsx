import React from "react";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent } from "../../../../../components/ui/card";

export const MainBannerSection = (): JSX.Element => {
  return (
    <section className="w-full py-16 bg-[#f1f0fff5]">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
        {/* Banner Image with Overlay */}
        <div className="relative w-full lg:w-1/2 overflow-hidden rounded-3xl group h-[500px] shadow-2xl">
          <img
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            alt="DreamX custom clothing"
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
          <div className="absolute bottom-10 left-10 text-white">
            <h2 className="text-6xl font-black tracking-tighter mb-2">OVERALL</h2>
            <p className="text-xl font-mono text-white/80">Premium Custom Fits</p>
          </div>
        </div>

        {/* Content Card */}
        <Card className="w-full lg:w-1/2 border-none bg-transparent">
          <CardContent className="p-0 flex flex-col gap-10">
            <div className="font-sans text-black text-[32px] leading-[1.3]">
              Hey, welcome to <span className="font-black italic">DreamX!</span> <br />
              <br />
              <span className="text-[#004d84] font-bold">#GetCustomClothing</span> tailored just for you from your favorite brands
              and styles.
              <br />
              <p className="text-2xl text-gray-600 mt-4 leading-relaxed font-mono">
                Discover exclusive, made-for-you fashion picks and personalize
                your wardrobe like never before.
              </p>
            </div>

            <div className="flex justify-start">
              <Button className="h-[90px] w-[300px] bg-[#f1ff8c] rounded-full border-2 border-solid border-black hover:bg-black hover:text-[#f1ff8c] shadow-[8px_8px_0px_#000] transition-all transform hover:-translate-y-1 active:translate-y-0 active:shadow-none">
                <span className="font-mono font-black text-2xl uppercase tracking-widest">
                  Join Now
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
