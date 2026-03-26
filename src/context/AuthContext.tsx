import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  user: any;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(
    JSON.parse(localStorage.getItem('wlas_demo_user') || 'null')
  );

  const login = (email: string, pass: string) => {
    if (email === 'admin@wlasmotor.com' && pass === 'demo1234') {
      const demoUser = { email, role: 'admin', name: 'Admin Demo' };
      setUser(demoUser);
      localStorage.setItem('wlas_demo_user', JSON.stringify(demoUser));
      return true;
    }
    alert('Credenciales incorrectas o Supabase no conectado.');
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wlas_demo_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
