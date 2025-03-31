import React, { useState } from 'react';
import { 
  Edit2, Trash2, Clock, User, Tag, Heart, MessageSquare, 
  Zap, Smile, Calendar
} from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import { handleDataChange } from '../../utils/dayCoachUtils';

const JournalEntry = ({ 
  entry, 
  onEdit, 
  onDelete, 
  availableCategories, 
  showDate = true,
  compact = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get the mood emoji
  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 1: return '😔';
      case 2: return '😕';
      case 3: return '😐';
      case 4: return '🙂';
      case 5: return '😊';
      default: return '😐';
    }
  };

  // Get the color class for mood
  const getMoodColorClass = (mood) => {
    switch (mood) {
      case 1: return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 2: return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      case 3: return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 4: return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
      case 5: return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  // Get the color class for a category
  const getCategoryColorClass = (categoryId) => {
    switch (categoryId) {
      case 'meditation': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300';
      case 'gratitude': return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300';
      case 'work': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'relationships': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
      case 'personal': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
      case 'health': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'morning': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'evening': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'social': return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300';
      case 'hobbies': return 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300';
      case 'travel': return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  // Get mood gradient
  const getMoodGradient = (mood) => {
    switch (mood) {
      case 1: return 'from-red-500 to-red-600';
      case 2: return 'from-orange-500 to-orange-600';
      case 3: return 'from-yellow-500 to-yellow-600';
      case 4: return 'from-emerald-500 to-emerald-600';
      case 5: return 'from-green-500 to-green-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  // Format the timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format the date for display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('default', { 
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  // Find category object by id
  const getCategory = (categoryId) => {
    return availableCategories?.find(cat => cat.id === categoryId);
  };

  if (compact) {
    // Render a compact version for use in DayNotes
    return (
      <div className="border-l-4 border-indigo-500 dark:border-indigo-600 bg-white dark:bg-slate-800 rounded-r-lg shadow-sm p-3 mb-3 hover:shadow-md transition-all">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">
                {entry.title || 'Journal Entry'}
              </h4>
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-slate-500 dark:text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {/* Mood */}
              {entry.mood && (
                <div className={`rounded-full px-2 py-0.5 flex items-center gap-1 ${getMoodColorClass(entry.mood)}`}>
                  <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                </div>
              )}
              
              {/* Energy */}
              {entry.energy && (
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full px-2 py-0.5 flex items-center gap-1">
                  <Zap size={12} />
                  <span className="text-xs">{entry.energy}/3</span>
                </div>
              )}
              
              {/* Show first category if exists */}
              {entry.categories && entry.categories.length > 0 && (
                <div className={`rounded-full px-2 py-0.5 flex items-center gap-1 ${getCategoryColorClass(entry.categories[0])}`}>
                  {getCategory(entry.categories[0])?.icon}
                  <span className="text-xs">{getCategory(entry.categories[0])?.name || entry.categories[0]}</span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {entry.text}
            </p>
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(entry);
              }}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
              title="Edit"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entry.id);
              }}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render full version
  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md mb-4"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Entry header with mood gradient */}
      <div className={`h-2 bg-gradient-to-r ${getMoodGradient(entry.mood)}`}></div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-lg font-medium text-slate-800 dark:text-slate-100 flex-1">
            {entry.title || 'Journal Entry'}
          </h4>
          
          <div className="flex items-center gap-2">
            {/* Entry time and date */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Clock size={12} />
                <span>{formatTimestamp(entry.timestamp)}</span>
                
                {/* Energy level - moved next to time */}
                {entry.energy && (
                  <div className="flex items-center gap-1 ml-2">
                    <Zap size={12} className="text-blue-500 dark:text-blue-400" />
                    <div className="flex">
                      {[1, 2, 3].map((level) => (
                        <div 
                          key={level}
                          className={`w-2 h-2 rounded-full mx-0.5 ${level <= entry.energy ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Show date if needed */}
              {showDate && (
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <Calendar size={12} />
                  <span>{formatDate(entry.timestamp)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mood indicator on its own line */}
        {entry.mood && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <Smile size={16} />
              <span className="text-sm font-medium">Mood:</span>
            </div>
            <div 
              className={`rounded-full p-1 ${getMoodColorClass(entry.mood)}`} 
              title={`Mood: ${entry.mood}/5`}
            >
              <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
            </div>
          </div>
        )}
        
        {/* Categories */}
        {entry.categories && entry.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {entry.categories.map(categoryId => {
              const category = getCategory(categoryId);
              return (
                <span
                  key={categoryId}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getCategoryColorClass(categoryId)}`}
                >
                  {category?.icon}
                  <span>{category?.name || categoryId}</span>
                </span>
              );
            })}
          </div>
        )}
        
        {/* Entry content */}
        <div className="mb-3">
          <p className={`text-slate-600 dark:text-slate-400 whitespace-pre-wrap ${
            isExpanded ? '' : 'line-clamp-3'
          }`}>
            {entry.text}
          </p>
          
          {!isExpanded && entry.text.length > 300 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
              className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline mt-2"
            >
              Read more
            </button>
          )}
        </div>
        
        {/* People mentioned */}
        {entry.people && entry.people.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1 text-sm text-slate-600 dark:text-slate-400">
              <User size={16} />
              <span>People mentioned:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {entry.people.map(person => (
                <span
                  key={person}
                  className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                >
                  {person}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {entry.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full flex items-center gap-1"
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Action buttons - shown when entry is expanded */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(entry);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
            >
              <Edit2 size={16} />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entry.id);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalEntry;