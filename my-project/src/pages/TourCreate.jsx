import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TourForm from '../components/TourFrom';
import { TourContext } from '../contexts';
const API_BASE_URL = 'http://localhost:3001';

const TourCreate = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (formData) => {
    try {
      setIsLoading(true);
      console.log('Creating new tour with data:', formData);

      // Generate tourId for new tour
      const newTourData = {
        ...formData,
        tourId: `tour_${Date.now()}`
      };

      const response = await fetch(`${API_BASE_URL}/tours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newTourData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        console.log('Tour created successfully:', result.tour);
        alert('Tour created successfully!');
        navigate('/tours');
      } else {
        throw new Error(result.message || 'Failed to create tour');
      }
    } catch (error) {
      console.error('Error creating tour:', error);
      alert(`Failed to create tour: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold p-4">Create New Tour</h1>
      <TourForm 
        onSubmit={handleCreate}
        isLoading={isLoading}
      />
    </div>
  );
};

export default TourCreate;
