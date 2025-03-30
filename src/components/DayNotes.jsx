import React, { useState, useEffect, useRef } from 'react';
import { BookOpen,X, Edit2, Save, PenTool, Lightbulb, Sparkles, RefreshCw, Plus } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';
import { handleDataChange } from '../utils/dayCoachUtils';
import JournalEntry from './Meditation/JournalEntry';
import JournalEditor from './Meditation/JournalEditor';

// Same reflection prompts from the original
const REFLECTION_PROMPTS = [
  "What went well today?",
  "One thing I'm grateful for...",
  "Something I accomplished...",
  "How I felt about today in a few words...",
  "Something I learned today...",
  "What energized me today?",
  "What drained my energy today?",
  "A small win worth celebrating...",
  "Something I want to remember about today...",
  "What I'll do differently tomorrow...",
];

// Available categories (should match those in JournalHub)
const availableCategories = [
  { 
    id: 'meditation', 
    name: 'Meditation', 
    icon: <Brain size={16} className="text-indigo-500 dark:text-indigo-400" />,
    colorClass: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
  },
  { 
    id: 'gratitude', 
    name: 'Gratitude', 
    icon: <Heart size={16} className="text-rose-500 dark:text-rose-400" />,
    colorClass: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
  },
  { 
    id: 'work', 
    name: 'Work', 
    icon: <Briefcase size={16} className="text-blue-500 dark:text-blue-400" />,
    colorClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
  },
  { 
    id: 'relationships', 
    name: 'Relationships', 
    icon: <Users size={16} className="text-emerald-500 dark:text-emerald-400" />,
    colorClass: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
  },
  { 
    id: 'personal', 
    name: 'Personal', 
    icon: <Star size={16} className="text-amber-500 dark:text-amber-400" />,
    colorClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
  },
  { 
    id: 'health', 
    name: 'Health', 
    icon: <Activity size={16} className="text-red-500 dark:text-red-400" />,
    colorClass: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  },
  { 
    id: 'morning', 
    name: 'Morning', 
    icon: <Sun size={16} className="text-yellow-500 dark:text-yellow-400" />,
    colorClass: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
  },
  { 
    id: 'evening', 
    name: 'Evening', 
    icon: <Moon size={16} className="text-purple-500 dark:text-purple-400" />,
    colorClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
  },
  { 
    id: 'social', 
    name: 'Social', 
    icon: <Users size={16} className="text-pink-500 dark:text-pink-400" />,
    colorClass: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
  },
  { 
    id: 'hobbies', 
    name: 'Hobbies', 
    icon: <Palette size={16} className="text-teal-500 dark:text-teal-400" />,
    colorClass: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
  },
  { 
    id: 'travel', 
    name: 'Travel', 
    icon: <Map size={16} className="text-cyan-500 dark:text-cyan-400" />,
    colorClass: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
  },
];

// Function to get random prompts, excluding any that are already in the notes
const getRandomPrompts = (existingNotes, count = 3) => {
  const availablePrompts = REFLECTION_PROMPTS.filter(prompt => !existingNotes.includes(prompt));
  
  if (availablePrompts.length <= count) return availablePrompts;
  
  const randomPrompts = [];
  const usedIndices = new Set();
  
  while (randomPrompts.length < count && randomPrompts.length < availablePrompts.length) {
    const randomIndex = Math.floor(Math.random() * availablePrompts.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      randomPrompts.push(availablePrompts[randomIndex]);
    }
  }
  
  return randomPrompts;
};

// Import missing Lucide React components
function Brain(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"></path>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2Z"></path>
    </svg>
  );
}

function Heart(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
    </svg>
  );
}

function Briefcase(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  );
}

function Users(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

function Star(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );
}

function Activity(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}

function Sun(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  );
}

function Moon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
    </svg>
  );
}

function Palette(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="13.5" cy="6.5" r=".5"></circle>
      <circle cx="17.5" cy="10.5" r=".5"></circle>
      <circle cx="8.5" cy="7.5" r=".5"></circle>
      <circle cx="6.5" cy="12.5" r=".5"></circle>
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5 5 4 4 0 0 1-2-7"></path>
    </svg>
  );
}

function Map(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
      <line x1="9" x2="9" y1="3" y2="18"></line>
      <line x1="15" x2="15" y1="6" y2="21"></line>
    </svg>
  );
}

