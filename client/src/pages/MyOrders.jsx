import { useEffect, useState } from 'react';
import axios from 'axios';
import { format, addDays, isAfter } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../utils/constants';

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // If user is a seller, do not show this page
  if (user && user.role === 'seller') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-2xl font-bold">My Orders is only available for buyers.</div>
      </div>
    );
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(BASE_URL+'/cart/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        // Only show orders placed within the last 7 days
        const now = new Date();
        const filtered = res.data.filter(order => {
          const created = new Date(order.createdAt);
          return isAfter(addDays(created, 7), now);
        });
        setOrders(filtered);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen w-full">
      <div className="max-w-5xl mx-auto py-8 px-4 pt-24">
        <h2 className="text-3xl font-semibold text-cyan-400 mb-8">My Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-400 text-center">No recent orders found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {orders.map(order => {
              const deliveryDate = addDays(new Date(order.createdAt), 7);
              return (
                <div key={order._id} className="bg-gray-900 rounded-2xl shadow-xl p-6 flex flex-col justify-between border border-gray-800 hover:shadow-2xl transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-cyan-400 mb-2 truncate">{order.auction?.title || 'Auction Item'}</h3>
                  <p className="text-gray-300 mb-1">Order Amount: <span className="text-green-400 font-semibold">${order.amount.toFixed(2)}</span></p>
                  <p className="text-gray-400 mb-1">Order Date: {format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
                  <p className="text-gray-400 mb-1">Delivery Date: <span className="text-cyan-400 font-semibold">{format(deliveryDate, 'MMM d, yyyy')}</span></p>
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">Shipping Address:</div>
                    <div className="text-gray-300 text-sm">
                      {order.address?.street}, {order.address?.city}, {order.address?.state}, {order.address?.country} - {order.address?.zip}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <span className="inline-block px-3 py-1 bg-green-900 text-green-400 rounded-full text-xs font-semibold">Delivery in 7 days</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders; 