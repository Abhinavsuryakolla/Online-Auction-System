import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (!userId) {
      return;
    }

    const newSocket = io('https://nexora-clrw.onrender.com', {
      withCredentials: true,
      transports: ['websocket'],
      auth: { userId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
    });

    newSocket.on('connect_error', (error) => {
      console.error('[SocketProvider] Connection error:', error.message);
    });

    newSocket.on('reconnect', (attempt) => {
    });

    newSocket.on('reconnect_failed', () => {
      console.error('[SocketProvider] Reconnection failed');
    });

    newSocket.on('disconnect', (reason) => {
    });

    newSocket.on('newBid', (bid) => {
    });

    newSocket.on('walletUpdate', (data) => {
      // This will be handled by AuthContext
      window.dispatchEvent(new CustomEvent('walletUpdate', { detail: data }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id, user?._id]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (socket === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
};