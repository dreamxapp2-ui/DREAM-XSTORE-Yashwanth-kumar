import React, { useState, useEffect } from 'react';
import ShipmentService, { TrackingData } from '../../lib/api/shipmentService';

interface OrderTrackingProps {
  shipmentId?: number;
  awbCode?: string;
}

interface TrackingScan {
  date: string;
  activity: string;
  location: string;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ shipmentId, awbCode }) => {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrackingData();
  }, [shipmentId, awbCode]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: TrackingData;

      if (shipmentId) {
        data = await ShipmentService.trackByShipmentId(shipmentId);
      } else if (awbCode) {
        data = await ShipmentService.trackByAWB(awbCode);
      } else {
        throw new Error('No shipment ID or AWB code provided');
      }

      setTrackingData(data);
    } catch (err: any) {
      console.error('[OrderTracking] Error fetching tracking data:', err);
      setError(err.message || 'Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium mb-2">Tracking Error</p>
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={fetchTrackingData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!trackingData?.tracking_data?.shipment_track || trackingData.tracking_data.shipment_track.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No tracking information available yet.</p>
      </div>
    );
  }

  const shipment = trackingData.tracking_data.shipment_track[0];
  const scans = shipment.scans || [];

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered')) return 'bg-green-500';
    if (statusLower.includes('transit') || statusLower.includes('picked')) return 'bg-blue-500';
    if (statusLower.includes('pending') || statusLower.includes('booked')) return 'bg-yellow-500';
    if (statusLower.includes('cancelled') || statusLower.includes('failed')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Track Your Order</h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <p className="text-purple-100 text-sm">AWB Number</p>
            <p className="font-mono font-semibold text-lg">{shipment.awb_code}</p>
          </div>
          <div>
            <p className="text-purple-100 text-sm">Courier</p>
            <p className="font-semibold">{shipment.courier_name}</p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${getStatusColor(shipment.current_status)} animate-pulse`}></div>
          <div>
            <p className="text-sm text-gray-600">Current Status</p>
            <p className="text-xl font-semibold text-gray-900">
              {ShipmentService.formatTrackingStatus(shipment.current_status)}
            </p>
          </div>
        </div>
        
        {shipment.edd && !shipment.delivered_date && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Estimated Delivery</p>
            <p className="text-blue-900 font-semibold">{formatDate(shipment.edd)}</p>
          </div>
        )}

        {shipment.delivered_date && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Delivered On</p>
            <p className="text-green-900 font-semibold">{formatDate(shipment.delivered_date)}</p>
          </div>
        )}
      </div>

      {/* Tracking Timeline */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking History</h3>
        
        {scans.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tracking updates yet</p>
        ) : (
          <div className="space-y-4">
            {scans.map((scan: TrackingScan, index: number) => (
              <div key={index} className="flex gap-4">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                  {index !== scans.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                  )}
                </div>

                {/* Scan details */}
                <div className={`flex-1 pb-6 ${index === 0 ? 'bg-purple-50' : ''} rounded-lg p-4 border ${index === 0 ? 'border-purple-200' : 'border-gray-200'}`}>
                  <p className={`font-medium ${index === 0 ? 'text-purple-900' : 'text-gray-900'}`}>
                    {scan.activity}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{scan.location}</p>
                  <p className="text-xs text-gray-500 mt-2">{formatDate(scan.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <button
          onClick={fetchTrackingData}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Refresh Tracking
        </button>
      </div>
    </div>
  );
};

export default OrderTracking;
