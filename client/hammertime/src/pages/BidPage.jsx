import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import BidForm from '../components/BidForm';

const BidPage = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auctions/${id}`);
        setAuction(res.data);
      } catch (err) {
        console.error('Failed to fetch auction:', err);
      }
    };
    fetchAuction();
  }, [id]);

  const handleBidPlaced = (bid) => {
    setAuction((prev) => ({ ...prev, currentBid: bid.amount }));
  };

  if (!auction) {
    return <p className="text-center py-20">Loading auction...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left: Auction Details */}
        <div className="lg:w-2/3 bg-white p-6 rounded-lg shadow-md">
          <img
            src={auction.images[0] || '/placeholder-auction.jpg'}
            alt={auction.title}
            className="w-full h-80 object-cover rounded-md"
          />
          <h2 className="text-3xl font-semibold mt-6">{auction.title}</h2>
          <p className="text-gray-600 mt-4">{auction.description}</p>
          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-500">
              <strong>Start Time:</strong> {new Date(auction.startTime).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              <strong>End Time:</strong> {new Date(auction.endTime).toLocaleString()}
            </p>
            <p className="text-lg font-semibold">
              <strong>Current Bid:</strong> ${auction.currentBid || auction.startPrice}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Starting Price:</strong> ${auction.startPrice}
            </p>
          </div>
        </div>

        {/* Right: Bid Form */}
        <div className="lg:w-1/3">
          <BidForm auction={auction} onBidPlaced={handleBidPlaced} />
        </div>
      </div>
    </div>
  );
};

export default BidPage;
