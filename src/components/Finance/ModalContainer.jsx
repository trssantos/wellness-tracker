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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white dark:bg-slate-800 rounded-xl w-full max-w-${maxWidth} shadow-xl overflow-auto max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 sm:p-5 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalContainer;