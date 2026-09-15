import { readAuthSession } from '@/lib/authSession';
import { Navigate } from 'react-router-dom';

const FarmerProtectedRoute = ({ children }) => {
  const session = readAuthSession();
  
  // If user is not logged in, redirect to login
  if (!session.isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  // If user doesn't have farmer role, redirect to role selection or customer login
  if (!session.roles || !session.roles.includes('farmer')) {
    // If user has customer role, redirect to customer experience
    if (session.roles && session.roles.includes('customer')) {
      return <Navigate to="/home" />;
    }
    // Otherwise redirect to login
    return <Navigate to="/login" />;
  }
  
  // User has farmer role, allow access
  return children;
};

export default FarmerProtectedRoute; 