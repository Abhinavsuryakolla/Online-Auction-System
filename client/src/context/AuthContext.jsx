import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { showToast } from '../components/toastUtils';

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

  // Listen for real-time wallet updates
  useEffect(() => {
    const handleWalletUpdate = (event) => {
      const { userId, newBalance, change, type } = event.detail;
      
      // Only update if this wallet update is for the current user
      if (user && (user.id === userId || user._id === userId)) {
        setUser(prevUser => ({
          ...prevUser,
          wallet: newBalance
        }));
        
        // Show toast notification based on the type of wallet update
        const changeText = change > 0 ? `+$${change.toFixed(2)}` : `-$${Math.abs(change).toFixed(2)}`;
        const balanceText = `New balance: $${newBalance.toFixed(2)}`;
        
        let message = '';
        let toastType = 'info';
        
        switch (type) {
          case 'blocked':
            message = `Amount blocked: ${changeText}. ${balanceText}`;
            toastType = 'warning';
            break;
          case 'unblocked':
            message = `Amount unblocked: ${changeText}. ${balanceText}`;
            toastType = 'success';
            break;
          case 'purchase':
            message = `Purchase completed: ${changeText}. ${balanceText}`;
            toastType = 'success';
            break;
          case 'added':
            message = `Money added: ${changeText}. ${balanceText}`;
            toastType = 'success';
            break;
          case 'auction_ended_unblocked':
            message = `Auction ended - amount unblocked: ${changeText}. ${balanceText}`;
            toastType = 'info';
            break;
          default:
            message = `Wallet updated: ${changeText}. ${balanceText}`;
            toastType = 'info';
        }
        
        showToast(message, toastType);
      }
    };

    window.addEventListener('walletUpdate', handleWalletUpdate);

    return () => {
      window.removeEventListener('walletUpdate', handleWalletUpdate);
    };
  }, [user]);

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