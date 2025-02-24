import React from 'react';
import { X, CheckSquare, Sparkles, Edit3 } from 'lucide-react';

export const TaskListSelector = ({ date, onClose, onSelectType }) => {
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

  // Define task list types with their properties
  const listTypes = [
    {
      id: 'default',
      label: 'Default Tasks',
      description: 'Use the pre-configured task categories',
      icon: <CheckSquare size={24} className="text-blue-500" />,
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      id: 'ai',
      label: 'Generate with AI',
      description: 'Create personalized tasks based on mood and energy',
      icon: <Sparkles size={24} className="text-amber-500" />,
      bgColor: 'bg-amber-50 hover:bg-amber-100'
    },
    {
      id: 'custom',
      label: 'Custom Task List',
      description: 'Create your own categories and tasks',
      icon: <Edit3 size={24} className="text-teal-500" />,
      bgColor: 'bg-teal-50 hover:bg-teal-100'
    }
  ];

  return (
    <dialog 
      id="task-list-selector-modal" 
      className="rounded-xl p-0 bg-transparent backdrop:bg-black backdrop:bg-opacity-50"
      onClick={(e) => e.target.id === 'task-list-selector-modal' && onClose()}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">Choose Task List Type</h3>
            <p className="text-sm text-slate-600">
              {getFormattedDate()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {listTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelectType(type.id)}
              className={`flex items-start gap-4 p-4 rounded-xl ${type.bgColor} transition-colors text-left`}
            >
              <div className="mt-1">{type.icon}</div>
              <div>
                <span className="block font-medium text-slate-700 mb-1">{type.label}</span>
                <span className="text-sm text-slate-600">{type.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
};