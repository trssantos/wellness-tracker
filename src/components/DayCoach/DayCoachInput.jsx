import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Send, Mic, X, Pause, MicOff } from 'lucide-react';
import '../..//index.css'; // Your existing import
import { clearDayCoachMessages } from '../../utils/dayCoachUtils';
import ClearChatDialog from './ClearChatDialog';
import { getStorage, setStorage } from '../../utils/storage';

const DayCoachInput = ({ value, onChange, onSend, isLoading, disabled, onShowClearDialog }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedTime, setRecordedTime] = useState(0);
  const [recognition, setRecognition] = useState(null);
  const [error, setError] = useState(null);
  
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Set up speech recognition on component mount
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.log('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

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

        // Update the input field with the transcription
        if (finalTranscript || interimTranscript) {
          onChange(value + (finalTranscript || interimTranscript));
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError(`Error: ${event.error}`);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        if (isRecording) {
          // If we're still supposed to be listening, restart recognition
          // This helps with browser implementations that automatically stop after some silence
          try {
            recognitionInstance.start();
          } catch (e) {
            // Ignore errors on restart - might happen during cleanup
          }
        }
      };

      setRecognition(recognitionInstance);
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
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
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Handle send button click
  const handleSend = () => {
    if (value.trim() && !isLoading && !disabled) {
      onSend(value);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  
  // Toggle voice recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Start voice recording
  const startRecording = () => {
    if (!recognition) return;
    
    setError(null);
    try {
      recognition.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordedTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setError('Failed to start listening.');
    }
  };
  
  // Stop voice recording
  const stopRecording = () => {
    if (!recognition) return;
    
    try {
      recognition.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Reset timer
      clearInterval(timerRef.current);
      timerRef.current = null;
      setRecordedTime(0);
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  };
  
  // Toggle recording pause/resume
  const togglePause = () => {
    if (!recognition) return;
    
    if (isPaused) {
      // Resume recording
      try {
        recognition.start();
        
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordedTime(prev => prev + 1);
        }, 1000);
      } catch (error) {
        console.error('Error resuming speech recognition:', error);
      }
    } else {
      // Pause recording
      try {
        recognition.stop();
        
        // Pause timer
        clearInterval(timerRef.current);
        timerRef.current = null;
      } catch (error) {
        console.error('Error pausing speech recognition:', error);
      }
    }
    
    setIsPaused(!isPaused);
  };
  
  // Format time for recording display
  const formatRecordedTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="mt-2 relative pb-1">
      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute -top-10 left-0 right-0 bg-red-100 dark:bg-red-900/30 p-2 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2 animate-pulse"></div>
            <span className="text-red-700 dark:text-red-400 text-sm">
              Recording {formatRecordedTime(recordedTime)}
            </span>
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={togglePause}
              className="p-1 rounded-full bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
              title={isPaused ? "Resume recording" : "Pause recording"}
            >
              {isPaused ? <Send size={14} /> : <Pause size={14} />}
            </button>
            
            <button
              onClick={stopRecording}
              className="p-1 rounded-full bg-white dark:bg-slate-700 text-red-500 hover:bg-slate-100 dark:hover:bg-slate-600"
              title="Stop recording"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute -top-10 left-0 right-0 bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {/* Input bar */}
      <div className="relative flex items-center">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Message your coach..."
          className="flex-1 p-3 pr-24 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none resize-none min-h-[44px] max-h-24 xs:max-h-32 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
          disabled={disabled || isLoading}
          rows={1}
          style={{ 
            height: 'auto',
            overflowY: 'auto'
          }}
        />
        
        <div className="absolute right-2 flex gap-1">
          {/* Clear chat button */}
          <button
            onClick={onShowClearDialog}
            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="Clear chat history"
          >
            <Trash2 size={18} />
          </button>
          
          {/* Voice input button */}
          <button
            onClick={toggleRecording}
            className={`p-2 rounded-full ${
              isRecording
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400'
            } transition-colors`}
            disabled={disabled || isLoading}
            title={isRecording ? "Stop recording" : "Start voice input"}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          
          {/* Send button */}
          <button
            onClick={handleSend}
            className={`p-2 rounded-full ${
              value.trim() && !disabled && !isLoading 
                ? 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            } transition-colors`}
            disabled={!value.trim() || disabled || isLoading}
            title="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayCoachInput;