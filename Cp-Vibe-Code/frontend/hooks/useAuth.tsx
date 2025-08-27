'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import { 
  AuthUser, 
  CreateUser, 
  Login, 
  AuthTokens, 
  ApiResponse,
  API_ROUTES 
} from '@cp-vibe-code/shared';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: Login) => Promise<void>;
  register: (userData: CreateUser) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check if user is already logged in
    const token = Cookies.get('accessToken');
    if (token) {
      // Validate token by fetching user profile
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get<ApiResponse<AuthUser>>(API_ROUTES.AUTH.PROFILE);
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: Login) => {
    try {
      setIsLoading(true);
      const response = await api.post<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>>(
        API_ROUTES.AUTH.LOGIN,
        credentials
      );

      if (response.data.success && response.data.data) {
        const { user, tokens } = response.data.data;
        
        // Store tokens in cookies
        Cookies.set('accessToken', tokens.accessToken, { expires: 1 }); // 1 day
        Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 }); // 7 days
        
        setUser(user);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: CreateUser) => {
    try {
      setIsLoading(true);
      const response = await api.post<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>>(
        API_ROUTES.AUTH.REGISTER,
        userData
      );

      if (response.data.success && response.data.data) {
        const { user, tokens } = response.data.data;
        
        // Store tokens in cookies
        Cookies.set('accessToken', tokens.accessToken, { expires: 1 }); // 1 day
        Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 }); // 7 days
        
        setUser(user);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear tokens from cookies
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    
    // Clear user state
    setUser(null);
    
    // Optionally call logout endpoint
    api.post(API_ROUTES.AUTH.LOGOUT).catch(() => {
      // Ignore errors for logout endpoint
    });
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
