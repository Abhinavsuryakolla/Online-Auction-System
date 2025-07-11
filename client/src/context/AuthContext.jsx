import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await axios.get(BASE_URL + '/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = {
          ...res.data.user,
          id: res.data.user._id, // Map _id to id
        };
        setUser(userData);
      } catch (err) {
        console.error('[AuthProvider] Auth check error:', err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const res = await axios.post(BASE_URL + '/auth/login', credentials);
    localStorage.setItem('token', res.data.token);
    const userData = {
      ...res.data.user,
      id: res.data.user._id, // Map _id to id
    };
    setUser(userData);
  };

  const register = async (userData) => {
    const res = await axios.post(BASE_URL + '/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    const registeredUser = {
      ...res.data.user,
      id: res.data.user._id, // Map _id to id
    };
    setUser(registeredUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {!loading && children}
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