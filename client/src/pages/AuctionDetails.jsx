// src/pages/AuctionDetails.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import BidForm from '../components/BidForm';
import BidHistory from '../components/BidHistory';
import { BASE_URL } from '../utils/constants';

const AuctionDetails = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState([]);
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const [auctionRes, bidsRes] = await Promise.all([
          axios.get(BASE_URL + `/api/auctions/${id}`),
          axios.get(BASE_URL + `/api/bids/${id}`),
        ]);
        setAuction(auctionRes.data);
        setBids(bidsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchAuction();

    if (socket) {
      socket.emit('joinAuction', id);
      socket.on('newBid', (bid) => {
        setBids((prev) => [bid, ...prev]);
        setAuction((prev) => ({ ...prev, currentBid: bid.amount }));
      });
      socket.on('auctionEnded', ({ auctionId, winner }) => {
        if (auctionId === id) {
          setAuction((prev) => ({ ...prev, status: 'ended', winner }));
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('newBid');
        socket.off('auctionEnded');
      }
    };
  }, [id, socket]);

  const handleBidPlaced = (bid) => {
    setBids((prev) => [bid, ...prev]);
    setAuction((prev) => ({ ...prev, currentBid: bid.amount }));
    if (socket) {
      socket.emit('newBid', { auctionId: id, bid });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!auction) {
    return <div className="text-center py-8">Auction not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative pb-2/3 h-96">
              <img
                src={auction.images[0] || '/placeholder-auction.jpg'}
                alt={auction.title}
                className="absolute h-full w-full object-cover"
              />
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-2">{auction.title}</h1>
              <p className="text-gray-600 mb-4">{auction.description}</p>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <span className="text-indigo-600 text-sm font-semibold">
                    {auction.seller.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{auction.seller.name}</p>
                  <p className="text-gray-500 text-sm">Seller</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Starting Price</p>
                  <p className="text-xl font-semibold">${auction.startPrice}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Current Bid</p>
                  <p className="text-xl font-semibold">${auction.currentBid || auction.startPrice}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Bid History</h2>
            {bids.length > 0 ? (
              <BidHistory bids={bids} />
            ) : (
              <p className="text-gray-500">No bids yet</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <BidForm auction={auction} onBidPlaced={handleBidPlaced} />
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Auction Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${
                  auction.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {auction.status === 'active' ? 'Active' : 'Ended'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Time</span>
                <span className="font-medium">
                  {new Date(auction.startTime).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Time</span>
                <span className="font-medium">
                  {new Date(auction.endTime).toLocaleString()}
                </span>
              </div>
              {auction.status === 'ended' && auction.winner && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Winner</span>
                  <span className="font-medium">
                    {auction.winner._id === user?.id ? 'You' : auction.winner.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;