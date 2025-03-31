import React, { useState, useEffect, useRef } from 'react';
import { Brain,Heart,Briefcase,Users,Star,Activity,Sun,Moon,Palette,Map, BookOpen, X, Edit2, Save, PenTool, Lightbulb, Sparkles, RefreshCw, Plus } from 'lucide-react';
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

 // Available categories
 const availableCategories = [
  { id: 'meditation', name: 'Meditation', icon: <Brain size={16} className="text-indigo-500 dark:text-indigo-400" /> },
  { id: 'gratitude', name: 'Gratitude', icon: <Heart size={16} className="text-rose-500 dark:text-rose-400" /> },
  { id: 'work', name: 'Work', icon: <Briefcase size={16} className="text-blue-500 dark:text-blue-400" /> },
  { id: 'relationships', name: 'Relationships', icon: <Users size={16} className="text-emerald-500 dark:text-emerald-400" /> },
  { id: 'personal', name: 'Personal', icon: <Star size={16} className="text-amber-500 dark:text-amber-400" /> },
  { id: 'health', name: 'Health', icon: <Activity size={16} className="text-red-500 dark:text-red-400" /> },
  { id: 'morning', name: 'Morning', icon: <Sun size={16} className="text-yellow-500 dark:text-yellow-400" /> },
  { id: 'evening', name: 'Evening', icon: <Moon size={16} className="text-purple-500 dark:text-purple-400" /> },
  { id: 'social', name: 'Social', icon: <Users size={16} className="text-pink-500 dark:text-pink-400" /> },
  { id: 'hobbies', name: 'Hobbies', icon: <Palette size={16} className="text-teal-500 dark:text-teal-400" /> },
  { id: 'travel', name: 'Travel', icon: <Map size={16} className="text-cyan-500 dark:text-cyan-400" /> }
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

// Import & include all the available categories and helper functions as in the original component

// ... (Keep all the imports and helper functions from the original file) ...

export const DayNotes = ({ date, onClose }) => {
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [displayedPrompts, setDisplayedPrompts] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showJournalEditor, setShowJournalEditor] = useState(false);
  const [showAllPrompts, setShowAllPrompts] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // New state for active tab
  
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
            {!isEditing && notes && activeTab === 'notes' && (
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'notes'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <PenTool size={16} />
              Quick Notes
            </div>
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'journal'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={16} />
              Journal
              {journalEntries.length > 0 && (
                <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs px-2 py-0.5">
                  {journalEntries.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Daily Notes Tab */}
        {activeTab === 'notes' && (
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
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 whitespace-pre-wrap h-auto max-h-96 overflow-y-auto text-slate-700 dark:text-slate-200 transition-colors">
                    {notes}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/60 rounded-lg p-8 h-48 transition-colors">
                    <PenTool size={24} className="text-slate-300 dark:text-slate-600 mb-2 transition-colors" />
                    <p className="text-slate-500 dark:text-slate-400 text-center transition-colors mb-2">No notes yet for this day.</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
                    >
                      Add Notes
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Journal Entries Tab */}
        {activeTab === 'journal' && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-500 dark:text-indigo-400" />
                Journal Entries for {new Date(date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
              </h4>
              <button
                onClick={handleAddEntry}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors text-sm"
              >
                <Plus size={16} />
                New Entry
              </button>
            </div>
            
            {journalEntries.length > 0 ? (
              <div className="space-y-3">
                {journalEntries.map(entry => (
                  <JournalEntry
                    key={entry.id}
                    entry={entry}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                    availableCategories={availableCategories}
                    compact={false}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400 mb-4">No journal entries for this day yet.</p>
                <button
                  onClick={handleAddEntry}
                  className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
                >
                  Create First Journal Entry
                </button>
              </div>
            )}
          </div>
        )}
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