import React from 'react';
import { IoClose, IoImage, IoVideocam } from "react-icons/io5";

export default function EditSpotModal({
  showEditSpot,
  setShowEditSpot,
  selectedSpot,
  setSelectedSpot,
  updateSpot
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-75"
        onClick={() => {
          setShowEditSpot(false);
          setSelectedSpot(null);
        }}
      ></div>
      
      <div className="relative bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Edit Spot</h3>
            <button
              onClick={() => {
                setShowEditSpot(false);
                setSelectedSpot(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <IoClose size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Position Inputs */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Position</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm mb-1">X</label>
                  <input
                    type="number"
                    value={selectedSpot.position.x}
                    onChange={(e) => setSelectedSpot(prev => ({
                      ...prev,
                      position: { ...prev.position, x: Number(e.target.value) }
                    }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Y</label>
                  <input
                    type="number"
                    value={selectedSpot.position.y}
                    onChange={(e) => setSelectedSpot(prev => ({
                      ...prev,
                      position: { ...prev.position, y: Number(e.target.value) }
                    }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Z</label>
                  <input
                    type="number"
                    value={selectedSpot.position.z}
                    onChange={(e) => setSelectedSpot(prev => ({
                      ...prev,
                      position: { ...prev.position, z: Number(e.target.value) }
                    }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>

            {/* Size Input */}
            <div>
              <label className="block text-sm mb-1">Icon Size</label>
              <input
                type="number"
                value={selectedSpot.size}
                onChange={(e) => setSelectedSpot(prev => ({
                  ...prev,
                  size: Number(e.target.value)
                }))}
                className="w-full p-2 border rounded"
                min="50"
                max="1000"
                step="50"
              />
            </div>

            {/* Text Input */}
            <div>
              <label className="block text-sm mb-1">Text</label>
              <textarea
                value={selectedSpot.text}
                onChange={(e) => setSelectedSpot(prev => ({
                  ...prev,
                  text: e.target.value
                }))}
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>

            {/* Image Upload - Only show for infospots */}
            {selectedSpot.type === 'info' && (
              <div>
                <label className="block text-sm mb-1 flex items-center gap-2">
                  <IoImage /> Image
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const imageUrl = URL.createObjectURL(file);
                        setSelectedSpot(prev => ({
                          ...prev,
                          img: imageUrl
                        }));
                      }
                    }}
                    className="w-full p-2 border rounded"
                  />
                  {selectedSpot.img && (
                    <div className="relative">
                      <img 
                        src={selectedSpot.img} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        onClick={() => {
                          setSelectedSpot(prev => ({
                            ...prev,
                            img: null
                          }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <IoClose size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Video Upload - Only show for infospots */}
            {selectedSpot.type === 'info' && (
              <div>
                <label className="block text-sm mb-1 flex items-center gap-2">
                  <IoVideocam /> Video
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const videoUrl = URL.createObjectURL(file);
                        setSelectedSpot(prev => ({
                          ...prev,
                          video: videoUrl
                        }));
                      }
                    }}
                    className="w-full p-2 border rounded"
                  />
                  {selectedSpot.video && (
                    <div className="relative">
                      <video 
                        src={selectedSpot.video} 
                        className="w-full rounded" 
                        controls
                      />
                      <button
                        onClick={() => {
                          setSelectedSpot(prev => ({
                            ...prev,
                            video: null
                          }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <IoClose size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Update Button */}
            <button
              onClick={() => {
                updateSpot(selectedSpot.id, {
                  position: selectedSpot.position,
                  text: selectedSpot.text,
                  size: selectedSpot.size,
                  img: selectedSpot.img,
                  video: selectedSpot.video
                });
                setShowEditSpot(false);
                setSelectedSpot(null);
              }}
              className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Update Spot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 