import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage } from "../../../../../components/ui/avatar";
import { Button } from "../../../../../components/ui/button";


// Simulate user authentication state (replace with real auth logic)
const getUserFromStorage = () => {
  const user = localStorage.getItem("dreamx_user");
  return user ? JSON.parse(user) : null;
};

export const HeroSection = (): JSX.Element => {
  const [user, setUser] = useState<any>(getUserFromStorage());
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
        {/* Logo */}
        <div className="[font-family:'Horizon-Regular',Helvetica] font-normal text-black text-[40px]">
          Dream X<br />
          Store
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          {navLinks.map((link, index) => (
            <Button
              key={index}
              variant="link"
              className={`[font-family:'Azeret_Mono',Helvetica] font-normal text-black text-2xl p-0 h-auto ${link.className || ""}`}
            >
              {link.text}
            </Button>
          ))}

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
                <span className="[font-family:'Azeret_Mono',Helvetica] font-normal text-[#004d84] text-2xl">
                  {user.firstName}
                </span>
              </Button>
            </div>
          ) : (
            <button
              style={{ width: 223, height: 86, background: '#f0ff7f', borderRadius: 0 }}
              className="rounded-none hover:bg-[#e5f570] [font-family:'Azeret_Mono',Helvetica] font-normal text-[#004d84] text-2xl"
              onClick={() => {
                alert("Hero DEBUG button clicked");
                console.log("Hero DEBUG button navigating to login", { location: window.location.href });
                try {
                  router.push("/login");
                } catch (err) {
                  alert("Navigation error: " + err);
                  console.error("Navigation error", err);
                }
              }}
            >
              Get Started Hero DEBUG
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
