'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin' },
    { id: 'brand-accounts', label: 'Brand Accounts', path: '/admin/brands' },
    { id: 'products', label: 'Products', path: '/admin/products' },
    { id: 'orders', label: 'Orders', path: '/admin/orders' },
    { id: 'analytics', label: 'Analytics', path: '/admin/analytics' },
  ];

  // Determine active tab based on current pathname
  const getActiveTab = () => {
    if (pathname === '/admin' || pathname === '/admin/') return 'dashboard';
    if (pathname.includes('/admin/brands')) return 'brand-accounts';
    if (pathname.includes('/admin/products')) return 'products';
    if (pathname.includes('/admin/orders')) return 'orders';
    if (pathname.includes('/admin/analytics')) return 'analytics';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Header */}
      <header className={`border-b bg-white ${isModalOpen ? 'z-10 opacity-80 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between px-6 py-4">
          <button className="text-gray-600 hover:text-gray-900">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Dream X Store Admin</h1>
          <div className="w-6" />
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className='px-20 py-10'>
      {/* <div className={`border bg-white  ${isModalOpen ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="px-6">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={`py-2 font-bold transition-colors mx-2 my-2 ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white px-4 -mx-6 '
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div> */}
          <div className={`border bg-white transition-opacity duration-300 ease-in-out ${isModalOpen ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="px-6">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path)}
              className={`py-2 font-bold transition-all duration-300 ease-in-out mx-2 my-2 ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white px-4 -mx-6 scale-105 shadow-lg'
                  : 'text-gray-700 hover:text-gray-900 hover:scale-105'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
</div>
      

      {/* Main Content */}
      {children}
      </div>
    </div>
  );
}
