import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from 'lucide-react';
import FarmerNavbar from '@/components/FarmerNavbar';

interface ProductFormData {
  name: string;
  description: string;
  stock: string;
  price: string;
  category: string;
  images: string;
}

const EditProductPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const productId = searchParams.get('id');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    stock: '',
    price: '',
    category: '',
    images: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!productId) {
      toast({
        title: t('common.error'),
        description: t('editProduct.productIdNotProvided'),
        variant: "destructive",
      });
      navigate('/farmer-products');
      return;
    }

    const fetchProduct = async () => {
      const token = localStorage.getItem('farmerToken');
      if (!token) {
        toast({
          title: t('common.error'),
          description: t('editProduct.loginToEditProducts'),
          variant: "destructive",
        });
        navigate('/farmer-login');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/products/${productId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || '',
            description: data.description || '',
            stock: data.stock?.toString() || '',
            price: data.price?.toString() || '',
            category: data.category || '',
            images: data.images?.[0] || ''
          });
        } else {
          toast({
            title: t('common.error'),
            description: t('editProduct.failedToFetchProduct'),
            variant: "destructive",
          });
          navigate('/farmer-products');
        }
      } catch (error) {
        toast({
          title: t('common.error'),
          description: t('addProduct.failedToConnect'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate, toast]);

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      toast({
        title: t('common.error'),
        description: t('addProduct.allRequiredFields'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const token = localStorage.getItem('farmerToken');
    
    if (!token) {
      toast({
        title: t('common.error'),
        description: t('editProduct.loginToEditProducts'),
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'PUT',
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
          description: t('editProduct.productUpdatedSuccess'),
        });
        
        navigate('/farmer-products');
      } else {
        setIsSubmitting(false);
        toast({
          title: t('common.error'),
          description: data.error || t('editProduct.failedToUpdateProduct'),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-harvest-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50">
      <FarmerNavbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate('/farmer-products')}
            className="mr-4 text-harvest-green hover:bg-harvest-green/10"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('editProduct.backToProducts')}
          </Button>
          <div className="flex items-center">
            <div className="bg-harvest-green p-3 rounded-full mr-4">
              <ArrowLeft className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('editProduct.editProduct')}</h1>
              <p className="text-gray-600">{t('editProduct.updateProductInfo')}</p>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-slide-in">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">{t('editProduct.productDetails')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div>
                <Label htmlFor="name" className="text-gray-700">{t('addProduct.productName')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="mt-1 border-gray-300 focus:border-harvest-green focus:ring-harvest-green"
                  placeholder={t('addProduct.productNamePlaceholder')}
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category" className="text-gray-700">{t('common.category')} *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvest-green focus:border-transparent"
                >
                  <option value="">{t('editProduct.selectCategory')}</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="grains">Grains</option>
                  <option value="dairy">Dairy</option>
                  <option value="poultry">Poultry</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <Label htmlFor="price" className="text-gray-700">{t('editProduct.pricePerKg')} *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                  className="mt-1 border-gray-300 focus:border-harvest-green focus:ring-harvest-green"
                  placeholder={t('addProduct.pricePlaceholder')}
                />
              </div>

              {/* Stock */}
              <div>
                <Label htmlFor="stock" className="text-gray-700">{t('editProduct.stockQuantity')} *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  required
                  className="mt-1 border-gray-300 focus:border-harvest-green focus:ring-harvest-green"
                  placeholder={t('addProduct.stockPlaceholder')}
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-gray-700">{t('common.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1 border-gray-300 focus:border-harvest-green focus:ring-harvest-green"
                  placeholder={t('editProduct.describeProduct')}
                  rows={4}
                />
              </div>

              {/* Image URL */}
              <div>
                <Label htmlFor="images" className="text-gray-700">{t('addProduct.imageUrl')}</Label>
                <Input
                  id="images"
                  value={formData.images}
                  onChange={(e) => handleInputChange('images', e.target.value)}
                  className="mt-1 border-gray-300 focus:border-harvest-green focus:ring-harvest-green"
                  placeholder={t('addProduct.imageUrlPlaceholder')}
                />
                {formData.images && (
                  <div className="mt-2">
                    <img
                      src={formData.images}
                      alt={t('editProduct.productPreview')}
                      className="w-32 h-32 object-cover rounded-md border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.src = '/images/default-product.jpg';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/farmer-products')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-harvest-green hover:bg-harvest-green-dark text-white px-8"
                >
                  {isSubmitting ? t('editProduct.updating') : t('editProduct.updateProduct')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProductPage;
