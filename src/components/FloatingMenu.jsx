import React, { useState, useRef, useEffect } from 'react';
import { Plus, Mic, X, Calendar, MessageCircle, Send, Sparkles } from 'lucide-react';
import { askSolaris } from '../utils/dayCoachUtils';
import { formatDateForStorage } from '../utils/dateUtils';

// Ask Solaris Dialog Component
const AskSolarisDialog = ({ isOpen, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [sentUserMessage, setSentUserMessage] = useState('');
  const [hasInteraction, setHasInteraction] = useState(false); // Track if user has interacted
  const inputRef = useRef(null);
  const responseContainerRef = useRef(null);
  
  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    
    // Reset state when dialog closes
    if (!isOpen) {
      setInputValue('');
      setResponse(null);
      setSentUserMessage('');
      setIsLoading(false);
      // Don't reset hasInteraction so we remember if user has had a conversation before
    }
  }, [isOpen]);
  
  // Scroll to bottom when response changes
  useEffect(() => {
    if (responseContainerRef.current && (isLoading || response)) {
      responseContainerRef.current.scrollTop = responseContainerRef.current.scrollHeight;
    }
  }, [isLoading, response]);
  
  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    // Save the user message before clearing input
    const userMessage = inputValue.trim();
    setSentUserMessage(userMessage);
    setInputValue('');
    setIsLoading(true);
    setHasInteraction(true);
    
    try {
      // Call the askSolaris function from dayCoachUtils.js
      const result = await askSolaris(userMessage, { module: 'quickAccess' });
      
      // Show the response
      setResponse(result);
    } catch (error) {
      console.error('Error asking Solaris:', error);
      setResponse({
        message: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        suggestions: []
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuickReply = (reply) => {
    setInputValue(reply);
    // Wait a moment for the UI to update before submitting
    setTimeout(() => handleSubmit(), 100);
  };
  
  // Function to render the "thinking" animation
  const renderThinking = () => (
    <div className="flex flex-col items-start mt-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 dark:from-indigo-900/50 dark:via-purple-900/50 dark:to-blue-900/50 text-indigo-600 dark:text-indigo-300 shadow-inner flex items-center justify-center">
          <Sparkles size={18} />
        </div>
        <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
          Solaris
        </div>
      </div>
      
      <div className="ml-10 p-3 bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 dark:from-slate-700 dark:via-purple-900/20 dark:to-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/20 rounded-lg shadow-sm">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
  
  // Welcome greeting component
  const renderWelcomeGreeting = () => (
    <div className="flex flex-col items-start animate-fadeIn">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 dark:from-indigo-900/50 dark:via-purple-900/50 dark:to-blue-900/50 text-indigo-600 dark:text-indigo-300 shadow-inner flex items-center justify-center">
          <Sparkles size={18} />
        </div>
        <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
          Solaris
        </div>
      </div>
      
      <div className="ml-10 p-3 bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 dark:from-slate-700 dark:via-purple-900/20 dark:to-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/20 rounded-lg shadow-sm max-w-[85%]">
        <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
          👋 Hi there! I'm Solaris, your wellness guide.
          
          Ask me about your daily progress, habits, tasks, mood patterns, or anything else on your mind. I'm here to help you stay on track with your goals.
          
          What can I help you with today?
        </p>
      </div>
      
      {/* Initial suggested questions */}
      <div className="ml-10 mt-2 flex flex-wrap gap-2">
        <button
          onClick={() => handleQuickReply("How am I doing today?")}
          className="text-xs px-3 py-1.5 bg-gradient-to-r from-white to-indigo-50 dark:from-slate-700 dark:to-indigo-900/20 hover:from-indigo-50 hover:to-indigo-100 dark:hover:from-slate-600 dark:hover:to-indigo-800/30 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-700/50 transition-colors shadow-sm"
        >
          How am I doing today?
        </button>
        <button
          onClick={() => handleQuickReply("What should I focus on next?")}
          className="text-xs px-3 py-1.5 bg-gradient-to-r from-white to-indigo-50 dark:from-slate-700 dark:to-indigo-900/20 hover:from-indigo-50 hover:to-indigo-100 dark:hover:from-slate-600 dark:hover:to-indigo-800/30 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-700/50 transition-colors shadow-sm"
        >
          What should I focus on next?
        </button>
        <button
          onClick={() => handleQuickReply("Any suggestions for today?")}
          className="text-xs px-3 py-1.5 bg-gradient-to-r from-white to-indigo-50 dark:from-slate-700 dark:to-indigo-900/20 hover:from-indigo-50 hover:to-indigo-100 dark:hover:from-slate-600 dark:hover:to-indigo-800/30 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-700/50 transition-colors shadow-sm"
        >
          Any suggestions for today?
        </button>
      </div>
    </div>
  );
  
  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose} // Add onClick to the overlay to close when clicking outside
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-lg max-w-md w-full mx-4 max-h-[80vh] flex flex-col transition-transform duration-300" 
        style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)' }}
        onClick={(e) => e.stopPropagation()} // Stop propagation to prevent closing when clicking inside
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-500 dark:text-indigo-400" size={18} />
            <h3 className="font-medium text-slate-800 dark:text-slate-100">Ask Solaris</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content area with auto-scroll */}
        <div ref={responseContainerRef} className="flex-1 p-4 overflow-y-auto">
          {/* Show welcome message if no interaction yet */}
          {!hasInteraction && !response && !isLoading && !sentUserMessage && renderWelcomeGreeting()}
          
          {/* Only show the user message if we have sent something */}
          {sentUserMessage && (
            <div className="flex items-end justify-end mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white p-3 rounded-lg shadow-md max-w-[85%]">
                {sentUserMessage}
              </div>
            </div>
          )}
          
          {/* Loading animation */}
          {isLoading && renderThinking()}
          
          {/* Response */}
          {response && !isLoading && (
            <div className="flex flex-col items-start animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 dark:from-indigo-900/50 dark:via-purple-900/50 dark:to-blue-900/50 text-indigo-600 dark:text-indigo-300 shadow-inner flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                  Solaris
                </div>
              </div>
              
              <div className="ml-10 p-3 bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 dark:from-slate-700 dark:via-purple-900/20 dark:to-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/20 rounded-lg shadow-sm max-w-[85%]">
                <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                  {response.message}
                </p>
              </div>
              
              {/* Quick reply suggestions */}
              {response.suggestions && response.suggestions.length > 0 && (
                <div className="ml-10 mt-2 flex flex-wrap gap-2">
                  {response.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(suggestion)}
                      className="text-xs px-3 py-1.5 bg-gradient-to-r from-white to-indigo-50 dark:from-slate-700 dark:to-indigo-900/20 hover:from-indigo-50 hover:to-indigo-100 dark:hover:from-slate-600 dark:hover:to-indigo-800/30 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-700/50 transition-colors shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="w-full p-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`absolute right-1 p-2 rounded-full ${
                !inputValue.trim() || isLoading
                  ? 'text-slate-400 dark:text-slate-500'
                  : 'text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Enhanced FloatingMenu component with Ask Solaris integration
export const FloatingMenu = ({ onDaySelect, onVoiceInput }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [askSolarisOpen, setAskSolarisOpen] = useState(false);

  const handleMainClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDaySelect = () => {
    // Get today's date in YYYY-MM-DD format
    const today = formatDateForStorage(new Date());
    onDaySelect(today);
    setIsExpanded(false);
  };

  const handleVoiceInput = () => {
    // Get today's date in YYYY-MM-DD format
    const today = formatDateForStorage(new Date());
    onVoiceInput(today);
    setIsExpanded(false);
  };
  
  const handleAskSolaris = () => {
    setAskSolarisOpen(true);
    setIsExpanded(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {isExpanded && (
          <>
            {/* Ask Solaris Option */}
            <button
              onClick={handleAskSolaris}
              className="p-4 rounded-full shadow-lg text-white bg-purple-500 dark:bg-purple-600 hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors"
              aria-label="Ask Solaris"
            >
              <MessageCircle size={24} />
            </button>
            
            {/* Voice Input Option */}
            <button
              onClick={handleVoiceInput}
              className="p-4 rounded-full shadow-lg text-white bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
              aria-label="Add task with voice"
            >
              <Mic size={24} />
            </button>
            
            {/* Today's Tasks Option */}
            <button
              onClick={handleDaySelect}
              className="p-4 rounded-full shadow-lg text-white bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
              aria-label="View today's tasks"
            >
              <Calendar size={24} />
            </button>
          </>
        )}
        
        {/* Main Button */}
        <button
          onClick={handleMainClick}
          className="p-4 rounded-full shadow-lg text-white bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
        >
          {isExpanded ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>
      
      {/* Ask Solaris Dialog */}
      <AskSolarisDialog 
        isOpen={askSolarisOpen} 
        onClose={() => setAskSolarisOpen(false)} 
      />
    </>
  );
};