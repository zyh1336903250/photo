import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Photo } from '../types';
import { X, Share2, Heart, Info } from 'lucide-react';

interface DetailModalProps {
  selectedPhoto: Photo | null;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ selectedPhoto, onClose }) => {
  return (
    <AnimatePresence>
      {selectedPhoto && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-10">
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            layoutId={`card-container-${selectedPhoto.id}`}
            className="relative w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl z-50 flex flex-col md:flex-row max-h-[90vh]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Image Section */}
            <div className="md:w-2/3 h-64 md:h-auto relative bg-black">
              <motion.img
                layoutId={`photo-image-${selectedPhoto.id}`}
                src={selectedPhoto.url}
                className="w-full h-full object-contain"
                alt={selectedPhoto.title}
              />
              
              <button 
                onClick={onClose}
                className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-red-500/50 rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Section */}
            <div className="md:w-1/3 p-8 flex flex-col border-l border-gray-800 bg-gray-900/95">
              <div className="mb-6">
                 <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                  {selectedPhoto.title}
                </h2>
                <div className="flex items-center space-x-2 text-xs text-gray-400 font-mono mb-6">
                  <span className="px-2 py-1 bg-gray-800 rounded">ID: {selectedPhoto.id.toUpperCase()}</span>
                  <span className="px-2 py-1 bg-gray-800 rounded">RAW</span>
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-6">
                  这是一张展示了未来美学的杰作。在这张照片中，光影的交错与构图的平衡达到了完美的和谐。通过手势控制，你已成功解锁了这张照片的详细信息。
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center text-gray-400 text-sm">
                    <Info size={16} className="mr-3 text-cyan-400" />
                    <span>分辨率: 4K Ultra HD</span>
                  </div>
                   <div className="flex items-center text-gray-400 text-sm">
                    <Heart size={16} className="mr-3 text-pink-500" />
                    <span>喜欢: 1,204</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-800 flex space-x-4">
                <button className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <Share2 size={18} />
                  <span>分享</span>
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-lg transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DetailModal;