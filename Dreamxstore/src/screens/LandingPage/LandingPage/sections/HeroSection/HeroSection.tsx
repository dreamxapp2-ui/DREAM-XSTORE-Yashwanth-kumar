import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Avatar, AvatarImage } from "../../../../../components/ui/avatar";
import { Button } from "../../../../../components/ui/button";
import Link from "next/link";


// Simulate user authentication state (replace with real auth logic)
const getUserFromStorage = () => {
  const user = localStorage.getItem("dreamx_user");
  return user ? JSON.parse(user) : null;
};

export const HeroSection = (): JSX.Element => {
  const [user, setUser] = useState<any>(getUserFromStorage());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Listen for login changes (simulate login event)
  useEffect(() => {
    const onStorage = () => setUser(getUserFromStorage());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Navigation links data
  const navLinks = [
    { text: "Home", className: "whitespace-nowrap" },
    { text: "About us" },
    { text: "Services" },
    { text: "Contact" },
  ];

  return (
    <header className="w-full h-[170px] bg-white">
      <div className="max-w-[1920px] h-full mx-auto relative flex items-center justify-between px-[108px]">
        <Link href="/" className="flex items-center flex-shrink-0">
          <img
            src="https://i.postimg.cc/sx24cHZb/image-89.png"
            alt="Dream X Store"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          {navLinks.map((link, index) => (
            <Button
              key={index}
              variant="link"
              className={`font-mono font-normal text-black text-2xl p-0 h-auto ${link.className || ""}`}
            >
              {link.text}
            </Button>
          ))}

          {/* Expandable Search */}
          <div className="relative flex items-center h-[50px] transition-all duration-300 ease-in-out">
            {isSearchOpen ? (
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-[300px] border border-gray-300 shadow-sm transition-all duration-300">
                <Search className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                      setIsSearchOpen(false);
                    }
                  }}
                  className="bg-transparent border-none outline-none w-full text-black font-mono text-lg"
                  autoFocus
                />
                <button 
                  onClick={() => setIsSearchOpen(false)} 
                  className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 hover:text-black" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Open search"
              >
                <Search className="w-[30px] h-[30px] text-black" />
              </button>
            )}
          </div>

          {/* CTA Button or User Avatar with Name */}
          {user ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="w-auto h-[86px] rounded-none px-4 flex items-center gap-2 cursor-default bg-transparent hover:bg-transparent"
                disabled
              >
                <Avatar className="w-[56px] h-[56px]">
                  <AvatarImage
                    src={user.avatarUrl || "/ellipse-1.png"}
                    alt={user.firstName || "User profile"}
                    className="object-cover"
                  />
                </Avatar>
                <span className="font-mono font-normal text-[#004d84] text-2xl">
                  {user.firstName}
                </span>
              </Button>
            </div>
          ) : (
            <button
              style={{ width: 223, height: 86, background: '#f0ff7f', borderRadius: 0 }}
              className="rounded-none hover:bg-[#e5f570] font-mono font-normal text-[#004d84] text-2xl transition-colors"
              onClick={() => {
                router.push("/login");
              }}
            >
              Get Started
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
