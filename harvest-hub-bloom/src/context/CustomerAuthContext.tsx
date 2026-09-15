import React, { createContext, useContext, useState, useEffect } from 'react';
import { readAuthSession, writeAuthSession, clearAuthSession } from '@/lib/authSession';

const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
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
      userType: nextUser.activeRole || nextUser.userType || 'customer',
      activeRole: nextUser.activeRole || nextUser.userType || 'customer',
      roles: nextUser.roles || ['customer']
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
    <CustomerAuthContext.Provider value={{ isLoggedIn, userEmail, login, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => useContext(CustomerAuthContext);