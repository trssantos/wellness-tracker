import React from 'react';
import { Lightbulb } from 'lucide-react';

const DayCoachSuggestions = ({ suggestions, onSelectSuggestion }) => {
  if (!suggestions || suggestions.length === 0) return null;
  
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1 mb-2">
        <Lightbulb size={14} className="text-amber-500 dark:text-amber-400" />
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Suggested replies
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectSuggestion(suggestion)}
            className="px-3 py-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors shadow-sm text-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DayCoachSuggestions;