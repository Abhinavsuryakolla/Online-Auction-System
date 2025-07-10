import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';

function MyBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  useEffect(() => {
    const fetchBids = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/bids/user/past?page=${page}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setBids(res.data.bids);
        setTotal(res.data.total);
      } catch (err) {
        setBids([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, [page, limit]);

  const totalPages = Math.ceil(total / limit);

  const statusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'ended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 bg-black">
      <svg className="animate-spin h-10 w-10 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      <div className="text-lg text-cyan-400 font-semibold">Loading your bids...</div>
    </div>
  );

  return (
    <div className="bg-black min-h-screen w-full">
      <div className="max-w-3xl mx-auto py-10 px-4 pt-24">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-cyan-400 tracking-tight flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2z" /></svg>
          My Bids
        </h2>
        {bids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2m-4-4v-2a4 4 0 00-8 0v2m4-4V7a4 4 0 018 0v2" /></svg>
            <p className="text-gray-400 text-lg font-medium">No bids found. Start bidding to see your history here!</p>
          </div>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2">
            {bids.map((bid) => (
              <li key={bid._id} className="bg-gray-900 shadow-xl rounded-xl p-6 flex flex-col gap-3 border border-gray-800 hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /></svg>
                  <span className="font-bold text-lg text-white">{bid.auction?.title || 'Auction'}</span>
                  <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${statusColor(bid.auction?.status)}`}>{bid.auction?.status || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 4h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" /></svg>
                  <span>Bid placed: {new Date(bid.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>
                  <span>Auction ends: {bid.auction?.endTime ? new Date(bid.auction.endTime).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl font-extrabold text-cyan-400">${bid.amount.toFixed(2)}</span>
                  <span className="text-xs text-gray-500">Bid ID: {bid._id.slice(-6)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              className="px-3 py-1 rounded bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="font-bold text-cyan-400">Page {page} of {totalPages}</span>
            <button
              className="px-3 py-1 rounded bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBids; 