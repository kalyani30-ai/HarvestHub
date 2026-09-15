import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { readAuthSession } from '@/lib/authSession';
import { Sprout, UserPlus, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";

const FarmerRegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = readAuthSession();

  useEffect(() => {
    // If user is already logged in, redirect to become-seller page
    if (session.isLoggedIn) {
      navigate('/become-seller');
      return;
    }
  }, [navigate, session.isLoggedIn]);

  const handleRegisterAsCustomer = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white px-4 py-10">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Sprout className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-semibold text-slate-900 mb-4">{t('farmer.register.title')}</h1>
        <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
          {t('farmer.register.subtitle')}
        </p>

        <div className="grid gap-6 md:grid-cols-2 max-w-lg mx-auto">
          <Button
            onClick={handleRegisterAsCustomer}
            className="h-16 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center gap-2"
          >
            <UserPlus className="h-6 w-6" />
            <span>{t('farmer.register.registerCustomer')}</span>
          </Button>

          <Button
            onClick={handleLogin}
            variant="outline"
            className="h-16 border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-lg font-semibold rounded-xl transition-all flex flex-col items-center gap-2"
          >
            <LogIn className="h-6 w-6" />
            <span>{t('farmer.register.loginExisting')}</span>
          </Button>
        </div>

        <div className="mt-12 p-6 bg-emerald-50 rounded-2xl border border-emerald-200 max-w-lg mx-auto">
          <h2 className="text-lg font-semibold text-emerald-800 mb-2">{t('farmer.register.whyChange')}</h2>
          <p className="text-sm text-emerald-700">
            {t('farmer.register.explanation')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FarmerRegisterPage;
