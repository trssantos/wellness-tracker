import React from 'react';
import ModalContainer from './ModalContainer';

const ConfirmationModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Confirm Action", 
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-red-600 hover:bg-red-700" 
}) => {
  if (!isOpen) return null;
  
  return (
    <ModalContainer title={title} onClose={onCancel} maxWidth="sm" preventOutsideClose>
      <div className="py-2">
        <p className="text-white dark:text-white mb-6">{message}</p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </ModalContainer>
  );
};

export default ConfirmationModal;