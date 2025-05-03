import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const ModalContainer = ({ 
  title, 
  children, 
  onClose, 
  maxWidth = 'md',
  preventOutsideClose = false,
  id = 'modal-container'
}) => {
  const dialogRef = useRef(null);

  // Open modal when component mounts
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !preventOutsideClose) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, preventOutsideClose]);

  const handleClose = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    onClose();
  };

  return (
    <dialog 
      ref={dialogRef}
      id={id}
      className="modal-base"
      onClick={(e) => {
        if (!preventOutsideClose && e.target.tagName === 'DIALOG') {
          handleClose();
        }
      }}
    >
      <div 
        className={`modal-content max-w-${maxWidth}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            onClick={handleClose}
            className="modal-close-button"
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </dialog>
  );
};

export default ModalContainer;