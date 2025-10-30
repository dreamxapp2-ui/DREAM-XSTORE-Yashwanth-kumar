import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Package } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'canceled';
  total: number;
  items: number;
}

interface OrdersTabProps {
  orders: Order[];
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ orders }) => {
  const getStatusColor = (status: Order['status']) => {
    const colors = {
      processing: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      canceled: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

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
              onClick={() => window.location.href = '/trending'}
              className="mt-4 bg-[#004d84] hover:bg-[#003d6a] rounded-none"
            >
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="border border-gray-200 rounded-[1px] hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-black">{order.orderNumber}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(order.date).toLocaleDateString('en-US', { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{order.items} item(s)</p>
                  <p className="text-lg font-semibold text-black">₹{order.total.toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline"
                    className="border-[#004d84] text-[#004d84] hover:bg-[#004d84] hover:text-white rounded-none"
                  >
                    View Details
                  </Button>
                  {order.status === 'shipped' && (
                    <Button variant="outline" className="rounded-none">
                      Track Order
                    </Button>
                  )}
                  {order.status === 'delivered' && (
                    <Button variant="outline" className="rounded-none">
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
