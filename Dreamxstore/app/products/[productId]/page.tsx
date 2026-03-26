'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductService, type Product } from '../../../src/lib/api';
import { ProductPage } from '../../../src/screens/ProductPage';

export default function ProductDetail() {
  const params = useParams();
  const productId = params.productId as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[ProductDetail] Unifying UI: Fetching product:', productId);
        const fetchedProduct = await ProductService.getProductById(productId);
        setProduct(fetchedProduct);
      } catch (err: any) {
        console.error('[ProductDetail] Error fetching product:', err);
        setError(err?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-sm font-black text-gray-900 italic uppercase">Syncing Dream-X Inventory...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
         <h2 className="text-4xl font-black text-gray-900 mb-4 uppercase italic">Item Not Found</h2>
         <p className="text-gray-400 font-bold mb-8">The requested product vanished from our radar.</p>
         <button
            onClick={() => window.history.back()}
            className="px-12 py-4 bg-black text-white font-black rounded-full uppercase italic hover:bg-gray-800 transition-all"
          >
            Go Back
          </button>
      </div>
    );
  }

  return <ProductPage initialProduct={product} />;
}
