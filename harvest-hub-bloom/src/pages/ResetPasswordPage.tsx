import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const API_URL = (import.meta.env.VITE_API_BASE_URL?.replace(/\/$|\/api$/i, '') || import.meta.env.VITE_API_URL || "http://localhost:5000");

const ResetPasswordPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { token: pathToken } = useParams();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const token = pathToken || searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      toast({
        title: t('common.error'),
        description: t('resetPassword.invalidToken'),
        variant: "destructive",
      });
    }
  }, [token, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: t('common.error'),
        description: t('resetPassword.allFieldsRequired'),
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: t('common.error'),
        description: t('resetPassword.passwordsDoNotMatch'),
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t('common.error'),
        description: t('resetPassword.passwordTooShort'),
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: t('common.error'),
        description: t('resetPassword.invalidToken'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      toast({
        title: t('common.success'),
        description: t('resetPassword.resetSuccess'),
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('resetPassword.resetFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-2 border-red-500/40 bg-white/80 backdrop-blur-lg rounded-2xl dark:bg-[#232526] dark:border-gray-700">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-red-500">
              {t('resetPassword.invalidResetLink')}
            </CardTitle>
            <p className="text-gray-600 dark:text-white mt-2">
              {t('resetPassword.invalidResetLinkDescription')}
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/forgot-password')}
              className="w-full bg-harvest-green hover:bg-harvest-green-dark text-white h-12 text-lg font-semibold rounded-xl shadow-lg"
            >
              Request New Reset Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden flex items-center justify-center p-4">
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

      <Card className="w-full max-w-md shadow-2xl border-2 border-harvest-green/40 bg-white/80 backdrop-blur-lg animate-slide-in rounded-2xl dark:bg-[#232526] dark:border-gray-700">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-harvest-green p-3 rounded-full">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-harvest-green">
            {t('resetPassword.title')}
          </CardTitle>
          <p className="text-gray-600 dark:text-white mt-2">
            {t('resetPassword.description')}
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-100 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-harvest-green" />
                {t('resetPassword.newPassword')}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('resetPassword.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl shadow-sm border-gray-300 focus:border-harvest-green focus:ring-harvest-green dark:bg-[#181a1b] dark:border-gray-700 dark:text-white dark:placeholder-gray-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-harvest-green hover:text-harvest-green-dark transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-gray-700 dark:text-gray-100 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-harvest-green" />
                {t('resetPassword.confirmNewPassword')}
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t('resetPassword.passwordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="rounded-xl shadow-sm border-gray-300 focus:border-harvest-green focus:ring-harvest-green dark:bg-[#181a1b] dark:border-gray-700 dark:text-white dark:placeholder-gray-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-harvest-green hover:text-harvest-green-dark transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="flex items-center space-x-2 text-xs">
                  {password === confirmPassword ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-green-600">{t('resetPassword.passwordsMatch')}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 text-red-500" />
                      <span className="text-red-600">{t('resetPassword.passwordsDoNotMatch')}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-harvest-green hover:bg-harvest-green-dark text-white h-12 text-lg font-semibold rounded-xl shadow-lg" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('resetPassword.resetting')}
                </div>
              ) : (
                t('resetPassword.resetPassword')
              )}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-white">
                {t('forgotPassword.rememberPassword')}{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-harvest-green font-semibold hover:text-harvest-green-dark"
                >
                  {t('common.signIn')}
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
