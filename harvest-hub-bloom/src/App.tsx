import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/AboutPage";
import ProductCatalogPage from "./pages/ProductCatalogPage";
import LoginPage from "./pages/LoginPage";
import FarmerLoginPage from "./pages/FarmerLoginPage";
import RegisterPage from "./pages/RegisterPage";
import FarmerRegisterPage from "./pages/FarmerRegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { FarmerAuthProvider } from './context/FarmerAuthContext';
import { useEffect, useState } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from "@/components/ui/use-toast";
import OrdersPage from './pages/OrdersPage';
import PremiumPlansPage from './pages/PremiumPlansPage';
import FarmerStoriesPage from './pages/FarmerStoriesPage';
import AddProductsPage from './pages/AddProductsPage';
import WishlistPage from './pages/WishlistPage';
import FarmerDashboardPage from './pages/FarmerDashboardPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import { OrdersProvider } from './context/OrdersContext';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import FarmerRegistrationForm from './components/FarmerRegistrationForm';
import FarmerProductsPage from './pages/FarmerProductsPage';
import EditProductPage from './pages/EditProductPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import BecomeSellerPage from './pages/BecomeSellerPage';
import ProtectedRoute from './components/ProtectedRoute';
import FarmerProtectedRoute from './components/FarmerProtectedRoute';
import CustomerProtectedRoute from './components/CustomerProtectedRoute';
import TermsPage from './pages/TermsPage';
import { ThemeProvider } from './context/ThemeContext';
import './i18n/i18n';
import VideoIntro from './components/VideoIntro';
import { UnifiedAuthProvider } from './context/UnifiedAuthContext';

const queryClient = new QueryClient();

// PageWrapper now takes a prop to optionally hide the Navbar
const PageWrapper = ({ children, hideNavbar = false }: { children: React.ReactNode, hideNavbar?: boolean }) => (
  <div className="flex flex-col min-h-screen">
    {!hideNavbar && <Navbar />}
    <main className={hideNavbar ? "flex-grow" : "flex-grow pt-20"}>
      {children}
    </main>
    <Footer />
  </div>
);

// Custom AppRoutes to use useLocation
function AppRoutes() {
  const location = useLocation();

  return (
    <Routes>
      {/* Role Selection Page (default) */}
      <Route path="/" element={<LandingPage />} />
      {/* Home Page with slideshow, categories, products, stories, and back button */}
      <Route path="/home" element={<PageWrapper><HomePage /></PageWrapper>} />
      
      {/* Customer Routes - Show navbar and footer */}
      <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
      <Route path="/products" element={<PageWrapper><ProductCatalogPage /></PageWrapper>} />
      <Route path="/product/:id" element={<PageWrapper><ProductDetailsPage /></PageWrapper>} />
      <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
      <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
      <Route path="/forgot-password" element={<PageWrapper><ForgotPasswordPage /></PageWrapper>} />
      <Route path="/reset-password/:token" element={<PageWrapper><ResetPasswordPage /></PageWrapper>} />
      <Route path="/orders" element={<PageWrapper><OrdersPage /></PageWrapper>} />
      <Route path="/premium" element={<PageWrapper><PremiumPlansPage /></PageWrapper>} />
      <Route path="/become-seller" element={<CustomerProtectedRoute><PageWrapper><BecomeSellerPage /></PageWrapper></CustomerProtectedRoute>} />
      <Route path="/farmer-stories" element={<PageWrapper><FarmerStoriesPage /></PageWrapper>} />
      <Route path="/wishlist" element={<PageWrapper><WishlistPage /></PageWrapper>} />
      <Route path="/checkout" element={<PageWrapper><CheckoutPage /></PageWrapper>} />
      <Route path="/customer-dashboard" element={<CustomerProtectedRoute><PageWrapper><CustomerDashboardPage /></PageWrapper></CustomerProtectedRoute>} />
      <Route path="/terms" element={<PageWrapper><TermsPage /></PageWrapper>} />
      
      {/* Farmer Routes - No navbar/footer for registration flow */}
      <Route path="/farmer-register" element={<FarmerRegistrationForm />} />
      <Route path="/farmer-login" element={<FarmerLoginPage />} />
      <Route path="/farmer-dashboard" element={<FarmerProtectedRoute><FarmerDashboardPage /></FarmerProtectedRoute>} />
      <Route path="/add-products" element={<FarmerProtectedRoute><AddProductsPage /></FarmerProtectedRoute>} />
      <Route path="/farmer-products" element={<FarmerProtectedRoute><FarmerProductsPage /></FarmerProtectedRoute>} />
      <Route path="/edit-product" element={<FarmerProtectedRoute><EditProductPage /></FarmerProtectedRoute>} />
      
      <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
    </Routes>
  );
}

const AppContent = () => {
  const location = useLocation();
  const skipIntroRoutes = ['/reset-password', '/forgot-password', '/farmer-login'];
  const shouldSkipIntro = skipIntroRoutes.some((route) => location.pathname.startsWith(route));
  const [showVideoIntro, setShowVideoIntro] = useState(!shouldSkipIntro);

  useEffect(() => {
    if (shouldSkipIntro) {
      setShowVideoIntro(false);
    }
  }, [shouldSkipIntro]);

  useEffect(() => {
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
  }, []);

  const handleVideoComplete = () => {
    setShowVideoIntro(false);
  };

  return (
    <>
      {showVideoIntro && <VideoIntro onComplete={handleVideoComplete} />}
      <AppRoutes />
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <UnifiedAuthProvider>
        <FarmerAuthProvider>
          <QueryClientProvider client={queryClient}>
            <CartProvider>
              <OrdersProvider>
                <WishlistProvider>
                  <TooltipProvider>
                    <Router>
                      <AppContent />
                    </Router>
                    <Toaster />
                    <Sonner />
                  </TooltipProvider>
                </WishlistProvider>
              </OrdersProvider>
            </CartProvider>
          </QueryClientProvider>
        </FarmerAuthProvider>
      </UnifiedAuthProvider>
    </ThemeProvider>
  );
};

export default App;
