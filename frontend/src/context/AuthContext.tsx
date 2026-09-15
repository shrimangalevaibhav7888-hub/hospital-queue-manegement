import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  patientDetails?: any | null;
  doctorDetails?: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [patientDetails, setPatientDetails] = useState<any | null>(null);
  const [doctorDetails, setDoctorDetails] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('craftverse_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('craftverse_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await authApi.getMe();
      setUser(data.user);
      if (data.patient) setPatientDetails(data.patient);
      if (data.doctor) setDoctorDetails(data.doctor);
    } catch (err) {
      console.error('Session validation failed:', err);
      localStorage.removeItem('craftverse_token');
      localStorage.removeItem('craftverse_refresh_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await authApi.login(email, password);
    localStorage.setItem('craftverse_token', data.accessToken);
    localStorage.setItem('craftverse_refresh_token', data.refreshToken);
    setToken(data.accessToken);
    setUser(data.user);
    await refreshUser();
    return data.user;
  };

  const register = async (payload: any): Promise<User> => {
    const data = await authApi.register(payload);
    localStorage.setItem('craftverse_token', data.accessToken);
    localStorage.setItem('craftverse_refresh_token', data.refreshToken);
    setToken(data.accessToken);
    setUser(data.user);
    await refreshUser();
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('craftverse_token');
    localStorage.removeItem('craftverse_refresh_token');
    setUser(null);
    setPatientDetails(null);
    setDoctorDetails(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patientDetails,
        doctorDetails,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
