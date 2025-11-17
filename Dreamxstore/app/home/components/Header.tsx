'use client';

import { Search, User, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/src/contexts/CartContext';

export default function Header() {
  const router = useRouter();
  const { cart } = useCart();
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-20 h-16">
        {/* Logo */}
        <div 
          className="font-serif text-lg tracking-widest cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => router.push('/home')}
        >
          <p className="flex items-center flex-shrink-0">
            <img
              src="https://i.postimg.cc/xTVNmCps/Dream-X-Store.png"
              alt="Dream X Store"
              className="h-10 sm:h-12 w-auto object-contain"
            />
            </p>
          
        </div>

        {/* Icons */}
        <div className="flex items-center gap-6">
          <button 
            className="hover:opacity-80 transition-opacity" 
            aria-label="Search"
            onClick={() => router.push('/search')}
          >
            <Search size={20} className="text-gray-700" />
          </button>

          <button 
            className="hover:opacity-80 transition-opacity" 
            aria-label="Account"
            onClick={() => router.push('/profile')}
          >
            <User size={20} className="text-gray-700" />
          </button>

          <button 
            className="hover:opacity-80 transition-opacity relative" 
            aria-label="Shopping cart"
            onClick={() => router.push('/cart')}
          >
            <ShoppingBag size={20} className="text-gray-700" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
