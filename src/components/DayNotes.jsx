import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, PenTool, Lightbulb, Sparkles, RefreshCw } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';

// Reflection prompts to help users get started
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

// Get random prompts, excluding any that are already in the notes
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

export const DayNotes = ({ date, onClose }) => {
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [displayedPrompts, setDisplayedPrompts] = useState([]);
  
  // This effect runs only when date changes
  useEffect(() => {
    if (date) {
      const storage = getStorage();
      const dayData = storage[date] || {};
      const savedNotes = dayData.notes || '';
      setNotes(savedNotes);
      
      // Generate initial prompts just once when date changes
      setDisplayedPrompts(getRandomPrompts(savedNotes, 3));
      
      // Start in editing mode if no notes exist yet
      setIsEditing(!savedNotes);
    }
  }, [date]); // Only depend on date changing

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
    setIsEditing(false);
  };

  const addPromptToNotes = (prompt) => {
    const promptText = `${prompt}\n`;
    if (!notes.includes(promptText)) {
      const updatedNotes = notes ? `${notes}\n\n${promptText}` : promptText;
      setNotes(updatedNotes);
    }
  };

  // Regenerate prompts only when user clicks refresh
  const refreshPrompts = () => {
    setDisplayedPrompts(getRandomPrompts(notes, 3));
  };

  return (
    <dialog 
      id="notes-modal" 
      className="rounded-xl p-0 bg-transparent backdrop:bg-black backdrop:bg-opacity-50"
      onClick={(e) => e.target.id === 'notes-modal' && onClose()}
    >
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">Day Notes</h3>
            <p className="text-sm text-slate-600">
              {getFormattedDate()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && notes && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-blue-50 text-blue-500 rounded-full"
                title="Edit notes"
              >
                <Edit2 size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="mb-4">
          {isEditing ? (
            <>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your thoughts, reflections, or anything you want to remember about today..."
                className="w-full h-60 p-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
              />
            
              {/* Prompt suggestions */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb size={16} className="text-amber-500" />
                    <span className="text-sm font-medium text-slate-700">Need inspiration? Try one of these prompts:</span>
                  </div>
                  <button 
                    onClick={refreshPrompts}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
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
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                    >
                      {prompt}
                    </button>
                  ))}
                  {/* Show all prompts button */}
                  <button
                    onClick={() => {
                      // Modal to show all prompts
                      const modal = document.getElementById('all-prompts-dialog');
                      if (modal) modal.showModal();
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-medium"
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
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                    ${!notes.trim() ? 'bg-slate-100 text-slate-400' : 'bg-blue-500 text-white hover:bg-blue-600'}
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
                <div className="bg-slate-50 rounded-lg p-4 whitespace-pre-wrap min-h-60">
                  {notes}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg p-8 min-h-60">
                  <PenTool size={36} className="text-slate-300 mb-4" />
                  <p className="text-slate-500 text-center">No notes yet for this day.</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  >
                    Add Notes
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dialog for all prompts */}
      <dialog 
        id="all-prompts-dialog" 
        className="rounded-xl p-0 bg-transparent backdrop:bg-black backdrop:bg-opacity-50"
      >
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-slate-800">Reflection Prompts</h4>
            <button
              onClick={() => document.getElementById('all-prompts-dialog').close()}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
            {REFLECTION_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => {
                  addPromptToNotes(prompt);
                  document.getElementById('all-prompts-dialog').close();
                }}
                className="text-left p-3 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center gap-2"
              >
                <Sparkles size={16} className="text-amber-500 flex-shrink-0" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>
      </dialog>
    </dialog>
  );
};

export default DayNotes;