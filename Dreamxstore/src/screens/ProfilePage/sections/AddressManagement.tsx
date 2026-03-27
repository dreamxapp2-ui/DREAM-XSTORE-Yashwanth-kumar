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
      <Card className="border border-gray-100 rounded-3xl sm:rounded-[2.5rem] bg-white shadow-sm overflow-hidden">
        <CardContent className="p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 border-b border-gray-50 pb-4 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#bef264]/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              </div>
              <h2 className="text-lg sm:text-xl font-black italic uppercase tracking-tight">Shipping Access</h2>
            </div>
            <Button 
              className="w-full sm:w-auto bg-black text-[#bef264] hover:bg-black/90 text-[10px] sm:text-xs font-black uppercase italic rounded-full px-4 sm:px-6 py-2 sm:py-3 transition-all active:scale-95"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Address
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
          {addresses.length === 0 ? (
            <div className="col-span-full text-center py-10 bg-gray-50 rounded-2xl sm:rounded-[2rem] border-2 border-dashed border-gray-100 p-4">
              <MapPin className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-200" />
              <p className="text-sm sm:font-bold text-gray-400 italic">No storage coordinates found yet.</p>
              <p className="text-[10px] font-medium text-gray-300 uppercase tracking-widest mt-1">Configure your shipping destination</p>
            </div>
          ) : (
            addresses.map((address) => (
              <div key={address._id} className="bg-[#fcfcfc] border border-gray-100 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 hover:border-black transition-all group relative">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="font-black text-gray-900 uppercase italic text-sm">{address.name}</h3>
                      {address.isDefault && (
                        <span className="px-3 py-0.5 bg-black text-[#bef264] text-[9px] font-black rounded-full uppercase italic">
                          Primary
                        </span>
                      )}
                      <span className="px-3 py-0.5 bg-gray-100 text-gray-400 text-[9px] font-black rounded-full uppercase italic">
                        {address.type}
                      </span>
                    </div>
                    <div className="space-y-1">
                       <p className="text-xs font-bold text-gray-400">{address.phone}</p>
                       <p className="text-sm font-bold text-gray-600 leading-tight">
                         {address.addressLine1}{address.addressLine2 && `, ${address.addressLine2}`}
                       </p>
                       <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">
                         {address.city}, {address.state} {address.zipCode}
                       </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full h-8 w-8"
                      onClick={() => address._id && handleDelete(address._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {!address.isDefault && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[9px] font-black uppercase italic text-gray-400 hover:text-black p-0 h-auto"
                        onClick={() => address._id && handleSetDefault(address._id)}
                      >
                        Set Default
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>

    {/* Add Address Modal - REDESIGNED */}
    {showAddModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-2 sm:p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl sm:rounded-[3rem] w-full max-w-xl max-h-[95vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="bg-black p-6 sm:p-8 flex justify-between items-center">
            <h3 className="text-xl sm:text-2xl font-black text-[#bef264] italic uppercase">New Destination</h3>
            <button
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#bef264]/10 flex items-center justify-center text-[#bef264] hover:bg-[#bef264] hover:text-black transition-all"
              onClick={() => setShowAddModal(false)}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitAddress} className="p-6 sm:p-8 overflow-y-auto max-h-[calc(95vh-100px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address Type */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Configuration Type</label>
                <div className="flex gap-4">
                   {['shipping', 'billing'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({...formData, type: t as any})}
                        className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase italic border transition-all ${
                           formData.type === t ? 'bg-black text-[#bef264] border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-black'
                        }`}
                      >
                         {t}
                      </button>
                   ))}
                </div>
              </div>

              {/* Name */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Receiver Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#bef264] font-bold text-sm"
                  placeholder="IDENTITY"
                  required
                />
              </div>

              {/* Phone */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Contact Uplink</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#bef264] font-bold text-sm"
                  placeholder="+91 MOBILE"
                  required
                />
              </div>

              {/* Address Line 1 */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Primary Coordinates</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#bef264] font-bold text-sm"
                  placeholder="STREET / BUILDING"
                  required
                />
              </div>

              {/* City and State */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Sector / City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#bef264] font-bold text-sm"
                  placeholder="CITY"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Region / State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#bef264] font-bold text-sm"
                  placeholder="STATE"
                  required
                />
              </div>

              {/* Zip Code */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Index / Zip</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#bef264] font-bold text-sm"
                  placeholder="CODE"
                  required
                />
              </div>

              {/* Set as Default */}
              <div className="md:col-span-2 flex items-center gap-4 bg-gray-50 p-6 rounded-2xl">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="w-6 h-6 text-black border-none rounded-lg focus:ring-[#bef264] bg-white cursor-pointer"
                />
                <label htmlFor="isDefault" className="text-sm font-black uppercase italic text-gray-600 cursor-pointer">
                  Mark as Primary Destination
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 sm:mt-10">
               <Button
                 type="submit"
                 disabled={isSubmitting}
                 className="w-full h-14 sm:h-16 bg-[#bef264] text-black hover:bg-black hover:text-[#bef264] rounded-2xl font-black text-base sm:text-lg uppercase italic transition-all shadow-xl shadow-[#bef264]/20"
               >
                 {isSubmitting ? 'UPLOADING...' : 'CONFIRM COORDINATES'}
               </Button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
  );
};
