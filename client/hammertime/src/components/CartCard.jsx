import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { format } from 'date-fns';

const CartCard = ({ cartItem, onCheckout }) => {
  const [address, setAddress] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!cartItem || !cartItem._id || !cartItem.auction) {
    console.error('[CartCard] Invalid cartItem:', cartItem);
    return <div className="p-4 text-red-500">Error: Invalid cart item</div>;
  }

  const handleCheckout = async () => {
    if (!address.trim()) {
      toast.error('Please enter a delivery address', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }

    console.log('[CartCard] Checking out:', cartItem._id);
    setIsCheckingOut(true);
    try {
      await axios.post(
        'http://localhost:5000/api/cart/checkout',
        { cartId: cartItem._id, address },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success('Checkout successful', {
        position: 'top-right',
        autoClose: 2000,
      });
      onCheckout(cartItem._id); // Remove from UI
    } catch (err) {
      console.error('[CartCard] Error checking out:', err.message);
      toast.error(err.response?.data?.error || 'Checkout failed', {
        position: 'top-right',
        autoClose: 2000,
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-md shadow-sm flex flex-col space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{cartItem.auction.title}</h3>
        <p className="text-sm text-gray-600">Amount: ${cartItem.amount.toFixed(2)}</p>
        <p className="text-sm text-gray-500">
          Added: {format(new Date(cartItem.addedAt), 'MMM d, yyyy h:mm a')}
        </p>
      </div>
      <div className="flex flex-col space-y-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter delivery address"
          className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCheckout}
          disabled={isCheckingOut}
          className={`p-2 rounded-md text-white ${
            isCheckingOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          } transition-all duration-300`}
        >
          {isCheckingOut ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
};

export default CartCard;