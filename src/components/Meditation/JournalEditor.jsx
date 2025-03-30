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

  // Get the mood emoji
  const getMoodEmoji = (moodLevel) => {
    switch (moodLevel) {
      case 1: return '😔';
      case 2: return '😕';
      case 3: return '😐';
      case 4: return '🙂';
      case 5: return '😊';
      default: return '😐';
    }
  };

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
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-auto transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0' : 'w-full max-w-3xl max-h-[90vh]'
      }`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
            {entry ? 'Edit Journal Entry' : 'New Journal Entry'}
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={onCancel}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
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
              className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-lg font-medium transition-colors"
            />
          </div>
          
          {/* Date, Mood and Energy selectors */}
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Date picker */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar size={14} />
                Date
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
              />
            </div>
            
            {/* Mood selector */}
            <div className="flex-1 min-w-[120px]">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Smile size={14} />
                Mood
              </label>
              <div className="flex justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                {[1, 2, 3, 4, 5].map(moodLevel => (
                  <button
                    key={moodLevel}
                    onClick={() => setMood(moodLevel)}
                    className={`text-2xl p-1 rounded-full transition-colors ${
                      mood === moodLevel 
                        ? 'bg-white dark:bg-slate-600 scale-110 transform'
                        : 'hover:bg-white/50 dark:hover:bg-slate-600/50'
                    }`}
                  >
                    {getMoodEmoji(moodLevel)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Energy selector */}
            <div className="flex-1 min-w-[120px]">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Zap size={14} />
                Energy
              </label>
              <div className="flex justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                {[1, 2, 3].map(energyLevel => (
                  <button
                    key={energyLevel}
                    onClick={() => setEnergy(energyLevel)}
                    className={`p-2 rounded-full transition-colors flex items-center justify-center ${
                      energy === energyLevel 
                        ? 'bg-white dark:bg-slate-600 scale-110 transform'
                        : 'hover:bg-white/50 dark:hover:bg-slate-600/50'
                    }`}
                    title={`Energy level ${energyLevel}`}
                  >
                    <div 
                      className={`w-6 h-6 rounded-full ${
                        energyLevel === 1 ? 'bg-red-500' : 
                        energyLevel === 2 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                    ></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Categories */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText size={14} />
              Categories
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              {availableCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    categories.includes(category.id)
                      ? category.colorClass || 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300'
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Journal Entry
            </label>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your thoughts here..."
              className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 min-h-[200px] transition-colors"
            />
          </div>
          
          {/* People mentioned */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <User size={14} />
              People Mentioned
            </label>
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <div className="flex flex-wrap gap-2 mb-2">
                {people.map(person => (
                  <div 
                    key={person}
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    <span>{person}</span>
                    <button
                      onClick={() => removePerson(person)}
                      className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200"
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
                  className="flex-1 p-2 bg-white dark:bg-slate-600 rounded-l-lg text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
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
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                  } transition-colors`}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Tag size={14} />
              Tags
            </label>
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <div 
                    key={tag}
                    className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200"
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
                  className="flex-1 p-2 bg-white dark:bg-slate-600 rounded-l-lg text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
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
                      ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
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
                    className="text-xs px-2 py-0.5 bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
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
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                text.trim()
                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
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