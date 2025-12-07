import React from 'react';
import { motion } from 'framer-motion';
import { Photo } from '../types';

interface PhotoCardProps {
  photo: Photo;
  isHovered: boolean;
  onClick: () => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, isHovered, onClick }) => {
  return (
    <motion.div
      layoutId={`card-container-${photo.id}`}
      className={`relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-lg group transition-all duration-300 ${
        isHovered ? 'ring-4 ring-codemao-yellow scale-[1.02] shadow-xl z-10' : 'border border-gray-100'
      }`}
      onClick={onClick}
      data-photo-id={photo.id}
    >
      {/* Image Container */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-gray-100">
        <motion.img
            layoutId={`photo-image-${photo.id}`}
            src={photo.url}
            alt={photo.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Playful Overlay on Hover */}
        {isHovered && (
            <div className="absolute inset-0 bg-codemao-orange/20 flex items-center justify-center">
                <span className="bg-white text-codemao-orange font-bold px-4 py-2 rounded-full shadow-md transform -rotate-3">
                    点击打开
                </span>
            </div>
        )}
      </div>
      
      <div className="p-4 bg-white">
        <motion.h3 
          className={`text-lg font-bold mb-1 truncate transition-colors ${isHovered ? 'text-codemao-orange' : 'text-gray-800'}`}
        >
          {photo.title}
        </motion.h3>
        
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
           {photo.description || "暂无描述"}
        </p>

        {/* Decorative dots */}
        <div className="absolute top-3 right-3 flex gap-1">
            <div className="w-2 h-2 rounded-full bg-codemao-yellow"></div>
            <div className="w-2 h-2 rounded-full bg-codemao-orange"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default PhotoCard;