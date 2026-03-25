import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Package } from 'lucide-react';
import UserOrderService, { Order as APIOrder } from '../../../lib/api/services/orderService';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'canceled';
  total: number;
  items: number;
}

interface OrdersTabProps {
  orders?: Order[]; // Mock orders - will be replaced by API
}

export const OrdersTab: React.FC<OrdersTabProps> = () => {
  const [orders, setOrders] = useState<APIOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await UserOrderService.getOrders(1, 20);
      if (response.success) {
        setOrders(response.data);
      }
    } catch (err) {
      console.error('[OrdersTab] Error loading orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      // The backend route is /download/order/:orderId/invoice
      const downloadUrl = `${baseUrl.replace('/api', '')}/download/order/${orderId}/invoice`;
      
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to download invoice');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${orderId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('[OrdersTab] Download invoice error:', err);
      alert('Failed to download invoice');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border border-gray-200 rounded-[1px]">
        <CardContent className="p-12 text-center">
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={loadOrders}
            className="mt-4 bg-[#004d84] hover:bg-[#003d6a] rounded-none"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black">Order History</h2>
        <span className="text-sm text-gray-600">{orders.length} orders</span>
      </div>

      {orders.length === 0 ? (
        <Card className="border border-gray-200 rounded-[1px]">
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No orders yet</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="mt-4 bg-[#004d84] hover:bg-[#003d6a] rounded-none"
            >
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order._id} className="border border-gray-200 rounded-[1px] hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-black">{order._id.slice(-8).toUpperCase()}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                      {UserOrderService.formatOrderStatus(order.orderStatus)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm font-medium text-green-600">
                    Estimated Delivery: {new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                  <p className="text-lg font-semibold text-black">{UserOrderService.formatCurrency(order.total)}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = `/orders/${order._id}`}
                    className="border-[#004d84] text-[#004d84] hover:bg-[#004d84] hover:text-white rounded-none w-full sm:w-auto"
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleDownloadInvoice(order._id)}
                    className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-none w-full sm:w-auto"
                  >
                    Download Invoice
                  </Button>
                  {(order.shippingStatus === 'shipped' || order.shippingStatus === 'in_transit') && (
                    <Button variant="outline" className="rounded-none w-full sm:w-auto">
                      Track Order
                    </Button>
                  )}
                  {order.orderStatus === 'delivered' && (
                    <Button variant="outline" className="rounded-none w-full sm:w-auto">
                      Leave Review
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
