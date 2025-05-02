import { useEffect, useState } from 'react';
import axios from 'axios';
import CartCard from '../components/CartCard';
import { toast } from 'react-toastify';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);

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
        const res = await axios.get('http://localhost:5000/api/cart', {
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
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
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

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to checkout', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }
    // Implement checkout logic here (e.g., redirect to payment page)
    toast.success('Proceeding to checkout', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-semibold text-gray-800 mb-8">Your Cart</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Cart Items */}
        <div className="md:col-span-2">
          {cartItems.length === 0 ? (
            <p className="text-gray-600 text-center">Your cart is empty.</p>
          ) : (
            <div className="flex flex-col space-y-4">
              {cartItems.map((item) => (
                <CartCard
                  key={item._id}
                  cartItem={item}
                  onSelect={handleSelectItem}
                  onDelete={handleDeleteItem}
                  isSelected={selectedItems.includes(item._id)}
                />
              ))}
            </div>
          )}
        </div>
        {/* Right Side: Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h3>
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
                className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow"
              />
              <button
                onClick={applyCoupon}
                className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-all duration-300"
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
  );
};

export default Cart;