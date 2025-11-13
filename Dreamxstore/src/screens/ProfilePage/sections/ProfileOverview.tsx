import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';

interface UserProfile {
  email: string;
  username: string;
  phone?: string;
  role?:string;
}

interface ProfileOverviewProps {
  user: UserProfile;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 rounded-[1px]">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Account Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Username:</span>
              <span className="font-medium text-black">{user.username}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-black">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-black">{user.phone}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Account Type:</span>
              <span className="font-medium text-black">{user.role}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
