import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Calendar, RefreshCw, Book, TrendingUp, AlertTriangle,
  Smile, Brain, Zap, Dumbbell, Clock, FileText, Loader, 
  BarChart2, ChevronDown, Info, Sparkles, MoreHorizontal
} from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import { generateContent } from '../../utils/ai-service';
import ReactMarkdown from 'react-markdown';
import { formatDateForStorage } from '../../utils/dateUtils';

const DayCoachAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [hasEnoughData, setHasEnoughData] = useState(true);
  const [error, setError] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0); // Added to force re-renders
  
  // Reference to track if component is mounted
  const isMounted = useRef(true);
  const dropdownRef = useRef(null);
  const overflowRef = useRef(null);
  const generationCompleted = useRef(false);
  
  // Define primary and overflow tabs
  const primaryTabs = ['overview', 'mood', 'focus'];
  const overflowTabs = ['habits', 'workouts', 'journaling'];
  
  // Force re-render if generation completed flag is set
  useEffect(() => {
    if (generationCompleted.current) {
      console.log("Generation completed, forcing reload of analysis");
      loadSavedAnalysis();
      generationCompleted.current = false;
    }
  }, [forceUpdate]);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryMenu(false);
      }
      if (overflowRef.current && !overflowRef.current.contains(event.target)) {
        setShowOverflowMenu(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      isMounted.current = false;
    };
  }, []);
  
  // Load saved analysis when component mounts or tab/range changes
  useEffect(() => {
    loadSavedAnalysis();
    checkDataAvailability();
  }, [activeTab, timeRange]);
  
  const loadSavedAnalysis = useCallback(() => {
    try {
      console.log("Loading saved analysis for", activeTab, timeRange);
      const storage = getStorage();
      const savedAnalytics = storage.dayCoachAnalytics || {};
      
      console.log("Current analysis state:", savedAnalytics[activeTab]?.[timeRange] ? "Found" : "Not found");
      
      // Set analysis state with a fresh copy to ensure React detects the change
      setAnalysis({...savedAnalytics});
      
      if (savedAnalytics[activeTab]?.[timeRange]?.timestamp) {
        setLastUpdated(savedAnalytics[activeTab][timeRange].timestamp);
      } else {
        setLastUpdated(null);
      }
      
      // Clear loading state if it was set
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading saved analysis:', error);
      setError(`Error loading saved analysis: ${error.message}`);
      setIsLoading(false);
    }
  }, [activeTab, timeRange]);

  // Check if there's enough data to generate a report
  const checkDataAvailability = () => {
    try {
      const storage = getStorage();
      
      // Get date ranges based on timeframe
      const today = new Date();
      const dates = getDateRangeForTimeframe(today, timeRange);
      
      // Check if there's sufficient data based on the active category
      const hasData = checkCategoryDataAvailability(storage, dates, activeTab);
      
      setHasEnoughData(hasData);
    } catch (error) {
      console.error('Error checking data availability:', error);
      setError(`Error checking data availability: ${error.message}`);
      setHasEnoughData(false);
    }
  };

  // Get a list of dates for the selected timeframe
  const getDateRangeForTimeframe = (today, timeframe) => {
    const dates = [];
    let startDate;
    
    switch (timeframe) {
      case 'day':
        // For daily reports, we only need today
        return [formatDateForStorage(today)];
      
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
    }
    
    // Generate array of dates in the range
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      dates.push(formatDateForStorage(d));
    }
    
    return dates;
  };

  // Check if there's enough data for a specific category
  const checkCategoryDataAvailability = (storage, dates, category) => {
    // For each category, define what counts as "enough data"
    switch (category) {
      case 'overview':
        // For overview, check if there's any data in any relevant category
        return (
          checkCategoryDataAvailability(storage, dates, 'mood') ||
          checkCategoryDataAvailability(storage, dates, 'focus') ||
          checkCategoryDataAvailability(storage, dates, 'habits') ||
          checkCategoryDataAvailability(storage, dates, 'workouts') ||
          checkCategoryDataAvailability(storage, dates, 'journaling')
        );
      
      case 'mood':
        // Check if there are any mood entries in the timeframe
        return dates.some(date => {
          const dayData = storage[date];
          return dayData && (dayData.morningMood || dayData.eveningMood || dayData.mood);
        });
      
      case 'focus':
        // Check if there are focus sessions in the timeframe
        if (!storage.focusSessions || storage.focusSessions.length === 0) {
          return false;
        }
        
        const startDate = new Date(dates[0]);
        const endDate = new Date(dates[dates.length - 1]);
        endDate.setHours(23, 59, 59, 999); // End of the day
        
        return storage.focusSessions.some(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= startDate && sessionDate <= endDate;
        });
      
      case 'habits':
        // Check if there are habit entries in the timeframe
        if (!storage.habits || storage.habits.length === 0) {
          return false;
        }
        
        // Check if any habits have data in the timeframe
        return dates.some(date => {
          const dayData = storage[date];
          return dayData && dayData.habitProgress && Object.keys(dayData.habitProgress).length > 0;
        });
      
      case 'workouts':
        // Check if there are workout entries in the timeframe
        if (storage.completedWorkouts && storage.completedWorkouts.length > 0) {
          const startDate = new Date(dates[0]);
          const endDate = new Date(dates[dates.length - 1]);
          endDate.setHours(23, 59, 59, 999); // End of the day
          
          return storage.completedWorkouts.some(workout => {
            const workoutDate = new Date(workout.date);
            return workoutDate >= startDate && workoutDate <= endDate;
          });
        }
        
        // Also check daily workout entries
        return dates.some(date => {
          const dayData = storage[date];
          return dayData && (dayData.workout || (dayData.workouts && dayData.workouts.length > 0));
        });
      
      case 'journaling':
        // Check if there are journal entries in the timeframe
        return dates.some(date => {
          const dayData = storage[date];
          return dayData && dayData.notes && dayData.notes.trim().length > 0;
        });
        
      default:
        return false;
    }
  };
  
  const generateReport = async (tab, range) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Generating report for ${tab} - ${range}...`);
      
      const storage = getStorage();
      const userData = collectUserData(storage, range);
      
      // Check if userData is valid
      if (!userData || Object.keys(userData).length === 0) {
        throw new Error('No user data available for analysis');
      }
      
      const prompt = generatePrompt(userData, tab, range);
      
      console.log(`Sending AI request for ${tab} ${range} analysis...`);
      
      // Wrap the AI request in its own try-catch for specific error handling
      const result = await generateContent(prompt);
      
      console.log(`Received ${result?.length || 0} characters from AI`);
      
      if (!result || typeof result !== 'string' || result.trim().length === 0) {
        throw new Error('AI returned empty response');
      }
      
      // CRITICAL FIX: Simplify the storage update logic
      try {
        console.log("Saving report to storage");
        
        // Create a simpler storage structure
        let savedAnalytics = storage.dayCoachAnalytics || {};
        
        // Make sure the tab object exists
        if (!savedAnalytics[tab]) {
          savedAnalytics[tab] = {};
        }
        
        // Create the report object
        const newReport = {
          text: result.trim(),
          timestamp: new Date().toISOString()
        };
        
        // Update the specific entry with direct assignment
        savedAnalytics[tab][range] = newReport;
        
        // Save to storage with the new data
        storage.dayCoachAnalytics = savedAnalytics;
        setStorage(storage);
        
        // Update generation timestamp
        storage.dayCoachAnalyticsLastGeneration = new Date().toISOString();
        setStorage(storage);
        
        // Update component state directly
        setAnalysis(savedAnalytics);
        setLastUpdated(newReport.timestamp);
        
        console.log("Report saved successfully");
        return true;
      } catch (storageError) {
        console.error("Error saving to storage:", storageError);
        
        // Even if storage fails, try to update the UI state directly
        setAnalysis(prev => {
          const updated = {...prev};
          if (!updated[tab]) updated[tab] = {};
          updated[tab][range] = {
            text: result.trim(),
            timestamp: new Date().toISOString()
          };
          return updated;
        });
        
        throw new Error(`Storage error: ${storageError.message}`);
      }
    } catch (error) {
      console.error(`Error generating ${tab} ${range} report:`, error);
      setError(`Error: ${error.message}`);
      return false;
    } finally {
      // Use a short timeout to ensure state updates have time to process
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };
  
  const handleGenerateCurrentReport = () => {
    // First set loading state
    setIsLoading(true);
    setError(null);
    
    // Use a timeout to separate state updates
    setTimeout(async () => {
      try {
        await generateReport(activeTab, timeRange);
      } catch (err) {
        console.error('Error during report generation:', err);
        setError(`Failed to generate report: ${err.message}`);
      } finally {
        // Final safety to ensure loading state is cleared
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    }, 100);
  };
  
  const collectUserData = (storage, range) => {
    const today = new Date();
    const result = {};
    
    let startDate;
    switch (range) {
      case 'day':
        // For daily reports, get today and yesterday
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
    }
    
    // Collect daily data
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDateForStorage(d);
      if (storage[dateStr]) {
        result[dateStr] = storage[dateStr];
      }
    }
    
    // Add global data
    if (storage.habits) result.habits = storage.habits;
    
    // Add focus sessions, filtered by date range
    if (storage.focusSessions && Array.isArray(storage.focusSessions)) {
      const startTime = startDate.getTime();
      const endTime = today.getTime();
      
      result.focusSessions = storage.focusSessions.filter(session => {
        if (!session.startTime) return false;
        const sessionTime = new Date(session.startTime).getTime();
        return sessionTime >= startTime && sessionTime <= endTime;
      });
    }
    
    // Add workouts, filtered by date range
    if (storage.completedWorkouts && Array.isArray(storage.completedWorkouts)) {
      const startTime = startDate.getTime();
      const endTime = today.getTime();
      
      result.workouts = storage.completedWorkouts.filter(workout => {
        if (!workout.date) return false;
        const workoutTime = new Date(workout.date).getTime();
        return workoutTime >= startTime && workoutTime <= endTime;
      });
    }
    
    return result;
  };
  
  const generatePrompt = (userData, tab, range) => {
    // Common prompt elements
    const timeframeText = range === 'day' ? 'day' : range === 'week' ? 'week' : 'month';
    const basePrompt = `Analyze the following user data for the last ${timeframeText} and provide FOCUSED insights ONLY about ${tab}.
    
