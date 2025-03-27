import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Plus, Filter, Search } from 'lucide-react';
import GoalCategories from './GoalCategories';
import GoalList from './GoalList';
import GoalDetail from './GoalDetail';
import GoalProgressTracker from './GoalProgressTracker';
import GoalInspirationTab from './GoalInspirationTab';
import GoalAnalytics from './GoalAnalytics';
import { getGoals, getSummaryStats } from '../../utils/bucketListUtils';

const BucketList = () => {
  const [activeTab, setActiveTab] = useState('goals');
  const [goals, setGoals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [stats, setStats] = useState({});
  
  // Create a memoized refreshData function to prevent unnecessary re-renders
  const refreshData = useCallback(() => {
    const loadedGoals = getGoals();
    setGoals(loadedGoals);
    
    const summaryStats = getSummaryStats();
    setStats(summaryStats);
  }, []);
  
  // Load goals on component mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  
  // Handle goal selection - now opens the tracker instead of details
  const handleGoalSelect = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    setSelectedGoal(goal);
    setIsTrackerOpen(true);
  };
  
  // Close goal progress tracker
  const handleCloseTracker = () => {
    setIsTrackerOpen(false);
    setSelectedGoal(null);
  };
  
  // Close goal detail panel
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    // Don't reset selectedGoal because we want to return to the tracker
  };
  
  // Open the full edit form from the tracker
  const handleOpenEditForm = () => {
    setIsDetailOpen(true);
  };
  
  // Handle returning from edit form to tracker
  const handleReturnToTracker = () => {
    setIsDetailOpen(false);
  };
  
  // Handle goal update and refresh data
  const handleGoalUpdate = (newGoal) => {
    refreshData();
    
    // If this is from the inspiration tab, switch to goals tab to show the new goal
    if (activeTab === 'inspiration' && newGoal) {
      // Short delay to ensure data is refreshed
      setTimeout(() => {
        setActiveTab('goals');
      }, 100);
    }
  };
  
  // Create new goal
  const handleCreateGoal = () => {
    setSelectedGoal(null);
    setIsDetailOpen(true);
  };
  
  // Filter and search goals
  const filteredGoals = goals.filter(goal => {
    // Category filter
    if (selectedCategory !== 'all' && goal.category !== selectedCategory) {
      return false;
    }
    
    // Status filter
    if (filter === 'active' && goal.completed) {
      return false;
    }
    if (filter === 'completed' && !goal.completed) {
      return false;
    }
    
    // Search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        goal.title.toLowerCase().includes(searchLower) ||
        (goal.description && goal.description.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 transition-colors break-words">
          <Trophy className="text-amber-500 dark:text-amber-400 flex-shrink-0" size={24} />
          <span className="break-words">Bucket List & Goals</span>
        </h2>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-2 sm:p-3 text-center transition-colors">
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.totalGoals || 0}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total Goals</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-2 sm:p-3 text-center transition-colors">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{stats.completedGoals || 0}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Completed</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2 sm:p-3 text-center transition-colors">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgressGoals || 0}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">In Progress</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-2 sm:p-3 text-center transition-colors">
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.avgCompletionRate || 0}%</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Completion Rate</div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-3 sm:px-4 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'goals' 
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              My Goals
            </button>
            <button
              onClick={() => setActiveTab('inspiration')}
              className={`px-3 sm:px-4 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'inspiration' 
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Inspiration
            </button>
            <button
              onClick={() => setActiveTab('visionBoard')}
              className={`px-3 sm:px-4 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'visionBoard' 
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Goal Analytics
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      {activeTab === 'goals' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 transition-colors">
              <GoalCategories 
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
          </div>
          
          {/* Main Content - Goal List */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 transition-colors">
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search goals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <div className="relative">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="appearance-none pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    >
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                    <Filter className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  </div>
                  <button
                    onClick={handleCreateGoal}
                    className="bg-amber-500 dark:bg-amber-600 text-white py-2 px-4 rounded-lg flex items-center gap-1 hover:bg-amber-600 dark:hover:bg-amber-700 transition-colors"
                  >
                    <Plus size={18} />
                    <span className="whitespace-nowrap">New Goal</span>
                  </button>
                </div>
              </div>
              
              {/* Goals List */}
              <GoalList 
                goals={filteredGoals} 
                onSelectGoal={handleGoalSelect}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Inspiration Tab */}
      {activeTab === 'inspiration' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors">
          <GoalInspirationTab onAddGoal={handleGoalUpdate} />
        </div>
      )}
      
      {/* Vision Board Tab (renamed to Goal Analytics) */}
      {activeTab === 'visionBoard' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors">
          <GoalAnalytics />
        </div>
      )}
      
      {/* Goal Progress Tracker (opens first when clicking a goal) */}
      {isTrackerOpen && selectedGoal && (
        <GoalProgressTracker 
          goal={selectedGoal} 
          onClose={handleCloseTracker}
          onUpdate={handleGoalUpdate}
          onOpenEditForm={handleOpenEditForm}
        />
      )}
      
      {/* Goal Detail Modal (full editor) */}
      {isDetailOpen && (
        <GoalDetail 
          goal={selectedGoal} 
          onClose={handleCloseDetail}
          onUpdate={() => {
            handleGoalUpdate();
            handleReturnToTracker();
          }}
        />
      )}
    </div>
  );
};

export default BucketList;