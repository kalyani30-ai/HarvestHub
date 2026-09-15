import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Star } from 'lucide-react';
import { demoProducts } from '@/data/demoProducts';
import { useTranslation } from 'react-i18next';

const FeaturedProducts = () => {
  const { t } = useTranslation();
  const featuredProduct = demoProducts[0];

  return (
    <section className="page-container">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">{t('home.featuredProducts.demoShowcase')}</p>
          <h2 className="section-title mb-0">{t('home.featuredProducts.title')}</h2>
        </div>
      </div>

      <Card className="overflow-hidden border border-emerald-900/10 bg-white shadow-sm">
        <div className="relative h-60 overflow-hidden">
          <img src={featuredProduct.image} alt={featuredProduct.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
          <Badge className="absolute left-3 top-3 bg-emerald-700 text-white">{t('home.featuredProducts.demoProduct')}</Badge>
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <Leaf className="h-3.5 w-3.5" />{t('home.featuredProducts.exampleProduct')}
          </div>
        </div>
        <CardContent className="space-y-3 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{featuredProduct.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{t('home.featuredProducts.exampleFarmer')} {featuredProduct.farmer}</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
              <Star className="h-3.5 w-3.5 fill-current" />{featuredProduct.rating}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xl font-semibold text-emerald-700">{featuredProduct.price}</p>
            <span className="text-sm font-medium text-slate-500">{t('home.featuredProducts.demoOnly')}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled className="w-full bg-slate-100 text-slate-500 hover:bg-slate-100">
            {t('home.featuredProducts.comingSoon')}
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
};

export default FeaturedProducts;
