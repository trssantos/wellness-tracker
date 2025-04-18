import React, { useState } from 'react';
import { 
  Award, Clock, Dumbbell, Check, X, Save, 
  Flame, Route, ArrowUp, Droplet, Activity 
} from 'lucide-react';
import './WorkoutSummary.css';

const WorkoutSummary = ({ 
  workout, 
  completedExercises, 
  totalTime, 
  notes, 
  onNotesChange, 
  onSave, 
  onClose,
  theme = 'modern'
}) => {
  // Add state for additional metrics
  const [calories, setCalories] = useState('');
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [incline, setIncline] = useState('');
  const [intensity, setIntensity] = useState('3');
  const [waterBreaksTaken, setWaterBreaksTaken] = useState('0');
  
  // Calculate statistics
  const exerciseCount = completedExercises.length;
  const completedCount = completedExercises.filter(ex => ex.completed).length;
  const completionRate = exerciseCount > 0 ? Math.round((completedCount / exerciseCount) * 100) : 0;
  
  // Determine if this is a cardio-type workout
  const isCardioWorkout = ['running', 'walking', 'cycling', 'swimming', 'cardio', 'hiit'].includes(workout?.type);
  
  // Determine if this is a swimming workout
  const isSwimmingWorkout = workout?.type === 'swimming';
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatExerciseTime = (seconds) => {
    // Handle non-numeric or undefined input
    if (seconds === undefined || seconds === null) return "0s";
    
    // Ensure we're working with a number
    const totalSeconds = typeof seconds === 'string' ? parseInt(seconds) : seconds;
    
    if (isNaN(totalSeconds)) {
      // If it's a valid date string, use the original date formatting
      if (typeof seconds === 'string' && 
          (seconds.includes('T') || seconds.includes('Z') || 
           seconds.includes('-') || seconds.includes(':'))) {
        try {
          const date = new Date(seconds);
          if (!isNaN(date.getTime())) {
            return date.toLocaleTimeString('default', {
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        } catch (e) {
          console.error("Error parsing date:", e);
        }
      }
      return String(seconds); // Return as is if we can't parse it
    }
    
    // Calculate hours, minutes, seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    
    // Format based on duration length
    if (hours > 0) {
      // Long format: "2h 15m"
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
    } else if (minutes > 0) {
      // Medium format: "5m 30s"
      return `${minutes}m ${remainingSeconds > 0 ? `${remainingSeconds}s` : ''}`;
    } else {
      // Short format: "45s"
      return `${remainingSeconds}s`;
    }
  };

  // Handle final save with all metrics
  const handleSave = () => {
    // Create an enhanced workout data object with the additional metrics
    const enhancedWorkout = {
      calories: calories ? parseInt(calories) : null,
      distance: distance || null,
      distanceUnit: distanceUnit,
      incline: incline || null,
      intensity: intensity,
      completionRate: completedCount / exerciseCount * 100,
      waterBreaksTaken: waterBreaksTaken ? parseInt(waterBreaksTaken) : 0,
      notes
    };
    
    // Call the original onSave with enhanced data
    onSave(enhancedWorkout);
  };
  
  return (
    <div className={`workout-summary theme-${theme}`}>
      <div className="summary-header">
        <div className="summary-title">
          <Award size={24} className="summary-icon" />
          <h3>Workout Complete!</h3>
        </div>
        
        <div className="summary-stats">
          <div className="stat-item">
            <Clock size={18} />
            <span>{formatTime(totalTime)}</span>
          </div>
          <div className="stat-item">
            <Dumbbell size={18} />
            <span>{completedCount}/{exerciseCount} exercises</span>
          </div>
          <div className="stat-item">
            <div className="completion-badge" style={{ backgroundColor: getCompletionColor(completionRate) }}>
              {completionRate}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Workout Metrics - Enhanced to collect additional data */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
        <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-4">Workout Metrics</h4>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Calories - for all workout types */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Flame size={14} className="text-red-500 dark:text-red-400" />
              Calories Burned
            </label>
            <div className="relative">
              <input
                type="text"
                value={calories}
                onChange={(e) => setCalories(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter calories..."
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500 dark:text-slate-400">
                kcal
              </div>
            </div>
          </div>
          
          {/* Intensity - for all workout types */}
<div className="col-span-2 md:col-span-1">
  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
    <Activity size={14} className="text-purple-500 dark:text-purple-400" />
    Intensity Level
  </label>
  <div className="flex flex-col">
    <div className="flex justify-between mb-1 text-xs text-slate-500 dark:text-slate-400">
      <span>Light</span>
      <span>Medium</span>
      <span>Maximum</span>
    </div>
    <div className="grid grid-cols-5 gap-1 mb-1">
      {[1, 2, 3, 4, 5].map((level) => (
        <button
          key={level}
          onClick={() => setIntensity(level.toString())}
          className={`py-2 rounded ${
            parseInt(intensity) === level 
              ? 'bg-purple-500 dark:bg-purple-600 text-white' 
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          {level}
        </button>
      ))}
    </div>
    <div className="text-xs text-center text-slate-500 dark:text-slate-400">
      {parseInt(intensity) === 1 && "Light"}
      {parseInt(intensity) === 2 && "Moderate"}
      {parseInt(intensity) === 3 && "Challenging"}
      {parseInt(intensity) === 4 && "Intense"}
      {parseInt(intensity) === 5 && "Maximum"}
    </div>
  </div>
</div>

          
          {/* Water Breaks - for all workout types */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Droplet size={14} className="text-blue-500 dark:text-blue-400" />
              Water Breaks Taken
            </label>
            <input
              type="text"
              value={waterBreaksTaken}
              onChange={(e) => setWaterBreaksTaken(e.target.value.replace(/\D/g, ''))}
              placeholder="Number of water breaks"
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>
          
          {/* Distance - only for cardio workouts */}
          {isCardioWorkout && (
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Route size={14} className="text-green-500 dark:text-green-400" />
                Distance
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="Enter distance..."
                  className="w-2/3 p-2 border-r-0 border border-slate-300 dark:border-slate-600 rounded-l-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
                <select
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value)}
                  className="w-1/3 p-2 border border-slate-300 dark:border-slate-600 rounded-r-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="km">km</option>
                  <option value="mi">mi</option>
                  <option value="m">m</option>
                  {isSwimmingWorkout && <option value="laps">laps</option>}
                </select>
              </div>
            </div>
          )}
          
          {/* Incline - only for running/walking/cycling */}
          {['running', 'walking', 'cycling'].includes(workout?.type) && (
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <ArrowUp size={14} className="text-amber-500 dark:text-amber-400" />
                Incline
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={incline}
                  onChange={(e) => setIncline(e.target.value)}
                  placeholder="Enter incline..."
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500 dark:text-slate-400">
                  %
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Exercise Summary */}
      <div className="exercise-summary">
        <h4>Exercise Summary</h4>
        <div className="exercises-list">
        {completedExercises.map((exercise, index) => (
  <div 
    key={index} 
    className={`exercise-item ${exercise.completed ? 'completed' : 'incomplete'}`}
  >
    <div className="exercise-status">
      {exercise.completed ? 
        <Check size={16} className="status-icon completed" /> : 
        <X size={16} className="status-icon incomplete" />
      }
    </div>
    <div className="exercise-name">
      {exercise.name}
    </div>
    <div className="exercise-details">
      {exercise.completed && (
        <span>
          {exercise.isDurationBased ? (
            // For duration-based exercises with sets
            exercise.actualSets && exercise.actualSets > 1 ? 
              // Multi-set duration exercise
              `${exercise.actualSets}×${exercise.actualDuration || 0} ${exercise.actualDurationUnit || 'min'} (${formatExerciseTime(exercise.timeSpent)} total)${exercise.actualDistance ? ` - ${exercise.actualDistance}` : ''}` 
              : 
              // Single-set duration exercise
              `${exercise.actualDuration || 0} ${exercise.actualDurationUnit || 'min'}${exercise.timeSpent && exercise.timeSpent !== (exercise.actualDuration * 60) ? ` (${formatExerciseTime(exercise.timeSpent)} actual)` : ''}${exercise.actualDistance ? ` - ${exercise.actualDistance}` : ''}`
          ) : (
            // Show sets/reps for traditional exercises
            `${exercise.actualSets || 0}×${exercise.actualReps || 0}${exercise.actualWeight ? ` @ ${exercise.actualWeight}` : ''}`
          )}
        </span>
      )}
    </div>
  </div>
))}
        </div>
      </div>
      
      {/* Notes */}
      <div className="notes-section">
        <h4>Workout Notes</h4>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="How did your workout feel? Any personal records or challenges?"
          className="notes-input"
        />
      </div>
      
      {/* Action Buttons */}
      <div className="summary-actions">
        <button onClick={onClose} className="cancel-button">
          <X size={18} />
          Close
        </button>
        <button onClick={handleSave} className="save-button">
          <Save size={18} />
          Save Workout
        </button>
      </div>
    </div>
  );
};

// Helper function to get color based on completion rate
const getCompletionColor = (rate) => {
  if (rate >= 90) return '#10b981'; // Green
  if (rate >= 75) return '#3b82f6'; // Blue
  if (rate >= 50) return '#f59e0b'; // Yellow
  return '#ef4444'; // Red
};

export default WorkoutSummary;