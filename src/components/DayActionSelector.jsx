import React from 'react';
import { SmilePlus, CheckSquare, X } from 'lucide-react';

export const DayActionSelector = ({ date, onClose, onSelectAction }) => {
  // Safe conversion of date
  const getFormattedDate = () => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
    return dateObj.toLocaleDateString('default', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAction = (action) => {
    onClose();
    onSelectAction(action);
  };

  const handleClickOutside = (e) => {
    if (e.target.id === 'day-action-modal') {
      onClose();
    }
  };

  return (
    <dialog 
      id="day-action-modal" 
      className="rounded-xl p-0 bg-transparent backdrop:bg-black backdrop:bg-opacity-50"
      onClick={handleClickOutside}
    >
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-slate-800">
            {getFormattedDate()}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAction('mood')}
            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            <SmilePlus size={32} className="text-purple-500" />
            <span className="font-medium text-slate-700">Track Mood</span>
          </button>

          <button
            onClick={() => handleAction('progress')}
            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <CheckSquare size={32} className="text-blue-500" />
            <span className="font-medium text-slate-700">Track Progress</span>
          </button>
        </div>
      </div>
    </dialog>
  );
};