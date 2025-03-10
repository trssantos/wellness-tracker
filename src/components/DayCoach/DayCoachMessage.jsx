import React, { useState } from 'react';
import { MessageCircle, User, Star, ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Component to display a single message in the chat
const DayCoachMessage = ({ message, onReply, displaySuggestions = true }) => {
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [copied, setCopied] = useState(false);
    const [internalShowSuggestions, setInternalShowSuggestions] = useState(true);
    
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
  
  return (
    <div 
      className={`flex ${isCoach ? 'justify-start' : 'justify-end'} mb-4 animate-fadeIn`}
      style={{
        animationDelay: '0.1s',
        animationDuration: '0.3s'
      }}
    >
      <div className={`max-w-[85%] ${message.isError ? 'max-w-full' : ''}`}>
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
              <div className={`prose prose-sm max-w-none ${
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
          
          {/* Message actions (for coach messages only) */}
          {isCoach && !message.isError && (
            <div className="flex justify-end gap-1 mt-2">
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
        
        {/* Quick reply suggestions */}
        {isCoach && message.suggestions && message.suggestions.length > 0 && internalShowSuggestions && displaySuggestions && (
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
      </div>
    </div>
  );
};

export default DayCoachMessage;