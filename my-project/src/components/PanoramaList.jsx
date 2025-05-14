import React, { useState } from 'react';
import { IoCreate, IoInformation, IoClose, IoList, IoSettings } from "react-icons/io5";

export default function PanoramaList({ 
  tour, 
  panoList, 
  currentPanoId, 
  infospots, 
  linkspots, 
  isEditMode, 
  switchPanorama, 
  deletePanorama,
  setShowSpotsList,
  setShowInfospotForm,
  setShowLinkspotForm,
  setCurrentPanoId,
  updatePanoName,
  filteredPanoramas
}) {
  const [editingPanoId, setEditingPanoId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleNameEdit = (panoId, currentName) => {
    setEditingPanoId(panoId);
    setEditingName(currentName);
  };

  const handleNameSave = (panoId) => {
    if (editingName.trim()) {
      updatePanoName(panoId, editingName.trim());
    }
    setEditingPanoId(null);
    setEditingName('');
  };

  const handleKeyPress = (e, panoId) => {
    if (e.key === 'Enter') {
      handleNameSave(panoId);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="font-bold mb-2">Panorama Scenes</h3>
      <div className="space-y-2">
        {filteredPanoramas.map((panoId, index) => {
          const pano = panoList.find(p => p.id === panoId);
          return (
            <div 
              key={panoId}
              className={`p-2 rounded-lg ${
                currentPanoId === panoId 
                  ? 'bg-blue-100 border-2 border-blue-500' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div 
                  className="flex items-center space-x-2 cursor-pointer flex-grow"
                  onClick={() => switchPanorama(panoId)}
                >
                  <img 
                    src={pano?.imageUrl} 
                    alt={pano?.name || `Scene ${index + 1}`} 
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    {editingPanoId === panoId ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, panoId)}
                        onBlur={() => handleNameSave(panoId)}
                        className="font-medium border rounded px-1"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{pano?.name || `Scene ${index + 1}`}</h4>
                        {isEditMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNameEdit(panoId, pano?.name || `Scene ${index + 1}`);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                            title="Edit Scene Name"
                          >
                            <IoSettings size={16} />
                          </button>
                        )}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 flex gap-2">
                      <span title="Info spots">
                        <IoInformation className="inline mr-1" />
                        {infospots.filter(spot => spot.panoId === panoId).length}
                      </span>
                      <span title="Link spots">
                        <IoCreate className="inline mr-1" />
                        {linkspots.filter(spot => spot.panoId === panoId).length}
                      </span>
                    </div>
                  </div>
                </div>
                {isEditMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this panorama?')) {
                        deletePanorama(panoId);
                      }
                    }}
                    className="p-2 text-red-500 hover:text-red-700"
                    title="Delete Panorama"
                  >
                    <IoClose size={24} />
                  </button>
                )}
              </div>

              {/* Buttons Container - Only show in edit mode */}
              {isEditMode && (
                <div className="flex gap-2 mt-2">
                  {/* Show Spots List Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSpotsList(true);
                      setCurrentPanoId(panoId);
                    }}
                    className="flex-1 p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center gap-1 text-sm"
                    title="View Spots"
                  >
                    <IoList size={16} />
                    Spots
                  </button>

                  {/* Create Info Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInfospotForm(true);
                      setCurrentPanoId(panoId);
                    }}
                    className="flex-1 p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-1 text-sm"
                    title="Add Info Point"
                  >
                    <IoInformation size={16} />
                    Add Info
                  </button>

                  {/* Create Link Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLinkspotForm(true);
                      setCurrentPanoId(panoId);
                    }}
                    className="flex-1 p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center justify-center gap-1 text-sm"
                    title="Add Link Point"
                  >
                    <IoCreate size={16} />
                    Add Link
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 