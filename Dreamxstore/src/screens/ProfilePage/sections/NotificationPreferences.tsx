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
        enabled ? 'bg-[#bef264]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
          enabled ? 'translate-x-6 bg-black' : 'translate-x-1 bg-white shadow-sm'
        }`}
      />
    </button>
  );

  return (
    <Card className="border border-gray-100 rounded-[2.5rem] bg-white shadow-sm">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-6">
          <div className="w-10 h-10 rounded-full bg-[#bef264]/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-black" />
          </div>
          <h2 className="text-xl font-black italic uppercase tracking-tight text-black">Communications</h2>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center py-4 border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="font-black text-gray-900 uppercase italic text-sm">System Reports</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Primary email notifications</p>
              </div>
            </div>
            <ToggleSwitch enabled={emailNotifications} onToggle={onToggleEmail} />
          </div>

          <div className="flex justify-between items-center py-4 border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="font-black text-gray-900 uppercase italic text-sm">Logistics Uplink</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Real-time order status</p>
              </div>
            </div>
            <ToggleSwitch enabled={orderUpdates} onToggle={onToggleOrders} />
          </div>

          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="font-black text-gray-900 uppercase italic text-sm">Intel Stream</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Promotional and event updates</p>
              </div>
            </div>
            <ToggleSwitch enabled={promotionalEmails} onToggle={onTogglePromotional} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
