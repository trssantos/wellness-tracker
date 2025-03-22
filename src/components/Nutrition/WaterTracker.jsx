import React from 'react';
import { Droplets, Plus, Minus } from 'lucide-react';

export const WaterTracker = ({ waterIntake = 0, onChange }) => {
  const TARGET_GLASSES = 8; // Target of 8 glasses per day
  const MAX_GLASSES = 12; // Maximum number of glasses that can be tracked
  
  // Handle adding a glass of water
  const handleAddGlass = () => {
    if (waterIntake < MAX_GLASSES) {
      onChange(waterIntake + 1);
    }
  };
  
  // Handle removing a glass of water
  const handleRemoveGlass = () => {
    if (waterIntake > 0) {
      onChange(waterIntake - 1);
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = Math.min(100, Math.round((waterIntake / TARGET_GLASSES) * 100));
  
  // Get color class based on progress
  const getProgressColorClass = () => {
    if (progressPercentage >= 100) return 'bg-blue-500 dark:bg-blue-500';
    if (progressPercentage >= 75) return 'bg-blue-400 dark:bg-blue-400';
    if (progressPercentage >= 50) return 'bg-blue-300 dark:bg-blue-400';
    if (progressPercentage >= 25) return 'bg-blue-200 dark:bg-blue-500/50';
    return 'bg-blue-100 dark:bg-blue-500/30';
  };
  
  // Get text color class based on progress
  const getTextColorClass = () => {
    if (progressPercentage >= 100) return 'text-blue-700 dark:text-blue-300';
    if (progressPercentage >= 50) return 'text-blue-600 dark:text-blue-300';
    return 'text-blue-500 dark:text-blue-400';
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 transition-colors">
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          <Droplets className="text-blue-500 dark:text-blue-400" size={18} />
          <h3 className="font-medium text-slate-700 dark:text-slate-300 text-sm sm:text-base">Water Intake</h3>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleRemoveGlass}
            disabled={waterIntake === 0}
            className={`p-1 sm:p-1.5 rounded-full ${
              waterIntake === 0 
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-500 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50'
            } transition-colors`}
            aria-label="Remove glass"
          >
            <Minus size={14} className="sm:hidden" />
            <Minus size={16} className="hidden sm:block" />
          </button>
          
          <div className={`font-bold text-base sm:text-lg ${getTextColorClass()}`}>
            {waterIntake} / {TARGET_GLASSES}
          </div>
          
          <button
            onClick={handleAddGlass}
            disabled={waterIntake === MAX_GLASSES}
            className={`p-1 sm:p-1.5 rounded-full ${
              waterIntake === MAX_GLASSES 
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-500 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50'
            } transition-colors`}
            aria-label="Add glass"
          >
            <Plus size={14} className="sm:hidden" />
            <Plus size={16} className="hidden sm:block" />
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 sm:h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden transition-colors mb-2">
        <div 
          className={`h-full ${getProgressColorClass()} rounded-full transition-all duration-300`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Glasses Visualization */}
      <div className="flex justify-center">
        <div className="flex flex-wrap gap-1 justify-center">
          {Array.from({ length: MAX_GLASSES }).map((_, index) => (
            <button
              key={index}
              onClick={() => onChange(index + 1)}
              className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-colors ${
                index < waterIntake 
                  ? 'bg-blue-500 text-white' 
                  : index < TARGET_GLASSES
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
              }`}
              aria-label={`Set water intake to ${index + 1} glasses`}
            >
              <Droplets size={12} className="sm:hidden" />
              <Droplets size={14} className="hidden sm:block" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;