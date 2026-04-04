import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Edit2, Calendar, ShoppingBag, Heart, DollarSign, User } from 'lucide-react';

interface UserProfile {
  email: string;
  username: string;
  lastName?: string;
  bio?: string;
  isBrand?: boolean;
  role?:string;
  hero_image?: string;
  phone?: string;
  joinedDate?: string;
}

interface Stats {
  totalOrders: number;
  wishlistItems: number;
  totalSpent: number;
  memberSince: string;
}

interface ProfileHeaderProps {
  user: UserProfile;
  stats: Stats;
  onEditProfile: () => void;
  onLogout: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, stats, onEditProfile, onLogout }) => {
  return (
    <Card className="border border-gray-200 rounded-[1px] shadow-lg mb-8">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {(user.hero_image || (user as any).profilePicture) ? (
              <img
                src={user.hero_image || (user as any).profilePicture}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#f1ff8c]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#f1ff8c] flex items-center justify-center border-4 border-black">
                <span className="text-4xl font-bold text-[#004d84]">
                  {(user.username || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-medium text-black">{user.username}</h1>
              {user.isBrand && (
                <span className="px-3 py-1 bg-[#f1ff8c] text-[#004d84] rounded-full text-xs font-medium border border-black">
                  Brand Account
                </span>
              )}
            </div>
            <p className="text-gray-600">{user.email}</p>
            {user.bio && <p className="text-gray-700 mt-2">{user.bio}</p>}
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <Calendar className="w-4 h-4" />
              <span>Member since {new Date(user.joinedDate || stats.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={onEditProfile}
              className="bg-[#004d84] hover:bg-[#003d6a] text-white rounded-none"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button 
              onClick={onLogout}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50 rounded-none"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ShoppingBag className="w-5 h-5 text-[#004d84]" />
              <span className="text-xl font-bold text-black">{stats.totalOrders}</span>
            </div>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-xl font-bold text-black">{stats.wishlistItems}</span>
            </div>
            <p className="text-sm text-gray-600">Wishlist Items</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-xl font-bold text-black">₹{stats.totalSpent.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <User className="w-5 h-5 text-[#004d84]" />
              <span className="text-lg font-semibold text-black">{user.role}</span>
            </div>
            <p className="text-sm text-gray-600">Account Type</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
