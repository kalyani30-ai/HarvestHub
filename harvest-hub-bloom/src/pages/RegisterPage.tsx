import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from '@/context/ThemeContext';
import { useRef } from 'react';
import { Eye, EyeOff, Mail, Lock, User, MapPin, CheckCircle, XCircle, Phone, Sun, Moon, Sparkles } from 'lucide-react';
import { useUnifiedAuth } from '@/context/UnifiedAuthContext';
import { writeAuthSession, readAuthSession } from '@/lib/authSession';

const API_URL = (import.meta.env.VITE_API_BASE_URL?.replace(/\/$|\/api$/i, '') || import.meta.env.VITE_API_URL || "http://localhost:5000");

const RegisterPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsError, setTermsError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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
      } else if (session.roles && session.roles.includes('farmer')) {
        // User has farmer role - go to farmer dashboard
        navigate('/farmer-dashboard');
      }
    }
  }, [navigate]);

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation function
  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10,}$/;
    return phoneRegex.test(phone);
  };

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    
    if (score < 3) return { strength: 'weak', color: 'text-red-500', checks };
    if (score < 5) return { strength: 'medium', color: 'text-yellow-500', checks };
    return { strength: 'strong', color: 'text-green-500', checks };
  };

  const passwordStrength = getPasswordStrength(password);

  // Speech synthesis states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTerm, setCurrentTerm] = useState(0);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const terms = t('customer.terms.list', { returnObjects: true }) as string[];
  const totalTerms = terms.length;
  const langMap: Record<string, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    ta: 'ta-IN',
    te: 'te-IN',
  };

  const handlePlay = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setCurrentTerm(0);
    const utterance = new window.SpeechSynthesisUtterance(terms.join('. '));
    utterance.lang = langMap[i18n.language] || 'en-US';
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentTerm(totalTerms);
    };
    utterance.onboundary = (event: any) => {
      if (event.name === 'sentence' || event.charIndex > 0) {
        const spoken = utterance.text.slice(0, event.charIndex);
        const idx = spoken.split('.').length - 1;
        setCurrentTerm(idx);
      }
    };
    synthRef.current = utterance;
    setIsSpeaking(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPaused(false);
    setIsSpeaking(false);
    setCurrentTerm(0);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setTermsError('');

    if (!name || !email || !password || !confirmPassword || !phone || !address) {
      toast({
        title: t('common.error'),
        description: t('auth.allFieldsRequired'),
        variant: "destructive",
      });
      return;
    }

    if (!isValidPhone(phone)) {
      toast({
        title: t('common.error'),
        description: t('auth.validPhone'),
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: t('common.error'),
        description: t('auth.passwordsDoNotMatch'),
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

    if (!acceptTerms) {
      setTermsError(t('customer.terms.error'));
      toast({
        title: t('common.error'),
        description: t('auth.termsRequired'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          role: 'customer',
          roles: ['customer'],
          address
        }),
      });

      let registerData: any = {};
      try {
        registerData = await registerResponse.json();
      } catch {
        registerData = { message: registerResponse.statusText || 'Registration failed.' };
      }

      if (!registerResponse.ok) {
        throw new Error(registerData.message || registerData.error || `Registration failed (${registerResponse.status}).`);
      }

      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: 'customer'
        }),
      });

      let loginData: any = {};
      try {
        loginData = await loginResponse.json();
      } catch {
        loginData = { message: loginResponse.statusText || 'Login failed after registration.' };
      }

      if (!loginResponse.ok) {
        throw new Error(loginData.message || loginData.error || 'Login failed after registration.');
      }

      writeAuthSession({
        token: loginData.token,
        isLoggedIn: true,
        user: loginData.user,
        activeRole: loginData.userType || 'customer',
        roles: loginData.user.roles || ['customer'],
        userType: loginData.userType || 'customer'
      });

      login(loginData.user.email, loginData.user);

      toast({
        title: t('common.success'),
        description: registerData.existing ? t('auth.accountExists') : t('auth.registrationSuccess'),
        variant: 'default',
      });

      navigate('/home');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: t('auth.networkError'),
        description: error?.message || t('auth.connectionFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-5xl font-bold mb-4 text-center">{t('auth.createAccount')}</h1>
          <p className="text-xl text-green-100 text-center max-w-md">
            {t('auth.signUp')}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-green-50 backdrop-blur">
            <Sparkles className="h-4 w-4" />
            {t('common.premium')}
          </div>
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
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm">{t('common.organic')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-gray-900 relative overflow-y-auto">
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
              {t('auth.createAccount')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('auth.signUp')}
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">
                {t('common.name')}
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder={t('common.firstName')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-12 h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 transition-all"
                />
              </div>
            </div>
            
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 transition-all"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300 font-medium">
                {t('common.phoneNumber')}
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t('auth.phoneNumberPlaceholder')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  pattern="[0-9]{10,}"
                  maxLength={15}
                  className="pl-12 h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 transition-all"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('auth.phoneRequired')}
              </p>
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                {t('auth.password')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${passwordStrength.color}`}>
                      {t('auth.passwordStrength')} {passwordStrength.strength}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs">
                      {passwordStrength.checks.length ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-gray-600 dark:text-gray-400">{t('auth.passwordMinLength')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      {passwordStrength.checks.lowercase ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-gray-600 dark:text-gray-400">{t('auth.oneLowercase')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      {passwordStrength.checks.uppercase ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-gray-600 dark:text-gray-400">{t('auth.oneUppercase')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      {passwordStrength.checks.number ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-gray-600 dark:text-gray-400">{t('auth.oneNumber')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      {passwordStrength.checks.special ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-gray-600 dark:text-gray-400">{t('auth.oneSpecial')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-gray-700 dark:text-gray-300 font-medium">
                {t('auth.confirmPassword')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-12 pr-12 h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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
                    <><CheckCircle className="h-3 w-3 text-green-500" /><span className="text-green-600">{t('auth.passwordsMatch')}</span></>
                  ) : (
                    <><XCircle className="h-3 w-3 text-red-500" /><span className="text-red-600">{t('auth.passwordsDoNotMatch')}</span></>
                  )}
                </div>
              )}
            </div>

            {/* Address Field */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-700 dark:text-gray-300 font-medium">
                {t('common.address')}
              </Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <Textarea
                  id="address"
                  placeholder={t('auth.addressPlaceholder')}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  required
                  className="pl-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 transition-all resize-none"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('auth.addressDescription')}
              </p>
            </div>
            
            {/* Terms & Conditions */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-start">
                <Checkbox
                  id="agree-terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(!!checked)}
                  className="mt-0.5"
                />
                <div className="ml-3 flex-1">
                  <Label htmlFor="agree-terms" className="text-sm cursor-pointer text-gray-700 dark:text-gray-300">
                    {t('auth.agreeToTerms')}
                  </Label>
                  <button
                    type="button"
                    className="ml-2 text-green-600 hover:text-green-700 text-xs focus:outline-none"
                    onClick={() => setShowTerms((prev) => !prev)}
                  >
                    {showTerms ? t('common.close') : t('common.viewTerms')}
                  </button>
                  {termsError && <div className="text-red-600 text-xs mt-1">{termsError}</div>}
                </div>
              </div>
              {showTerms && (
                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                  <ul className="list-disc pl-6 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {terms.map((term, idx) => (
                      <li key={idx}>{term}</li>
                    ))}
                  </ul>
                  {/* Speech Synthesis Controls */}
                  <div className="flex items-center justify-center space-x-2 mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <button
                      type="button"
                      onClick={handlePlay}
                      disabled={isSpeaking && !isPaused}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <span>{isSpeaking && !isPaused ? t('auth.playing') : t('auth.listen')}</span>
                    </button>
                    {isSpeaking && (
                      <><button
                        type="button"
                        onClick={handlePause}
                        disabled={isPaused}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                      >
                        {isPaused ? t('auth.resume') : t('auth.pause')}
                      </button>
                      <button
                        type="button"
                        onClick={handleStop}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                      >
                        {t('auth.stop')}
                      </button></>
                    )}
                    {isSpeaking && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {currentTerm}/{totalTerms}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                  {t('auth.creatingAccount')}
                </div>
              ) : (
                t('auth.createAccount')
              )}
            </Button>
            
            {/* Footer Links */}
            <div className="text-center space-y-3 pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.alreadyHaveAccount')}{' '}
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
export default RegisterPage;
