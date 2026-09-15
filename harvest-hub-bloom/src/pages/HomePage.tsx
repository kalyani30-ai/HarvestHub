import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTheme } from '@/context/ThemeContext';
import { readAuthSession } from '@/lib/authSession';
import HeroSection from '@/components/HeroSection';
import FeaturedCategories from '@/components/FeaturedCategories';
import FeaturedProducts from '@/components/FeaturedProducts';
import FarmerStories from '@/components/FarmerStories';

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const session = readAuthSession();

  const handleBackClick = () => {
    if (session.isLoggedIn) {
      navigate('/role-selection');
    } else {
      navigate('/');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-[#121212] dark:text-[#f0f0f0] relative"
    >
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Back Button to Role Selection or Landing Page */}
      <nav className="flex items-center p-4">
        <Button variant="ghost" onClick={handleBackClick} className="flex items-center text-harvest-green hover:text-harvest-gold dark:text-yellow-300 dark:hover:text-yellow-400 dark:text-[#f0f0f0]">
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('common.back')}
        </Button>
      </nav>
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <FarmerStories />
    </motion.div>
  );
};

export default HomePage;
