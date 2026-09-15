import React, { createContext, useContext, useState, useEffect } from 'react';
import { readAuthSession, writeAuthSession, clearAuthSession } from '@/lib/authSession';

const FarmerAuthContext = createContext(null);

export const FarmerAuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => readAuthSession().isLoggedIn);
  const [userEmail, setUserEmail] = useState(() => readAuthSession().user?.email ?? null);

  useEffect(() => {
    const syncState = () => {
      const session = readAuthSession();
      setIsLoggedIn(Boolean(session.isLoggedIn));
      setUserEmail(session.user?.email ?? null);
    };

    syncState();
    window.addEventListener('auth-state-changed', syncState);
    window.addEventListener('storage', syncState);

    return () => {
      window.removeEventListener('auth-state-changed', syncState);
      window.removeEventListener('storage', syncState);
    };
  }, []);

  const login = (email, user = null) => {
    const session = readAuthSession();
    const nextUser = user || session.user || { email };
    const nextSession = {
      ...session,
      isLoggedIn: true,
      user: { ...nextUser, email: nextUser.email || email },
      userType: nextUser.activeRole || nextUser.userType || 'farmer',
      activeRole: nextUser.activeRole || nextUser.userType || 'farmer',
      roles: nextUser.roles || ['farmer']
    };
    writeAuthSession(nextSession);
    setIsLoggedIn(true);
    setUserEmail(nextUser.email || email);
    window.dispatchEvent(new Event('auth-state-changed'));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserEmail(null);
    clearAuthSession();
    window.dispatchEvent(new Event('auth-state-changed'));
  };

  return (
    <FarmerAuthContext.Provider value={{ isLoggedIn, userEmail, login, logout }}>
      {children}
    </FarmerAuthContext.Provider>
  );
};

export const useFarmerAuth = () => useContext(FarmerAuthContext);