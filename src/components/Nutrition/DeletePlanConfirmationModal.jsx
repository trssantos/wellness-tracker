import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const DeletePlanConfirmationModal = ({ planName, onClose, onConfirm }) => {
  return (
    <div className="modal-content max-w-md w-full" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3 className="modal-title text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle size={20} />
          Delete Meal Plan
        </h3>
        <button 
          onClick={onClose} 
          className="modal-close-button"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="p-4">
        <p className="mb-6 text-center text-slate-700 dark:text-slate-300">
          Are you sure you want to delete <span className="font-medium">{planName || 'this meal plan'}</span>? This action cannot be undone.
        </p>
        
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePlanConfirmationModal;