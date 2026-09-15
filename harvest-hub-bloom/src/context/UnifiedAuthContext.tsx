import React, { createContext, useContext, useState, useEffect } from 'react';
import { readAuthSession, writeAuthSession, clearAuthSession } from '@/lib/authSession';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roles: string[];
  activeRole: string;
  customerProfile?: any;
  farmerProfile?: any;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, userData?: any) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  setActiveRole: (role: string) => void;
}

const UnifiedAuthContext = createContext<AuthContextType | null>(null);

export const UnifiedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const session = readAuthSession();
    return session.user || null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => readAuthSession().isLoggedIn);

  useEffect(() => {
    const syncState = () => {
      const session = readAuthSession();
      setIsLoggedIn(Boolean(session.isLoggedIn));
      setUser(session.user || null);
    };

    syncState();
    window.addEventListener('auth-state-changed', syncState);
    window.addEventListener('storage', syncState);

    return () => {
      window.removeEventListener('auth-state-changed', syncState);
      window.removeEventListener('storage', syncState);
    };
  }, []);

  const login = (email: string, userData: any = null) => {
    const session = readAuthSession();
    const nextUser = userData || session.user || { email };
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
    setUser(nextUser);
    window.dispatchEvent(new Event('auth-state-changed'));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    clearAuthSession();
    window.dispatchEvent(new Event('auth-state-changed'));
  };

  const hasRole = (role: string) => {
    return user?.roles?.includes(role) || false;
  };

  const setActiveRole = (role: string) => {
    if (!user || !user.roles.includes(role)) return;
    
    const updatedUser = { ...user, activeRole: role };
    const session = readAuthSession();
    const nextSession = {
      ...session,
      user: updatedUser,
      activeRole: role,
      userType: role
    };
    writeAuthSession(nextSession);
    setUser(updatedUser);
    window.dispatchEvent(new Event('auth-state-changed'));
  };

  return (
    <UnifiedAuthContext.Provider value={{ user, isLoggedIn, login, logout, hasRole, setActiveRole }}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};
