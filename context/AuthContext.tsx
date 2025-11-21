// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  _id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

// ... imports

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    const initAuth = async () => {
      // 1. Check NextAuth Session (Google Login)
      if (status === 'authenticated' && session?.user) {
        setUser({
          _id: (session.user as any).id || '',
          username: (session.user as any).username || session.user.name || '',
          email: session.user.email || '',
        });
        setIsLoading(false);
        return;
      }

      // 2. Check Local Token (Email/Password Login)
      if (status === 'unauthenticated' || status === 'loading') {
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const response = await fetch('/api/profile', {
              headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
              const data = await response.json();
              setUser(data.user);
            } else {
              localStorage.removeItem('authToken');
              setUser(null);
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
            localStorage.removeItem('authToken');
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    };

    if (status !== 'loading') {
      initAuth();
    }
  }, [session, status]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('authToken', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    nextAuthSignOut({ callbackUrl: '/login' });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};