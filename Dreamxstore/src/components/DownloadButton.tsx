import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import DownloadService from '../services/downloadService';

interface DownloadButtonProps {
  type: 'design-image' | 'order-invoice' | 'user-data' | 'catalog' | 'image-url';
  designId?: string;
  imageIndex?: number;
  orderId?: string;
  imageUrl?: string;
  filename?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  type,
  designId,
  imageIndex = 0,
  orderId,
  imageUrl,
  filename,
  className = '',
  children,
  variant = 'outline',
  size = 'sm'
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      switch (type) {
        case 'design-image':
          if (!designId) throw new Error('Design ID is required');
          await DownloadService.downloadDesignImage(designId, imageIndex);
          break;
          
        case 'order-invoice':
          if (!orderId) throw new Error('Order ID is required');
          await DownloadService.downloadOrderInvoice(orderId);
          break;
          
        case 'user-data':
          await DownloadService.downloadUserData();
          break;
          
        case 'catalog':
          await DownloadService.downloadCatalog();
          break;
          
        case 'image-url':
          if (!imageUrl) throw new Error('Image URL is required');
          await DownloadService.downloadImageFromUrl(imageUrl, filename);
          break;
          
        default:
          throw new Error('Invalid download type');
      }
    } catch (err) {
      console.error('Download failed:', err);
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        variant={variant}
        size={size}
        className={`${className} ${isDownloading ? 'opacity-75' : ''}`}
      >
        {isDownloading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        {children || (isDownloading ? 'Downloading...' : 'Download')}
      </Button>
      
      {error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 text-red-700 text-xs rounded shadow-lg whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
};

export default DownloadButton;