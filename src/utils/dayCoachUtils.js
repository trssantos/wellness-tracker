import { getStorage, setStorage } from './storage';
import { fetchCoachResponse } from './dayCoachApi';
import { formatDateForStorage } from './dateUtils';

// Initialize the day coach system
export const initializeDayCoach = async () => {
  try {
    const storage = getStorage();
    
    // Initialize coach data structure if it doesn't exist
    if (!storage.dayCoach) {
      storage.dayCoach = {
        messages: [],
        userData: {
          name: 'User', // Default name
          preferences: {
            notifications: true,
            proactiveMessages: true,
            dataAnalysis: true
          }
        },
        lastDataCheck: Date.now(),
        lastCheckedData: {},
        version: '1.0'
      };
      
      // Add welcome message
      const welcomeMessage = {
        id: `coach-msg-${Date.now()}`,
        sender: 'coach',
        content: "Hey there! 👋 I'm your ZenTracker buddy. I'm here to chat about your wellbeing, habits, and goals. I'll keep an eye on your data and offer insights when helpful. What's on your mind today?",
        timestamp: new Date().toISOString(),
        suggestions: [
          "What can you help me with?",
          "Show me insights from my data",
          "How am I doing with my habits?"
        ],
        isRead: false,
        context: {
          type: 'welcome'
        }
      };
      
      storage.dayCoach.messages.push(welcomeMessage);
      
      // Initialize summaries structure
      storage.dayCoachSummaries = {
        weeklySummaries: {},
        monthlySummaries: {},
        lastSummarized: new Date().toISOString()
      };
      
      setStorage(storage);
      
      // Return the initialized data
      return storage.dayCoach;
    }
    
    return storage.dayCoach;
  } catch (error) {
    console.error('Error initializing day coach:', error);
    throw error;
  }
};

// Get day coach data from storage
export const getDayCoachData = () => {
  try {
    const storage = getStorage();
    return storage.dayCoach || { messages: [], userData: null };
  } catch (error) {
    console.error('Error getting day coach data:', error);
    return { messages: [], userData: null };
  }
};

// Save a message to the day coach conversation
export const saveDayCoachMessage = (message) => {
  try {
    const storage = getStorage();
    
    if (!storage.dayCoach) {
      initializeDayCoach();
    }
    
    // Add the message to the conversation
    storage.dayCoach.messages.push(message);
    
    // Limit conversation history to prevent storage issues
    // Keep at most 100 messages
    if (storage.dayCoach.messages.length > 100) {
      storage.dayCoach.messages = storage.dayCoach.messages.slice(-100);
    }
    
    setStorage(storage);
    return true;
  } catch (error) {
    console.error('Error saving day coach message:', error);
    return false;
  }
};

// Add a new function to dayCoachUtils.js to notify Solaris about journal entries
export const handleJournalEntryAdded = (entryData) => {
  try {
    // Use the same handleDataChange function but with a specific journalEntry type
    const dateStr = entryData.date || entryData.timestamp.split('T')[0];
    
    handleDataChange(dateStr, 'journal', { 
      entryData: entryData,
      type: 'journalEntry'
    });
    
    return true;
  } catch (error) {
    console.error('Error handling journal entry notification:', error);
    return false;
  }
};

