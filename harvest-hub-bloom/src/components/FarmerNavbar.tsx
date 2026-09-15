import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Package, LogOut, Plus, BarChart3, User, Sun, Moon } from 'lucide-react';
import { useFarmerAuth } from '@/context/FarmerAuthContext';
import { readAuthSession, updateActiveRole } from '@/lib/authSession';
import LanguageSwitcher from './LanguageSwitcher';
import { useTheme } from '@/context/ThemeContext';

const FarmerNavbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout, userEmail } = useFarmerAuth();
  const { theme, toggleTheme } = useTheme();
  const session = readAuthSession();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSwitchToCustomer = () => {
    // Use existing role-switching logic
    if (session.roles.includes('customer')) {
      updateActiveRole('customer');
      navigate('/home');
    } else {
      // If user doesn't have customer role, just navigate to home
      navigate('/home');
    }
  };

  return (
    <nav className="bg-harvest-green shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/farmer-dashboard" 
            className="flex items-center space-x-3"
          >
            <img 
              src="/images/main-log.png" 
              alt="Harvest Hub" 
              className="h-20 w-auto object-contain mix-blend-multiply"
            />
            <span className="text-white text-xl font-bold">
              {t('farmerNavbar.dashboardForFarmers')}
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-white hover:text-harvest-gold transition-colors flex items-center"
            >
              {t('common.home')}
            </Link>
            <Link 
              to="/farmer-dashboard" 
              className="text-white hover:text-harvest-gold transition-colors flex items-center"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {t('common.dashboard')}
            </Link>
            <Link 
              to="/farmer-products" 
              className="text-white hover:text-harvest-gold transition-colors flex items-center"
            >
              <Package className="h-4 w-4 mr-2" />
              {t('common.products')}
            </Link>
            <Link 
              to="/add-products" 
              className="text-white hover:text-harvest-gold transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('farmerNavbar.addProduct')}
            </Link>
            <button
              onClick={handleSwitchToCustomer}
              className="text-white hover:text-harvest-gold transition-colors flex items-center bg-harvest-gold/20 px-3 py-2 rounded-lg hover:bg-harvest-gold/30"
            >
              <User className="h-4 w-4 mr-2" />
              {t('navbar.switchToCustomer')}
            </button>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {/* Theme Toggle */}
            <Button variant="ghost" className="text-white" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <span className="text-white text-sm hidden md:block">
              {userEmail}
            </span>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-white hover:bg-harvest-gold/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('common.logout')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FarmerNavbar; 