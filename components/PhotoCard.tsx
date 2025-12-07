import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Photo } from '../types';

interface PhotoCardProps {
  photo: Photo;
  isHovered: boolean;
  onClick: () => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, isHovered, onClick }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [decodeText, setDecodeText] = useState("");
  
  // Random chars for decoding effect
  const chars = "010101XYZA&%#@§£€$";
  
  useEffect(() => {
    // Staggered reveal based on ID
    const delay = Math.random() * 1500 + 500;
    
    // Start decoding loop
    let interval: number;
    const startTime = Date.now();
    
    interval = window.setInterval(() => {
        // Generate random string block
        let str = "";
        for(let i=0; i<80; i++) {
            str += chars[Math.floor(Math.random() * chars.length)];
            if (i % 20 === 0) str += " ";
        }
        setDecodeText(str);

        if (Date.now() - startTime > delay) {
            setIsRevealed(true);
            clearInterval(interval);
        }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      layoutId={`card-container-${photo.id}`}
      className={`relative rounded bg-black/50 border overflow-hidden cursor-pointer group backdrop-blur-sm ${
        isHovered ? 'border-cyan-400 ring-1 ring-cyan-400/50' : 'border-gray-800'
      }`}
      animate={isHovered ? { scale: 1.02, y: -5 } : { scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      data-photo-id={photo.id}
    >
      {/* Image Container */}
      <div className="relative w-full h-64 overflow-hidden">
        <AnimatePresence>
            {!isRevealed && (
                <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black z-20 flex flex-col items-start justify-center p-4"
                >
                    <p className="text-green-500 font-mono text-xs break-all leading-tight opacity-70">
                        {decodeText}
                    </p>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500/50 animate-pulse" />
                </motion.div>
            )}
        </AnimatePresence>
        
        <motion.img
            layoutId={`photo-image-${photo.id}`}
            src={photo.url}
            alt={photo.title}
            className="w-full h-full object-cover"
            initial={{ filter: "grayscale(100%) blur(4px)", scale: 1.1 }}
            animate={{ 
                filter: isRevealed 
                    ? (isHovered ? "grayscale(0%) blur(0px)" : "grayscale(50%) blur(0px)") 
                    : "grayscale(100%) blur(4px)",
                scale: isHovered ? 1.05 : 1
            }}
            transition={{ duration: 0.5 }}
        />
        
        {/* Scanline Effect when revealed */}
        {isRevealed && (
             <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
        )}
        
        {/* Glitch Overlay on Hover */}
        {isHovered && isRevealed && (
            <div className="absolute inset-0 z-10 opacity-30 pointer-events-none mix-blend-overlay bg-gradient-to-t from-cyan-900/50 to-transparent animate-pulse" />
        )}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
      
      <div className="absolute bottom-0 left-0 p-4 w-full z-20">
        <div className="flex items-center justify-between mb-1">
            <motion.div 
                className="h-[1px] bg-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: isHovered ? "100%" : "20%" }}
            />
        </div>
        <motion.h3 
          className="text-lg font-bold font-orbitron tracking-wider text-white mb-1 truncate"
          animate={{ x: isHovered ? 5 : 0, color: isHovered ? "#22d3ee" : "#ffffff" }}
        >
          {photo.title}
        </motion.h3>
        
        <motion.div 
          initial={{ opacity: 0.5 }}
          animate={{ opacity: isHovered ? 1 : 0.5 }}
          className="flex justify-between items-end"
        >
            <p className="text-[10px] text-gray-400 font-mono tracking-tighter">
                IMG_DATA_BLOCK_{photo.id.split('-')[1]}
            </p>
            {isHovered && <span className="text-[10px] text-cyan-400 font-mono animate-pulse">Ready</span>}
        </motion.div>
      </div>

      {/* Tech Corners */}
      <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500/50 transition-all duration-300 ${isHovered ? 'w-full h-full border-cyan-500' : ''}`} />
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500/50 transition-all duration-300 ${isHovered ? 'w-full h-full border-cyan-500' : ''}`} />
    </motion.div>
  );
};

export default PhotoCard;