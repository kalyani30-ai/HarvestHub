import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, Heart, Package, Sun, Moon, Compass, Repeat2, X as XIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Cart from './Cart';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useUnifiedAuth } from '@/context/UnifiedAuthContext';
import { readAuthSession, updateActiveRole } from '@/lib/authSession';
import LanguageSwitcher from './LanguageSwitcher';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSwitchRoleDialog, setShowSwitchRoleDialog] = useState(false);
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useUnifiedAuth();
  const { theme, toggleTheme } = useTheme();
  const session = readAuthSession();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const navItems = [
    { to: '/home', label: t('common.home') },
    { to: '/products', label: t('common.products') },
    { to: '/orders', label: t('common.orders') },
    { to: '/about', label: t('common.about') },
  ];

  const showRoleSelection = session.isLoggedIn && session.roles.length > 0;

  const handleSwitchRoleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!session.isLoggedIn) {
      navigate('/');
      return;
    }

    // Check if user has both roles
    const hasCustomer = session.roles.includes('customer');
    const hasFarmer = session.roles.includes('farmer');

    if (hasCustomer && hasFarmer) {
      // Dual-role account - switch based on current active role
      if (session.activeRole === 'customer') {
        updateActiveRole('farmer');
        navigate('/farmer-dashboard');
      } else {
        updateActiveRole('customer');
        navigate('/home');
      }
    } else if (hasCustomer && !hasFarmer) {
      // Customer-only - show confirmation dialog
      setShowSwitchRoleDialog(true);
    } else if (hasFarmer && !hasCustomer) {
      // Farmer-only - go to customer home
      updateActiveRole('customer');
      navigate('/home');
    } else {
      // No valid roles - go to landing
      navigate('/');
    }
  };

  const handleSwitchRoleConfirm = () => {
    setShowSwitchRoleDialog(false);
    navigate('/become-seller');
  };

  const handleSwitchRoleCancel = () => {
    setShowSwitchRoleDialog(false);
  };

  const isActive = (path: string) => location.pathname === path || (path === '/home' && location.pathname === '/');

  const handleDashboardClick = () => {
    if (!session.isLoggedIn) {
      alert(t('navbar.pleaseLogin'));
      navigate('/login');
      return;
    }

    // Check user's roles and active role to determine which dashboard to show
    if (session.roles.includes('farmer') && session.activeRole === 'farmer') {
      navigate('/farmer-dashboard');
    } else if (session.roles.includes('customer')) {
      navigate('/customer-dashboard');
    } else {
      alert(t('navbar.pleaseLogin'));
      navigate('/login');
    }
  };

  const handleLogout = () => {
    if (isLoggedIn) {
      logout();
      navigate('/login');
    }
  };

  const handleSwitchRole = (role: string) => {
    if (session.roles.includes(role)) {
      updateActiveRole(role);
      navigate(role === 'farmer' ? '/farmer-dashboard' : '/home');
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(15,23,42,0.08)] dark:bg-slate-950/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 md:h-20">
          <Link to="/home" className="flex items-center gap-3 flex-shrink-0">
            <img
              src="/images/main-log.png"
              alt="Harvest Hub"
              className="h-12 w-auto object-contain md:h-16"
              onError={(e) => {
                e.currentTarget.src = '/fallback-logo.png';
                e.currentTarget.onerror = null;
              }}
            />
            <span className="hidden text-lg font-semibold text-slate-900 sm:block dark:text-slate-100">{t('common.appName')}</span>
          </Link>

          <div className="hidden flex-1 items-center justify-center px-6 lg:flex" />

          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link text-sm ${isActive(item.to) ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'}`}
              >
                {item.label}
              </Link>
            ))}
            {showRoleSelection && (
              <button
                onClick={handleSwitchRoleClick}
                className="nav-link text-sm text-slate-700 dark:text-slate-200"
              >
                {t('navbar.switchRole')}
              </button>
            )}
            <button
              onClick={handleDashboardClick}
              className="nav-link text-sm text-slate-700 dark:text-slate-200"
            >
              {t('common.dashboard')}
            </button>
            <Link to="/premium" className="rounded-full bg-harvest-gold px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-harvest-gold/90">
              {t('common.premium')} ✨
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={t('common.toggleTheme')} className="rounded-full border border-emerald-900/10 bg-white/70 text-slate-700 shadow-sm hover:bg-white dark:bg-slate-900/70 dark:text-slate-100">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 rounded-full border border-emerald-900/10 bg-white/80 p-0 text-slate-700 shadow-sm hover:bg-white dark:bg-slate-900/70 dark:text-slate-100">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                    <Badge variant="outline" className="text-xs">
                      {session.activeRole}
                    </Badge>
                  </div>
                  <DropdownMenuItem onClick={handleDashboardClick}>
                    <Package className="mr-2 h-4 w-4" />
                    <span>{t('common.dashboard')}</span>
                  </DropdownMenuItem>
                  {session.roles.length > 1 && (
                    <>
                      {session.roles.includes('customer') && (
                        <DropdownMenuItem onClick={() => handleSwitchRole('customer')}>
                          <User className="mr-2 h-4 w-4" />
                          <span>{t('navbar.switchToCustomer')}</span>
                        </DropdownMenuItem>
                      )}
                      {session.roles.includes('farmer') && (
                        <DropdownMenuItem onClick={() => handleSwitchRole('farmer')}>
                          <Repeat2 className="mr-2 h-4 w-4" />
                          <span>{t('navbar.switchToFarmer')}</span>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('common.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" className="hidden rounded-full border border-emerald-900/10 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white lg:inline-flex dark:bg-slate-900/70 dark:text-slate-100">
                {t('common.login')}
              </Link>
            )}

            <Link to="/wishlist" className="relative">
              <Button variant="ghost" size="icon" className="rounded-full border border-emerald-900/10 bg-white/80 text-slate-700 shadow-sm hover:bg-white dark:bg-slate-900/70 dark:text-slate-100">
                <Heart className="h-4 w-4" />
              </Button>
              {wishlistItems.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-harvest-gold text-[10px] font-semibold text-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Button variant="ghost" size="icon" className="relative rounded-full border border-emerald-900/10 bg-white/80 text-slate-700 shadow-sm hover:bg-white dark:bg-slate-900/70 dark:text-slate-100" onClick={toggleCart}>
              <ShoppingCart className="h-4 w-4" />
              {cartItems.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-harvest-gold text-[10px] font-semibold text-white">
                  {cartItems.length}
                </span>
              )}
            </Button>

            <Button variant="ghost" size="icon" className="rounded-full border border-emerald-900/10 bg-white/80 text-slate-700 shadow-sm hover:bg-white md:hidden dark:bg-slate-900/70 dark:text-slate-100" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-emerald-900/10 bg-white/95 px-4 py-4 md:hidden dark:bg-slate-950/95">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} className="block rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 dark:text-slate-200 dark:hover:bg-slate-800" onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <button onClick={() => { handleDashboardClick(); setIsMenuOpen(false); }} className="block w-full rounded-2xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50 dark:text-slate-200 dark:hover:bg-slate-800">
                {t('common.dashboard')}
              </button>
              <Link to="/premium" className="mt-2 flex items-center gap-2 rounded-2xl bg-harvest-gold px-3 py-2 text-sm font-semibold text-white" onClick={() => setIsMenuOpen(false)}>
                <Compass className="h-4 w-4" />
                {t('common.premium')}
              </Link>
            </div>
          </div>
        )}
      </nav>

      <Cart isOpen={isCartOpen} onOpenChange={toggleCart} />

      {/* Switch Role Confirmation Dialog */}
      {showSwitchRoleDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                {t('navbar.alreadyLoggedInAsCustomer')}
              </h2>
              <button
                onClick={handleSwitchRoleCancel}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-slate-600 mb-2">
              {t('navbar.sellProductsToo')}
            </p>
            <p className="text-slate-500 text-sm mb-6">
              {t('navbar.sameAccountForBoth')}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleSwitchRoleCancel}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSwitchRoleConfirm}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {t('navbar.continueAsFarmer')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
