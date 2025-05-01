// In src/components/DayCoach/DayCoachMessage.jsx

import React, { useState } from 'react';
import { MessageCircle, User, Star, ThumbsUp, ThumbsDown, Copy, Check, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import StatisticDisplay from './StatisticDisplay';
import ActionButton from './ActionButton';


// Component to display a single message in the chat
const DayCoachMessage = ({ message, onReply, onExecuteAction, displaySuggestions = true, isMobile = false }) => {
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [copied, setCopied] = useState(false);
    const [internalShowSuggestions, setInternalShowSuggestions] = useState(!isMobile);
    const [suggestionsVisible, setSuggestionsVisible] = useState(false);
    
    const isCoach = message.sender === 'coach';

    // Add this function inside the DayCoachMessage component
const parseSpecialContent = (content) => {
  if (!content) return { content, stats: null, actions: [] };
  
  // Extract stats data
  const statsRegex = /\[STATS:(.*?)\]/g;
  let statsMatch;
  let stats = null;
  let modifiedContent = content;
  
  // Find stats markers
  while ((statsMatch = statsRegex.exec(content)) !== null) {
    try {
      const statsJson = statsMatch[1];
      const statsData = JSON.parse(statsJson);
      
      // Format stats for display
      stats = Object.entries(statsData).map(([label, value]) => {
        // Determine color based on label or value
        let color = 'blue';
        if (label.includes('focus')) color = 'green';
        else if (label.includes('mood')) color = 'blue';
        else if (label.includes('stress')) color = 'purple';
        else if (value.startsWith('+')) color = 'green';
        else if (value.startsWith('-')) color = 'red';
        
        return { label, value, color };
      });
      
      // Remove the marker from content
      modifiedContent = modifiedContent.replace(statsMatch[0], '');
    } catch (e) {
      console.error('Error parsing stats data:', e);
    }
  }
  
  // Extract action data
  const actionRegex = /\[ACTION:(.*?)\]/g;
  let actionMatch;
  const actions = [];
  
  // Find action markers
  while ((actionMatch = actionRegex.exec(content)) !== null) {
    try {
      const actionJson = actionMatch[1];
      const actionData = JSON.parse(actionJson);
      actions.push(actionData);
      
      // Remove the marker from content
      modifiedContent = modifiedContent.replace(actionMatch[0], '');
    } catch (e) {
      console.error('Error parsing action data:', e);
    }
  }
  
  return { content: modifiedContent, stats, actions };
};

     // Parse special content if this is a coach message
  const { content: parsedContent, stats, actions } = 
  isCoach ? parseSpecialContent(message.content) : { content: message.content, stats: null, actions: [] };

  
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
      <div className={`max-w-[85%] xs:max-w-[85%] ${message.isError ? 'max-w-full' : ''}`}>
        {/* Message bubble */}
        <div 
          className={`relative p-3 rounded-lg overflow-hidden ${
            isCoach 
              ? message.isError 
                ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 shadow-sm' 
                : 'bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 dark:from-slate-700 dark:via-purple-900/20 dark:to-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/20 shadow-sm' 
              : 'bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white shadow-md'
          } transition-all duration-300`}
        >
          {/* Sender avatar */}
          <div className="flex items-start mb-1">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full mr-2 flex items-center justify-center ${
              isCoach 
                ? 'bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 dark:from-indigo-900/50 dark:via-purple-900/50 dark:to-blue-900/50 text-indigo-600 dark:text-indigo-300 shadow-inner' 
                : 'bg-blue-400 dark:bg-blue-500 text-white'
            }`}>
              {isCoach ? <Sparkles size={18} /> : <User size={18} />}
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Sender name and time */}
              <div className="flex items-center justify-between mb-1">
                <div className={`font-medium ${
                  isCoach 
                    ? 'text-indigo-800 dark:text-indigo-200' 
                    : 'text-white'
                }`}>
                  {isCoach ? 'Solaris' : 'You'}
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
              <div className={`prose prose-sm max-w-none break-words overflow-hidden ${
                isCoach 
                  ? 'text-slate-700 dark:text-slate-300 prose-headings:text-slate-800 dark:prose-headings:text-slate-200' 
                  : 'text-white prose-headings:text-white'
              }`}>
                <ReactMarkdown>
                  {parsedContent}
                </ReactMarkdown>
              </div>
            </div>
             {/* Add statistics display if there are stats */}
          {stats && <StatisticDisplay stats={stats} />}
          {/* Add action buttons if there are actions */}
          {actions.length > 0 && (
            <div className="mt-2">
              {actions.map((action, index) => (
                <ActionButton
                  key={index}
                  action={action}
                  onExecute={onExecuteAction}
                />
              ))}
            </div>
          )}
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
              <div className="mt-2 p-2 bg-gradient-to-r from-amber-50 to-indigo-50 dark:from-amber-900/30 dark:to-indigo-900/30 rounded-lg border border-amber-200 dark:border-amber-800/50 shadow-sm">
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
                    className="text-xs px-3 py-1.5 bg-gradient-to-r from-white to-indigo-50 dark:from-slate-700 dark:to-indigo-900/20 hover:from-indigo-50 hover:to-indigo-100 dark:hover:from-slate-600 dark:hover:to-indigo-800/30 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-700/50 transition-colors shadow-sm"
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