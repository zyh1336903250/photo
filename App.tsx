import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertCircle, Loader2, Upload, Plus } from 'lucide-react';
import { useHandTracking } from './hooks/useHandTracking';
import GestureCursor from './components/GestureCursor';
import PhotoCard from './components/PhotoCard';
import DetailModal from './components/DetailModal';
import UploadModal from './components/UploadModal';
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
  const { videoRef, isModelLoading, error, cursorState } = useHandTracking();
  
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
    const savedData = localStorage.getItem('gesture_gallery_photos');
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

  // Persistence: Save to LocalStorage whenever photos change
  useEffect(() => {
    // Only save if it's different from default to avoid overwriting default logic
    if (photos !== GRID_PHOTOS) {
      try {
        localStorage.setItem('gesture_gallery_photos', JSON.stringify(photos));
      } catch (e) {
        console.warn("Storage limit reached or error saving:", e);
      }
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
    
    // 3. Close Modal Detection (Pinch anywhere if modal is open)
    if ((selectedPhoto || showUploadModal) && cursorState.isPinching) {
      // Logic to prevent closing immediately if just opened can be added here
      // For now, let's keep it simple: if pinching outside content, close
      const isOverContent = elements.some(el => el.classList.contains('bg-gray-900') || el.tagName === 'IMG');
      if (!isOverContent) {
         setSelectedPhoto(null);
         // Don't close upload modal by pinch to avoid data loss accidents
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
      // Reset input value so same file can be selected again if needed
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
        description: description || "用户上传数据 // USER_UPLOAD_STREAM",
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

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden selection:bg-cyan-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
      </div>

      {/* Hidden Video for MediaPipe */}
      <video
        ref={videoRef}
        className="fixed top-4 right-4 w-32 h-24 object-cover opacity-30 rounded-lg border border-gray-700 z-50 -scale-x-100 pointer-events-none"
        autoPlay
        playsInline
        muted
      />

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
      <header className="relative z-10 p-8 flex justify-between items-center border-b border-gray-800/50 backdrop-blur-sm sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            <Camera size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              手势流 <span className="text-cyan-400">GestureFlow</span>
            </h1>
            <p className="text-xs text-gray-500 font-mono">神经链接已激活 // NEURAL LINK ACTIVE</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 mr-4">
            <StatusIndicator label="视觉传感器" active={!error && !isModelLoading} />
            <StatusIndicator label="手势同步" active={cursorState.isActive} />
            <StatusIndicator label="指令激活" active={cursorState.isPinching} color="pink" />
          </div>

          <button 
            onClick={handleUploadClick}
            className="group relative px-4 py-2 overflow-hidden rounded-md bg-cyan-950 border border-cyan-800 transition-all hover:bg-cyan-900 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-95"
          >
             <div className="absolute inset-0 w-0 bg-cyan-500/20 transition-all duration-[250ms] ease-out group-hover:w-full"></div>
             <div className="relative flex items-center space-x-2">
                <Upload size={16} className="text-cyan-400" />
                <span className="font-mono text-xs font-bold tracking-wider text-cyan-100">数据录入</span>
             </div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-0 container mx-auto px-4 py-8">
        
        {/* Loading State */}
        {isModelLoading && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-cyan-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-mono animate-pulse">正在初始化视觉皮层...</p>
            <p className="text-sm text-gray-500 mt-2">请求光学信号输入</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-red-400">
            <AlertCircle className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-bold">系统故障</h3>
            <p className="mt-2 font-mono">{error}</p>
          </div>
        )}

        {/* Instructions (Only show if loaded and no hand detected) */}
        {!isModelLoading && !error && !cursorState.isActive && (
           <div className="flex justify-center mb-8 pointer-events-none">
             <div className="bg-gray-900/80 border border-cyan-500/30 rounded-full px-6 py-2 flex items-center space-x-2 animate-bounce backdrop-blur-md">
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
                <span className="text-sm text-cyan-300 font-mono tracking-wide">举起手以建立连接</span>
             </div>
           </div>
        )}

        {/* Photo Grid */}
        {!isModelLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                isHovered={hoveredPhotoId === photo.id}
                onClick={() => setSelectedPhoto(photo)}
              />
            ))}
            
            {/* Empty State / Upload Prompt if no photos */}
            {photos.length === 0 && (
               <div className="col-span-full flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/30 text-gray-500">
                  <p className="font-mono mb-4">未检测到数据流</p>
                  <button onClick={handleUploadClick} className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                    <Plus size={20} />
                    <span>手动添加数据</span>
                  </button>
               </div>
            )}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <DetailModal
        selectedPhoto={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />

      {/* Upload Modal */}
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

// Helper Component for Header Status
const StatusIndicator: React.FC<{ label: string; active: boolean; color?: 'cyan' | 'pink' }> = ({ label, active, color = 'cyan' }) => (
  <div className="flex items-center gap-2 font-mono text-xs">
    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${active ? (color === 'cyan' ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] scale-110' : 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)] scale-110') : 'bg-gray-800'}`} />
    <span className={`${active ? 'text-cyan-100' : 'text-gray-700'}`}>{label}</span>
  </div>
);

export default App;