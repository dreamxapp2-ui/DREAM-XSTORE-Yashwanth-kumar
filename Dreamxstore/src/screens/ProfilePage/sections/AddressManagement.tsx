import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';

interface Address {
  id: string;
  type: 'shipping' | 'billing';
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressManagementProps {
  addresses: Address[];
}

export const AddressManagement: React.FC<AddressManagementProps> = ({ addresses }) => {
  return (
    <Card className="border border-gray-200 rounded-[1px]">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#004d84]" />
            <h2 className="text-xl font-semibold text-black">Address Management</h2>
          </div>
          <Button className="bg-[#004d84] hover:bg-[#003d6a] text-sm rounded-none">
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
        </div>

        <div className="space-y-3">
          {addresses.map((address) => (
            <div key={address.id} className="border border-gray-200 rounded-[1px] p-4">
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
                  <Button variant="ghost" size="icon" className="text-[#004d84] rounded-none">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 rounded-none">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
