import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUnifiedAuth } from '@/context/UnifiedAuthContext';
import { useTheme } from '@/context/ThemeContext';
import { readAuthSession } from '@/lib/authSession';
import { 
  Package, 
  Heart, 
  User, 
  MapPin, 
  Calendar,
  Clock,
  Truck,
  CheckCircle,
  Star,
  Edit,
  Settings,
  Sun,
  Moon,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface Order {
  id: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
  deliveryAddress: string;
  farmerName: string;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  farmerName: string;
  category: string;
  inStock: boolean;
}

const CustomerDashboardPage = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { isLoggedIn, user } = useUnifiedAuth();
  const navigate = useNavigate();
  const userEmail = user?.email;
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!isLoggedIn) {
      alert('Please login to view your dashboard');
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const session = readAuthSession();
        const token = session.token;
        
        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await fetch(`${API_URL}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    const fetchWishlist = async () => {
      try {
        const session = readAuthSession();
        const token = session.token;
        
        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await fetch(`${API_URL}/api/wishlist`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setWishlistItems(data);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchOrders();
    fetchWishlist();
    setLoading(false);
  }, [isLoggedIn, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const wishlistCount = wishlistItems.length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;

  const handleSaveAddress = () => {
    // updateAddress(newAddress); // This line was removed from useAuth
    setIsEditingProfile(false);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4e8_0%,#fcfaf5_100%)] text-gray-900 dark:bg-[#121212] dark:text-[#f0f0f0] pt-20">
      {/* Language Switcher and Theme Toggle */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <LanguageSwitcher />
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 rounded-[2rem] border border-emerald-900/10 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                <Sparkles className="h-4 w-4" />
                {t('customerDashboard.customerDashboardLabel')}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-[#f0f0f0] mb-2">{t('customerDashboard.title')}</h1>
              <p className="text-gray-600 dark:text-[#f0f0f0]">{t('customerDashboard.welcomeBack')}, {userEmail}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <ShoppingBag className="h-4 w-4" />
              {t('customerDashboard.premiumExperience')}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-emerald-900/10 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-[#f0f0f0]">{t('customerDashboard.totalOrders')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">{t('customerDashboard.ordersThisMonth')}</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-900/10 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-[#f0f0f0]">{t('customerDashboard.totalSpent')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{t('customerDashboard.lifetimeSpending')}</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-900/10 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-[#f0f0f0]">{t('customerDashboard.wishlistItems')}</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wishlistCount}</div>
              <p className="text-xs text-muted-foreground">{t('customerDashboard.savedItems')}</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-900/10 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-[#f0f0f0]">{t('customerDashboard.deliveredOrders')}</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveredOrders}</div>
              <p className="text-xs text-muted-foreground">{t('customerDashboard.successfullyDelivered')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 rounded-full border border-emerald-900/10 bg-white/80 p-1 shadow-sm">
            <TabsTrigger value="overview">{t('common.overview')}</TabsTrigger>
            <TabsTrigger value="orders">{t('common.orders')}</TabsTrigger>
            <TabsTrigger value="wishlist">{t('common.wishlist')}</TabsTrigger>
            <TabsTrigger value="profile">{t('customerDashboard.myProfile')}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="dark:text-[#f0f0f0]">{t('customerDashboard.recentOrders')}</CardTitle>
                  <CardDescription className="dark:text-[#f0f0f0]">{t('customerDashboard.yourLatestPurchases')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item, index) => (
                              <img 
                                key={index}
                                src={item.image} 
                                alt={item.productName}
                                className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            ))}
                          </div>
                          <div>
                            <p className="font-medium">{t('common.order')} #{order.id}</p>
                            <p className="text-sm text-gray-500">{order.farmerName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total.toFixed(2)}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Wishlist Preview */}
              <Card className="border-emerald-900/10 shadow-sm">
                <CardHeader>
                  <CardTitle className="dark:text-[#f0f0f0]">{t('common.wishlist')}</CardTitle>
                  <CardDescription className="dark:text-[#f0f0f0]">Items you saved</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wishlistItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div>
                            <p className="font-medium dark:text-[#f0f0f0]">{item.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.farmerName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${item.price}</p>
                          <Badge variant={item.inStock ? 'default' : 'secondary'}>
                            {item.inStock ? t('common.available') : t('common.unavailable')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">{t('customerDashboard.orderHistory')}</h2>
            
            {orders.length === 0 ? (
              <Card className="border-emerald-900/10 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-[#f0f0f0] mb-2">
                    {t('customerDashboard.noOrdersYet')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
                    {t('customerDashboard.noOrdersMessage')}
                  </p>
                  <Button 
                    className="bg-harvest-green hover:bg-harvest-green-dark"
                    onClick={() => navigate('/products')}
                  >
                    {t('customerDashboard.browseProducts')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border-emerald-900/10 shadow-sm">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{t('common.order')} #{order.id}</CardTitle>
                          <CardDescription>
                            {t('common.placedOn')} {new Date(order.orderDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Order Items */}
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={item.image} 
                                  alt={item.productName}
                                  className="w-12 h-12 rounded object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg';
                                  }}
                                />
                                <div>
                                  <p className="font-medium">{item.productName}</p>
                                  <p className="text-sm text-gray-500">{t('common.quantity')}: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-sm font-medium text-gray-500">{t('common.farmer')}</p>
                            <p className="font-medium">{order.farmerName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">{t('common.total')}</p>
                            <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium text-gray-500">{t('common.address')}</p>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <p className="text-sm">{order.deliveryAddress}</p>
                            </div>
                          </div>
                          {order.deliveryDate && (
                            <div className="md:col-span-2">
                              <p className="text-sm font-medium text-gray-500">{t('common.expectedDelivery')}</p>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <p className="text-sm">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-4 border-t">
                          <Button variant="outline" size="sm">
                            {t('common.trackOrder')}
                          </Button>
                          <Button variant="outline" size="sm">
                            {t('common.contactFarmer')}
                          </Button>
                          {order.status === 'delivered' && (
                            <Button variant="outline" size="sm">
                              {t('common.leaveReview')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-[#f0f0f0]">{t('customerDashboard.myWishlist')}</h2>
            
            {wishlistItems.length === 0 ? (
              <Card className="border-emerald-900/10 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Heart className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-[#f0f0f0] mb-2">
                    {t('customerDashboard.noWishlistItems')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
                    {t('customerDashboard.noWishlistMessage')}
                  </p>
                  <Button 
                    className="bg-harvest-green hover:bg-harvest-green-dark"
                    onClick={() => navigate('/products')}
                  >
                    {t('customerDashboard.startShopping')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((item) => (
                  <Card key={item.id} className="border-emerald-900/10 shadow-sm">
                    <CardHeader>
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg dark:text-[#f0f0f0]">{item.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400">{item.farmerName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg">${item.price}</span>
                          <Badge variant={item.inStock ? 'default' : 'secondary'}>
                            {item.inStock ? t('common.available') : t('common.unavailable')}
                          </Badge>
                        </div>

                        <div className="flex space-x-2">
                          <Button 
                            className="flex-1 bg-harvest-green hover:bg-harvest-green-dark"
                            disabled={!item.inStock}
                          >
                            {t('common.addToCart')}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-[#f0f0f0]">{t('customerDashboard.accountSettings')}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="dark:text-[#f0f0f0]">{t('common.personalInfo')}</CardTitle>
                  <CardDescription className="dark:text-[#f0f0f0]">Update your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="dark:text-[#f0f0f0]">{t('common.email')}</Label>
                    <Input id="email" value={userEmail || ''} disabled />
                  </div>
                  
                  <div>
                    <Label htmlFor="name" className="dark:text-[#f0f0f0]">{t('common.fullName')}</Label>
                    <Input id="name" placeholder="Enter your full name" />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="dark:text-[#f0f0f0]">{t('common.phoneNumber')}</Label>
                    <Input id="phone" placeholder="Enter your phone number" />
                  </div>
                  
                  <Button className="bg-harvest-green hover:bg-harvest-green-dark dark:text-[#f0f0f0]">
                    <Settings className="w-4 h-4 mr-2" />
                    {t('common.updateProfile')}
                  </Button>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card className="border-emerald-900/10 shadow-sm">
                <CardHeader>
                  <CardTitle className="dark:text-[#f0f0f0]">{t('common.deliveryAddress')}</CardTitle>
                  <CardDescription className="dark:text-[#f0f0f0]">Update your delivery address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingProfile ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="address">{t('common.address')}</Label>
                        <Textarea 
                          id="address" 
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          placeholder="Enter your delivery address"
                          rows={4}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={handleSaveAddress}
                          className="bg-harvest-green hover:bg-harvest-green-dark"
                        >
                          {t('common.saveAddress')}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditingProfile(false)}
                        >
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="font-medium">{t('common.primaryAddress')}</p>
                              <p className="text-sm text-gray-600">
                                {/* userAddress || 'No address saved' */}
                                {t('common.noAddressSaved')}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setIsEditingProfile(true)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Preferences */}
            <Card className="border-emerald-900/10 shadow-sm">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your shopping experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive updates about your orders</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-500">Get delivery updates via SMS</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Organic Products Only</p>
                      <p className="text-sm text-gray-500">Show only organic products</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboardPage; 