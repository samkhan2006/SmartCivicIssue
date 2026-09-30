import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  role: 'citizen' | 'admin';
  login: (email: string, pass: string) => boolean;
  quickSwitchRole: (newRole: 'citizen' | 'admin') => void;
  logout: () => void;
}

const CITIZEN_USER: User = {
  email: 'citizen@demo.com',
  name: 'Rohan Deshmukh (Citizen)',
  role: 'citizen'
};

const ADMIN_USER: User = {
  email: 'admin@demo.com',
  name: 'Er. Sandeep Patil (CSMC Ward Admin)',
  role: 'admin'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartcivic_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return CITIZEN_USER;
      }
    }
    return CITIZEN_USER;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('smartcivic_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smartcivic_user');
    }
  }, [user]);

  const login = (email: string, pass: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'citizen@demo.com' && pass === '123456') {
      setUser(CITIZEN_USER);
      return true;
    }
    if (cleanEmail === 'admin@demo.com' && pass === 'admin123') {
      setUser(ADMIN_USER);
      return true;
    }
    // Also allow generic match for easy testing
    if (cleanEmail.includes('admin')) {
      setUser(ADMIN_USER);
      return true;
    }
    setUser(CITIZEN_USER);
    return true;
  };

  const quickSwitchRole = (newRole: 'citizen' | 'admin') => {
    if (newRole === 'admin') {
      setUser(ADMIN_USER);
    } else {
      setUser(CITIZEN_USER);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'citizen',
        login,
        quickSwitchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
