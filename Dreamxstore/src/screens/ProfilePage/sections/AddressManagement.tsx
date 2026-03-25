import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { MapPin, Plus, Trash2, X } from 'lucide-react';
import AddressService, { Address, AddAddressData } from '../../../lib/api/services/addressService';
import { useToast } from '../../../contexts/ToastContext';

export const AddressManagement: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState<AddAddressData>({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    type: 'shipping',
    isDefault: false
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const addressList = await AddressService.getAddresses();
      setAddresses(addressList);
    } catch (error: any) {
      console.error('[AddressManagement] Error loading addresses:', error);
      showToast(error.message || 'Failed to load addresses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const updatedAddresses = await AddressService.deleteAddress(addressId);
      setAddresses(updatedAddresses);
      showToast('Address deleted successfully', 'success');
    } catch (error: any) {
      console.error('[AddressManagement] Error deleting address:', error);
      showToast(error.message || 'Failed to delete address', 'error');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const updatedAddresses = await AddressService.setDefaultAddress(addressId);
      setAddresses(updatedAddresses);
      showToast('Default address updated', 'success');
    } catch (error: any) {
      console.error('[AddressManagement] Error setting default:', error);
      showToast(error.message || 'Failed to set default address', 'error');
    }
  };

  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.zipCode) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedAddresses = await AddressService.addAddress(formData);
      setAddresses(updatedAddresses);
      showToast('Address added successfully', 'success');
      setShowAddModal(false);
      // Reset form
      setFormData({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        type: 'shipping',
        isDefault: false
      });
    } catch (error: any) {
      console.error('[AddressManagement] Error adding address:', error);
      showToast(error.message || 'Failed to add address', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <Card className="border border-gray-200 rounded-[1px]">
        <CardContent className="p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <>
      <Card className="border border-gray-200 rounded-[1px]">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#004d84]" />
              <h2 className="text-xl font-semibold text-black">Address Management</h2>
            </div>
            <Button 
              className="bg-[#004d84] hover:bg-[#003d6a] text-sm rounded-none"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </div>

        <div className="space-y-3">
          {addresses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No addresses saved yet</p>
              <p className="text-sm">Add an address to get started</p>
            </div>
          ) : (
            addresses.map((address) => (
              <div key={address._id} className="border border-gray-200 rounded-[1px] p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-black">{address.name}</h3>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-[#f1ff8c] text-[#004d84] text-xs rounded-full font-medium border border-black">
                          Default
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                    <p className="text-sm text-gray-700 mt-1">
                      {address.addressLine1}{address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    <p className="text-sm text-gray-700">
                      {address.city}, {address.state} {address.zipCode}, {address.country}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!address.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs rounded-none"
                        onClick={() => address._id && handleSetDefault(address._id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 rounded-none"
                      onClick={() => address._id && handleDelete(address._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>

    {/* Add Address Modal */}
    {showAddModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[1px] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-black">Add New Address</h3>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-none"
              onClick={() => setShowAddModal(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmitAddress} className="p-6">
            <div className="space-y-4">
              {/* Address Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84]"
                  required
                >
                  <option value="shipping">Shipping</option>
                  <option value="billing">Billing</option>
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84]"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84]"
                  placeholder="+91 1234567890"
                  required
                />
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84]"
                  placeholder="123 Main Street"
                  required
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84]"
                  placeholder="Apartment, suite, etc."
                />
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84]"
                    placeholder="Mumbai"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84]"
                    placeholder="Maharashtra"
                    required
                  />
                </div>
              </div>

              {/* Zip Code and Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84]"
                    placeholder="400001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-[1px] focus:outline-none focus:ring-2 focus:ring-[#004d84]"
                    placeholder="India"
                    required
                  />
                </div>
              </div>

              {/* Set as Default */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#004d84] border-gray-300 rounded focus:ring-[#004d84]"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                  Set as default address
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-none"
                onClick={() => setShowAddModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#004d84] hover:bg-[#003d6a] rounded-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Address'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
  );
};
