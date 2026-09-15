import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useUnifiedAuth } from './UnifiedAuthContext';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
  farmer: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, isLoggedIn } = useUnifiedAuth();

  // Get token from auth session
  const getToken = () => {
    const session = localStorage.getItem('authSession');
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.token;
    }
    return null;
  };

  // Fetch cart from backend
  const refreshCart = async () => {
    if (!isLoggedIn || !user) {
      setCartItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend cart items to frontend format
        const transformedItems = data.cart?.items?.map((item: any) => ({
          id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images?.[0] || '/default-product.jpg',
          unit: item.product.category || 'kg',
          farmer: item.product.farmer?.name || 'Farmer'
        })) || [];
        setCartItems(transformedItems);
      } else if (response.status === 404) {
        // Cart not found is okay, just empty cart
        setCartItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      // On error, don't clear cart - keep existing state
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart on mount and when user changes
  useEffect(() => {
    refreshCart();
  }, [isLoggedIn, user]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please login to add items to cart",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });

      if (response.ok) {
        await refreshCart();
        toast({
          title: "Added to cart",
          description: "Item has been added to your cart.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to add item to cart",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isLoggedIn) return;

    try {
      setIsLoading(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await refreshCart();
        toast({
          title: "Removed from cart",
          description: "Item has been removed from your cart.",
        });
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!isLoggedIn) return;
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      setIsLoading(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/api/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });

      if (response.ok) {
        await refreshCart();
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isLoggedIn) {
      setCartItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await refreshCart();
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotal,
      isLoading,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
