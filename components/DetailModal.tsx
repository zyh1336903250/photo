import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Photo } from '../types';
import { X, Share2, Heart, Info, Trash2, AlertTriangle } from 'lucide-react';

interface DetailModalProps {
  selectedPhoto: Photo | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ selectedPhoto, onClose, onDelete }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Reset state when photo changes or closes
  React.useEffect(() => {
    if (!selectedPhoto) setIsConfirmingDelete(false);
  }, [selectedPhoto]);

  return (
    <AnimatePresence>
      {selectedPhoto && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-10">
          <motion.div
            className="absolute inset-0 bg-codemao-yellow/20 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            layoutId={`card-container-${selectedPhoto.id}`}
            className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl z-50 flex flex-col md:flex-row max-h-[90vh] border-4 border-white"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Image Section */}
            <div className="md:w-2/3 h-64 md:h-auto relative bg-gray-50 flex items-center justify-center p-2">
              <motion.img
                layoutId={`photo-image-${selectedPhoto.id}`}
                src={selectedPhoto.url}
                className="w-full h-full object-contain max-h-[60vh] md:max-h-full rounded-xl"
                alt={selectedPhoto.title}
              />
              
              <button 
                onClick={onClose}
                className="absolute top-4 left-4 p-2 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full shadow-md transition-all z-10"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Section */}
            <div className="md:w-1/3 p-8 flex flex-col bg-white overflow-y-auto relative">
              
              <AnimatePresence mode='wait'>
                {isConfirmingDelete ? (
                   // DELETE CONFIRMATION VIEW
                   <motion.div 
                     key="delete-confirm"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="flex flex-col h-full justify-center items-center text-center space-y-6"
                   >
                     <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-2">
                        <AlertTriangle size={32} />
                     </div>
                     <h3 className="text-xl font-extrabold text-gray-800">确认删除吗？</h3>
                     <p className="text-gray-500 text-sm px-4">删除后这张照片将无法找回哦。<br/>你确定要丢弃它吗？</p>
                     
                     <div className="w-full space-y-3 pt-4">
                        <button 
                          onClick={() => onDelete && onDelete(selectedPhoto.id)}
                          className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95"
                        >
                          是的，彻底删除
                        </button>
                        <button 
                          onClick={() => setIsConfirmingDelete(false)}
                          className="w-full py-3 border-2 border-gray-200 hover:border-gray-400 text-gray-600 font-bold rounded-xl transition-all"
                        >
                          我再想想
                        </button>
                     </div>
                   </motion.div>
                ) : (
                  // NORMAL VIEW
                  <motion.div 
                    key="details"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col h-full"
                  >
                    <div className="mb-6">
                      <h2 className="text-2xl font-extrabold text-codemao-dark mb-2 break-words">
                        {selectedPhoto.title}
                      </h2>
                      <div className="flex items-center space-x-2 text-xs text-gray-400 mb-6 font-bold">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-codemao-orange">画廊作品</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full">高清</span>
                      </div>
                      
                      <p className="text-gray-600 leading-relaxed mb-6 break-words">
                        {selectedPhoto.description || "这张照片还没有描述哦~ 就像一个未解的谜题！"}
                      </p>
                      
                      <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center text-gray-500 text-sm">
                          <Heart size={18} className="mr-3 text-red-400 fill-current" />
                          <span>喜爱程度: {Math.floor(Math.random() * 200) + 99}</span>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Info size={18} className="mr-3 text-codemao-yellow" />
                          <span>图像来源: {selectedPhoto.id.startsWith('user') ? '本地上传' : '系统预设'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 flex space-x-3">
                      <button className="flex-1 py-3 px-4 bg-codemao-orange hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-200 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                        <Share2 size={18} />
                        <span>分享</span>
                      </button>
                      
                      {onDelete && (
                         <button 
                            onClick={() => setIsConfirmingDelete(true)}
                            className="w-12 flex items-center justify-center py-3 bg-white border-2 border-red-100 text-red-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-xl transition-all"
                            title="删除照片"
                          >
                            <Trash2 size={20} />
                         </button>
                      )}

                      <button 
                        onClick={onClose}
                        className="flex-1 py-3 px-4 border-2 border-gray-200 hover:border-codemao-dark text-gray-500 hover:text-codemao-dark font-bold rounded-xl transition-all"
                      >
                        关闭
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DetailModal;