import React, { useState, useEffect } from 'react';
import { 
  Trophy, ChevronRight, Plus, ArrowRight, Calendar, 
  Filter, Search, Star, BarChart3, Sparkles, Target, 
  Mountain, Brain, Dumbbell, Briefcase, Wallet, Zap, 
  Clock, CheckCircle2, Circle, ArrowUpRight
} from 'lucide-react';
import { getGoals, getCategories, getSummaryStats, createGoal } from '../../utils/bucketListUtils';

const BucketListDashboard = ({ onSelectGoal, onCreateGoal, onChangeTab = () => {} }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Mock dashboard data for visualization
  const completionRate = 68;
  const upcomingGoals = 3;
  const recentlyCompleted = 2;
  
  useEffect(() => {
    // Load goals, categories, and stats
    const loadedGoals = getGoals();
    const loadedCategories = getCategories();
    const summaryStats = getSummaryStats();
    
    setGoals(loadedGoals);
    setCategories(loadedCategories);
    setStats(summaryStats);
  }, []);
  
  // Get category icon
  const getCategoryIcon = (categoryId) => {
    switch(categoryId) {
      case 'experiences': return <Mountain size={20} className="text-purple-500" />;
      case 'personal': return <Brain size={20} className="text-blue-500" />;
      case 'fitness': return <Dumbbell size={20} className="text-green-500" />;
      case 'career': return <Briefcase size={20} className="text-amber-500" />;
      case 'finance': return <Wallet size={20} className="text-emerald-500" />;
      case 'creative': return <Sparkles size={20} className="text-rose-500" />;
      default: return <Star size={20} className="text-slate-500" />;
    }
  };
  
  // Get featured goals (pinned or upcoming)
  const getFeaturedGoals = () => {
    return goals
      .filter(goal => !goal.completed)
      .sort((a, b) => {
        // Sort by pinned first, then by target date
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        
        if (a.targetDate && b.targetDate) {
          return new Date(a.targetDate) - new Date(b.targetDate);
        }
        
        return 0;
      })
      .slice(0, 3);
  };
  
  // Get recently completed goals
  const getRecentlyCompleted = () => {
    return goals
      .filter(goal => goal.completed)
      .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt))
      .slice(0, 2);
  };
  
  // Format remaining time display
  const formatRemainingTime = (dateString) => {
    if (!dateString) return null;
    
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days left`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks left`;
    return `${Math.floor(diffDays / 30)} months left`;
  };
  
  // Calculate progress percentage
  const calculateProgress = (goal) => {
    if (goal.completed) return 100;
    
    if (goal.progressType === 'percentage') {
      return goal.progress || 0;
    } else if (goal.progressType === 'counter' && goal.targetValue > 0) {
      return Math.round((goal.currentValue / goal.targetValue) * 100);
    } else if (goal.progressType === 'milestone' && goal.milestones?.length > 0) {
      const completedCount = goal.milestones.filter(m => m.completed).length;
      return Math.round((completedCount / goal.milestones.length) * 100);
    }
    
    return 0;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Trophy className="text-amber-500" />
            <span>My Bucket List</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track your life goals and dreams
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onCreateGoal}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg shadow-sm flex items-center gap-2 transition-all"
          >
            <Plus size={18} />
            <span className="font-medium">New Goal</span>
          </button>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        <nav className="flex overflow-x-auto no-scrollbar">
          <button
            onClick={() => onChangeTab('dashboard')}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'dashboard' 
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onChangeTab('goals')}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'goals' 
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All Goals
          </button>
          <button
            onClick={() => onChangeTab('inspiration')}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'inspiration' 
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Inspiration
          </button>
          <button
            onClick={() => onChangeTab('vision')}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'vision' 
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Vision Board
          </button>
          <button
            onClick={() => onChangeTab('analytics')}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'analytics' 
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>
      
      {/* Dashboard Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300">
                  Overall Progress
                </h3>
                <div className="bg-white dark:bg-slate-800 h-10 w-10 rounded-full flex items-center justify-center shadow-sm">
                  <Target size={20} className="text-amber-500" />
                </div>
              </div>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-600 dark:text-amber-400 bg-amber-200 dark:bg-amber-900/50">
                      {completionRate}% Complete
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-amber-600 dark:text-amber-400">
                      {stats.completedGoals || 0}/{stats.totalGoals || 0} Goals
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-amber-200 dark:bg-amber-900/30">
                  <div style={{ width: `${completionRate}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500 dark:bg-amber-600"></div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between text-sm">
                <div className="text-amber-700 dark:text-amber-400">
                  <span className="font-bold text-xl">{upcomingGoals}</span>
                  <p>Upcoming</p>
                </div>
                <div className="text-green-600 dark:text-green-400">
                  <span className="font-bold text-xl">{recentlyCompleted}</span>
                  <p>Completed</p>
                </div>
                <div className="text-blue-600 dark:text-blue-400">
                  <span className="font-bold text-xl">{stats.totalGoals || 0}</span>
                  <p>Total</p>
                </div>
              </div>
            </div>
            
            {/* Featured Goals Preview */}
            {getFeaturedGoals().slice(0, 2).map((goal, index) => (
              <div 
                key={goal.id || index}
                className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectGoal(goal.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
                      {getCategoryIcon(goal.category)}
                    </div>
                    <h3 className="font-medium text-slate-800 dark:text-slate-200">
                      {goal.title}
                    </h3>
                  </div>
                  <ChevronRight className="text-slate-400" size={18} />
                </div>
                
                <div className="mb-3">
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 dark:bg-amber-600 rounded-full transition-all"
                      style={{ width: `${calculateProgress(goal)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {calculateProgress(goal)}% complete
                  </span>
                  
                  {goal.targetDate && (
                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full flex items-center gap-1">
                      <Clock size={12} />
                      {formatRemainingTime(goal.targetDate)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Feature Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Add from Templates */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">Quick Add</h3>
              </div>
              
              <div className="p-4 space-y-3">
                <button 
                  onClick={() => {
                    const newGoal = createGoal({
                      title: "Visit 10 countries",
                      category: "experiences",
                      progressType: "counter",
                      targetValue: 10,
                      currentValue: 0
                    });
                    onSelectGoal(newGoal.id);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                      <Mountain size={16} className="text-purple-500" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">Visit 10 countries</span>
                  </div>
                  <Plus size={16} className="text-slate-400" />
                </button>
                
                <button
                  onClick={() => {
                    const newGoal = createGoal({
                      title: "Run a marathon",
                      category: "fitness",
                      progressType: "percentage",
                      progress: 0
                    });
                    onSelectGoal(newGoal.id);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                      <Dumbbell size={16} className="text-green-500" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">Run a marathon</span>
                  </div>
                  <Plus size={16} className="text-slate-400" />
                </button>
                
                <button
                  onClick={() => {
                    const newGoal = createGoal({
                      title: "Learn a new language",
                      category: "personal",
                      progressType: "milestone",
                      milestones: [
                        { text: "Complete beginner course", completed: false },
                        { text: "Practice daily for 30 days", completed: false },
                        { text: "Have a 5-minute conversation", completed: false },
                        { text: "Read a short story", completed: false }
                      ]
                    });
                    onSelectGoal(newGoal.id);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <Brain size={16} className="text-blue-500" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">Learn a new language</span>
                  </div>
                  <Plus size={16} className="text-slate-400" />
                </button>
                
                <button
                  onClick={() => {
                    const newGoal = createGoal({
                      title: "Save for a dream vacation",
                      category: "finance",
                      progressType: "counter",
                      targetValue: 5000,
                      currentValue: 0
                    });
                    onSelectGoal(newGoal.id);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                      <Wallet size={16} className="text-emerald-500" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">Save for a dream vacation</span>
                  </div>
                  <Plus size={16} className="text-slate-400" />
                </button>
                
                <div className="pt-2">
                  <button 
                    onClick={() => onChangeTab('inspiration')}
                    className="w-full text-center py-2 text-amber-600 dark:text-amber-400 text-sm font-medium hover:underline flex items-center justify-center gap-1"
                  >
                    <span>More templates</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">Recent Activity</h3>
              </div>
              
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {/* Completed Goals */}
                {getRecentlyCompleted().map((goal, index) => (
                  <div 
                    key={goal.id || index}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    onClick={() => onSelectGoal(goal.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400 mt-1">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <p className="text-slate-800 dark:text-slate-200 font-medium">
                          Completed: {goal.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {new Date(goal.modifiedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Example progress update */}
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400 mt-1">
                      <Zap size={16} />
                    </div>
                    <div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        Updated progress: Learn Spanish
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        April 15, 2025
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Example new goal */}
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full text-purple-600 dark:text-purple-400 mt-1">
                      <Target size={16} />
                    </div>
                    <div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        New goal: Visit Japan
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        April 10, 2025
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Motivational AI Coach */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-blue-200 dark:border-blue-800 flex justify-between items-center">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">Goal Coach</h3>
                <div className="bg-blue-500 dark:bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  AI Powered
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                  <p className="text-slate-700 dark:text-slate-300 mb-3">
                    "The best way to achieve your travel goals is to break them down into smaller trips. Start by planning weekend getaways to nearby destinations."
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Tip for: Visit 10 countries
                    </span>
                    <button className="text-blue-600 dark:text-blue-400 text-xs flex items-center gap-1">
                      <span>More tips</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={() => onChangeTab('inspiration')}
                  className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles size={16} />
                  <span>Get Personalized Guidance</span>
                </button>
                
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Target size={16} />
                    <span>Next Step</span>
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Complete your first milestone for "Learn a new language" by downloading a language app.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Upcoming Deadlines</h3>
              <button 
                onClick={() => onChangeTab('goals')}
                className="text-amber-600 dark:text-amber-400 text-sm flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {getFeaturedGoals().map((goal, index) => (
                <div 
                  key={goal.id || index} 
                  className="flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" 
                  onClick={() => onSelectGoal(goal.id)}
                >
                  <div className="mr-3">
                    <Circle size={20} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800 dark:text-slate-200 truncate">{goal.title}</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {goal.targetDate && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                          <Calendar size={12} />
                          {formatRemainingTime(goal.targetDate)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                        {calculateProgress(goal)}% complete
                      </span>
                    </div>
                  </div>
                  <div className="ml-2">
                    <ArrowUpRight size={18} className="text-slate-400" />
                  </div>
                </div>
              ))}
              
              {getFeaturedGoals().length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400">
                    No upcoming deadlines. Set target dates for your goals to see them here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab !== 'dashboard' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-center h-32">
            <p className="text-slate-500 dark:text-slate-400 italic">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} view will be displayed here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BucketListDashboard;