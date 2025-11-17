'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/src/contexts/ToastContext';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('analytics');
  const router = useRouter();
  const { showToast } = useToast();

  const tabs = ['dashboard', 'brand-accounts', 'orders', 'analytics'];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      router.push('/admin');
    } else if (tab === 'brand-accounts') {
      router.push('/admin/brands');
    } else if (tab === 'orders') {
      router.push('/admin/orders');
    } else if (tab === 'analytics') {
      router.push('/admin/analytics');
    }
  };

  // Monthly Growth Component
  const MonthlyGrowth = () => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-8">Monthly Growth</h3>
        <div className="flex flex-col items-center gap-2">
          <p className="text-4xl font-bold text-green-600">+24%</p>
          <p className="text-sm text-gray-600">vs last month</p>
        </div>
      </div>
    );
  };

  // Order Status Distribution Component
  const OrderStatusDistribution = () => {
    const statuses = [
      { label: 'Delivered', count: 1, color: 'text-teal-600' },
      { label: 'Shipped', count: 1, color: 'text-blue-600' },
      { label: 'Processing', count: 0, color: 'text-gray-400' },
      { label: 'Pending', count: 0, color: 'text-amber-500' },
    ];

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Order Status Distribution</h3>
        <div className="space-y-4">
          {statuses.map((status) => (
            <div key={status.label} className="flex items-center justify-between">
              <p className="text-gray-700">{status.label}</p>
              <p className={`font-semibold ${status.color}`}>{status.count}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Top Performing Brands Component
  const TopPerformingBrands = () => {
    const brands = [
      { rank: 1, name: 'ROCKAGE', amount: '₹45,600' },
      { rank: 2, name: 'StyleCraft', amount: '₹32,400' },
      { rank: 3, name: 'UrbanWear', amount: '₹18,900' },
    ];

    const colors = ['bg-purple-100', 'bg-pink-100', 'bg-blue-100'];

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Brands</h3>
        <div className="space-y-4">
          {brands.map((brand, index) => (
            <div key={brand.rank} className="flex items-center gap-4">
              <div className={`${colors[index]} rounded w-8 h-8 flex items-center justify-center font-semibold text-gray-900`}>
                {brand.rank}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{brand.name}</p>
              </div>
              <p className="font-medium text-gray-900">{brand.amount}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <main className="p-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TopPerformingBrands />
            <OrderStatusDistribution />
            <MonthlyGrowth />
          </div>
        </div>
      </main>
    </div>
  );
}
