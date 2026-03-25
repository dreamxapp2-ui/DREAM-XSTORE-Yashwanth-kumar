'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Package, Truck, CreditCard, ChevronRight } from 'lucide-react';
import UserOrderService, { Order } from '../../lib/api/services/orderService';

interface OrderDetailsPageProps {
  orderId: string;
}

export const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ orderId }) => {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await UserOrderService.getOrderDetails(orderId);
        if (response.success) {
          setOrder(response.data);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('[OrderDetailsPage] Error:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004d84]"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Order not found'}</h1>
          <Button onClick={() => router.back()} variant="outline">Go Back</Button>
        </div>
      </div>
    );
  }

  const deliveryDate = new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-black font-mono">Order Details</h1>
            <p className="text-sm text-gray-500">Order ID: {order._id.toUpperCase()}</p>
          </div>
          <Badge className={UserOrderService.getStatusColor(order.orderStatus)}>
            {UserOrderService.formatOrderStatus(order.orderStatus)}
          </Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
        {/* Progress Tracker (Simple) */}
        <Card className="border-none shadow-sm rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between relative">
              {[
                { label: 'Ordered', done: true, icon: <CreditCard className="w-5 h-5" /> },
                { label: 'Processing', done: true, icon: <Package className="w-5 h-5" /> },
                { label: 'Shipped', done: false, icon: <Truck className="w-5 h-5" /> },
                { label: 'Delivered', done: false, icon: <ChevronRight className="w-5 h-5" /> },
              ].map((step, i, arr) => (
                <div key={i} className="flex flex-col items-center gap-2 relative z-10 bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs font-medium ${step.done ? 'text-black' : 'text-gray-400'}`}>{step.label}</span>
                </div>
              ))}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 -z-0">
                <div 
                  className="h-full bg-green-500 transition-all duration-500" 
                  style={{ width: '33%' }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-sm rounded-none">
              <CardHeader className="pb-2 border-b border-gray-100">
                <CardTitle className="text-lg font-mono">Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
                      <div className="w-20 h-20 bg-gray-100 overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-black truncate">{item.title}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="font-semibold text-black mt-1">{UserOrderService.formatCurrency(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-mono">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{UserOrderService.formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping Fee</span>
                  <span>{UserOrderService.formatCurrency(order.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>{UserOrderService.formatCurrency(order.tax)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-bold text-black">
                  <span>Total</span>
                  <span>{UserOrderService.formatCurrency(order.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-mono">Shipping Details</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider font-bold">Address</p>
                  <p className="text-black font-medium">{order.shippingAddressSnapshot.firstName} {order.shippingAddressSnapshot.lastName}</p>
                  <p className="text-gray-600">{order.shippingAddressSnapshot.address}</p>
                  <p className="text-gray-600">{order.shippingAddressSnapshot.city}, {order.shippingAddressSnapshot.state}</p>
                  <p className="text-gray-600">{order.shippingAddressSnapshot.postalCode}, {order.shippingAddressSnapshot.country}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider font-bold">Estimated Delivery</p>
                  <p className="text-green-600 font-bold">{deliveryDate}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-mono">Payment Info</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-none bg-[#f1ff8c] border-black text-black">
                    {order.paymentMethod.toUpperCase()}
                  </Badge>
                  <span className="text-gray-600">Prepaid</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Paid on {new Date(order.createdAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
