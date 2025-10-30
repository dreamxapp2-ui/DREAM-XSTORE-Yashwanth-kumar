import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Heart, Trash2 } from 'lucide-react';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
}

interface WishlistTabProps {
  wishlist: WishlistItem[];
}

export const WishlistTab: React.FC<WishlistTabProps> = ({ wishlist }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black">My Wishlist</h2>
        <span className="text-sm text-gray-600">{wishlist.length} items</span>
      </div>

      {wishlist.length === 0 ? (
        <Card className="border border-gray-200 rounded-[1px]">
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">Your wishlist is empty</p>
            <Button 
              onClick={() => window.location.href = '/trending'}
              className="mt-4 bg-[#004d84] hover:bg-[#003d6a] rounded-none"
            >
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((item) => (
            <Card key={item.id} className="border border-gray-200 rounded-[1px] overflow-hidden hover:shadow-lg transition-shadow">
              <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
              <CardContent className="p-4">
                <h3 className="font-medium text-black mb-2">{item.name}</h3>
                <p className="text-lg font-semibold text-[#004d84] mb-3">₹{item.price.toLocaleString()}</p>
                {item.inStock ? (
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-[#004d84] hover:bg-[#003d6a] text-sm rounded-none"
                    >
                      Add to Cart
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50 rounded-none"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-red-600">Out of Stock</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
