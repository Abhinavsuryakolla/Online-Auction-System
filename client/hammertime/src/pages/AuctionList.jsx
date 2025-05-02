// src/pages/AuctionList.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuctionCard from '../components/AuctionCard';

const categorizeAuctions = (auctions) => {
  const now = new Date();
  const live = [], upcoming = [], past = [];

  auctions.forEach((auction) => {
    const start = new Date(auction.startTime);
    const end = new Date(auction.endTime);
    if (start <= now && end >= now) live.push(auction);
    else if (start > now) upcoming.push(auction);
    else past.push(auction);
  });

  return { live, upcoming, past };
};

const AuctionList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auctions');
        setAuctions(res.data);
      } catch (err) {
        console.error('Failed to fetch auctions:', err);
      }
    };
    fetchAuctions();
  }, []);

  // Client-side filter
  const filtered = auctions.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { live, upcoming, past } = categorizeAuctions(filtered);

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24 px-4">
      {/* Search & (optional) Create */}
      <div className="flex items-center mb-6 mt-4 space-x-4">
        <input
          type="text"
          placeholder="Search auctions..."
          className="flex-1 p-3 border border-yellow-400 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {user?.role === 'seller' && (
          <button
            onClick={() => navigate('/create-auction')}
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
          >
            Create Auction
          </button>
        )}
      </div>

      {/* Render sections */}
      {[
        { label: '🟢 Live Auctions', data: live, color: 'text-green-400' },
        { label: '🟡 Upcoming Auctions', data: upcoming, color: 'text-blue-400' },
        { label: '🔴 Past Auctions', data: past, color: 'text-red-400' },
      ].map(
        (section) =>
          section.data.length > 0 && (
            <div key={section.label} className="mb-10">
              <h2 className={`text-xl font-bold mb-2 ${section.color}`}>
                {section.label}
              </h2>
              <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                {section.data.map((auction) => (
                  <div
                    key={auction._id}
                    className="flex-shrink-0 w-72 max-w-[18rem]"
                  >
                    <AuctionCard auction={auction} />
                  </div>
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
};

export default AuctionList;
