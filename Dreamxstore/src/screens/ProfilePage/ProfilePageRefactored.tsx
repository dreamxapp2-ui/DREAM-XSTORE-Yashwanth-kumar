"use client";

import React, { useState, useEffect } from 'react';
import EditProfileModal from '../../components/EditProfileModal';
import { Card, CardContent } from '../../components/ui/card';
import { User, Package, Settings, Heart, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  ProfileHeader,
  ProfileOverview,
  OrdersTab,
  WishlistTab,
  AddressManagement,
  PaymentMethods,
  SecuritySettings,
  NotificationPreferences
} from './sections';

interface UserProfile {
  email: string;
  username: string;
  lastName?: string;
  bio?: string;
  isBrand?: boolean;
  hero_image?: string;
  phone?: string;
  joinedDate?: string;
}

interface Address {
  id: string;
  type: 'shipping' | 'billing';
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet';
  lastFour?: string;
  cardBrand?: string;
  expiryDate?: string;
  walletName?: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'canceled';
  total: number;
  items: number;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'settings'>('profile');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Mock data - replace with actual API calls
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'shipping',
      name: 'John Doe',
      phone: '+91 1234567890',
      addressLine1: '123 Main Street',
      addressLine2: 'Apt 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
      isDefault: true
    }
  ]);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      lastFour: '4242',
      cardBrand: 'Visa',
      expiryDate: '12/25',
      isDefault: true
    }
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      date: '2024-10-15',
      status: 'delivered',
      total: 2499,
      items: 3
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      date: '2024-10-20',
      status: 'shipped',
      total: 1299,
      items: 1
    }
  ]);

  const [wishlist, setWishlist] = useState<WishlistItem[]>([
    {
      id: '1',
      name: 'Premium Cotton T-Shirt',
      price: 799,
      image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?w=300',
      inStock: true
    }
  ]);

  const [stats, setStats] = useState({
    totalOrders: 12,
    wishlistItems: 5,
    totalSpent: 24999,
    memberSince: '2024-01-15'
  });

  // Settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('dreamx_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser({
        ...parsedUser,
        joinedDate: parsedUser.joinedDate || '2024-01-15'
      });
    }

    const onStorage = () => {
      const updated = localStorage.getItem('dreamx_user');
      if (updated) {
        setUser(JSON.parse(updated));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('dreamx_user');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-semibold">No Profile Found</h2>
            <p className="text-gray-600">Please log in or sign up to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'orders' as const, label: 'My Orders', icon: Package },
    { id: 'wishlist' as const, label: 'Wishlist', icon: Heart },
    { id: 'settings' as const, label: 'Settings', icon: Settings }
  ];

  return (
    <div className="bg-white w-full min-h-screen">
      {/* Simple Header with Back Button */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => window.location.href = '/'}
                variant="ghost"
                className="rounded-none hover:bg-gray-100"
                size="icon"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold text-black">My Profile</h1>
            </div>
            {/* <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="border-[#004d84] text-[#004d84] hover:bg-[#004d84] hover:text-white rounded-none"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button> */}
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12">
        {/* Profile Header */}
        <ProfileHeader 
          user={user}
          stats={stats}
          onEditProfile={() => setIsEditModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#004d84] text-[#004d84]'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* Profile Tab */}
          {activeTab === 'profile' && <ProfileOverview user={user} />}

          {/* Orders Tab */}
          {activeTab === 'orders' && <OrdersTab orders={orders} />}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && <WishlistTab wishlist={wishlist} />}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <AddressManagement addresses={addresses} />
              <PaymentMethods paymentMethods={paymentMethods} />
              <SecuritySettings 
                twoFactorEnabled={twoFactorEnabled}
                onToggle2FA={() => setTwoFactorEnabled(!twoFactorEnabled)}
              />
              <NotificationPreferences
                emailNotifications={emailNotifications}
                orderUpdates={orderUpdates}
                promotionalEmails={promotionalEmails}
                onToggleEmail={() => setEmailNotifications(!emailNotifications)}
                onToggleOrders={() => setOrderUpdates(!orderUpdates)}
                onTogglePromotional={() => setPromotionalEmails(!promotionalEmails)}
              />
            </div>
          )}
        </div>
      </main>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} currentUser={user} />
    </div>
  );
};

export default ProfilePage;
