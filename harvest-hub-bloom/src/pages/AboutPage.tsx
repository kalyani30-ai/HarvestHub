import { useTranslation } from 'react-i18next';
import { Leaf, Users, TrendingUp, ShieldCheck } from 'lucide-react';

const AboutPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 bg-gradient-to-r from-harvest-green to-harvest-green-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('about.title')}</h1>
          <p className="text-xl max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <img 
                src="/mission-image.jpg"
                alt="Farmer technology adoption" 
                className="rounded-lg shadow-xl w-full h-[400px] object-cover"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="section-title text-gray-900 dark:text-white">{t('about.mission')}</h2>
              <p className="text-lg mb-6 text-gray-700 dark:text-white">
                {t('about.missionDescription')}
              </p>
              <p className="text-lg mb-6 text-gray-700 dark:text-white">
                {t('about.missionDescription2')}
              </p>
              <p className="text-lg text-gray-700 dark:text-white">
                {t('about.missionDescription3')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-harvest-cream/30 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-12 text-gray-900 dark:text-white">{t('about.values')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-harvest-green/10 text-harvest-green mb-4">
                <Leaf size={30} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('about.sustainability')}</h3>
              <p className="text-gray-700 dark:text-white">
                {t('about.sustainabilityDescription')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-harvest-gold/10 text-harvest-gold mb-4">
                <Users size={30} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('about.community')}</h3>
              <p className="text-gray-700 dark:text-white">
                {t('about.communityDescription')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-harvest-brown/10 text-harvest-brown mb-4">
                <TrendingUp size={30} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('about.quality')}</h3>
              <p className="text-gray-700 dark:text-white">
                {t('about.qualityDescription')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-harvest-green-dark/10 text-harvest-green-dark mb-4">
                <ShieldCheck size={30} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('about.transparency')}</h3>
              <p className="text-gray-700 dark:text-white">
                {t('about.transparencyDescription')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-12 text-gray-900 dark:text-white">{t('about.team.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mb-4 overflow-hidden rounded-full w-40 h-40 mx-auto">
                <img 
                  src="/team/tech-girl-avatar.jpg" 
                  alt={t('about.team.srinidhi.name')} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.jpg';
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('about.team.srinidhi.name')}</h3>
              <p className="text-harvest-green mb-2">{t('about.team.srinidhi.role')}</p>
              <p className="text-gray-700 dark:text-white">
                {t('about.team.srinidhi.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 overflow-hidden rounded-full w-40 h-40 mx-auto">
                <img 
                  src="/team/tech-girl-avatar.jpg" 
                  alt={t('about.team.sravya.name')} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.jpg';
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('about.team.sravya.name')}</h3>
              <p className="text-harvest-green mb-2">{t('about.team.sravya.role')}</p>
              <p className="text-gray-700 dark:text-white">
                {t('about.team.sravya.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 overflow-hidden rounded-full w-40 h-40 mx-auto">
                <img 
                  src="/team/tech-girl-avatar.jpg" 
                  alt={t('about.team.kalyani.name')} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.jpg';
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('about.team.kalyani.name')}</h3>
              <p className="text-harvest-green mb-2">{t('about.team.kalyani.role')}</p>
              <p className="text-gray-700 dark:text-white">
                {t('about.team.kalyani.description')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