IMPORTANT FORMATTING REQUIREMENTS:
1. Keep your analysis BRIEF (max 150 words)
2. Address the user directly using "you" and "your" (not "the user" or "they")
3. Use a warm, conversational tone
4. Format with Markdown: use ## for section headers and bullet points where appropriate
5. Use 1-2 emojis per section to make it visually engaging
6. Do NOT include generic advice that could apply to anyone

CRITICAL: Focus EXCLUSIVELY on ${tab} information. DO NOT discuss other categories unless they directly impact ${tab}.`;
    
    let specificPrompt = '';
    switch (tab) {
      case 'overview':
        specificPrompt = `Provide a brief overview highlighting only the most significant insights from different aspects of wellbeing (mood, energy, tasks, workouts, habits).

For this overview:
- Highlight only 2-3 key insights that stand out the most
- Note any meaningful correlations between different data points
- Focus on patterns instead of individual data points
- Keep sections very short (1-2 sentences each)`;
        break;
        
      case 'mood':
        specificPrompt = `Focus EXCLUSIVELY on mood and energy patterns. DO NOT discuss other areas unless they directly correlate with mood changes.

For this mood analysis:
- Identify clear mood patterns and fluctuations
- Note factors that appear to positively or negatively impact emotional wellbeing
- Look for correlations between specific activities and mood changes
- Analyze both morning and evening mood entries to identify daily patterns
- Keep your analysis focused solely on emotional wellbeing`;
        break;
        
      case 'focus':
        specificPrompt = `Focus EXCLUSIVELY on focus sessions and productivity patterns. DO NOT discuss other areas unless they directly impact focus.

