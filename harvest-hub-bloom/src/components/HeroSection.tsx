import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: "/lovable-uploads/ccba6f44-8fe7-44bf-b345-746034497918.png",
      title: t('home.hero.title'),
      description: t('home.hero.subtitle'),
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&q=80",
      title: t('home.hero.title2'),
      description: t('home.hero.subtitle2'),
    },
    {
      id: 3,
      image: "/images/organic-grains.webp",
      title: t('home.hero.title3'),
      description: t('home.hero.subtitle3'),
    },
    {
      id: 4,
      image: "/lovable-uploads/5c2323fb-6460-4b7d-bb1e-4a05a4dd23cd.png",
      title: t('home.hero.title4'),
      description: t('home.hero.subtitle4'),
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[78vh] min-h-[560px] overflow-hidden bg-slate-950">
      {slides.map((slide, index) => (
        <div key={slide.id} className={`absolute inset-0 transition-all duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#163021]/80 via-[#163021]/50 to-[#163021]/30" />
          <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" loading={index === currentSlide ? 'eager' : 'lazy'} decoding="async" draggable={false} />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
            <div className="max-w-3xl rounded-[2rem] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md sm:p-8 lg:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">{t('home.heroSection.brand')}</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                {slide.title}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-emerald-50/90 sm:text-xl">
                {slide.description}
              </p>
            </div>
          </div>
        </div>
      ))}

      <button onClick={prevSlide} className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20" aria-label={t('common.previousSlide')}>
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20" aria-label={t('common.nextSlide')}>
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button key={index} onClick={() => setCurrentSlide(index)} className={`h-2.5 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/50'}`} aria-label={t('common.goToSlide', { index: index + 1 })} />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
