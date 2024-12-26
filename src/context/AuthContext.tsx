'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRegistrationData, UserUpdateData } from '@/lib/types/auth';
import { authApi } from '@/lib/api/authApi';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: UserRegistrationData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UserUpdateData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token') || Cookies.get('auth_token');
        if (token) {
          const profile = await authApi.getProfile();
          setUser(profile);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        authApi.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.login(username, password);
      setUser(response.user);
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: UserRegistrationData) => {
    try {
      setLoading(true);
      setError(null);
      await authApi.register(data);
      await login(data.username, data.password);
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    router.push('/login');
  };

  const updateProfile = async (data: UserUpdateData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await authApi.updateProfile(data);
      setUser(updatedUser);
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await authApi.resetPassword(email);
    } catch (error: any) {
      setError(error.message || 'Failed to reset password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
