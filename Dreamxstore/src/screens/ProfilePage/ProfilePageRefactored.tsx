"use client";

import React, { useState, useEffect } from 'react';
import EditProfileModal from '../../components/EditProfileModal';
import { Card, CardContent } from '../../components/ui/card';
import { User, Package, Settings, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { UserService } from '../../lib/api/services/userService';
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
  firstName?: string;
  id?: string;
  role?: string;
  createdAt?: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'settings'>('profile');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Mock data - replace with actual API calls
  const [addresses] = useState<Array<Record<string, unknown>>>([
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

  const [paymentMethods] = useState<Array<Record<string, unknown>>>([
    {
      id: '1',
      type: 'card',
      lastFour: '4242',
      cardBrand: 'Visa',
      expiryDate: '12/25',
      isDefault: true
    }
  ]);

  const [orders] = useState<Array<Record<string, unknown>>>([
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

  const [wishlist] = useState<Array<Record<string, unknown>>>([]);

  const [stats, setStats] = useState({
    totalOrders: 12,
    wishlistItems: 6,
    totalSpent: 24999,
    memberSince: '2024-01-15'
  });

  // Settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Fetch user profile from API
        const response = await UserService.getProfile();
        console.log('[Profile] Raw API Response:', response);
        
        // The API response is { success: true, user: {...} }
        const profile = (response as any)?.user || response;
        console.log('[Profile] Extracted profile:', profile);
        console.log('[Profile] Username:', profile.username);
        console.log('[Profile] Email:', profile.email);
        console.log('[Profile] Hero image:', profile.hero_image);
        
        const heroImageUrl = typeof profile.hero_image === 'string' ? profile.hero_image : profile.hero_image?.url;
        const userDataToSet = {
          ...profile,
          hero_image: heroImageUrl,
          username: profile.username || '',
          email: profile.email || '',
          phone: profile.phone || '',
          role: profile.role || '',
          joinedDate: profile.createdAt || '2024-01-15'
        };
        console.log('[Profile] User data to set:', userDataToSet);
        setUser(userDataToSet);

        // Fetch wishlist
        const wishlistItems = await UserService.getWishlist();
        const memberSince = profile.createdAt ? new Date(profile.createdAt).toISOString().split('T')[0] : '2024-01-15';
        
        setStats({
          totalOrders: 12,
          wishlistItems: wishlistItems.length,
          totalSpent: 24999,
          memberSince: memberSince
        });
      } catch (error) {
        console.error('[Profile] Error loading profile:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('dreamx_user');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/login';
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004d84] mx-auto"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

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
          {activeTab === 'orders' && (
            // @ts-ignore - mock data
            <OrdersTab orders={orders} />
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && <WishlistTab wishlist={wishlist} />}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* @ts-ignore - mock data */}
              <AddressManagement addresses={addresses as any} />
              {/* @ts-ignore - mock data */}
              <PaymentMethods paymentMethods={paymentMethods as any} />
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