// Mark all messages as read
export const markAllMessagesAsRead = () => {
  try {
    const storage = getStorage();
    
    if (!storage.dayCoach) return false;
    
    // Mark all messages as read
    storage.dayCoach.messages = storage.dayCoach.messages.map(msg => ({
      ...msg,
      isRead: true
    }));
    
    setStorage(storage);
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};

// Check if user has unread messages
export const hasUnreadMessages = () => {
  try {
    const storage = getStorage();
    
    if (!storage.dayCoach) return false;
    
    // Check if any messages are unread
    return storage.dayCoach.messages.some(msg => 
      msg.sender === 'coach' && !msg.isRead
    );
  } catch (error) {
    console.error('Error checking unread messages:', error);
    return false;
  }
};

// Save user preferences for the day coach
export const saveUserPreferences = (preferences) => {
  try {
    const storage = getStorage();
    
    if (!storage.dayCoach) {
      initializeDayCoach();
    }
    
    // Update preferences
    storage.dayCoach.userData.preferences = {
      ...storage.dayCoach.userData.preferences,
      ...preferences
    };
    
    setStorage(storage);
    return true;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return false;
  }
};


// Remove old data from storage to prevent bloat
export const cleanupOldData = () => {
  try {
    const storage = getStorage();
    
    if (!storage.dayCoach) return;
    
    // Limit the number of messages
    if (storage.dayCoach.messages.length > 100) {
      storage.dayCoach.messages = storage.dayCoach.messages.slice(-100);
    }
    
    // Clean up old summaries (keep only last 6 months)
    if (storage.dayCoachSummaries) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      // Filter monthly summaries
      for (const monthKey in storage.dayCoachSummaries.monthlySummaries) {
        // Extract year and month from key (YYYY-MM format)
        const [year, month] = monthKey.split('-').map(Number);
        const summaryDate = new Date(year, month - 1, 1);
        
        if (summaryDate < sixMonthsAgo) {
          delete storage.dayCoachSummaries.monthlySummaries[monthKey];
        }
      }
      
      // Filter weekly summaries
      for (const weekKey in storage.dayCoachSummaries.weeklySummaries) {
        // Extract year and week from key (YYYY-Www format)
        const match = weekKey.match(/^(\d{4})-W(\d{2})$/);
        if (match) {
          const [, year, week] = match;
          
          // Approximate date for this week
          const approximateDate = new Date(Number(year), 0, 1 + (Number(week) - 1) * 7);
          
          if (approximateDate < sixMonthsAgo) {
            delete storage.dayCoachSummaries.weeklySummaries[weekKey];
          }
        }
      }
    }
    
    setStorage(storage);
  } catch (error) {
    console.error('Error cleaning up old data:', error);
  }
};


