import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, RefreshCw, Book, TrendingUp, AlertTriangle,
  Smile, Brain, Zap, Dumbbell, Clock
} from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import { generateContent } from '../../utils/ai-service';
import ReactMarkdown from 'react-markdown';

const DayCoachAnalysis = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState({});
  const [activeTab, setActiveTab] = useState('overview'); // overview, mood, focus, habits, workouts
  const [timeRange, setTimeRange] = useState('week'); // day, week, month
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Reference to track if report generation is scheduled
  const isGenerationScheduled = useRef(false);
  // Reference to track if component is mounted
  const isMounted = useRef(true);
  
  // Set mounted flag
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Load saved analysis when component mounts or tab/range changes
  useEffect(() => {
    loadSavedAnalysis();
  }, [activeTab, timeRange]);
  
  // Check if we need to generate reports - only on first render
  useEffect(() => {
    checkIfReportsNeedGeneration();
  }, []);
  
  // Check if reports need generation
  const checkIfReportsNeedGeneration = () => {
    const storage = getStorage();
    const now = new Date();
    
    // Get the last generation time
    const lastGeneration = storage.dayCoachAnalyticsLastGeneration || null;
    
    if (!lastGeneration) {
      // First time - generate reports
      console.log("First time, generating reports");
      generateAllReports();
      return;
    }
    
    const lastGenerationDate = new Date(lastGeneration);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastGenDay = new Date(
      lastGenerationDate.getFullYear(), 
      lastGenerationDate.getMonth(), 
      lastGenerationDate.getDate()
    );
    
    // If last generation was not today, generate new reports
    if (today.getTime() !== lastGenDay.getTime()) {
      console.log("New day since last generation, generating reports");
      generateAllReports();
    } else {
      console.log("Reports already generated today");
    }
  };
  
  // Load saved analysis from storage
  const loadSavedAnalysis = () => {
    setIsLoading(true);
    
    try {
      const storage = getStorage();
      const savedAnalytics = storage.dayCoachAnalytics || {};
      
      setAnalysis(savedAnalytics);
      
      // Set last updated timestamp if available
      if (savedAnalytics[activeTab]?.[timeRange]?.timestamp) {
        setLastUpdated(savedAnalytics[activeTab][timeRange].timestamp);
      } else {
        setLastUpdated(null);
      }
    } catch (error) {
      console.error('Error loading saved analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate a single report for a specific tab and time range
  const generateReport = async (tab, range) => {
    try {
      const storage = getStorage();
      
      // Collect relevant data based on time range
      const userData = collectUserData(storage, range);
      
      // Generate prompt based on tab
      const prompt = generatePrompt(userData, tab, range);
      
      // Get analysis from AI
      const result = await generateContent(prompt);
      
      // Only continue if component is still mounted
      if (!isMounted.current) return;
      
      // Get existing analytics or create new object
      const existingAnalytics = storage.dayCoachAnalytics || {};
      
      // Create nested structure if needed
      if (!existingAnalytics[tab]) {
        existingAnalytics[tab] = {};
      }
      
      // Add the new report
      existingAnalytics[tab][range] = {
        text: result,
        timestamp: new Date().toISOString()
      };
      
      // Save back to storage
      storage.dayCoachAnalytics = existingAnalytics;
      setStorage(storage);
      
      // Update state if this is the active tab and range
      if (tab === activeTab && range === timeRange) {
        setAnalysis(existingAnalytics);
        setLastUpdated(existingAnalytics[tab][range].timestamp);
        setIsLoading(false);
      }
      
      return true;
    } catch (error) {
      console.error(`Error generating ${tab} ${range} report:`, error);
      return false;
    }
  };
  
  // Generate all reports for all tabs and time ranges
  const generateAllReports = async () => {
    // Prevent duplicate generation
    if (isGenerationScheduled.current) {
      console.log("Report generation already scheduled, skipping");
      return;
    }
    
    isGenerationScheduled.current = true;
    console.log("Starting report generation");
    
    // If this is the active report, show loading
    setIsLoading(true);
    
    const tabs = ['overview', 'mood', 'focus', 'habits', 'workouts'];
    const ranges = ['day', 'week', 'month'];
    
    for (const tab of tabs) {
      for (const range of ranges) {
        await generateReport(tab, range);
        // If component unmounted during generation, stop
        if (!isMounted.current) return;
      }
    }
    
    // Update the last generation timestamp
    if (isMounted.current) {
      const storage = getStorage();
      storage.dayCoachAnalyticsLastGeneration = new Date().toISOString();
      setStorage(storage);
    }
    
    console.log("All reports generated");
    isGenerationScheduled.current = false;
  };
  
  // Manual refresh handler - just refresh the current tab/range
  const handleManualRefresh = async () => {
    setIsLoading(true);
    await generateReport(activeTab, timeRange);
    
    // Also update the last generation timestamp
    const storage = getStorage();
    storage.dayCoachAnalyticsLastGeneration = new Date().toISOString();
    setStorage(storage);
  };
  
  // The rest of your functions stay the same
  const collectUserData = (storage, range) => {
    const today = new Date();
    const result = {};
    
    // Get dates for the selected time range
    let startDate;
    switch (range) {
      case 'day':
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
    
    // Collect data for each date in the range
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (storage[dateStr]) {
        result[dateStr] = storage[dateStr];
      }
    }
    
    // Add habits, focus sessions, workouts data
    if (storage.habits) result.habits = storage.habits;
    if (storage.focusSessions) result.focusSessions = storage.focusSessions;
    if (storage.completedWorkouts) result.workouts = storage.completedWorkouts;
    
    return result;
  };
  
  const generatePrompt = (userData, tab, range) => {
    const basePrompt = `Analyze the following user data for the last ${range === 'day' ? 'day' : range === 'week' ? 'week' : 'month'} and provide insights, patterns, and personalized recommendations. 
    
IMPORTANT: Address the user directly using "you" and "your" (not "the user" or "they"). Keep your tone warm, friendly and conversational as if you're talking directly to them.

Format your response using Markdown with clear sections for Observations, Patterns, and Recommendations. Use emojis at the beginning of each point to make it visually engaging.

Keep your analysis conversational, helpful, and actionable.`;
    
    let specificPrompt = '';
    switch (tab) {
      case 'overview':
        specificPrompt = `Provide a comprehensive overview of all aspects of your wellbeing, including mood, energy, tasks, workouts, and habits. Highlight the most significant insights and opportunities for improvement.`;
        break;
      case 'mood':
        specificPrompt = `Focus on your mood and energy patterns. Identify factors that seem to positively or negatively impact your emotional wellbeing. Look for correlations between activities, journal entries, and mood changes.`;
        break;
      case 'focus':
        specificPrompt = `Analyze your focus sessions and productivity patterns. Identify optimal times for focus, factors affecting your concentration, and suggestions for improving productivity.`;
        break;
      case 'habits':
        specificPrompt = `Evaluate your habit tracking and consistency. Identify successful habit streaks, patterns in habit completion, and recommendations for building stronger habits.`;
        break;
      case 'workouts':
        specificPrompt = `Analyze your workout patterns, including types, intensity, duration, and frequency. Suggest improvements to your fitness routine based on consistency and variety.`;
        break;
      default:
        specificPrompt = `Provide general insights based on all available data about your wellbeing.`;
    }
    
    return `${basePrompt}\n\n${specificPrompt}\n\nUser Data: ${JSON.stringify(userData, null, 2)}`;
  };
  
  // Format timestamp
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
  
  // Rest of your rendering code remains the same
  // Custom styles for different insight sections
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
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
              activeTab === 'overview' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors whitespace-nowrap`}
          >
            <Book size={16} />
            <span>Overview</span>
          </button>
          
          <button
            onClick={() => setActiveTab('mood')}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
              activeTab === 'mood' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors whitespace-nowrap`}
          >
            <Smile size={16} />
            <span>Mood</span>
          </button>
          
          <button
            onClick={() => setActiveTab('focus')}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
              activeTab === 'focus' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors whitespace-nowrap`}
          >
            <Brain size={16} />
            <span>Focus</span>
          </button>
          
          <button
            onClick={() => setActiveTab('habits')}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
              activeTab === 'habits' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors whitespace-nowrap`}
          >
            <Zap size={16} />
            <span>Habits</span>
          </button>
          
          <button
            onClick={() => setActiveTab('workouts')}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
              activeTab === 'workouts' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors whitespace-nowrap`}
          >
            <Dumbbell size={16} />
            <span>Workouts</span>
          </button>
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
          
          <button
            onClick={handleManualRefresh}
            className="ml-2 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            title="Refresh Analysis"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-700 p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
            {activeTab === 'overview' ? 'Wellbeing Overview' :
             activeTab === 'mood' ? 'Mood & Energy Analysis' :
             activeTab === 'focus' ? 'Focus & Productivity Insights' :
             activeTab === 'habits' ? 'Habit Tracking Analysis' :
             'Workout & Activity Insights'}
          </h3>
          
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar size={14} />
              <span>
                {timeRange === 'day' ? 'Last 24 hours' : 
                 timeRange === 'week' ? 'Last 7 days' : 
                 'Last 30 days'}
              </span>
            </div>
            
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock size={14} />
              <span>Updated: {formatLastUpdated(lastUpdated)}</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[60vh] pr-1 custom-scrollbar">
          {analysis[activeTab]?.[timeRange] ? (
            <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 mt-4" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 text-slate-700 dark:text-slate-300" {...props} />,
                  ul: ({node, ...props}) => <ul className="mb-4 list-disc pl-5" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-blue-600 dark:text-blue-400" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className={getSectionClass('neutral')} {...props} />,
                }}
              >
                {analysis[activeTab][timeRange].text}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle size={32} className="text-amber-500 mx-auto mb-2" />
              <p>No analysis available yet. Click Refresh to generate insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayCoachAnalysis;