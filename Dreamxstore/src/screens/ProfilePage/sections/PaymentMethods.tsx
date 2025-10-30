import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { CreditCard, Plus, Trash2 } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet';
  lastFour?: string;
  cardBrand?: string;
  expiryDate?: string;
  walletName?: string;
  isDefault: boolean;
}

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[];
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({ paymentMethods }) => {
  return (
    <Card className="border border-gray-200 rounded-[1px]">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#004d84]" />
            <h2 className="text-xl font-semibold text-black">Payment Methods</h2>
          </div>
          <Button className="bg-[#004d84] hover:bg-[#003d6a] text-sm rounded-none">
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>

        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className="border border-gray-200 rounded-[1px] p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-[#004d84] to-[#003d6a] rounded flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-black">
                        {method.type === 'card' 
                          ? `${method.cardBrand} •••• ${method.lastFour}` 
                          : method.walletName
                        }
                      </span>
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-[#f1ff8c] text-[#004d84] text-xs rounded-full font-medium border border-black">
                          Default
                        </span>
                      )}
                    </div>
                    {method.type === 'card' && (
                      <p className="text-sm text-gray-600">Expires {method.expiryDate}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!method.isDefault && (
                    <Button variant="outline" size="sm" className="text-xs rounded-none">
                      Set Default
                    </Button>
                  )}
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
