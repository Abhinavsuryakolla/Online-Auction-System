import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const BidForm = ({ auction, onBidPlaced }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [bidAmount, setBidAmount] = useState('');
  const [minBid, setMinBid] = useState(0);
  const [bids, setBids] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [optimisticBidId, setOptimisticBidId] = useState(null); // Track optimistic bid
  const abortController = useRef(new AbortController());

  const auctionId = useMemo(() => auction?._id?.toString(), [auction?._id]);

  useEffect(() => {
    console.log('[BidForm] Auction ID:', auctionId, 'User:', user);
  }, [auctionId, user]);

  useEffect(() => {
    if (!socket || !auctionId || !user?._id) {
      console.log('[BidForm] Cannot join auction room:', {
        socket: !!socket,
        auctionId,
        userId: user?._id,
      });
      return;
    }

    const handleConnect = () => {
      if (socket.connected) {
        socket.emit('joinAuction', auctionId);
        console.log(`[BidForm] Joined auction room: ${auctionId}`);
      } else {
        console.log('[BidForm] Socket not connected on connect event');
      }
    };

    if (socket.connected) {
      socket.emit('joinAuction', auctionId);
      console.log(`[BidForm] Joined auction room: ${auctionId}`);
    } else {
      console.log('[BidForm] Socket not connected initially');
    }

    socket.on('connect', handleConnect);
    socket.on('connect_error', (error) => {
      console.error('[BidForm] Socket connect error:', error.message);
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error');
      if (socket.connected) {
        socket.emit('leaveAuction', auctionId);
        console.log(`[BidForm] Left auction room: ${auctionId}`);
      }
    };
  }, [socket, auctionId, user?._id]);

  useEffect(() => {
    if (!auction) {
      console.log('[BidForm] No auction data');
      return;
    }

    const initialMin = Math.max(
      auction.currentBid || auction.startPrice,
      auction.startPrice
    ) + 1;

    console.log('[BidForm] Setting initial min bid:', initialMin);
    setMinBid(initialMin);
    setBidAmount(initialMin.toString());
  }, [auction]);

  useEffect(() => {
    const fetchBids = async () => {
      if (!auctionId) {
        console.log('[BidForm] No auctionId for fetching bids');
        return;
      }

      try {
        console.log('[BidForm] Fetching bids for auction:', auctionId);
        const res = await axios.get(`http://localhost:5000/api/bids/${auctionId}`, {
          signal: abortController.current.signal,
        });
        setBids(res.data.sort((a, b) => b.amount - a.amount));
        console.log('[BidForm] Bids fetched:', res.data);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error('[BidForm] Error fetching bids:', err.message);
          toast.error('Failed to load bid history');
        }
      }
    };

    fetchBids();

    return () => {
      abortController.current.abort();
      abortController.current = new AbortController();
    };
  }, [auctionId]);

  useEffect(() => {
    if (!socket || !auctionId) {
      console.log('[BidForm] Cannot set up newBid listener:', {
        socket: !!socket,
        auctionId,
      });
      return;
    }

    const handleNewBid = (newBid) => {
      console.log('[BidForm] Received newBid:', newBid);
      if (newBid.auction !== auctionId) {
        console.log('[BidForm] Bid ignored, wrong auction:', newBid.auction);
        return;
      }

      setBids((prev) => {
        // Check if bid is a duplicate by _id
        if (prev.some((bid) => bid._id === newBid._id)) {
          console.log('[BidForm] Duplicate bid ignored:', newBid._id);
          return prev;
        }

        // For the bidder: skip if this is their own bid (matches optimistic bid)
        if (
          optimisticBidId &&
          newBid.user._id === user._id &&
          newBid.amount === Number(bidAmount) &&
          newBid.auction === auctionId
        ) {
          console.log('[BidForm] Ignoring own bid from socket:', newBid._id);
          setOptimisticBidId(null); // Clear optimistic bid tracking
          return prev.filter((bid) => bid._id !== optimisticBidId); // Remove optimistic bid
        }

        // Add new bid for other users
        const updatedBids = [...prev, newBid].sort((a, b) => b.amount - a.amount);
        console.log('[BidForm] Updated bids:', updatedBids);
        return updatedBids;
      });
    };

    socket.on('newBid', handleNewBid);

    socket.on('reconnect', async () => {
      console.log('[BidForm] Socket reconnected, refetching bids');
      try {
        const res = await axios.get(`http://localhost:5000/api/bids/${auctionId}`, {
          signal: abortController.current.signal,
        });
        setBids(res.data.sort((a, b) => b.amount - a.amount));
        console.log('[BidForm] Bids refetched on reconnect:', res.data);
        setOptimisticBidId(null); // Clear optimistic bid on reconnect
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error('[BidForm] Error refetching bids:', err.message);
          toast.error('Failed to refresh bids');
        }
      }
    });

    return () => {
      socket.off('newBid', handleNewBid);
      socket.off('reconnect');
    };
  }, [socket, auctionId, user?._id, optimisticBidId, bidAmount]);

  useEffect(() => {
    if (bids.length > 0) {
      const highestBid = Math.max(...bids.map((bid) => bid.amount));
      const newMin = highestBid + 1;
      console.log('[BidForm] Updating min bid:', newMin);
      setMinBid(newMin);
      if (Number(bidAmount) < newMin) {
        setBidAmount(newMin.toString());
      }
    }
  }, [bids]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (processing || !user || !auctionId) {
      console.log('[BidForm] Submit blocked:', { processing, user, auctionId });
      return;
    }

    const numericAmount = Number(bidAmount);
    if (numericAmount < minBid) {
      console.log('[BidForm] Bid too low:', numericAmount, '<', minBid);
      toast.error(`Bid must be at least $${minBid}`);
      return;
    }

    setProcessing(true);
    console.log('[BidForm] Submitting bid:', numericAmount);

    const tempId = `temp-${Date.now()}`;
    const optimisticBid = {
      _id: tempId,
      amount: numericAmount,
      user: { name: user.name, _id: user._id, id: user.id || user._id },
      auction: auctionId,
      createdAt: new Date().toISOString(),
    };
    setOptimisticBidId(tempId); // Track optimistic bid
    setBids((prev) => {
      const updatedBids = [...prev, optimisticBid].sort((a, b) => b.amount - a.amount);
      console.log('[BidForm] Optimistic bids:', updatedBids);
      return updatedBids;
    });

    try {
      const res = await axios.post(
        `http://localhost:5000/api/bids/${auctionId}`,
        { amount: numericAmount },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          signal: abortController.current.signal,
        }
      );
      console.log('[BidForm] Bid response:', res.data);

      setBids((prev) => {
        const updatedBids = prev
          .filter((bid) => bid._id !== tempId) // Remove optimistic bid
          .concat(res.data)
          .sort((a, b) => b.amount - a.amount);
        console.log('[BidForm] Bids after server response:', updatedBids);
        return updatedBids;
      });
      setOptimisticBidId(null); // Clear optimistic bid
      setMinBid(res.data.amount + 1);
      toast.success('Bid placed successfully!');
      onBidPlaced?.(res.data);
    } catch (err) {
      console.error('[BidForm] Bid error:', err.message);
      setBids((prev) => prev.filter((bid) => bid._id !== tempId));
      setOptimisticBidId(null); // Clear optimistic bid
      if (!axios.isCancel(err)) {
        const errorMessage = err.response?.data?.error || 'Failed to place bid';
        toast.error(errorMessage);
        try {
          const res = await axios.get(`http://localhost:5000/api/bids/${auctionId}`);
          setBids(res.data.sort((a, b) => b.amount - a.amount));
          console.log('[BidForm] Bids refetched after error:', res.data);
        } catch (fetchErr) {
          console.error('[BidForm] Error refetching bids:', fetchErr.message);
        }
      }
    } finally {
      setProcessing(false);
    }
  };

  if (!user || user.role !== 'buyer') {
    return (
      <div className="bg-blue-50 p-4 rounded-lg text-center">
        <p className="text-blue-800">Please log in as a buyer to place bids</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Place Your Bid</h3>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">Bid Amount ($)</label>
          <input
            type="number"
            min={minBid}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Minimum bid: ${minBid}</p>
        </div>
        <button
          type="submit"
          disabled={processing}
          className={`w-full py-2 px-4 rounded-lg font-medium ${
            processing ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {processing ? 'Processing...' : 'Place Bid'}
        </button>
      </form>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold mb-4">Bidding History</h4>
        {bids.length > 0 ? (
          <ul className="space-y-3">
            {bids.map((bid) => (
              <li
                key={bid._id}
                className={`flex justify-between items-center py-2 px-4 rounded-lg ${
                  bid._id.startsWith('temp') ? 'bg-yellow-50' : 'bg-gray-50'
                }`}
              >
                <div>
                  <span className="font-medium">{bid.user?.name}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    ({new Date(bid.createdAt).toLocaleString()})
                  </span>
                </div>
                <span className="font-semibold">${bid.amount}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No bids placed yet</p>
        )}
      </div>
    </div>
  );
};

export default BidForm;