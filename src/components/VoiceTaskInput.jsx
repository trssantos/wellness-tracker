import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader, X, Check, Globe, Plus, Trash2, FolderPlus } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';

export const VoiceTaskInput = ({ date, onClose, onTaskAdded }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [language, setLanguage] = useState('en-US'); // Default to English
  const [isProcessing, setIsProcessing] = useState(false);
  
  // New state for storing multiple tasks with their categories
  const [pendingTasks, setPendingTasks] = useState([]);
  
  // State for available categories and new category input
  const [availableCategories, setAvailableCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // State for category selection modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTaskIndex, setEditingTaskIndex] = useState(null);

  // Set up speech recognition on component mount
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    try {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language;

      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        if (isListening) {
          // If we're still supposed to be listening, restart recognition
          // This helps with browser implementations that automatically stop after some silence
          recognitionInstance.start();
        }
      };

      setRecognition(recognitionInstance);
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setError('Failed to initialize speech recognition.');
    }

    return () => {
      // Clean up
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [language]); // Re-initialize when language changes

  // Load available categories when component mounts or date changes
  useEffect(() => {
    if (date) {
      loadAvailableCategories();
    }
  }, [date]);

  // Load categories for the current date
  const loadAvailableCategories = () => {
    const storage = getStorage();
    const dayData = storage[date] || {};
    let categories = [];
    
    // Check different task types in order of priority
    if (dayData.aiTasks && dayData.aiTasks.length > 0) {
      categories = dayData.aiTasks.map(cat => cat.title);
    } else if (dayData.customTasks && dayData.customTasks.length > 0) {
      categories = dayData.customTasks.map(cat => cat.title);
    } else if (dayData.defaultTasks && dayData.defaultTasks.length > 0) {
      categories = dayData.defaultTasks.map(cat => cat.title);
    } else {
      // If no categories exist yet, create default categories
      categories = ["Morning Essentials", "Work Focus", "Self Care", "Evening Routine"];
    }
    
    // Filter out Habits and Deferred categories
    categories = categories.filter(categoryName => {
      // Check for Habits category
      if (categoryName === 'Habits' || categoryName.includes('Habit')) {
        return false;
      }
      
      // Check for Deferred/Imported categories (same as in our previous protection logic)
      if (
        categoryName === 'Deferred' || 
        categoryName === 'Imported' || 
        categoryName === 'From Previous Days' ||
        categoryName.toLowerCase().includes('defer') ||
        categoryName.toLowerCase().includes('import')
      ) {
        return false;
      }
      
      return true;
    });
    
    // Always include a "Voice Tasks" category if it doesn't exist yet
    if (!categories.includes('Voice Tasks')) {
      categories.push('Voice Tasks');
    }
    
    setAvailableCategories(categories);
  };

  

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setError(null);
      setTranscript('');
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setError('Failed to start listening.');
      }
    }
  };

  const toggleLanguage = () => {
    // Toggle between English and Portuguese
    const newLang = language === 'en-US' ? 'pt-PT' : 'en-US';
    setLanguage(newLang);
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  // Add current transcript to pending tasks list
  const handleAddToPending = () => {
    if (!transcript.trim()) {
      setError('Please speak a task before adding to the list.');
      return;
    }

    // Add current transcript to pending tasks with default Voice Tasks category
    setPendingTasks([
      ...pendingTasks, 
      { 
        text: transcript.trim(), 
        category: availableCategories.length > 0 ? availableCategories[0] : 'Voice Tasks'
      }
    ]);
    
    // Clear current transcript and error
    setTranscript('');
    setError(null);
    
    // If we're listening, stop listening
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };
  
  // Open the category selection modal for a task
  const openCategorySelector = (index) => {
    setEditingTaskIndex(index);
    setShowCategoryModal(true);
  };
  
  // Select a category for a task
  const selectCategory = (categoryName) => {
    if (editingTaskIndex !== null) {
      const updatedTasks = [...pendingTasks];
      updatedTasks[editingTaskIndex].category = categoryName;
      setPendingTasks(updatedTasks);
    }
    
    // Close the modal
    setShowCategoryModal(false);
    setEditingTaskIndex(null);
  };
  
  // Handle adding a new category
  const handleAddNewCategory = () => {
    if (!newCategoryName.trim()) {
      return;
    }
    
    // Check if category already exists
    if (availableCategories.includes(newCategoryName.trim())) {
      setError('This category already exists.');
      return;
    }
    
    // Check if it's a protected category name
    if (isProtectedCategoryName(newCategoryName.trim())) {
      setError('Cannot create a category with this name. It is reserved for system use.');
      return;
    }
    
    // Add new category to available categories
    const newCategory = newCategoryName.trim();
    setAvailableCategories([...availableCategories, newCategory]);
    
    // If we're in the category modal, select this new category
    if (showCategoryModal && editingTaskIndex !== null) {
      selectCategory(newCategory);
    }
    
    // Clear input and hide it
    setNewCategoryName('');
    setShowNewCategoryInput(false);
  };
  
  // Remove a pending task by index
  const handleRemovePendingTask = (index) => {
    setPendingTasks(pendingTasks.filter((_, i) => i !== index));
  };

  // Add this function to check if a category name is protected
const isProtectedCategoryName = (categoryName) => {
  const name = categoryName.toLowerCase();
  
  // Check for Habits category
  if (name === 'habits' || name.includes('habit')) {
    return true;
  }
  
  // Check for Deferred/Imported categories
  if (
    name === 'deferred' || 
    name === 'imported' || 
    name === 'from previous days' ||
    name.includes('defer') ||
    name.includes('import')
  ) {
    return true;
  }
  
  return false;
};


  // Process all pending tasks and distribute them to their selected categories
  const handleAddAllTasks = () => {
    if (pendingTasks.length === 0 && !transcript.trim()) {
      setError('Please add at least one task to the list.');
      return;
    }
    
    // If there's still an active transcript, add it to pending tasks
    let allTasks = [...pendingTasks];
    if (transcript.trim()) {
      allTasks.push({ 
        text: transcript.trim(), 
        category: availableCategories.length > 0 ? availableCategories[0] : 'Voice Tasks'
      });
    }

    if (allTasks.length === 0) {
      setError('No tasks to add.');
      return;
    }

    setIsProcessing(true);

    try {
      const storage = getStorage();
      const dayData = storage[date] || {};
      
      // Determine what type of task list already exists for this day
      let taskType = 'default';
      
      if (dayData.aiTasks && dayData.aiTasks.length > 0) {
        taskType = 'ai';
      } else if (dayData.customTasks && dayData.customTasks.length > 0) {
        taskType = 'custom';
      }
      
      // Group tasks by category
      const tasksByCategory = {};
      allTasks.forEach(task => {
        if (!tasksByCategory[task.category]) {
          tasksByCategory[task.category] = [];
        }
        tasksByCategory[task.category].push(task.text);
      });
      
      // Handle different task list types
      if (taskType === 'ai') {
        // Add to AI tasks list
        if (!dayData.aiTasks) {
          dayData.aiTasks = [];
        }
        
        // For each category, add tasks
        Object.keys(tasksByCategory).forEach(categoryName => {
          // Find existing category or create new one
          let category = dayData.aiTasks.find(cat => cat.title === categoryName);
          
          if (!category) {
            // Create new category
            category = { title: categoryName, items: [] };
            dayData.aiTasks.push(category);
          }
          
          // Add tasks to this category
          category.items.push(...tasksByCategory[categoryName]);
        });
      } 
      else if (taskType === 'custom') {
        // Add to Custom tasks list
        if (!dayData.customTasks) {
          dayData.customTasks = [];
        }
        
        // For each category, add tasks
        Object.keys(tasksByCategory).forEach(categoryName => {
          // Find existing category or create new one
          let category = dayData.customTasks.find(cat => cat.title === categoryName);
          
          if (!category) {
            // Create new category
            category = { title: categoryName, items: [] };
            dayData.customTasks.push(category);
          }
          
          // Add tasks to this category
          category.items.push(...tasksByCategory[categoryName]);
        });
      }
      else {
        // Default tasks - create custom tasks instead
        dayData.customTasks = [];
        
        // For each category, create and add tasks
        Object.keys(tasksByCategory).forEach(categoryName => {
          dayData.customTasks.push({
            title: categoryName,
            items: tasksByCategory[categoryName]
          });
        });
        
        taskType = 'custom';
      }
      
      // Update checked state for all new tasks
      if (!dayData.checked) {
        dayData.checked = {};
      }
      
      // Mark all tasks as unchecked using category-based format
      Object.keys(tasksByCategory).forEach(categoryName => {
        tasksByCategory[categoryName].forEach(taskText => {
          const taskId = `${categoryName}|${taskText}`;
          dayData.checked[taskId] = false;
        });
      });
      
      // Save back to storage
      storage[date] = dayData;
      setStorage(storage);
      
      console.log('Voice tasks added and distributed to categories');
      
      // Reset state
      setTranscript('');
      setPendingTasks([]);
      
      // Notify parent component that we've added tasks
      if (onTaskAdded) {
        onTaskAdded(taskType);
      }
      
      // Stop listening
      if (isListening && recognition) {
        recognition.stop();
        setIsListening(false);
      }
      
      setIsProcessing(false);
      // Close the dialog after successful add
      onClose();
    } catch (error) {
      console.error('Error adding voice tasks:', error);
      setError('Failed to add tasks: ' + error.message);
      setIsProcessing(false);
    }
  };
  
  // Handle cancel - also clear transcript
  const handleCancel = () => {
    // Clear any active transcript
    setTranscript('');
    
    // If we're listening, stop listening
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }
    
    // Close the modal
    onClose();
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

  // Function to truncate category name if it's too long
  const truncateText = (text, maxLength = 12) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <dialog 
      id="voice-task-modal" 
      className="modal-base"
      onClick={(e) => e.target.id === 'voice-task-modal' && onClose()}
    >
      <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Voice Task Input</h3>
            <p className="modal-subtitle">
              {getFormattedDate()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400 transition-colors"
              title={language === 'en-US' ? 'Currently English (click to switch to Portuguese)' : 'Currently Portuguese (click to switch to English)'}
            >
              <Globe size={20} />
            </button>
            <button
              onClick={handleCancel}
              className="modal-close-button"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Language indicator */}
          <div className="text-center">
            <span className="inline-flex items-center bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
              <Globe size={14} className="mr-1" />
              {language === 'en-US' ? 'English' : 'Portuguese'}
            </span>
          </div>

          {/* Microphone button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={toggleListening}
              disabled={!recognition || isProcessing}
              className={`p-8 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white pulse-animation' 
                  : 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/40 text-blue-500 dark:text-blue-400'
              } ${(!recognition || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isListening ? <MicOff size={36} /> : <Mic size={36} />}
            </button>
          </div>

          {/* Transcript display with add button */}
          <div className="mb-4">
            <div 
              className={`bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 h-24 overflow-y-auto text-center transition-colors ${
                isListening ? 'border-2 border-blue-400 dark:border-blue-600' : 'border border-slate-200 dark:border-slate-700'
              }`}
            >
              {transcript ? (
                <p className="text-slate-700 dark:text-slate-200 transition-colors">
                  {transcript}
                </p>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 transition-colors">
                  {isListening 
                    ? 'Listening... Speak now.' 
                    : 'Press the microphone button and speak your task...'}
                </p>
              )}
            </div>
            
            {transcript && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddToPending}
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md"
                >
                  <Plus size={16} />
                  <span>Add to task list</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Pending Tasks List with Category Selection */}
          {pendingTasks.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 mb-4 border border-slate-200 dark:border-slate-700 transition-colors">
              <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-2 transition-colors">
                Tasks to add ({pendingTasks.length}):
              </h4>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {pendingTasks.map((task, index) => (
                  <li key={index} className="flex items-center justify-between text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 p-2 rounded-lg">
                    <span className="flex-1 mr-2">{task.text}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openCategorySelector(index)}
                        className="px-2 py-1 text-xs rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                      >
                        {truncateText(task.category)}
                      </button>
                      <button 
                        onClick={() => handleRemovePendingTask(index)}
                        className="p-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg text-red-600 dark:text-red-400 text-sm transition-colors">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              onClick={handleAddAllTasks}
              disabled={(pendingTasks.length === 0 && !transcript.trim()) || isProcessing}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                (pendingTasks.length === 0 && !transcript.trim()) || isProcessing
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600' 
                  : 'bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700'
              }`}
            >
              {isProcessing ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Check size={18} />
              )}
              Add {pendingTasks.length > 0 || transcript ? 
                `Tasks (${pendingTasks.length + (transcript.trim() ? 1 : 0)})` : 
                'Tasks'}
            </button>
          </div>
        </div>
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowCategoryModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-xs w-full max-h-80 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-medium text-slate-700 dark:text-slate-200">Select Category</h3>
            </div>
            
            <ul className="py-2">
              {availableCategories.map((category, idx) => (
                <li 
                  key={idx} 
                  className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300"
                  onClick={() => selectCategory(category)}
                >
                  {category}
                </li>
              ))}
              
              {/* Add new category option */}
              {!showNewCategoryInput ? (
                <li 
                  className="px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900/30 cursor-pointer text-green-600 dark:text-green-400 flex items-center gap-1 border-t border-slate-200 dark:border-slate-700"
                  onClick={() => setShowNewCategoryInput(true)}
                >
                  <FolderPlus size={16} />
                  <span>Add new category</span>
                </li>
              ) : (
                <li className="p-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter category name"
                      className="flex-1 p-2 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddNewCategory();
                        } else if (e.key === 'Escape') {
                          setShowNewCategoryInput(false);
                          setNewCategoryName('');
                        }
                      }}
                    />
                    <button
                      onClick={handleAddNewCategory}
                      className="p-2 bg-green-500 dark:bg-green-600 text-white rounded-md hover:bg-green-600 dark:hover:bg-green-700"
                      disabled={!newCategoryName.trim()}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setShowNewCategoryInput(false);
                        setNewCategoryName('');
                      }}
                      className="p-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      <style jsx>{`
        .pulse-animation {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
      `}</style>
    </dialog>
  );
};

export default VoiceTaskInput;