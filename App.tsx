import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertCircle, Loader2 } from 'lucide-react';
import { useHandTracking } from './hooks/useHandTracking';
import GestureCursor from './components/GestureCursor';
import PhotoCard from './components/PhotoCard';
import DetailModal from './components/DetailModal';
import { GRID_PHOTOS } from './constants';
import { Photo } from './types';

const App: React.FC = () => {
  const { videoRef, isModelLoading, error, cursorState } = useHandTracking();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [hoveredPhotoId, setHoveredPhotoId] = useState<string | null>(null);

  // Gesture Interaction Logic
  useEffect(() => {
    if (!cursorState.isActive) {
      setHoveredPhotoId(null);
      return;
    }

    // 1. Hover Detection
    // Use document.elementFromPoint to see what's under the cursor
    // We only care about elements with 'data-photo-id' attribute
    const elements = document.elementsFromPoint(cursorState.x, cursorState.y);
    const photoElement = elements.find(el => el.hasAttribute('data-photo-id'));
    
    if (photoElement) {
      const id = photoElement.getAttribute('data-photo-id');
      setHoveredPhotoId(id);

      // 2. Click/Open Detection
      if (cursorState.isPinching && !selectedPhoto) {
        const photo = GRID_PHOTOS.find(p => p.id === id);
        if (photo) {
          setSelectedPhoto(photo);
        }
      }
    } else {
      setHoveredPhotoId(null);
    }
    
    // 3. Close Modal Detection (Pinch anywhere if modal is open)
    // Add a small delay/debounce logic here if needed, but for now simple pinch outside content works
    if (selectedPhoto && cursorState.isPinching) {
      // Optional: Logic to close modal with gesture, maybe gesture in specific area?
      // For now, let's keep modal closing manual or strictly on X button to avoid accidental closures,
      // OR if the user pinches outside the modal card.
      const modalContent = elements.find(el => el.classList.contains('bg-gray-900')); // Rough check for modal
      if (!modalContent && elements.some(el => el.classList.contains('fixed'))) {
         // Pinching the backdrop
         setSelectedPhoto(null);
      }
    }

  }, [cursorState, selectedPhoto]);


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
        className="fixed top-4 right-4 w-32 h-24 object-cover opacity-30 rounded-lg border border-gray-700 z-50 -scale-x-100"
        autoPlay
        playsInline
        muted
      />

      {/* Hand Tracking Cursor */}
      <GestureCursor cursorState={cursorState} />

      {/* Header */}
      <header className="relative z-10 p-8 flex justify-between items-center border-b border-gray-800/50 backdrop-blur-sm sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
            <Camera size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              GESTURE<span className="text-cyan-400">FLOW</span>
            </h1>
            <p className="text-xs text-gray-500 font-mono">HAND TRACKING ACTIVE</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <StatusIndicator label="CAMERA" active={!error && !isModelLoading} />
          <StatusIndicator label="HAND" active={cursorState.isActive} />
          <StatusIndicator label="PINCH" active={cursorState.isPinching} color="pink" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-0 container mx-auto px-4 py-8">
        
        {/* Loading State */}
        {isModelLoading && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-cyan-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-mono animate-pulse">正在初始化神经视觉核心...</p>
            <p className="text-sm text-gray-500 mt-2">请允许摄像头权限</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-red-400">
            <AlertCircle className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-bold">系统错误</h3>
            <p className="mt-2">{error}</p>
          </div>
        )}

        {/* Instructions (Only show if loaded and no hand detected) */}
        {!isModelLoading && !error && !cursorState.isActive && (
           <div className="flex justify-center mb-8">
             <div className="bg-gray-900/80 border border-cyan-500/30 rounded-full px-6 py-2 flex items-center space-x-2 animate-bounce">
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
                <span className="text-sm text-cyan-300">请举起你的手对准摄像头</span>
             </div>
           </div>
        )}

        {/* Photo Grid */}
        {!isModelLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {GRID_PHOTOS.map((photo) => (
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

      {/* Detail Modal */}
      <DetailModal
        selectedPhoto={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
      
    </div>
  );
};

// Helper Component for Header Status
const StatusIndicator: React.FC<{ label: string; active: boolean; color?: 'cyan' | 'pink' }> = ({ label, active, color = 'cyan' }) => (
  <div className="flex items-center gap-2 font-mono text-xs">
    <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${active ? (color === 'cyan' ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]') : 'bg-gray-700'}`} />
    <span className={`${active ? 'text-gray-200' : 'text-gray-600'}`}>{label}</span>
  </div>
);

export default App;