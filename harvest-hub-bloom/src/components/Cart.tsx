import React from 'react';
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from '@/context/CartContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useProductTranslation } from '@/hooks/useProductTranslation';

// Separate component for cart items to properly use hooks
const CartItem = ({ item, updateQuantity, removeFromCart }: { 
  item: any; 
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const translatedName = useProductTranslation(item.name);

  return (
    <div className="flex items-center gap-4">
      <img
        src={item.image}
        alt={translatedName}
        className="h-16 w-16 rounded-md object-cover"
        onError={(e) => {
          e.currentTarget.src = '/default-product.jpg';
        }}
      />
      <div className="flex-1">
        <h3 className="font-medium">{translatedName}</h3>
        <p className="text-sm text-gray-500">
          {t('products.grownBy')} {item.farmer}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
          >
            -
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            +
          </Button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">₹{item.price * item.quantity}</p>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600"
          onClick={() => removeFromCart(item.id)}
        >
          {t('cart.remove')}
        </Button>
      </div>
    </div>
  );
};

interface CartProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const Cart = ({ isOpen, onOpenChange }: CartProps) => {
  const { cartItems, removeFromCart, updateQuantity, getTotal, isLoading } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();
      
  const subtotal = getTotal();
      
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }
    onOpenChange(false);
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">{t('cart.title')}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading cart...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-emerald-200 bg-emerald-50/70 p-8 text-center">
                <ShoppingCart className="mb-3 h-8 w-8 text-emerald-700" />
                <p className="text-base font-semibold text-slate-900">{t('cart.empty')}</p>
                <p className="mt-2 text-sm text-slate-500">{t('cart.addDemoProducts')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItem 
                    key={item.id} 
                    item={item} 
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-emerald-100 bg-white p-4">
            <div className="mb-3 rounded-[1rem] border border-emerald-100 bg-emerald-50/70 p-3">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>{t('cart.subtotal')}</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="w-full bg-harvest-green text-white"
              disabled={cartItems.length === 0 || isLoading}
              onClick={handleCheckout}
            >
              {t('cart.checkout')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
