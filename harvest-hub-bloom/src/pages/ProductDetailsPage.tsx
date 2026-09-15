import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Leaf, Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { demoProducts } from '@/data/demoProducts';
import { useTranslation } from 'react-i18next';

const ProductDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);

  const product = useMemo(() => {
    const selected = demoProducts.find((item) => item.id.toString() === id);
    return selected ?? demoProducts[0];
  }, [id]);

  const relatedProducts = demoProducts.filter((item) => item.id !== product.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4e8_0%,#fcfaf5_100%)] py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" className="mb-6 px-0 text-emerald-700 hover:bg-transparent" onClick={() => navigate('/products')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('productDetails.backToCatalog')}
        </Button>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-emerald-900/10 bg-white p-4 shadow-sm sm:p-6">
            <div className="overflow-hidden rounded-[1.5rem] bg-emerald-50">
              <img src={product.image} alt={product.name} className="h-[420px] w-full object-cover" loading="eager" />
            </div>
            <div className="mt-4 flex gap-3">
              {[product.image, product.image].map((image, index) => (
                <div key={`${product.id}-${index}`} className="h-20 w-20 overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50">
                  <img src={image} alt={`${product.name} view ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-5">
            <div className="rounded-[2rem] border border-emerald-900/10 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-emerald-700 text-white">{t('productDetails.demoProduct')}</Badge>
                <Badge variant="outline" className="text-emerald-700">{product.category}</Badge>
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900">{product.name}</h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {t('productDetails.polishedDemoExperience')}
              </p>

              <div className="mt-5 flex items-center gap-2 text-amber-600">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-semibold">{product.rating}</span>
                <span className="text-sm text-slate-500">• {t('productDetails.demoReviews')}</span>
              </div>

              <div className="mt-6 flex items-end justify-between gap-4 border-t border-emerald-100 pt-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-emerald-700">{t('productDetails.priceLabel')}</p>
                  <p className="text-3xl font-semibold text-slate-900">{product.price}</p>
                </div>
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                  <Leaf className="mr-1 inline h-4 w-4" />
                  {t('productDetails.freshLocal')}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-900/10 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">{t('productDetails.quantityLabel')}</p>
                  <p className="text-sm text-slate-500">{t('productDetails.demoSelectionOnly')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label={t('productDetails.decreaseQuantity')}>-</Button>
                  <span className="w-10 text-center text-lg font-semibold">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity((value) => value + 1)} aria-label={t('productDetails.increaseQuantity')}>+</Button>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1 bg-emerald-700 hover:bg-emerald-800" disabled>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {t('productDetails.addToCart')}
                </Button>
                <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50" disabled>
                  <Heart className="mr-2 h-4 w-4" />
                  {t('productDetails.saveForLater')}
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-900/10 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{t('productDetails.whyShoppersLove')}</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <li>{t('productDetails.premiumLayout')}</li>
                <li>{t('productDetails.touchFriendly')}</li>
                <li>{t('productDetails.isolatedExperience')}</li>
              </ul>
            </div>
          </motion.div>
        </div>

        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">{t('productDetails.relatedExamples')}</h2>
            <Link to="/products" className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1">
              {t('productDetails.viewAll')} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedProducts.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-emerald-900/10 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <img src={item.image} alt={item.name} className="h-40 w-full rounded-[1rem] object-cover" loading="lazy" />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{item.category}</p>
                  </div>
                  <p className="font-semibold text-emerald-700">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
