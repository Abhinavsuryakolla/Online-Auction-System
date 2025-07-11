import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import Notification from './Notification';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';

const Navbar = () => {
  const { user, logout, setUser } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const notificationsRef = useRef(null);
  const walletModalRef = useRef(null);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setNotifications([]);
          return;
        }
        const res = await axios.get(BASE_URL + '/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const validNotifications = res.data
          .filter((n) => n && n._id && typeof n.read === 'boolean')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(validNotifications);
      } catch (err) {
        console.error('[Navbar] Error fetching notifications:', err.message);
        setNotifications([]);
      }
    };

    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
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

  const handleAddMoney = async () => {
    if (!addAmount || isNaN(addAmount) || Number(addAmount) <= 0) return;
    try {
      await axios.post(BASE_URL + '/auth/wallet/add', { amount: Number(addAmount) }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const userRes = await axios.get(BASE_URL + '/auth/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUser({ ...userRes.data.user, id: userRes.data.user._id });
      setShowWalletModal(false);
      setAddAmount('');
    } catch (err) {
      alert('Failed to add money');
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await axios.put(BASE_URL + `/notifications/${id}/read`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('[Navbar] Error marking as read:', err.message);
      throw err;
    }
  };

  const handleViewAllClick = (e) => {
    e.stopPropagation();
    setShowNotifications(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (showWalletModal && walletModalRef.current && !walletModalRef.current.contains(event.target)) {
        setShowWalletModal(false);
      }
      if (showDropdown && profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showWalletModal, showDropdown]);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/95 backdrop-blur-sm shadow-xl py-3' : 'bg-black py-4'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold flex items-center">
          <span className="text-cyan-400">Nex</span>
          <span className="text-white">ora</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-300 hover:text-cyan-400 transition-colors text-lg">Home</Link>
          <Link to="/auctions" className="text-gray-300 hover:text-cyan-400 transition-colors text-lg">Auctions</Link>
          {user ? (
            <>
              {user.role === 'seller' ? (
                <>
                  <Link to="/create-auction" className="text-gray-300 hover:text-cyan-400 transition-colors text-lg">Create Auction</Link>
                  <Link to="/my-auctions" className="text-gray-300 hover:text-cyan-400 transition-colors text-lg">My Auctions</Link>
                </>
              ) : (
                <Link to="/my-bids" className="text-gray-300 hover:text-cyan-400 transition-colors text-lg">My Bids</Link>
              )}
            </>
          ) : (
            <>
              <Link to="/about" className="text-gray-300 hover:text-cyan-400 transition-colors text-lg">About</Link>
              <Link to="/contact" className="text-gray-300 hover:text-cyan-400 transition-colors text-lg">Contact</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-300 hover:text-cyan-400 transition-colors"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <div className="flex items-center space-x-4">
                {/* Wallet display */}
                <div className="bg-gray-800 px-3 py-1 rounded text-cyan-300 font-semibold flex items-center">
                  <span>Wallet: ${user?.wallet?.toFixed(2) ?? '0.00'}</span>
                  <button onClick={() => setShowWalletModal(true)} className="ml-2 px-2 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600">+ Add</button>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative text-gray-300 hover:text-cyan-400 transition-colors"
                  >
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div ref={notificationsRef} className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-md shadow-lg text-white z-50">
                      <div className="p-4 border-b border-gray-700">
                        <p className="font-semibold text-lg">Notifications</p>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) =>
                            notification ? (
                              <Notification
                                key={notification._id}
                                notification={notification}
                                onMarkAsRead={() => markAsRead(notification._id)}
                              />
                            ) : null
                          )
                        ) : (
                          <p className="p-4 text-gray-400">No new notifications</p>
                        )}
                      </div>
                      <div className="p-3 border-t border-gray-700 text-center">
                        <Link
                          to="/notifications"
                          className="text-cyan-400 hover:underline text-sm"
                          onClick={handleViewAllClick}
                        >
                          View all
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                {user.role === 'buyer' && (
                  <Link to="/cart" className="relative text-gray-300 hover:text-cyan-400 transition-colors">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </Link>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center focus:outline-none"
                >
                  <span className="ml-2 text-gray-300 hover:text-cyan-400 transition-colors">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </button>
                {showDropdown && (
                  <div ref={profileDropdownRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-2">
                    <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile</Link>
                    {user && user.role === 'buyer' && (
                      <button
                        onClick={() => navigate('/myorders')}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200"
                      >
                        My Orders
                      </button>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="text-gray-300 hover:text-cyan-400 transition-colors px-4 py-2 text-lg">
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-sm px-6 py-4">
          <Link to="/" className="block text-gray-300 hover:text-cyan-400 transition-colors py-3 text-lg">Home</Link>
          <Link to="/auctions" className="block text-gray-300 hover:text-cyan-400 transition-colors py-3 text-lg">Auctions</Link>
          {user ? (
            user.role === 'seller' ? (
              <>
                <Link to="/create-auction" className="block text-gray-300 hover:text-cyan-400 transition-colors py-3 text-lg">
                  Create Auction
                </Link>
                <Link to="/my-auctions" className="block text-gray-300 hover:text-cyan-400 transition-colors py-3 text-lg">
                  My Auctions
                </Link>
              </>
            ) : (
              <Link to="/my-bids" className="block text-gray-300 hover:text-cyan-400 transition-colors py-3 text-lg">
                My Bids
              </Link>
            )
          ) : (
            <>
              <Link to="/about" className="block text-gray-300 hover:text-cyan-400 transition-colors py-3 text-lg">About</Link>
              <Link to="/contact" className="block text-gray-300 hover:text-cyan-400 transition-colors py-3 text-lg">Contact</Link>
            </>
          )}
        </div>
      )}

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={walletModalRef} className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add Money to Wallet</h2>
            <input
              type="number"
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter amount"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowWalletModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={handleAddMoney} className="px-4 py-2 bg-cyan-500 text-white rounded">Add</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;