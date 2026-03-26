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
    <Card className="border border-gray-100 rounded-[2.5rem] bg-white shadow-sm overflow-hidden">
      <CardContent className="p-8">
        <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#bef264]/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-black" />
             </div>
             <h2 className="text-xl font-black italic uppercase tracking-tight text-black">Secured Assets</h2>
          </div>
          <Button className="bg-black text-[#bef264] hover:bg-black/90 text-xs font-black uppercase italic rounded-full px-6 py-3 transition-all active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            New Card
          </Button>
        </div>

        <div className="space-y-4">
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8 text-gray-400 font-bold italic">No payment assets linked.</div>
          ) : (
            paymentMethods.map((method) => (
              <div key={method.id} className="bg-[#fcfcfc] border border-gray-100 rounded-[2rem] p-6 hover:border-black transition-all group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-10 bg-black rounded-xl flex items-center justify-center border-2 border-[#bef264]/20 group-hover:border-[#bef264] transition-all">
                      <CreditCard className="w-6 h-6 text-[#bef264]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-gray-900 uppercase italic text-sm">
                          {method.type === 'card' 
                            ? `${method.cardBrand} •••• ${method.lastFour}` 
                            : method.walletName
                          }
                        </span>
                        {method.isDefault && (
                          <span className="px-3 py-0.5 bg-[#bef264] text-black text-[9px] font-black rounded-full uppercase italic">
                            Primary
                          </span>
                        )}
                      </div>
                      {method.type === 'card' && (
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expires {method.expiryDate}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase italic text-gray-400 hover:text-black">
                        Set Primary
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full">
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
  );
};