For this focus analysis:
- Analyze focus session duration, frequency, and effectiveness
- Identify optimal times of day for concentration
- Note any factors that appear to help or hinder focus
- Examine patterns in task completion during focus periods
- Keep your analysis specifically about productivity and concentration`;
        break;
        
      case 'habits':
        specificPrompt = `Focus EXCLUSIVELY on habit tracking and consistency. DO NOT discuss other areas unless they directly relate to habit formation.

For this habit analysis:
- Evaluate habit streaks and consistency
- Identify patterns in habit completion
- Note which habits are strongest and which need improvement
- Analyze how different days of the week affect habit adherence
- Keep your analysis specifically about habit formation and maintenance`;
        break;
        
      case 'workouts':
        specificPrompt = `Focus EXCLUSIVELY on workout patterns and physical activity. DO NOT discuss other areas unless they directly impact exercise habits.

For this workout analysis:
- Analyze workout frequency, types, duration, and intensity
- Identify patterns in physical activity throughout the ${timeframeText}
- Note rest days and recovery patterns
- Examine consistency and variety in the exercise routine
- Keep your analysis specifically about physical activity and fitness`;
        break;
        
      case 'journaling':
        specificPrompt = `Focus EXCLUSIVELY on journal entries and the thoughts, feelings, and experiences the user has recorded. DO NOT discuss other areas unless they are mentioned in the journal or directly correlated.

For this journaling analysis:
- Identify recurring themes, topics, or concerns in the journal entries
- Note any social connections or relationships mentioned and their apparent significance
- Detect any emotional patterns or shifts expressed in writing
- Look for correlations between journaled thoughts and other tracked data (mood, energy, task completion, etc.)
- Identify any personal goals, aspirations, or challenges mentioned
- Pay special attention to names of people, places, or events that appear multiple times
- Analyze how the journaling content may reflect the user's overall wellbeing
- Keep your analysis thoughtful, nuanced, and respectful of the personal nature of journal entries`;
        break;
        
      default:
        specificPrompt = `Provide concise insights about user's wellbeing, focusing on the most relevant data points.`;
    }
    
    // Data is too large to log the entire object, so we'll summarize it
    const dataKeys = Object.keys(userData);
    console.log(`Generated prompt includes ${dataKeys.length} data keys: ${dataKeys.join(', ')}`);
    
    // Create a simplified dataset with just dates as keys to keep the prompt shorter
    const simplifiedUserData = {};
    for (const key in userData) {
      if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Only include data that's relevant to the current tab
        const relevantData = {};
        
        if (tab === 'overview' || tab === 'mood') {
          if (userData[key].morningMood) relevantData.morningMood = userData[key].morningMood;
          if (userData[key].eveningMood) relevantData.eveningMood = userData[key].eveningMood;
          if (userData[key].mood) relevantData.mood = userData[key].mood;
          if (userData[key].morningEnergy) relevantData.morningEnergy = userData[key].morningEnergy;
          if (userData[key].eveningEnergy) relevantData.eveningEnergy = userData[key].eveningEnergy;
          if (userData[key].energyLevel) relevantData.energyLevel = userData[key].energyLevel;
        }
        
        if (tab === 'overview' || tab === 'habits') {
          if (userData[key].habitProgress) relevantData.habitProgress = userData[key].habitProgress;
        }
        
        if (tab === 'overview' || tab === 'workouts') {
          if (userData[key].workout) relevantData.workout = userData[key].workout;
          if (userData[key].workouts) relevantData.workouts = userData[key].workouts;
        }
        
        if (tab === 'overview' || tab === 'journaling' || tab === 'mood') {
          if (userData[key].notes) relevantData.notes = userData[key].notes;
        }
        
        simplifiedUserData[key] = relevantData;
      } else if (key === 'habits' && (tab === 'overview' || tab === 'habits')) {
        simplifiedUserData.habits = userData.habits;
      } else if (key === 'focusSessions' && (tab === 'overview' || tab === 'focus')) {
        simplifiedUserData.focusSessions = userData.focusSessions;
      } else if (key === 'workouts' && (tab === 'overview' || tab === 'workouts')) {
        simplifiedUserData.workouts = userData.workouts;
      }
    }
    
    return `${basePrompt}\n\n${specificPrompt}\n\nUser Data: ${JSON.stringify(simplifiedUserData, null, 2)}`;
  };
  
  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    return date.toLocaleString('default', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getSectionClass = (type) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-600 p-4 rounded-r-lg mb-4';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 dark:border-amber-600 p-4 rounded-r-lg mb-4';
      case 'neutral':
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-600 p-4 rounded-r-lg mb-4';
      default:
        return '';
    }
  };
  
  // Helper function to get icon and color for each category
  const getCategoryProperties = (category) => {
    switch (category) {
      case 'overview':
        return { icon: <Book size={16} />, name: 'Overview', color: 'blue' };
      case 'mood':
        return { icon: <Smile size={16} />, name: 'Mood', color: 'purple' };
      case 'focus':
        return { icon: <Brain size={16} />, name: 'Focus', color: 'indigo' };
      case 'habits':
        return { icon: <Zap size={16} />, name: 'Habits', color: 'amber' };
      case 'workouts':
        return { icon: <Dumbbell size={16} />, name: 'Workouts', color: 'green' };
      case 'journaling':
        return { icon: <FileText size={16} />, name: 'Journaling', color: 'teal' };
      default:
        return { icon: <Book size={16} />, name: 'Overview', color: 'blue' };
    }
  };
  
  // Get properties for active category
  const activeCategory = getCategoryProperties(activeTab);

  // Generate empty state message based on data availability
  const getEmptyStateMessage = () => {
    const categoryName = activeCategory.name.toLowerCase();
    
    if (!hasEnoughData) {
      switch (timeRange) {
        case 'day':
          return `No ${categoryName} data available for today. Add some ${categoryName.toLowerCase()} data in the corresponding section before generating an analysis.`;
        case 'week':
          return `No ${categoryName} data available for the past week. Add some ${categoryName.toLowerCase()} data in the corresponding section before generating an analysis.`;
        case 'month':
          return `No ${categoryName} data available for the past month. Add some ${categoryName.toLowerCase()} data in the corresponding section before generating an analysis.`;
        default:
          return `No ${categoryName} data available for this period. Please add data in the ${categoryName.toLowerCase()} section first.`;
      }
    } else {
      switch (timeRange) {
        case 'day':
          return `Daily ${categoryName} analysis hasn't been generated yet.`;
        case 'week':
          return `Weekly ${categoryName} analysis hasn't been generated yet.`;
        case 'month':
          return `Monthly ${categoryName} analysis hasn't been generated yet.`;
        default:
          return `No ${categoryName} analysis available for this time period.`;
      }
    }
  };

  // Generate appropriate empty state title
  const getEmptyStateTitle = () => {
    if (!hasEnoughData) {
      return "Not Enough Data";
    }
    
    switch (timeRange) {
      case 'day':
        return "Today's Analysis";
      case 'week':
        return "This Week's Analysis";
      case 'month':
        return "This Month's Analysis";
      default:
        return "Analysis";
    }
  };

  // Get appropriate empty state icon
  const getEmptyStateIcon = () => {
    if (error) {
      return <AlertTriangle size={48} className="text-red-300 dark:text-red-600 mx-auto mb-4" />;
    }
    if (!hasEnoughData) {
      return <Info size={48} className="text-blue-300 dark:text-blue-600 mx-auto mb-4" />;
    }
    return <FileText size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />;
  };

  // Check if we have an analysis to display
  const hasAnalysis = () => {
    return analysis && 
           analysis[activeTab] && 
           analysis[activeTab][timeRange] && 
           analysis[activeTab][timeRange].text;
  };
  
  return (
    <div className="p-2 sm:p-4 h-full overflow-auto">
      {/* Compact Mobile Header */}
      <div className="sm:hidden mb-3">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-900/20 rounded-lg p-3 flex flex-col shadow-sm">
          {/* Category Dropdown */}
          <div className="mb-3">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className={`w-full flex items-center justify-between gap-2 p-2.5 rounded-lg bg-gradient-to-r from-${activeCategory.color}-500 to-${activeCategory.color}-600 text-white transition-colors shadow-sm`}
              >
                <span className="flex items-center gap-2">
                  {activeCategory.icon}
                  <span className="font-medium">{activeCategory.name}</span>
                </span>
                <ChevronDown size={16} />
              </button>
              
              {/* Dropdown Menu */}
              {showCategoryMenu && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 z-10 overflow-hidden">
                  {[...primaryTabs, ...overflowTabs].map(cat => {
                    const {icon, name, color} = getCategoryProperties(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveTab(cat);
                          setShowCategoryMenu(false);
                        }}
                        className={`flex items-center gap-2 w-full p-3 hover:bg-slate-100 dark:hover:bg-slate-600 ${cat === activeTab ? `text-${color}-500` : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        {icon}
                        <span>{name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Time Range Selector - Now below dropdown */}
          <div className="mb-2">
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Calendar size={12} />
              <span>Time Period:</span>
            </label>
            <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600">
              {['day', 'week', 'month'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`py-2 text-xs font-medium ${
                    timeRange === range 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                  } transition-colors`}
                >
                  {range === 'day' ? 'Daily' : range === 'week' ? 'Weekly' : 'Monthly'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Last Updated Info */}
          {lastUpdated && (
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 justify-end">
              <Clock size={12} />
              <span>Updated: {formatLastUpdated(lastUpdated)}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Desktop Header with Tab Bar + Overflow */}
      <div className="hidden sm:flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {/* Primary tabs */}
          {primaryTabs.map(tab => {
            const { icon, name, color } = getCategoryProperties(tab);
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  activeTab === tab 
                    ? `bg-${color}-500 text-white` 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                } transition-colors`}
              >
                {icon}
                <span>{name}</span>
              </button>
            );
          })}
          
          {/* Overflow menu */}
          <div className="relative" ref={overflowRef}>
            <button
              onClick={() => setShowOverflowMenu(!showOverflowMenu)}
              className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
                overflowTabs.includes(activeTab)
                  ? `bg-${getCategoryProperties(activeTab).color}-500 text-white`
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              } transition-colors`}
            >
              {overflowTabs.includes(activeTab) 
                ? (
                  <>
                    {getCategoryProperties(activeTab).icon}
                    <span className="mr-1">{getCategoryProperties(activeTab).name}</span>
                  </>
                ) 
                : <MoreHorizontal size={16} />
              }
              <ChevronDown size={14} />
            </button>
            
            {/* Dropdown menu */}
            {showOverflowMenu && (
              <div className="absolute top-full right-0 mt-1 z-10 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 py-1">
                {overflowTabs.map(tab => {
                  const { icon, name, color } = getCategoryProperties(tab);
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setShowOverflowMenu(false);
                      }}
                      className={`w-full px-4 py-2 flex items-center gap-2 ${
                        activeTab === tab
                          ? `bg-slate-100 dark:bg-slate-700 text-${color}-500 dark:text-${color}-400`
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      } transition-colors`}
                    >
                      {icon}
                      <span>{name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-1 items-center">
          <button
            onClick={() => setTimeRange('day')}
            className={`px-3 py-1 rounded-l-lg text-xs ${
              timeRange === 'day' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors`}
          >
            Day
          </button>
          
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-xs ${
              timeRange === 'week' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors`}
          >
            Week
          </button>
          
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded-r-lg text-xs ${
              timeRange === 'month' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors`}
          >
            Month
          </button>
        </div>
      </div>
      
      {/* Content Container */}
      <div className="bg-white dark:bg-slate-700 p-4 sm:p-6 rounded-xl shadow-sm h-[calc(100vh-110px)] sm:h-auto flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
            {activeTab === 'overview' ? 'Wellbeing Overview' :
             activeTab === 'mood' ? 'Mood & Energy Analysis' :
             activeTab === 'focus' ? 'Focus & Productivity Insights' :
             activeTab === 'habits' ? 'Habit Tracking Analysis' :
             activeTab === 'journaling' ? 'Journal & Reflection Analysis' :
             'Workout & Activity Insights'}
          </h3>
          
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar size={14} />
              <span>
                {timeRange === 'day' ? 'Last 24 hours' : 
                 timeRange === 'week' ? 'Last 7 days' : 
                 'Last 30 days'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Content with full container scroll */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader size={32} className="text-blue-500 dark:text-blue-400 animate-spin mb-4" />
              <p className="text-slate-600 dark:text-slate-300">Generating your analysis...</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">This may take a minute</p>
            </div>
          ) : hasAnalysis() ? (
            <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
              {/* Show error if any */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4 text-sm text-red-800 dark:text-red-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-lg xs:text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 break-words" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-base xs:text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6 break-words" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-sm xs:text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 mt-4 break-words" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 text-sm xs:text-base text-slate-700 dark:text-slate-300 break-words" {...props} />,
                  ul: ({node, ...props}) => <ul className="mb-4 list-disc pl-5 break-words" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1 break-words" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-blue-600 dark:text-blue-400" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className={getSectionClass('neutral') + " break-words"} {...props} />,
                  pre: ({node, ...props}) => <pre className="overflow-x-auto w-full max-w-full" {...props} />,
                  code: ({node, ...props}) => <code className="break-words" {...props} />,
                  table: ({node, ...props}) => <div className="overflow-x-auto"><table {...props} /></div>,
                }}
              >
                {analysis[activeTab][timeRange].text}
              </ReactMarkdown>
              
              {/* Fallback raw text if markdown fails */}
              {error && (
                <div className="mt-4">
                  <p className="font-medium text-slate-600 dark:text-slate-300 mb-2">Raw content:</p>
                  <pre className="whitespace-pre-wrap text-xs bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-auto">
                    {analysis[activeTab][timeRange].text}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              {getEmptyStateIcon()}
              <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">{getEmptyStateTitle()}</h4>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                {getEmptyStateMessage()}
              </p>
              
              {/* Show error if any */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4 text-sm text-red-800 dark:text-red-200 max-w-md mx-auto">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              {hasEnoughData && !error && (
                <button
                  onClick={handleGenerateCurrentReport}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <RefreshCw size={16} />
                  <span>Generate {activeCategory.name} analysis</span>
                </button>
              )}
              
              {/* Add retry button when error occurs */}
              {error && (
                <button
                  onClick={() => {
                    setError(null);
                    handleGenerateCurrentReport();
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <RefreshCw size={16} />
                  <span>Retry Analysis</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Refresh button when analysis exists */}
        {hasAnalysis() && !isLoading && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleGenerateCurrentReport}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              <span>Refresh analysis</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayCoachAnalysis;