// src/components/BidHistory.jsx
import { format } from 'date-fns';

const BidHistory = ({ bids }) => {
  return (
    <div className="space-y-3">
      {bids.map((bid) => (
        <div key={bid._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
              <span className="text-indigo-600 text-xs font-semibold">
                {bid.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium">{bid.user.name}</p>
              <p className="text-gray-500 text-xs">
                {format(new Date(bid.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
          <span className="font-bold text-indigo-600">${bid.amount}</span>
        </div>
      ))}
    </div>
  );
};

export default BidHistory;