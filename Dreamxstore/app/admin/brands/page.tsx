'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit2, Trash2, Plus, X } from 'lucide-react';
import { AdminService } from '@/src/lib/api/admin/adminService';
import { useToast } from '@/src/contexts/ToastContext';

interface Brand {
  id: string;
  name: string;
  ownerEmail: string;
  location: string;
  status: string;
  productCount: number;
  commissionRate: number;
  createdAt: string;
}

export default function BrandAccountsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 0 });
  const [formData, setFormData] = useState({
    brandName: '',
    ownerEmail: '',
    password: '',
    confirmPassword: '',
    pickupLocation: '',
    pincode: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
  });
  const { showToast } = useToast();

  useEffect(() => {
    console.log('[BrandsPage] Component mounted');
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      console.log('Loading brands from API...');
      const response = await AdminService.getBrands({ page: pagination.page });
      console.log('Raw API Response:', response);
      
      let brandsData: Brand[] = [];
      let paginationData: any = null;
      
      if (Array.isArray(response)) {
        brandsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        brandsData = response.data;
        paginationData = response.pagination;
      } else if (response?.data && !Array.isArray(response.data)) {
        brandsData = [response.data];
      }
      
      console.log('Extracted brands:', brandsData);
      setBrands(brandsData);
      
      if (paginationData) {
        setPagination(paginationData);
      }
      
      showToast('Brands loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to load brands:', error);
      setBrands([]);
      showToast('Failed to load brands', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    
    try {
      const brandData = {
        brandName: formData.brandName,
        ownerEmail: formData.ownerEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        pickupLocation: formData.pickupLocation,
        pincode: formData.pincode,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
      } as any;
      
      const response = await AdminService.createBrand(brandData);
      if (response) {
        showToast('Brand account created successfully!', 'success');
        closeModal();
        loadBrands();
      }
    } catch (error) {
      console.error('Error creating brand:', error);
      showToast('Error creating brand account. Please try again.', 'error');
    }
  };

  const handleViewBrand = async (brandId: string) => {
    try {
      console.log('[handleViewBrand] Fetching brand:', brandId);
      const brand = await AdminService.getBrandById(brandId);
      console.log('[handleViewBrand] Brand response:', brand);
      const data = (brand as any).data || brand;
      showToast(`Brand: ${data.brandName}\nEmail: ${data.ownerEmail}\nStatus: ${data.status}`, 'info');
    } catch (error) {
      console.error('Error fetching brand:', error);
      showToast('Failed to fetch brand details: ' + (error as any)?.message, 'error');
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (!window.confirm('Are you sure you want to delete this brand account?')) {
      return;
    }

    try {
      await AdminService.deleteBrand(brandId);
      showToast('Brand deleted successfully!', 'success');
      loadBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      showToast('Failed to delete brand', 'error');
    }
  };

  const handleUpdateStatus = async (brandId: string, newStatus: string) => {
    try {
      await AdminService.updateBrandStatus(brandId, newStatus as any);
      showToast(`Brand status updated to ${newStatus}!`, 'success');
      loadBrands();
    } catch (error) {
      console.error('Error updating brand status:', error);
      showToast('Failed to update brand status', 'error');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      brandName: '',
      ownerEmail: '',
      password: '',
      confirmPassword: '',
      pickupLocation: '',
      pincode: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
    });
  };

  const filteredBrands = brands.filter((brand) => 
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="p-6">
      <div className={`bg-white rounded-lg shadow ${isModalOpen ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Title and Add Button */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Brand Accounts</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded"
          >
            <Plus size={20} />
            Add Brand Account
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 px-6 py-4 border-b border-gray-200">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded text-gray-700 hover:bg-gray-50">
            <Filter size={20} />
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Brand Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Owner Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading brands...
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No brands found
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand, index) => (
                  <tr key={brand.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{brand.ownerEmail}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{brand.location}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded ${
                          brand.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {brand.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(brand.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewBrand(brand.id)}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            const newStatus = brand.status === 'Active' ? 'Suspended' : 'Active';
                            handleUpdateStatus(brand.id, newStatus);
                          }}
                          className="text-gray-500 hover:text-purple-600 transition-colors"
                          title="Upgrade/Downgrade"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteBrand(brand.id)}
                          className="text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Backdrop */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 pt-20 ">
          {/* Modal */}
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 p-8 relative max-h-[90vh] overflow-y-auto z-50 pointer-events-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Brand Account</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="space-y-6">
              {/* Brand Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter brand name"
                    required
                  />
                </div>
              </div>

              {/* Account Details */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Owner Email *</label>
                    <input
                      type="email"
                      name="ownerEmail"
                      value={formData.ownerEmail}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter owner email"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter password"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Confirm password"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location Name *</label>
                      <input
                        type="text"
                        name="pickupLocation"
                        value={formData.pickupLocation}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter pickup location"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter pincode"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter full address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter city"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter state"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  Add Brand Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}