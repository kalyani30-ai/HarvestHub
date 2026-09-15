import React from 'react';
import { useOrders } from '@/context/OrdersContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { MapPin, Phone, Mail, User } from 'lucide-react';

const OrdersPage = () => {
  const { orders, isLoading, refreshOrders } = useOrders();
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'paid':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('orders.title')}</h1>
        <button onClick={refreshOrders} className="text-sm text-emerald-600 hover:text-emerald-700">
          Refresh
        </button>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-white">{t('orders.empty')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order._id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{t('orders.orderId')}: {order._id}</h2>
                  <p className="text-sm text-gray-500 dark:text-white">
                    {t('orders.date')}: {format(new Date(order.createdAt), 'PPP')}
                  </p>
                </div>
                <Badge className={`${getStatusColor(order.status)} text-white`}>
                  {order.status}
                </Badge>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">{t('orders.items')}</h3>
                {order.products.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium">Product ID: {item.product}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t('orders.total')}</span>
                  <span className="font-bold">₹{order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage; 