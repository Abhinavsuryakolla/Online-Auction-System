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
      console.log('[SocketProvider] No user ID, skipping socket connection:', user);
      return;
    }

    console.log('[SocketProvider] Creating socket connection for user:', userId);

    const newSocket = io('https://nexora-clrw.onrender.com', {
      withCredentials: true,
      transports: ['websocket'],
      auth: { userId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('[SocketProvider] Socket connected:', newSocket.id, 'User ID:', userId);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[SocketProvider] Connection error:', error.message);
    });

    newSocket.on('reconnect', (attempt) => {
      console.log('[SocketProvider] Reconnected after', attempt, 'attempts');
    });

    newSocket.on('reconnect_failed', () => {
      console.error('[SocketProvider] Reconnection failed');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[SocketProvider] Socket disconnected:', reason);
    });

    newSocket.on('newBid', (bid) => {
      console.log('[SocketProvider] Raw newBid received:', bid);
    });

    setSocket(newSocket);

    return () => {
      console.log('[SocketProvider] Cleaning up socket for user:', userId);
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