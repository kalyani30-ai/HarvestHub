import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Package, 
  IndianRupee, 
  Hash, 
  Image as ImageIcon,
  ArrowLeft,
  Plus
} from 'lucide-react';
import FarmerNavbar from '@/components/FarmerNavbar';
import { useToast } from "@/components/ui/use-toast";

interface ProductFormData {
  name: string;
  description: string;
  stock: string;
  price: string;
  category: string;
  images: string;
}


const AddProductsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    stock: '',
    price: '',
    category: '',
    images: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.price || !formData.stock) {
      toast({
        title: t('common.error'),
        description: t('addProduct.allRequiredFields'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Get JWT token from localStorage
    const token = localStorage.getItem('farmerToken');
    
    if (!token) {
      toast({
        title: t('common.error'),
        description: t('addProduct.loginToAddProducts'),
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/products/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          description: formData.description,
          images: formData.images ? [formData.images] : []
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitting(false);
        toast({
          title: t('common.success'),
          description: t('addProduct.productAddedSuccess'),
        });
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          stock: '',
          price: '',
          category: '',
          images: ''
        });
        
        navigate('/farmer-dashboard');
      } else {
        setIsSubmitting(false);
        toast({
          title: t('common.error'),
          description: data.error || t('addProduct.failedToAddProduct'),
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: t('common.error'),
        description: t('addProduct.failedToConnect'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50">
      <FarmerNavbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center mb-8 animate-fade-in">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-[#f0f0f0]">{t('addProduct.addProduct')}</h1>
              <p className="text-gray-600">{t('addProduct.listFreshProduce')}</p>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-slide-in">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-[#f0f0f0] flex items-center justify-center">
              <Plus className="h-6 w-6 mr-2 text-harvest-green" />
{t('addProduct.productInformation')}
            </CardTitle>
            <p className="text-gray-600">
{t('addProduct.provideDetailedInfo')}
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Package className="h-5 w-5 text-harvest-green" />
                  <h3 className="text-lg font-semibold text-gray-700">{t('addProduct.basicInformation')}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-[#f0f0f0]">
                      {t('addProduct.productName')} *
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder={t('addProduct.productNamePlaceholder')}
                            className="h-12 border-gray-300 focus:border-harvest-green focus:ring-harvest-green"
                            required
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('addProduct.descriptiveNamesTip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category" className="dark:text-[#f0f0f0]">
                      {t('common.category')} *
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-harvest-green focus:ring-harvest-green">
                        <SelectValue placeholder={t('addProduct.selectCategory')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetables">Vegetables</SelectItem>
                        <SelectItem value="fruits">Fruits</SelectItem>
                        <SelectItem value="grains">Grains</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="poultry">Poultry</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="dark:text-[#f0f0f0]">
                    {t('common.description')} *
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder={t('addProduct.descriptionPlaceholder')}
                          rows={4}
                          className="border-gray-300 focus:border-harvest-green focus:ring-harvest-green"
                          required
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('addProduct.descriptionTip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Stock */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Hash className="h-5 w-5 text-harvest-green" />
                  <h3 className="text-lg font-semibold text-gray-700">{t('addProduct.stockInformation')}</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock" className="dark:text-[#f0f0f0]">
                    {t('addProduct.availableStock')} *
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) => handleInputChange('stock', e.target.value)}
                          placeholder={t('addProduct.stockPlaceholder')}
                          className="h-12 border-gray-300 focus:border-harvest-green focus:ring-harvest-green"
                          required
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('addProduct.stockTip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <IndianRupee className="h-5 w-5 text-harvest-green" />
                  <h3 className="text-lg font-semibold text-gray-700">{t('addProduct.pricing')}</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price" className="dark:text-[#f0f0f0]">
                    {t('addProduct.pricePerUnit')} *
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            placeholder={t('addProduct.pricePlaceholder')}
                            className="pl-10 h-12 border-gray-300 focus:border-harvest-green focus:ring-harvest-green"
                            required
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('addProduct.priceTip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ImageIcon className="h-5 w-5 text-harvest-green" />
                  <h3 className="text-lg font-semibold text-gray-700">{t('addProduct.productImage')}</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="images" className="dark:text-[#f0f0f0]">
                    {t('addProduct.imageUrl')}
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          id="images"
                          type="url"
                          value={formData.images}
                          onChange={(e) => handleInputChange('images', e.target.value)}
                          placeholder={t('addProduct.imageUrlPlaceholder')}
                          className="h-12 border-gray-300 focus:border-harvest-green focus:ring-harvest-green"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('addProduct.imageUrlTip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/farmer-dashboard')}
                    className="border-harvest-green text-harvest-green hover:bg-harvest-green hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('common.backToDashboard')}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/farmer-products')}
                    className="border-harvest-gold text-harvest-gold hover:bg-harvest-gold hover:text-white"
                  >
                    {t('addProduct.viewAllProducts')}
                  </Button>
                </div>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-harvest-green hover:bg-harvest-green-dark text-white px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('addProduct.addingProduct')}
                    </div>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      {t('addProduct.addProduct')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddProductsPage; 