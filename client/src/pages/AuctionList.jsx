// src/pages/AuctionList.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuctionCard from '../components/AuctionCard';
import { BASE_URL } from '../utils/constants';
import { useRef, useEffect as useReactEffect } from 'react';

// import { TransitionGroup, CSSTransition } from 'react-transition-group';

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

const CARDS_PER_VIEW = 4;

const AuctionCarousel = ({ auctions, color }) => {
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(0, auctions.length - CARDS_PER_VIEW);
  const handlePrev = () => setIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <div className="relative w-full">
      <div className="flex items-center w-full">
        {auctions.length > CARDS_PER_VIEW && (
          <button
            onClick={handlePrev}
            disabled={index === 0}
            className="z-10 p-2 rounded-full bg-gray-800 text-cyan-400 hover:bg-cyan-900 disabled:opacity-40 transition mr-2"
            aria-label="Previous"
            style={{ minWidth: 40 }}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <div className="overflow-hidden w-full">
          <div
            className="flex w-full"
            style={{
              transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
              transform: `translateX(-${index * 18.5}rem)` // 18rem card + 0.5rem gap
            }}
          >
            {auctions.map((auction) => (
              <div key={auction._id} className="w-72 max-w-[18rem] flex-shrink-0 mr-2 last:mr-0">
                <AuctionCard auction={auction} />
              </div>
            ))}
          </div>
        </div>
        {auctions.length > CARDS_PER_VIEW && (
          <button
            onClick={handleNext}
            disabled={index === maxIndex}
            className="z-10 p-2 rounded-full bg-gray-800 text-cyan-400 hover:bg-cyan-900 disabled:opacity-40 transition ml-2"
            aria-label="Next"
            style={{ minWidth: 40 }}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>
    </div>
  );
};

const AuctionList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  // Ensure body and html backgrounds are always dark
  useReactEffect(() => {
    document.body.classList.add('bg-black');
    document.documentElement.classList.add('bg-black');
    return () => {
      document.body.classList.remove('bg-black');
      document.documentElement.classList.remove('bg-black');
    };
  }, []);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const url = category
          ? BASE_URL + `/auctions?category=${encodeURIComponent(category)}`
          : BASE_URL + '/auctions';
        const res = await axios.get(url);
        setAuctions(res.data);
      } catch (err) {
        console.error('Failed to fetch auctions:', err);
      }
    };
    fetchAuctions();
  }, [category]);

  // Client-side filter
  const filtered = auctions.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { live, upcoming, past } = categorizeAuctions(filtered);

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 w-full flex flex-col flex-grow" style={{ minHeight: '100vh', backgroundColor: '#000' }}>
      {/* Search & (optional) Create */}
      <div className="flex items-center mb-6 mt-4 space-x-4">
        <input
          type="text"
          placeholder="Search auctions..."
          className="flex-1 p-3 border border-cyan-400 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-3 border border-cyan-400 rounded-lg bg-gray-900 text-white"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Art">Art</option>
          <option value="Books">Books</option>
          <option value="Other">Other</option>
        </select>
        {user?.role === 'seller' && (
          <button
            onClick={() => navigate('/create-auction')}
            className="bg-cyan-400 text-black px-4 py-2 rounded-lg hover:bg-cyan-600 transition"
          >
            Create Auction
          </button>
        )}
      </div>

      {/* Render sections */}
      {[
        { label: '🟢 Live Auctions', data: live, color: 'text-green-400' },
        { label: '🟡 Upcoming Auctions', data: upcoming, color: 'text-cyan-400' },
        { label: '🔴 Past Auctions', data: past, color: 'text-red-400' },
      ].map(
        (section) =>
          section.data.length > 0 && (
            <div key={section.label} className="mb-10">
              <h2 className={`text-xl font-bold mb-4 ${section.color}`}>{section.label}</h2>
              <AuctionCarousel auctions={section.data} color={section.color} />
            </div>
          )
      )}
    </div>
  );
};

export default AuctionList;
