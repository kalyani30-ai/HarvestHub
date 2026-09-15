import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUnifiedAuth } from '@/context/UnifiedAuthContext';
import { useTheme } from '@/context/ThemeContext';
import { readAuthSession } from '@/lib/authSession';
import { 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign, 
  IndianRupee,
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  MapPin,
  Star,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Activity,
  X,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import FarmerNavbar from '@/components/FarmerNavbar';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  images?: string[];
  farmer: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryAddress: string;
  priority: 'high' | 'medium' | 'low';
}

const FarmerDashboardPage = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { isLoggedIn, user } = useUnifiedAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [farmerData, setFarmerData] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    description: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm(t('farmerDashboard.deleteProductConfirm'));
    if (!confirmed) return;

    const token = localStorage.getItem('farmerToken');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove product from state
        setProducts(products.filter(product => product._id !== productId));
        console.log('Product deleted successfully');
      } else {
        console.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Handle product edit - open modal and populate form
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description || ''
    });
    setEditModalOpen(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const token = localStorage.getItem('farmerToken');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const data = await response.json();
        // Update product in state
        setProducts(products.map(product => 
          product._id === editingProduct._id ? data.product : product
        ));
        setEditModalOpen(false);
        console.log('Product updated successfully');
      } else {
        console.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  // Fetch farmer data and products on component mount
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/farmer-login');
      return;
    }

    // Get farmer data from localStorage
    const storedFarmerData = localStorage.getItem('farmerUser');
    if (storedFarmerData) {
      setFarmerData(JSON.parse(storedFarmerData));
    }

    // Fetch products from backend
    const fetchProducts = async () => {
      const token = localStorage.getItem('farmerToken');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/products/my-products`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isLoggedIn, navigate]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const session = readAuthSession();
        const token = session.token;
        
        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await fetch(`${API_URL}/api/orders/farmer`, {
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
      } finally {
        setLoadingOrders(false);
      }
    };

    if (isLoggedIn) {
      fetchOrders();
    }
  }, [isLoggedIn]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.stock > 0).length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;

  if (!isLoggedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 dark:bg-[#121212] dark:text-[#f0f0f0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-harvest-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4e8_0%,#fcfaf5_100%)] text-gray-900 dark:bg-[#121212] dark:text-[#f0f0f0]">
      <FarmerNavbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in rounded-[2rem] border border-emerald-900/10 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                <Sparkles className="h-4 w-4" />
                {t('farmerDashboard.farmerDashboardLabel')}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-[#f0f0f0] mb-2">{t('farmerDashboard.title')}</h1>
              <p className="text-gray-600 dark:text-[#f0f0f0]">{t('farmerDashboard.welcomeBack')}, {farmerData?.name || userEmail}</p>
            </div>
            <Button 
              onClick={() => navigate('/add-products')}
              className="bg-harvest-green hover:bg-harvest-green-dark text-white px-6 py-3"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t('farmerDashboard.addProduct')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-[#f0f0f0]">{t('farmerDashboard.totalRevenue')}</CardTitle>
              <div className="bg-harvest-green/10 p-2 rounded-full">
                <IndianRupee className="h-5 w-5 text-harvest-green" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--dynamic-text-color)]">₹{totalRevenue.toFixed(2)}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {t('farmerDashboard.fromLastMonth')}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-[#f0f0f0]">{t('farmerDashboard.totalOrders')}</CardTitle>
              <div className="bg-blue-100 p-2 rounded-full">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--dynamic-text-color)]">{totalOrders}</div>
              <div className="flex items-center text-xs text-blue-600 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {pendingOrders} {t('farmerDashboard.pending')}, {processingOrders} {t('farmerDashboard.processing')}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-[#f0f0f0]">{t('farmerDashboard.activeProducts')}</CardTitle>
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--dynamic-text-color)]">{activeProducts}</div>
              <div className="text-xs text-gray-500 mt-1">
                {t('farmerDashboard.outOf')} {totalProducts} {t('common.products')}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-[#f0f0f0]">{t('farmerDashboard.customerRating')}</CardTitle>
              <div className="bg-yellow-100 p-2 rounded-full">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--dynamic-text-color)]">4.6</div>
              <div className="flex items-center text-xs text-yellow-600 mt-1">
                <Star className="h-3 w-3 mr-1 fill-current" />
                {t('farmerDashboard.averageRating')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 rounded-full border border-emerald-900/10 bg-white/80 p-1 shadow-sm backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-harvest-green data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t('farmerDashboard.overview')}
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-harvest-green data-[state=active]:text-white">
              <Package className="h-4 w-4 mr-2" />
              {t('farmerDashboard.products')}
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-harvest-green data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              {t('farmerDashboard.orders')}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-harvest-green data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              {t('farmerDashboard.analytics')}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="dark:text-[#f0f0f0]">{t('farmerDashboard.recentOrders')}</CardTitle>
                  <CardDescription className="dark:text-[#f0f0f0]">{t('farmerDashboard.yourLatestOrders')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-harvest-green/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-harvest-green" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{order.customerName}</p>
                            <p className="text-sm text-gray-500">₹{order.total.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2 text-harvest-green" />
                    {t('farmerDashboard.products')}
                  </CardTitle>
                  <CardDescription>{t('farmerDashboard.manageInventory')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">{t('farmerDashboard.noProducts')}</p>
                    ) : (
                      products.slice(0, 3).map((product) => (
                        <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-harvest-green/10 rounded-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-harvest-green" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.stock} {t('farmerDashboard.inStock')}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={product.stock > 0 ? 'default' : 'secondary'}>
                              {product.stock > 0 ? t('common.active') : t('common.unavailable')}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Package className="h-5 w-5 mr-2 text-harvest-green" />
                      {t('farmerDashboard.products')}
                    </CardTitle>
                    <CardDescription>{t('farmerDashboard.manageInventory')}</CardDescription>
                  </div>
                  <Button 
                    onClick={() => navigate('/add-products')}
                    className="bg-harvest-green hover:bg-harvest-green-dark text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('farmerDashboard.addProduct')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.name')}</TableHead>
                      <TableHead>{t('common.category')}</TableHead>
                      <TableHead>{t('common.price')}</TableHead>
                      <TableHead>{t('common.stock')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead>{t('common.rating')}</TableHead>
                      <TableHead>{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-gray-500">{t('farmerDashboard.noProducts')}. {t('farmerDashboard.addFirstProduct')}</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>₹{product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>{product.stock}</span>
                              {product.stock < 10 && (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.stock > 0 ? 'default' : 'secondary'}>
                              {product.stock > 0 ? t('common.active') : t('common.unavailable')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="ml-1">N/A</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => window.open(`/products?id=${product._id}`, '_blank')}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t('common.details')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleEditProduct(product)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t('farmerDashboard.editProduct')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleDeleteProduct(product._id)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t('farmerDashboard.deleteProduct')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="border-emerald-900/10 bg-white/80 shadow-sm backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-harvest-green" />
                  {t('farmerDashboard.orders')}
                </CardTitle>
                <CardDescription>{t('farmerDashboard.trackManageOrders')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('farmerDashboard.orderId')}</TableHead>
                      <TableHead>{t('farmerDashboard.customer')}</TableHead>
                      <TableHead>{t('common.items')}</TableHead>
                      <TableHead>{t('common.total')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead>{t('farmerDashboard.priority')}</TableHead>
                      <TableHead>{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-gray-500">{order.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.items.map((item, index) => (
                              <p key={index} className="text-sm">
                                {item.productName} x{item.quantity}
                              </p>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>₹{order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('farmerDashboard.viewOrderDetails')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('farmerDashboard.markAsComplete')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-harvest-green" />
                    {t('farmerDashboard.salesPerformance')}
                  </CardTitle>
                  <CardDescription>{t('farmerDashboard.monthlyRevenueTrends')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('farmerDashboard.thisMonth')}</span>
                      <span className="font-medium">₹{totalRevenue.toFixed(2)}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('farmerDashboard.lastMonth')}</span>
                      <span className="font-medium">₹{(totalRevenue * 0.8).toFixed(2)}</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-harvest-green" />
                    {t('farmerDashboard.customerSatisfaction')}
                  </CardTitle>
                  <CardDescription>{t('farmerDashboard.averageRatingsFeedback')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('farmerDashboard.averageRating')}</span>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="font-medium ml-1">4.6/5.0</span>
                      </div>
                    </div>
                    <Progress value={92} className="h-2" />
                    <div className="text-sm text-gray-600">
                      {t('farmerDashboard.basedOn')} {orders.length * 3} {t('farmerDashboard.customerReviews')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Product Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('farmerDashboard.editProduct')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t('common.name')}
                </Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  {t('common.category')}
                </Label>
                <Input
                  id="category"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  {t('common.price')} (₹)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  {t('common.stock')}
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  {t('common.description')}
                </Label>
                <Input
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('farmerDashboard.saveChanges')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmerDashboardPage; 