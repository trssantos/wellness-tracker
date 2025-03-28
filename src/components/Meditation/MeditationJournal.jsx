import React, { useState, useMemo } from 'react';
import { BookOpen, Plus, Search, Calendar, Edit, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';

const MeditationJournal = ({ journalEntries = [], onSaveEntry }) => {
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newEntryText, setNewEntryText] = useState('');
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryFeelings, setNewEntryFeelings] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest'
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [filterByFeelings, setFilterByFeelings] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Available feelings
  const availableFeelings = [
    'Calm', 'Relaxed', 'Centered', 'Peaceful', 'Focused',
    'Anxious', 'Scattered', 'Tired', 'Energized', 'Grateful',
    'Inspired', 'Balanced', 'Restless', 'Clear', 'Sleepy'
  ];
  
  // Get all unique feelings from journal entries
  const allUsedFeelings = useMemo(() => {
    const feelingsSet = new Set();
    journalEntries.forEach(entry => {
      if (entry.feelings && Array.isArray(entry.feelings)) {
        entry.feelings.forEach(feeling => feelingsSet.add(feeling));
      }
    });
    return [...feelingsSet];
  }, [journalEntries]);
  
  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let filtered = [...journalEntries];
    
    // Apply search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        (entry.title && entry.title.toLowerCase().includes(term)) ||
        (entry.text && entry.text.toLowerCase().includes(term))
      );
    }
    
    // Apply feelings filter
    if (filterByFeelings.length > 0) {
      filtered = filtered.filter(entry => {
        if (!entry.feelings || !Array.isArray(entry.feelings)) return false;
        
        return filterByFeelings.every(feeling => 
          entry.feelings.includes(feeling)
        );
      });
    }
    
    // Apply sorting
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      
      return sortBy === 'newest' 
        ? dateB - dateA // newest first
        : dateA - dateB; // oldest first
    });
    
    return filtered;
  }, [journalEntries, searchTerm, sortBy, filterByFeelings]);
  
  // Toggle feeling in new entry
  const toggleFeeling = (feeling) => {
    if (newEntryFeelings.includes(feeling)) {
      setNewEntryFeelings(prev => prev.filter(f => f !== feeling));
    } else {
      setNewEntryFeelings(prev => [...prev, feeling]);
    }
  };
  
  // Toggle feeling in filter
  const toggleFilterFeeling = (feeling) => {
    if (filterByFeelings.includes(feeling)) {
      setFilterByFeelings(prev => prev.filter(f => f !== feeling));
    } else {
      setFilterByFeelings(prev => [...prev, feeling]);
    }
  };
  
  // Save new entry
  const handleSaveEntry = () => {
    if (!newEntryText.trim()) return;
    
    // Create entry object
    const entry = {
      title: newEntryTitle.trim() || 'Meditation Reflection',
      text: newEntryText.trim(),
      feelings: newEntryFeelings,
      timestamp: new Date().toISOString()
    };
    
    // Call parent handler
    onSaveEntry(entry);
    
    // Reset form
    setNewEntryText('');
    setNewEntryTitle('');
    setNewEntryFeelings([]);
    setShowNewEntry(false);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Check if it's today
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if it's yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isYesterday) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise, show full date
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="text-indigo-500 dark:text-indigo-400" size={20} />
            Meditation Journal
          </h3>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowNewEntry(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span>New Entry</span>
            </button>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          </div>
          
          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <Calendar size={16} className="text-slate-500 dark:text-slate-400" />
              <span>
                {sortBy === 'newest' ? 'Newest first' : 'Oldest first'}
              </span>
              {showSortOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showSortOptions && (
              <div className="absolute top-full mt-1 right-0 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-2 z-10">
                <button
                  onClick={() => {
                    setSortBy('newest');
                    setShowSortOptions(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    sortBy === 'newest' 
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Newest first
                </button>
                <button
                  onClick={() => {
                    setSortBy('oldest');
                    setShowSortOptions(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    sortBy === 'oldest' 
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Oldest first
                </button>
              </div>
            )}
          </div>
          
          {/* Feelings filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-lg flex items-center gap-1 transition-colors ${
                filterByFeelings.length > 0
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>
                {filterByFeelings.length > 0 
                  ? `${filterByFeelings.length} filter${filterByFeelings.length > 1 ? 's' : ''}` 
                  : 'Filter by feelings'}
              </span>
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showFilters && (
              <div className="absolute top-full mt-1 right-0 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-3 z-10 w-64">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Filter by feelings
                </h4>
                {filterByFeelings.length > 0 && (
                  <div className="mb-2">
                    <button
                      onClick={() => setFilterByFeelings([])}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {allUsedFeelings.length > 0 ? (
                    allUsedFeelings.map(feeling => (
                      <button
                        key={feeling}
                        onClick={() => toggleFilterFeeling(feeling)}
                        className={`text-xs px-2 py-1 rounded-full transition-colors ${
                          filterByFeelings.includes(feeling)
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {feeling}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No feelings recorded yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* New entry form */}
        {showNewEntry && (
          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-6 transition-colors">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">
                New Journal Entry
              </h4>
              <button
                onClick={() => setShowNewEntry(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Title (optional)"
              value={newEntryTitle}
              onChange={e => setNewEntryTitle(e.target.value)}
              className="w-full p-2 mb-3 bg-white dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
            />
            
            <textarea
              placeholder="Write your reflection here..."
              value={newEntryText}
              onChange={e => setNewEntryText(e.target.value)}
              className="w-full p-3 mb-3 bg-white dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 min-h-[120px] transition-colors"
            />
            
            <div className="mb-3">
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                How did you feel? (select all that apply)
              </h5>
              <div className="flex flex-wrap gap-2">
                {availableFeelings.map(feeling => (
                  <button
                    key={feeling}
                    onClick={() => toggleFeeling(feeling)}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${
                      newEntryFeelings.includes(feeling)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {feeling}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleSaveEntry}
                disabled={!newEntryText.trim()}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  newEntryText.trim()
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                    : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                }`}
              >
                Save Entry
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Empty state */}
      {journalEntries.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 text-center transition-colors">
          <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-slate-500 dark:text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            Your journal is empty
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Start recording your meditation experiences, insights, and feelings to track your progress over time.
          </p>
          <button
            onClick={() => setShowNewEntry(true)}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
          >
            Create Your First Entry
          </button>
        </div>
      )}
      
      {/* Journal entries list */}
      {journalEntries.length > 0 && (
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 text-center transition-colors">
              <p className="text-slate-500 dark:text-slate-400">
                No entries match your search criteria.
              </p>
            </div>
          ) : (
            filteredEntries.map(entry => (
              <div 
                key={entry.id} 
                className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors ${
                  selectedEntry === entry.id ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-medium text-slate-800 dark:text-slate-100">
                    {entry.title || 'Meditation Reflection'}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(entry.timestamp)}
                  </span>
                </div>
                
                {entry.feelings && entry.feelings.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {entry.feelings.map(feeling => (
                      <span 
                        key={feeling}
                        className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full"
                      >
                        {feeling}
                      </span>
                    ))}
                  </div>
                )}
                
                <p className="text-slate-600 dark:text-slate-400 mb-2 line-clamp-3">
                  {entry.text}
                </p>
                
                {selectedEntry === entry.id && entry.text.length > 200 && (
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    {entry.text}
                  </p>
                )}
                
                {entry.text.length > 200 && (
                  <button 
                    className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntry(selectedEntry === entry.id ? null : entry.id);
                    }}
                  >
                    {selectedEntry === entry.id ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MeditationJournal;