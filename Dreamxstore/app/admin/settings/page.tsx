'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Save } from 'lucide-react';
import { AdminService } from '@/src/lib/api/admin/adminService';
import { useToast } from '@/src/contexts/ToastContext';

export default function SettingsPage() {
  const [commissionRate, setCommissionRate] = useState('15');
  const [minPayoutAmount, setMinPayoutAmount] = useState('1000');
  const [payoutSchedule, setPayoutSchedule] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AdminService.getSettings();
      if (settings?.settings) {
        setCommissionRate(String(settings.settings.commissionRate || 15));
        setMinPayoutAmount(String(settings.settings.minPayoutAmount || 1000));
        setPayoutSchedule(settings.settings.payoutSchedule || 'monthly');
      }
      showToast('Settings loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to load settings:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCommission = async () => {
    setSaving(true);
    try {
      await AdminService.updateSettings({
        commissionRate: parseFloat(commissionRate),
        minPayoutAmount: parseFloat(minPayoutAmount),
        payoutSchedule
      });
      showToast('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 mt-1">
          Manage platform settings and configurations
        </p>
      </div>

      {/* Commission Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Commission Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Commission Rate (%)
            </label>
            <Input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-sm text-gray-500 mt-1">
              Platform commission percentage on all sales
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSaveCommission} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>

      {/* Payment Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Payout Amount (₹)
            </label>
            <Input
              type="number"
              value={minPayoutAmount}
              onChange={(e) => setMinPayoutAmount(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payout Schedule
            </label>
            <select 
              value={payoutSchedule}
              onChange={(e) => setPayoutSchedule(e.target.value)}
              className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSaveCommission} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>

      {/* Email Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            <span className="text-sm">Order confirmation emails</span>
          </label>
          <label className="flex items-center space-x-3">
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            <span className="text-sm">Brand approval notifications</span>
          </label>
          <label className="flex items-center space-x-3">
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            <span className="text-sm">Low stock alerts</span>
          </label>
          <Button className="bg-purple-600 hover:bg-purple-700 mt-4">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
