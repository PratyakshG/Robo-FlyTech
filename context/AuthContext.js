'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('techstore_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setMounted(true);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('techstore_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('techstore_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, mounted }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
