import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-gray-900 w-full max-w-md border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/10 overflow-hidden z-10"
      >
        {/* Header */}
        <div className="bg-gray-800/50 p-4 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <h2 className="text-cyan-400 font-orbitron tracking-wider">数据录入终端</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image Preview */}
          <div className="w-full h-32 bg-black rounded border border-gray-700 flex items-center justify-center overflow-hidden relative group">
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-contain opacity-80" 
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-2 left-2 text-xs font-mono text-cyan-300">
              RAW_SIZE: {(file.size / 1024).toFixed(1)} KB
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-mono block">档案名称 // TITLE_ID</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-orbitron"
              placeholder="输入标题..."
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-mono block">数据描述 // DATA_DESC</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded p-2 text-gray-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all text-sm h-24 resize-none"
              placeholder="输入关于这张照片的描述信息..."
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-600 rounded text-gray-400 hover:bg-gray-800 hover:text-white transition-colors font-mono text-xs"
            >
              取消操作
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded shadow-[0_0_10px_rgba(8,145,178,0.4)] transition-all font-mono text-xs flex items-center justify-center gap-2"
            >
              <Save size={14} />
              确认上传
            </button>
          </div>
        </form>

        {/* Decorative corner lines */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500" />
      </motion.div>
    </div>
  );
};

export default UploadModal;