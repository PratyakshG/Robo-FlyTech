'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('techstore_user');
      if (stored) {
        setUser(JSON.parse(stored));
        document.cookie = `techstore_user=${encodeURIComponent(stored)};path=/;max-age=${60 * 60 * 24 * 7};SameSite=Lax`;
      }
    } catch {}
    setMounted(true);

    // Re-check auth when page is restored from bfcache (back/forward navigation)
    const handlePageShow = (e) => {
      if (e.persisted) {
        try {
          const stored = localStorage.getItem('techstore_user');
          setUser(stored ? JSON.parse(stored) : null);
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('techstore_user', JSON.stringify(userData));
    // Set cookie so middleware can enforce role-based routing
    document.cookie = `techstore_user=${encodeURIComponent(JSON.stringify(userData))};path=/;max-age=${60 * 60 * 24 * 7};SameSite=Lax`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('techstore_user');
    document.cookie = 'techstore_user=;path=/;max-age=0';
    // Force full page reload to bust bfcache on all pages
    window.location.replace('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, mounted }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
