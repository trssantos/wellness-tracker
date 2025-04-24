// src/components/Lifestyle/BiorhythmInfoCard.jsx
import React from 'react';
import { Activity, Heart, Brain, BarChart2, Info } from 'lucide-react';
import { isCriticalDay, getBiorhythmInterpretation, getBiorhythmColor } from '../../utils/biorhythmUtils';

const BiorhythmInfoCard = ({ biorhythmData, type }) => {
  if (!biorhythmData || !type) return null;
  
  const value = biorhythmData[type];
  const isCritical = isCriticalDay(value);
  const interpretation = getBiorhythmInterpretation(value, type);
  const colors = getBiorhythmColor(type);
  
  // Determine the appropriate icon
  const getIcon = () => {
    switch (type) {
      case 'physical':
        return <Activity className="text-red-500 dark:text-red-400" size={18} />;
      case 'emotional':
        return <Heart className="text-blue-500 dark:text-blue-400" size={18} />;
      case 'intellectual':
        return <Brain className="text-green-500 dark:text-green-400" size={18} />;
      case 'average':
        return <BarChart2 className="text-purple-500 dark:text-purple-400" size={18} />;
      default:
        return null;
    }
  };
  
  // Determine the appropriate background based on level
  const getBackgroundClass = () => {
    const baseClass = `rounded-lg p-4 border`;
    
    if (isCritical) {
      return `${baseClass} bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800/50`;
    }
    
    switch (interpretation.level) {
      case 'peak':
        return `${baseClass} bg-${colors.light} dark:bg-${type === 'physical' ? 'red' : type === 'emotional' ? 'blue' : type === 'intellectual' ? 'green' : 'purple'}-900/30 border-${colors.normal}/20 dark:border-${colors.dark}/50`;
      case 'high':
        return `${baseClass} bg-${colors.light} dark:bg-${type === 'physical' ? 'red' : type === 'emotional' ? 'blue' : type === 'intellectual' ? 'green' : 'purple'}-900/20 border-${colors.normal}/20 dark:border-${colors.dark}/40`;
      case 'neutral':
        return `${baseClass} bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700`;
      case 'low':
        return `${baseClass} bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600`;
      case 'valley':
        return `${baseClass} bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600`;
      default:
        return `${baseClass} bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700`;
    }
  };
  
  // Generate a dynamic class for the value display
  const getValueClass = () => {
    if (isCritical) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    
    if (value > 30) {
      return `text-${colors.normal} dark:text-${type === 'physical' ? 'red' : type === 'emotional' ? 'blue' : type === 'intellectual' ? 'green' : 'purple'}-400`;
    }
    
    if (value < -30) {
      return 'text-slate-600 dark:text-slate-400';
    }
    
    return 'text-slate-700 dark:text-slate-300';
  };
  
  const getTitleClass = () => {
    if (isCritical) {
      return 'text-yellow-700 dark:text-yellow-300';
    }
    
    return `text-${colors.normal} dark:text-${type === 'physical' ? 'red' : type === 'emotional' ? 'blue' : type === 'intellectual' ? 'green' : 'purple'}-400`;
  };
  
  return (
    <div className={getBackgroundClass()}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {getIcon()}
          <h3 className={`font-medium ml-2 ${getTitleClass()}`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </h3>
        </div>
        <span className={`font-bold text-lg ${getValueClass()}`}>
          {value}%
        </span>
      </div>
      
      <div className="flex items-start mt-2">
        <span className="text-2xl mr-2">{interpretation.emoji}</span>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {interpretation.description}
        </p>
      </div>
    </div>
  );
};

export default BiorhythmInfoCard;