import React, { useState, useEffect } from 'react';
import EditProfileModal from '../../components/EditProfileModal';
import { Button } from '../../components/ui/button';
import DownloadButton from '../../components/DownloadButton';

interface UserProfile {
  email: string;
  username: string;
  lastName: string;
  bio: string;
  isBrand?: boolean;
  hero_image?: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Load user from localStorage (dreamx_user)
    const userData = localStorage.getItem('dreamx_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    // Listen for profile updates from modal or other tabs
    const onStorage = () => {
      const updated = localStorage.getItem('dreamx_user');
      setUser(updated ? JSON.parse(updated) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleEdit = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No Profile Found</h2>
          <p className="text-gray-600 mb-4">Please log in or sign up to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('dreamx_user');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg flex flex-col items-center">
        {user.hero_image && (
          <img
            src={user.hero_image}
            alt="Hero"
            className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-purple-200"
          />
        )}
        <h2 className="text-2xl font-bold mb-2">{user.username}</h2>
        <p className="text-gray-600 mb-1">{user.email}</p>
        <p className="text-gray-600 mb-1">{user.lastName}</p>
        <p className="text-gray-700 mt-2 mb-4 text-center">{user.bio}</p>
        {user.isBrand && (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs mb-2">Brand Account</span>
        )}
        <div className="flex gap-4 mt-4">
          <Button onClick={handleEdit} className="bg-purple-600 text-white hover:bg-purple-700 rounded-lg px-6 py-2">Edit Profile</Button>
          <Button onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600 rounded-lg px-6 py-2">Logout</Button>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-3">Data Export</h3>
          <p className="text-sm text-gray-600 mb-4">
            Download all your data including profile information, orders, and designs.
          </p>
          <DownloadButton
            type="user-data"
            variant="outline"
            className="w-full"
          >
            Download My Data
          </DownloadButton>
        </div>
      </div>
      <EditProfileModal isOpen={isModalOpen} onClose={handleClose} currentUser={user} />
    </div>
  );
};

export default ProfilePage;
