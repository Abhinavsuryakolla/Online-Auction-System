import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('[AuthProvider] No token found');
          setLoading(false);
          return;
        }

        console.log('[AuthProvider] Checking auth with token');
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = {
          ...res.data.user,
          id: res.data.user._id, // Map _id to id
        };
        console.log('[AuthProvider] User data:', userData);
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
    console.log('[AuthProvider] Logging in:', credentials);
    const res = await axios.post('http://localhost:5000/api/auth/login', credentials);
    localStorage.setItem('token', res.data.token);
    const userData = {
      ...res.data.user,
      id: res.data.user._id, // Map _id to id
    };
    console.log('[AuthProvider] Login user data:', userData);
    setUser(userData);
  };

  const register = async (userData) => {
    console.log('[AuthProvider] Registering:', userData);
    const res = await axios.post('http://localhost:5000/api/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    const registeredUser = {
      ...res.data.user,
      id: res.data.user._id, // Map _id to id
    };
    console.log('[AuthProvider] Registered user data:', registeredUser);
    setUser(registeredUser);
  };

  const logout = () => {
    console.log('[AuthProvider] Logging out');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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