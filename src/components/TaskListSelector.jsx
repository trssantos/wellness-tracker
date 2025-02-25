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
      icon: <CheckSquare size={24} className="text-blue-500 dark:text-blue-400" />,
      bgColor: 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/40'
    },
    {
      id: 'ai',
      label: 'Generate with AI',
      description: 'Create personalized tasks based on mood and energy',
      icon: <Sparkles size={24} className="text-amber-500 dark:text-amber-400" />,
      bgColor: 'bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-800/40'
    },
    {
      id: 'custom',
      label: 'Custom Task List',
      description: 'Create your own categories and tasks',
      icon: <Edit3 size={24} className="text-teal-500 dark:text-teal-400" />,
      bgColor: 'bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-800/40'
    }
  ];

  return (
    <dialog 
      id="task-list-selector-modal" 
      className="modal-base"
      onClick={(e) => e.target.id === 'task-list-selector-modal' && onClose()}
    >
      <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Choose Task List Type</h3>
            <p className="modal-subtitle">
              {getFormattedDate()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="modal-close-button"
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
                <span className="block font-medium text-slate-700 dark:text-slate-200 transition-colors mb-1">{type.label}</span>
                <span className="text-sm text-slate-600 dark:text-slate-300 transition-colors">{type.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
};