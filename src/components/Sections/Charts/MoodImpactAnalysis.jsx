import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, Book, Dumbbell, CheckSquare, BarChart2 } from 'lucide-react';
import { MOODS } from '../../MoodSelector';

export const MoodImpactAnalysis = ({ data }) => {
  if (!data || !data.insights || Object.keys(data.insights).length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-slate-500 dark:text-slate-400 text-center">
          Not enough data to analyze mood impacts yet. Try tracking both morning and evening moods for a few days.
        </p>
      </div>
    );
  }
  
  const { insights } = data;
  
  return (
    <div className="space-y-4">
      {/* Overall Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 transition-colors">
        <h4 className="flex items-center text-lg font-medium text-slate-800 dark:text-slate-100 mb-3 transition-colors">
          <Sparkles className="mr-2 text-purple-500 dark:text-purple-400" size={20} />
          Overall Impact Insights
        </h4>
        
        <div className="text-slate-700 dark:text-slate-300 transition-colors">
          <p className="mb-3">{insights.summary}</p>
          
          <div className="flex flex-wrap gap-2">
            {insights.positiveFactors && insights.positiveFactors.map((factor, idx) => (
              <span key={idx} className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm transition-colors">
                <TrendingUp size={14} className="inline mr-1" />
                {factor}
              </span>
            ))}
            
            {insights.negativeFactors && insights.negativeFactors.map((factor, idx) => (
              <span key={idx} className="px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm transition-colors">
                <TrendingDown size={14} className="inline mr-1" />
                {factor}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Activities Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Journaling Impact */}
        {insights.journalImpact && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 transition-colors">
            <h4 className="flex items-center font-medium text-slate-800 dark:text-slate-100 mb-3 transition-colors">
              <Book className="mr-2 text-teal-500 dark:text-teal-400" size={18} />
              Journal Impact
            </h4>
            
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center
                ${insights.journalImpact.impact > 0 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                  : insights.journalImpact.impact < 0
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                } transition-colors`}
              >
                {insights.journalImpact.impact > 0 
                  ? <TrendingUp size={24} />
                  : insights.journalImpact.impact < 0
                    ? <TrendingDown size={24} />
                    : <BarChart2 size={24} />
                }
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-600 dark:text-slate-400 transition-colors">Average impact</div>
                <div className="text-lg font-medium text-slate-800 dark:text-slate-100 transition-colors">
                  {insights.journalImpact.impact > 0 ? '+' : ''}{insights.journalImpact.impact.toFixed(1)} 
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-1 transition-colors">points</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
              {insights.journalImpact.description}
            </p>
          </div>
        )}
        
        {/* Task Completion Impact */}
        {insights.taskImpact && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 transition-colors">
            <h4 className="flex items-center font-medium text-slate-800 dark:text-slate-100 mb-3 transition-colors">
              <CheckSquare className="mr-2 text-blue-500 dark:text-blue-400" size={18} />
              Task Completion Impact
            </h4>
            
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center
                ${insights.taskImpact.impact > 0 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                  : insights.taskImpact.impact < 0
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                } transition-colors`}
              >
                {insights.taskImpact.impact > 0 
                  ? <TrendingUp size={24} />
                  : insights.taskImpact.impact < 0
                    ? <TrendingDown size={24} />
                    : <BarChart2 size={24} />
                }
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-600 dark:text-slate-400 transition-colors">Average impact</div>
                <div className="text-lg font-medium text-slate-800 dark:text-slate-100 transition-colors">
                  {insights.taskImpact.impact > 0 ? '+' : ''}{insights.taskImpact.impact.toFixed(1)} 
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-1 transition-colors">points</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
              {insights.taskImpact.description}
            </p>
          </div>
        )}
        
        {/* Workout Impact */}
        {insights.workoutImpact && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 transition-colors">
            <h4 className="flex items-center font-medium text-slate-800 dark:text-slate-100 mb-3 transition-colors">
              <Dumbbell className="mr-2 text-green-500 dark:text-green-400" size={18} />
              Workout Impact
            </h4>
            
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center
                ${insights.workoutImpact.impact > 0 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                  : insights.workoutImpact.impact < 0
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                } transition-colors`}
              >
                {insights.workoutImpact.impact > 0 
                  ? <TrendingUp size={24} />
                  : insights.workoutImpact.impact < 0
                    ? <TrendingDown size={24} />
                    : <BarChart2 size={24} />
                }
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-600 dark:text-slate-400 transition-colors">Average impact</div>
                <div className="text-lg font-medium text-slate-800 dark:text-slate-100 transition-colors">
                  {insights.workoutImpact.impact > 0 ? '+' : ''}{insights.workoutImpact.impact.toFixed(1)} 
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-1 transition-colors">points</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
              {insights.workoutImpact.description}
            </p>
          </div>
        )}
      </div>
      
      {/* Day Type Analysis */}
      {insights.dayTypes && insights.dayTypes.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 transition-colors">
          <h4 className="flex items-center text-lg font-medium text-slate-800 dark:text-slate-100 mb-3 transition-colors">
            <BarChart2 className="mr-2 text-blue-500 dark:text-blue-400" size={20} />
            Mood Impact by Day Type
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {insights.dayTypes.map((dayType, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center
                    ${dayType.averageChange > 0 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                      : dayType.averageChange < 0
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    } transition-colors`}
                  >
                    {dayType.icon}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-100 transition-colors">
                      {dayType.name}
                    </div>
                    <div className={`text-sm 
                      ${dayType.averageChange > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : dayType.averageChange < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-500 dark:text-slate-400'
                      } transition-colors`}
                    >
                      {dayType.averageChange > 0 ? '+' : ''}{dayType.averageChange.toFixed(1)} points
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors">
                  {dayType.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodImpactAnalysis;