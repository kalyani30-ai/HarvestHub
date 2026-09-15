import { readAuthSession } from '@/lib/authSession';
import { Navigate } from 'react-router-dom';

const CustomerProtectedRoute = ({ children }) => {
  const session = readAuthSession();

  // If user is not logged in, redirect to login
  if (!session.isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // If user doesn't have customer role, redirect to role selection or farmer login
  if (!session.roles || !session.roles.includes('customer')) {
    // If user has farmer role, redirect to farmer experience
    if (session.roles && session.roles.includes('farmer')) {
      return <Navigate to="/farmer-dashboard" />;
    }
    // Otherwise redirect to login
    return <Navigate to="/login" />;
  }

  return children;
};

export default CustomerProtectedRoute; 