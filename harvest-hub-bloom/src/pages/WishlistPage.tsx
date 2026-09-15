import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '@/context/WishlistContext';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from "@/components/ui/use-toast";
import { useProductTranslation } from '@/hooks/useProductTranslation';

// Separate component for wishlist items to properly use hooks
const WishlistItem = ({ item, onAddToCart, onRemove }: { 
  item: any; 
  onAddToCart: (item: any) => void;
  onRemove: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const translatedName = useProductTranslation(item.name);

  return (
    <Card className="overflow-hidden card-hover">
      <div className="relative h-48">
        <img 
          src={item.image} 
          alt={translatedName} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/default-product.jpg';
          }}
        />
      </div>
      <CardContent className="pt-4">
        <h3 className="font-semibold text-lg mb-1 dark:text-[#f0f0f0]">{translatedName}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('products.grownBy')} {item.farmer}</p>
        <p className="text-lg font-bold text-harvest-green">
          ₹{item.price} <span className="text-sm font-normal dark:text-gray-300">/ {item.unit}</span>
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          onClick={() => onAddToCart(item)}
          className="flex-1 bg-harvest-green hover:bg-harvest-green-dark text-white"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {t('wishlist.addToCart')}
        </Button>
        <Button 
          variant="outline"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-950/30"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

const WishlistPage = () => {
  const { t } = useTranslation();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async (item: any) => {
    await addToCart(item.id, 1);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#121212] dark:text-[#f0f0f0]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('wishlist.title')}</h1>
        
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t('wishlist.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <WishlistItem 
                key={item.id} 
                item={item} 
                onAddToCart={handleAddToCart}
                onRemove={removeFromWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage; 