// New functions for proactive messaging
export const checkForSignificantChanges = (currentData = {}, previousData = {}, dateStr) => {
  // If no previous data exists at all, don't trigger automatically on first use
  if (!previousData || Object.keys(previousData).length === 0) {
    if (Object.keys(currentData).length > 0) {
      // This is the first data for this date - save a baseline but don't trigger
      return { shouldTrigger: false, triggerType: null, currentData };
    }
    return { shouldTrigger: false, triggerType: null };
  }
  
  // Morning mood and energy (only trigger once)
  if (currentData.morningMood && !previousData.morningMood) {
    return { 
      shouldTrigger: true, 
      triggerType: 'morningMood',
      specificContext: { 
        mood: currentData.morningMood, 
        energy: currentData.morningEnergy || 0
      }
    };
  }
  
  // Evening mood and energy (only trigger once)
  if (currentData.eveningMood && !previousData.eveningMood) {
    return { 
      shouldTrigger: true, 
      triggerType: 'eveningMood',
      specificContext: { 
        morningMood: currentData.morningMood,
        morningEnergy: currentData.morningEnergy || 0,
        eveningMood: currentData.eveningMood, 
        eveningEnergy: currentData.eveningEnergy || 0
      }
    };
  }
  
  // Journal entries - trigger only for substantial new content
  if (currentData.notes && 
      (!previousData.notes || currentData.notes.length > previousData.notes.length + 100)) {
    return { 
      shouldTrigger: true, 
      triggerType: 'journalEntry',
      specificContext: { 
        notes: currentData.notes
      }
    };
  }

   // NEW: Check for new journal entries
   if (currentData.journalChange && currentData.journalChange.entryData) {
    return { 
      shouldTrigger: true, 
      triggerType: 'journalEntry',
      specificContext: currentData.journalChange.entryData
    };
  }
  
  // New workout added
  if ((currentData.workout && !previousData.workout) || 
      (currentData.workouts && (!previousData.workouts || 
       currentData.workouts.length > previousData.workouts.length))) {
    return { 
      shouldTrigger: true, 
      triggerType: 'workout',
      specificContext: { 
        workout: currentData.workout || (currentData.workouts ? currentData.workouts[currentData.workouts.length-1] : null)
      }
    };
  }
  
  // New sleep data
  if (currentData.sleep && !previousData.sleep) {
    return { 
      shouldTrigger: true, 
      triggerType: 'sleep',
      specificContext: { 
        sleep: currentData.sleep
      }
    };
  }
  
  // Significant task completion change (all tasks completed or major progress)
  if (currentData.checked && previousData.checked) {
    const currentCompleted = Object.values(currentData.checked).filter(Boolean).length;
    const previousCompleted = Object.values(previousData.checked).filter(Boolean).length;
    const totalTasks = Object.keys(currentData.checked).length;
    
    // All tasks completed
    if (currentCompleted === totalTasks && currentCompleted > 0 && previousCompleted < totalTasks) {
      return { 
        shouldTrigger: true, 
        triggerType: 'allTasksCompleted',
        specificContext: {
          tasks: Object.keys(currentData.checked).filter(task => currentData.checked[task])
        }
      };
    }
    
    // Major progress (at least 3 new completions or 50% jump from previous)
    if (currentCompleted > previousCompleted + 2 || 
        (totalTasks > 0 && previousCompleted/totalTasks < 0.5 && currentCompleted/totalTasks >= 0.5)) {
      return { 
        shouldTrigger: true, 
        triggerType: 'progressMade',
        specificContext: {
          completed: currentCompleted,
          total: totalTasks,
          recentlyCompleted: Object.keys(currentData.checked)
            .filter(task => currentData.checked[task] && (!previousData.checked[task] || !previousData.checked[task]))
        }
      };
    }
  }
  
  // Time-based triggers for natural conversation times
  const now = new Date();
  const currentHour = now.getHours();
  
  // Morning greeting (8-9 AM) - only once per day
  if (currentHour >= 8 && currentHour < 9 && !previousData.morningGreetingSent) {
    return { 
      shouldTrigger: true, 
      triggerType: 'timeBasedGreeting',
      specificContext: { 
        timeOfDay: 'morning',
        date: dateStr
      }
    };
  }
  
  // Evening check-in (7-8 PM) - only once per day
  if (currentHour >= 19 && currentHour < 20 && !previousData.eveningGreetingSent) {
    return { 
      shouldTrigger: true, 
      triggerType: 'timeBasedGreeting',
      specificContext: { 
        timeOfDay: 'evening',
        date: dateStr
      }
    };
  }
  
  return { shouldTrigger: false, triggerType: null };
};

// Function to handle data changes from other modules
export const handleDataChange = (dateStr, moduleType, data) => {
  try {
    const storage = getStorage();
    
    // Get today's date in YYYY-MM-DD format
    const today = formatDateForStorage(new Date());
    
    // Skip triggering for past dates (dateStr is before today)
    if (dateStr < today) {
      console.log(`Skipping proactive message for past date: ${dateStr}`);
      
      // Still update the last checked data
      if (!storage.dayCoach) {
        initializeDayCoach();
      }
      
      if (!storage.dayCoach.lastCheckedData) {
        storage.dayCoach.lastCheckedData = {};
      }
      
      storage.dayCoach.lastCheckedData[dateStr] = { ...data };
      setStorage(storage);
      
      return false;
    }
    
    // Rest of the existing function remains unchanged
    const previousData = storage.dayCoach?.lastCheckedData?.[dateStr] || {};
    const currentData = storage[dateStr] || {};
    
    // Check for significant changes
    const { shouldTrigger, triggerType, specificContext } = 
      checkForSignificantChanges(currentData, previousData, dateStr);
    
    // Update the last checked data
    if (!storage.dayCoach) {
      initializeDayCoach();
    }
    
    if (!storage.dayCoach.lastCheckedData) {
      storage.dayCoach.lastCheckedData = {};
    }
    
    storage.dayCoach.lastCheckedData[dateStr] = { ...currentData };
    setStorage(storage);
    
    // If we should trigger a message, do so
    if (shouldTrigger && triggerType) {
      // Only trigger if the user hasn't received a message in the last hour
      // AND we haven't sent a message about this specific trigger type today
      const lastMessageTime = storage.dayCoach.lastMessageTime || 0;
      const now = Date.now();
      const hourInMs = 60 * 60 * 1000;
      
      const recentTriggers = storage.dayCoach.recentTriggers || {};
      const triggeredToday = recentTriggers[dateStr]?.includes(triggerType);
      
      if (!triggeredToday && now - lastMessageTime > hourInMs) {
        generateProactiveMessage(triggerType, specificContext, dateStr);
        
        // Record this trigger
        if (!recentTriggers[dateStr]) {
          recentTriggers[dateStr] = [];
        }
        recentTriggers[dateStr].push(triggerType);
        storage.dayCoach.recentTriggers = recentTriggers;
        storage.dayCoach.lastMessageTime = now;
        setStorage(storage);
      }
    }
    
    return shouldTrigger;
  } catch (error) {
    console.error('Error handling data change:', error);
    return false;
  }
};

