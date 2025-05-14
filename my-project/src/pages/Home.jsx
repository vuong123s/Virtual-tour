import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TourContext } from '../contexts';
import { IoAdd, IoTrash, IoCreate, IoEye, IoHome, IoPeople, IoLogOut, IoSettings, IoStatsChart, IoGrid, IoBarChart, IoPieChart, IoLockClosed, IoPerson, IoNotifications, IoColorPalette } from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; 

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { allTours, loading, error, fetchAllTours, deleteTour } = useContext(TourContext);
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('tours');
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalTours: 0,
    totalUsers: 0,
    totalScenes: 0,
    recentTours: [],
    popularTours: []
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'en',
    timezone: 'UTC'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState(null);
  const [settingsSuccess, setSettingsSuccess] = useState(null);

  // Redirect based on admin status
  useEffect(() => {
    if (user) {
      if (!user.admin) {
        navigate('/interface');
      }
    }
  }, [user, navigate]);

  // Fetch tours when component mounts or when location changes
  useEffect(() => {
    fetchAllTours();
  }, [location.pathname]);

  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data);
      setUserError(null);
    } catch (err) {
      setUserError('Failed to fetch users');
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleDelete = async (tourId) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) {
      return;
    }

    try {
      const result = await deleteTour(tourId);
      if (result) {
        await fetchAllTours();
        alert('Tour deleted successfully!');
      } else {
        throw new Error(result.message || 'Failed to delete tour');
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
      alert('Failed to delete tour: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(users.filter((user) => user._id !== userId));
      alert('User deleted successfully!');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const handleToggleAdmin = async (userId, currentAdminStatus) => {
    const newStatus = !currentAdminStatus;
    const action = newStatus ? 'promote to admin' : 'remove admin privileges from';
    
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/user/${userId}/toggle-admin`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Show success message
      alert(response.data.message || `Successfully ${action} user`);
      
      // Reload user data
      await fetchUsers();
      
    } catch (err) {
      console.error('Error updating user admin status:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update user admin status';
      alert(errorMessage);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      // Calculate analytics from existing data
      const totalTours = allTours.length;
      const totalUsers = users.length;
      const totalScenes = allTours.reduce((acc, tour) => acc + (tour.panoramas?.length || 0), 0);
      
      // Get recent tours (last 5)
      const recentTours = [...allTours]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Get popular tours (most scenes)
      const popularTours = [...allTours]
        .sort((a, b) => (b.panoramas?.length || 0) - (a.panoramas?.length || 0))
        .slice(0, 5);

      setAnalytics({
        totalTours,
        totalUsers,
        totalScenes,
        recentTours,
        popularTours
      });
      setAnalyticsError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setAnalyticsError('Failed to load analytics data');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, allTours, users]);

  const handleSettingsChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSettingsError('New passwords do not match');
      return;
    }

    setSettingsLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/user/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSettingsSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setSettingsError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      await axios.put(
        `${API_BASE_URL}/user/settings`,
        settings,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setSettingsSuccess('Settings updated successfully');
    } catch (err) {
      setSettingsError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const renderTours = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-xl text-gray-600">Loading tours...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-xl text-red-500 mb-4">Error: {error}</div>
          <button
            onClick={fetchAllTours}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tour Management</h1>
            <p className="text-gray-500 mt-1">Manage and organize your virtual tours</p>
          </div>
          <button
            onClick={() => navigate('/tour-create')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <IoAdd size={20} />
            Create New Tour
          </button>
        </div>

        {allTours.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-xl text-gray-600">No tours available. Create your first tour!</p>
            <button
              onClick={() => navigate('/tour-create')}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allTours.map((tour) => (
              <div
                key={tour.tourId}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {tour.panoramas && tour.panoramas[0] && (
                  <div className="h-56 overflow-hidden">
                    <img
                      src={tour.panoramas[0].imageUrl}
                      alt={tour.name}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">{tour.name}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {tour.description || 'No description available'}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                        {tour.panoramas?.length || 0} scenes
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/tour/${tour.tourId}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 hover:scale-110"
                        title="View Tour"
                      >
                        <IoEye size={20} />
                      </button>
                      <button
                        onClick={() => navigate(`/tour-update/${tour.tourId}`)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-all duration-300 hover:scale-110"
                        title="Edit Tour"
                      >
                        <IoCreate size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(tour.tourId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-all duration-300 hover:scale-110"
                        title="Delete Tour"
                      >
                        <IoTrash size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  const renderUsers = () => {
    if (userLoading) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-xl text-gray-600">Loading users...</div>
          </div>
        </div>
      );
    }

    if (userError) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-xl text-red-500 mb-4">Error: {userError}</div>
          <button
            onClick={fetchUsers}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-500 mt-1">Manage system users and permissions</p>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-xl text-gray-600">No users found in the system.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Username</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Role</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-800">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.admin ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {user.admin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleAdmin(user._id, user.admin)}
                        className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                          user.admin 
                            ? 'text-purple-600 hover:bg-purple-50' 
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        title={user.admin ? 'Remove Admin' : 'Make Admin'}
                      >
                        {user.admin ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-all duration-300 hover:scale-110"
                        title="Delete User"
                      >
                        <IoTrash size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  };

  const renderAnalytics = () => {
    if (analyticsLoading) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-xl text-gray-600">Loading analytics...</div>
          </div>
        </div>
      );
    }

    if (analyticsError) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-xl text-red-500 mb-4">Error: {analyticsError}</div>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
            <p className="text-gray-500 mt-1">Overview of your virtual tour platform</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
          >
            Refresh Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Tours</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{analytics.totalTours}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <IoBarChart className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{analytics.totalUsers}</h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <IoPeople className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Scenes</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{analytics.totalScenes}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <IoPieChart className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent and Popular Tours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Tours */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Recent Tours</h2>
            </div>
            <div className="p-6">
              {analytics.recentTours.length === 0 ? (
                <p className="text-gray-500 text-center">No recent tours</p>
              ) : (
                <div className="space-y-4">
                  {analytics.recentTours.map((tour) => (
                    <div key={tour.tourId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-800">{tour.name}</h3>
                        <p className="text-sm text-gray-500">{tour.panoramas?.length || 0} scenes</p>
                      </div>
                      <button
                        onClick={() => navigate(`/tour/${tour.tourId}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Popular Tours */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Popular Tours</h2>
            </div>
            <div className="p-6">
              {analytics.popularTours.length === 0 ? (
                <p className="text-gray-500 text-center">No popular tours</p>
              ) : (
                <div className="space-y-4">
                  {analytics.popularTours.map((tour) => (
                    <div key={tour.tourId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-800">{tour.name}</h3>
                        <p className="text-sm text-gray-500">{tour.panoramas?.length || 0} scenes</p>
                      </div>
                      <button
                        onClick={() => navigate(`/tour/${tour.tourId}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderSettings = () => {
    return (
      <>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
          </div>
        </div>

        {settingsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{settingsError}</p>
          </div>
        )}

        {settingsSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{settingsSuccess}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <IoPerson className="mr-2" size={20} />
                  Account Settings
                </h2>
              </div>
              <div className="p-6">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {settingsLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <IoColorPalette className="mr-2" size={20} />
                  Preferences
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                    <p className="text-sm text-gray-500">Receive email notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => handleSettingsChange('notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Dark Mode</h3>
                    <p className="text-sm text-gray-500">Enable dark theme</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.darkMode}
                      onChange={(e) => handleSettingsChange('darkMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingsChange('language', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingsChange('timezone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST</option>
                    <option value="PST">PST</option>
                    <option value="GMT">GMT</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={settingsLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
                >
                  {settingsLoading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Admin Panel
          </h2>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.username}</p>
        </div>
        <nav className="mt-6 px-4">
          <button
            onClick={() => setActiveTab('tours')}
            className={`flex items-center w-full px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-300 mb-2 ${
              activeTab === 'tours' ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <IoGrid className="mr-3" size={20} />
            Tour Management
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center w-full px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-300 mb-2 ${
              activeTab === 'users' ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <IoPeople className="mr-3" size={20} />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center w-full px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-300 mb-2 ${
              activeTab === 'analytics' ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <IoStatsChart className="mr-3" size={20} />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center w-full px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-300 mb-2 ${
              activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <IoSettings className="mr-3" size={20} />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 mt-auto"
          >
            <IoLogOut className="mr-3" size={20} />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'tours' ? renderTours() : 
           activeTab === 'users' ? renderUsers() : 
           activeTab === 'analytics' ? renderAnalytics() : 
           renderSettings()}
        </div>
      </div>
    </div>
  );
};

export default Home;