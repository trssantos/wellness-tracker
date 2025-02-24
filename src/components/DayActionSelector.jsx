import React from 'react';
import { SmilePlus, CheckSquare, Sparkles, X, Edit3, PenTool } from 'lucide-react';

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

  // Define actions with their properties
  const actions = [
    {
      id: 'mood',
      label: 'Track Mood',
      icon: <SmilePlus size={24} className="text-purple-500" />,
      bgColor: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      id: 'progress',
      label: 'Track Progress',
      icon: <CheckSquare size={24} className="text-blue-500" />,
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      id: 'notes',
      label: 'Add Day Notes',
      icon: <PenTool size={24} className="text-teal-500" />,
      bgColor: 'bg-teal-50 hover:bg-teal-100'
    }
  ];

  return (
    <dialog 
      id="day-action-modal" 
      className="rounded-xl p-0 bg-transparent backdrop:bg-black backdrop:bg-opacity-50"
      onClick={(e) => e.target.id === 'day-action-modal' && onClose()}
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

        <div className="grid grid-cols-1 gap-4">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onSelectAction(action.id)}
              className={`flex items-center gap-3 p-4 rounded-xl ${action.bgColor} transition-colors`}
            >
              {action.icon}
              <span className="font-medium text-slate-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
};