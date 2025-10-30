import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Bell, Mail, Package } from 'lucide-react';

interface NotificationPreferencesProps {
  emailNotifications: boolean;
  orderUpdates: boolean;
  promotionalEmails: boolean;
  onToggleEmail: () => void;
  onToggleOrders: () => void;
  onTogglePromotional: () => void;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  emailNotifications,
  orderUpdates,
  promotionalEmails,
  onToggleEmail,
  onToggleOrders,
  onTogglePromotional
}) => {
  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-[#004d84]' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <Card className="border border-gray-200 rounded-[1px]">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-[#004d84]" />
          <h2 className="text-xl font-semibold text-black">Notifications & Preferences</h2>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-black">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive important updates via email</p>
              </div>
            </div>
            <ToggleSwitch enabled={emailNotifications} onToggle={onToggleEmail} />
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-black">Order Updates</p>
                <p className="text-sm text-gray-600">Notifications about your orders</p>
              </div>
            </div>
            <ToggleSwitch enabled={orderUpdates} onToggle={onToggleOrders} />
          </div>

          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-black">Promotional Emails</p>
                <p className="text-sm text-gray-600">Deals, offers, and newsletters</p>
              </div>
            </div>
            <ToggleSwitch enabled={promotionalEmails} onToggle={onTogglePromotional} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
