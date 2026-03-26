import { useState, useEffect, useRef } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { Button } from './ui/button';
import { UserService } from '../lib/api/services/userService';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    email: string;
    username: string;
    lastName?: string;
    bio?: string;
    isBrand?: boolean;
    hero_image?: string | { url: string; publicId: string };
    profilePicture?: string;
    phone?: string;
    firstName?: string;
    displayName?: string;
  };
  onUpdateSuccess?: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, currentUser, onUpdateSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const getImageUrl = (img: any) => typeof img === 'string' ? img : img?.url || '';
  
  const [profileImage, setProfileImage] = useState<string>(getImageUrl(currentUser?.hero_image) || currentUser?.profilePicture || '');
  const [imagePreview, setImagePreview] = useState<string>(getImageUrl(currentUser?.hero_image) || currentUser?.profilePicture || '');
  const [formData, setFormData] = useState({
    email: currentUser?.email || '',
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    displayName: currentUser?.displayName || currentUser?.username || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Update formData when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        email: currentUser.email || '',
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        displayName: currentUser.displayName || currentUser.username || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
      });
      setProfileImage(getImageUrl(currentUser.hero_image) || currentUser.profilePicture || '');
      setImagePreview(getImageUrl(currentUser.hero_image) || currentUser.profilePicture || '');
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      let heroImageUrl = getImageUrl(currentUser?.hero_image) || '';
      let heroImagePublicId = '';

      // Upload image to Cloudinary if a new file was selected
      if (imageFile) {
        setUploading(true);
        try {
          const uploadResponse = await UserService.uploadProfileImage(
            [imageFile],
            (progress: number) => setUploadProgress(progress)
          );
          heroImageUrl = uploadResponse[0]?.url || '';
          heroImagePublicId = uploadResponse[0]?.publicId || '';
          console.log('[EditProfileModal] Image uploaded:', { url: heroImageUrl, publicId: heroImagePublicId });
        } catch (uploadErr: any) {
          console.error('[EditProfileModal] Image upload failed:', uploadErr);
          setError('Failed to upload profile image');
          setUploading(false);
          return;
        }
      }

      // Prepare profile update data
      const profileUpdateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.displayName,
        phone: formData.phone,
        bio: formData.bio,
        ...(heroImageUrl && {
          hero_image: {
            url: heroImageUrl,
            publicId: heroImagePublicId
          }
        })
      };

      console.log('[EditProfileModal] Updating profile with data:', profileUpdateData);

      // Call API to update user profile
      const response = await UserService.updateProfile(profileUpdateData);
      console.log('[EditProfileModal] Update response:', response);

      // Update localStorage with new data
      const updatedUser = {
        ...currentUser,
        ...formData,
        username: formData.displayName,
        hero_image: heroImageUrl
      };
      localStorage.setItem('dreamx_user', JSON.stringify(updatedUser));
      
      setSuccess('Profile updated successfully!');
      window.dispatchEvent(new Event('storage'));
      
      // Notify parent to refresh data
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }

      setTimeout(() => {
        setSuccess('');
        setUploading(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('[EditProfileModal] Update error:', err);
      setError(err?.message || 'Failed to update profile');
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[1px] p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl text-black font-semibold mb-6">Edit Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Picture Uploader */}
          <div className="flex flex-col items-center pb-4 border-b border-gray-200">
            <div className="relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#f1ff8c]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#f1ff8c] flex items-center justify-center border-4 border-black">
                  <span className="text-4xl font-bold text-[#004d84]">
                    {formData.firstName?.charAt(0).toUpperCase() || formData.displayName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-[#004d84] text-white p-2 rounded-full hover:bg-[#003d6a]"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
        <p className="text-sm text-gray-600 mt-2">Click camera icon to upload (Image will be uploaded to Cloudinary)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84] text-black"
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84] text-black"
                placeholder="Enter last name"
              />
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84] text-black"
              placeholder="How should we display your name?"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84] text-black"
              placeholder="+91 1234567890"
            />
          </div>

          {/* Email (Read-only with Change button) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-[1px] bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <Button
                type="button"
                variant="outline"
                className="border-[#004d84] text-[#004d84] hover:bg-[#004d84] hover:text-white rounded-none h-auto"
                onClick={() => alert('Email change functionality coming soon!')}
              >
                Change
              </Button>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              maxLength={300}
              className="w-full px-3 py-2 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84] text-black resize-none"
              placeholder="Tell us about yourself..."
            />
            <div className="text-xs text-gray-500 text-right mt-1">
              {formData.bio.length}/300 characters
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[1px]">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-[1px]">
              {success}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#004d84] hover:bg-[#003d6a] text-white rounded-none"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
