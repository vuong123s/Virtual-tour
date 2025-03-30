import React from 'react';
import * as PANOLENS from "panolens";
import * as THREE from "three";

export default function LinkspotForm({
  showLinkspotForm,
  setShowLinkspotForm,
  linkspotInfo,
  setLinkspotInfo,
  tour,
  currentPanoId,
  currentPanorama,
  viewer,
  setLinkspots,
  setPanoList,
  switchPanorama
}) {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Create Linkspot</h3>
        <button
          onClick={() => setShowLinkspotForm(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Target Panorama Selection */}
        <div>
          <label className="block text-sm mb-1">Target Scene</label>
          <select
            value={linkspotInfo.targetPanoId}
            onChange={(e) => setLinkspotInfo(prev => ({ ...prev, targetPanoId: e.target.value }))}
            className="w-full p-2 border rounded"
          >
            <option value="">Select target scene</option>
            {tour.panoramas
              .filter(id => id !== currentPanoId)
              .map((panoId, index) => (
                <option key={panoId} value={panoId}>
                  Scene {tour.panoramas.indexOf(panoId) + 1}
                </option>
              ))}
          </select>
        </div>

        {/* Position Inputs */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Position</h4>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm mb-1">X</label>
              <input
                type="number"
                value={linkspotInfo.position.x}
                onChange={(e) => setLinkspotInfo(prev => ({
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
                value={linkspotInfo.position.y}
                onChange={(e) => setLinkspotInfo(prev => ({
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
                value={linkspotInfo.position.z}
                onChange={(e) => setLinkspotInfo(prev => ({
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
            value={linkspotInfo.size}
            onChange={(e) => setLinkspotInfo(prev => ({ ...prev, size: Number(e.target.value) }))}
            className="w-full p-2 border rounded"
            min="50"
            max="1000"
            step="50"
          />
        </div>

        {/* Text Input */}
        <div>
          <label className="block text-sm mb-1">Hover Text</label>
          <textarea
            value={linkspotInfo.text}
            onChange={(e) => setLinkspotInfo(prev => ({ ...prev, text: e.target.value }))}
            className="w-full p-2 border rounded"
            rows="2"
            placeholder={`Default: Đến Scene ${linkspotInfo.targetPanoId ? tour.panoramas.indexOf(linkspotInfo.targetPanoId) + 1 : ''}`}
          />
        </div>

        {/* Create Button */}
        <button
          onClick={() => {
            const linkspotId = `link_${String(Date.now()).slice(-3)}`;
            const linkspotData = {
              id: linkspotId,
              panoId: currentPanoId,
              targetPanoId: linkspotInfo.targetPanoId,
              position: linkspotInfo.position,
              text: linkspotInfo.text || `Đến Scene ${tour.panoramas.indexOf(linkspotInfo.targetPanoId) + 1}`,
              size: linkspotInfo.size,
              type: 'link'
            };

            // Create PANOLENS Infospot for linkspot
            const newLinkspot = new PANOLENS.Infospot(linkspotInfo.size, PANOLENS.DataImage.Arrow);
            newLinkspot.position.set(
              linkspotInfo.position.x,
              linkspotInfo.position.y,
              linkspotInfo.position.z
            );

            // Add hover text
            newLinkspot.addHoverText(linkspotData.text);

            // Add hover effect
            newLinkspot.addEventListener('hover', () => {
              newLinkspot.scale.set(1.2, 1.2, 1);
            });

            newLinkspot.addEventListener('hoverout', () => {
              newLinkspot.scale.set(1, 1, 1);
            });

            // Handle click to switch panorama
            newLinkspot.addEventListener('click', () => {
              if (viewer) {
                const currentLookAt = viewer.getCamera().getWorldDirection(new THREE.Vector3());
                switchPanorama(linkspotInfo.targetPanoId);
                setTimeout(() => {
                  viewer.tweenControlCenter(currentLookAt, 0);
                }, 100);
              } else {
                console.error('Viewer not initialized');
                switchPanorama(linkspotInfo.targetPanoId);
              }
            });

            // Add Linkspot to panorama
            currentPanorama?.add(newLinkspot);

            // Add to state linkspots
            setLinkspots(prev => [...prev, linkspotData]);

            // Create return linkspot
            const returnLinkspotId = `link_${String(Date.now() + 1).slice(-3)}`;
            const returnPosition = {
              x: -linkspotInfo.position.x,
              y: linkspotInfo.position.y,
              z: -linkspotInfo.position.z
            };

            const returnLinkspotData = {
              id: returnLinkspotId,
              panoId: linkspotInfo.targetPanoId,
              targetPanoId: currentPanoId,
              position: returnPosition,
              text: `Quay lại Scene ${tour.panoramas.indexOf(currentPanoId) + 1}`,
              size: linkspotInfo.size,
              type: 'link'
            };

            // Create PANOLENS Infospot for return linkspot
            const returnLinkspot = new PANOLENS.Infospot(linkspotInfo.size, PANOLENS.DataImage.Arrow);
            returnLinkspot.position.set(
              returnPosition.x,
              returnPosition.y,
              returnPosition.z
            );

            returnLinkspot.addHoverText(returnLinkspotData.text);

            returnLinkspot.addEventListener('hover', () => {
              returnLinkspot.scale.set(1.2, 1.2, 1);
            });

            returnLinkspot.addEventListener('hoverout', () => {
              returnLinkspot.scale.set(1, 1, 1);
            });

            returnLinkspot.addEventListener('click', () => {
              if (viewer) {
                const currentLookAt = viewer.getCamera().getWorldDirection(new THREE.Vector3());
                switchPanorama(currentPanoId);
                setTimeout(() => {
                  viewer.tweenControlCenter(currentLookAt, 0);
                }, 100);
              } else {
                console.error('Viewer not initialized');
                switchPanorama(currentPanoId);
              }
            });

            // Add return linkspot to target panorama
            currentPanorama?.add(returnLinkspot);

            // Update state for return linkspot
            setLinkspots(prev => [...prev, returnLinkspotData]);

            // Reset form
            setLinkspotInfo({
              id: "",
              panoId: "",
              targetPanoId: "",
              position: { x: 0, y: 0, z: -5000 },
              size: 300
            });
            setShowLinkspotForm(false);
          }}
          disabled={!linkspotInfo.targetPanoId}
          className={`w-full p-2 text-white rounded ${
            linkspotInfo.targetPanoId 
              ? 'bg-blue-500 hover:bg-blue-600' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Create Linkspot
        </button>
      </div>
    </div>
  );
} 