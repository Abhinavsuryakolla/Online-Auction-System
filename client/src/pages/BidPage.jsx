import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import BidForm from '../components/BidForm';
import { BASE_URL } from '../utils/constants';

const BIDS_PER_PAGE = 5;

const BidPage = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [totalBids, setTotalBids] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingBids, setLoadingBids] = useState(true);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await axios.get(BASE_URL + `/auctions/${id}`);
        setAuction(res.data);
      } catch (err) {
        console.error('Failed to fetch auction:', err);
      }
    };
    fetchAuction();
  }, [id]);

  const fetchBids = async (pageNum = page) => {
    setLoadingBids(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/bids/${id}/paginated?page=${pageNum}&limit=${BIDS_PER_PAGE}`
      );
      setBids(res.data.bids);
      setTotalBids(res.data.total);
    } catch (err) {
      setBids([]);
      setTotalBids(0);
    } finally {
      setLoadingBids(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, [id, page]);

  const handleBidPlaced = async (bid) => {
    setAuction((prev) => ({ ...prev, currentBid: bid.amount }));
    await fetchBids(1);
    setPage(1);
  };

  if (!auction) {
    return <p className="text-center py-20 bg-black text-cyan-400 min-h-screen">Loading auction...</p>;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-28 px-4 flex flex-col items-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Auction Details */}
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl shadow-xl p-8 flex flex-col items-center">
          <img
            src={auction.images[0] || '/placeholder-auction.jpg'}
            alt={auction.title}
            className="w-full max-w-xs h-48 object-cover rounded-xl shadow-md border-4 border-cyan-800"
          />
          <h2 className="text-4xl font-bold mt-6 text-cyan-400">{auction.title}</h2>
          <p className="text-gray-300 mt-4 text-lg">{auction.description}</p>
          <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-lg">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <span className="block text-sm text-gray-400">Start Time</span>
              <span className="font-semibold text-cyan-300">
                {new Date(auction.startTime).toLocaleString()}
              </span>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <span className="block text-sm text-gray-400">End Time</span>
              <span className="font-semibold text-cyan-300">
                {new Date(auction.endTime).toLocaleString()}
              </span>
            </div>
            <div className="bg-cyan-950 rounded-lg p-4 text-center col-span-2">
              <span className="block text-lg text-cyan-400 font-bold">
                Current Bid: ${auction.currentBid || auction.startPrice}
              </span>
              <span className="block text-sm text-gray-400">Starting Price: ${auction.startPrice}</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Bid Form + Bid History */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          {/* Bid Form */}
          <div className="bg-gray-900 rounded-2xl shadow-xl p-6">
            <BidForm auction={auction} onBidPlaced={handleBidPlaced} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidPage;
