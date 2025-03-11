import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, RefreshCw, Book, TrendingUp, AlertTriangle,
  Smile, Brain, Zap, Dumbbell, Clock, FileText, Loader, 
  BarChart2, ChevronDown, Menu
} from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import { generateContent } from '../../utils/ai-service';
import ReactMarkdown from 'react-markdown';

const DayCoachAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  
  // Reference to track if component is mounted
  const isMounted = useRef(true);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryMenu(false);
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
  }, [activeTab, timeRange]);
  
  // Existing functions (loadSavedAnalysis, generateReport, etc.) remain unchanged
  
  const loadSavedAnalysis = () => {
    try {
      const storage = getStorage();
      const savedAnalytics = storage.dayCoachAnalytics || {};
      
      setAnalysis(savedAnalytics);
      
      if (savedAnalytics[activeTab]?.[timeRange]?.timestamp) {
        setLastUpdated(savedAnalytics[activeTab][timeRange].timestamp);
      } else {
        setLastUpdated(null);
      }
    } catch (error) {
      console.error('Error loading saved analysis:', error);
    }
  };
  
  const generateReport = async (tab, range) => {
    setIsLoading(true);
    
    try {
      const storage = getStorage();
      const userData = collectUserData(storage, range);
      const prompt = generatePrompt(userData, tab, range);
      const result = await generateContent(prompt);
      
      if (!isMounted.current) return;
      
      const existingAnalytics = storage.dayCoachAnalytics || {};
      if (!existingAnalytics[tab]) {
        existingAnalytics[tab] = {};
      }
      
      existingAnalytics[tab][range] = {
        text: result,
        timestamp: new Date().toISOString()
      };
      
      storage.dayCoachAnalytics = existingAnalytics;
      setStorage(storage);
      
      setAnalysis(existingAnalytics);
      setLastUpdated(existingAnalytics[tab][range].timestamp);
      
      return true;
    } catch (error) {
      console.error(`Error generating ${tab} ${range} report:`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateCurrentReport = async () => {
    await generateReport(activeTab, timeRange);
    
    const storage = getStorage();
    storage.dayCoachAnalyticsLastGeneration = new Date().toISOString();
    setStorage(storage);
  };
  
  // Rest of your utility functions (collectUserData, generatePrompt, etc.)
  
  const collectUserData = (storage, range) => {
    // Existing implementation
    const today = new Date();
    const result = {};
    
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
    
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (storage[dateStr]) {
        result[dateStr] = storage[dateStr];
      }
    }
    
    if (storage.habits) result.habits = storage.habits;
    if (storage.focusSessions) result.focusSessions = storage.focusSessions;
    if (storage.completedWorkouts) result.workouts = storage.completedWorkouts;
    
    return result;
  };
  
  const generatePrompt = (userData, tab, range) => {
    // Existing implementation
    // (keeping this unchanged)
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
      default:
        return { icon: <Book size={16} />, name: 'Overview', color: 'blue' };
    }
  };
  
  // Get properties for active category
  const activeCategory = getCategoryProperties(activeTab);
  
  return (
    <div className="p-2 sm:p-4 h-full overflow-auto">
      {/* Compact Mobile Header */}
      <div className="sm:hidden mb-3">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 flex flex-col">
          <div className="flex justify-between items-center">
            {/* Category Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className={`flex items-center gap-2 p-2 rounded-lg bg-${activeCategory.color}-500 text-white transition-colors`}
              >
                {activeCategory.icon}
                <span>{activeCategory.name}</span>
                <ChevronDown size={16} />
              </button>
              
              {/* Dropdown Menu */}
              {showCategoryMenu && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 z-10 overflow-hidden">
                  {['overview', 'mood', 'focus', 'habits', 'workouts'].map(cat => {
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
            
            {/* Compact Time Range Selector */}
            <div className="flex items-center rounded-lg bg-white dark:bg-slate-700 shadow-sm overflow-hidden h-8">
              {['day', 'week', 'month'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2 h-full text-xs ${
                    timeRange === range 
                      ? 'bg-blue-500 text-white' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Last Updated Info */}
          {lastUpdated && (
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-2 justify-end">
              <Clock size={12} />
              <span>Updated: {formatLastUpdated(lastUpdated)}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden sm:flex justify-between items-center mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['overview', 'mood', 'focus', 'habits', 'workouts'].map(tab => {
            const {icon, name, color} = getCategoryProperties(tab);
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                  activeTab === tab 
                    ? `bg-${color}-500 text-white` 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                } transition-colors whitespace-nowrap`}
              >
                {icon}
                <span>{name}</span>
              </button>
            );
          })}
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
      
      {/* Content Container - more vertical space on mobile */}
      <div className="bg-white dark:bg-slate-700 p-4 sm:p-6 rounded-xl shadow-sm h-[calc(100vh-110px)] sm:h-auto flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
            {activeTab === 'overview' ? 'Wellbeing Overview' :
             activeTab === 'mood' ? 'Mood & Energy Analysis' :
             activeTab === 'focus' ? 'Focus & Productivity Insights' :
             activeTab === 'habits' ? 'Habit Tracking Analysis' :
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
          ) : analysis[activeTab]?.[timeRange] ? (
            <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
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
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No analysis available</h4>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                {timeRange === 'day' 
                  ? "Daily analysis hasn't been generated yet for this category." 
                  : timeRange === 'week'
                    ? "Weekly analysis hasn't been generated yet for this category."
                    : "Monthly analysis hasn't been generated yet for this category."}
              </p>
              <button
                onClick={handleGenerateCurrentReport}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw size={16} />
                <span>Generate {activeCategory.name} analysis</span>
              </button>
            </div>
          )}
        </div>

        {/* Refresh button when analysis exists */}
        {analysis[activeTab]?.[timeRange] && !isLoading && (
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