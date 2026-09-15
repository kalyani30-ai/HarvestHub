import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Search, 
  Filter, 
  Star, 
  IndianRupee, 
  Package, 
  MapPin, 
  Plus,
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  Award,
  User
} from 'lucide-react';
import FarmerNavbar from '@/components/FarmerNavbar';
import { useFarmerAuth } from '@/context/FarmerAuthContext';

interface FarmerProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: string;
  quality: string;
  unit: string;
  image: string;
  farmerName: string;
  farmerLocation: string;
  rating: number;
  reviews: number;
  addedDate: string;
  status: 'active' | 'inactive';
}

const FarmerProductsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userEmail } = useFarmerAuth();
  const [products, setProducts] = useState<FarmerProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<FarmerProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedQuality, setSelectedQuality] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [farmerData, setFarmerData] = useState<any>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm(t('farmerProducts.deleteConfirm'));
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
        setProducts(products.filter(product => product.id !== productId));
        setFilteredProducts(filteredProducts.filter(product => product.id !== productId));
        console.log('Product deleted successfully');
      } else {
        console.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Handle product edit - navigate to edit page
  const handleEditProduct = (productId: string) => {
    navigate(`/edit-product?id=${productId}`);
  };

  // Handle product view - open in new tab
  const handleViewProduct = (productId: string) => {
    window.open(`/product-details?id=${productId}`, '_blank');
  };

  // Fetch farmer data and products on component mount
  useEffect(() => {
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
          // Transform backend data to match frontend interface
          const transformedProducts = data.map((product: any) => ({
            id: product._id,
            name: product.name,
            description: product.description || '',
            category: product.category,
            price: product.price,
            quantity: product.stock.toString(),
            quality: 'standard', // Default since backend doesn't have quality
            unit: 'kg', // Default since backend doesn't have unit
            image: product.images?.[0] || '/images/default-product.jpg',
            farmerName: farmerData?.name || 'Farmer',
            farmerLocation: farmerData?.farmAddress || 'Location',
            rating: 0, // Backend doesn't have rating
            reviews: 0, // Backend doesn't have reviews
            addedDate: product.createdAt,
            status: product.stock > 0 ? 'active' : 'inactive'
          }));
          setProducts(transformedProducts);
          setFilteredProducts(transformedProducts);
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
  }, []);

  // Filter and search products
  useEffect(() => {
    let filtered = products;

    // Search by name or description
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by quality
    if (selectedQuality !== 'all') {
      filtered = filtered.filter(product => product.quality === selectedQuality);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(product => product.status === selectedStatus);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
          return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedQuality, selectedStatus, sortBy]);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'premium': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'grade-a': return 'bg-green-100 text-green-800 border-green-200';
      case 'grade-b': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'standard': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'vegetables': return 'bg-green-100 text-green-800 border-green-200';
      case 'fruits': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'grains': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dairy': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'poultry': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get current farmer info from localStorage
  const currentFarmerName = farmerData?.name || "Your Farm";
  const currentFarmerLocation = farmerData?.farmAddress || "Your Location";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-harvest-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <FarmerNavbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/farmer-dashboard')}
              className="mr-4 text-harvest-green hover:bg-harvest-green/10"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t('common.backToDashboard')}
            </Button>
            <div className="flex items-center">
              <div className="bg-harvest-green p-3 rounded-full mr-4">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('farmerProducts.myProducts')}</h1>
                <p className="text-gray-600 dark:text-gray-300">{t('farmerProducts.manageInventory')}</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/add-products')}
            className="bg-harvest-green hover:bg-harvest-green-dark text-white px-6 py-3"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('farmerNavbar.addProduct')}
          </Button>
        </div>

        {/* Farmer Info Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8 dark:bg-gray-800/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-harvest-green/10 p-3 rounded-full dark:bg-harvest-green/20">
                  <User className="h-6 w-6 text-harvest-green" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{currentFarmerName}</h3>
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4" />
                    <span>{currentFarmerLocation}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('farmerProducts.totalProducts')}</p>
                <p className="text-2xl font-bold text-harvest-green">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in dark:bg-gray-800/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('farmerProducts.totalProducts')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
                </div>
                <div className="bg-harvest-green/10 p-3 rounded-full dark:bg-harvest-green/20">
                  <Package className="h-6 w-6 text-harvest-green" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in dark:bg-gray-800/80" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('farmerProducts.activeProducts')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.filter(p => p.status === 'active').length}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full dark:bg-green-900/30">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in dark:bg-gray-800/80" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('farmerProducts.totalRevenue')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{products.reduce((sum, p) => sum + p.price * parseInt(p.quantity), 0).toLocaleString()}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full dark:bg-yellow-900/30">
                  <IndianRupee className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in dark:bg-gray-800/80" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('farmerProducts.averageRating')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{(products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1)}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full dark:bg-purple-900/30">
                  <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8 dark:bg-gray-800/80">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder={t('farmerProducts.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-harvest-green focus:ring-harvest-green dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="border-gray-300 focus:border-harvest-green focus:ring-harvest-green dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue placeholder={t('farmerProducts.category')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('farmerProducts.allCategories')}</SelectItem>
                    <SelectItem value="vegetables">{t('farmerProducts.vegetables')}</SelectItem>
                    <SelectItem value="fruits">{t('farmerProducts.fruits')}</SelectItem>
                    <SelectItem value="grains">{t('farmerProducts.grains')}</SelectItem>
                    <SelectItem value="dairy">{t('farmerProducts.dairy')}</SelectItem>
                    <SelectItem value="poultry">{t('farmerProducts.poultry')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quality Filter */}
              <div>
                <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                  <SelectTrigger className="border-gray-300 focus:border-harvest-green focus:ring-harvest-green dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue placeholder={t('farmerProducts.quality')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('farmerProducts.allQuality')}</SelectItem>
                    <SelectItem value="premium">{t('farmerProducts.premium')}</SelectItem>
                    <SelectItem value="grade-a">{t('farmerProducts.gradeA')}</SelectItem>
                    <SelectItem value="grade-b">{t('farmerProducts.gradeB')}</SelectItem>
                    <SelectItem value="standard">{t('farmerProducts.standard')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="border-gray-300 focus:border-harvest-green focus:ring-harvest-green dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue placeholder={t('farmerProducts.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('farmerProducts.allStatus')}</SelectItem>
                    <SelectItem value="active">{t('farmerProducts.active')}</SelectItem>
                    <SelectItem value="inactive">{t('farmerProducts.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border-gray-300 focus:border-harvest-green focus:ring-harvest-green dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue placeholder={t('farmerProducts.sortBy')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">{t('farmerProducts.name')}</SelectItem>
                    <SelectItem value="price-low">{t('farmerProducts.priceLowToHigh')}</SelectItem>
                    <SelectItem value="price-high">{t('farmerProducts.priceHighToLow')}</SelectItem>
                    <SelectItem value="rating">{t('farmerProducts.rating')}</SelectItem>
                    <SelectItem value="recent">{t('farmerProducts.recentlyAdded')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <Card 
              key={product.id} 
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in dark:bg-gray-800/80"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <Badge className={getStatusColor(product.status)}>
                    {product.status}
                  </Badge>
                  <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm font-medium">{product.rating}</span>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-bold text-white">{product.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="h-4 w-4 text-white/80" />
                    <span className="text-white/80 text-sm">{currentFarmerLocation}</span>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed dark:text-gray-300">
                    {product.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getCategoryColor(product.category)}>
                      {product.category}
                    </Badge>
                    <Badge className={getQualityColor(product.quality)}>
                      {product.quality}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <IndianRupee className="h-5 w-5 text-harvest-green" />
                      <span className="text-xl font-bold text-gray-900 dark:text-white">₹{product.price}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">per {product.unit}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {product.quantity} {product.unit} available
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Added {new Date(product.addedDate).toLocaleDateString()}</span>
                    </div>
                    <span>{product.reviews} reviews</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => handleViewProduct(product.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('farmerProducts.viewDetails')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('farmerProducts.editProduct')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('farmerProducts.deleteProduct')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-harvest-green text-harvest-green hover:bg-harvest-green hover:text-white"
                      onClick={() => handleEditProduct(product.id)}
                    >
                      {t('farmerProducts.manage')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('farmerProducts.noProductsFound')}</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== 'all' || selectedQuality !== 'all' || selectedStatus !== 'all'
                  ? t('farmerProducts.tryAdjustingFilters')
                  : t('farmerProducts.noProductsYet')}
              </p>
              <Button 
                onClick={() => navigate('/add-products')}
                className="bg-harvest-green hover:bg-harvest-green-dark text-white"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('farmerProducts.addFirstProduct')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FarmerProductsPage; 