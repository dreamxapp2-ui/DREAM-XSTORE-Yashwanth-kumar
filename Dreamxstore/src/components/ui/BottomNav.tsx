"use client";

import React from "react";
import { Home, ShoppingBag, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: <Home className="w-6 h-6" />, label: "Home", path: "/home" },
    { icon: <ShoppingBag className="w-6 h-6" />, label: "Cart", path: "/cart" },
    { icon: <User className="w-6 h-6" />, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[400px]">
      <div className="bg-[#1a1a1a] rounded-[2.5rem] p-2 flex items-center justify-between shadow-2xl border border-white/10">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path === "/home" && (pathname === "/home" || pathname === "/"));
          
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-300 ${
                isActive 
                  ? "bg-[#bef264] text-black scale-105" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <div className={isActive ? "text-black" : "text-gray-400"}>
                {item.icon}
              </div>
              {isActive && (
                <span className="text-sm font-bold">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
