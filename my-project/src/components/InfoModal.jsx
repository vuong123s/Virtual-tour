import React from 'react';
import { IoClose } from "react-icons/io5";

export default function InfoModal({ showInfoModal, setShowInfoModal, modalContent }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modal Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75"
        onClick={() => setShowInfoModal(false)}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setShowInfoModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <IoClose size={24} />
        </button>

        {/* Content Container */}
        <div className="p-6 space-y-6">
          

          {/* Images */}
          {modalContent.images && modalContent.images.length > 0 && (
            <div className="space-y-4">
              {modalContent.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Image ${index + 1}`}
                  className="w-full rounded-lg shadow-lg"
                />
              ))}
            </div>
          )}

          {/* Videos */}
          {modalContent.videos && modalContent.videos.length > 0 && (
            <div className="space-y-4">
              {modalContent.videos.map((video, index) => (
                <video
                  key={index}
                  src={video}
                  controls
                  className="w-full rounded-lg shadow-lg"
                />
              ))}
            </div>
          )}

          {/* Text Content */}
          {modalContent.text && (
            <div className="prose max-w-none">
              <p className="text-lg">{modalContent.text}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
} 