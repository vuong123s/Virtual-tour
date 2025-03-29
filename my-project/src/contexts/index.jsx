import { createContext, useState, useEffect } from "react";
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api'; // Ensure this matches the backend URL

export const TourContext = createContext(null);

const TourProvider = (props) => {
  const [tour, setTour] = useState(null);
  const [allTours, setAllTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllTours = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/tours`);
      if (!response.ok) {
        throw new Error('Failed to fetch tours');
      }

      const data = await response.json();
      if (data.success) {
        setAllTours(data.tours);
      } else {
        throw new Error(data.message || 'Failed to fetch tours');
      }
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTourById = async (tourId) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching tour with ID:', tourId);

      const response = await fetch(`${API_BASE_URL}/tours/${tourId}`);
      console.log('API Response:', response);

      const data = await response.json();
      console.log('Parsed Data:', data);

      if (response.ok) {
        // Kiểm tra nếu data là tour trực tiếp
        if (data && typeof data === 'object') {
          const tourData = data.tour || data;
          console.log('Setting tour data:', tourData);
          setTour(tourData);
          return tourData;
        } else {
          throw new Error('Invalid tour data format');
        }
      } else {
        throw new Error(data.message || 'Failed to fetch tour');
      }
    } catch (err) {
      console.error('Error fetching tour:', err);
      setError(err.message);
      setTour(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createTour = async (tourData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/tours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(tourData)
      });

      if (!response.ok) {
        throw new Error('Failed to create tour');
      }

      const data = await response.json();
      if (data.success) {
        await fetchAllTours(); // Refresh the tours list
        return data.tour;
      } else {
        throw new Error(data.message || 'Failed to create tour');
      }
    } catch (err) {
      console.error('Error creating tour:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTour = async (tourId, tourData) => {
    
    try {
      setLoading(true);
      setError(null);
      console.log('Updating tour with ID:', tourId, 'Data:', tourData);

      const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(tourData)
      });

      const data = await response.json();

      if (response.ok && data) {
        const updatedTour = data.tour || data;
        setTour(updatedTour);
        await fetchAllTours(); // Refresh the tours list
        return {success: true, tour: updatedTour};
      } else {
        throw new Error(data.message || 'Failed to update tour');
      }
    } catch (err) {
      console.error('Error updating tour:', err);
      setError(err.message);
      return {success: false, message: err.message};
    } finally {
      setLoading(false);
    }
  };

  const deleteTour = async (tourId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete tour');
      }

      const data = await response.json();
      if (data.success) {
        await fetchAllTours(); // Refresh the tours list
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete tour');
      }
    } catch (err) {
      console.error('Error deleting tour:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch all tours when the provider mounts
  useEffect(() => {
    fetchAllTours();
  }, []);

  const contextValue = {
    // State
    tour,
    setTour,
    allTours,
    loading,
    error,
    
    // Actions
    fetchAllTours,
    fetchTourById,
    createTour,
    updateTour,
    deleteTour,
    
    // API URL for components that need it
    API_BASE_URL
  };

  return (
    <TourContext.Provider value={contextValue}>
      {props.children}
    </TourContext.Provider>
  );
};

export default TourProvider;