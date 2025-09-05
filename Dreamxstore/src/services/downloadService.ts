// Download service for handling file downloads
class DownloadService {
  private static baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Get auth token from localStorage
  private static getAuthToken(): string | null {
    return localStorage.getItem('token') || 
           JSON.parse(localStorage.getItem('dreamx_user') || '{}').token || 
           null;
  }

  // Generic download method
  private static async downloadFile(url: string, filename: string): Promise<void> {
    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  // Download design image
  static async downloadDesignImage(designId: string, imageIndex: number): Promise<void> {
    const url = `${this.baseURL}/download/design/${designId}/image/${imageIndex}`;
    const filename = `design_${designId}_image_${imageIndex + 1}.jpg`;
    await this.downloadFile(url, filename);
  }

  // Download order invoice
  static async downloadOrderInvoice(orderId: string): Promise<void> {
    const url = `${this.baseURL}/download/order/${orderId}/invoice`;
    const filename = `invoice_${orderId}.json`;
    await this.downloadFile(url, filename);
  }

  // Download user data
  static async downloadUserData(): Promise<void> {
    const url = `${this.baseURL}/download/user/data`;
    const filename = `my_data_${new Date().toISOString().split('T')[0]}.json`;
    await this.downloadFile(url, filename);
  }

  // Download product catalog
  static async downloadCatalog(): Promise<void> {
    const url = `${this.baseURL}/download/catalog`;
    const filename = `dreamx_catalog_${new Date().toISOString().split('T')[0]}.json`;
    await this.downloadFile(url, filename);
  }

  // Download image from URL (for external images)
  static async downloadImageFromUrl(imageUrl: string, filename?: string): Promise<void> {
    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || `image_${Date.now()}.jpg`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (error) {
      console.error('Image download error:', error);
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
    }
  }
}

export default DownloadService;