import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUser,
  logoutUser,
  getMe,
  getAuthToken,
  getStoredUser,
  clearAuthSession,
} from '../Assets/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    async function initAuth() {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await getMe();
        if (res && res.user) {
          setUser(res.user);
          localStorage.setItem('ecobuild_user', JSON.stringify(res.user));
        }
      } catch (err) {
        console.warn('Session check failed or expired:', err.message);
        clearAuthSession();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const handleLogin = async (email, password) => {
    const res = await loginUser(email, password);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: Boolean(token && user),
    loading,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
