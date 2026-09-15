import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FeaturedCategories = () => {
  const { t } = useTranslation();
  const categories = [
    { id: 1, name: t('home.categories.vegetables'), image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80', link: '/products?category=vegetables' },
    { id: 2, name: t('home.categories.fruits'), image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&q=80', link: '/products?category=fruits' },
    { id: 3, name: t('home.categories.dairy'), image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80', link: '/products?category=dairy' },
    { id: 4, name: t('home.categories.grains'), image: '/lovable-uploads/grains-variety.jpg', link: '/products?category=grains' },
    { id: 5, name: t('home.categories.millets'), image: '/images/millets.jpg', link: '/products?category=millets' },
    { id: 6, name: t('home.categories.pulses'), image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&q=80', link: '/products?category=pulses' },
  ];

  return (
    <section className="page-container">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">{t('home.categories.discoverSeason')}</p>
          <h2 className="section-title mb-0">{t('home.categories.browseCategories')}</h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">{t('home.categories.exploreFreshEssentials')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {categories.map((category) => (
          <Link key={category.id} to={category.link} className="group relative overflow-hidden rounded-[1.5rem] border border-emerald-900/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <div className="aspect-square">
              <img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" decoding="async" width={600} height={600} draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                <p className="mt-1 text-sm text-emerald-50/90">{t('home.categories.shopNow')}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
