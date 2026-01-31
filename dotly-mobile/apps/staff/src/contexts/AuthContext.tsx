import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, AuthToken, initStorage } from '@dotly/core';

interface AuthContextType {
  token: AuthToken | null;
  isLoading: boolean;
  isSignedIn: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<AuthToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bootstrap async data
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      // Initialize storage with AsyncStorage
      initStorage(AsyncStorage);

      const savedToken = await AsyncStorage.getItem('authToken');
      if (savedToken) {
        const tokenData = JSON.parse(savedToken) as AuthToken;
        setToken(tokenData);
        apiClient.setToken(tokenData.token);
      }
    } catch (e) {
      console.error('Failed to restore token:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    try {
      setError(null);
      const response = await apiClient.login(phone, password);

      const authToken: AuthToken = {
        token: response.token,
        userId: response.userId,
        tenantId: response.tenantId,
        role: response.role as any,
      };

      setToken(authToken);
      apiClient.setToken(response.token);
      await AsyncStorage.setItem('authToken', JSON.stringify(authToken));
    } catch (err: any) {
      const errorMsg = apiClient.handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      apiClient.clearToken();
      await AsyncStorage.removeItem('authToken');
    } catch (e) {
      console.error('Failed to logout:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isLoading,
        isSignedIn: !!token,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
