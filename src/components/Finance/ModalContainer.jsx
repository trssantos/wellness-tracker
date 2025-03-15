import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const ModalContainer = ({ 
  title, 
  children, 
  onClose, 
  maxWidth = 'md',
  preventOutsideClose = false
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle outside click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !preventOutsideClose) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-slate-800 dark:bg-slate-800 rounded-xl w-full max-w-${maxWidth} shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-700">
          <h3 className="text-xl font-semibold text-white dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 dark:text-slate-400"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalContainer;