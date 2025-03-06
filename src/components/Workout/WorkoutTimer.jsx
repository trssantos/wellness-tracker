import React from 'react';
import { Clock, Zap, Droplet } from 'lucide-react';

const WorkoutTimer = ({ timeRemaining, totalTimeElapsed, currentState }) => {
  // Format seconds into mm:ss format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get the appropriate color for each state
  const getStateColor = () => {
    switch(currentState) {
      case 'exercise':
        return 'text-blue-500 dark:text-blue-400';
      case 'rest':
        return 'text-indigo-500 dark:text-indigo-400';
      case 'waterBreak':
        return 'text-teal-500 dark:text-teal-400';
      default:
        return 'text-slate-500 dark:text-slate-400';
    }
  };

  // Get the appropriate icon for each state
  const getStateIcon = () => {
    switch(currentState) {
      case 'exercise':
        return <Zap size={18} className="text-blue-500 dark:text-blue-400" />;
      case 'rest':
        return <Clock size={18} className="text-indigo-500 dark:text-indigo-400" />;
      case 'waterBreak':
        return <Droplet size={18} className="text-teal-500 dark:text-teal-400" />;
      default:
        return <Clock size={18} className="text-slate-500 dark:text-slate-400" />;
    }
  };

  // Get status text
  const getStatusText = () => {
    switch(currentState) {
      case 'exercise':
        return 'Exercise';
      case 'rest':
        return 'Rest Period';
      case 'waterBreak':
        return 'Water Break';
      default:
        return 'Ready';
    }
  };
  
  return (
    <div className="flex justify-between items-center">
      {/* Current activity */}
      <div className="flex items-center gap-2">
        {getStateIcon()}
        <span className={`font-medium ${getStateColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      {/* Timer display */}
      <div className="flex flex-col items-end">
        <div className={`text-xl font-bold ${getStateColor()}`}>
          {timeRemaining}s
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Total: {formatTime(totalTimeElapsed)}
        </div>
      </div>
    </div>
  );
};

export default WorkoutTimer;