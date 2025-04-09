import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, Tag, Clock, ArrowRight, CheckSquare, Filter } from 'lucide-react';
import { searchTasks } from '../utils/taskSearchUtils';

const TaskSearchModal = ({ onClose, onSelectDay }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Create a ref for the dialog element
  const dialogRef = useRef(null);
  
  // Auto-open the modal when it's mounted
  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, []);
  
  // Search filter options
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Perform search when query or filters change
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setNoResults(false);
      return;
    }
    
    performSearch(searchQuery);
  }, [searchQuery, includeCompleted, dateRange]);
  
  const performSearch = (query) => {
    if (query.trim().length < 2) return;
    
    setIsSearching(true);
    setNoResults(false);
    
    // Use setTimeout to prevent UI freezing during search
    setTimeout(() => {
      try {
        // Use the utility function with our filters
        const results = searchTasks(query, {
          caseSensitive: false,
          includeCompleted: includeCompleted,
          startDate: dateRange.startDate || null,
          endDate: dateRange.endDate || null,
          limit: 100 // Reasonable limit to prevent performance issues
        });
        
        setSearchResults(results);
        setNoResults(results.length === 0);
      } catch (error) {
        console.error('Error searching tasks:', error);
      } finally {
        setIsSearching(false);
      }
    }, 100);
  };
  
  // This function directly passes the date and category info to parent component
  const handleResultClick = (result) => {
    // Close the search modal first
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    onClose();
    
    // Call onSelectDay with date and category info
    onSelectDay(result.date, {
      category: result.category,
      openTaskList: true, // Signal to open task list directly
      taskText: result.task // Include the task text for potential highlighting
    });
  };
  
  const handleCloseModal = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    onClose();
  };
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('default', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <dialog 
      ref={dialogRef}
      id="task-search-modal" 
      className="modal-base"
      onClick={(e) => {
        if (e.target.id === 'task-search-modal') {
          handleCloseModal();
        }
      }}
    >
      <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-1">
            <h3 className="modal-title">Search Tasks</h3>
            <p className="modal-subtitle">
              Search across all your tasks by name
            </p>
          </div>
          <button
            onClick={handleCloseModal}
            className="modal-close-button"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Search input */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-400 dark:text-slate-500" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search for any task..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors"
            autoFocus
          />
          <button 
            className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
              showFilters ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle search filters"
          >
            <Filter size={20} />
          </button>
        </div>
        
        {/* Search Filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Search Filters
            </h4>
            
            <div className="space-y-3">
              {/* Include completed tasks filter */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCompleted}
                    onChange={(e) => setIncludeCompleted(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 mr-2 rounded flex items-center justify-center ${
                    includeCompleted 
                      ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                      : 'border border-slate-300 dark:border-slate-600'
                  }`}>
                    {includeCompleted && <CheckSquare size={12} />}
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Include completed tasks
                  </span>
                </label>
              </div>
              
              {/* Date range filter */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                    className="w-full p-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    className="w-full p-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
              
              {/* Clear filters button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setIncludeCompleted(true);
                    setDateRange({ startDate: '', endDate: '' });
                  }}
                  className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                >
                  Reset filters
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {isSearching && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
          </div>
        )}
        
        {/* No results message */}
        {noResults && !isSearching && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <div className="inline-flex justify-center items-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
              <Search size={24} className="text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-lg font-medium mb-1">No tasks found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}
        
        {/* Results list */}
        {searchResults.length > 0 && !isSearching && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
              </h4>
              
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Click on a result to view task details
              </div>
            </div>
            
            <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
              {searchResults.map((result, index) => (
                <div 
                  key={`${result.date}-${result.task}-${index}`}
                  onClick={() => handleResultClick(result)}
                  className="flex items-center p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors group"
                >
                  {/* Status Label - Color-coded for completion status */}
                  <div className={`w-2 self-stretch rounded-l-lg mr-3 ${
                    result.isCompleted 
                      ? 'bg-green-500 dark:bg-green-600' 
                      : 'bg-amber-500 dark:bg-amber-600'
                  }`}></div>
                
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-blue-500 dark:text-blue-400 mr-2" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          {formatDate(result.date)}
                        </span>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        result.isCompleted 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                      }`}>
                        {result.isCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    
                    <p className={`font-medium mb-1 ${
                      result.isCompleted 
                        ? 'text-slate-500 dark:text-slate-500 line-through' 
                        : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {result.task}
                    </p>
                    
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-3">
                      <div className="flex items-center">
                        <Tag size={14} className="mr-1" />
                        <span>{result.category}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{
                          result.taskType === 'aiTasks' 
                            ? 'AI Generated' 
                            : result.taskType === 'customTasks' 
                              ? 'Custom Task' 
                              : 'Default Task'
                        }</span>
                      </div>
                    </div>
                  </div>
                  
                  <ArrowRight size={18} className="text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Initial state (no search yet) */}
        {searchResults.length === 0 && !noResults && !isSearching && searchQuery.length < 2 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <div className="inline-flex justify-center items-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
              <Search size={24} className="text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-lg font-medium mb-1">Search for any task</p>
            <p className="text-sm">Type at least 2 characters to start searching</p>
          </div>
        )}
      </div>
    </dialog>
  );
};

export default TaskSearchModal;