import React from 'react';
import { IoInformation, IoCreate, IoClose, IoSettings } from "react-icons/io5";

export default function SpotsList({
  showSpotsList,
  setShowSpotsList,
  tour,
  currentPanoId,
  infospots,
  linkspots,
  deleteHotspot,
  setSelectedSpot,
  setShowEditSpot
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-75"
        onClick={() => setShowSpotsList(false)}
      ></div>
      
      <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Scene {tour.panoramas.indexOf(currentPanoId) + 1} Spots</h3>
            <button
              onClick={() => setShowSpotsList(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <IoClose size={24} />
            </button>
          </div>

          {/* Info Spots Section */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <IoInformation /> Info Spots
            </h4>
            <div className="space-y-2">
              {infospots.filter(spot => spot.panoId === currentPanoId).map(spot => (
                <div key={spot.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{spot.text}</p>
                      <p className="text-sm text-gray-600">
                        Position: ({spot.position.x}, {spot.position.y}, {spot.position.z})
                      </p>
                      {spot.img && <p className="text-sm text-gray-600">Has image</p>}
                      {spot.video && <p className="text-sm text-gray-600">Has video</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedSpot(spot);
                          setShowEditSpot(true);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <IoSettings size={20} />
                      </button>
                      <button
                        onClick={() => deleteHotspot(spot.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <IoClose size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Link Spots Section */}
          <div className="mt-6">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <IoCreate /> Link Spots
            </h4>
            <div className="space-y-2">
              {linkspots.filter(spot => spot.panoId === currentPanoId).map(spot => (
                <div key={spot.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{spot.text}</p>
                      <p className="text-sm text-gray-600">
                        Position: ({spot.position.x}, {spot.position.y}, {spot.position.z})
                      </p>
                      <p className="text-sm text-gray-600">
                        Links to: Scene {tour.panoramas.indexOf(spot.targetPanoId) + 1}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedSpot(spot);
                          setShowEditSpot(true);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <IoSettings size={20} />
                      </button>
                      <button
                        onClick={() => deleteHotspot(spot.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <IoClose size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 