// Cross-module integration
export const askSolaris = async (question, context = {}) => {
  try {
    // Initialize if needed
    const storage = getStorage();
    if (!storage.dayCoach) {
      await initializeDayCoach();
    }
    
    // Create user message
    const userMessage = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      content: question,
      timestamp: new Date().toISOString(),
      fromModule: context.module || null
    };
    
    // Save to storage
    saveDayCoachMessage(userMessage);
    
    // Create AI context
    const aiContext = {
      messageType: 'userQuery',
      userMessage: question,
      moduleContext: context,
      currentTime: new Date().toLocaleTimeString()
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
      isRead: false,
      context: {
        type: 'response',
        userQuery: question,
        fromModule: context.module || null
      }
    };
    
    // Save to storage
    saveDayCoachMessage(coachMessage);
    
    // Set unread flag
    storage.dayCoach.hasUnreadMessages = true;
    setStorage(storage);
    
    // Return the response
    return {
      message: response.message,
      suggestions: response.suggestions || []
    };
  } catch (error) {
    console.error('Error asking Solaris:', error);
    return {
      message: "I'm sorry, I'm having trouble answering right now. Please try again later.",
      suggestions: ["How are you feeling today?", "What's on your mind?", "Can I help with anything else?"]
    };
  }
};

// Helper for generating proactive messages
const generateProactiveMessage = async (triggerType, specificContext, dateStr) => {
  try {
    // Create context for the AI
    const aiContext = {
      messageType: triggerType,
      specificContext,
      currentTime: new Date().toLocaleTimeString()
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
        type: triggerType,
        data: specificContext
      }
    };
    
    // Update messages in storage and state
    saveDayCoachMessage(newMessage);
    
    // Update hasUnread
    const storage = getStorage();
    if (storage.dayCoach) {
      storage.dayCoach.hasUnreadMessages = true;
      setStorage(storage);
    }
    
    // Return message for possible use
    return newMessage;
  } catch (error) {
    console.error('Error generating proactive message:', error);
    return null;
  }
};

export const clearDayCoachMessages = () => {
  try {
    const storage = getStorage();
    
    if (!storage.dayCoach) {
      return false;
    }
    
    // Keep user data and other settings but clear messages
    const userData = storage.dayCoach.userData || null;
    const lastDataCheck = storage.dayCoach.lastDataCheck || Date.now();
    const lastCheckedData = storage.dayCoach.lastCheckedData || {};
    const version = storage.dayCoach.version || '1.0';
    
    // Create a fresh dayCoach object with empty messages
    storage.dayCoach = {
      messages: [],
      userData,
      lastDataCheck,
      lastCheckedData,
      version,
      hasUnreadMessages: false
    };
    
    // Add a welcome message
    const welcomeMessage = {
      id: `coach-msg-${Date.now()}`,
      sender: 'coach',
      content: "Chat history has been cleared. I'm here if you need anything else!",
      timestamp: new Date().toISOString(),
      suggestions: [
        "What can you help me with?",
        "Show me insights from my data",
        "How am I doing with my habits?"
      ],
      isRead: true,
      context: {
        type: 'welcome'
      }
    };
    
    storage.dayCoach.messages.push(welcomeMessage);
    setStorage(storage);
    
    return true;
  } catch (error) {
    console.error('Error clearing day coach messages:', error);
    return false;
  }
};