import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Upload, Plus, Sparkles, Cat } from 'lucide-react';
import { useHandTracking } from './hooks/useHandTracking';
import GestureCursor from './components/GestureCursor';
import PhotoCard from './components/PhotoCard';
import DetailModal from './components/DetailModal';
import UploadModal from './components/UploadModal';
import HandSkeleton from './components/HandSkeleton';
import { GRID_PHOTOS } from './constants';
import { Photo } from './types';

// Helper to convert file to Base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const App: React.FC = () => {
  const { videoRef, isModelLoading, error, cursorState, landmarks } = useHandTracking();
  
  // State
  const [photos, setPhotos] = useState<Photo[]>(GRID_PHOTOS);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [hoveredPhotoId, setHoveredPhotoId] = useState<string | null>(null);
  
  // Upload State
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence: Load from LocalStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('gesture_gallery_photos_v2'); // New key for new version
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPhotos(parsed);
        }
      } catch (e) {
        console.error("Failed to load saved photos:", e);
      }
    }
  }, []);

  // Persistence: Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('gesture_gallery_photos_v2', JSON.stringify(photos));
    } catch (e) {
      console.warn("Storage limit reached or error saving:", e);
    }
  }, [photos]);

  // Gesture Interaction Logic
  useEffect(() => {
    if (!cursorState.isActive) {
      setHoveredPhotoId(null);
      return;
    }

    // 1. Hover Detection
    const elements = document.elementsFromPoint(cursorState.x, cursorState.y);
    const photoElement = elements.find(el => el.hasAttribute('data-photo-id'));
    
    if (photoElement) {
      const id = photoElement.getAttribute('data-photo-id');
      setHoveredPhotoId(id);

      // 2. Click/Open Detection
      if (cursorState.isPinching && !selectedPhoto && !showUploadModal) {
        const photo = photos.find(p => p.id === id);
        if (photo) {
          setSelectedPhoto(photo);
        }
      }
    } else {
      setHoveredPhotoId(null);
    }
    
    // 3. Close Modal Detection (Simple pinch outside content to close)
    if ((selectedPhoto || showUploadModal) && cursorState.isPinching) {
       // Advanced check: don't close if pinching on a button
       const isOverInteractive = elements.some(el => 
         el.tagName === 'BUTTON' || 
         el.getAttribute('role') === 'button'
       );

       if (!isOverInteractive) {
           const isOverContent = elements.some(el => el.classList.contains('bg-white'));
           if (!isOverContent) {
             setSelectedPhoto(null);
             // Don't close upload modal by pinch safety
           }
       }
    }

  }, [cursorState, selectedPhoto, photos, showUploadModal]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setPendingFile(files[0]);
      setShowUploadModal(true);
      event.target.value = '';
    }
  };

  const handleUploadConfirm = async (title: string, description: string) => {
    if (!pendingFile) return;

    try {
      const base64Url = await convertFileToBase64(pendingFile);
      
      const newPhoto: Photo = {
        id: `user-${Date.now()}`,
        url: base64Url,
        title: title || pendingFile.name.split('.')[0],
        description: description || "来自我的精彩瞬间",
        width: 800,
        height: 600,
      };

      setPhotos(prev => [newPhoto, ...prev]);
      setShowUploadModal(false);
      setPendingFile(null);
    } catch (err) {
      console.error("Failed to process file", err);
      alert("图片处理失败，请重试");
    }
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    setSelectedPhoto(null);
  };

  return (
    <div className="min-h-screen bg-codemao-bg text-gray-800 relative overflow-hidden selection:bg-codemao-yellow/50">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-codemao-yellow/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-codemao-orange/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />
      </div>

      {/* 
         CRITICAL FIX: 
         Do NOT use 'hidden'. Browsers stop rendering videos that are display:none.
         Use opacity-0 + pointer-events-none + absolute positioning instead.
         This ensures the video frame buffer updates for MediaPipe to read.
      */}
      <video 
        ref={videoRef} 
        className="absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none -z-10" 
        autoPlay 
        playsInline 
        muted 
      />

      {/* Virtual Hand Skeleton Display (replaces video feed) */}
      <div className="fixed top-6 right-6 w-40 h-32 bg-white rounded-2xl border-4 border-codemao-yellow shadow-lg z-50 overflow-hidden flex items-center justify-center">
        {isModelLoading ? (
            <div className="text-codemao-orange animate-pulse">
                <Loader2 size={24} className="animate-spin" />
            </div>
        ) : !cursorState.isActive ? (
             <div className="text-center p-2">
                <p className="text-xs text-gray-400 font-bold mb-1">未检测到手势</p>
                <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto animate-bounce"></div>
             </div>
        ) : (
             <HandSkeleton landmarks={landmarks} />
        )}
        <div className="absolute bottom-1 left-0 w-full text-center">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-white/80 px-2 rounded-full">Vision Sensor</span>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* Hand Tracking Cursor */}
      <GestureCursor cursorState={cursorState} />

      {/* Header */}
      <header className="relative z-10 p-6 md:p-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-codemao-orange rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 transform -rotate-3 hover:rotate-0 transition-transform">
            <Cat size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-codemao-dark tracking-tight">
              神奇照片墙
            </h1>
            <p className="text-sm font-bold text-gray-400 flex items-center gap-1">
              <Sparkles size={12} className="text-codemao-yellow" />
              挥挥手，探索你的世界
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 mr-44 md:mr-48"> 
           {/* Added margin right to avoid overlapping with skeleton camera */}
          <button 
            onClick={handleUploadClick}
            className="group relative px-5 py-2.5 rounded-full bg-white border-2 border-codemao-orange text-codemao-orange font-bold shadow-md hover:bg-codemao-orange hover:text-white transition-all active:scale-95 flex items-center gap-2"
          >
            <Upload size={18} />
            <span className="hidden md:inline">上传照片</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-0 container mx-auto px-4 py-4 max-w-7xl">
        
        {/* Loading State */}
        {isModelLoading && (
          <div className="flex flex-col items-center justify-center h-[50vh] text-codemao-orange">
            <p className="text-lg font-bold animate-pulse">正在唤醒魔法...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center h-[50vh] text-red-500">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                 <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold">哎呀，出错了</h3>
            <p className="mt-2 font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isModelLoading && !error && photos.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[50vh] border-4 border-dashed border-gray-200 rounded-3xl m-4 bg-white/50">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Cat size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">照片墙是空的</h3>
                <p className="text-gray-400 mb-6">快去上传第一张照片吧！</p>
                <button 
                    onClick={handleUploadClick} 
                    className="flex items-center gap-2 bg-codemao-yellow hover:bg-yellow-400 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-yellow-200"
                >
                    <Plus size={20} />
                    <span>立即添加</span>
                </button>
            </div>
        )}

        {/* Photo Grid */}
        {!isModelLoading && !error && photos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                isHovered={hoveredPhotoId === photo.id}
                onClick={() => setSelectedPhoto(photo)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <DetailModal
        selectedPhoto={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onDelete={handleDeletePhoto}
      />

      <UploadModal 
        file={pendingFile}
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setPendingFile(null);
        }}
        onConfirm={handleUploadConfirm}
      />
      
    </div>
  );
};

export default App;