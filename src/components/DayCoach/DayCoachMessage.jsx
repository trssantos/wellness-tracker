// In src/components/DayCoach/DayCoachMessage.jsx

import React, { useState } from 'react';
import { MessageCircle, User, Star, ThumbsUp, ThumbsDown, Copy, Check, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Component to display a single message in the chat
const DayCoachMessage = ({ message, onReply, displaySuggestions = true, isMobile = false }) => {
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [copied, setCopied] = useState(false);
    const [internalShowSuggestions, setInternalShowSuggestions] = useState(!isMobile);
    const [suggestionsVisible, setSuggestionsVisible] = useState(false);
    
    const isCoach = message.sender === 'coach';
  
  // Format timestamp for display
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };
  
  // Handle copying message to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Handle liking a message
  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
    // Could add analytics tracking here
  };
  
  // Handle disliking a message
  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
    // Could add analytics tracking here
  };
  
  // Toggle suggestions visibility
  const toggleSuggestions = () => {
    setSuggestionsVisible(!suggestionsVisible);
  };
  
  return (
    <div 
      className={`flex ${isCoach ? 'justify-start' : 'justify-end'} mb-4 animate-fadeIn`}
      style={{
        animationDelay: '0.1s',
        animationDuration: '0.3s'
      }}
    >
      <div className={`max-w-[95%] xs:max-w-[85%] ${message.isError ? 'max-w-full' : ''}`}>
        {/* Message bubble */}
        <div 
          className={`relative p-3 rounded-lg shadow-sm ${
            isCoach 
              ? message.isError 
                ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200' 
                : 'bg-white dark:bg-slate-700' 
              : 'bg-blue-500 dark:bg-blue-600 text-white'
          }`}
        >
          {/* Sender avatar */}
          <div className="flex items-start mb-1">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full mr-2 flex items-center justify-center ${
              isCoach 
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                : 'bg-blue-400 dark:bg-blue-500 text-white'
            }`}>
              {isCoach ? <MessageCircle size={18} /> : <User size={18} />}
            </div>
            
            <div className="flex-1">
              {/* Sender name and time */}
              <div className="flex items-center justify-between mb-1">
                <div className={`font-medium ${
                  isCoach 
                    ? 'text-slate-800 dark:text-slate-200' 
                    : 'text-white'
                }`}>
                  {isCoach ? 'Coach' : 'You'}
                </div>
                <div className={`text-xs ${
                  isCoach 
                    ? 'text-slate-500 dark:text-slate-400' 
                    : 'text-white/80'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
              
              {/* Message content */}
              <div className={`prose prose-sm max-w-none break-words ${
                isCoach 
                  ? 'text-slate-700 dark:text-slate-300 prose-headings:text-slate-800 dark:prose-headings:text-slate-200' 
                  : 'text-white prose-headings:text-white'
              }`}>
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
          
          {/* Message actions with suggestions button for mobile */}
          {isCoach && !message.isError && (
            <div className="flex justify-end gap-1 mt-2">
              {/* Suggestions button for mobile */}
              {isMobile && message.suggestions && message.suggestions.length > 0 && displaySuggestions && (
                <button
                  onClick={toggleSuggestions}
                  className={`p-1 rounded-full ${
                    suggestionsVisible 
                      ? 'bg-amber-100 dark:bg-amber-800/40 text-amber-600 dark:text-amber-400' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-600 text-amber-500 dark:text-amber-400'
                  } transition-colors`}
                  title="Show suggestions"
                >
                  <Sparkles size={14} />
                </button>
              )}
              
              <button 
                onClick={handleCopy}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 transition-colors"
                title={copied ? "Copied!" : "Copy message"}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              
              <button 
                onClick={handleLike}
                className={`p-1 rounded-full ${
                  liked 
                    ? 'text-green-500 dark:text-green-400' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                } transition-colors`}
                title="Like this response"
              >
                <ThumbsUp size={14} />
              </button>
              
              <button 
                onClick={handleDislike}
                className={`p-1 rounded-full ${
                  disliked 
                    ? 'text-red-500 dark:text-red-400' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                } transition-colors`}
                title="Dislike this response"
              >
                <ThumbsDown size={14} />
              </button>
            </div>
          )}
        </div>
        
        {/* Quick reply suggestions - different display for mobile vs desktop */}
        {isCoach && message.suggestions && message.suggestions.length > 0 && displaySuggestions && (
          <>
            {/* Mobile: collapsible suggestions */}
            {isMobile && suggestionsVisible && (
              <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800/50">
                <div className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-2 flex items-center">
                  <Sparkles size={12} className="mr-1" />
                  Suggested replies:
                </div>
                <div className="flex flex-col gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="text-xs px-3 py-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors shadow-sm text-left"
                      onClick={() => {
                        onReply(suggestion);
                        setSuggestionsVisible(false);
                        setInternalShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Desktop: inline suggestions */}
            {!isMobile && internalShowSuggestions && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="text-xs px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-600 transition-colors shadow-sm"
                    onClick={() => {
                      onReply(suggestion);
                      setInternalShowSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DayCoachMessage;