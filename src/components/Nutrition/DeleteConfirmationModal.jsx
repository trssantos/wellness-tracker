import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const DeleteConfirmationModal = ({ entry, onConfirm, onCancel }) => {
  return (
    <div className="modal-content max-w-md w-full" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3 className="modal-title">Confirm Deletion</h3>
        <button onClick={onCancel} className="modal-close-button">
          <X size={20} />
        </button>
      </div>
      
      <div className="p-4 flex flex-col items-center">
        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-4">
          <AlertTriangle size={28} className="text-red-600 dark:text-red-400" />
        </div>
        
        <h4 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2 text-center">
          Delete this food entry?
        </h4>
        
        <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
          Are you sure you want to delete "{entry?.name}"? This action cannot be undone.
        </p>
        
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;