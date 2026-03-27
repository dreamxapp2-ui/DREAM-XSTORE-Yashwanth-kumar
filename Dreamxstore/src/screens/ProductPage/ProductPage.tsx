import React, { useState, useEffect } from "react";
import { ArrowLeft, Heart, Star, Plus, Minus, ShoppingBag, CheckCircle, Search, Truck } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { useCart } from "../../contexts/CartContext";
import Link from "next/link";
import { Product, ProductService } from "../../lib/api/services/productService";

interface ProductPageProps {
  initialProduct?: Product;
}

import Header from "@/app/home/components/Header";

export const ProductPage = ({ initialProduct }: ProductPageProps): JSX.Element => {
  const router = useRouter();
  const params = useParams();
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [sizeType, setSizeType] = useState("EU");

  // Default Mock product data if no initialProduct provided
  const mockProduct: Product = {
    _id: "60f8c2b5e1b2c8a1b8e4d111",
    name: "Shoes PulseSneaks Relax 4",
    brandName: "PulseSneaks",
    category: "Mens",
    price: 160.0,
    rating: 5,
    reviewsCount: 1560,
    images: [
      "https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/1580267/pexels-photo-1580267.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    description: "Sleek and stylish sneakers with breathable mesh.",
    longDescription: "Sleek and stylish, these sneakers feature a breathable mesh upper for comfort and a cushioned sole for all-day support, making them perfect for both casual outings and active adventures. The vibrant color pops, adding a fun touch to any outfit.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    discount: 10,
    originalPrice: 176
  };

  const product = initialProduct || mockProduct;

  useEffect(() => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!product.category) return;
      try {
        setRelatedLoading(true);
        const response = await ProductService.getProductsByCategory(product.category, 1, 6);
        // Filter out current product
        const filtered = response.data.filter((p: Product) => p._id !== product._id).slice(0, 5);
        setRelatedProducts(filtered);
      } catch (err) {
        console.error("Failed to fetch related products:", err);
      } finally {
        setRelatedLoading(false);
      }
    };
    fetchRelated();
  }, [product._id, product.category]);

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      title: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images?.[selectedImage] || "",
      category: product.category || "General",
      selectedSize: selectedSize
    });
  };

  const colors = ["#bef264", "#708090", "#e5e7eb"]; // Defaults for UI demo

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8 pb-32">
        {/* RESPONSIVE LAYOUT CONTAINER */}
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
          
          {/* LEFT COLUMN: Main Image & Thumbnails */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            <div className="bg-[#f2fcc6]/20 rounded-[2rem] lg:rounded-[3rem] p-10 lg:p-20 aspect-square flex items-center justify-center relative shadow-sm border border-[#bef264]/10 overflow-hidden">
               <img 
                src={product.images?.[selectedImage] || "/placeholder.svg"} 
                alt={product.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-8 left-8 flex items-center gap-2 lg:hidden">
                 <span className="px-3 py-1 bg-black text-white text-[10px] font-black rounded-full uppercase italic">Hot Item</span>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {product.images?.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 lg:w-32 lg:h-24 rounded-2xl flex-shrink-0 border-2 transition-all overflow-hidden ${
                    selectedImage === idx ? 'border-black' : 'border-gray-200 opacity-60'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Product Details */}
          <div className="lg:w-1/2 flex flex-col space-y-8">
            <div className="hidden lg:block text-xs font-black text-gray-400 uppercase tracking-widest">
               Store / {product.brandName} / {product.category}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <img src="https://i.postimg.cc/sx24cHZb/image-89.png" className="w-6 h-6 object-contain" alt="Brand" />
                 <span className="text-sm font-black italic">{product.brandName}</span>
              </div>
              <div className="flex justify-between items-start">
                 <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 leading-tight">
                   {product.name}
                 </h1>
                 <button className="lg:hidden w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-gray-300" />
                 </button>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex">
                    {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= (product.rating || 4) ? 'fill-[#fbbd23] text-[#fbbd23]' : 'text-gray-200'}`} />)}
                 </div>
                 <span className="text-xs font-bold text-gray-400 tracking-tight">{product.reviewsCount || "1.2k+"} Total Reviews</span>
              </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest opacity-40">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-semibold max-w-lg">
                    {product.longDescription || product.description}
                  </p>
               </div>
               <div className="flex flex-col">
                  <span className="text-sm font-black text-red-500">{product.discount}% OFF</span>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl lg:text-5xl font-black text-gray-900">${product.price.toFixed(0)}</span>
                    <span className="text-lg lg:text-xl font-bold text-gray-300 line-through mb-1">${product.originalPrice || (product.price * 1.2).toFixed(0)}</span>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Select Color</span>
               <div className="flex gap-4">
                  {colors.map((c, i) => (
                    <button 
                      key={i} 
                      className={`w-14 h-14 rounded-2xl p-1 border-2 transition-all ${i === 0 ? 'border-black' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      <div className="w-full h-full rounded-xl bg-gray-50 flex items-center justify-center p-1">
                         <div className="w-full h-full rounded-lg" style={{ backgroundColor: c }} />
                      </div>
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Size Options</span>
                 <div className="flex bg-gray-100 p-1 rounded-lg">
                    {["EU", "US", "CM"].map(t => (
                      <button 
                        key={t}
                        onClick={() => setSizeType(t)}
                        className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${sizeType === t ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
                      >
                        {t}
                      </button>
                    ))}
                 </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-5 gap-3">
                 {product.sizes?.map(s => {
                   const stock = product.sizeStock ? product.sizeStock[s] : undefined;
                   const isOutOfStock = stock === 0;
                   
                   return (
                     <button 
                      key={s}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(s)}
                      className={`h-14 lg:h-16 border rounded-xl font-black flex flex-col items-center justify-center transition-all relative overflow-hidden ${
                        isOutOfStock 
                          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50' 
                          : selectedSize === s 
                            ? 'bg-black text-white border-black scale-105 shadow-lg' 
                            : 'border-gray-200 text-gray-600 hover:border-black hover:text-black'
                      }`}
                     >
                       <span className="text-sm uppercase italic">{s}</span>
                       {stock !== undefined && !isOutOfStock && (
                         <span className={`text-[8px] font-bold ${selectedSize === s ? 'text-[#bef264]' : 'text-gray-400'} mt-0.5`}>
                           {stock} LEFT
                         </span>
                       )}
                       {isOutOfStock && (
                         <span className="text-[8px] font-bold text-red-400 uppercase tracking-tighter mt-0.5">OUT</span>
                       )}
                     </button>
                   );
                 })}
                 {(!product.sizes || product.sizes.length === 0) && (
                   <div className="col-span-full py-4 text-center text-xs font-bold text-gray-400 bg-gray-50 rounded-xl">No sizes available</div>
                 )}
              </div>
            </div>

            <div className="space-y-4">
               <span className="text-xs font-black text-gray-900 uppercase tracking-widest opacity-40">Select Quantity</span>
               <div className="flex items-center gap-6 py-2 px-8 bg-gray-50 border border-gray-100 rounded-2xl w-fit">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-2xl font-black text-gray-300 hover:text-black">-</button>
                  <span className="text-xl font-black w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="text-2xl font-black text-gray-300 hover:text-black">+</button>
               </div>
            </div>

            <div className="hidden lg:flex items-center gap-4 pt-6">
               <button 
                 onClick={() => router.push('/cart')}
                 className="flex-1 h-16 bg-black text-white font-black rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 active:scale-95"
               >
                  Buy Now
               </button>
               <button 
                onClick={handleAddToCart}
                className="flex-1 h-16 bg-white border-2 border-gray-100 text-black font-black rounded-2xl hover:border-black transition-all flex items-center justify-center active:scale-95 shadow-sm"
               >
                  Add To Cart
               </button>
               <button className="h-16 w-16 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center hover:bg-gray-50 hover:border-red-200 group">
                  <Heart className="w-6 h-6 text-gray-300 group-hover:text-red-500 transition-colors" />
               </button>
            </div>
            
            <div className="hidden lg:flex items-center gap-3 text-xs font-black text-gray-400 pt-2 italic">
               <Truck className="w-5 h-5 text-[#bef264]" />
               FREE SHIPPING ON ORDERS OVER $150
            </div>

            {/* Mobile Action Bar */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
              <div className="bg-white/90 backdrop-blur-3xl rounded-[2.5rem] p-4 pr-3 flex items-center justify-between shadow-[0_30px_60px_rgba(0,0,0,0.15)] border border-white/50">
                <div className="flex flex-col ml-6">
                    <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Total price</span>
                    <span className="text-2xl font-black text-gray-900 leading-none">${(product.price * quantity).toFixed(0)}</span>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="px-10 h-14 bg-[#bef264] text-black rounded-full font-black text-sm flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-[#bef264]/20"
                >
                  <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-black" />
                  </div>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Section */}
        <div className="mt-32 space-y-10">
            <div className="flex justify-between items-end border-b-2 border-gray-50 pb-6">
               <div className="space-y-1">
                  <span className="text-xs font-black text-[#bef264] uppercase tracking-widest italic">Discovery</span>
                  <h3 className="text-3xl lg:text-4xl font-black text-gray-900">Relate Items</h3>
               </div>
               <Link href="/products" className="text-sm font-black text-gray-400 hover:text-black transition-colors underline underline-offset-8">Explore collection</Link>
            </div>
            
            {relatedLoading ? (
              <div className="flex gap-4">
                {[1,2,3,4].map(i => <div key={i} className="w-48 h-64 bg-gray-50 animate-pulse rounded-[2.5rem]" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
                 {relatedProducts.map(p => (
                   <Link href={`/products/${p._id}`} key={p._id} className="group cursor-pointer">
                      <div className="aspect-square bg-gray-100 rounded-[2.5rem] overflow-hidden mb-5 relative border border-transparent group-hover:border-[#bef264] transition-all">
                         <img src={p.images?.[0] || "/placeholder.svg"} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500 opacity-80 group-hover:opacity-100" alt={p.name} />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all" />
                         <div className="absolute top-5 right-5 w-10 h-10 bg-white/80 backdrop-blur rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                            <Heart className="w-5 h-5 text-gray-300" />
                         </div>
                      </div>
                      <div className="px-2">
                        <h4 className="font-black text-sm text-gray-900 group-hover:translate-x-1 transition-transform line-clamp-1">{p.name}</h4>
                        <p className="text-xs font-bold text-gray-400 tracking-tight">${p.price.toFixed(0)}</p>
                      </div>
                   </Link>
                 ))}
                 {relatedProducts.length === 0 && !relatedLoading && (
                   <div className="col-span-full py-20 text-center font-black text-gray-300 uppercase italic">No related items found</div>
                 )}
              </div>
            )}
        </div>
      </main>
    </div>
  );
};