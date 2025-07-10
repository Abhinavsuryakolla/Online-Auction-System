import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../utils/constants';

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  console.log('[DEBUG] location.state:', location.state);
  const { user, setUser } = useAuth();
  const { items = [], total = 0 } = location.state || {};
  console.log('[DEBUG] Checkout received items:', items, 'total:', total);
  const [address, setAddress] = useState({
    country: '',
    state: '',
    city: '',
    street: '',
    zip: ''
  });
  const [loading, setLoading] = useState(false);

  // Redirect to cart if items is empty (prevents empty checkout page on refresh)
  useEffect(() => {
    if (!items || items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handlePay = async () => {
    // Check all address fields are filled
    if (!address.country || !address.state || !address.city || !address.street || !address.zip) {
      return alert('Please fill in all address fields');
    }
    setLoading(true);
    try {
      const res = await axios.post(BASE_URL+'/cart/checkout', {
        cartItemIds: items.map(item => item._id),
        address,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setLoading(false);
      setUser(prev => ({ ...prev, wallet: res.data.wallet }));
      // Store order details in localStorage for instant MyOrders update
      if (res.data.orders) {
        localStorage.setItem('myorders', JSON.stringify(res.data.orders));
      }
      alert('Payment successful!');
      navigate('/myorders');
    } catch (err) {
      setLoading(false);
      alert(err.response?.data?.error || 'Payment failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-pink-100 to-yellow-100 py-12 px-4">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8">Checkout</h2>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">Items</h3>
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item._id} className="py-2 flex justify-between items-center">
                <span className="font-medium text-gray-700">{item.auction.title}</span>
                <span className="text-green-700 font-semibold">${item.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 font-bold flex justify-between text-gray-800">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              className="p-2 border rounded"
              placeholder="Country"
              value={address.country}
              onChange={e => setAddress(a => ({ ...a, country: e.target.value }))}
            />
            <input
              type="text"
              className="p-2 border rounded"
              placeholder="State"
              value={address.state}
              onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
            />
            <input
              type="text"
              className="p-2 border rounded"
              placeholder="City"
              value={address.city}
              onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
            />
            <input
              type="text"
              className="p-2 border rounded"
              placeholder="Street"
              value={address.street}
              onChange={e => setAddress(a => ({ ...a, street: e.target.value }))}
            />
            <input
              type="text"
              className="p-2 border rounded"
              placeholder="ZIP Code"
              value={address.zip}
              onChange={e => setAddress(a => ({ ...a, zip: e.target.value }))}
            />
          </div>
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full p-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-300 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;