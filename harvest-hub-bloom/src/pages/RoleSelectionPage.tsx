import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { User, Package, Sun, Moon, X } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTheme } from '@/context/ThemeContext';
import { readAuthSession, updateActiveRole } from '@/lib/authSession';

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const session = readAuthSession();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState<{ show: boolean; targetRole: string }>({ show: false, targetRole: '' });

  const handleRoleSelect = (role: 'farmer' | 'customer') => {
    setSelectedRole(role);

    if (!session.isLoggedIn) {
      // Unauthenticated - same behavior as LandingPage
      setTimeout(() => {
        if (role === 'farmer') {
          navigate('/farmer-login');
        } else {
          navigate('/login');
        }
      }, 300);
      return;
    }

    // Authenticated - check if user has the role
    if (!session.roles.includes(role)) {
      // Show upgrade dialogue
      setShowUpgradeDialog({ show: true, targetRole: role });
      setSelectedRole(null);
      return;
    }

    // User has the role - navigate directly
    setTimeout(() => {
      updateActiveRole(role);
      if (role === 'farmer') {
        navigate('/farmer-dashboard');
      } else {
        navigate('/home');
      }
    }, 300);
  };

  const handleUpgradeConfirm = () => {
    setShowUpgradeDialog({ show: false, targetRole: '' });
    if (showUpgradeDialog.targetRole === 'farmer') {
      navigate('/become-seller');
    } else if (showUpgradeDialog.targetRole === 'customer') {
      navigate('/home');
    }
  };

  const handleUpgradeCancel = () => {
    setShowUpgradeDialog({ show: false, targetRole: '' });
    setSelectedRole(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/farm-bg.jpeg')",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
        <img
          src="/images/main-log.png"
          alt="Harvest Hub Logo"
          className="h-16 w-16 md:h-20 md:w-20 object-contain mix-blend-multiply"
        />
      </div>

      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 md:h-5 md:w-5" />
          ) : (
            <Moon className="h-4 w-4 md:h-5 md:w-5" />
          )}
        </Button>
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 md:px-8">
        <div className="text-center mb-8 md:mb-12 animate-fade-in w-full max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg">
            <span className="font-sans">{t('landing.welcome')} </span>
            <span className="font-calligraphic font-semibold">Harvest Hub</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-md px-2">
            {t('landing.tagline')}
          </p>
        </div>

        <div className="text-center animate-fade-in-delay w-full max-w-2xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 drop-shadow-lg">
            {t('landing.chooseRole')}
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
            <Button
              className={`bg-harvest-green hover:bg-harvest-green-dark text-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto ${selectedRole === 'farmer' ? 'scale-105 shadow-xl' : ''}`}
              onClick={() => handleRoleSelect('farmer')}
              disabled={selectedRole !== null}
            >
              <Package className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              {t('landing.farmer')}
            </Button>

            <Button
              className={`bg-harvest-gold hover:bg-harvest-gold/90 text-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto ${selectedRole === 'customer' ? 'scale-105 shadow-xl' : ''}`}
              onClick={() => handleRoleSelect('customer')}
              disabled={selectedRole !== null}
            >
              <User className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              {t('landing.customer')}
            </Button>
          </div>
        </div>
      </div>

      {/* Upgrade Dialogue Modal */}
      {showUpgradeDialog.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                {showUpgradeDialog.targetRole === 'farmer' ? t('roleSelection.alreadyLoggedInAsCustomer') : t('roleSelection.alreadyLoggedInAsFarmer')}
              </h2>
              <button
                onClick={handleUpgradeCancel}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-slate-600 mb-2">
              {showUpgradeDialog.targetRole === 'farmer'
                ? t('roleSelection.continueAsFarmer')
                : t('roleSelection.continueAsCustomer')}
            </p>
            <p className="text-slate-500 text-sm mb-6">
              {showUpgradeDialog.targetRole === 'farmer'
                ? t('roleSelection.sameAccountForBoth')
                : t('roleSelection.sameAccountForBothShopping')}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleUpgradeCancel}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleUpgradeConfirm}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {showUpgradeDialog.targetRole === 'farmer' ? t('roleSelection.continueAsFarmerButton') : t('roleSelection.continueAsCustomerButton')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelectionPage;
