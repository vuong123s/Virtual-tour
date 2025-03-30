import React from 'react';

export default function TourInfo({ tour, setTour, isEditMode, isTour, handleSave, isLoading }) {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <h3 className="font-bold mb-2">Tour Information</h3>
      <input 
        type="text" 
        value={tour.name}
        onChange={(e) => setTour(prev => ({ ...prev, name: e.target.value }))}
        className="w-full p-2 border rounded mb-2"
        placeholder="Tour Name"
        disabled={!isEditMode && !isTour}
      />
      <textarea 
        value={tour.description}
        onChange={(e) => setTour(prev => ({ ...prev, description: e.target.value }))}
        className="w-full p-2 border rounded mb-2"
        placeholder="Tour Description"
        rows="3"
        disabled={!isEditMode && !isTour}
      />
      {!isTour && isEditMode && (
        <button
          onClick={handleSave}
          disabled={tour.panoramas.length === 0 || isLoading}
          className={`w-full p-2 ${
            tour.panoramas.length > 0 && !isLoading
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gray-400 cursor-not-allowed'
          } text-white rounded`}
        >
          {isLoading ? 'Saving...' : 'Save Tour'}
        </button>
      )}
    </div>
  );
} 