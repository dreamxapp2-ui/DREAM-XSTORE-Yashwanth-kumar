'use client';

import { Users, Layers, ShoppingCart, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AdminService } from '@/src/lib/api/admin/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentBrands, setRecentBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('[Dashboard] Fetching dashboard data...');
      
      // Fetch dashboard stats
      const dashboardDataResponse = await AdminService.getDashboardStats();
      console.log('[Dashboard] Stats response:', dashboardDataResponse);
      setStats(dashboardDataResponse);

      // Fetch recent orders
      const ordersResponse = await AdminService.getRecentOrders(2);
      console.log('[Dashboard] Orders response:', ordersResponse);
      const ordersData = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse as any)?.data || [];
      setRecentOrders(ordersData);

      // Fetch recent brands
      const brandsResponse = await AdminService.getRecentBrands(3);
      console.log('[Dashboard] Brands response:', brandsResponse);
      const brandsData = Array.isArray(brandsResponse) ? brandsResponse : (brandsResponse as any)?.data || [];
      setRecentBrands(brandsData);
    } catch (error) {
      console.error('[Dashboard] Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Users',
      value: loading ? '...' : (stats?.totalUsers || 0),
      icon: Users,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Brand Accounts',
      value: loading ? '...' : (stats?.totalBrands || 0),
      icon: Layers,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-500',
    },
    {
      label: 'Total Orders',
      value: loading ? '...' : (stats?.totalOrders || 0),
      icon: ShoppingCart,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-500',
    },
    {
      label: 'Total Revenue',
      value: loading ? '...' : `₹${stats?.totalRevenue || 0}`,
      icon: TrendingUp,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-500',
    },
  ];

  const displayRecentOrders = recentOrders.slice(0, 2);
  const displayRecentBrands = recentBrands.slice(0, 3);

  return (
    <main className="p-6">
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Admin Dashboard</h2>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6"
              >
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`rounded-full ${stat.bgColor} p-3`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Orders and Brands */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-6 text-xl font-bold text-gray-900">Recent Orders</h3>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500">Loading orders...</p>
              ) : displayRecentOrders.length === 0 ? (
                <p className="text-gray-500">No orders found</p>
              ) : (
                displayRecentOrders.map((order, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                    <span className={`rounded px-3 py-1 text-sm font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Brands */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-6 text-xl font-bold text-gray-900">Recent Brands</h3>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500">Loading brands...</p>
              ) : displayRecentBrands.length === 0 ? (
                <p className="text-gray-500">No brands found</p>
              ) : (
                displayRecentBrands.map((brand, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{brand.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{brand.ownerEmail || brand.email || 'N/A'}</p>
                    </div>
                    <span className={`rounded px-3 py-1 text-sm font-medium ${
                      brand.status === 'Active' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {brand.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
