import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getStoredAccessToken,
  getStoredUser,
  clearAuthData,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  const isLoggedIn = !!accessToken && !!user;

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    try {
      const token = await getStoredAccessToken();
      const savedUser = await getStoredUser();

      if (token && savedUser) {
        setAccessToken(token);
        setUser(savedUser);
      } else {
        setAccessToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(authResult) {
    const token = authResult?.data?.access_token;
    const signedUser = authResult?.data?.user;

    setAccessToken(token || null);
    setUser(signedUser || null);
  }

  async function signOut() {
    await clearAuthData();
    setAccessToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({
    isLoading,
    isLoggedIn,
    accessToken,
    user,
    signIn,
    signOut,
    refreshAuth: bootstrap,
  }), [isLoading, isLoggedIn, accessToken, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다.');
  }

  return context;
}