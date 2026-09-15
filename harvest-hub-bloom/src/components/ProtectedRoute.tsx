import { useUnifiedAuth } from '@/context/UnifiedAuthContext';
import { readAuthSession } from '@/lib/authSession';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isLoggedIn } = useUnifiedAuth();
  const session = readAuthSession();

  if (!isLoggedIn) {
    // Redirect to the correct login page based on requiredRole
    if (requiredRole === 'farmer') return <Navigate to="/farmer-login" />;
    if (requiredRole === 'customer') return <Navigate to="/login" />;
    return <Navigate to="/login" />;
  }
  if (requiredRole && session.activeRole !== requiredRole) {
    // Redirect to the correct login page if role mismatch
    if (requiredRole === 'farmer') return <Navigate to="/farmer-login" />;
    if (requiredRole === 'customer') return <Navigate to="/login" />;
    return <Navigate to="/login" />;
  }
  return children;
};

export default ProtectedRoute; 