import React from 'react';
import { motion } from 'framer-motion';
import { CursorState } from '../types';

interface GestureCursorProps {
  cursorState: CursorState;
}

const GestureCursor: React.FC<GestureCursorProps> = ({ cursorState }) => {
  if (!cursorState.isActive) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999] flex items-center justify-center"
      animate={{
        x: cursorState.x - 24, // Center slightly larger cursor
        y: cursorState.y - 24,
        scale: cursorState.isPinching ? 0.9 : 1,
      }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 400,
        mass: 0.2 // Low mass for responsiveness
      }}
      style={{
        width: 48,
        height: 48,
      }}
    >
      {/* Outer Ring - Progress Indicator */}
      {/* We use SVG stroke-dasharray to animate the circle filling up based on pinch distance */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke={cursorState.isPinching ? "#ec4899" : "#22d3ee"}
          strokeWidth="2"
          strokeOpacity="0.3"
        />
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke={cursorState.isPinching ? "#ec4899" : "#22d3ee"}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: cursorState.pinchProgress }}
          transition={{ duration: 0.1 }} // Immediate feedback
          style={{
            filter: `drop-shadow(0 0 ${cursorState.isPinching ? '10px' : '5px'} ${cursorState.isPinching ? '#ec4899' : '#22d3ee'})`
          }}
        />
      </svg>
      
      {/* Center Reticle */}
      <div 
        className={`w-1 h-1 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
          cursorState.isPinching ? 'bg-pink-500 w-3 h-3' : 'bg-white'
        }`} 
      />
      
      {/* Crosshair decoration */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-2 bg-current opacity-50 ${cursorState.isPinching ? 'text-pink-500' : 'text-cyan-400'}`}></div>
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-2 bg-current opacity-50 ${cursorState.isPinching ? 'text-pink-500' : 'text-cyan-400'}`}></div>
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-[1px] w-2 bg-current opacity-50 ${cursorState.isPinching ? 'text-pink-500' : 'text-cyan-400'}`}></div>
      <div className={`absolute right-0 top-1/2 -translate-y-1/2 h-[1px] w-2 bg-current opacity-50 ${cursorState.isPinching ? 'text-pink-500' : 'text-cyan-400'}`}></div>

      {/* Label */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-[10px] font-orbitron font-bold tracking-widest whitespace-nowrap">
        <span className={cursorState.isPinching ? 'text-pink-400' : 'text-cyan-400/70'}>
          {cursorState.isPinching ? '>> EXECUTE <<' : `${Math.round(cursorState.pinchProgress * 100)}%`}
        </span>
      </div>
    </motion.div>
  );
};

export default GestureCursor;