import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import Notification from '../components/Notification';

const Notifications = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('[Notifications] No token, skipping fetchNotifications');
          setNotifications([]);
          setLoading(false);
          return;
        }
        const res = await axios.get('http://localhost:5000/api/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const validNotifications = res.data
          .filter((n) => n && n._id && typeof n.read === 'boolean')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(validNotifications);
        console.log('[Notifications] Notifications fetched:', validNotifications);
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
      console.log('[Notifications] Received newNotification:', notification);
      if (!notification || !notification._id || typeof notification.read !== 'boolean') {
        console.error('[Notifications] Invalid newNotification:', notification);
        return;
      }
      setNotifications((prev) => {
        if (prev.some((n) => n._id === notification._id)) {
          console.log('[Notifications] Duplicate notification ignored:', notification._id);
          return prev;
        }
        return [notification, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
    };

    const handleNotificationRead = ({ _id, read }) => {
      console.log('[Notifications] Received notificationRead:', { _id, read });
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
      const res = await axios.put(`http://localhost:5000/api/notifications/${id}/read`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      console.log('[Notifications] Marked as read:', res.data);
    } catch (err) {
      console.error('[Notifications] Error marking as read:', err.message);
      throw err; // Propagate to Notification.jsx
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) =>
              notification ? (
                <li key={notification._id}>
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
  );
};

export default Notifications;