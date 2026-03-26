import { apiClient } from './client';

interface PickupLocation {
  pickup_location: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  address_2?: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
}

interface DeliveryPriceParams {
  pickup_postcode: number | string;
  delivery_postcode: number | string;
  cod: boolean;
  weight: number;
  length?: number;
  breadth?: number;
  height?: number;
}

interface DeliveryPrice {
  courier_name: string;
  courier_company_id: number;
  estimated_delivery_days: number;
  estimated_delivery_date: string;
  delivery_cost: number;
  cod_charges: number;
  all_options?: any[];
}

interface OrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: string;
}

interface ShipmentOrderData {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_country: string;
  billing_pincode: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_pincode?: string;
  shipping_email?: string;
  shipping_phone?: string;
  order_items: OrderItem[];
  payment_method: 'Prepaid' | 'COD';
  sub_total: number;
  weight: number;
  length?: number;
  breadth?: number;
  height?: number;
}

interface ShipmentOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  status_code: number;
  onboarding_completed_now: boolean;
}

interface TrackingData {
  tracking_data?: {
    shipment_status: string;
    shipment_track: Array<{
      id: number;
      awb_code: string;
      courier_name: string;
      current_status: string;
      shipment_status: string;
      delivered_date: string | null;
      edd: string;
      scans: Array<{
        date: string;
        activity: string;
        location: string;
      }>;
    }>;
  };
}

class ShipmentService {
  /**
   * Add a new pickup location
   */
  static async addPickupLocation(locationData: PickupLocation): Promise<any> {
    try {
      return await apiClient.post<any>('/shipment/add-pickup-location', locationData);
    } catch (error: any) {
      console.error('[ShipmentService] Add pickup location error:', error);
      throw error;
    }
  }

  /**
   * Get delivery price estimate
   */
  static async getDeliveryPrice(params: DeliveryPriceParams): Promise<DeliveryPrice> {
    try {
      const queryParams = new URLSearchParams({
        pickup_postcode: params.pickup_postcode.toString(),
        delivery_postcode: params.delivery_postcode.toString(),
        cod: params.cod.toString(),
        weight: params.weight.toString(),
      });

      if (params.length) queryParams.append('length', params.length.toString());
      if (params.breadth) queryParams.append('breadth', params.breadth.toString());
      if (params.height) queryParams.append('height', params.height.toString());

      const data = await apiClient.get<any>('/shipment/delivery-price', { params: queryParams });
      return data.data;
    } catch (error: any) {
      console.error('[ShipmentService] Get delivery price error:', error);
      throw error;
    }
  }

  /**
   * Create a shipment order
   */
  static async createShipmentOrder(orderData: ShipmentOrderData): Promise<ShipmentOrderResponse> {
    try {
      const data = await apiClient.post<any>('/shipment/create-order', orderData);
      return data.data;
    } catch (error: any) {
      console.error('[ShipmentService] Create shipment order error:', error);
      throw error;
    }
  }

  /**
   * Assign AWB number to shipment
   */
  static async assignAWB(shipmentId: number, courierId: number): Promise<any> {
    try {
      const data = await apiClient.post<any>('/shipment/assign-awb', {
        shipment_id: shipmentId,
        courier_id: courierId,
      });
      return data.data;
    } catch (error: any) {
      console.error('[ShipmentService] Assign AWB error:', error);
      throw error;
    }
  }

  /**
   * Request pickup for shipment
   */
  static async requestPickup(shipmentId: number, pickupDate?: string): Promise<any> {
    try {
      const data = await apiClient.post<any>('/shipment/request-pickup', {
        shipment_id: shipmentId,
        pickup_date: pickupDate ? [pickupDate] : undefined,
      });
      return data.data;
    } catch (error: any) {
      console.error('[ShipmentService] Request pickup error:', error);
      throw error;
    }
  }

  /**
   * Track shipment by shipment ID
   */
  static async trackByShipmentId(shipmentId: number | string): Promise<TrackingData> {
    try {
      const data = await apiClient.get<any>(`/shipment/track/${shipmentId}`);
      return data.data;
    } catch (error: any) {
      console.error('[ShipmentService] Track shipment error:', error);
      throw error;
    }
  }

  /**
   * Track shipment by AWB code
   */
  static async trackByAWB(awbCode: string): Promise<TrackingData> {
    try {
      const data = await apiClient.get<any>(`/shipment/track-awb/${awbCode}`);
      return data.data;
    } catch (error: any) {
      console.error('[ShipmentService] Track by AWB error:', error);
      throw error;
    }
  }

  /**
   * Get all shipment orders
   */
  static async getAllOrders(page?: number, perPage?: number, status?: string): Promise<any> {
    try {
      const params: any = {};
      if (page) params.page = page;
      if (perPage) params.per_page = perPage;
      if (status) params.status = status;

      const data = await apiClient.get<any>('/shipment/orders', { params });
      return data.data;
    } catch (error: any) {
      console.error('[ShipmentService] Get all orders error:', error);
      throw error;
    }
  }

  /**
   * Get delivered orders
   */
  static async getDeliveredOrders(): Promise<any> {
    try {
      const data = await apiClient.get<any>('/shipment/delivered-orders');
      return data.data;
    } catch (error: any) {
      console.error('[ShipmentService] Get delivered orders error:', error);
      throw error;
    }
  }

  /**
   * Cancel shipment
   */
  static async cancelShipment(shipmentIds: number[]): Promise<any> {
    try {
      const data = await apiClient.post<any>('/shipment/cancel', {
        shipment_ids: shipmentIds,
      });
      return data.data;
    } catch (error: any) {
      console.error('[ShipmentService] Cancel shipment error:', error);
      throw error;
    }
  }

  /**
   * Calculate estimated delivery date
   */
  static calculateDeliveryDate(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  /**
   * Format tracking status for display
   */
  static formatTrackingStatus(status: string): string {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

export default ShipmentService;
export type {
  PickupLocation,
  DeliveryPriceParams,
  DeliveryPrice,
  OrderItem,
  ShipmentOrderData,
  ShipmentOrderResponse,
  TrackingData,
};