export const DayNotes = ({ date, onClose }) => {
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [displayedPrompts, setDisplayedPrompts] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showJournalEditor, setShowJournalEditor] = useState(false);
  const [showAllPrompts, setShowAllPrompts] = useState(false);
  
  // Popular tags
  const popularTags = [
    'reflection', 'progress', 'challenge', 'success', 'goal', 
    'habit', 'mindfulness', 'focus', 'peace', 'stress'
  ];

  // This effect loads notes and journal entries when the date changes
  useEffect(() => {
    if (date) {
      loadDataForDate(date);
    }
  }, [date]);

  const loadDataForDate = (dateStr) => {
    const storage = getStorage();
    const dayData = storage[dateStr] || {};
    const savedNotes = dayData.notes || '';
    setNotes(savedNotes);
    
    // Generate initial prompts just once when date changes
    setDisplayedPrompts(getRandomPrompts(savedNotes, 3));
    
    // Start in editing mode if no notes exist yet
    setIsEditing(!savedNotes);
    
    // Load journal entries for this date
    loadJournalEntries(dateStr, storage);
  };
  
  const loadJournalEntries = (dateStr, storage = null) => {
    if (!storage) {
      storage = getStorage();
    }
    
    const meditationData = storage.meditationData || {};
    const allEntries = meditationData.journalEntries || [];
    
    // Filter entries for this date
    const entriesForDate = allEntries.filter(entry => {
      const entryDate = entry.date || entry.timestamp.split('T')[0];
      return entryDate === dateStr;
    });
    
    // Sort by timestamp, newest first
    entriesForDate.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setJournalEntries(entriesForDate);
  };

  const getFormattedDate = () => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('default', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const saveNotes = () => {
    const storage = getStorage();
    const dayData = storage[date] || {};
    
    storage[date] = {
      ...dayData,
      notes: notes.trim()
    };
    
    setStorage(storage);
    handleDataChange(date, 'journal', { notes });
    setIsEditing(false);
  };

  const addPromptToNotes = (prompt) => {
    const promptText = `${prompt}\n`;
    if (!notes.includes(promptText)) {
      const updatedNotes = notes ? `${notes}\n\n${promptText}` : promptText;
      setNotes(updatedNotes);
    }
    setShowAllPrompts(false);
  };

  // Regenerate prompts only when user clicks refresh
  const refreshPrompts = () => {
    setDisplayedPrompts(getRandomPrompts(notes, 3));
  };
  
  // Open the journal editor to add a new entry
  const handleAddEntry = () => {
    setEditingEntry(null);
    setShowJournalEditor(true);
  };
  
  // Handle editing an existing entry
  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setShowJournalEditor(true);
  };
  
  // Handle deleting an entry
  const handleDeleteEntry = (entryId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this journal entry?");
    if (!confirmDelete) return;
    
    const storage = getStorage();
    const meditationData = storage.meditationData || {};
    
    if (!meditationData.journalEntries) {
      return;
    }
    
    // Filter out the entry to delete
    const filteredEntries = meditationData.journalEntries.filter(entry => entry.id !== entryId);
    
    // Update storage
    storage.meditationData.journalEntries = filteredEntries;
    setStorage(storage);
    
    // Update local state
    setJournalEntries(journalEntries.filter(entry => entry.id !== entryId));
    
    // Notify other modules of the change
    handleDataChange(date, 'journal', { entriesCount: filteredEntries.length });
  };
  
  // Save a new journal entry or update an existing one
  const saveJournalEntry = (entryData) => {
    const storage = getStorage();
    
    // Ensure meditationData and journalEntries exist
    if (!storage.meditationData) {
      storage.meditationData = {};
    }
    
    if (!storage.meditationData.journalEntries) {
      storage.meditationData.journalEntries = [];
    }
    
    if (editingEntry) {
      // Update existing entry
      storage.meditationData.journalEntries = storage.meditationData.journalEntries.map(entry => 
        entry.id === editingEntry.id ? entryData : entry
      );
    } else {
      // Add new entry
      storage.meditationData.journalEntries.push(entryData);
    }
    
    // Update storage
    setStorage(storage);
    
    // Update local state
    loadJournalEntries(date, storage);
    
    // Close editor
    setShowJournalEditor(false);
    setEditingEntry(null);
    
    // Notify other modules of the change
    handleDataChange(date, 'journal', { entriesCount: storage.meditationData.journalEntries.length });
  };
  
  // Link to the Meditation Journal module
  const openMeditationJournal = () => {
    // This would depend on your app's navigation system
    // For now, let's close this modal and try to open the Meditation section
    onClose();
    
    // This assumes you have a global function to open the meditation tab
    // and select the journal section
    if (typeof window.openMeditationJournal === 'function') {
      window.openMeditationJournal();
    } else {
      console.log('Navigate to meditation journal not implemented');
      // Alternatively, you could dispatch a custom event that your app listens for
      window.dispatchEvent(new CustomEvent('openMeditationJournal', {
        detail: { date }
      }));
    }
  };

  return (
    <dialog 
      id="notes-modal" 
      className="modal-base"
      onClick={(e) => e.target.id === 'notes-modal' && onClose()}
    >
      <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Day Notes & Journal</h3>
            <p className="modal-subtitle">
              {getFormattedDate()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && notes && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full transition-colors"
                title="Edit notes"
              >
                <Edit2 size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="modal-close-button"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Daily Notes Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <PenTool size={16} className="text-blue-500 dark:text-blue-400" />
              Quick Notes
            </h4>
          </div>
          
          {isEditing ? (
            <>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your thoughts, reflections, or anything you want to remember about today..."
                className="textarea-field h-40 mb-4"
                autoFocus
              />
            
              {/* Prompt suggestions */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb size={16} className="text-amber-500 dark:text-amber-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors">Need inspiration? Try one of these prompts:</span>
                  </div>
                  <button 
                    onClick={refreshPrompts}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
                    title="Get new prompts"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {displayedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => addPromptToNotes(prompt)}
                      className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-800/40 text-amber-800 dark:text-amber-300 rounded-full text-sm font-medium transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                  {/* Show all prompts button */}
                  <button
                    onClick={() => setShowAllPrompts(true)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium transition-colors"
                  >
                    More prompts...
                  </button>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={saveNotes}
                  disabled={!notes.trim()}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                    ${!notes.trim() ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600' : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'}
                  `}
                >
                  <Save size={18} />
                  Save Notes
                </button>
              </div>
            </>
          ) : (
            <>
              {notes ? (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 whitespace-pre-wrap h-auto max-h-60 overflow-y-auto text-slate-700 dark:text-slate-200 transition-colors mb-4">
                  {notes}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/60 rounded-lg p-8 h-32 transition-colors mb-4">
                  <PenTool size={24} className="text-slate-300 dark:text-slate-600 mb-2 transition-colors" />
                  <p className="text-slate-500 dark:text-slate-400 text-center transition-colors">No quick notes yet for this day.</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
                  >
                    Add Notes
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Journal Entries Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-500 dark:text-indigo-400" />
              Journal Entries
            </h4>
            <div className="flex gap-2">
              <button
                onClick={handleAddEntry}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors text-sm"
              >
                <Plus size={16} />
                New Entry
              </button>
              <button
                onClick={openMeditationJournal}
                className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm px-2"
              >
                Go to Journal
              </button>
            </div>
          </div>
          
          {journalEntries.length > 0 ? (
            <div className="space-y-2 mb-4">
              {journalEntries.map(entry => (
                <JournalEntry
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteEntry}
                  availableCategories={availableCategories}
                  compact={true}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 text-center">
              <p className="text-slate-500 dark:text-slate-400 mb-2">No journal entries for this day.</p>
              <button
                onClick={handleAddEntry}
                className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors text-sm"
              >
                Add First Entry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog for all prompts */}
      {showAllPrompts && (
        <dialog 
          id="all-prompts-dialog" 
          className="modal-base"
          open
        >
          <div className="modal-content max-w-lg">
            <div className="modal-header mb-4">
              <h4 className="text-lg font-medium text-slate-800 dark:text-slate-100 transition-colors">Reflection Prompts</h4>
              <button
                onClick={() => setShowAllPrompts(false)}
                className="modal-close-button"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
              {REFLECTION_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => addPromptToNotes(prompt)}
                  className="text-left p-3 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-800/40 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Sparkles size={16} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-slate-800 dark:text-slate-200 transition-colors">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        </dialog>
      )}
      
      {/* Journal Entry Editor */}
      {showJournalEditor && (
        <JournalEditor
          entry={editingEntry}
          date={date}
          onSave={saveJournalEntry}
          onCancel={() => {
            setShowJournalEditor(false);
            setEditingEntry(null);
          }}
          availableCategories={availableCategories}
          popularTags={popularTags}
        />
      )}
    </dialog>
  );
};

export default DayNotes;