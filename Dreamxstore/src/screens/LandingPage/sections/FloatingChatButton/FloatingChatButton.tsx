import React, { useState } from "react";
import { Button } from "../../../../components/ui/button";

export const FloatingChatButton = (): JSX.Element => {
  const [isHovered, setIsHovered] = useState(false);

  const handleChatClick = () => {
    // Open the chatbot in the same page
    window.location.href = "https://lookbook-psus.onrender.com/";
  };

  return (
    <>
      {/* Fixed Floating Chat Button - Increased bottom margin */}
      <Button
        onClick={handleChatClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-10 right-6 sm:bottom-12 sm:right-8 md:bottom-14 md:right-10 lg:bottom-16 lg:right-12 xl:bottom-20 xl:right-16 w-14 h-14 sm:w-16 sm:h-16 md:w-16 md:h-16 lg:w-16 lg:h-16 xl:w-16 xl:h-16 bg-[#f1ff8c] hover:bg-[#e9f87a] border-2 border-black rounded-full p-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-50 group"
        aria-label="Open Chat"
      >
        {/* Chat Logo */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Custom Logo Image */}
          <img 
            src="https://i.postimg.cc/PJgGbX18/Logo.png"
            alt="Chat Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 lg:w-9 lg:h-9 xl:w-9 xl:h-9 object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </Button>

      {/* Tooltip - Updated positioning to match new button position */}
      {isHovered && (
        <div className="fixed bottom-24 right-6 sm:bottom-28 sm:right-8 md:bottom-30 md:right-10 lg:bottom-32 lg:right-12 xl:bottom-36 xl:right-16 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap z-40 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
          Chat with Racan AI
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}

      {/* Ripple Effect on Click */}
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background-color: rgba(241, 255, 140, 0.6);
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        }
      `}</style>
    </>
  );
};