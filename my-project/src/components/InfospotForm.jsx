import React from 'react';
import { IoImage, IoVideocam, IoClose } from "react-icons/io5";
import * as PANOLENS from "panolens";

const API_BASE_URL = 'http://localhost:8000/api';

export default function InfospotForm({
  showInfospotForm,
  setShowInfospotForm,
  infospotInfo,
  setInfospotInfo,
  infospotSize,
  setInfospotSize,
  uploadedImage,
  setUploadedImage,
  uploadedVideo,
  setUploadedVideo,
  currentPanoId,
  currentPanorama,
  setInfospots,
  setPanoList,
  getInfospotContent,
  setModalContent,
  setShowInfoModal
}) {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Create Infospot</h3>
        <button
          onClick={() => setShowInfospotForm(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
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
                value={infospotInfo.position.x}
                onChange={(e) => setInfospotInfo(prev => ({
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
                value={infospotInfo.position.y}
                onChange={(e) => setInfospotInfo(prev => ({
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
                value={infospotInfo.position.z}
                onChange={(e) => setInfospotInfo(prev => ({
                  ...prev,
                  position: { ...prev.position, z: Number(e.target.value) }
                }))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Icon Size Input */}
        <div>
          <label className="block text-sm mb-1">Icon Size</label>
          <input
            type="number"
            value={infospotSize}
            onChange={(e) => setInfospotSize(Number(e.target.value))}
            className="w-full p-2 border rounded"
            min="50"
            max="1000"
            step="50"
          />
        </div>

        {/* Text Input */}
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            value={infospotInfo.text}
            onChange={(e) => setInfospotInfo(prev => ({ ...prev, text: e.target.value }))}
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Enter description"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm mb-1 flex items-center gap-2">
            <IoImage /> Image
          </label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  try {
                    const formData = new FormData();
                    formData.append('image', file);

                    const response = await fetch(`${API_BASE_URL}/upload/image`, {
                      method: 'POST',
                      body: formData
                    });

                    if (!response.ok) {
                      throw new Error('Failed to upload image');
                    }

                    const result = await response.json();
                    if (!result.success) {
                      throw new Error(result.message || 'Failed to upload image');
                    }

                    setUploadedImage(result.file.url);
                    setInfospotInfo(prev => ({
                      ...prev,
                      imageUrl: result.file.url
                    }));
                  } catch (error) {
                    console.error('Error uploading image:', error);
                    alert('Failed to upload image: ' + error.message);
                  }
                }
              }}
              className="w-full p-2 border rounded"
            />
            {uploadedImage && (
              <div className="relative">
                <img 
                  src={uploadedImage} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded"
                />
                <button
                  onClick={() => {
                    setUploadedImage(null);
                    setInfospotInfo(prev => ({ ...prev, imageUrl: "" }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Video Upload */}
        <div>
          <label className="block text-sm mb-1 flex items-center gap-2">
            <IoVideocam /> Video
          </label>
          <div className="space-y-2">
            <input
              type="file"
              accept="video/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  try {
                    const formData = new FormData();
                    formData.append('video', file);

                    const response = await fetch(`${API_BASE_URL}/upload/video`, {
                      method: 'POST',
                      body: formData
                    });

                    if (!response.ok) {
                      throw new Error('Failed to upload video');
                    }

                    const result = await response.json();
                    if (!result.success) {
                      throw new Error(result.message || 'Failed to upload video');
                    }

                    setUploadedVideo(result.file.url);
                    setInfospotInfo(prev => ({
                      ...prev,
                      videoUrl: result.file.url
                    }));
                  } catch (error) {
                    console.error('Error uploading video:', error);
                    alert('Failed to upload video: ' + error.message);
                  }
                }
              }}
              className="w-full p-2 border rounded"
            />
            {uploadedVideo && (
              <div className="relative">
                <video 
                  src={uploadedVideo} 
                  className="w-full rounded" 
                  controls
                />
                <button
                  onClick={() => {
                    setUploadedVideo(null);
                    setInfospotInfo(prev => ({ ...prev, videoUrl: "" }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={() => {
            const infospotId = `info_${String(Date.now()).slice(-3)}`;
            const infospotData = {
              id: infospotId,
              panoId: currentPanoId,
              position: infospotInfo.position,
              text: infospotInfo.text,
              img: uploadedImage || infospotInfo.imageUrl,
              video: uploadedVideo || infospotInfo.videoUrl,
              size: infospotSize,
              type: 'info'
            };

            // Create PANOLENS Infospot
            const newInfospot = new PANOLENS.Infospot(infospotSize, PANOLENS.DataImage.Info);
            newInfospot.position.set(
              infospotData.position.x,
              infospotData.position.y,
              infospotData.position.z
            );

            // Add hover text
            newInfospot.addHoverText(infospotData.text);

            // Handle click to show info
            newInfospot.addEventListener("click", () => {
              const content = getInfospotContent(
                infospotData.text,
                infospotData.img ? [infospotData.img] : [],
                infospotData.video ? [infospotData.video] : []
              );
              setModalContent(content);
              setShowInfoModal(true);
            });

            // Add Infospot to panorama
            currentPanorama?.add(newInfospot);

            // Add to state infospots
            setInfospots(prev => [...prev, infospotData]);

            // Update hotspots in panoList
            setPanoList(prev => 
              prev.map(pano => {
                if (pano.id === currentPanoId) {
                  return {
                    ...pano,
                    hotspots: [...pano.hotspots, infospotId]
                  };
                }
                return pano;
              })
            );

            // Reset form and uploaded files
            setInfospotInfo({
              text: "",
              imageUrl: "",
              videoUrl: "",
              position: { x: 0, y: 0, z: -5000 }
            });
            setUploadedImage(null);
            setUploadedVideo(null);
            setShowInfospotForm(false);
          }}
          className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Create Infospot
        </button>
      </div>
    </div>
  );
} 