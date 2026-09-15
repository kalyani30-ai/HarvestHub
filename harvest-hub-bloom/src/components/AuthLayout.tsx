
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  image?: string;
  authType: 'login' | 'register';
  userType: 'customer' | 'farmer';
}

const AuthLayout = ({ 
  children, 
  title, 
  subtitle,
  image = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80',
  authType,
  userType
}: AuthLayoutProps) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const oppositeAuthType = authType === 'login' ? 'register' : 'login';
  const authTypeText = authType === 'login' ? t('auth.login') : t('auth.register');
  const oppositeAuthTypeText = authType === 'login' ? t('auth.register') : t('auth.login');
  const userTypeText = userType === 'customer' ? t('landing.customer') : t('landing.farmer');
  const oppositeUserType = userType === 'customer' ? 'farmer' : 'customer';
  const oppositeUserTypeText = userType === 'customer' ? t('landing.farmer') : t('landing.customer');
  
  const getAuthLink = () => {
    const base = authType === 'login' ? '/register' : '/login';
    if (userType === 'farmer') {
      return `${base}-farmer`;
    }
    return base;
  };
  
  const getSwitchUserTypeLink = () => {
    const base = authType === 'login' ? '/login' : '/register';
    if (oppositeUserType === 'farmer') {
      return `${base}-farmer`;
    }
    return base;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      {/* Image Section - Hidden on mobile, visible on larger screens */}
      <div className="hidden md:block md:w-1/2 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }}>
        <div className="h-full bg-black/40 flex items-center justify-center p-12">
          <div className="text-white max-w-md">
            <h1 className="text-4xl font-bold mb-4">Harvest Hub</h1>
            <p className="text-xl">
              {userType === 'customer' 
                ? t('landing.customerDescription')
                : t('landing.farmerDescription')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Form Section */}
      <div className="md:w-1/2 flex items-center justify-center p-4 md:p-12 bg-transparent">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-harvest-brown mb-2">{title}</h2>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
          
          {children}
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {authType === 'login' ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
              {' '}
              <Link to={getAuthLink()} className="text-harvest-green font-semibold hover:text-harvest-green-dark">
                {oppositeAuthTypeText}
              </Link>
            </p>
            
            <p className="mt-4 text-gray-600">
              {`${authTypeText} as a ${oppositeUserTypeText}? `}
              <Link to={getSwitchUserTypeLink()} className="text-harvest-green font-semibold hover:text-harvest-green-dark">
                {`${authTypeText} here`}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
