import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading user details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold text-yellow-500 mb-6">Profile</h2>
        
        <div className="space-y-4 text-gray-800">
          <div>
            <span className="font-semibold">Name:</span> {user.name}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-semibold">Role:</span> {user.role}
          </div>
          <div>
            <span className="font-semibold">Joined:</span> {new Date(user.createdAt).toLocaleString()}
          </div>
          {/* You can add more fields if your user model includes them */}
        </div>
      </div>
    </div>
  );
}

export default Profile;
