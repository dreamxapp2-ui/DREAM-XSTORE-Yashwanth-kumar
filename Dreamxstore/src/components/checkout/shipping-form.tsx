'use client';

import { useState } from 'react';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
              <option>Select State</option>
              <option>Maharashtra</option>
              <option>Karnataka</option>
              <option>Tamil Nadu</option>
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
