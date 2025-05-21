import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { authApi, User } from '../services/api';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading: isUserLoading } = useQuery<User | null>(
    'currentUser',
    async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        return await authApi.getCurrentUser();
      } catch (error) {
        console.error('Failed to fetch current user', error);
        localStorage.removeItem('token');
        return null;
      }
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    }
  );

  useEffect(() => {
    if (localStorage.getItem('token') && !user && !isUserLoading) {
      queryClient.invalidateQueries('currentUser');
    } else {
      setIsLoading(false);
    }
  }, [user, isUserLoading, queryClient]);

  const login = async (email: string, password: string) => {
    try {
      const { token, user } = await authApi.login({ email, password });
      localStorage.setItem('token', token);
      queryClient.setQueryData('currentUser', user);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { token, user } = await authApi.register({ name, email, password });
      localStorage.setItem('token', token);
      queryClient.setQueryData('currentUser', user);
      navigate('/');
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.setQueryData('currentUser', null);
    queryClient.clear();
    navigate('/login');
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const updatedUser = await authApi.updateProfile(updates);
      queryClient.setQueryData('currentUser', updatedUser);
    } catch (error) {
      console.error('Failed to update user', error);
      throw error;
    }
  };

  const value = {
    user: user || null,
    isLoading: isLoading || isUserLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
