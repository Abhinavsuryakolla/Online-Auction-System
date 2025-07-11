import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuctionCard from '../components/AuctionCard';
import { BASE_URL } from '../utils/constants';

const MyAuctions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  if (loading) return <div className="text-center text-cyan-400 mt-20">Loading your auctions...</div>;
  if (error) return <div className="text-center text-red-400 mt-20">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 w-full flex flex-col flex-grow" style={{ minHeight: '100vh', backgroundColor: '#000' }}>
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">My Auctions</h1>
      {auctions.length === 0 ? (
        <div className="text-gray-400">You have not created any auctions yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {auctions.map((auction) => (
            <AuctionCard
              key={auction._id}
              auction={auction}
              onDelete={handleDelete}
              deletingId={deletingId}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAuctions; 