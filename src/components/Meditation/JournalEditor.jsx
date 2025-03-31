import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Save, Tag, User, Smile, Zap, FileText, Maximize2, Minimize2, 
  Check, Plus, Search, Calendar
} from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import { handleDataChange } from '../../utils/dayCoachUtils';
import { formatDateForStorage } from '../../utils/dateUtils';

const JournalEditor = ({ 
  entry = null, 
  date = null,
  onSave, 
  onCancel, 
  availableCategories = [],
  popularTags = []
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(2);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [people, setPeople] = useState([]);
  const [newPerson, setNewPerson] = useState('');
  const [newTag, setNewTag] = useState('');
  const [entryDate, setEntryDate] = useState(date || formatDateForStorage(new Date()));
  
  const textareaRef = useRef(null);

  // Initialize form with entry data if editing
  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      setText(entry.text || '');
      setMood(entry.mood || 3);
      setEnergy(entry.energy || 2);
      setCategories(entry.categories || []);
      setTags(entry.tags || []);
      setPeople(entry.people || []);
      
      // Set date from entry or default to current date
      if (entry.date) {
        setEntryDate(entry.date);
      } else if (entry.timestamp) {
        const date = new Date(entry.timestamp);
        setEntryDate(formatDateForStorage(date));
      }
    } else if (date) {
      setEntryDate(date);
    }
    
    // Focus the textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [entry, date]);

  // Mood data with labels and colors
  const moodOptions = [
    { value: 5, emoji: '😊', label: 'Great', bgColor: 'bg-green-700 dark:bg-green-800' },
    { value: 4, emoji: '🙂', label: 'Good', bgColor: 'bg-green-600 dark:bg-green-700' },
    { value: 3, emoji: '😐', label: 'Okay', bgColor: 'bg-gray-600 dark:bg-gray-700' },
    { value: 2, emoji: '😕', label: 'Meh', bgColor: 'bg-red-700 dark:bg-red-800' },
    { value: 1, emoji: '😔', label: 'Bad', bgColor: 'bg-red-800 dark:bg-red-900' }
  ];

  // Toggle a category
  const toggleCategory = (categoryId) => {
    if (categories.includes(categoryId)) {
      setCategories(categories.filter(c => c !== categoryId));
    } else {
      setCategories([...categories, categoryId]);
    }
  };

  // Add a tag
  const addTag = (tag) => {
    const normalizedTag = tag.trim().toLowerCase();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags([...tags, normalizedTag]);
    }
    setNewTag('');
  };

  // Remove a tag
  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Add a person
  const addPerson = (person) => {
    const normalizedPerson = person.trim();
    if (normalizedPerson && !people.includes(normalizedPerson)) {
      setPeople([...people, normalizedPerson]);
    }
    setNewPerson('');
  };

  // Remove a person
  const removePerson = (person) => {
    setPeople(people.filter(p => p !== person));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!text.trim()) return;
    
    const entryData = {
      id: entry ? entry.id : `journal-${Date.now()}`,
      title: title.trim() || 'Journal Entry',
      text: text.trim(),
      mood,
      energy,
      categories,
      tags,
      people,
      date: entryDate,
      timestamp: entry ? entry.timestamp : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSave(entryData);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
      isFullscreen ? '' : 'bg-slate-900/60 backdrop-blur-sm'
    }`}>
      <div className={`bg-slate-900 text-slate-100 rounded-xl shadow-xl overflow-auto transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0' : 'w-full max-w-3xl max-h-[90vh]'
      }`}>
        <div className="p-4 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
          <h3 className="text-lg font-medium">
            {entry ? 'Edit Journal Entry' : 'New Journal Entry'}
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
              title="Cancel"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {/* Title */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Entry Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-slate-800 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-medium transition-colors"
            />
          </div>
          
          {/* Date and Energy on the same row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Date selector */}
            <div>
              <label className="flex items-center gap-1 text-sm text-slate-300 mb-2">
                <Calendar size={14} />
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full p-2 bg-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Calendar size={16} className="text-slate-400" />
                </div>
              </div>
            </div>
            
            {/* Energy selector */}
            <div>
              <label className="flex items-center gap-1 text-sm text-slate-300 mb-2">
                <Zap size={14} />
                Energy Level
              </label>
              <div className="flex items-center p-2 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((level) => (
                    <button
                      key={level}
                      onClick={() => setEnergy(level)}
                      className={`p-1 ${energy >= level ? 'text-yellow-400' : 'text-slate-600'}`}
                    >
                      <Zap size={24} className={energy >= level ? 'fill-current' : ''} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Mood selector */}
          <div className="mb-4">
            <label className="flex items-center gap-1 text-sm text-slate-300 mb-2">
              <Smile size={14} />
              Mood
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMood(option.value)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                    mood === option.value 
                      ? `${option.bgColor} ring-2 ring-blue-400`
                      : `${option.bgColor} opacity-70 hover:opacity-90`
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-xs mt-1">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Categories */}
          <div className="mb-4">
            <label className="flex items-center gap-1 text-sm text-slate-300 mb-2">
              <FileText size={14} />
              Categories
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-slate-800 rounded-lg">
              {availableCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    categories.includes(category.id)
                      ? category.colorClass || 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Text editor */}
          <div className="mb-4">
            <label className="flex items-center gap-1 text-sm text-slate-300 mb-2">
              Journal Entry
            </label>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your thoughts here..."
              className="w-full p-3 bg-slate-800 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px] transition-colors"
            />
          </div>
          
          {/* People mentioned */}
          <div className="mb-4">
            <label className="flex items-center gap-1 text-sm text-slate-300 mb-2">
              <User size={14} />
              People Mentioned
            </label>
            <div className="p-2 bg-slate-800 rounded-lg">
              <div className="flex flex-wrap gap-2 mb-2">
                {people.map(person => (
                  <div 
                    key={person}
                    className="bg-blue-900 text-blue-200 px-2 py-1 rounded-lg text-sm flex items-center gap-1"
                  >
                    <span>{person}</span>
                    <button
                      onClick={() => removePerson(person)}
                      className="text-blue-300 hover:text-blue-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center">
                <input
                  type="text"
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                  placeholder="Add person..."
                  className="flex-1 p-2 bg-slate-700 rounded-l-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newPerson.trim()) {
                      addPerson(newPerson);
                    }
                  }}
                />
                <button
                  onClick={() => addPerson(newPerson)}
                  disabled={!newPerson.trim()}
                  className={`p-2 rounded-r-lg flex items-center justify-center ${
                    newPerson.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  } transition-colors`}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Tags */}
          <div className="mb-4">
            <label className="flex items-center gap-1 text-sm text-slate-300 mb-2">
              <Tag size={14} />
              Tags
            </label>
            <div className="p-2 bg-slate-800 rounded-lg">
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <div 
                    key={tag}
                    className="bg-indigo-900 text-indigo-200 px-2 py-1 rounded-lg text-sm flex items-center gap-1"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-indigo-300 hover:text-indigo-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  className="flex-1 p-2 bg-slate-700 rounded-l-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTag.trim()) {
                      addTag(newTag);
                    }
                  }}
                />
                <button
                  onClick={() => addTag(newTag)}
                  disabled={!newTag.trim()}
                  className={`p-2 rounded-r-lg flex items-center justify-center ${
                    newTag.trim()
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  } transition-colors`}
                >
                  <Plus size={14} />
                </button>
              </div>
              
              {/* Popular tags */}
              <div className="flex flex-wrap gap-1">
                {popularTags.filter(tag => !tags.includes(tag)).slice(0, 10).map(tag => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-indigo-900 hover:text-indigo-200 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                text.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-600 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save size={18} />
              {entry ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEditor;