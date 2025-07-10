import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { CheckCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';

const Notification = ({ notification, onMarkAsRead }) => {
  const { user } = useAuth();
  const [isMarking, setIsMarking] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isRead, setIsRead] = useState(notification.read || false);

  if (!notification || !notification._id) {
    console.error('[Notification] Invalid notification prop:', notification);
    return <div className="p-3 text-red-500">Error: Invalid notification</div>;
  }

  const handleMarkAsRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMarking || isRead) return;

    console.log('[Notification] Marking as read:', notification._id);
    setIsMarking(true);
    setIsRead(true);
    try {
      await onMarkAsRead();
      toast.success('Notification marked as read', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (err) {
      console.error('[Notification] Error marking as read:', err.message);
      setIsRead(notification.read || false);
      toast.error('Failed to mark as read', {
        position: 'top-right',
        autoClose: 2000,
      });
    } finally {
      setIsMarking(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAddingToCart || !notification.auction?._id) return;

    console.log('[Notification] Adding to cart:', notification.auction._id);
    setIsAddingToCart(true);
    try {
      await axios.post(
        BASE_URL + '/cart',
        { auctionId: notification.auction._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success('Added to cart', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (err) {
      console.error('[Notification] Error adding to cart:', err.message);
      toast.error(err.response?.data?.error || 'Failed to add to cart', {
        position: 'top-right',
        autoClose: 2000,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleLinkClick = () => {
    if (!isRead && onMarkAsRead && !isMarking) {
      console.log('[Notification] Link clicked, marking as read:', notification._id);
      setIsRead(true);
      onMarkAsRead();
    }
  };

  const createdAt = notification.createdAt ? new Date(notification.createdAt) : new Date();

  return (
    <div className="relative">
      <Link
        to={notification.auction?._id ? `/auctions/${notification.auction._id}` : '#'}
        onClick={handleLinkClick}
        className={`block p-3 rounded-md hover:bg-gray-800 transition-all duration-300 ${
          !isRead ? 'bg-gradient-to-r from-cyan-900 to-blue-900' : 'bg-gray-900'
        }`}
      >
        <div className="flex justify-between items-start">
          <div>
            {notification.auction?.title && (
              <p className="text-sm font-semibold text-cyan-400">
                {notification.auction.title}
              </p>
            )}
            <p className="text-sm text-gray-300">{notification.message || 'No message'}</p>
          </div>
          {!isRead && (
            <span className="ml-2 inline-block h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {format(createdAt, 'MMM d, yyyy h:mm a')}
        </p>
      </Link>
      <div className="absolute top-3 right-3 flex space-x-2">
        {!isRead && (
          <button
            onClick={handleMarkAsRead}
            disabled={isMarking || isRead}
            className={`p-1 rounded-full ${
              isMarking ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
            } transition-all duration-300`}
            title="Mark as read"
          >
            <CheckCircleIcon
              className={`h-5 w-5 ${isMarking ? 'text-gray-400' : 'text-green-500 hover:text-green-600'}`}
            />
          </button>
        )}
        {user?.role === 'buyer' && notification.auction?._id && (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`p-1 rounded-full ${
              isAddingToCart ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
            } transition-all duration-300`}
            title="Add to cart"
          >
            <ShoppingCartIcon
              className={`h-5 w-5 ${isAddingToCart ? 'text-gray-400' : 'text-blue-500 hover:text-blue-600'}`}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;