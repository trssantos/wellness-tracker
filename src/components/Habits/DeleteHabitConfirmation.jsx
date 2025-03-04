import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { deleteHabit } from '../../utils/habitTrackerUtils';

const DeleteHabitConfirmation = ({ habit, onConfirm, onCancel }) => {
  const handleDelete = () => {
    deleteHabit(habit.id);
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-start mb-4">
          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 dark:text-red-400 mr-3">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">Delete Habit</h3>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Are you sure you want to delete "{habit.name}"? This action cannot be undone, and all tracking data will be lost.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
          >
            Delete Habit
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteHabitConfirmation;