import React from 'react';
import { SmilePlus, CheckSquare, X, PenTool, Dumbbell, Moon } from 'lucide-react';

export const DayActionSelector = ({ date, onClose, onSelectAction }) => {
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

  // Define actions with their properties - added Sleep tracking
  const actions = [
    {
      id: 'mood',
      label: 'Track Mood',
      icon: <SmilePlus size={24} className="text-purple-500 dark:text-purple-400" />,
      bgColor: 'bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-800/40'
    },
    {
      id: 'sleep',
      label: 'Track Sleep',
      icon: <Moon size={24} className="text-indigo-500 dark:text-indigo-400" />,
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-800/40'
    },
    {
      id: 'progress',
      label: 'Track Progress',
      icon: <CheckSquare size={24} className="text-blue-500 dark:text-blue-400" />,
      bgColor: 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/40'
    },
    {
      id: 'notes',
      label: 'Add Day Notes',
      icon: <PenTool size={24} className="text-teal-500 dark:text-teal-400" />,
      bgColor: 'bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-800/40'
    },
    {
      id: 'workout',
      label: 'Log Workout',
      icon: <Dumbbell size={24} className="text-blue-500 dark:text-blue-400" />,
      bgColor: 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/40'
    }
  ];

  return (
    <dialog 
      id="day-action-modal" 
      className="modal-base"
      onClick={(e) => e.target.id === 'day-action-modal' && onClose()}
    >
      <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {getFormattedDate()}
          </h3>
          <button
            onClick={onClose}
            className="modal-close-button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onSelectAction(action.id)}
              className={`flex items-center gap-3 p-4 rounded-xl ${action.bgColor} transition-colors`}
            >
              {action.icon}
              <span className="font-medium text-slate-700 dark:text-slate-200 transition-colors">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
};