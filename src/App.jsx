import React, { useRef, useState, useEffect } from "react";
import * as PANOLENS from "panolens";
import * as THREE from "three";
import { IoCreate } from "react-icons/io5";

export default function VirtualTourEditor() {
  const containerRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [panoramas, setPanoramas] = useState({});
  const [currentPanorama, setCurrentPanorama] = useState(null);
  const [targetPanoId, setTargetPanoId] = useState("");
  
  // Updated state management to match the data structure
  const [tour, setTour] = useState({
    id: 'tour_001',
    name: "My Virtual Tour",
    createdAt: new Date().toISOString(),
    panoramas: []
  });

  const [panoList, setPanoList] = useState({});  // Store panorama data
  const [hotspots, setHotspots] = useState({}); // Store hotspot data
  const [currentPanoId, setCurrentPanoId] = useState(null);
  const [hotspotText, setHotspotText] = useState("");
  
  // Hotspot creation states
  const [showHotspotSettings, setShowHotspotSettings] = useState(false);

  // Add new state for manual position input
  const [manualPosition, setManualPosition] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    console.log('Current images state:', tour.panoramas);
  }, [tour.panoramas]);

  useEffect(() => {
    return () => {
      if (viewer) {
        // Remove all panoramas first
        Object.values(panoramas).forEach(panorama => {
          if (panorama) {
            viewer.remove(panorama);
            panorama.dispose();
          }
        });
        // Then dispose the viewer
        viewer.dispose();
      }
    };
  }, []);

  const getInfospotContent = (text, photos, videos) => {
    let content = '<div style="background: rgba(0, 0, 0, 0.8); color: white; padding: 1rem; border-radius: 0.5rem; max-width: 500px;">';
    
    // Add introduction text if exists
    if (text) {
      content += `<p style="margin: 0 0 1rem 0;">${text}</p>`;
    }
    
    // Add photos if exists
    if (photos && photos.length > 0) {
      content += '<div style="margin: 1rem 0;">';
      photos.forEach(photo => {
        content += `<img src="${photo}" style="max-width: 100%; margin-bottom: 0.5rem; border-radius: 0.25rem;" />`;
      });
      content += '</div>';
    }
    
    // Add videos if exists
    if (videos && videos.length > 0) {
      content += '<div style="margin: 1rem 0;">';
      videos.forEach(video => {
        content += `
          <video 
            src="${video}" 
            style="max-width: 100%; margin-bottom: 0.5rem; border-radius: 0.25rem;" 
            controls
            autoplay="false"
          ></video>`;
      });
      content += '</div>';
    }
    
    content += '</div>';
    return content;
  };

  const initViewer = (panoId) => {
    console.log('Initializing viewer with panorama:', panoId);
    
    // Create viewer only if it doesn't exist
    if (!viewer) {
      const newViewer = new PANOLENS.Viewer({ 
        container: containerRef.current,
        controlBar: true,
        autoRotate: false,
        output: 'console',
        initialLookAt: new THREE.Vector3(0, 0, 5000)
      });
      setViewer(newViewer);
    }

    let newPanorama;
    if (panoramas[panoId]) {
      newPanorama = panoramas[panoId];
    } else {
      const panoData = panoList[panoId];
      newPanorama = new PANOLENS.ImagePanorama(panoData.imageUrl);
      
      // Create default hotspot
      const defaultHotspotId = `hotspot_001`;
      const defaultPosition = { x: 2000, y: 0, z: -2000 };
      
      const defaultInfospot = new PANOLENS.Infospot(400, PANOLENS.DataImage.Info);
      defaultInfospot.position.set(
        defaultPosition.x,
        defaultPosition.y,
        defaultPosition.z
      );
      defaultInfospot.addHoverText("Đi tới phòng khách");
      defaultInfospot.visible = true;
      
      newPanorama.add(defaultInfospot);
      
      // Add hotspot data with proper format
      const defaultHotspotData = {
        id: defaultHotspotId,
        panoId: panoId,
        targetPanoId: null,
        position: defaultPosition,
        text: "Đi tới phòng khách"
      };

      setHotspots(prev => ({
        ...prev,
        [defaultHotspotId]: defaultHotspotData
      }));

      // Update panorama's hotspots array
      setPanoList(prev => ({
        ...prev,
        [panoId]: {
          ...prev[panoId],
          hotspots: [...prev[panoId].hotspots, defaultHotspotId]
        }
      }));

      setPanoramas(prev => ({
        ...prev,
        [panoId]: newPanorama
      }));
    }

    // Remove current panorama if it exists
    if (currentPanorama && viewer) {
      viewer.remove(currentPanorama);
    }

    // Add new panorama to viewer
    if (viewer) {
      viewer.add(newPanorama);
      setCurrentPanorama(newPanorama);
      setCurrentPanoId(panoId);
    }
  };

  const addHotspot = (position, panoId) => {
    const targetPanorama = panoramas[panoId];
    if (!targetPanorama) return;

    // Create hotspot ID with proper format
    const hotspotId = `hotspot_${String(Date.now()).slice(-3)}`;
    
    // Create hotspot data matching the specified format
    const hotspotData = {
      id: hotspotId,
      panoId: panoId,
      targetPanoId: targetPanoId || null,
      position: {
        x: Math.round(position.x),
        y: Math.round(position.y),
        z: Math.round(position.z)
      },
      text: hotspotText || "Đi tới phòng khách"
    };

    // Create PANOLENS Infospot
    const newHotspot = new PANOLENS.Infospot(
      400,
      PANOLENS.DataImage.Info
    );
    
    // Set position
    newHotspot.position.set(
      hotspotData.position.x,
      hotspotData.position.y,
      hotspotData.position.z
    );
    
    // Add hover text
    newHotspot.addHoverText(hotspotData.text);
    
    // Add click event for scene navigation
    if (hotspotData.targetPanoId) {
      newHotspot.addEventListener('click', () => {
        switchPanorama(hotspotData.targetPanoId);
      });
    }
    
    targetPanorama.add(newHotspot);

    // Update states
    setHotspots(prev => ({
      ...prev,
      [hotspotId]: hotspotData
    }));

    setPanoList(prev => ({
      ...prev,
      [panoId]: {
        ...prev[panoId],
        hotspots: [...prev[panoId].hotspots, hotspotId]
      }
    }));

    // Reset form
    setHotspotText("");
    setTargetPanoId("");
    setManualPosition({ x: 0, y: 0, z: 0 });
    setShowHotspotSettings(false);

    // Log the created hotspot data
    console.log('Created Hotspot:', JSON.stringify(hotspotData, null, 2));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const panoId = `pano_${String(Date.now()).slice(-3)}`;
      
      const newPanoData = {
        id: panoId,
        tourId: tour.id,
        imageUrl: imageUrl,
        hotspots: []
      };

      setTour(prev => ({
        ...prev,
        panoramas: [...prev.panoramas, panoId]
      }));

      setPanoList(prev => ({
        ...prev,
        [panoId]: newPanoData
      }));

      const newPanorama = new PANOLENS.ImagePanorama(imageUrl);

      if (!viewer) {
        const newViewer = new PANOLENS.Viewer({ 
          container: containerRef.current,
          controlBar: true,
          autoRotate: false,
          output: 'console'
        });
        setViewer(newViewer);
        newViewer.add(newPanorama);
        setCurrentPanorama(newPanorama);
        setCurrentPanoId(panoId);
      } else {
        if (currentPanorama) {
          viewer.remove(currentPanorama);
        }
        viewer.add(newPanorama);
        viewer.setPanorama(newPanorama);
        setCurrentPanorama(newPanorama);
        setCurrentPanoId(panoId);
      }

      setPanoramas(prev => ({
        ...prev,
        [panoId]: newPanorama
      }));

      console.log('Created Panorama:', JSON.stringify(newPanoData, null, 2));
    }
  };

  const handleImageClick = (imageUrl) => {
    initViewer(imageUrl);
  };

  const getCurrentPanoramaHotspots = () => {
    if (!currentPanorama) return [];
    const currentImageUrl = tour.panoramas.find(img => panoramas[img] === currentPanorama);
    return Object.values(hotspots).filter(spot => spot.panoId === currentImageUrl);
  };

  const deleteHotspot = (hotspotId) => {
    // Remove hotspot from the hotspots state
    setHotspots(prev => {
      const newHotspots = { ...prev };
      delete newHotspots[hotspotId];
      return newHotspots;
    });
    
    // Remove hotspot from the panorama's hotspots array
    if (currentPanoId) {
      setPanoList(prev => ({
        ...prev,
        [currentPanoId]: {
          ...prev[currentPanoId],
          hotspots: prev[currentPanoId].hotspots.filter(id => id !== hotspotId)
        }
      }));
    }
  };

  const switchPanorama = (panoId) => {
    if (panoramas[panoId] && viewer) {
      const targetPanorama = panoramas[panoId];
      if (!viewer.panorama || viewer.panorama !== targetPanorama) {
        if (currentPanorama) {
          viewer.remove(currentPanorama);
        }
        viewer.add(targetPanorama);
      }
      viewer.setPanorama(targetPanorama);
      setCurrentPanorama(targetPanorama);
      setCurrentPanoId(panoId);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 p-4 bg-gray-100 overflow-auto">
        <h2 className="text-xl font-bold mb-4">Virtual Tour Editor</h2>
        
        {/* Tour Info */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h3 className="font-bold mb-2">Tour Information</h3>
          <input
            type="text"
            value={tour.name}
            onChange={(e) => setTour(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 border rounded mb-2"
            placeholder="Tour Name"
          />
          <p className="text-sm text-gray-600">Created: {new Date(tour.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <h3 className="font-bold mb-2">Upload Panorama</h3>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="mb-4 w-full" 
          />
        </div>

        {/* Show Hotspot Settings only when showHotspotSettings is true */}
        {showHotspotSettings && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">Hotspot Settings</h3>
              <button
                onClick={() => {
                  setShowHotspotSettings(false);
                  setHotspotText("");
                  setTargetPanoId("");
                  setManualPosition({ x: 0, y: 0, z: 0 });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Manual Position Input */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Position</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm mb-1">X</label>
                    <input
                      type="number"
                      value={manualPosition.x}
                      onChange={(e) => setManualPosition(prev => ({ ...prev, x: Number(e.target.value) }))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Y</label>
                    <input
                      type="number"
                      value={manualPosition.y}
                      onChange={(e) => setManualPosition(prev => ({ ...prev, y: Number(e.target.value) }))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Z</label>
                    <input
                      type="number"
                      value={manualPosition.z}
                      onChange={(e) => setManualPosition(prev => ({ ...prev, z: Number(e.target.value) }))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Text Input */}
              <div>
                <label className="block text-sm mb-1">Text</label>
                <textarea 
                  placeholder="Enter text" 
                  value={hotspotText} 
                  onChange={(e) => setHotspotText(e.target.value)} 
                  className="w-full p-2 border rounded" 
                  rows="3"
                />
              </div>

              {/* Scene Link (if multiple panoramas exist) */}
              {tour.panoramas.length > 1 && (
                <div>
                  <label className="block text-sm mb-1">Link to Scene</label>
                  <select
                    value={targetPanoId}
                    onChange={(e) => setTargetPanoId(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">No link</option>
                    {tour.panoramas
                      .filter(id => id !== currentPanoId)
                      .map(panoId => {
                        const sceneNumber = tour.panoramas.indexOf(panoId) + 1;
                        return (
                          <option key={panoId} value={panoId}>
                            Scene {sceneNumber}
                          </option>
                        );
                      })}
                  </select>
                </div>
              )}

              {/* Add Hotspot Button */}
              <button 
                onClick={() => {
                  const position = new THREE.Vector3(
                    Number(manualPosition.x),
                    Number(manualPosition.y),
                    Number(manualPosition.z)
                  );
                  addHotspot(position, currentPanoId);
                }}
                className="w-full p-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
              >
                Add Hotspot
              </button>
            </div>
          </div>
        )}

        {/* Panorama List */}
        {tour.panoramas.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-2">Panorama Scenes</h3>
            <div className="space-y-2">
              {tour.panoramas.map((panoId, index) => (
                <div 
                  key={panoId}
                  className={`cursor-pointer p-2 rounded-lg ${
                    currentPanoId === panoId 
                      ? 'bg-blue-100 border-2 border-blue-500' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => switchPanorama(panoId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img 
                        src={panoList[panoId].imageUrl} 
                        alt={`Scene ${index + 1}`} 
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium">Scene {index + 1}</h4>
                        <p className="text-sm text-gray-600">
                          {panoList[panoId].hotspots.length} hotspots
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHotspotSettings(true);
                        setCurrentPanoId(panoId);
                      }}
                      className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
                      title="Add Hotspot"
                    >
                      <IoCreate />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hotspots List */}
        {currentPanoId && panoList[currentPanoId]?.hotspots.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-2">Scene Hotspots</h3>
            <div className="space-y-2">
              {panoList[currentPanoId].hotspots.map((hotspotId) => {
                const spot = hotspots[hotspotId];
                return (
                  <div key={hotspotId} className="bg-white p-3 rounded-lg shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">Hotspot {spot.id}</span>
                        <p className="text-sm text-gray-600">
                          <span className="block">Text: {spot.text}</span>
                          <span className="block">
                            Position: ({spot.position.x}, {spot.position.y}, {spot.position.z})
                          </span>
                          {spot.targetPanoId && (
                            <span className="block">Links to Scene {
                              tour.panoramas.indexOf(spot.targetPanoId) + 1
                            }</span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteHotspot(hotspotId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* 360 Viewer */}
      <div ref={containerRef} className="w-3/4 h-full bg-black relative">
        {currentPanoId && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded">
            Scene {tour.panoramas.indexOf(currentPanoId) + 1}
          </div>
        )}
      </div>
    </div>
  );
}