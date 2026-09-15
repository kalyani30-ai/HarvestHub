import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const API_URL = (import.meta.env.VITE_API_BASE_URL?.replace(/\/$|\/api$/i, '') || import.meta.env.VITE_API_URL || "http://localhost:5000");

const ForgotPasswordPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: t('common.error'),
        description: t('forgotPassword.enterEmail'),
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: t('common.error'),
        description: t('forgotPassword.enterValidEmail'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      toast({
        title: t('common.success'),
        description: t('forgotPassword.resetEmailSent'),
      });

      setEmail('');
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('forgotPassword.failedToSendResetEmail'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-2 border-harvest-green/40 bg-white/80 backdrop-blur-lg animate-slide-in rounded-2xl dark:bg-[#232526] dark:border-gray-700">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-harvest-green p-3 rounded-full">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-harvest-green">
            {t('forgotPassword.title')}
          </CardTitle>
          <p className="text-gray-600 dark:text-white mt-2">
            {t('forgotPassword.description')}
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-100 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-harvest-green" />
                {t('common.email')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('forgotPassword.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl shadow-sm border-gray-300 focus:border-harvest-green focus:ring-harvest-green dark:bg-[#181a1b] dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-harvest-green hover:bg-harvest-green-dark text-white h-12 text-lg font-semibold rounded-xl shadow-lg" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('forgotPassword.sending')}
                </div>
              ) : (
                t('forgotPassword.sendResetLink')
              )}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-white">
                {t('forgotPassword.rememberPassword')}{' '}
                <Link to="/login" className="text-harvest-green font-semibold hover:text-harvest-green-dark">
                  {t('common.signIn')}
                </Link>
              </p>
              
              <p className="text-sm text-gray-600 dark:text-white mt-2">
                {t('forgotPassword.loginAsFarmer')}{' '}
                <Link to="/farmer-login" className="text-harvest-green font-semibold hover:text-harvest-green-dark">
                  {t('forgotPassword.loginHere')}
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
