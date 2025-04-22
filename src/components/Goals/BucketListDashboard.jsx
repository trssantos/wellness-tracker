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

  // Add this function to get recent notes from all goals
const getRecentNotes = () => {
    const allGoals = getGoals();
    
    // Collect all notes with goal information
    const allNotes = [];
    allGoals.forEach(goal => {
      if (goal.notes && goal.notes.length > 0) {
        goal.notes.forEach(note => {
          allNotes.push({
            ...note,
            goalId: goal.id,
            goalTitle: goal.title,
            category: goal.category
          });
        });
      }
    });
    
    // Sort by date (newest first)
    allNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Return the 5 most recent notes
    return allNotes.slice(0, 5);
  };
  
  // Get featured goals (pinned or upcoming)
  const getFeaturedGoals = () => {
    return goals
      .filter(goal => !goal.completed && goal.targetDate) // Added check for goal.targetDate
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
    className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    onClick={() => onSelectGoal(goal.id)}
  >
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2 max-w-[75%]">
        <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg flex-shrink-0">
          {getCategoryIcon(goal.category)}
        </div>
        <h3 className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
          {goal.title}
        </h3>
      </div>
      <ChevronRight className="text-slate-400 flex-shrink-0" size={18} />
    </div>
    
    <div className="mb-3">
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-amber-500 dark:bg-amber-600 rounded-full transition-all"
          style={{ width: `${calculateProgress(goal)}%` }}
        ></div>
      </div>
    </div>
    
    <div className="flex flex-wrap justify-between items-center text-xs gap-2">
      <span className="text-slate-500 dark:text-slate-400">
        {calculateProgress(goal)}% complete
      </span>
      
      {goal.targetDate && (
        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
          <Calendar size={12} />
          {formatRemainingTime(goal.targetDate)}
        </span>
      )}
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
      className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg inline-flex items-center gap-2"
    >
      <Plus size={16} />
      <span>Create a Goal with Deadline</span>
    </button>
  </div>
)}
        </div>
      </div>
      {/* Recent Progress Notes */}
<div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
  <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
    <h3 className="font-medium text-slate-800 dark:text-slate-200">Recent Progress Notes</h3>
    <button 
      onClick={() => onChangeTab('goals')}
      className="text-amber-600 dark:text-amber-400 text-sm flex items-center gap-1"
    >
      <span>View all</span>
      <ArrowRight size={14} />
    </button>
  </div>
  
  <div className="divide-y divide-slate-200 dark:divide-slate-700">
    {getRecentNotes().length > 0 ? (
      getRecentNotes().map((note, index) => (
        <div 
          key={note.id || index} 
          className="flex items-start p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" 
          onClick={() => onSelectGoal(note.goalId)}
        >
          <div className="mr-3 mt-1">
            {getCategoryIcon(note.category)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-slate-800 dark:text-slate-200 text-sm">{note.goalTitle}</h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 line-clamp-2">{note.text}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 dark:text-slate-500">
                {new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="ml-2">
            <ArrowRight size={16} className="text-slate-400" />
          </div>
        </div>
      ))
    ) : (
      <div className="p-6 text-center">
        <p className="text-slate-500 dark:text-slate-400">
          No progress notes yet. Add notes to your goals to track your journey.
        </p>
      </div>
    )}
  </div>
</div>
    </div>
  );
};

export default BucketListDashboard;