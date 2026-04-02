import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Check user failed:', err);
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        const error = new Error('Email and password are required');
        error.userMessage = 'Please enter both email and password';
        throw error;
      }

      const res = await api.post('/auth/login', { email, password });
      
      if (!res.data.token) {
        throw new Error('No token received from server');
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Login error:', err);
      }
      // Use custom error message if available
      if (err.userMessage) {
        const error = new Error(err.userMessage);
        error.response = err.response;
        throw error;
      }
      throw err;
    }
  };

  const register = async (email, password, full_name, role, skills, availability) => {
    try {
      if (!email || !password || !full_name || !role) {
        const error = new Error('Missing required fields');
        error.userMessage = 'Please fill in all required fields';
        throw error;
      }

      const res = await api.post('/auth/register', { 
        email, 
        password, 
        full_name, 
        role, 
        skills, 
        availability 
      });
      
      if (!res.data.token) {
        throw new Error('No token received from server');
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Register error:', err);
      }
      // Use custom error message if available
      if (err.userMessage) {
        const error = new Error(err.userMessage);
        error.response = err.response;
        throw error;
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
