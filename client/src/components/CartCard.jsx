import { useState } from 'react';
import { toast } from 'react-toastify';
import { TrashIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';

const CartCard = ({ cartItem, onSelect, onDelete, isSelected, onBuyNow }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!cartItem || !cartItem._id || !cartItem.auction) {
    console.error('[CartCard] Invalid cartItem:', cartItem);
    return <div className="p-4 text-red-500">Error: Invalid cart item</div>;
  }

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      // Simulate adding item to cart (replace with actual API call if needed)
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Item added to cart', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (err) {
      console.error('[CartCard] Error adding item:', err.message);
      toast.error('Failed to add item', {
        position: 'top-right',
        autoClose: 2000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(cartItem._id);
    } catch (err) {
      console.error('[CartCard] Error deleting item:', err.message);
      toast.error('Failed to remove item', {
        position: 'top-right',
        autoClose: 2000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBuyNow = () => {
    if (onBuyNow) onBuyNow(cartItem._id);
  };

  return (
    <div className="relative flex w-full max-w-3xl mx-auto bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-800 hover:shadow-2xl transition-shadow duration-300">
      {/* Left Side: Image */}
      <div className="w-40 h-40 flex-shrink-0 bg-gray-800 flex items-center justify-center">
        <img
          src={cartItem.auction.image || 'https://placehold.co/300x200'}
          alt={cartItem.auction.title}
          className="w-full h-full object-cover rounded-l-2xl"
          onError={e => { e.target.onerror = null; e.target.src = '/default-image.png'; }}
        />
      </div>

      {/* Right Side: Details */}
      <div className="flex-1 p-6 flex flex-col justify-between relative">
        {/* Delete Icon */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200 z-10"
          aria-label="Delete item"
        >
          {isDeleting ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          ) : (
            <TrashIcon className="w-5 h-5" />
          )}
        </button>

        {/* Product Name */}
        <h3 className="text-2xl font-bold text-cyan-400 mb-1 truncate">{cartItem.auction.title}</h3>

        {/* Amount */}
        <p className="text-lg font-semibold text-cyan-400 mb-2">Amount: <span className="text-green-400">${cartItem.amount.toFixed(2)}</span></p>

        {/* Added Date */}
        <p className="text-xs text-gray-400 mb-4">
          Added: {format(new Date(cartItem.addedAt), 'MMM d, yyyy h:mm a')}
        </p>

        {/* Buttons */}
        <div className="flex space-x-4 mt-auto">
          <button
            onClick={() => {}} // Replace with actual view details logic
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-semibold shadow hover:bg-cyan-700 hover:scale-105 transition-all duration-300"
          >
            View Details
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isAdding}
            className={`px-4 py-2 rounded-lg font-semibold shadow text-white ${
              isAdding ? 'bg-gray-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:scale-105'
            } transition-all duration-300`}
          >
            {isAdding ? 'Adding...' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartCard;