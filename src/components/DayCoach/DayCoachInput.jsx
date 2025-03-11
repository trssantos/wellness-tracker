import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, X, Pause, Smile } from 'lucide-react';
import '../..//index.css'; // Your existing import

const DayCoachInput = ({ value, onChange, onSend, isLoading, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedTime, setRecordedTime] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
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
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
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
  
  // Handle speech recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.addEventListener('dataavailable', event => {
        audioChunksRef.current.push(event.data);
      });
      
      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current);
        processSpeechToText(audioBlob);
        
        // Release microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Reset recording state
        setIsRecording(false);
        setIsPaused(false);
        setRecordedTime(0);
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      });
      
      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordedTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access the microphone. Please check your browser permissions.');
    }
  };
  
  // Toggle recording pause/resume
  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordedTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      
      setIsPaused(!isPaused);
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };
  
  // Process speech to text (placeholder - actual implementation would use a service)
  const processSpeechToText = async (audioBlob) => {
    // This is a placeholder. You would typically:
    // 1. Upload the audio to a server or API
    // 2. Get back the transcribed text
    // 3. Update the input
    
    // For now, just show a message
    onChange("I just recorded audio which would be transcribed here.");
    
    // In a real implementation, you'd use something like:
    // const formData = new FormData();
    // formData.append('audio', audioBlob);
    // const response = await fetch('/api/speech-to-text', { method: 'POST', body: formData });
    // const { text } = await response.json();
    // onChange(text);
  };
  
  // Format time for recording display
  const formatRecordedTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Add emoji to input
  const addEmoji = (emoji) => {
    onChange(value + emoji);
    setShowEmojiPicker(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
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
            >
              {isPaused ? <Send size={14} /> : <Pause size={14} />}
            </button>
            
            <button
              onClick={stopRecording}
              className="p-1 rounded-full bg-white dark:bg-slate-700 text-red-500 hover:bg-slate-100 dark:hover:bg-slate-600"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      
      {/* Emoji picker dropdown */}
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-slate-700 p-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 z-10 grid grid-cols-8 gap-1">
          {['😊', '😂', '🙌', '👍', '❤️', '🎉', '🙏', '😎', 
            '🤔', '😢', '😡', '🥱', '🤮', '👀', '🔥', '✨'].map(emoji => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              className="w-8 h-8 text-lg hover:bg-slate-100 dark:hover:bg-slate-600 rounded"
            >
              {emoji}
            </button>
          ))}
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
      disabled={disabled || isLoading || isRecording}
      rows={1}
      style={{ 
        height: 'auto',
        overflowY: 'auto'
      }}
    />
    
    <div className="absolute right-2 flex gap-1">
          {/* Emoji button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 transition-colors"
            disabled={disabled || isLoading || isRecording}
          >
            <Smile size={18} />
          </button>
          
          {/* Voice input button */}
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 transition-colors"
              disabled={disabled || isLoading}
            >
              <Mic size={18} />
            </button>
          ) : null}
          
          {/* Send button */}
          <button
            onClick={handleSend}
            className={`p-2 rounded-full ${
              value.trim() && !disabled && !isLoading 
                ? 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            } transition-colors`}
            disabled={!value.trim() || disabled || isLoading}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayCoachInput;