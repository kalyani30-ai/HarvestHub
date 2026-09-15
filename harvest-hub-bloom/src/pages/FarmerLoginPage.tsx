import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sprout,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { useUnifiedAuth } from '@/context/UnifiedAuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTheme } from '@/context/ThemeContext';
import { readAuthSession, writeAuthSession } from '@/lib/authSession';

const API_URL = (import.meta.env.VITE_API_BASE_URL?.replace(/\/$|\/api$/i, '') || import.meta.env.VITE_API_URL || "http://localhost:5000");

const FarmerLoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [roleNotAvailable, setRoleNotAvailable] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useUnifiedAuth();
  const { theme, toggleTheme } = useTheme();

  // Redirect already logged-in users using unified auth session
  useEffect(() => {
    const session = readAuthSession();
    
    if (session.isLoggedIn) {
      // User is logged in - check if they have farmer role
      if (session.roles && session.roles.includes('farmer')) {
        // If user has multiple roles, go to role selection
        if (session.roles.length > 1) {
          navigate('/role-selection');
        } else {
          // Only farmer role - go to farmer dashboard
          navigate('/farmer-dashboard');
        }
      } else {
        // User doesn't have farmer role
        navigate('/login');
      }
    }
    
    setIsCheckingAuth(false);
  }, [navigate]);

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountNotFound(false);
    setRoleNotAvailable(false);

    if (!email || !password) {
      toast({
        title: t('common.error'),
        description: t('auth.enterEmailPassword'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: 'farmer'
        }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = { message: response.statusText || 'Network error during farmer login.' };
      }

      if (!response.ok) {
        const message = data?.message || 'Login failed.';

        if (message.includes("don't have a Farmer account") || message.includes("Farmer account yet")) {
          setRoleNotAvailable(true);
          toast({
            title: t('auth.farmerRoleNotAvailable'),
            description: t('auth.noFarmerAccess'),
            variant: "destructive",
          });
          return;
        }

        if (message.includes('Invalid credentials') || message.includes('Invalid email or password')) {
          setAccountNotFound(true);
          toast({
            title: t('auth.invalidCredentials'),
            description: t('auth.checkCredentials'),
            variant: "destructive",
          });
          return;
        }

        throw new Error(message);
      }

      writeAuthSession({
        token: data.token,
        isLoggedIn: true,
        user: data.user,
        activeRole: data.userType,
        roles: data.user.roles || ['farmer'],
        userType: data.userType
      });

      login(data.user.email, data.user);

      toast({
        title: t('common.success'),
        description: t('auth.loginSuccess'),
      });

      const userRoles = data.user.roles || ['farmer'];
      if (userRoles.length > 1) {
        navigate('/role-selection');
      } else {
        navigate('/farmer-dashboard');
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.message || t('auth.invalidCredentials'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900">
      {/* Left Side - Agricultural Image (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-800 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Agricultural-themed background pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="farm-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="white" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#farm-pattern)" />
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center h-full p-12 text-white">
          <div className="bg-white/20 p-4 rounded-full mb-8">
            <Sprout className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-center">{t('farmer.login.title')}</h1>
          <p className="text-xl text-green-100 text-center max-w-md">
            {t('farmer.login.subtitle')}
          </p>
          <div className="mt-12 flex items-center space-x-8 text-green-100">
            <div className="text-center">
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm">{t('common.farmer')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sm">{t('common.customer')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm">{t('common.support')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-gray-900 relative overflow-y-auto">
        {/* Mobile Header with Logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center">
          <div className="bg-harvest-green p-2 rounded-full mr-2">
            <Sprout className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-harvest-green">Harvest Hub</span>
        </div>

        {/* Theme Toggle and Language Switcher */}
        <div className="absolute top-6 right-6 z-20 flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-md">
            <LanguageSwitcher />
          </div>
        </div>

        <div className="w-full max-w-md mt-16 lg:mt-0">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-harvest-green p-3 rounded-full mr-3">
                <Sprout className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('farmer.login.title')}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t('auth.welcomeBack')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                {t('auth.email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setAccountNotFound(false);
                  }}
                  required
                  className="pl-12 h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 transition-all"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                  {t('auth.password')}
                </Label>
                <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700 dark:text-green-400">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAccountNotFound(false);
                  }}
                  required
                  className="pl-12 pr-12 h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember-me" 
                checked={rememberMe} 
                onCheckedChange={(checked) => setRememberMe(checked as boolean)} 
              />
              <Label htmlFor="remember-me" className="text-sm cursor-pointer text-gray-700 dark:text-gray-300">{t('auth.rememberMe')}</Label>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('auth.signingIn')}
                </div>
              ) : (
                t('auth.signIn')
              )}
            </Button>
            
            {/* Account Not Found Message */}
            {accountNotFound && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                <div className="text-center">
                  <p className="text-orange-800 dark:text-orange-200 text-sm mb-3">
                    <strong>{t('auth.invalidCredentials')}</strong> {t('auth.checkCredentials')}
                  </p>
                </div>
              </div>
            )}

            {/* Role Not Available Message */}
            {roleNotAvailable && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="text-center">
                  <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                    <strong>{t('auth.farmerRoleNotAvailable')}</strong><br />
                    {t('auth.noFarmerAccess')}
                  </p>
                  <Button
                    type="button"
                    onClick={() => navigate('/become-seller')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t('farmer.login.becomeSeller')}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Footer Links */}
            <div className="text-center space-y-3 pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('farmer.login.noAccount')}{' '}
                <Link to="/farmer-register" className="text-green-600 hover:text-green-700 font-semibold dark:text-green-400">
                  {t('farmer.login.register')}
                </Link>
              </p>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('farmer.login.customerLogin')}{' '}
                <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold dark:text-green-400">
                  {t('auth.login')}
                </Link>
              </p>
              
              <Button 
                variant="link" 
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => navigate('/terms')}
              >
                {t('auth.termsAndConditions')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FarmerLoginPage;
