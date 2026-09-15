import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useUnifiedAuth } from '@/context/UnifiedAuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CheckoutPage = () => {
  const { t } = useTranslation();
  const { cartItems, getTotal, refreshCart } = useCart();
  const { user, isLoggedIn } = useUnifiedAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });
  const [deliveryCharge] = useState(20); // Fixed delivery charge of ₹20
  const [isLoading, setIsLoading] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [cartVersion, setCartVersion] = useState<number | null>(null);

  // Generate unique idempotency key for checkout attempt
  const generateIdempotencyKey = () => {
    return `checkout_${user?.id}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  // Regenerate idempotency key when cart changes (new checkout attempt)
  useEffect(() => {
    setIdempotencyKey(generateIdempotencyKey());
  }, [cartItems, user?.id]);

  // Fetch cart version from backend
  useEffect(() => {
    const fetchCartVersion = async () => {
      if (!isLoggedIn || !user) return;
      
      try {
        const token = localStorage.getItem('authSession') ? JSON.parse(localStorage.getItem('authSession')).token : null;
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.cart?.version !== undefined) {
            setCartVersion(data.cart.version);
          }
        }
      } catch (error) {
        console.error('Failed to fetch cart version:', error);
      }
    };

    fetchCartVersion();
  }, [isLoggedIn, user]);

  // Get token from auth session
  const getToken = () => {
    const session = localStorage.getItem('authSession');
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.token;
    }
    return null;
  };

  // Update form data when user data changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      email: user?.email || '',
    }));
  }, [user]);

  const subtotal = getTotal();
  const total = subtotal + deliveryCharge;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please login to checkout",
        variant: 'destructive',
      });
      setIsLoading(false);
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: t('checkout.cartEmpty'),
        description: t('checkout.addItemsBeforeCheckout'),
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const token = getToken();
      
      // POST checkout to backend API with idempotency key and cart version
      const response = await fetch(`${API_URL}/api/cart/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          deliveryType: 'Normal',
          idempotencyKey: idempotencyKey,
          cartVersion: cartVersion
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Refresh cart to clear it
        await refreshCart();
        
        toast({
          title: t('checkout.orderPlacedSuccess'),
          description: t('checkout.orderPlacedDescription'),
        });
        
        navigate('/orders');
      } else if (response.status === 409) {
        // Cart version conflict - cart was modified
        const errorData = await response.json();
        toast({
          title: "Cart Modified",
          description: errorData.message || "Your cart has been modified. Please refresh and try again.",
          variant: 'destructive',
        });
        // Refresh cart to get latest version
        await refreshCart();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }
    } catch (error) {
      toast({
        title: t('checkout.checkoutError'),
        description: error instanceof Error ? error.message : t('checkout.failedToPlaceOrder'),
        variant: 'destructive',
      });
      console.error("Failed to place order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      toast({
        title: t('checkout.cartEmpty'),
        description: t('checkout.addItemsBeforeCheckout'),
        variant: 'destructive',
      });
      navigate('/products');
    }
  }, [cartItems.length, navigate, toast, t]);

  if (cartItems.length === 0) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4e8_0%,#fcfaf5_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/products')} className="inline-flex items-center text-harvest-green hover:text-harvest-green-dark mb-4">
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('checkout.back')}
        </button>

        <div className="mb-8 rounded-[2rem] border border-emerald-900/10 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h1 className="text-3xl font-semibold text-gray-900">{t('checkout.title')}</h1>
          <p className="mt-2 text-sm text-slate-600">{t('checkout.description')}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700"><ShieldCheck className="h-4 w-4" /> {t('checkout.secureCheckout')}</div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700"><Truck className="h-4 w-4" /> {t('checkout.fastDelivery')}</div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-[1.75rem] border border-emerald-900/10 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">{t('checkout.shippingAddress')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="text-gray-700">{t('checkout.fullName')}</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      onChange={handleChange}
                      value={formData.fullName}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-700">{t('checkout.email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      onChange={handleChange}
                      value={formData.email}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-700">{t('checkout.phone')}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      onChange={handleChange}
                      value={formData.phone}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode" className="text-gray-700">{t('checkout.pincode')}</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      onChange={handleChange}
                      value={formData.pincode}
                      required
                      maxLength={6}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="address" className="text-gray-700">{t('checkout.address')}</Label>
                  <Textarea
                    id="address"
                    name="address"
                    onChange={handleChange}
                    value={formData.address}
                    required
                    placeholder={t('checkout.enterFullAddress')}
                    className="mt-1"
                    rows={3}
                  />
                  {user?.email && (
                    <p className="text-sm text-green-600 mt-1">
                      {t('checkout.emailAutoFilled')}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <Label htmlFor="city" className="text-gray-700">{t('checkout.city')}</Label>
                  <Input
                    id="city"
                    name="city"
                    onChange={handleChange}
                    value={formData.city}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-harvest-green hover:bg-harvest-green-dark text-white h-12 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t('checkout.placingOrder')}
                  </div>
                ) : (
                  `${t('checkout.placeOrderWithTotal')}${total.toFixed(2)}`
                )}
              </Button>
            </form>
          </div>

          <div className="md:col-span-1">
            <div className="rounded-[1.75rem] border border-emerald-900/10 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">{t('checkout.orderSummary')}</h2>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                                           <p className="text-sm text-gray-500 dark:text-white">{t('checkout.quantity')} {item.quantity} {item.unit}</p>
                     <p className="text-sm text-gray-500 dark:text-white">{t('checkout.price')} ₹{item.price}/{item.unit}</p>
                    </div>
                    <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-3">
                <div className="flex justify-between">
                                     <p className="text-gray-700 dark:text-white">{t('checkout.subtotal')}</p>
                   <p className="text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</p>
                 </div>
                 <div className="flex justify-between">
                   <p className="text-gray-700 dark:text-white">{t('checkout.shipping')}</p>
                   <p className="text-gray-900 dark:text-white">₹{deliveryCharge.toFixed(2)}</p>
                 </div>
                 <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
                   <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> {t('checkout.fixedDeliveryCharge')}</p>
                 </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                                     <p className="text-gray-900 dark:text-white">{t('checkout.grandTotal')}</p>
                   <p className="text-gray-900 dark:text-white">₹{total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 