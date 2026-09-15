import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  userEmail: string | null;
  userAddress: string | null;
  userType: 'farmer' | 'customer' | null;
  login: (email: string, address?: string, userType?: 'farmer' | 'customer') => void;
  logout: () => void;
  updateAddress: (address: string) => void;
  updateUserType: (userType: 'farmer' | 'customer') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [userType, setUserType] = useState<'farmer' | 'customer' | null>(null);

  useEffect(() => {
    // Check localStorage on mount
    const storedLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedEmail = localStorage.getItem('userEmail');
    const storedAddress = localStorage.getItem('userAddress');
    const storedUserType = localStorage.getItem('userType') as 'farmer' | 'customer' | null;
    // If userType is missing or invalid, force logout
    if (storedLoggedIn && storedEmail && (storedUserType === 'farmer' || storedUserType === 'customer')) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
      if (storedAddress) {
        setUserAddress(storedAddress);
      }
      setUserType(storedUserType);
    } else {
      // Clear all auth info if invalid
      setIsLoggedIn(false);
      setUserEmail(null);
      setUserAddress(null);
      setUserType(null);
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userAddress');
      localStorage.removeItem('userType');
    }
  }, []);

  const login = (email: string, address?: string, userType?: 'farmer' | 'customer') => {
    setIsLoggedIn(true);
    setUserEmail(email);
    if (address) {
      setUserAddress(address);
      localStorage.setItem('userAddress', address);
    }
    if (userType) {
      setUserType(userType);
      localStorage.setItem('userType', userType);
    }
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserEmail(null);
    setUserAddress(null);
    setUserType(null);
    // Clear all localStorage (auth-related)
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAddress');
    localStorage.removeItem('userType');
  };

  const updateAddress = (address: string) => {
    setUserAddress(address);
    localStorage.setItem('userAddress', address);
  };

  const updateUserType = (userType: 'farmer' | 'customer') => {
    setUserType(userType);
    localStorage.setItem('userType', userType);
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      userEmail, 
      userAddress, 
      userType, 
      login, 
      logout, 
      updateAddress, 
      updateUserType 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 