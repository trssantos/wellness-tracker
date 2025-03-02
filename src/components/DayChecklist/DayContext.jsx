// DayChecklist/DayContext.jsx
import React from 'react';
import { HelpCircle, Zap, Sun, Moon } from 'lucide-react';
import { MOODS } from '../MoodSelector';

const DayContext = ({ context, onUpdate }) => {
  const { 
    morningMood, 
    eveningMood, 
    morningEnergy, 
    eveningEnergy, 
    objective, 
    isAIGenerated, 
    context: aiContext 
  } = context;

  const getEnergyColor = (level, currentLevel) => {
    if (level > currentLevel) return 'text-slate-300 dark:text-slate-600';
    if (currentLevel === 1) return 'text-red-500 dark:text-red-400';
    if (currentLevel === 2) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-green-500 dark:text-green-400';
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6 transition-colors">
      <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-3 transition-colors">
        {isAIGenerated ? "Generated Task Context" : "Day Context"}
      </h4>
      
      <div className="space-y-3">
        {/* Morning Context */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-amber-50/50 dark:bg-amber-900/20 p-2 rounded-lg transition-colors">
          <div className="flex items-center gap-1 w-24">
            <Sun size={16} className="text-amber-500 dark:text-amber-400" />
            <span className="text-slate-600 dark:text-slate-400 transition-colors">Morning:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Morning Mood */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 dark:text-slate-500 transition-colors">Mood:</span>
              {morningMood && MOODS[morningMood] ? (
                <span className="text-xl">{MOODS[morningMood].emoji}</span>
              ) : (
                <span className="text-sm italic text-slate-400 dark:text-slate-500">Not set</span>
              )}
            </div>
            
            {/* Morning Energy */}
            <div className="flex items-center gap-1 ml-3">
              <span className="text-xs text-slate-500 dark:text-slate-500 transition-colors">Energy:</span>
              <div className="flex">
                {[1, 2, 3].map((level) => (
                  <Zap
                    key={level}
                    size={16}
                    className={`
                      ${level <= morningEnergy ? 'fill-current' : 'fill-none'}
                      ${getEnergyColor(level, morningEnergy)}
                    `}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Evening Context */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-indigo-50/50 dark:bg-indigo-900/20 p-2 rounded-lg transition-colors">
          <div className="flex items-center gap-1 w-24">
            <Moon size={16} className="text-indigo-500 dark:text-indigo-400" />
            <span className="text-slate-600 dark:text-slate-400 transition-colors">Evening:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Evening Mood */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 dark:text-slate-500 transition-colors">Mood:</span>
              {eveningMood && MOODS[eveningMood] ? (
                <span className="text-xl">{MOODS[eveningMood].emoji}</span>
              ) : (
                <span className="text-sm italic text-slate-400 dark:text-slate-500">Not set</span>
              )}
            </div>
            
            {/* Evening Energy */}
            <div className="flex items-center gap-1 ml-3">
              <span className="text-xs text-slate-500 dark:text-slate-500 transition-colors">Energy:</span>
              <div className="flex">
                {[1, 2, 3].map((level) => (
                  <Zap
                    key={level}
                    size={16}
                    className={`
                      ${level <= eveningEnergy ? 'fill-current' : 'fill-none'}
                      ${getEnergyColor(level, eveningEnergy)}
                    `}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Task Objective (if applicable) */}
        {isAIGenerated && objective && (
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400 w-16 transition-colors">Focus:</span>
            <span className="flex-1 text-slate-700 dark:text-slate-300 transition-colors">{objective}</span>
            {aiContext && (
              <div className="group relative">
                <HelpCircle 
                  size={16} 
                  className="text-blue-500 dark:text-blue-400 cursor-help"
                />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg p-2 hidden group-hover:block z-10">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-800 dark:bg-slate-700 rotate-45"></div>
                  Additional Context: {aiContext}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayContext;