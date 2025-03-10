import { getStorage, setStorage } from './storage';

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

// Extract names mentioned in notes for context
export const extractNamesFromNotes = (notes) => {
  if (!notes) return [];
  
  // This is a simplified approach that assumes names are proper nouns
  // A more sophisticated NLP approach would be better in a real implementation
  
  // Split the text into words and look for capitalized words not at the start of sentences
  const words = notes.split(/\s+/);
  const names = new Set();
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i].replace(/[.,!?;:()]/g, '');
    
    // If the word starts with a capital letter and isn't at the start of a sentence
    if (word.length > 0 && 
        word[0] === word[0].toUpperCase() && 
        words[i-1].match(/[.!?]\s*$/) === null) {
      names.add(word);
    }
  }
  
  return Array.from(names);
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