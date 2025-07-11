import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuctionCard from '../components/AuctionCard';
import { BASE_URL } from '../utils/constants';
import { useEffect as useReactEffect } from 'react';

const MyAuctions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
    if (!user || user.role !== 'seller') {
      navigate('/');
      return;
    }
    const fetchMyAuctions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(BASE_URL + '/auctions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        // Filter auctions by seller id (in case API returns all)
        const myAuctions = res.data.filter(a => a.seller && (a.seller._id === user.id || a.seller === user.id));
        setAuctions(myAuctions);
      } catch (err) {
        setError('Failed to fetch your auctions.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyAuctions();
  }, [user, navigate]);

  const handleDelete = async (auctionId) => {
    if (!window.confirm('Are you sure you want to delete this auction?')) return;
    setDeletingId(auctionId);
    try {
      await axios.delete(BASE_URL + `/auctions/${auctionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAuctions(prev => prev.filter(a => a._id !== auctionId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete auction');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }
  
  if (error) return <div className="text-center text-red-400 mt-20">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 w-full flex flex-col flex-grow" style={{ minHeight: '100vh', backgroundColor: '#000' }}>
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <svg className="h-10 w-10 text-cyan-400 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h1 className="text-4xl font-extrabold text-cyan-400 tracking-tight drop-shadow-lg">My Auctions</h1>
        </div>
        
        {auctions.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-cyan-900/30 p-16">
              <svg className="h-16 w-16 text-cyan-700 opacity-60 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-2xl font-semibold text-cyan-300 mb-2">No Auctions Yet</p>
              <p className="text-gray-400">Start by creating your first auction to see it here.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {auctions.map((auction) => (
              <div key={auction._id} className="transform hover:scale-105 transition-all duration-300">
                <AuctionCard
                  auction={auction}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                  user={user}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAuctions; 