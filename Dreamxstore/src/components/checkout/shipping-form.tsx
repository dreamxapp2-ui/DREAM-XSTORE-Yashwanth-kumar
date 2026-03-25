'use client';

import { useState, useEffect } from 'react';

interface ShippingFormProps {
  onContinue: (data: any) => void;
  initialData?: any;
}

export default function ShippingForm({ onContinue, initialData }: ShippingFormProps) {
  const [formData, setFormData] = useState(initialData || {
    firstName: '',
    lastName: '',
    country: 'IN India (INR)',
    address: '',
    city: '',
    state: 'Select State',
    postalCode: '',
    phone: '',
    useBillingAddress: true,
  });

  useEffect(() => {
    // If no initialData is explicitly given (like returning from payment step), try to load from localStorage
    if (!initialData || Object.keys(initialData).length === 0) {
      const saved = localStorage.getItem('dreamx_saved_shipping_address');
      if (saved) {
        try {
          setFormData(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved shipping address', e);
        }
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Save address for future checkout sessions
    localStorage.setItem('dreamx_saved_shipping_address', JSON.stringify(formData));
    onContinue(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg">
      {/* Shipping Information */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h2>

        {/* First Name and Last Name */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Doe"
            />
          </div>
        </div>

        {/* Country/Region */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country/Region
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>IN India (INR)</option>
            <option>US United States (USD)</option>
            <option>UK United Kingdom (GBP)</option>
          </select>
        </div>

        {/* Address */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123 Main Street, Apartment 4B"
          />
        </div>
        <button type="button" className="text-blue-600 text-sm font-medium hover:text-blue-700 mb-6">
          Add another line
        </button>

        {/* City, State, Postal Code */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mumbai"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Select State</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Assam">Assam</option>
              <option value="Bihar">Bihar</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Goa">Goa</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Manipur">Manipur</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Odisha">Odisha</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Tripura">Tripura</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
              <option value="Delhi">Delhi</option>
              <option value="Jammu and Kashmir">Jammu and Kashmir</option>
              <option value="Ladakh">Ladakh</option>
              <option value="Lakshadweep">Lakshadweep</option>
              <option value="Puducherry">Puducherry</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="400001"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+91 98765 43210"
          />
        </div>

        {/* Checkbox */}
        <div className="flex items-center gap-3 mb-8">
          <input
            type="checkbox"
            name="useBillingAddress"
            checked={formData.useBillingAddress}
            onChange={handleChange}
            className="w-5 h-5 rounded cursor-pointer accent-green-600"
          />
          <label className="text-sm font-medium text-gray-700 cursor-pointer">
            Use as billing address
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button type="button" className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium">
          Previous
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
