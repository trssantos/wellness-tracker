import React from 'react';
import { ArrowLeft, Activity, Calendar, BarChart2, Award, TrendingUp } from 'lucide-react';

// This is a placeholder for the analytics component that will be implemented in Phase 4
const WorkoutAnalytics = ({ onBack }) => {
  return (
    <div className="px-2 sm:px-0 w-full overflow-hidden">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <button 
          onClick={onBack}
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">
          Workout Analytics
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <BarChart2 size={28} className="text-blue-500 dark:text-blue-400" />
        </div>
        
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">
          Analytics Coming Soon
        </h3>
        
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
          Detailed workout analytics will be available here in a future update, including:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Activity size={20} className="text-blue-500 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <div className="font-medium text-slate-700 dark:text-slate-200">Performance Tracking</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Track your progress over time</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Calendar size={20} className="text-green-500 dark:text-green-400" />
            </div>
            <div className="text-left">
              <div className="font-medium text-slate-700 dark:text-slate-200">Consistency Analysis</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">See your workout patterns</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <Award size={20} className="text-amber-500 dark:text-amber-400" />
            </div>
            <div className="text-left">
              <div className="font-medium text-slate-700 dark:text-slate-200">Achievement System</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Earn badges for your efforts</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <TrendingUp size={20} className="text-purple-500 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <div className="font-medium text-slate-700 dark:text-slate-200">Stats Dashboard</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Visualize your fitness journey</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutAnalytics;