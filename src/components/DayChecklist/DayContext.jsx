// DayChecklist/DayContext.jsx
import React from 'react';
import { HelpCircle, Zap } from 'lucide-react';
import { MOODS } from '../MoodSelector';

const DayContext = ({ context, onUpdate }) => {
  const { mood, energyLevel, objective, isAIGenerated, context: aiContext } = context;

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
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-slate-600 dark:text-slate-400 w-16 transition-colors">Mood:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MOODS).map(([key, { emoji, label, color }]) => {
              const isSelected = mood === key;
              return (
                <button
                  key={key}
                  onClick={() => onUpdate({ ...context, mood: key })}
                  className={`
                    p-2 rounded-lg transition-all
                    ${isSelected ? `${color} shadow-md ring-2 ring-blue-500` : 'hover:bg-slate-100 dark:hover:bg-slate-700'}
                    ${!isSelected && mood ? 'opacity-40' : 'opacity-100'}
                  `}
                  title={label}
                >
                  <span className="text-xl">{emoji}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 dark:text-slate-400 w-16 transition-colors">Energy:</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                onClick={() => onUpdate({ ...context, energyLevel: level })}
                className="transition-colors cursor-pointer"
              >
                <Zap
                  size={16}
                  className={`
                    ${level <= energyLevel ? 'fill-current' : 'fill-none'}
                    ${getEnergyColor(level, energyLevel)}
                  `}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 dark:text-slate-400 w-16 transition-colors">Focus:</span>
          <span className="flex-1 text-slate-700 dark:text-slate-300 transition-colors">{objective || "Another regular day"}</span>
          {isAIGenerated && aiContext && (
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
      </div>
    </div>
  );
};

export default DayContext;