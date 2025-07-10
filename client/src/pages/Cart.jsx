import { useEffect, useState } from 'react';
import axios from 'axios';
import CartCard from '../components/CartCard';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';
import { useEffect as useReactEffect } from 'react';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('[Cart] No token, skipping fetchCartItems');
          setCartItems([]);
          setLoading(false);
          return;
        }
        const res = await axios.get(BASE_URL + '/cart', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const validItems = res.data.filter((item) => item && item._id && item.auction);
        setCartItems(validItems);
        console.log('[Cart] Cart items fetched:', validItems);
        setLoading(false);
      } catch (err) {
        console.error('[Cart] Error fetching cart items:', err.message);
        setCartItems([]);
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleSelectItem = (id) => {
    setSelectedItems((prev) => {
      const updated = prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id];
      console.log('[DEBUG] Selected items:', updated);
      return updated;
    });
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCartItems((prev) => prev.filter((item) => item._id !== id));
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
      toast.success('Item removed from cart', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (err) {
      console.error('[Cart] Error deleting item:', err.message);
      toast.error('Failed to remove item', {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };

  const applyCoupon = () => {
    if (couponCode === 'DISCOUNT10') {
      setDiscount(10);
      toast.success('Coupon applied: $10 off', {
        position: 'top-right',
        autoClose: 2000,
      });
    } else {
      setDiscount(0);
      toast.error('Invalid coupon code', {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };

  const calculateSummary = () => {
    const totalItems = selectedItems.length;
    const subtotal = selectedItems.reduce((sum, id) => {
      const item = cartItems.find((item) => item._id === id);
      return sum + (item ? item.amount : 0);
    }, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax - discount;
    return { totalItems, subtotal, tax, total };
  };

  const { totalItems, subtotal, tax, total } = calculateSummary();

  const handleBuyNow = (id) => {
    setSelectedItems([id]);
    toast.info('Buy Now selected. Only this item will be checked out.', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to checkout', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }
    const selected = cartItems.filter((item) => selectedItems.includes(item._id));
    console.log('[DEBUG] Navigating to checkout with:', selected, total);
    navigate('/checkout', { state: { items: selected, total } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col flex-grow w-full pt-24 px-4" style={{ minHeight: '100vh', backgroundColor: '#000' }}>
      <div className="max-w-6xl mx-auto py-8 px-4 w-full">
        <h2 className="text-3xl font-semibold text-cyan-400 mb-8">Your Cart</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Side: Cart Items */}
          <div className="md:col-span-2">
            {cartItems.length === 0 ? (
              <p className="text-gray-400 text-center">Your cart is empty.</p>
            ) : (
              <div className="flex flex-col space-y-4">
                {cartItems.map((item) => (
                  <CartCard
                    key={item._id}
                    cartItem={item}
                    onSelect={handleSelectItem}
                    onDelete={handleDeleteItem}
                    isSelected={selectedItems.includes(item._id)}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Right Side: Order Summary */}
          <div className="bg-gray-900 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-cyan-400 mb-4">Order Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Order Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon Code"
                  className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 flex-grow bg-gray-800 text-white placeholder-gray-400"
                />
                <button
                  onClick={applyCoupon}
                  className="p-2 bg-cyan-400 text-black rounded-md hover:bg-cyan-600 transition-all duration-300"
                >
                  Apply
                </button>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full p-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-300 disabled:bg-gray-400"
                disabled={selectedItems.length === 0}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;