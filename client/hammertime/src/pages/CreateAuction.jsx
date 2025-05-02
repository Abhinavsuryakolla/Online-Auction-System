// src/pages/CreateAuction.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    };

    try {
      await axios.post(
        'http://localhost:5000/api/auctions',
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">Unauthorized Access</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Create New Auction</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              className="w-full p-2 border rounded"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-gray-700 mb-2">
              Images (comma-separated URLs)
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="https://… , https://…"
              value={formData.imagesInput}
              onChange={(e) =>
                setFormData({ ...formData, imagesInput: e.target.value })
              }
            />
          </div>

          {/* Starting Price */}
          <div>
            <label className="block text-gray-700 mb-2">Starting Price ($)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={formData.startPrice}
              onChange={(e) =>
                setFormData({ ...formData, startPrice: e.target.value })
              }
              required
            />
          </div>

          {/* Start Time (Local) */}
          <div>
            <label className="block text-gray-700 mb-2">
              Start Time (Your Local Time)
            </label>
            <input
              type="datetime-local"
              className="w-full p-2 border rounded"
              value={formData.startTimeLocal}
              onChange={(e) =>
                setFormData({ ...formData, startTimeLocal: e.target.value })
              }
              required
            />
          </div>

          {/* End Time (Local) */}
          <div>
            <label className="block text-gray-700 mb-2">
              End Time (Your Local Time)
            </label>
            <input
              type="datetime-local"
              className="w-full p-2 border rounded"
              value={formData.endTimeLocal}
              onChange={(e) =>
                setFormData({ ...formData, endTimeLocal: e.target.value })
              }
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 text-gray-900 py-2 px-4 rounded hover:bg-yellow-300 transition-colors"
          >
            Create Auction
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAuction;
