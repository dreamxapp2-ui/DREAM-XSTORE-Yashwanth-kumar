"use client";

import React, { useState, useEffect } from "react";
import { User, Package, Settings, Heart, ArrowLeft, LogOut, Calendar, MapPin, CreditCard, Bell, Shield, Edit3, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { UserService } from "../../lib/api/services/userService";
import UserOrderService from "../../lib/api/services/orderService";
import EditProfileModal from "../../components/EditProfileModal";
import {
  OrdersTab,
  WishlistTab,
  AddressManagement,
  PaymentMethods,
  SecuritySettings,
  NotificationPreferences
} from "./sections";
import { useToast } from "../../contexts/ToastContext";

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
  profilePicture?: string;
  name?: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistItems: 0,
    totalSpent: 0,
    memberSince: "Jan 2024",
  });
  const { showToast } = useToast();

  const loadProfileData = async () => {
    try {
      const response = await UserService.getProfile();
      const profile = (response as any)?.user || response;
      setUser(profile);
      
      const memberDate = profile.createdAt 
        ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : "Jan 2024";

         let wishlistItems: any[] = [];
         let statsData: any = { data: { totalOrders: 0, totalSpend: 0 } };

         try {
            wishlistItems = await UserService.getWishlist();
         } catch (error) {
            console.warn("Wishlist load skipped:", error);
         }

         try {
            statsData = await UserOrderService.getOrderStats();
         } catch (error) {
            console.warn("Order stats load skipped:", error);
         }

      setStats({
        totalOrders: statsData.data?.totalOrders || 0,
        wishlistItems: wishlistItems.length,
        totalSpent: statsData.data?.totalSpend || 0,
        memberSince: memberDate
      });
    } catch (error) {
      console.error("Profile load error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] pb-10 sm:pb-20">
      {/* 1. MODERN HEADER */}
      <div className="bg-white border-b border-gray-100 z-50 sticky top-0">
         <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button onClick={() => window.location.href = '/home'} className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
               </button>
               <h1 className="text-xl font-black italic uppercase tracking-tight">Account</h1>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-black text-red-500 uppercase italic hover:bg-red-50 px-4 py-2 rounded-full transition-colors">
               <LogOut className="w-4 h-4" />
               Log out
            </button>
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* 2. SIDEBAR - Profile Overview */}
          <div className="w-full lg:w-1/3 sticky lg:top-32">
             <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-gray-100 space-y-8">
                {/* Profile Meta */}
                <div className="flex flex-col items-center text-center space-y-4">
                   <div className="relative group">
                      <div className="w-32 h-32 rounded-full border-4 border-[#bef264] p-1 overflow-hidden transition-transform group-hover:scale-105">
                         <img 
                           src={(user as any).hero_image?.url || user.profilePicture || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200"} 
                           className="w-full h-full object-cover rounded-full" 
                           alt="Profile" 
                         />
                      </div>
                      <button onClick={() => setIsEditModalOpen(true)} className="absolute bottom-0 right-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center border-4 border-white active:scale-95 transition-all">
                         <Edit3 className="w-4 h-4" />
                      </button>
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-gray-900">{user.name || user.username}</h2>
                      <p className="text-sm font-bold text-gray-400">{user.email}</p>
                   </div>
                   <div className="px-4 py-1 bg-[#bef264]/20 text-[#bef264] text-[10px] font-black rounded-full uppercase italic">
                      {user.role || 'Elite Member'}
                   </div>
                </div>

                {/* Account Stats */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#f8f8f8] p-3 sm:p-4 rounded-2xl flex flex-col">
                       <span className="text-xl sm:text-2xl font-black text-gray-900">{stats.totalOrders}</span>
                       <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Orders</span>
                    </div>
                    <div className="bg-[#f8f8f8] p-3 sm:p-4 rounded-2xl flex flex-col">
                       <span className="text-xl sm:text-2xl font-black text-gray-900">{stats.wishlistItems}</span>
                       <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Wishlisted</span>
                    </div>
                 </div>

                {/* Sub Meta */}
                <div className="space-y-4 pt-4 border-t border-gray-50">
                   <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                      <Calendar className="w-4 h-4 text-[#bef264]" />
                      Joined {stats.memberSince}
                   </div>
                   {user.phone && (
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                        <MapPin className="w-4 h-4 text-[#bef264]" />
                        {user.phone}
                      </div>
                   )}
                </div>
             </div>
          </div>

          {/* 3. MAIN CONTENT - Tabs & Views */}
          <div className="w-full lg:w-2/3 space-y-8">
             {/* Navigation Tabs */}
             <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { id: 'profile', icon: User, label: 'Overview' },
                  { id: 'orders', icon: Package, label: 'My Orders' },
                  { id: 'settings', icon: Settings, label: 'Preferences' }
                ].map((tab) => (
                   <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase italic transition-all whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'bg-black text-[#bef264] shadow-xl' 
                        : 'bg-white text-gray-400 hover:text-black border border-gray-100 hover:border-black'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    {tab.label}
                  </button>
                ))}
             </div>

             {/* Dynamic Content Views */}
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {activeTab === 'profile' && (
                  <div className="space-y-6">
                     <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg sm:text-xl font-black mb-4 sm:mb-6 italic uppercase underline underline-offset-8 decoration-[#bef264]">Personal Story</h3>
                        <p className="text-gray-600 font-bold leading-relaxed italic">
                           {user.bio || "No biography provided yet. Start your story with DREAM-X."}
                        </p>
                     </div>
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-[#bef264] p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] flex flex-col justify-between aspect-square group cursor-pointer hover:rotate-1 transition-transform">
                           <div>
                              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-black mb-4 group-hover:scale-110 transition-transform" />
                              <h4 className="text-xl sm:text-2xl font-black text-black leading-tight">TRACK YOUR<br/>VIBES.</h4>
                           </div>
                           <button onClick={() => setActiveTab('orders')} className="flex items-center gap-2 text-[10px] sm:text-xs font-black text-black/60 uppercase italic group-hover:text-black">
                              View all orders <ChevronRight className="w-4 h-4" />
                           </button>
                        </div>
                        <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] flex flex-col justify-between aspect-square group cursor-pointer hover:-rotate-1 transition-transform">
                           <div>
                              <Settings className="w-10 h-10 sm:w-12 sm:h-12 text-[#bef264] mb-4 group-hover:scale-110 transition-transform" />
                              <h4 className="text-xl sm:text-2xl font-black text-black leading-tight">IDENTITY<br/>TUNING.</h4>
                           </div>
                           <button onClick={() => setActiveTab('settings')} className="flex items-center gap-2 text-[10px] sm:text-xs font-black text-black/60 uppercase italic group-hover:text-black">
                              Adjust settings <ChevronRight className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="bg-white rounded-[2.5rem] p-4 lg:p-8 border border-gray-100 shadow-sm">
                     <OrdersTab />
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-8">
                     <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-black mb-6 italic uppercase">Shipping Access</h3>
                        <AddressManagement />
                     </div>
                     <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-black mb-6 italic uppercase">Secured Assets</h3>
                        <PaymentMethods paymentMethods={[]} />
                     </div>
                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                           <SecuritySettings 
                             twoFactorEnabled={false}
                             onToggle2FA={() => {}}
                           />
                        </div>
                        <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                           <NotificationPreferences
                             emailNotifications={true}
                             orderUpdates={true}
                             promotionalEmails={false}
                             onToggleEmail={() => {}}
                             onToggleOrders={() => {}}
                             onTogglePromotional={() => {}}
                           />
                        </div>
                     </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        currentUser={user as any}
        onUpdateSuccess={loadProfileData}
      />
    </div>
  );
};

export default ProfilePage;
