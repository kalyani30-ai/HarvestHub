import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useUnifiedAuth } from './UnifiedAuthContext';

export type OrderItem = {
  product: string;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
  farmer?: string;
};

export type Order = {
  _id: string;
  customer: string;
  products: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  deliveryType: string;
  deliveryStatus: string;
  deliveryTimestamps: {
    shippedAt?: string;
    deliveredAt?: string;
  };
  createdAt: string;
  updatedAt: string;
};

type OrdersContextType = {
  orders: Order[];
  isLoading: boolean;
  refreshOrders: () => Promise<void>;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
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

  // Fetch orders from backend
  const refreshOrders = async () => {
    if (!isLoggedIn || !user) {
      setOrders([]);
      return;
    }

    try {
      setIsLoading(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/api/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load orders on mount and when user changes
  useEffect(() => {
    refreshOrders();
  }, [isLoggedIn, user]);

  return (
    <OrdersContext.Provider value={{
      orders,
      isLoading,
      refreshOrders,
    }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}; 