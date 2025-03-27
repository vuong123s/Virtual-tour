import { useEffect, useRef, useState } from 'react';
import * as PANOLENS from 'panolens';
import { Button } from 'react-bootstrap';

const VirtualTourBuilder = () => {
    const panoramaRef = useRef(null);
    const [viewer, setViewer] = useState(null);
    const [scenes, setScenes] = useState([]); // Danh sách các scene (ảnh panorama)
    const [currentScene, setCurrentScene] = useState(null); // Scene đang hiển thị

    // Khởi tạo Panorama Viewer
    useEffect(() => {
        const newViewer = new PANOLENS.Viewer({
            container: panoramaRef.current,
            autoRotate: false,
            controlBar: true,
        });
        setViewer(newViewer);

        return () => {
            newViewer.dispose();
        };
    }, []);

    // Xử lý upload nhiều ảnh panorama
    const handleImageUpload = (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            const newScenes = [];
            Array.from(files).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageUrl = e.target.result;
                    const newScene = {
                        index: scenes.length + index, // Tạo index duy nhất
                        title: file.name.replace(/\.[^/.]+$/, ""), // Bỏ đuôi file
                        urlPreview: imageUrl,
                        urlImage: imageUrl,
                    };
                    newScenes.push(newScene);

                    // Nếu đây là ảnh đầu tiên, hiển thị nó
                    if (index === 0 && !currentScene) {
                        setCurrentScene(newScene);
                        const panorama = new PANOLENS.ImagePanorama(imageUrl);
                        newViewer.add(panorama);
                        newViewer.setPanorama(panorama);
                    }
                };
                reader.readAsDataURL(file);
            });

            // Cập nhật danh sách scenes
            setScenes((prevScenes) => [...prevScenes, ...newScenes]);
        }
    };

    // Chuyển đổi panorama khi người dùng chọn ảnh khác
    const switchPanorama = (scene) => {
        setCurrentScene(scene);
        const panorama = new PANOLENS.ImagePanorama(scene.urlImage);
        viewer.add(panorama);
        viewer.setPanorama(panorama);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {/* Panorama Viewer */}
            <div ref={panoramaRef} className="w-full h-[80vh] bg-gray-200"></div>

            {/* Controls */}
            <div className="mt-4 space-x-4">
                {/* Nút upload ảnh */}
                <label className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer">
                    Upload Panoramas
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </label>
            </div>

            {/* Danh sách ảnh đã upload */}
            <div className="mt-4 flex flex-wrap gap-2">
                {scenes.map((scene) => (
                    <div
                        key={scene.index}
                        className={`cursor-pointer ${currentScene?.index === scene.index
                                ? 'border-4 border-blue-500'
                                : 'border-2 border-gray-300'
                            } rounded-lg overflow-hidden`}
                        onClick={() => switchPanorama(scene)}
                    >
                        <img
                            src={scene.urlPreview}
                            alt={scene.title}
                            className="w-24 h-16 object-cover"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VirtualTourBuilder;