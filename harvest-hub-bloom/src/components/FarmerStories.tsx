import { ChevronLeft, ChevronRight, Leaf } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';

const FarmerStories = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);

  const stories = [
    { id: 1, farmerName: t('home.farmerStories.1.name'), location: t('home.farmerStories.1.location'), story: t('home.farmerStories.1.story'), farmType: t('home.farmerStories.1.farmType') },
    { id: 2, farmerName: t('home.farmerStories.2.name'), location: t('home.farmerStories.2.location'), story: t('home.farmerStories.2.story'), farmType: t('home.farmerStories.2.farmType') },
    { id: 3, farmerName: t('home.farmerStories.3.name'), location: t('home.farmerStories.3.location'), story: t('home.farmerStories.3.story'), farmType: t('home.farmerStories.3.farmType') },
    { id: 4, farmerName: t('home.farmerStories.4.name'), location: t('home.farmerStories.4.location'), story: t('home.farmerStories.4.story'), farmType: t('home.farmerStories.4.farmType') },
    { id: 5, farmerName: t('home.farmerStories.5.name'), location: t('home.farmerStories.5.location'), story: t('home.farmerStories.5.story'), farmType: t('home.farmerStories.5.farmType') },
    { id: 6, farmerName: t('home.farmerStories.6.name'), location: t('home.farmerStories.6.location'), story: t('home.farmerStories.6.story'), farmType: t('home.farmerStories.6.farmType') },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisibleCards(1);
      else if (window.innerWidth < 1024) setVisibleCards(2);
      else setVisibleCards(3);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = stories.length - visibleCards;
  const nextSlide = () => setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));

  return (
    <section className="bg-[linear-gradient(180deg,#f8f4e8_0%,#fefcf6_100%)] py-16">
      <div className="page-container">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">{t('home.farmerStories.communityVoices')}</p>
            <h2 className="section-title mb-0">{t('home.farmerStories.title')}</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">{t('home.farmerStories.description')}</p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[2rem]">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`, willChange: 'transform' }}>
              {stories.map((story) => (
                <div key={story.id} className={`w-full flex-shrink-0 p-3 sm:w-1/2 lg:w-1/3`}>
                  <Card className="h-full border border-emerald-900/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center gap-2 text-emerald-700">
                        <Leaf className="h-4 w-4" />
                        <span className="text-sm font-semibold">{story.farmType}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900">{story.farmerName}</h3>
                      <p className="mt-1 text-sm text-slate-500">{story.location}</p>
                      <p className="mt-4 text-sm leading-7 text-slate-600">{story.story}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <button onClick={prevSlide} className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-1/2 rounded-full border border-emerald-900/10 bg-white p-3 shadow-lg transition hover:bg-emerald-50" aria-label={t('common.previousStory')}>
            <ChevronLeft className="h-5 w-5 text-emerald-700" />
          </button>
          <button onClick={nextSlide} className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2 rounded-full border border-emerald-900/10 bg-white p-3 shadow-lg transition hover:bg-emerald-50" aria-label={t('common.nextStory')}>
            <ChevronRight className="h-5 w-5 text-emerald-700" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FarmerStories;
