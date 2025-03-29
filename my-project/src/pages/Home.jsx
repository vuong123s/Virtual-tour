import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TourContext } from '../contexts';
import { IoAdd, IoTrash, IoCreate, IoEye } from 'react-icons/io5';

const API_BASE_URL = 'http://localhost:8000/api'; 

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { allTours, loading, error, fetchAllTours, deleteTour } = useContext(TourContext);

  // Fetch tours when component mounts or when location changes (after creating a new tour)
  useEffect(() => {
    fetchAllTours();
  }, [location.pathname]); // Refresh when route changes

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading tours...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-xl text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={getTours}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 px-28">
        <h1 className="text-3xl font-bold">Virtual Tours</h1>
        <button
          onClick={() => navigate('/tour-create')}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <IoAdd size={20} />
          Create New Tour
        </button>
      </div>

      {allTours.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No tours available. Create your first tour!</p>
        </div>
      ) : (
        <div className="px-28 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allTours.map((tour) => (
            <div
              key={tour.tourId}
              className="mx-2 bg-white rounded-lg shadow-md overflow-hidden"
            >
              {tour.panoramas && tour.panoramas[0] && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={tour.panoramas[0].imageUrl}
                    alt={tour.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{tour.name}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {tour.description || 'No description available'}
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {tour.panoramas?.length || 0} scenes
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/tour/${tour.tourId}`)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                      title="View Tour"
                    >
                      <IoEye size={20} />
                    </button>
                    <button
                      onClick={() => navigate(`/tour-update/${tour.tourId}`)}
                      className="p-2 text-green-500 hover:bg-green-50 rounded"
                      title="Edit Tour"
                    >
                      <IoCreate size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(tour.tourId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
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
    </div>
  );
};

export default Home;