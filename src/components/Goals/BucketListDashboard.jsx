import React, { useState, useEffect } from 'react';
import { 
  Trophy, ChevronRight, Plus, ArrowRight, Calendar, 
  Filter, Target, Mountain, Brain, Dumbbell, 
  Briefcase, Wallet, Sparkles, Star, Circle, 
  ArrowUpRight, CheckCircle
} from 'lucide-react';
import { getGoals, getCategories, getSummaryStats, createGoal } from '../../utils/bucketListUtils';

const BucketListDashboard = ({ onSelectGoal, onCreateGoal, onChangeTab = () => {} }) => {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  
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
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
              Goal Progress
            </h3>
            <div className="bg-amber-100 dark:bg-amber-900/30 h-10 w-10 rounded-full flex items-center justify-center">
              <Target size={20} className="text-amber-500" />
            </div>
          </div>
          
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-600 dark:text-amber-400 bg-amber-200 dark:bg-amber-900/50">
                  {stats.avgCompletionRate || 0}% Complete
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-amber-600 dark:text-amber-400">
                  {stats.completedGoals || 0}/{stats.totalGoals || 0} Goals
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-amber-200 dark:bg-amber-900/30">
              <div 
                style={{ width: `${stats.avgCompletionRate || 0}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500 dark:bg-amber-600"
              ></div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between text-sm">
            <div className="text-amber-700 dark:text-amber-400">
              <span className="font-bold text-xl">{stats.inProgressGoals || 0}</span>
              <p>In progress</p>
            </div>
            <div className="text-green-600 dark:text-green-400">
              <span className="font-bold text-xl">{stats.completedGoals || 0}</span>
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
            className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectGoal(goal.id)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
                  {getCategoryIcon(goal.category)}
                </div>
                <h3 className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
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
                  <Calendar size={12} />
                  {formatRemainingTime(goal.targetDate)}
                </span>
              )}
            </div>
          </div>
        ))}
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
            <div className="p-6 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                No upcoming deadlines. Set target dates for your goals to see them here.
              </p>
              <button
                onClick={onCreateGoal}
                className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg inline-flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Create a Goal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BucketListDashboard;