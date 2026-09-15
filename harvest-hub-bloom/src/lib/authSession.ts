const SESSION_KEY = 'harvestHubSession';
const LEGACY_CUSTOMER_KEY = 'customerSession';
const LEGACY_FARMER_KEY = 'farmerSession';
const AUTH_STORAGE_KEYS = [
  SESSION_KEY,
  LEGACY_CUSTOMER_KEY,
  LEGACY_FARMER_KEY,
  'customerSession',
  'farmerSession',
  'customerToken',
  'farmerToken',
  'customerUser',
  'farmerUser',
  'userType',
  'userEmail',
  'authSession',
  'harvestHubSession'
];

export interface AuthSession {
  token: string | null;
  isLoggedIn: boolean;
  user: any;
  activeRole: string | null;
  roles: string[];
  userType: string | null;
}

export const readAuthSession = (): AuthSession => {
  if (typeof window === 'undefined') {
    return { token: null, isLoggedIn: false, user: null, activeRole: null, roles: [], userType: null };
  }

  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) {
      const legacy = localStorage.getItem(LEGACY_CUSTOMER_KEY) || localStorage.getItem(LEGACY_FARMER_KEY);
      if (!legacy) {
        return { token: null, isLoggedIn: false, user: null, activeRole: null, roles: [], userType: null };
      }
      return { token: null, isLoggedIn: true, user: null, activeRole: null, roles: [], userType: null };
    }

    const parsed = JSON.parse(stored);
    return {
      token: parsed?.token ?? null,
      isLoggedIn: Boolean(parsed?.isLoggedIn || parsed?.user),
      user: parsed?.user ?? null,
      activeRole: parsed?.activeRole ?? parsed?.user?.activeRole ?? parsed?.userType ?? null,
      roles: Array.isArray(parsed?.roles) ? parsed.roles : parsed?.user?.roles || [],
      userType: parsed?.userType ?? parsed?.activeRole ?? null,
    };
  } catch {
    return { token: null, isLoggedIn: false, user: null, activeRole: null, roles: [], userType: null };
  }
};

export const writeAuthSession = (session: Partial<AuthSession> | null) => {
  if (typeof window === 'undefined') return;

  const nextSession: AuthSession = {
    token: session?.token ?? null,
    isLoggedIn: Boolean(session?.isLoggedIn || session?.user || session?.token),
    user: session?.user ?? null,
    activeRole: session?.activeRole ?? session?.user?.activeRole ?? session?.userType ?? null,
    roles: Array.isArray(session?.roles) ? session.roles : session?.user?.roles || [],
    userType: session?.userType ?? session?.activeRole ?? null,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
  localStorage.setItem('userType', nextSession.activeRole ?? 'customer');
  const activeRole = nextSession.activeRole || nextSession.userType || 'customer';
  localStorage.setItem('customerSession', JSON.stringify({ isLoggedIn: nextSession.isLoggedIn && activeRole === 'customer', userEmail: nextSession.user?.email ?? null }));
  localStorage.setItem('farmerSession', JSON.stringify({ isLoggedIn: nextSession.isLoggedIn && activeRole === 'farmer', userEmail: nextSession.user?.email ?? null }));
  localStorage.setItem('customerToken', nextSession.token ?? '');
  localStorage.setItem('farmerToken', nextSession.token ?? '');
  localStorage.setItem('customerUser', JSON.stringify(nextSession.user ?? {}));
  localStorage.setItem('farmerUser', JSON.stringify(nextSession.user ?? {}));

  if (nextSession.user?.email) {
    localStorage.setItem('userEmail', nextSession.user.email);
  }
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') return;

  AUTH_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  window.dispatchEvent(new Event('auth-state-changed'));
};

export const updateActiveRole = (role: string) => {
  const current = readAuthSession();
  const nextRoles = Array.isArray(current.roles) ? current.roles : [];
  if (!nextRoles.includes(role)) {
    return false;
  }

  const nextSession = {
    ...current,
    activeRole: role,
    userType: role,
    user: {
      ...(current.user || {}),
      activeRole: role,
      roles: nextRoles,
    },
  };
  writeAuthSession(nextSession);
  window.dispatchEvent(new Event('auth-state-changed'));
  return true;
};
