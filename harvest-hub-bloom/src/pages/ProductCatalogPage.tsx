import { Leaf, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { demoProducts } from '@/data/demoProducts';
import { useTranslation } from 'react-i18next';

const DemoProductCard = ({ product }: { product: typeof demoProducts[number] }) => {
  const { t } = useTranslation();
  return (
    <Card className="overflow-hidden border border-emerald-900/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
        <Badge className="absolute left-3 top-3 bg-emerald-700 text-white">{t('products.exampleProduct')}</Badge>
      </div>
      <CardContent className="space-y-3 pt-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{product.category}</p>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{t('products.farmer')} {product.farmer}</span>
          <span className="font-semibold text-emerald-700">{product.price}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled className="w-full bg-slate-100 text-slate-500 hover:bg-slate-100">
          {t('products.comingSoon')}
        </Button>
      </CardFooter>
    </Card>
  );
};

const ProductCatalogPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4e8_0%,#fcfaf5_100%)] pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-emerald-900/10 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            <Sparkles className="h-4 w-4" />
            {t('products.demoMode')}
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">{t('products.exampleProducts')}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            {t('products.demoDescription')}
          </p>

          <div className="mt-8 rounded-[1.75rem] border border-dashed border-emerald-200 bg-emerald-50/70 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
              <Leaf className="h-7 w-7 text-emerald-700" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">{t('products.noFarmersYet')}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {t('products.exploreExampleProducts')}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {demoProducts.map((product) => (
            <DemoProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCatalogPage;
