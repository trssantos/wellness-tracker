import React from 'react';
import { Plus, Clock, Check, Bell } from 'lucide-react';

const ActionButton = ({ action, onExecute }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'ADD_TASK':
        return <Plus size={14} />;
      case 'SET_REMINDER':
        return <Bell size={14} />;
      case 'COMPLETE_TASK':
        return <Check size={14} />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={() => onExecute(action)}
      className="flex items-center gap-2 px-4 py-2 mt-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-colors shadow-sm"
    >
      {getIcon(action.type)}
      <span>{action.label || 'Execute'}</span>
    </button>
  );
};

export default ActionButton;
