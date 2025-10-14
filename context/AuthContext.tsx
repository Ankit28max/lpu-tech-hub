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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // To handle initial load

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Here you would typically fetch the user's profile from a /api/profile endpoint
        // to ensure data is fresh and the token is still valid on the server.
        // For simplicity in this step, we'll decode it. A fetch is more secure.
        const decodedToken: { userId: string, username: string, email: string } = jwtDecode(token);
        // This is a placeholder; a real app should fetch to get the full user object.
        // For now, let's just re-set what we can.
        // NOTE: Our current token only has userId. We'll need to fetch.
        
        const fetchUser = async () => {
             const response = await fetch('/api/profile', {
                 headers: {'Authorization': `Bearer ${token}`}
             });
             if (response.ok) {
                 const data = await response.json();
                 setUser(data.user);
             } else {
                 // Token is invalid or expired
                 logout();
             }
        };
        fetchUser();
        
      } catch (error) {
        console.error("Invalid token on load", error);
        logout(); // Clear invalid token
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('authToken', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
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