import React from 'react';
import { Trash2, X, AlertCircle } from 'lucide-react';

const ClearChatDialog = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/30 border-b border-red-100 dark:border-red-900/50 flex items-center">
          <AlertCircle className="text-red-500 dark:text-red-400 mr-2" size={20} />
          <h3 className="font-medium text-red-700 dark:text-red-300">Clear Chat History</h3>
        </div>
        
        <div className="p-4">
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Are you sure you want to clear your entire conversation history with Solaris? This action cannot be undone.
          </p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Clear History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClearChatDialog;