import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader, X, Check, Globe } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';

export const VoiceTaskInput = ({ date, onClose, onTaskAdded }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [language, setLanguage] = useState('en-US'); // Default to English
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleAddTask = () => {
    if (!transcript.trim()) {
      setError('Please speak a task before adding.');
      return;
    }

    setIsProcessing(true);

    try {
      const storage = getStorage();
      const dayData = storage[date] || {};
      const taskText = transcript.trim();
      
      // Determine what type of task list already exists for this day
      let taskType = 'default';
      
      if (dayData.aiTasks && dayData.aiTasks.length > 0) {
        taskType = 'ai';
      } else if (dayData.customTasks && dayData.customTasks.length > 0) {
        taskType = 'custom';
      }
      
      // Handle different task list types
      if (taskType === 'ai') {
        // Add to AI tasks list
        if (!dayData.aiTasks) {
          dayData.aiTasks = [];
        }
        
        // Find or create "Custom" category in AI tasks
        let customCategory = dayData.aiTasks.find(cat => cat.title === 'Custom' || cat.title === 'Voice Tasks');
        
        if (!customCategory) {
          // Create new Custom category
          customCategory = { title: 'Custom', items: [] };
          dayData.aiTasks.push(customCategory);
        }
        
        // Add the new task
        customCategory.items.push(taskText);
      } 
      else if (taskType === 'custom') {
        // Add to Custom tasks list
        if (!dayData.customTasks) {
          dayData.customTasks = [];
        }
        
        // Find or create "Custom" category
        let customCategory = dayData.customTasks.find(cat => cat.title === 'Custom' || cat.title === 'Voice Tasks');
        
        if (!customCategory) {
          // Create new Custom category
          customCategory = { title: 'Custom', items: [] };
          dayData.customTasks.push(customCategory);
        }
        
        // Add the new task
        customCategory.items.push(taskText);
      }
      else {
        // Default tasks - create custom tasks instead
        dayData.customTasks = [
          {
            title: 'Custom',
            items: [taskText]
          }
        ];
      }
      
      // Update checked state
      if (!dayData.checked) {
        dayData.checked = {};
      }
      dayData.checked[taskText] = false;
      
      // Save back to storage
      storage[date] = dayData;
      setStorage(storage);
      
      console.log('Voice task added:', taskText);
      console.log('Updated storage for date:', date, storage[date]);
      
      // Reset transcript
      setTranscript('');
      
      // Notify parent component that we've added a task
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
      console.error('Error adding voice task:', error);
      setError('Failed to add task: ' + error.message);
      setIsProcessing(false);
    }
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
              onClick={onClose}
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

          {/* Transcript display */}
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

          {/* Error display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg text-red-600 dark:text-red-400 text-sm transition-colors">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="btn-secondary flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              onClick={handleAddTask}
              disabled={!transcript.trim() || isProcessing}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                !transcript.trim() || isProcessing
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600' 
                  : 'bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700'
              }`}
            >
              {isProcessing ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Check size={18} />
              )}
              Add Task
            </button>
          </div>
        </div>
      </div>

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