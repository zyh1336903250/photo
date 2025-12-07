import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Image as ImageIcon } from 'lucide-react';

interface UploadModalProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string, description: string) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ file, isOpen, onClose, onConfirm }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Reset form when opening
  useEffect(() => {
    if (isOpen && file) {
      setTitle(file.name.split('.')[0]);
      setDescription('');
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Cleanup object URL
      return () => URL.revokeObjectURL(url);
    }
  }, [isOpen, file]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(title, description);
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-codemao-yellow/30 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden z-10 border-4 border-white"
      >
        {/* Header */}
        <div className="bg-codemao-orange p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ImageIcon className="text-white" size={24} />
            <h2 className="text-white font-bold text-lg">上传新照片</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Image Preview */}
          <div className="w-full h-40 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-contain" 
              />
            )}
          </div>

          {/* Inputs */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block">照片标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-gray-800 focus:border-codemao-orange focus:outline-none transition-all font-bold placeholder-gray-300"
              placeholder="给照片起个好听的名字"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block">照片故事</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-gray-800 focus:border-codemao-orange focus:outline-none transition-all text-sm h-24 resize-none placeholder-gray-300"
              placeholder="这张照片背后有什么有趣的故事吗？"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors font-bold"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-codemao-orange hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-200 transition-all font-bold flex items-center justify-center gap-2 transform active:scale-95"
            >
              <Save size={18} />
              保存到相册
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UploadModal;