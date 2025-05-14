import React, { useRef, useState, useEffect } from "react";
import * as PANOLENS from "panolens";
import * as THREE from "three";
import { IoList } from "react-icons/io5";
import { Link } from "react-router-dom";
import TourInfo from './TourInfo';
import PanoramaList from './PanoramaList';
import InfospotForm from './InfospotForm';
import LinkspotForm from './LinkspotForm';
import SpotsList from './SpotsList';
import EditSpotModal from './EditSpotModal';
import InfoModal from './InfoModal';
import Logo1 from "../assets/logo1.png";

const API_BASE_URL = 'http://localhost:8000/api';

export default function TourForm({ data, onSubmit, isLoading, isTour }) {
  const containerRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [currentPanorama, setCurrentPanorama] = useState(null);
  const [currentPanoId, setCurrentPanoId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State for tour data
  const [tour, setTour] = useState({
    tourId: data?.tourId || '',
    name: data?.name || '',
    description: data?.description || '',
    panoramas: []
  });

  // State for panoramas and spots
  const [panoList, setPanoList] = useState([]);
  const [infospots, setInfospots] = useState([]);
  const [linkspots, setLinkspots] = useState([]);
  
  // State for infospot form
  const [infospotInfo, setInfospotInfo] = useState({
    text: "",
    imageUrl: "",
    videoUrl: "",
    position: { x: 0, y: 0, z: -5000 },
    size: 300
  });

  // State for linkspot form
  const [linkspotInfo, setLinkspotInfo] = useState({
    panoId: "",
    targetPanoId: "",
    position: { x: 0, y: 0, z: -5000 },
    size: 300
  });

  // State for UI controls
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
  const [showSidebar, setShowSidebar] = useState(!isTour);

  // Add search state
  const [searchQuery, setSearchQuery] = useState('');

  // Add search filter function
  const filteredPanoramas = tour.panoramas.filter(panoId => {
    const pano = panoList.find(p => p.id === panoId);
    const sceneName = pano?.name || `Scene ${tour.panoramas.indexOf(panoId) + 1}`;
    return sceneName.toLowerCase().includes(searchQuery.toLowerCase());
  });

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

      // Set panorama list with names
      const formattedPanoList = data.panoramas.map((pano, index) => ({
        id: pano.panoId,
        imageUrl: pano.imageUrl,
        name: pano.name || `Scene ${index + 1}`,
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

  // Initialize viewer when panoList changes
  useEffect(() => {
    if (data && data.panoramas.length > 0 && panoList.length > 0) {
      const firstPanoId = data.panoramas[0].panoId;
      console.log('Initializing viewer with first panorama:', firstPanoId);
      console.log('Available panoramas:', panoList);
      initViewer(firstPanoId);
    }
  }, [panoList]);

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

  // Helper function to get infospot content
  const getInfospotContent = (text, images, videos) => {
    return {
      text: text,
      images: images,
      videos: videos
    };
  };

  // Initialize viewer with a panorama
  const initViewer = (panoId) => {
    console.log('Initializing viewer with panorama:', panoId);
    
    if (!panoId) {
      console.error('No panorama ID provided');
      return;
    }

    const panoData = panoList.find(pano => pano.id === panoId);
    if (!panoData) {
      console.log('Panorama list:', panoList);
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
      //infospot.addHoverText(spot.text);
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
      
      // Get target scene name
      const targetPano = panoList.find(p => p.id === spot.targetPanoId);
      const targetName = targetPano?.name || `Scene ${tour.panoramas.indexOf(spot.targetPanoId) + 1}`;
      linkspot.addHoverText(targetName);

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

  // Switch to a different panorama
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
      //infospot.addHoverText(spot.text);
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
      
      // Get target scene name
      const targetPano = panoList.find(p => p.id === spot.targetPanoId);
      const targetName = targetPano?.name || `Scene ${tour.panoramas.indexOf(spot.targetPanoId) + 1}`;
      linkspot.addHoverText(targetName);

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

  // Handle panorama image upload
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
          const errorText = await response.text();
          throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Failed to upload panorama');
        }

        const panoId = `pano_${panoIdCounter}`;
        const newPanoData = {
          id: panoId,
          imageUrl: result.file.url,
          name: `Scene ${panoIdCounter}`,
          hotspots: []
        };

        setTour((prev) => ({
          ...prev,
          panoramas: [...prev.panoramas, panoId]
        }));

        setPanoList((prev) => [...prev, newPanoData]);
        setPanoIdCounter((prev) => prev + 1);

        // Initialize viewer with the new panorama
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

  // Handle tour save
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
          imageUrl: pano.imageUrl,
          name: pano.name || `Scene ${tour.panoramas.indexOf(pano.id) + 1}`
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

  // Handle hotspot deletion
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

  // Handle panorama deletion
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
  };

  // Handle spot updates
  const updateSpot = (spotId, updatedData) => {
    // Tìm spot trong cả infospots và linkspots
    const infospot = infospots.find(spot => spot.id === spotId);
    const linkspot = linkspots.find(spot => spot.id === spotId);
    
    if (infospot) {
      // Cập nhật infospot
      setInfospots(prev => prev.map(spot => {
        if (spot.id === spotId) {
          return { ...spot, ...updatedData };
        }
        return spot;
      }));

      // Cập nhật PANOLENS Infospot
      if (currentPanorama && currentPanoId === infospot.panoId) {
        // Tìm và xóa infospot cũ
        currentPanorama.children.forEach(child => {
          if (child instanceof PANOLENS.Infospot) {
            currentPanorama.remove(child);
          }
        });

        // Tạo infospot mới với thông tin đã cập nhật
        const newInfospot = new PANOLENS.Infospot(
          updatedData.size || infospot.size,
          PANOLENS.DataImage.Info
        );
        
        // Cập nhật vị trí
        newInfospot.position.set(
          updatedData.position?.x || infospot.position.x,
          updatedData.position?.y || infospot.position.y,
          updatedData.position?.z || infospot.position.z
        );

        // Cập nhật hover text
        newInfospot.addHoverText(updatedData.text || infospot.text);

        // Thêm sự kiện click để hiển thị modal
        newInfospot.addEventListener("click", () => {
          const content = getInfospotContent(
            updatedData.text || infospot.text,
            infospot.img ? [infospot.img] : [],
            infospot.video ? [infospot.video] : []
          );
          setModalContent(content);
          setShowInfoModal(true);
        });

        // Thêm infospot mới vào panorama
        currentPanorama.add(newInfospot);
      }
    } else if (linkspot) {
      // Cập nhật linkspot
      setLinkspots(prev => prev.map(spot => {
        if (spot.id === spotId) {
          return { ...spot, ...updatedData };
        }
        return spot;
      }));

      // Cập nhật PANOLENS Linkspot
      if (currentPanorama && currentPanoId === linkspot.panoId) {
        // Tìm và xóa linkspot cũ
        currentPanorama.children.forEach(child => {
          if (child instanceof PANOLENS.Infospot) {
            currentPanorama.remove(child);
          }
        });

        // Tạo linkspot mới với thông tin đã cập nhật
        const newLinkspot = new PANOLENS.Infospot(
          updatedData.size || linkspot.size,
          PANOLENS.DataImage.Arrow
        );

        // Cập nhật vị trí
        newLinkspot.position.set(
          updatedData.position?.x || linkspot.position.x,
          updatedData.position?.y || linkspot.position.y,
          updatedData.position?.z || linkspot.position.z
        );

        // Cập nhật hover text
        //newLinkspot.addHoverText(updatedData.text || linkspot.text);

        // Thêm hover effect
        newLinkspot.addEventListener('hover', () => {
          newLinkspot.scale.set(1.2, 1.2, 1);
        });

        newLinkspot.addEventListener('hoverout', () => {
          newLinkspot.scale.set(1, 1, 1);
        });

        // Thêm sự kiện click để chuyển panorama
        newLinkspot.addEventListener('click', () => {
          if (viewer) {
            const currentLookAt = viewer.getCamera().getWorldDirection(new THREE.Vector3());
            switchPanorama(linkspot.targetPanoId);
            setTimeout(() => {
              viewer.tweenControlCenter(currentLookAt, 0);
            }, 100);
          } else {
            console.error('Viewer not initialized');
            switchPanorama(linkspot.targetPanoId);
          }
        });

        // Thêm linkspot mới vào panorama
        currentPanorama.add(newLinkspot);
      }
    }
  };

  // Add updatePanoName function
  const updatePanoName = (panoId, newName) => {
    setPanoList(prev => prev.map(pano => {
      if (pano.id === panoId) {
        return { ...pano, name: newName };
      }
      return pano;
    }));
  };

  return (
    <div className="flex h-screen relative">
      {/* Sidebar Toggle Button - Only show when isTour is true */}
      {isTour && (
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className={`fixed top-4 left-4 z-50 p-2 bg-black bg-opacity-50 text-white rounded-full transition-transform duration-300 ${
            showSidebar ? 'translate-x-[calc(25vw+2rem)]' : ''
          }`}
        >
          <IoList size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div className={`${
        isTour 
          ? 'absolute left-0 top-0 h-full transition-all duration-300 z-40' 
          : 'w-1/3'
      } ${
        showSidebar ? 'w-1/3' : 'w-0'
      } bg-gray-100 overflow-auto`}>
        <div className={`${!showSidebar ? 'hidden' : 'm-6'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold"><Link to="/">
              <img className='h-5 mx-2 my-3' src={Logo1} alt="" />
            </Link></h2>
            {!isTour && (
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2 rounded ${
                  isEditMode 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
              </button>
            )}
          </div>
          
          {/* Tour Info */}
          <TourInfo 
            tour={tour}
            setTour={setTour}
            isEditMode={isEditMode}
            isTour={isTour}
            handleSave={handleSave}
            isLoading={isLoading}
          />

          {/* Image Upload - Only show in edit mode */}
          {isEditMode && (
            <div className="mb-6">
              <h3 className="font-bold mb-2">Upload Panorama</h3>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="mb-4 w-full" 
              />
            </div>
          )}

          {/* Scene Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search scenes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Panorama List */}
          {tour.panoramas.length > 0 && (
            <PanoramaList 
              tour={tour}
              panoList={panoList}
              currentPanoId={currentPanoId}
              infospots={infospots}
              linkspots={linkspots}
              isEditMode={isEditMode}
              switchPanorama={switchPanorama}
              deletePanorama={deletePanorama}
              setShowSpotsList={setShowSpotsList}
              setShowInfospotForm={setShowInfospotForm}
              setShowLinkspotForm={setShowLinkspotForm}
              setCurrentPanoId={setCurrentPanoId}
              updatePanoName={updatePanoName}
              filteredPanoramas={filteredPanoramas}
            />
          )}

          {/* Rest of the modals and forms - Only show in edit mode */}
          {isEditMode && (
            <>
              {/* Infospot Form */}
              {showInfospotForm && (
                <InfospotForm 
                  showInfospotForm={showInfospotForm}
                  setShowInfospotForm={setShowInfospotForm}
                  infospotInfo={infospotInfo}
                  setInfospotInfo={setInfospotInfo}
                  infospotSize={infospotSize}
                  setInfospotSize={setInfospotSize}
                  uploadedImage={uploadedImage}
                  setUploadedImage={setUploadedImage}
                  uploadedVideo={uploadedVideo}
                  setUploadedVideo={setUploadedVideo}
                  currentPanoId={currentPanoId}
                  currentPanorama={currentPanorama}
                  setInfospots={setInfospots}
                  setPanoList={setPanoList}
                  getInfospotContent={getInfospotContent}
                  setModalContent={setModalContent}
                  setShowInfoModal={setShowInfoModal}
                />
              )}

              {/* Linkspot Form */}
              {showLinkspotForm && (
                <LinkspotForm 
                  showLinkspotForm={showLinkspotForm}
                  setShowLinkspotForm={setShowLinkspotForm}
                  linkspotInfo={linkspotInfo}
                  setLinkspotInfo={setLinkspotInfo}
                  tour={tour}
                  currentPanoId={currentPanoId}
                  currentPanorama={currentPanorama}
                  viewer={viewer}
                  setLinkspots={setLinkspots}
                  setPanoList={setPanoList}
                  switchPanorama={switchPanorama}
                />
              )}

              {/* Spots List Modal */}
              {showSpotsList && currentPanoId && (
                <SpotsList 
                  showSpotsList={showSpotsList}
                  setShowSpotsList={setShowSpotsList}
                  tour={tour}
                  currentPanoId={currentPanoId}
                  infospots={infospots}
                  linkspots={linkspots}
                  deleteHotspot={deleteHotspot}
                  setSelectedSpot={setSelectedSpot}
                  setShowEditSpot={setShowEditSpot}
                />
              )}

              {/* Edit Spot Modal */}
              {showEditSpot && selectedSpot && (
                <EditSpotModal 
                  showEditSpot={showEditSpot}
                  setShowEditSpot={setShowEditSpot}
                  selectedSpot={selectedSpot}
                  setSelectedSpot={setSelectedSpot}
                  updateSpot={updateSpot}
                />
              )}
            </>
          )}
        </div>
      </div>
      
      {/* 360 Viewer */}
      <div ref={containerRef} className={`$ w-full h-full bg-black relative left transition-all duration-300`}>
        {currentPanoId && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded">
            {panoList.find(p => p.id === currentPanoId)?.name || `Scene ${tour.panoramas.indexOf(currentPanoId) + 1}`}
          </div>
        )}

        {/* Info Modal */}
        {showInfoModal && modalContent && (
          <InfoModal 
            showInfoModal={showInfoModal}
            setShowInfoModal={setShowInfoModal}
            modalContent={modalContent}
          />
        )}
      </div>
    </div>
  );
} 