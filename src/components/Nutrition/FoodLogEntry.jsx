import React from 'react';
import { Edit2, Trash2, Clock, Tag } from 'lucide-react';

export const FoodLogEntry = ({ entry, onEdit, onDelete }) => {
  // Determine mood impact class based on the entry
  const getMoodImpactClass = (impact) => {
    if (!impact) return '';
    
    if (impact > 0) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
    } else if (impact < 0) {
      return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
    } else {
      return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  };
  
  // Determine energy impact class based on the entry
  const getEnergyImpactClass = (impact) => {
    if (!impact) return '';
    
    if (impact > 0) {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    } else if (impact < 0) {
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
    } else {
      return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
  <div className="flex items-center gap-2 max-w-[70%]">  {/* Added max-width */}
    <span className="text-xl">{entry.emoji || '🍽️'}</span>
    <span className="font-medium text-slate-700 dark:text-slate-300 text-sm sm:text-base truncate">  {/* Added truncate */}
      {entry.name}
    </span>
  </div>
  
  {/* Made time display more compact on mobile */}
  <div className="flex items-center gap-1 sm:gap-2">
    <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
      <Clock size={12} className="sm:hidden mr-1" />
      <Clock size={14} className="hidden sm:block mr-1" />
      <span>{entry.time || '12:00'}</span>
    </div>
    
    {/* Smaller buttons on mobile */}
    <button
      onClick={onEdit}
      className="p-1 sm:p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
      aria-label="Edit"
    >
      <Edit2 size={14} className="sm:hidden" />
      <Edit2 size={16} className="hidden sm:block" />
    </button>
    
    <button
      onClick={onDelete}
      className="p-1 sm:p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
      aria-label="Delete"
    >
      <Trash2 size={14} className="sm:hidden" />
      <Trash2 size={16} className="hidden sm:block" />
    </button>
  </div>
</div>
      
      <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
        {entry.category && (
          <span className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
            {entry.category}
          </span>
        )}
        
        {entry.tags && entry.tags.map((tag, index) => (
          <span 
            key={index} 
            className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full flex items-center gap-1"
          >
            <Tag size={10} />
            {tag}
          </span>
        ))}
        
        {entry.moodImpact && (
          <span className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full ${getMoodImpactClass(entry.moodImpact)}`}>
            Mood: {entry.moodImpact > 0 ? '+' : ''}{entry.moodImpact}%
          </span>
        )}
        
        {entry.energyImpact && (
          <span className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full ${getEnergyImpactClass(entry.energyImpact)}`}>
            Energy: {entry.energyImpact > 0 ? '+' : ''}{entry.energyImpact}%
          </span>
        )}
      </div>
      
      {entry.notes && (
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 sm:mt-2 italic">
          {entry.notes}
        </p>
      )}
    </div>
  );
};

export default FoodLogEntry;