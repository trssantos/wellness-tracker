import React from 'react';
import { CheckCircle, Circle, ChevronRight, Mountain, Brain, Dumbbell, Briefcase, Wallet, Sparkles, Star, CalendarClock } from 'lucide-react';

const GoalList = ({ goals, onSelectGoal }) => {
  // Get icon based on category id
  const getCategoryIcon = (categoryId) => {
    switch(categoryId) {
      case 'experiences': return <Mountain size={18} className="text-purple-500" />;
      case 'personal': return <Brain size={18} className="text-blue-500" />;
      case 'fitness': return <Dumbbell size={18} className="text-green-500" />;
      case 'career': return <Briefcase size={18} className="text-amber-500" />;
      case 'finance': return <Wallet size={18} className="text-emerald-500" />;
      case 'creative': return <Sparkles size={18} className="text-rose-500" />;
      default: return <Star size={18} className="text-slate-500" />;
    }
  };
  
  // Format target date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Calculate days left
  const getDaysLeft = (dateString) => {
    if (!dateString) return null;
    
    const targetDate = new Date(dateString);
    const today = new Date();
    
    // Reset time components for accurate day calculation
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Get appropriate status badge class based on goal status
  const getStatusBadgeClass = (goal) => {
    if (goal.completed) {
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
    }
    
    // If has target date
    if (goal.targetDate) {
      const daysLeft = getDaysLeft(goal.targetDate);
      
      if (daysLeft < 0) {
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      }
      
      if (daysLeft < 7) {
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
      }
      
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
    }
    
    // Default for in progress
    return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
  };
  
  // Get status text
  const getStatusText = (goal) => {
    if (goal.completed) {
      return "Completed";
    }
    
    if (goal.targetDate) {
      const daysLeft = getDaysLeft(goal.targetDate);
      
      if (daysLeft < 0) {
        return "Overdue";
      }
      
      if (daysLeft === 0) {
        return "Due today";
      }
      
      return `${daysLeft} days left`;
    }
    
    return "In progress";
  };
  
  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-700">
      {goals.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">No goals found. Create your first goal or adjust your filters.</p>
        </div>
      ) : (
        goals.map(goal => (
          <div 
            key={goal.id}
            className="py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors rounded-lg cursor-pointer"
            onClick={() => onSelectGoal(goal.id)}
          >
            <div className="flex items-center gap-4">
              {/* Status icon */}
              <div className="ml-2">
                {goal.completed 
                  ? <CheckCircle size={20} className="text-green-500 dark:text-green-400" /> 
                  : <Circle size={20} className="text-slate-300 dark:text-slate-600" />
                }
              </div>
              
              {/* Category icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                goal.category 
                  ? 'bg-slate-100 dark:bg-slate-700' 
                  : 'bg-slate-50 dark:bg-slate-800'
              }`}>
                {getCategoryIcon(goal.category)}
              </div>
              
              {/* Goal info */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-slate-800 dark:text-slate-200 truncate ${
                  goal.completed ? 'line-through text-slate-500 dark:text-slate-500' : ''
                }`}>
                  {goal.title}
                </h3>
                
                <div className="flex items-center gap-2 mt-1">
                  {/* Progress pill */}
                  {goal.progressType !== 'simple' && (
                    <div className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                      {goal.progressType === 'percentage' ? (
                        <span>{goal.progress}%</span>
                      ) : goal.progressType === 'counter' ? (
                        <span>{goal.currentValue}/{goal.targetValue}</span>
                      ) : goal.progressType === 'milestone' ? (
                        <span>{goal.completedMilestones || 0}/{goal.milestones?.length || 0} milestones</span>
                      ) : null}
                    </div>
                  )}
                  
                  {/* Target date */}
                  {goal.targetDate && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <CalendarClock size={12} />
                      <span>
                        {formatDate(goal.targetDate)}
                      </span>
                    </div>
                  )}
                  
                  {/* Status badge */}
                  <div className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(goal)}`}>
                    {getStatusText(goal)}
                  </div>
                </div>
              </div>
              
              {/* Chevron */}
              <div className="mr-2 text-slate-400">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default GoalList;