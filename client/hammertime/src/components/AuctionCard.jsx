import { Link, useNavigate } from 'react-router-dom';
import Countdown from 'react-countdown';
import moment from 'moment';

const AuctionCard = ({ auction }) => {
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

  return (
    <div className="bg-zinc-900 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 w-72 border border-zinc-700">
      <Link to={`/auctions/${auction._id}`}>
        <img
          src={auction.images[0] || '/placeholder-auction.jpg'}
          alt={auction.title}
          className="h-36 w-full object-cover"
        />
        <div className="p-4 space-y-2 text-gray-200">
          <h3 className="text-lg font-semibold truncate">{auction.title}</h3>

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

          <div className="flex justify-between items-center text-sm">
            <span>Current Bid:</span>
            <span className="font-semibold text-yellow-300">
              ${auction.currentBid || auction.startPrice}
            </span>
          </div>
        </div>
      </Link>

      {/* Place Bid Button outside the Link */}
      <div className="px-4 pb-4">
        <button
          onClick={() => navigate(`/auctions/${auction._id}`)}
          disabled={!hasStarted || hasEnded}
          className={`mt-2 w-full text-sm py-1.5 rounded transition
            ${hasStarted && !hasEnded
              ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
        >
          {hasStarted && !hasEnded ? 'Place Bid' : hasEnded ? 'Auction Ended' : 'Not Started'}
        </button>
      </div>
    </div>
  );
};

export default AuctionCard;
