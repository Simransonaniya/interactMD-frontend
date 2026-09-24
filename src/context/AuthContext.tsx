import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:8001';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('interactmd_jwt_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate token on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser({
            id: userData.id,
            email: userData.email,
            first_name: userData.first_name || userData.firstName || '',
            last_name: userData.last_name || userData.lastName || '',
            role: userData.role || 'LEARNER'
          });
        } else {
          // Token expired or invalid
          localStorage.removeItem('interactmd_jwt_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('[Auth] Auth check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const login = async (email: string, password: string) => {
    console.log(`[Auth] POST ${API_BASE_URL}/api/v1/auth/login`, { email });
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Invalid email or password.' }));
      const errorMsg = errData.detail || 'Login failed. Please check your credentials.';
      console.error('[Auth Error] Login failed:', errorMsg);
      throw new Error(errorMsg);
    }

    const data = await res.json();
    localStorage.setItem('interactmd_jwt_token', data.access_token);
    setToken(data.access_token);
    const u = data.user || {};
    setUser({
      id: u.id,
      email: u.email || email,
      first_name: u.first_name || u.firstName || email.split('@')[0],
      last_name: u.last_name || u.lastName || 'User',
      role: u.role || 'LEARNER'
    });
    console.log('[Auth] Login successful:', u.email);
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    console.log(`[Auth] POST ${API_BASE_URL}/api/v1/auth/register`, { email, firstName, lastName });
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        firstName,
        lastName,
        email,
        password,
        role: 'LEARNER'
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Registration failed.' }));
      const errorMsg = errData.detail || 'Registration failed. An account with this email may already exist.';
      console.error('[Auth Error] Registration failed:', errorMsg);
      throw new Error(errorMsg);
    }

    const data = await res.json();
    localStorage.setItem('interactmd_jwt_token', data.access_token);
    setToken(data.access_token);
    const u = data.user || {};
    setUser({
      id: u.id,
      email: u.email || email,
      first_name: u.first_name || u.firstName || firstName,
      last_name: u.last_name || u.lastName || lastName,
      role: u.role || 'LEARNER'
    });
    console.log('[Auth] Registration successful:', u.email);
  };

  const logout = () => {
    localStorage.removeItem('interactmd_jwt_token');
    setToken(null);
    setUser(null);
    console.log('[Auth] Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
