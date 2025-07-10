import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';

function Profile() {
  const { user, setUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', gender: '' });
  const [wallet, setWallet] = useState(0);
  const [auctions, setAuctions] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, phoneNumber: user.phoneNumber || '', gender: user.gender || '' });
    }
  }, [user]);

  useEffect(() => {
    const fetchPastAuctions = async () => {
      try {
        const res = await axios.get(BASE_URL +`/auctions/user/past?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setAuctions(res.data.auctions);
        setTotal(res.data.total);
      } catch (err) {
        setAuctions([]);
      }
    };
    fetchPastAuctions();
  }, [page]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = async () => {
    try {
      const res = await axios.put(BASE_URL+'/auth/profile', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUser(res.data.user);
      setEditMode(false);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-gray-400 text-lg">Loading user details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 bg-black px-4 flex flex-col items-center w-full">
      <div className="max-w-2xl w-full bg-gray-900 rounded-3xl shadow-2xl p-8 flex flex-col items-center">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-900 flex items-center justify-center mb-4 shadow-lg">
          <span className="text-4xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
        </div>
        <h2 className="text-3xl font-extrabold text-cyan-400 mb-2">{user.name}</h2>
        <p className="text-lg text-gray-400 mb-6">{user.email}</p>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 shadow flex flex-col items-center">
            <span className="text-sm text-gray-400">Wallet Balance</span>
            <span className="text-2xl font-bold text-cyan-400 mt-1">${user.wallet?.toFixed(2) ?? '0.00'}</span>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 shadow flex flex-col items-center">
            <span className="text-sm text-gray-400">Role</span>
            <span className="text-xl font-semibold text-yellow-400 mt-1">{user.role}</span>
          </div>
        </div>
        {editMode ? (
          <div className="w-full space-y-4 mb-6">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-cyan-400 bg-gray-800 text-white" />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Email</label>
              <input name="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-cyan-400 bg-gray-800 text-white" />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Phone</label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-cyan-400 bg-gray-800 text-white" />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Gender</label>
              <input name="gender" value={form.gender} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-cyan-400 bg-gray-800 text-white" />
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">Save</button>
              <button onClick={handleCancel} className="bg-gray-700 text-white px-4 py-2 rounded shadow hover:bg-gray-600">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 rounded-xl p-4 shadow flex flex-col items-center">
              <span className="text-sm text-gray-400">Phone</span>
              <span className="text-lg font-semibold text-cyan-400 mt-1">{user.phoneNumber}</span>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 shadow flex flex-col items-center">
              <span className="text-sm text-gray-400">Gender</span>
              <span className="text-lg font-semibold text-pink-400 mt-1">{user.gender}</span>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 shadow flex flex-col items-center md:col-span-2">
              <span className="text-sm text-gray-400">Joined</span>
              <span className="text-lg font-semibold text-cyan-400 mt-1">{new Date(user.createdAt).toLocaleString()}</span>
            </div>
          </div>
        )}
        <div className="w-full flex justify-end mb-8">
          {!editMode && (
            <button onClick={handleEdit} className="bg-cyan-600 text-white px-4 py-2 rounded shadow hover:bg-cyan-700">Edit Profile</button>
          )}
        </div>
        <div className="w-full mt-4">
          <h3 className="text-2xl font-bold mb-4 text-cyan-400">Past Auctions</h3>
          {auctions.length === 0 ? (
            <p className="text-gray-400">No past auctions found.</p>
          ) : (
            <ul className="divide-y divide-gray-800">
              {auctions.map((a) => (
                <li key={a._id} className="py-3 flex justify-between items-center">
                  <span className="font-semibold text-cyan-400">{a.title}</span>
                  <span className="text-gray-400 text-sm">{a.status} - Ends: {new Date(a.endTime).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-800 text-white rounded shadow disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-cyan-400">Page {page}</span>
            <button
              onClick={() => setPage((p) => (p * limit < total ? p + 1 : p))}
              disabled={page * limit >= total}
              className="px-4 py-2 bg-gray-800 text-white rounded shadow disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
