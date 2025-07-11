import { Link, useNavigate } from 'react-router-dom';
import Countdown from 'react-countdown';
import moment from 'moment';

const AuctionCard = ({ auction, onDelete, deletingId, user }) => {
  const now = new Date();
  const navigate = useNavigate();

  const hasStarted = new Date(auction.startTime) <= now;
  const hasEnded = new Date(auction.endTime) <= now;

  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) return <span className="text-red-400 text-xs">Auction ended</span>;
    return (
      <span className="text-yellow-400 text-xs">
        Ends in: {days}d {hours}h {minutes}m {seconds}s
      </span>
    );
  };

  const isSeller = user && (auction.seller?._id === user.id || auction.seller === user.id);

  return (
    <div className="bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 w-72 border border-gray-800">
      <Link to={`/auctions/${auction._id}`}>
        <img
          src={auction.images[0] || '/placeholder-auction.jpg'}
          alt={auction.title}
          className="h-36 w-full object-cover"
        />
        <div className="p-4 space-y-2 text-gray-200">
          <h3 className="text-lg font-semibold truncate text-cyan-400">{auction.title}</h3>

          <div className="text-sm">
            {hasStarted ? (
              !hasEnded ? (
                <Countdown date={new Date(auction.endTime)} renderer={renderer} />
              ) : (
                <span className="text-red-400">Auction ended</span>
              )
            ) : (
              <span className="text-yellow-400">
                Starts at: {moment(auction.startTime).format('MMM Do, h:mm A')}
              </span>
            )}
          </div>

          {/* Price display based on auction status */}
          {hasStarted ? (
            !hasEnded ? (
              // Live auctions: show starting price and current bid
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Starting Price:</span>
                  <span className="font-semibold text-green-400">
                    ${auction.startPrice}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Current Bid:</span>
                  <span className="font-semibold text-yellow-400">
                    ${auction.currentBid || auction.startPrice}
                  </span>
                </div>
              </div>
            ) : (
              // Ended auctions: show starting price and final bid
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Starting Price:</span>
                  <span className="font-semibold text-green-400">
                    ${auction.startPrice}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Final Bid:</span>
                  <span className="font-semibold text-red-400">
                    ${auction.currentBid || auction.startPrice}
                  </span>
                </div>
              </div>
            )
          ) : (
            // Upcoming auctions: no price shown
            <div className="text-sm text-gray-500">
              Bidding not started yet
            </div>
          )}
        </div>
      </Link>

      {/* Place Bid Button outside the Link */}
      <div className="px-4 pb-4">
        <button
          onClick={() => navigate(`/auctions/${auction._id}`)}
          disabled={!hasStarted || hasEnded}
          className={`mt-2 w-full text-sm py-1.5 rounded transition
            ${hasStarted && !hasEnded
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
        >
          {hasStarted && !hasEnded ? 'Place Bid' : hasEnded ? 'Auction Ended' : 'Not Started'}
        </button>
        {isSeller && onDelete && (
          <button
            onClick={() => onDelete(auction._id)}
            disabled={deletingId === auction._id}
            className="mt-3 w-full bg-red-600 text-white px-3 py-1 rounded shadow hover:bg-red-700 transition-opacity opacity-90"
            style={{ zIndex: 2 }}
          >
            {deletingId === auction._id ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuctionCard;
