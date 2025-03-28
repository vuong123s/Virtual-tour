import React, { useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TourContext } from '../contexts';
import TourFrom from '../components/TourFrom';

const TourUpdate = () => {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const { 
    tour,
    loading,
    error,
    fetchTourById,
    updateTour
  } = useContext(TourContext);

  useEffect(() => {
    const loadTour = async () => {
      if (tourId) {
        const tourData = await fetchTourById(tourId);
        console.log('Fetched Tour Data:', tourData);
      }
    };
    loadTour();
  }, []);

  // Log whenever tour state changes
  useEffect(() => {
    if (tour) {
      console.log('Current Tour State:', {
        name: tour.name,
        description: tour.description,
        panoramas: tour.panoramas,
        infospots: tour.infospots,
        linkspots: tour.linkspots
      });
    }
  }, [tour]);

  const handleUpdate = async (formData) => {
    try {
      if (!tourId) {
        throw new Error('Tour ID is required for update');
      }

      

      const result = await updateTour(tourId, formData);
      console.log(result, result.success);
      if (result && result.success) {
        console.log('Tour updated successfully:', result.tour);
        alert('Tour updated successfully!');
        navigate('/tours');
      } else {
        throw new Error(result?.message || 'Failed to update tour');
      }
    } catch (err) {
      console.error('Error updating tour:', err);
      alert(`Failed to update tour: ${err.message}`);
    }
  };

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

  // Render form
  return (
    <div className="container mx-auto">
      <TourFrom 
        data={tour}
        onSubmit={handleUpdate}
        isLoading={loading}
      />
    </div>
  );
};

export default TourUpdate;
