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
        x: cursorState.x - 24,
        y: cursorState.y - 24,
        scale: cursorState.isPinching ? 0.8 : 1,
      }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 300,
        mass: 0.1
      }}
      style={{
        width: 48,
        height: 48,
      }}
    >
      {/* Friendly Bubbly Cursor */}
      <div className={`relative w-full h-full rounded-full border-4 shadow-lg transition-colors duration-200 ${
        cursorState.isPinching ? 'border-codemao-orange bg-codemao-orange/20' : 'border-codemao-yellow bg-white/20'
      }`}>
        
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 -m-1">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="transparent"
            strokeWidth="4"
          />
          <motion.circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke={cursorState.isPinching ? "#FF9F1C" : "#F9D423"}
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: cursorState.pinchProgress }}
            transition={{ duration: 0.1 }}
          />
        </svg>

        {/* Center Dot */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ${
            cursorState.isPinching ? 'w-4 h-4 bg-codemao-orange' : 'w-2 h-2 bg-codemao-yellow'
          }`} 
        />
      </div>

      {/* Label */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap bg-white px-2 py-1 rounded-full shadow-md text-codemao-orange">
        {cursorState.isPinching ? '抓取中!' : '移动手势'}
      </div>
    </motion.div>
  );
};

export default GestureCursor;