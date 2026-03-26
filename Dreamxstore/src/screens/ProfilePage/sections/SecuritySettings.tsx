import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Shield } from 'lucide-react';

interface SecuritySettingsProps {
  twoFactorEnabled: boolean;
  onToggle2FA: () => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ twoFactorEnabled, onToggle2FA }) => {
  return (
    <Card className="border border-gray-100 rounded-[2.5rem] bg-white shadow-sm">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-6">
          <div className="w-10 h-10 rounded-full bg-[#bef264]/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <h2 className="text-xl font-black italic uppercase tracking-tight text-black">Security Protocol</h2>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center py-4 border-b border-gray-50">
            <div>
              <p className="font-black text-gray-900 uppercase italic text-sm">Change Password</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Update account access key</p>
            </div>
            <Button variant="outline" className="rounded-full border-black text-black hover:bg-black hover:text-[#bef264] px-6 text-[10px] font-black uppercase italic">
              Modify
            </Button>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-gray-50">
            <div>
              <p className="font-black text-gray-900 uppercase italic text-sm">Linked Email</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Primary communication uplink</p>
            </div>
            <Button variant="outline" className="rounded-full border-black text-black hover:bg-black hover:text-[#bef264] px-6 text-[10px] font-black uppercase italic">
              Update
            </Button>
          </div>

          <div className="flex justify-between items-center py-4">
            <div>
              <p className="font-black text-gray-900 uppercase italic text-sm">Two-Factor Auth</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Multi-layer defense system</p>
            </div>
            <Button 
              variant={twoFactorEnabled ? "default" : "outline"}
              className={twoFactorEnabled 
                ? 'bg-[#bef264] text-black hover:bg-black hover:text-[#bef264] rounded-full px-6 text-[10px] font-black uppercase italic border-none' 
                : 'rounded-full border-black text-black hover:bg-black hover:text-[#bef264] px-6 text-[10px] font-black uppercase italic'
              }
              onClick={onToggle2FA}
            >
              {twoFactorEnabled ? 'Active' : 'Deploy'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
