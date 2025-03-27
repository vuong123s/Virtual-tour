import React, { useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TourContext } from '../contexts';
import TourFrom from '../components/TourFrom';

const Tour = () => {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const { 
    tour,
    loading,
    error,
    fetchTourById
  } = useContext(TourContext);

  useEffect(() => {
    let isMounted = true;

    const loadTour = async () => {
      if (tourId && isMounted) {
        try {
          await fetchTourById(tourId);
        } catch (error) {
          console.error('Error loading tour:', error);
        }
      }
    };

    loadTour();

    return () => {
      isMounted = false;
    };
  }, [tourId]); // Chỉ phụ thuộc vào tourId

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate('/tours')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Tours
        </button>
      </div>
    );
  }

  // No tour found
  if (!tour) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl text-red-500 mb-4">Tour not found</div>
        <button
          onClick={() => navigate('/tours')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Tours
        </button>
      </div>
    );
  }

  // Render tour view
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/tours')}
              className="text-gray-600 hover:text-gray-800 mr-4"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">{tour.name}</h1>
          </div>
        </div>
      </div>

      {/* Tour Content */}
      <div className="flex-1">
        <TourFrom 
          data={tour}
          isLoading={loading}
          isTour={true}
        />
      </div>
    </div>
  );
};

export default Tour;
