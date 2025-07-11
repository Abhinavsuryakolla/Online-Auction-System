import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import Notification from '../components/Notification';
import { BASE_URL } from '../utils/constants';
import { useEffect as useReactEffect } from 'react';

const Notifications = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ensure body and html backgrounds are always dark
  useReactEffect(() => {
    document.body.classList.add('bg-black');
    document.documentElement.classList.add('bg-black');
    return () => {
      document.body.classList.remove('bg-black');
      document.documentElement.classList.remove('bg-black');
    };
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setNotifications([]);
          setLoading(false);
          return;
        }
        const res = await axios.get(BASE_URL+'/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const validNotifications = res.data
          .filter((n) => n && n._id && typeof n.read === 'boolean')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(validNotifications);
        setLoading(false);
      } catch (err) {
        console.error('[Notifications] Error fetching notifications:', err.message);
        setNotifications([]);
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleNewNotification = (notification) => {
      if (!notification || !notification._id || typeof notification.read !== 'boolean') {
        return;
      }
      setNotifications((prev) => {
        if (prev.some((n) => n._id === notification._id)) {
          return prev;
        }
        return [notification, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
    };

    const handleNotificationRead = ({ _id, read }) => {
      setNotifications((prev) =>
        prev.map((n) => (n._id === _id ? { ...n, read } : n))
      );
    };

    socket.on('newNotification', handleNewNotification);
    socket.on('notificationRead', handleNotificationRead);

    return () => {
      socket.off('newNotification', handleNewNotification);
      socket.off('notificationRead', handleNotificationRead);
    };
  }, [socket, user]);

  const markAsRead = async (id) => {
    try {
      const res = await axios.put(BASE_URL+`/notifications/${id}/read`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('[Notifications] Error marking as read:', err.message);
      throw err; // Propagate to Notification.jsx
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col flex-grow w-full pt-24 px-4 relative overflow-hidden" style={{ minHeight: '100vh', backgroundColor: '#000' }}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-cyan-700 via-blue-900 to-black opacity-30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-pink-700 via-cyan-700 to-black opacity-20 rounded-full blur-3xl animate-pulse" />
      </div>
      <div className="max-w-4xl mx-auto py-8 px-4 w-full z-10 relative">
        <div className="flex items-center gap-4 mb-8">
          <svg className="h-10 w-10 text-cyan-400 drop-shadow-lg animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <h1 className="text-4xl font-extrabold text-cyan-400 tracking-tight drop-shadow-lg">Notifications</h1>
        </div>
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-cyan-900/30">
          {notifications.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center gap-4">
              <svg className="h-16 w-16 text-cyan-700 opacity-60 animate-pulse mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <p className="text-2xl font-semibold text-cyan-300 mb-2">You're all caught up!</p>
              <p className="text-gray-400">No notifications yet. We'll let you know when something happens.</p>
            </div>
          ) : (
            <ul className="divide-y divide-cyan-900/40">
              {notifications.map((notification) =>
                notification ? (
                  <li key={notification._id} className="hover:bg-cyan-900/10 transition-all duration-300">
                    <Notification
                      notification={notification}
                      onMarkAsRead={() => markAsRead(notification._id)}
                    />
                  </li>
                ) : null
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;