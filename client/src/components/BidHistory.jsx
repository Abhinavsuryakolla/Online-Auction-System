// src/components/BidHistory.jsx
import { format } from 'date-fns';

const BidHistory = ({ bids }) => {
  return (
    <div className="space-y-3">
      {bids.map((bid) => (
        <div key={bid._id} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-cyan-900 flex items-center justify-center mr-3">
              <span className="text-cyan-400 text-xs font-semibold">
                {bid.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-white">{bid.user.name}</p>
              <p className="text-gray-400 text-xs">
                {format(new Date(bid.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
          <span className="font-bold text-cyan-400">${bid.amount}</span>
        </div>
      ))}
    </div>
  );
};

export default BidHistory;