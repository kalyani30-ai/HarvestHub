import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const EmailTest = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const { t } = useTranslation();
  
  // Order confirmation test state
  const [orderEmail, setOrderEmail] = useState('');
  const [orderName, setOrderName] = useState('');
  const [orderItems, setOrderItems] = useState([
    { product: { name: 'Fresh Tomatoes', price: 45 }, quantity: 2, price: 45 },
    { product: { name: 'Organic Carrots', price: 30 }, quantity: 1, price: 30 }
  ]);
  const [totalPrice, setTotalPrice] = useState(120);
  const [deliveryType, setDeliveryType] = useState('Normal');
  const [isOrderLoading, setIsOrderLoading] = useState(false);

  const testEmail = async () => {
    if (!email || !name || !userType) {
      toast.error(t('emailTest.fillAllFields'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, userType }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t('emailTest.testEmailSuccess'));
        setEmailStatus(data);
      } else {
        toast.error(data.message || t('emailTest.testEmailFailed'));
        setEmailStatus(data);
      }
    } catch (error) {
      toast.error(t('emailTest.testEmailError'));
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailStatus = async () => {
    try {
      const response = await fetch('/api/email/status');
      const data = await response.json();
      setEmailStatus(data);
      
      if (data.emailConfigured) {
        toast.success(t('emailTest.emailConfigured'));
      } else {
        toast.error(t('emailTest.emailNotConfigured'));
      }
    } catch (error) {
      toast.error(t('emailTest.checkStatusError'));
      console.error('Error:', error);
    }
  };

  const testOrderEmail = async () => {
    if (!orderEmail || !orderName) {
      toast.error(t('emailTest.fillEmailAndName'));
      return;
    }

    setIsOrderLoading(true);
    try {
      const orderData = {
        _id: 'TEST-ORDER-123',
        products: orderItems,
        totalPrice,
        deliveryType,
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/email/test-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: orderEmail, 
          name: orderName, 
          orderData 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t('emailTest.orderEmailSuccess'));
        setEmailStatus(data);
      } else {
        toast.error(data.message || t('emailTest.orderEmailFailed'));
        setEmailStatus(data);
      }
    } catch (error) {
      toast.error(t('emailTest.orderEmailError'));
      console.error('Error:', error);
    } finally {
      setIsOrderLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{t('emailTest.title')}</CardTitle>
        <CardDescription>
          {t('emailTest.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t('emailTest.loginTab')}</TabsTrigger>
            <TabsTrigger value="order">{t('emailTest.orderTab')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{t('common.name')}</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">{t('emailTest.userType')}</Label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('emailTest.selectUserType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Farmer">{t('farmer.forFarmers')}</SelectItem>
                  <SelectItem value="Customer">{t('dashboard.customer.title')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={testEmail} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? t('common.loading') : t('emailTest.sendLoginEmail')}
              </Button>
              
              <Button 
                onClick={checkEmailStatus} 
                variant="outline"
              >
                {t('emailTest.checkStatus')}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="order" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderEmail">{t('emailTest.customerEmail')}</Label>
              <Input
                id="orderEmail"
                type="email"
                placeholder="customer@example.com"
                value={orderEmail}
                onChange={(e) => setOrderEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderName">{t('emailTest.customerName')}</Label>
              <Input
                id="orderName"
                type="text"
                placeholder="John Doe"
                value={orderName}
                onChange={(e) => setOrderName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryType">{t('emailTest.deliveryType')}</Label>
              <Select value={deliveryType} onValueChange={setDeliveryType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('emailTest.selectDeliveryType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">{t('emailTest.deliveryNormal')}</SelectItem>
                  <SelectItem value="Express">{t('emailTest.deliveryExpress')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPrice">{t('checkout.orderTotal')}</Label>
              <Input
                id="totalPrice"
                type="number"
                placeholder="120"
                value={totalPrice}
                onChange={(e) => setTotalPrice(Number(e.target.value))}
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">{t('emailTest.sampleItems')}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                {orderItems.map((item, index) => (
                  <div key={index}>
                    {item.product.name} - Qty: {item.quantity} - ₹{item.price}
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={testOrderEmail} 
              disabled={isOrderLoading}
              className="w-full"
            >
              {isOrderLoading ? t('common.loading') : t('emailTest.sendOrderEmail')}
            </Button>
          </TabsContent>
        </Tabs>

        {emailStatus && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-2">{t('emailTest.status')}</h4>
            <pre className="text-sm text-gray-600">
              {JSON.stringify(emailStatus, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailTest; 