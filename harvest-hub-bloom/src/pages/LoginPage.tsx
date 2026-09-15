import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useUnifiedAuth } from '@/context/UnifiedAuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Eye, EyeOff, Mail, Lock, Sun, Moon, Sparkles } from 'lucide-react';
import { readAuthSession, writeAuthSession } from '@/lib/authSession';
import { useTranslation } from 'react-i18next';

const API_URL = (import.meta.env.VITE_API_BASE_URL?.replace(/\/$|\/api$/i, '') || import.meta.env.VITE_API_URL || "http://localhost:5000");

const LoginPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [roleNotAvailable, setRoleNotAvailable] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useUnifiedAuth();

  // Redirect already logged-in users using unified auth session
  useEffect(() => {
    const session = readAuthSession();
    
    if (session.isLoggedIn) {
      // User is logged in - check if they have customer role
      if (session.roles && session.roles.includes('customer')) {
        // If user has multiple roles, go to role selection
        if (session.roles.length > 1) {
          navigate('/role-selection');
        } else {
          // Only customer role - go to home
          navigate('/home');
        }
      } else {
        // User doesn't have customer role
        navigate('/farmer-login');
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

    if (!isValidEmail(email)) {
      toast({
        title: t('common.error'),
        description: t('auth.invalidEmail'),
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
          userType: 'customer'
        }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = { message: response.statusText || 'Network error during login.' };
      }

      if (!response.ok) {
        const message = data?.message || 'Login failed.';

        if (message.includes("don't have a Customer account") || message.includes("Customer account yet")) {
          setRoleNotAvailable(true);
          toast({
            title: t('auth.customerRoleNotAvailable'),
            description: t('auth.noCustomerRole'),
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

      const sessionData = {
        token: data.token,
        isLoggedIn: true,
        user: data.user,
        activeRole: data.userType,
        roles: data.user.roles || ['customer'],
        userType: data.userType
      };
      writeAuthSession(sessionData);
      login(data.user.email, data.user);

      toast({
        title: t('common.success'),
        description: t('auth.loginSuccess'),
      });

      const userRoles = data.user.roles || ['customer'];
      if (userRoles.length > 1) {
        navigate('/role-selection');
      } else {
        navigate('/home');
      }
    } catch (error: any) {
      const message = error?.message || t('auth.invalidCredentials');
      toast({
        title: t('common.error'),
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,#f8f4e8_0%,#ffffff_100%)] dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[linear-gradient(135deg,#f8f4e8_0%,#ffffff_100%)] dark:bg-gray-900">
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
          <img 
            src="/images/main-log.png" 
            alt="Harvest Hub" 
            className="h-24 w-24 mb-8 animate-float mix-blend-multiply"
          />
          <h1 className="text-5xl font-bold mb-4 text-center">{t('auth.welcomeToHarvestHub')}</h1>
          <p className="text-xl text-green-100 text-center max-w-md">
            {t('auth.harvestHubDescription')}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-green-50 backdrop-blur">
            <Sparkles className="h-4 w-4" />
            {t('auth.premiumDemoExperience')}
          </div>
          <div className="mt-12 flex items-center space-x-8 text-green-100">
            <div className="text-center">
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm">{t('auth.farmers')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sm">{t('auth.customers')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm">{t('auth.organic')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-gray-900 relative">
        {/* Mobile Header with Logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center">
          <img 
            src="/images/main-log.png" 
            alt="Harvest Hub" 
            className="h-10 w-10 mr-2"
          />
          <span className="text-xl font-bold text-harvest-green">Harvest Hub</span>
        </div>

        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-20">
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
        </div>

        <div className="w-full max-w-md mt-16 lg:mt-0">
          <div className="text-center mb-8">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('auth.login')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('auth.welcomeBack')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
                    <strong>{t('auth.customerRoleNotAvailable')}</strong><br />
                    {t('auth.noCustomerRole')}
                  </p>
                  <Button
                    type="button"
                    onClick={() => navigate('/home')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t('auth.continueAsCustomer')}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Footer Links */}
            <div className="text-center space-y-3 pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.dontHaveAccount')}{' '}
                <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold dark:text-green-400">
                  {t('auth.register')}
                </Link>
              </p>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.loginAsFarmer')}{' '}
                <Link to="/farmer-login" className="text-green-600 hover:text-green-700 font-semibold dark:text-green-400">
                  {t('auth.loginHere')}
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

export default LoginPage;