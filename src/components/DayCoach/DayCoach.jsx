import React, { useState, useEffect, useRef } from 'react';
import { Bot,User, BarChart2,Trash2,
  MessageCircle, Send, SmilePlus, Calendar, Clock, 
  Dumbbell, Brain, Zap, Check, Bell, X, Moon, Sun,
  Lightbulb, Activity, ArrowRight, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import { fetchCoachResponse } from '../../utils/dayCoachApi';
import DateSeparator from './DateSeparator';
import { 
  initializeDayCoach, 
  getDayCoachData, 
  saveDayCoachMessage, 
  markAllMessagesAsRead,
  hasUnreadMessages} from '../../utils/dayCoachUtils';
import DayCoachMessage from './DayCoachMessage';
import DayCoachInput from './DayCoachInput';
import DayCoachSuggestions from './DayCoachSuggestions';
import DayCoachEmptyState from './DayCoachEmptyState';
import DayCoachProfile from './DayCoachProfile';
import DayCoachAnalysis from './DayCoachAnalysis';
import DayCoachMoodTracker from './DayCoachMoodTracker';
import { clearDayCoachMessages } from '../../utils/dayCoachUtils';
import ClearChatDialog from './ClearChatDialog';
import SolarisRobot from './SolarisRobot';

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
  const componentMountTime = useRef(Date.now());

  const [showClearDialog, setShowClearDialog] = useState(false);
  const [robotMode, setRobotMode] = useState(false);

  
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

  const handleClearChat = () => {
    if (clearDayCoachMessages()) {
      // Update local state
      const storage = getStorage();
      setMessages(storage.dayCoach?.messages || []);
      setShowClearDialog(false);
    }
  };
  

  // Group messages by date
const groupMessagesByDate = (messages) => {
  // Sort messages by timestamp
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  // Group by date
  const groups = [];
  let currentDate = null;
  let currentGroup = null;
  
  sortedMessages.forEach(message => {
    const messageDate = new Date(message.timestamp).toDateString();
    
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      currentGroup = {
        date: message.timestamp,
        messages: []
      };
      groups.push(currentGroup);
    }
    
    currentGroup.messages.push(message);
  });
  
  return groups;
};

