import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, SmilePlus, Calendar, Clock, 
  Dumbbell, Brain, Zap, Check, Bell, X, Moon, Sun,
  Lightbulb, Activity, ArrowRight, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import { fetchCoachResponse } from '../../utils/dayCoachApi';
import { 
  initializeDayCoach, 
  getDayCoachData, 
  saveDayCoachMessage, 
  markAllMessagesAsRead,
  hasUnreadMessages 
} from '../../utils/dayCoachUtils';
import DayCoachMessage from './DayCoachMessage';
import DayCoachInput from './DayCoachInput';
import DayCoachSuggestions from './DayCoachSuggestions';
import DayCoachEmptyState from './DayCoachEmptyState';
import DayCoachProfile from './DayCoachProfile';
import DayCoachAnalysis from './DayCoachAnalysis';
import DayCoachMoodTracker from './DayCoachMoodTracker';

const DayCoach = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [viewMode, setViewMode] = useState('chat'); // 'chat', 'profile', 'analysis'
  const [quickReplies, setQuickReplies] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [userData, setUserData] = useState(null);
  const [lastDataCheckTime, setLastDataCheckTime] = useState(0);
  const [lastCheckedData, setLastCheckedData] = useState({});
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const dataUpdateInterval = useRef(null);
  const checkInitiated = useRef(false);
  
  // First-time initialization
  useEffect(() => {
    const initializeCoach = async () => {
      try {
        const storage = getStorage();
        
        // Check if day coach is already initialized
        if (!storage.dayCoach) {
          setIsFirstVisit(true);
          await initializeDayCoach();
        }
        
        const coachData = getDayCoachData();
        setMessages(coachData.messages || []);
        setUserData(coachData.userData || null);
        setLastDataCheckTime(coachData.lastDataCheck || 0);
        setLastCheckedData(coachData.lastCheckedData || {});
        setIsInitialized(true);
        
        // Check for unread messages
        const unreadCount = (coachData.messages || []).filter(msg => 
          msg.sender === 'coach' && !msg.isRead
        ).length;
        
        setHasUnread(unreadCount > 0);
        
        // Set up periodic data checks (every 5 minutes)
        // Only set this up once - that's why we use the ref
        if (!checkInitiated.current) {
          checkInitiated.current = true;
          dataUpdateInterval.current = setInterval(checkForDataUpdates, 5 * 60 * 1000);
          
          // Do an initial check as well
          checkForDataUpdates();
        }
      } catch (error) {
        console.error("Error initializing day coach:", error);
        setIsInitialized(true); // Allow the component to render even if there's an error
      }
    };
    
    initializeCoach();
    
    return () => {
      if (dataUpdateInterval.current) {
        clearInterval(dataUpdateInterval.current);
      }
    };
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Mark messages as read when section is opened and view mode is chat
  useEffect(() => {
    if (viewMode === 'chat' && hasUnread) {
      markAllMessagesAsRead();
      setHasUnread(false);
    }
  }, [viewMode, hasUnread]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Check for data changes that should trigger a proactive coach message
  const checkForDataUpdates = async () => {
    console.log("Checking for data updates to trigger coach messages...");
    
    try {
      const storage = getStorage();
      const now = Date.now();
      
      // Only check if it's been at least 5 minutes since last check
      if (now - lastDataCheckTime < 5 * 60 * 1000) {
        console.log("Skipping check - less than 5 minutes since last check");
        return;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const todayData = storage[today] || {};
      
      // Check if there are significant changes that would warrant a message
      if (hasSignificantChanges(todayData, lastCheckedData)) {
        console.log("Significant data changes detected, generating proactive message");
        await generateProactiveMessage(todayData);
        
        // Update the last checked data and time
        setLastDataCheckTime(now);
        setLastCheckedData(todayData);
        
        // Also update in storage
        const coachData = getDayCoachData();
        coachData.lastDataCheck = now;
        coachData.lastCheckedData = todayData;
        storage.dayCoach = coachData;
        setStorage(storage);
      } else {
        console.log("No significant changes detected");
        
        // Still update the last checked time
        setLastDataCheckTime(now);
        
        // Update in storage
        const coachData = getDayCoachData();
        coachData.lastDataCheck = now;
        storage.dayCoach = coachData;
        setStorage(storage);
      }
    } catch (error) {
      console.error("Error checking for data updates:", error);
    }
  };
  
  // Check if there are significant changes that would warrant a coach message
  const hasSignificantChanges = (currentData, previousData) => {
    // If there's no previous data, consider it a significant change
    if (!previousData || Object.keys(previousData).length === 0) return true;
    
    // Check for new mood entries
    if (currentData.morningMood && currentData.morningMood !== previousData.morningMood) return true;
    if (currentData.eveningMood && currentData.eveningMood !== previousData.eveningMood) return true;
    
    // Check for new workouts
    if ((currentData.workout || (currentData.workouts && currentData.workouts.length > 0)) && 
        (!previousData.workout && (!previousData.workouts || previousData.workouts.length === 0))) {
      return true;
    }
    
    // Check for new journal entries
    if (currentData.notes && (!previousData.notes || currentData.notes.length > previousData.notes.length + 100)) {
      return true;
    }
    
    // Check for significant task completion changes
    if (currentData.checked && previousData.checked) {
      const currentCompleted = Object.values(currentData.checked).filter(Boolean).length;
      const previousCompleted = Object.values(previousData.checked).filter(Boolean).length;
      const totalTasks = Object.keys(currentData.checked).length;
      
      // If all tasks are completed and it wasn't the case before
      if (currentCompleted === totalTasks && previousCompleted < totalTasks) return true;
      
      // If there's a significant jump in completion (more than 3 tasks or 50%)
      if (currentCompleted - previousCompleted >= 3 || 
          (totalTasks > 0 && (currentCompleted / totalTasks) - (previousCompleted / totalTasks) >= 0.5)) {
        return true;
      }
    }
    
    // Check for focus sessions
    const storage = getStorage();
    const focusSessions = storage.focusSessions || [];
    const previousSessionCount = previousData.focusSessionCount || 0;
    
    if (focusSessions.length > previousSessionCount) {
      return true;
    }
    
    return false;
  };
  
  // Generate a proactive message based on data changes
  const generateProactiveMessage = async (todayData) => {
    setIsLoading(true);
    
    try {
      // Determine what kind of message to generate
      let messageType = 'general';
      let specificContext = null;
      
      // Check for most recent data changes to determine message type
      if (todayData.morningMood && todayData.morningMood !== lastCheckedData.morningMood) {
        messageType = 'morningMood';
        specificContext = todayData.morningMood;
      } else if (todayData.eveningMood && todayData.eveningMood !== lastCheckedData.eveningMood) {
        messageType = 'eveningMood';
        specificContext = todayData.eveningMood;
      } else if ((todayData.workout || (todayData.workouts && todayData.workouts.length > 0)) && 
                 (!lastCheckedData.workout && (!lastCheckedData.workouts || lastCheckedData.workouts.length === 0))) {
        messageType = 'workout';
      } else if (todayData.notes && (!lastCheckedData.notes || todayData.notes.length > lastCheckedData.notes.length + 100)) {
        messageType = 'journalEntry';
      } else {
        // Check for task completion
        if (todayData.checked) {
          const completedCount = Object.values(todayData.checked).filter(Boolean).length;
          const totalCount = Object.keys(todayData.checked).length;
          
          if (completedCount === totalCount && completedCount > 0) {
            messageType = 'allTasksCompleted';
          } else if (completedCount > 0 && completedCount > (lastCheckedData.completed || 0)) {
            messageType = 'progressMade';
          }
        }
        
        // Check for focus sessions
        const storage = getStorage();
        const focusSessions = storage.focusSessions || [];
        const previousSessionCount = lastCheckedData.focusSessionCount || 0;
        
        if (focusSessions.length > previousSessionCount) {
          messageType = 'focusSession';
          const latestSession = focusSessions[focusSessions.length - 1];
          specificContext = latestSession;
        }
      }
      
      // Create context for the AI
      const aiContext = {
        messageType,
        specificContext,
        currentTime: new Date().toLocaleTimeString(),
        previousMessages: messages.slice(-5) // Include last 5 messages for context
      };
      
      // Get response from AI
      const response = await fetchCoachResponse(aiContext);
      
      // Add the message to the conversation
      const newMessage = {
        id: `coach-msg-${Date.now()}`,
        sender: 'coach',
        content: response.message,
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions || [],
        isRead: false,
        context: {
          type: messageType,
          data: specificContext
        }
      };
      
      // Update messages in storage and state
      saveDayCoachMessage(newMessage);
      
      // Update state
      setMessages(prev => [...prev, newMessage]);
      setQuickReplies(response.suggestions || []);
      setHasUnread(true);
    } catch (error) {
      console.error('Error generating proactive message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle user sending a message
  const handleSendMessage = async (text = inputValue) => {
    if (!text.trim()) return;
    
    const userMessage = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    
    // Add user message to state immediately for responsive UI
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Save the user message to storage
      saveDayCoachMessage(userMessage);
      
      // Create context for AI
      const aiContext = {
        messageType: 'userQuery',
        userMessage: text,
        currentTime: new Date().toLocaleTimeString(),
        previousMessages: [...messages, userMessage].slice(-10) // Include last 10 messages for context
      };
      
      // Get AI response
      const response = await fetchCoachResponse(aiContext);
      
      // Create coach response message
      const coachMessage = {
        id: `coach-msg-${Date.now()}`,
        sender: 'coach',
        content: response.message,
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions || [],
        isRead: true, // Mark as read since user is actively chatting
        context: {
          type: 'response',
          userQuery: text
        }
      };
      
      // Save coach message
      saveDayCoachMessage(coachMessage);
      
      // Update messages in state
      setMessages(prev => [...prev, coachMessage]);
      setQuickReplies(response.suggestions || []);
    } catch (error) {
      console.error('Error sending message to coach:', error);
      
      // Add an error message
      const errorMessage = {
        id: `coach-msg-${Date.now()}`,
        sender: 'coach',
        content: "I'm sorry, I'm having trouble processing your message right now. Could you try again in a moment?",
        timestamp: new Date().toISOString(),
        isError: true,
        isRead: true
      };
      
      saveDayCoachMessage(errorMessage);
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle using a quick reply suggestion
  const handleQuickReply = (replyText) => {
    handleSendMessage(replyText);
  };
  
  // Main render function
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors w-full h-full flex flex-col">
      {/* Header with view tabs */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="text-blue-500 dark:text-blue-400" size={24} />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 transition-colors">
            Day Coach
            {hasUnread && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
                !
              </span>
            )}
          </h2>
        </div>
        
        <div className="flex items-center">
          <button
            onClick={() => setViewMode('chat')}
            className={`px-3 py-1.5 rounded-l-lg text-sm ${
              viewMode === 'chat' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors`}
          >
            Chat
          </button>
          <button
            onClick={() => setViewMode('profile')}
            className={`px-3 py-1.5 text-sm ${
              viewMode === 'profile' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors`}
          >
            Profile
          </button>
          <button
            onClick={() => setViewMode('analysis')}
            className={`px-3 py-1.5 rounded-r-lg text-sm ${
              viewMode === 'analysis' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors`}
          >
            Analysis
          </button>
        </div>
      </div>
      
      {/* First-time introduction or main content */}
      {isFirstVisit ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-xl max-w-md mx-auto text-center">
            <Sparkles className="text-blue-500 dark:text-blue-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-2">
              Meet Your ZenTracker Coach
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              I'm here to help you stay on track, analyze your patterns, and provide personalized guidance based on your data. 
              Ask me anything about your habits, mood, tasks, or focus sessions!
            </p>
            <button
              onClick={() => {
                setIsFirstVisit(false);
                handleSendMessage("Hi! I'm excited to start working with you as my coach.");
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Start Conversation
            </button>
          </div>
        </div>
      ) : (
        <>
          {!isInitialized ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {viewMode === 'chat' && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Chat messages container */}
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-2 mb-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    {messages.length === 0 ? (
                      <DayCoachEmptyState onStartChat={() => handleSendMessage("Hi! How can you help me?")} />
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <DayCoachMessage 
                            key={message.id} 
                            message={message} 
                            onReply={handleQuickReply}
                          />
                        ))}
                        
                        {isLoading && (
                          <div className="flex items-center justify-center p-4">
                            <div className="animate-pulse flex items-center space-x-2">
                              <div className="h-3 w-3 bg-blue-400 dark:bg-blue-600 rounded-full animate-bounce"></div>
                              <div className="h-3 w-3 bg-blue-400 dark:bg-blue-600 rounded-full animate-bounce delay-75"></div>
                              <div className="h-3 w-3 bg-blue-400 dark:bg-blue-600 rounded-full animate-bounce delay-150"></div>
                            </div>
                          </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                  
                  {/* Quick reply suggestions */}
                  {quickReplies && quickReplies.length > 0 && (
                    <DayCoachSuggestions 
                      suggestions={quickReplies} 
                      onSelectSuggestion={handleQuickReply}
                    />
                  )}
                  
                  {/* Input area */}
                  <DayCoachInput 
                    value={inputValue}
                    onChange={setInputValue}
                    onSend={handleSendMessage}
                    isLoading={isLoading}
                    disabled={isLoading || !isInitialized}
                  />
                </div>
              )}
              
              {viewMode === 'profile' && (
                <div className="flex-1 overflow-y-auto">
                  <DayCoachProfile userData={userData} />
                </div>
              )}
              
              {viewMode === 'analysis' && (
                <div className="flex-1 overflow-y-auto">
                  <DayCoachAnalysis />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DayCoach;