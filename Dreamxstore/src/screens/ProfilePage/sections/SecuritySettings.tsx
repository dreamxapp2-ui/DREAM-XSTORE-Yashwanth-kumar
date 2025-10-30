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
    <Card className="border border-gray-200 rounded-[1px]">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-[#004d84]" />
          <h2 className="text-xl font-semibold text-black">Security</h2>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-black">Change Password</p>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
            <Button variant="outline" className="rounded-none">
              Change
            </Button>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-black">Change Email</p>
              <p className="text-sm text-gray-600">Update your login email address</p>
            </div>
            <Button variant="outline" className="rounded-none">
              Update
            </Button>
          </div>

          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-medium text-black">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add extra security to your account</p>
            </div>
            <Button 
              variant={twoFactorEnabled ? "default" : "outline"}
              className={twoFactorEnabled ? 'bg-green-600 hover:bg-green-700 rounded-none' : 'rounded-none'}
              onClick={onToggle2FA}
            >
              {twoFactorEnabled ? 'Enabled' : 'Enable'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