// Check if a date is today
const isToday = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};
  
  // Check for data changes that should trigger a proactive coach message
  const checkForDataUpdates = async () => {
    console.log("Checking for data updates to trigger coach messages...");
    
    try {
      const storage = getStorage();
      const now = Date.now();
      
      // Don't check again if the component just mounted (within the last 10 seconds)
      // This prevents triggering on each visit to the coach section
      if (now - componentMountTime.current < 10000) {
        console.log("Skipping check - component just mounted");
        return;
      }
      
      // Only check if it's been at least 30 minutes since last check
      if (now - lastDataCheckTime < 30 * 60 * 1000) {
        console.log("Skipping check - less than 30 minutes since last check");
        return;
      }
      
      // Check if the last message was from the coach (don't send consecutive coach messages)
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender === 'coach') {
        console.log("Last message was from coach - waiting for user response");
        return;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const todayData = storage[today] || {};
      
      // Create deep copies of objects for comparison to avoid reference issues
      const currentDataCopy = JSON.parse(JSON.stringify(todayData));
      const lastCheckedDataCopy = JSON.parse(JSON.stringify(lastCheckedData));
      
      // Check if there are significant changes that would warrant a message
      if (hasSignificantChanges(currentDataCopy, lastCheckedDataCopy)) {
        console.log("Significant data changes detected, generating proactive message");
        await generateProactiveMessage(todayData);
        
        // Update the last checked data and time (use deep copy to avoid reference issues)
        setLastDataCheckTime(now);
        setLastCheckedData(JSON.parse(JSON.stringify(todayData)));
        
        // Also update in storage
        const coachData = getDayCoachData();
        coachData.lastDataCheck = now;
        coachData.lastCheckedData = JSON.parse(JSON.stringify(todayData));
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
    // If there's no previous data at all, consider it a significant change
    if (!previousData || Object.keys(previousData).length === 0) return true;
    
    // Ignore focus sessions for detecting changes (since they're triggering too often)
    // We'll handle these separately
    
    // Check for new mood entries (that weren't there before)
    if ((currentData.morningMood && !previousData.morningMood) ||
        (currentData.eveningMood && !previousData.eveningMood)) {
      return true;
    }
    
    // Check for substantial new journal entries (more than 100 characters longer)
    if (currentData.notes && 
        (!previousData.notes || currentData.notes.length > previousData.notes.length + 100)) {
      return true;
    }
    
    // Check for workout completion (only for new workouts)
    if ((currentData.workout && !previousData.workout) || 
        (currentData.workouts && (!previousData.workouts || 
         currentData.workouts.length > previousData.workouts.length))) {
      return true;
    }
    
    // Check for significant task completion changes
    if (currentData.checked && previousData.checked) {
      const currentCompleted = Object.values(currentData.checked).filter(Boolean).length;
      const previousCompleted = Object.values(previousData.checked).filter(Boolean).length;
      const totalTasks = Object.keys(currentData.checked).length;
      
      // If there's a significant jump in completion (more than 50% change)
      if (totalTasks > 0 && 
          Math.abs((currentCompleted / totalTasks) - (previousCompleted / totalTasks)) >= 0.5) {
        return true;
      }
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
      <div className="sticky top-0 z-20 bg-white dark:bg-slate-800 pt-4 pb-3 px-4 sm:px-6 -mx-4 sm:-mx-6 mb-3 border-b border-slate-200 dark:border-slate-700">
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-2">
      <MessageCircle className="text-indigo-500 dark:text-indigo-400" size={24} />
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 transition-colors">
        Solaris
        {hasUnread && (
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-amber-500 text-white rounded-full">
            !
          </span>
        )}
      </h2>
    </div>

    {/* Add the Robot Mode button */}
    <div className="flex items-center gap-2">
      <button
        onClick={() => setRobotMode(true)}
        className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-md transition-all transform hover:scale-105"
        title="Enter Robot Mode"
        aria-label="Enter Robot Mode"
      >
        <Bot size={18} />
      </button>
    
    {/* Navigation tabs */}
    <div className="flex rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 h-8">
      <button
        onClick={() => setViewMode('chat')}
        className={`h-full px-3 flex items-center justify-center ${
          viewMode === 'chat' 
            ? 'bg-indigo-500 text-white' 
            : 'text-slate-600 dark:text-slate-300'
        } transition-colors`}
        title="Chat"
      >
        <MessageCircle size={14} className="sm:hidden" />
        <span className="hidden sm:inline text-sm">Chat</span>
      </button>
      <button
        onClick={() => setViewMode('profile')}
        className={`h-full px-3 flex items-center justify-center ${
          viewMode === 'profile' 
            ? 'bg-indigo-500 text-white' 
            : 'text-slate-600 dark:text-slate-300'
        } transition-colors`}
        title="Profile"
      >
        <User size={14} className="sm:hidden" />
        <span className="hidden sm:inline text-sm">Profile</span>
      </button>
      <button
        onClick={() => setViewMode('analysis')}
        className={`h-full px-3 flex items-center justify-center ${
          viewMode === 'analysis' 
            ? 'bg-indigo-500 text-white' 
            : 'text-slate-600 dark:text-slate-300'
        } transition-colors`}
        title="Analysis"
      >
        <BarChart2 size={14} className="sm:hidden" />
        <span className="hidden sm:inline text-sm">Analysis</span>
      </button>
    </div>
    </div>
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
  <div className="flex-1 flex flex-col min-h-0 max-w-full">
    {/* Chat messages container - taller on mobile */}
    <div 
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto p-2 mb-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg transition-colors h-[calc(100vh-170px)] max-w-full"
    >
      <div className="max-w-full">
      {messages.length === 0 ? (
  <DayCoachEmptyState onStartChat={() => handleSendMessage("Hi! How can you help me?")} />
) : (
  <div className="space-y-4 max-w-full">
    {groupMessagesByDate(messages).map((group, groupIndex) => (
      <React.Fragment key={`group-${groupIndex}`}>
        <DateSeparator 
          date={group.date} 
          isToday={isToday(group.date)} 
        />
        {group.messages.map((message, index) => (
          <DayCoachMessage 
            key={message.id} 
            message={message} 
            onReply={handleQuickReply}
            displaySuggestions={
              message.sender === 'coach' && 
              index === group.messages.length - 1 &&
              groupIndex === groupMessagesByDate(messages).length - 1 &&
              !quickReplies.length
            }
            isMobile={window.innerWidth < 640}
          />
        ))}
      </React.Fragment>
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
                    onShowClearDialog={() => setShowClearDialog(true)}
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


      {/* Clear chat confirmation dialog */}
<ClearChatDialog 
  isOpen={showClearDialog}
  onClose={() => setShowClearDialog(false)}
  onConfirm={handleClearChat}
/>

{robotMode && (
  <SolarisRobot
    messages={messages}
    onSendMessage={(message) => {
      // Create a user message immediately for responsiveness
      const userMessage = {
        id: `user-msg-${Date.now()}`,
        sender: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      
      // Add user message to state immediately
      setMessages(prev => [...prev, userMessage]);
      
      // Save the message to storage
      saveDayCoachMessage(userMessage);
      
      // Process with AI - this should trigger your existing AI flow
      setIsLoading(true);
      
      // Create context for AI
      const aiContext = {
        messageType: 'userQuery',
        userMessage: message,
        currentTime: new Date().toLocaleTimeString(),
        previousMessages: [...messages, userMessage].slice(-10) // Include last 10 messages for context
      };
      
      // Get AI response using your existing fetchCoachResponse
      fetchCoachResponse(aiContext)
        .then(response => {
          console.log("Robot received AI response:", response);
          
          // Create coach response message
          const coachMessage = {
            id: `coach-msg-${Date.now()}`,
            sender: 'coach',
            content: response.message,
            timestamp: new Date().toISOString(),
            suggestions: response.suggestions || [],
            isRead: true,
            context: {
              type: 'response',
              userQuery: message
            }
          };
          
          // Save coach message
          saveDayCoachMessage(coachMessage);
          
          // Update messages in state
          setMessages(prev => [...prev, coachMessage]);
          setQuickReplies(response.suggestions || []);
        })
        .catch(error => {
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
        })
        .finally(() => {
          setIsLoading(false);
        });
    }}
    onClose={() => setRobotMode(false)}
  />
)}

    </div>
  );
};

export default DayCoach;