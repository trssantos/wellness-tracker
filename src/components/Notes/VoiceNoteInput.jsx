import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader, X, Check, Globe, Save, AlertTriangle } from 'lucide-react';

const VoiceNoteInput = ({ onClose, onSave, initialNote = null }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [language, setLanguage] = useState('en-US'); // Default to English
  const [isProcessing, setIsProcessing] = useState(false);
  const [noteTitle, setNoteTitle] = useState(initialNote?.title || '');
  const [noteContent, setNoteContent] = useState(initialNote?.content || '');
  const [activeField, setActiveField] = useState('title'); // 'title' or 'content'
  
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
      
      // Apply the captured transcript to the active field
      if (transcript) {
        applyTranscript();
      }
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
  
  // Apply the transcript to the currently active field
  const applyTranscript = () => {
    if (!transcript.trim()) return;
    
    if (activeField === 'title') {
      setNoteTitle(transcript);
      // Auto-advance to content field
      setActiveField('content');
    } else {
      // For content, append rather than replace
      setNoteContent(prev => {
        if (prev && prev.trim()) {
          return `${prev}\n${transcript}`;
        }
        return transcript;
      });
    }
    
    // Clear the transcript after applying
    setTranscript('');
  };
  
  // Handle active field change
  const handleFieldChange = (field) => {
    // If we're listening, apply the current transcript before changing
    if (isListening && transcript) {
      applyTranscript();
    }
    
    setActiveField(field);
  };

  // Handle save
  const handleSave = () => {
    // First apply any pending transcript
    if (transcript) {
      applyTranscript();
    }
    
    // Validate title
    if (!noteTitle.trim()) {
      setError('Please provide a title for your note.');
      return;
    }
    
    setIsProcessing(true);
    
    // Prepare note data
    const noteData = {
      title: noteTitle.trim(),
      content: noteContent.trim(),
      ...(initialNote || {}) // Include any existing note properties if editing
    };
    
    // Call the parent's save handler
    onSave(noteData);
    
    // Stop listening if active
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-slate-800 dark:text-slate-100">
              {initialNote ? 'Edit Note with Voice' : 'Create Note with Voice'}
            </h2>
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
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Language indicator */}
            <div className="text-center">
              <span className="inline-flex items-center bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                <Globe size={14} className="mr-1" />
                {language === 'en-US' ? 'English' : 'Portuguese'}
              </span>
            </div>
            
            {/* Title input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Title
                {activeField === 'title' && (
                  <span className="ml-2 text-xs text-blue-500">(Active for voice)</span>
                )}
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Note title..."
                  onClick={() => handleFieldChange('title')}
                />
                <button
                  onClick={() => handleFieldChange('title')}
                  className={`ml-2 p-2 rounded-lg ${
                    activeField === 'title' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Mic size={16} />
                </button>
              </div>
            </div>
            
            {/* Content input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Content
                {activeField === 'content' && (
                  <span className="ml-2 text-xs text-blue-500">(Active for voice)</span>
                )}
              </label>
              <div className="flex">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="textarea-field flex-1 h-32"
                  placeholder="Note content..."
                  onClick={() => handleFieldChange('content')}
                />
                <button
                  onClick={() => handleFieldChange('content')}
                  className={`ml-2 p-2 rounded-lg ${
                    activeField === 'content' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Mic size={16} />
                </button>
              </div>
            </div>
            
            {/* Current transcript */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Current voice input:
              </label>
              <div className={`p-3 rounded-lg ${
                isListening ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 pulse-animation' : 'bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
              }`}>
                <p className="text-slate-700 dark:text-slate-300 min-h-8">
                  {transcript || (isListening ? 'Listening...' : 'Press the microphone button below and speak')}
                </p>
              </div>
            </div>
            
            {/* Microphone button */}
            <div className="flex justify-center my-4">
              <button
                onClick={toggleListening}
                className={`p-4 rounded-full transition ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white pulse-animation' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 p-3 rounded-lg text-red-600 dark:text-red-400 text-sm">
                <div className="flex items-start">
                  <AlertTriangle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            {/* Instruction */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-blue-700 dark:text-blue-300 text-sm">
              <ul className="list-disc pl-5 space-y-1">
                <li>Click on title or content field to activate it for voice input</li>
                <li>Press the microphone button to start/stop listening</li>
                <li>Your spoken words will be added to the active field</li>
                <li>You can also type directly into the fields at any time</li>
              </ul>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing || (!noteTitle.trim() && !transcript)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                  isProcessing || (!noteTitle.trim() && !transcript)
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600' 
                    : 'bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700'
                }`}
              >
                {isProcessing ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Save Note
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .pulse-animation {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceNoteInput;