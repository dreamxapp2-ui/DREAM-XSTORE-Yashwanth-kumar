'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Eye, Pencil, Search } from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  email: string;
  brand: string;
  product: string;
  qty: number;
  amount: string;
  status: 'Delivered' | 'Shipped' | 'Pending' | 'Processing';
  statusColor: string;
  date: string;
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const router = useRouter();

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

  const orders: Order[] = [
    {
      id: 'ORD001',
      customer: 'John Doe',
      email: 'john@example.com',
      brand: 'ROCKAGE',
      product: 'Oversized T-shirt',
      qty: 2,
      amount: '₹1398',
      status: 'Delivered',
      statusColor: 'bg-green-100 text-green-700',
      date: '2025-01-15',
    },
    {
      id: 'ORD002',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      brand: 'StyleCraft',
      product: 'Designer Hoodie',
      qty: 1,
      amount: '₹2499',
      status: 'Shipped',
      statusColor: 'bg-blue-100 text-blue-700',
      date: '2025-01-20',
    },
  ];

  const filteredOrders = orders.filter((order) =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <main className="p-6">
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">All Orders</h2>
            <span className="text-blue-600 font-medium">Total: {filteredOrders.length}</span>
          </div>

          {/* Search Bar */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                      <div className="text-sm text-gray-500">{order.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.brand}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.product}</div>
                      <div className="text-sm text-gray-500">Qty: {order.qty}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${order.statusColor}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <Pencil className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
