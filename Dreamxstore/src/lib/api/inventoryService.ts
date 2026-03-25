/**
 * Inventory Service - Handles stock management API calls
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface InventoryItem {
  productId: string;
  quantity: number;
  selectedSize?: string;
}

interface StockReductionResult {
  success: boolean;
  results: Array<{
    productId: string;
    size?: string;
    reducedQuantity: number;
    remainingStock: number;
    totalStock?: number;
  }>;
  errors: Array<{
    productId: string;
    size?: string;
    error: string;
  }>;
  message: string;
}

interface StockAvailability {
  success: boolean;
  allAvailable: boolean;
  items: Array<{
    productId: string;
    productName: string;
    size?: string;
    available: boolean;
    requestedQuantity: number;
    availableQuantity: number;
    reason: string;
  }>;
  message: string;
}

class InventoryService {
  /**
   * Reduce stock after successful order
   */
  static async reduceStock(orderItems: InventoryItem[]): Promise<StockReductionResult> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/inventory/reduce-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderItems }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error('[InventoryService] Stock reduction failed:', data);
      }

      return data;
    } catch (error: any) {
      console.error('[InventoryService] Error reducing stock:', error);
      throw error;
    }
  }

  /**
   * Check stock availability before checkout
   */
  static async checkAvailability(orderItems: InventoryItem[]): Promise<StockAvailability> {
    try {
      const response = await fetch(`${API_BASE}/inventory/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderItems }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[InventoryService] Error checking availability:', error);
      throw error;
    }
  }

  /**
   * Restore stock for cancelled/failed orders
   */
  static async restoreStock(orderItems: InventoryItem[]): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/inventory/restore-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderItems }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[InventoryService] Error restoring stock:', error);
      throw error;
    }
  }

  /**
   * Transform cart items to inventory items format
   */
  static transformCartToInventory(cart: any[]): InventoryItem[] {
    return cart.map(item => ({
      productId: item._id,
      quantity: item.quantity,
      selectedSize: item.selectedSize || undefined,
    }));
  }
}

export default InventoryService;
export type { InventoryItem, StockReductionResult, StockAvailability };
