import React, { useRef, useState, useEffect } from "react";
import * as PANOLENS from "panolens";
import * as THREE from "three";
import { IoCreate, IoImage, IoVideocam, IoClose, IoList, IoInformation, IoSettings } from "react-icons/io5";
import LoadMore from "../assets/load_more.png";

const API_BASE_URL = 'http://localhost:3001';

export default function TourForm({ data, onSubmit, isLoading, isTour }) {
  const containerRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [currentPanorama, setCurrentPanorama] = useState(null);
  const [currentPanoId, setCurrentPanoId] = useState(null);
  
  // Updated state management to match the data structure
  const [tour, setTour] = useState({
    tourId: data?.tourId || '',
    name: data?.name || '',
    description: data?.description || '',
    panoramas: []
  });

  const [panoList, setPanoList] = useState([]); // Store panorama data as array
  const [infospots, setInfospots] = useState([]); // Store infospot data as array
  const [linkspots, setLinkspots] = useState([]); // Store linkspot data as array
  
  // Thêm state cho Infospot
  const [infospotInfo, setInfospotInfo] = useState({
    text: "",
    imageUrl: "",
    videoUrl: "",
    position: { x: 0, y: 0, z: -5000 },
    size: 300
  });

  // Thêm state cho Linkspot
  const [linkspotInfo, setLinkspotInfo] = useState({
    panoId: "",
    targetPanoId: "",
    position: { x: 0, y: 0, z: -5000 },
    size: 300
  });

  const [showInfospotForm, setShowInfospotForm] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [showSpotsList, setShowSpotsList] = useState(false);
  const [showEditSpot, setShowEditSpot] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [infospotSize, setInfospotSize] = useState(250);
  const [showLinkspotForm, setShowLinkspotForm] = useState(false);
  const [panoIdCounter, setPanoIdCounter] = useState(1);

  // Load initial data when component mounts
  useEffect(() => {
    if (data) {
      console.log('Received tour data:', data);
      
      // Set tour basic info
      setTour({
        tourId: data.tourId || '',
        name: data.name || '',
        description: data.description || '',
        panoramas: data.panoramas.map(p => p.panoId) || []
      });

      // Set panorama list
      const formattedPanoList = data.panoramas.map(pano => ({
        id: pano.panoId,
        imageUrl: pano.imageUrl,
        hotspots: []
      }));
      setPanoList(formattedPanoList);

      // Format infospots
      const formattedInfospots = data.infospots?.map(spot => ({
        id: spot.infospotId,
        panoId: spot.panoId,
        position: spot.position,
        text: spot.text,
        size: spot.size,
        img: spot.img,
        video: spot.video,
        type: 'info'
      })) || [];
      setInfospots(formattedInfospots);

      // Format linkspots
      const formattedLinkspots = data.linkspots?.map(spot => ({
        id: spot.linkspotId,
        panoId: spot.panoId,
        targetPanoId: spot.targetPanoId,
        position: spot.position,
        text: spot.text,
        size: spot.size,
        type: 'link'
      })) || [];
      setLinkspots(formattedLinkspots);

      

      console.log('Formatted data:', {
        panoramas: formattedPanoList,
        infospots: formattedInfospots,
        linkspots: formattedLinkspots
      });
      
      // Initialize viewer with first panorama after state updates
      setTimeout(async () => {
        if (data.panoramas.length > 0) {
          const firstPanoId = data.panoramas[0].panoId;
          await initViewer(firstPanoId);
        }
      }, 100);

      // Set pano counter
      const maxPanoNumber = Math.max(...data.panoramas.map(p => {
        const num = parseInt(p.panoId.replace('pano_', ''));
        return isNaN(num) ? 0 : num;
      }), 0);
      setPanoIdCounter(maxPanoNumber + 1);
    } else {
      // Reset all states if no data is provided
      setTour({
        tourId: '',
        name: '',
        description: '',
        panoramas: []
      });
      setPanoList([]);
      setInfospots([]);
      setLinkspots([]);
      setCurrentPanoId(null);
      setPanoIdCounter(1);
    }
  }, [data]);

  // Cleanup viewer when component unmounts
  useEffect(() => {
    return () => {
    if (viewer) {
        Object.values(panoList).forEach(pano => {
          if (pano) {
            viewer.remove(pano);
            panorama.dispose();
          }
        });
      viewer.dispose();
    }
    };
  }, []);

  const getInfospotContent = (text, images, videos) => {
    return {
      text: text,
      images: images,
      videos: videos
    };
  };

  const initViewer = (panoId) => {
    console.log('Initializing viewer with panorama:', panoId);
    
    if (!panoId) {
      console.error('No panorama ID provided');
      return;
    }

    const panoData = panoList.find(pano => pano.id === panoId);
    if (!panoData) {
      console.error('Panorama data not found for ID:', panoId);
      return;
    }

    // Create new viewer if not exists
    if (!viewer) {
      const newViewer = new PANOLENS.Viewer({ 
        container: containerRef.current,
        controlBar: true,
        autoRotate: false,
        output: 'console'
      });
      setViewer(newViewer);
    }

    // Create new panorama
    const newPanorama = new PANOLENS.ImagePanorama(panoData.imageUrl);
    
    // Add infospots
    const panoInfospots = infospots.filter(spot => spot.panoId === panoId);
    panoInfospots.forEach(spot => {
      const infospot = new PANOLENS.Infospot(spot.size, PANOLENS.DataImage.Info);
      infospot.position.set(spot.position.x, spot.position.y, spot.position.z);
      infospot.addHoverText(spot.text);
      infospot.addEventListener("click", () => {
        const content = getInfospotContent(
          spot.text,
          spot.img ? [spot.img] : [],
          spot.video ? [spot.video] : []
        );
        setModalContent(content);
        setShowInfoModal(true);
      });
      newPanorama.add(infospot);
    });

    // Add linkspots
    const panoLinkspots = linkspots.filter(spot => spot.panoId === panoId);
    panoLinkspots.forEach(spot => {
      const linkspot = new PANOLENS.Infospot(spot.size, PANOLENS.DataImage.Arrow);
      linkspot.position.set(spot.position.x, spot.position.y, spot.position.z);
      linkspot.addHoverText(spot.text);

      linkspot.addEventListener('hover', () => {
        linkspot.scale.set(1.2, 1.2, 1);
      });

      linkspot.addEventListener('hoverout', () => {
        linkspot.scale.set(1, 1, 1);
      });

      linkspot.addEventListener('click', () => {
        if (viewer) {
          const currentLookAt = viewer.getCamera().getWorldDirection(new THREE.Vector3());
          switchPanorama(spot.targetPanoId);
          setTimeout(() => {
            viewer.tweenControlCenter(currentLookAt, 0);
          }, 100);
    } else {
          console.error('Viewer not initialized');
          switchPanorama(spot.targetPanoId);
        }
      });

      newPanorama.add(linkspot);
    });

    // Remove current panorama if exists
    if (currentPanorama && viewer) {
      viewer.remove(currentPanorama);
    }

    // Add new panorama to viewer
    if (viewer) {
      viewer.add(newPanorama);
      viewer.setPanorama(newPanorama);
      setCurrentPanorama(newPanorama);
      setCurrentPanoId(panoId);
    }
  };

  const switchPanorama = (panoId) => {
    console.log('Switching to panorama:', panoId);
    if (!panoId) return;

    const panoData = panoList.find(pano => pano.id === panoId);
    if (!panoData) {
      console.error('Panorama data not found for ID:', panoId);
      return;
    }

    // Create new panorama
    const newPanorama = new PANOLENS.ImagePanorama(panoData.imageUrl);
    
    // Add infospots
    const panoInfospots = infospots.filter(spot => spot.panoId === panoId);
    panoInfospots.forEach(spot => {
      const infospot = new PANOLENS.Infospot(spot.size, PANOLENS.DataImage.Info);
      infospot.position.set(spot.position.x, spot.position.y, spot.position.z);
      infospot.addHoverText(spot.text);
      infospot.addEventListener("click", () => {
        const content = getInfospotContent(
          spot.text,
          spot.img ? [spot.img] : [],
          spot.video ? [spot.video] : []
        );
        setModalContent(content);
        setShowInfoModal(true);
      });
      newPanorama.add(infospot);
    });

    // Add linkspots
    const panoLinkspots = linkspots.filter(spot => spot.panoId === panoId);
    panoLinkspots.forEach(spot => {
      const linkspot = new PANOLENS.Infospot(spot.size, PANOLENS.DataImage.Arrow);
      linkspot.position.set(spot.position.x, spot.position.y, spot.position.z);
      linkspot.addHoverText(spot.text);

      linkspot.addEventListener('hover', () => {
        linkspot.scale.set(1.2, 1.2, 1);
      });

      linkspot.addEventListener('hoverout', () => {
        linkspot.scale.set(1, 1, 1);
      });

      linkspot.addEventListener('click', () => {
        if (viewer) {
          const currentLookAt = viewer.getCamera().getWorldDirection(new THREE.Vector3());
          switchPanorama(spot.targetPanoId);
          setTimeout(() => {
            viewer.tweenControlCenter(currentLookAt, 0);
          }, 100);
        } else {
          console.error('Viewer not initialized');
          switchPanorama(spot.targetPanoId);
        }
      });

      newPanorama.add(linkspot);
    });

    // Remove current panorama if exists
    if (currentPanorama && viewer) {
      viewer.remove(currentPanorama);
    }

    // Add new panorama to viewer
    if (viewer) {
      viewer.add(newPanorama);
      viewer.setPanorama(newPanorama);
      setCurrentPanorama(newPanorama);
      setCurrentPanoId(panoId);
    } else {
      // Create new viewer if not exists
      const newViewer = new PANOLENS.Viewer({ 
        container: containerRef.current,
        controlBar: true,
        autoRotate: false,
        output: 'console'
      });
      setViewer(newViewer);
      newViewer.add(newPanorama);
      newViewer.setPanorama(newPanorama);
      setCurrentPanorama(newPanorama);
      setCurrentPanoId(panoId);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('panorama', file);

        const response = await fetch(`${API_BASE_URL}/upload/panorama`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to upload panorama');
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Failed to upload panorama');
        }

        const panoId = `pano_${panoIdCounter}`;
        
        const newPanoData = {
          id: panoId,
          imageUrl: result.file.url,
          hotspots: []
        };

        setTour(prev => ({
          ...prev,
          panoramas: [...prev.panoramas, panoId]
        }));

        setPanoList(prev => [...prev, newPanoData]);
        setPanoIdCounter(prev => prev + 1);

        // Initialize viewer with new panorama
        const newPanorama = new PANOLENS.ImagePanorama(result.file.url);

        if (!viewer) {
          const newViewer = new PANOLENS.Viewer({ 
            container: containerRef.current,
            controlBar: true,
            autoRotate: false,
            output: 'console'
          });
          setViewer(newViewer);
          newViewer.add(newPanorama);
          newViewer.setPanorama(newPanorama);
        } else {
          if (currentPanorama) {
            viewer.remove(currentPanorama);
          }
          viewer.add(newPanorama);
          viewer.setPanorama(newPanorama);
        }
        
          setCurrentPanorama(newPanorama);
          setCurrentPanoId(panoId);

        console.log('Created Panorama:', JSON.stringify(newPanoData, null, 2));
      } catch (error) {
        console.error('Error uploading panorama:', error);
        alert('Failed to upload panorama: ' + error.message);
      }
    }
  };

  const handleSave = async () => {
    if (tour.panoramas.length === 0) {
      alert('Please add at least one panorama');
      return;
    }

    try {
      // Format data for submission
      const formattedData = {
        tourId: tour.tourId || undefined,
        name: tour.name.trim() || `Tour ${Date.now()}`,
        description: tour.description || '',
        panoramas: panoList.map(pano => ({
          panoId: pano.id,
          imageUrl: pano.imageUrl
        })),
        infospots: infospots.map(spot => ({
          infospotId: spot.id,
          panoId: spot.panoId,
          position: spot.position,
          text: spot.text,
          size: spot.size,
          img: spot.img || null,
          video: spot.video || null
        })),
        linkspots: linkspots.map(spot => ({
          linkspotId: spot.id,
          panoId: spot.panoId,
          targetPanoId: spot.targetPanoId,
          position: spot.position,
          text: spot.text,
          size: spot.size
        }))
      };

      console.log('Submitting tour data:', formattedData);
      await onSubmit(formattedData);

      // Only reset form if this is a create operation (no initial data)
      if (!data) {
        setTour({
          tourId: '',
          name: '',
          description: '',
          panoramas: []
        });
        setPanoList([]);
        setInfospots([]);
        setLinkspots([]);
        setCurrentPanorama(null);
        setCurrentPanoId(null);
        setPanoIdCounter(1);
      }
    } catch (error) {
      console.error('Error saving tour:', error);
      alert('Failed to save tour: ' + error.message);
    }
  };

  const deleteHotspot = (hotspotId) => {
    // Remove from infospots if it's an infospot
    setInfospots(prev => prev.filter(spot => spot.id !== hotspotId));
    
    // Remove from linkspots if it's a linkspot
    setLinkspots(prev => prev.filter(spot => spot.id !== hotspotId));
    
    if (currentPanoId) {
      setPanoList(prev => 
        prev.map(pano => {
          if (pano.id === currentPanoId) {
            return {
              ...pano,
              hotspots: pano.hotspots.filter(id => id !== hotspotId)
            };
          }
          return pano;
        })
      );
    }
  };

  const deletePanorama = (panoId) => {
    // Remove from tour.panoramas
    setTour(prev => ({
      ...prev,
      panoramas: prev.panoramas.filter(id => id !== panoId)
    }));

    // Remove from panoList
    setPanoList(prev => prev.filter(pano => pano.id !== panoId));

    // Remove associated infospots
    setInfospots(prev => prev.filter(spot => spot.panoId !== panoId));

    // Remove associated linkspots
    setLinkspots(prev => prev.filter(spot => spot.panoId !== panoId));

    // Remove from viewer if it's the current panorama
    if (currentPanoId === panoId && viewer) {
      viewer.remove(currentPanorama);
      setCurrentPanorama(null);
      setCurrentPanoId(null);
    }

    // Remove from panoramas state
    setPanoList(prev => prev.filter(pano => pano.id !== panoId));
  };

  const api = {
    // Tour API functions
    createTour: async (tourData) => {
      try {
        // Format panoramas data
        const panoramasData = tourData.panoramas.map((panoId, index) => {
          const pano = panoList.find(p => p.id === panoId);
          return {
            panoId: `pano_${index + 1}`,
            imageUrl: pano.imageUrl
          };
        });

        // Format infospots data
        const infospotsData = infospots
          .filter(spot => tourData.panoramas.includes(spot.panoId))
          .map((spot, index) => ({
            infospotId: `info_${index + 1}`,
            panoId: `pano_${tourData.panoramas.indexOf(spot.panoId) + 1}`,
            position: spot.position,
            text: spot.text,
            size: spot.size,
            img: spot.img || null,
            video: spot.video || null
          }));

        // Format linkspots data  
        const linkspotsData = linkspots
          .filter(spot => tourData.panoramas.includes(spot.panoId))
          .map((spot, index) => ({
            linkspotId: `link_${index + 1}`, 
            panoId: `pano_${tourData.panoramas.indexOf(spot.panoId) + 1}`,
            targetPanoId: `pano_${tourData.panoramas.indexOf(spot.targetPanoId) + 1}`,
            position: spot.position,
            text: spot.text,
            size: spot.size
          }));

        const formattedData = {
          name: tourData.name || `Tour ${Date.now()}`, // Default name if not provided
          description: tourData.description || '',
          panoramas: panoramasData,
          infospots: infospotsData,
          linkspots: linkspotsData
        };

        console.log('API URL:', `${API_BASE_URL}/tours`);
        console.log('Sending data to server:', JSON.stringify(formattedData, null, 2));

        const response = await fetch(`${API_BASE_URL}/tours`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          credentials: 'omit', 
          body: JSON.stringify(formattedData)
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Server error response:', errorData);
          throw new Error(errorData || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Tour created successfully:', result);
        return result;

      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        throw error;
      }
    },

    updateTour: async (tourId, tourData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: tourData.name,
            description: tourData.description,
            panoramas: tourData.panoramas
          })
        });
        return await response.json();
      } catch (error) {
        console.error('Error updating tour:', error);
        throw error;
      }
    },

    // ... rest of the API functions ...
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
          <textarea 
            value={tour.description}
            onChange={(e) => setTour(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border rounded mb-2"
            placeholder="Tour Description"
            rows="3"
          />
          {!isTour && (
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

        {/* Infospot Form */}
        {showInfospotForm && (
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

                  // Tạo PANOLENS Infospot
                  const newInfospot = new PANOLENS.Infospot(infospotSize, PANOLENS.DataImage.Info);
                  newInfospot.position.set(
                    infospotData.position.x,
                    infospotData.position.y,
                    infospotData.position.z
                  );

                  // Thêm hover text
                  newInfospot.addHoverText(infospotData.text);

                  // Xử lý click để hiển thị thông tin
                  newInfospot.addEventListener("click", () => {
                    const content = getInfospotContent(
                      infospotData.text,
                      infospotData.img ? [infospotData.img] : [],
                      infospotData.video ? [infospotData.video] : []
                    );
                    setModalContent(content);
                    setShowInfoModal(true);
                  });

                  // Thêm Infospot vào panorama
                  currentPanorama?.add(newInfospot);

                  // Thêm vào state infospots
                  setInfospots(prev => [...prev, infospotData]);

                  // Cập nhật hotspots trong panoList
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

                  // Reset form và uploaded files
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
        )}

        {/* Linkspot Form */}
        {showLinkspotForm && (
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

                  // Thêm vào state linkspots
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
        )}

        {/* Panorama List */}
        {tour.panoramas.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-2">Panorama Scenes</h3>
            <div className="space-y-2">
              {tour.panoramas.map((panoId, index) => (
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
                        src={panoList.find(pano => pano.id === panoId)?.imageUrl} 
                        alt={`Scene ${index + 1}`} 
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium">Scene {index + 1}</h4>
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
                  </div>

                  {/* Buttons Container */}
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spots List Modal */}
        {showSpotsList && currentPanoId && (
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
        )}

        {/* Edit Spot Modal */}
        {showEditSpot && selectedSpot && (
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
        )}
      </div>
      
      {/* 360 Viewer */}
      <div ref={containerRef} className="w-3/4 h-full bg-black relative">
        {currentPanoId && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded">
            Scene {tour.panoramas.indexOf(currentPanoId) + 1}
          </div>
        )}

        {/* Infospot Content Modal */}
        {showInfoModal && modalContent && (
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
                {/* Text Content */}
                {modalContent.text && (
                  <div className="prose max-w-none">
                    <p className="text-lg">{modalContent.text}</p>
                  </div>
                )}

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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}