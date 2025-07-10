// src/pages/CreateAuction.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

const CreateAuction = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imagesInput: '',        // comma-separated URLs
    startTimeLocal: '',     // yyyy-MM-ddThh:mm
    endTimeLocal: '',       // yyyy-MM-ddThh:mm
    startPrice: '',
    category: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build the payload in the required format
    const images = formData.imagesInput
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url);

    // Convert local datetime (which is in user's browser timezone, here IST) to UTC ISO
    const toUtcIso = (localDatetime) => {
      const dt = new Date(localDatetime);
      return dt.toISOString();
    };

    const payload = {
      title: formData.title,
      description: formData.description,
      images,
      startPrice: Number(formData.startPrice),
      startTime: toUtcIso(formData.startTimeLocal),
      endTime: toUtcIso(formData.endTimeLocal),
      category: formData.category,
    };

    try {
      await axios.post(
        BASE_URL +'/auctions',
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      navigate('/auctions');
    } catch (err) {
      console.error('Auction creation failed:', err);
      alert('Failed to create auction. See console for details.');
    }
  };

  if (user?.role !== 'seller') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-red-400 text-xl">Unauthorized Access</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 bg-black px-4 flex flex-col items-center w-full">
      <div className="max-w-3xl w-full bg-gray-900 rounded-3xl shadow-2xl p-10 flex flex-col items-center">
        <div className="flex items-center mb-8 gap-3">
          <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-tr from-cyan-500 to-cyan-900 shadow-lg">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </span>
          <h1 className="text-3xl font-extrabold text-cyan-400 tracking-tight">Create New Auction</h1>
        </div>
        <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Title */}
          <div className="bg-gray-800 rounded-xl p-4 shadow flex flex-col mb-2">
            <label className="block text-cyan-400 font-semibold mb-2">Title</label>
            <input
              type="text"
              className="w-full p-3 border border-cyan-700 rounded-xl bg-gray-900 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Category */}
          <div className="bg-gray-800 rounded-xl p-4 shadow flex flex-col mb-2">
            <label className="block text-yellow-400 font-semibold mb-2">Category</label>
            <input
              type="text"
              className="w-full p-3 border border-yellow-700 rounded-xl bg-gray-900 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="bg-gray-800 rounded-xl p-4 shadow flex flex-col md:col-span-2 mb-2">
            <label className="block text-cyan-400 font-semibold mb-2">Description</label>
            <textarea
              className="w-full p-3 border border-cyan-700 rounded-xl bg-gray-900 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* Images */}
          <div className="bg-gray-800 rounded-xl p-4 shadow flex flex-col mb-2">
            <label className="block text-pink-400 font-semibold mb-2">Images (comma-separated URLs)</label>
            <input
              type="text"
              className="w-full p-3 border border-pink-700 rounded-xl bg-gray-900 text-white focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition"
              placeholder="https://… , https://…"
              value={formData.imagesInput}
              onChange={(e) => setFormData({ ...formData, imagesInput: e.target.value })}
            />
          </div>

          {/* Starting Price */}
          <div className="bg-gray-800 rounded-xl p-4 shadow flex flex-col mb-2">
            <label className="block text-cyan-400 font-semibold mb-2">Starting Price ($)</label>
            <input
              type="number"
              className="w-full p-3 border border-cyan-700 rounded-xl bg-gray-900 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition"
              value={formData.startPrice}
              onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })}
              required
            />
          </div>

          {/* Start Time (Local) */}
          <div className="bg-gray-800 rounded-xl p-4 shadow flex flex-col mb-2">
            <label className="block text-cyan-400 font-semibold mb-2">Start Time (Your Local Time)</label>
            <input
              type="datetime-local"
              className="w-full p-3 border border-cyan-700 rounded-xl bg-gray-900 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition"
              value={formData.startTimeLocal}
              onChange={(e) => setFormData({ ...formData, startTimeLocal: e.target.value })}
              required
            />
          </div>

          {/* End Time (Local) */}
          <div className="bg-gray-800 rounded-xl p-4 shadow flex flex-col mb-2">
            <label className="block text-yellow-400 font-semibold mb-2">End Time (Your Local Time)</label>
            <input
              type="datetime-local"
              className="w-full p-3 border border-yellow-700 rounded-xl bg-gray-900 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
              value={formData.endTimeLocal}
              onChange={(e) => setFormData({ ...formData, endTimeLocal: e.target.value })}
              required
            />
          </div>

          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-cyan-900 text-white py-3 px-8 rounded-full font-bold text-lg shadow-lg hover:from-cyan-900 hover:to-cyan-500 hover:scale-105 transition-all duration-300"
            >
              Create Auction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuction;
