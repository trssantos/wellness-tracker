// components/TaskSuggestions.jsx
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Clock, Tag } from 'lucide-react';
import { searchRegisteredTasks } from '../utils/taskRegistry';

const TaskSuggestions = ({ inputText, onSelectTask, excludeTasks = [], categoryContext = '' }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionsRef = useRef(null);
  
  useEffect(() => {
    if (inputText && inputText.trim().length >= 2) {
      const matchedTasks = searchRegisteredTasks(inputText)
        .filter(task => !excludeTasks.includes(task));
      
      setSuggestions(matchedTasks);
      setIsVisible(matchedTasks.length > 0);
      setHighlightedIndex(-1); // Reset highlight
    } else {
      setSuggestions([]);
      setIsVisible(false);
    }
  }, [inputText, excludeTasks]);
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isVisible) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          e.preventDefault();
          handleSelectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsVisible(false);
        break;
      default:
        break;
    }
  };
  
  const handleSelectSuggestion = (task) => {
    onSelectTask(task);
    setIsVisible(false);
  };
  
  // Handle clicks outside to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setIsVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div 
      ref={suggestionsRef}
      className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto"
      onKeyDown={handleKeyDown}
    >
      <ul className="py-1">
        {suggestions.map((task, index) => (
          <li 
            key={task}
            className={`px-3 py-2 cursor-pointer flex items-start gap-2 text-sm ${
              index === highlightedIndex 
                ? 'bg-blue-50 dark:bg-blue-900/30' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            onClick={() => handleSelectSuggestion(task)}
          >
            <CheckCircle size={16} className="mt-0.5 text-green-500 dark:text-green-400" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-700 dark:text-slate-200">
                {task}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Clock size={12} />
                <span>Previously used task</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskSuggestions;