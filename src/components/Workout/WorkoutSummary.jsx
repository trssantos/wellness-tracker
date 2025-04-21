import React, { useState, useEffect } from 'react';
import { 
  AlertCircle,Award, Clock, Dumbbell, Check, X, Save, 
  Flame, Route, ArrowUp, ArrowDown, Droplet, Activity,
  ChevronDown, ChevronUp
} from 'lucide-react';
import './WorkoutSummary.css';
import ExerciseProgressMetrics from './ExerciseProgressMetrics';
import { getPreviousExercisePerformance,updateExerciseBaseline } from '../../utils/workoutUtils';
import { getWeightUnit, getDistanceUnit } from '../../utils/storage';

const WorkoutSummary = ({ 
  workout, 
  completedExercises, 
  totalTime, 
  waterBreaksTaken = 0,  // New prop with default
  waterBreakTime = 0,    // New prop with default
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
  const [weightUnit, setWeightUnit] = useState('kg'); // Add this line
  const [expandedExercises, setExpandedExercises] = useState({});
  
  // Calculate statistics
  const exerciseCount = completedExercises.length;
  const completedCount = completedExercises.filter(ex => ex.completed).length;
  const completionRate = exerciseCount > 0 ? Math.round((completedCount / exerciseCount) * 100) : 0;
  
  // Determine if this is a cardio-type workout
  const isCardioWorkout = ['running', 'walking', 'cycling', 'swimming', 'cardio', 'hiit'].includes(workout?.type);
  
  // Determine if this is a swimming workout
  const isSwimmingWorkout = workout?.type === 'swimming';

  // Initialize user preferences on component mount
  useEffect(() => {
    setWeightUnit(getWeightUnit());
    setDistanceUnit(getDistanceUnit());
  }, []);
  
  // Toggle exercise plan visibility
  const toggleExerciseExpanded = (index) => {
    setExpandedExercises(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Add this component to WorkoutSummary.jsx
  const SetAsBaselineButton = ({ 
    exercise, 
    actualValues,
    workoutId,
    onSuccess = () => {}
  }) => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    
   
    // Check if values are different from planned
const isDifferent = () => {
  if (!exercise || !actualValues) return false;
  
  if (exercise.isDurationBased) {
    return (
      parseInt(actualValues.actualSets || 0) !== parseInt(exercise.sets || 0) ||
      parseInt(actualValues.actualDuration || 0) !== parseInt(exercise.duration || 0) ||
      (actualValues.actualDurationUnit || 'min') !== (exercise.durationUnit || 'min') ||
      (actualValues.actualDistance || '') !== (exercise.distance || '')
    );
  } else {
    return (
      parseInt(actualValues.actualSets || 0) !== parseInt(exercise.sets || 0) ||
      parseInt(actualValues.actualReps || 0) !== parseInt(exercise.reps || 0) ||
      (actualValues.actualWeight !== exercise.weight && 
       actualValues.actualWeight !== '')
    );
  }
};
    
    // Handle the button click
    const handleClick = async () => {
      try {
        // This function should now update version history
        const updatedWorkout = await updateExerciseBaseline(workoutId, exercise.name, actualValues);
        if (updatedWorkout) {
          setShowSuccess(true);
          onSuccess(exercise.name, updatedWorkout);
          setTimeout(() => setShowSuccess(false), 3000);
        } else {
          throw new Error("Failed to update baseline");
        }
      } catch (error) {
        console.error("Error updating exercise baseline:", error);
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    };
    
    // Don't show the button if values aren't different
    if (!isDifferent()) return null;
    
    return (
      <div className="relative mt-2">
        <button
          onClick={handleClick}
          className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs flex items-center gap-1 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          title="Update the planned values to match your actual performance"
        >
          <ArrowUp size={12} />
          Set as new baseline
        </button>
        
        {/* Success notification */}
        {showSuccess && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded text-xs flex items-center gap-1 z-10 whitespace-nowrap">
            <Check size={12} />
            Baseline updated!
          </div>
        )}
        
        {/* Error notification */}
        {showError && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded text-xs flex items-center gap-1 z-10 whitespace-nowrap">
            <AlertCircle size={12} />
            Failed to update baseline
          </div>
        )}
      </div>
    );
  };

// Add a function to handle successful baseline updates
const handleBaselineUpdated = (exerciseName, updatedWorkout) => {
  console.log(`Baseline updated for ${exerciseName}`);
  // You could show a global notification or update state if needed
};
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Format time helper function
  const formatTimeWaterBreak = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
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
        
        {/* First row: Calories and Water Breaks side by side */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Calories */}
          <div className="col-span-1">
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
          
          {/* Water Breaks */}
          <div className="mt-1 mb-4">
    <div className="flex items-center gap-2 mb-1">
      <Droplet size={14} className="text-blue-500 dark:text-blue-400" />
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Water Break Stats</span>
    </div>
    
    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex flex-col">
          <span className="text-blue-700 dark:text-blue-300 font-medium">{waterBreaksTaken}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {waterBreaksTaken === 1 ? 'Break' : 'Breaks'} Taken
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-blue-700 dark:text-blue-300 font-medium">{formatTimeWaterBreak(waterBreakTime)}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Break Time</span>
        </div>
      </div>
    </div>
  </div>
        </div>
        
        {/* Second row: Intensity taking full width */}
        <div className="w-full">
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
        
        {/* Conditionally show distance and incline for cardio workouts */}
        {isCardioWorkout && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Distance */}
            <div className="col-span-1">
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
            
            {/* Incline - only for running/walking/cycling */}
            {['running', 'walking', 'cycling'].includes(workout?.type) && (
              <div className="col-span-1">
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
        )}
      </div>
      
      {/* Exercise Summary - Updated with last performance and planned details */}
      <div className="exercise-summary">
        <h4>Exercise Summary</h4>
        <div className="exercises-list">
          {completedExercises.map((exercise, index) => {
            // Determine if the exercise has actual values different from planned
            const hasDifferentValues = 
              (exercise.actualSets !== undefined && exercise.actualSets !== exercise.sets) ||
              (exercise.actualReps !== undefined && exercise.actualReps !== exercise.reps) ||
              (exercise.actualWeight !== undefined && exercise.actualWeight !== exercise.weight) ||
              (exercise.actualDuration !== undefined && exercise.actualDuration !== exercise.duration) ||
              (exercise.actualDistance !== undefined && exercise.actualDistance !== exercise.distance) ||
              (exercise.actualDurationUnit !== undefined && exercise.actualDurationUnit !== exercise.durationUnit);
            
            const isExpanded = !!expandedExercises[index];
            
            return (
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
                <div className="flex-1">
                  <div className="exercise-name">
                    {exercise.name}
                  </div>

                  {/* Actual performance */}
                  <div className="exercise-details">
                    {exercise.completed && (
                      <span className={hasDifferentValues ? "text-blue-600 dark:text-blue-400 font-medium" : ""}>
                        {exercise.isDurationBased ? (
                          // Duration-based exercise (actual performance)
                          <span>
                            {exercise.actualSets !== undefined ? exercise.actualSets : exercise.sets || 1}× 
                            {exercise.actualDuration !== undefined ? exercise.actualDuration : exercise.duration || 0} 
                            {exercise.actualDurationUnit || exercise.durationUnit || 'min'}
                            {(exercise.actualDistance || exercise.distance) ? 
                              ` - ${exercise.actualDistance || exercise.distance}${!(exercise.actualDistance || exercise.distance).includes('km') && !(exercise.actualDistance || exercise.distance).includes('mi') ? ' ' + distanceUnit : ''}` : 
                              ''}
                            {exercise.timeSpent ? ` (${formatExerciseTime(exercise.timeSpent)} total)` : ''}
                          </span>
                        ) : (
                          // Traditional strength exercise (actual performance)
                          <span>
                            {exercise.actualSets !== undefined ? exercise.actualSets : exercise.sets || 0}× 
                            {exercise.actualReps !== undefined ? exercise.actualReps : exercise.reps || 0} 
                            {(exercise.actualWeight !== undefined || exercise.weight) ? 
                              ` @ ${exercise.actualWeight !== undefined ? exercise.actualWeight : exercise.weight} ${weightUnit}` : 
                              ''}
                          </span>
                        )}
                        {hasDifferentValues && (
                          <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">(actual)</span>
                        )}
                      </span>
                    )}
                  </div>

                  {hasDifferentValues && workout && workout.id && (
          <SetAsBaselineButton
            exercise={exercise}
            actualValues={{
              actualSets: exercise.actualSets,
              actualReps: exercise.actualReps,
              actualWeight: exercise.actualWeight,
              actualDuration: exercise.actualDuration,
              actualDurationUnit: exercise.actualDurationUnit,
              actualDistance: exercise.actualDistance
            }}
            workoutId={workout.id}
            onSuccess={handleBaselineUpdated}
          />
        )}

                  {/* Last Performance Section */}
                  {exercise.completed && (
                    <>
                      {/* Get previous performance */}
                      {(() => {
                        const previousExercise = getPreviousExercisePerformance(exercise.name);
                        if (previousExercise) {
                          return (
                            <div className="mt-3 w-full p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                              <div className="flex items-center justify-between w-full">
                                <span className="text-blue-600 dark:text-blue-400 font-medium">Last performance:</span>
                                <span className="text-slate-500 dark:text-slate-400">
                                  {previousExercise.date ? formatDate(previousExercise.date) : ''}
                                </span>
                              </div>
                              <div className="mt-1">
                                {!previousExercise.isDurationBased 
                                  ? <span>
                                      {previousExercise.actualSets || previousExercise.sets || 0}×
                                      {previousExercise.actualReps || previousExercise.reps || 0}
                                      {previousExercise.actualWeight || previousExercise.weight 
                                        ? ` @ ${previousExercise.actualWeight || previousExercise.weight} ${weightUnit}` 
                                        : ''}
                                    </span> 
                                  : <span>
                                      {previousExercise.actualDuration || previousExercise.duration || 0} 
                                      {previousExercise.actualDurationUnit || previousExercise.durationUnit || 'min'}
                                      {previousExercise.actualDistance || previousExercise.distance 
                                        ? ` - ${previousExercise.actualDistance || previousExercise.distance}`
                                        : ''}
                                    </span>
                                }
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Progress metrics */}
                      <div className="mt-3 w-full">
                        <ExerciseProgressMetrics
                          currentExercise={exercise}
                          previousExercise={getPreviousExercisePerformance(exercise.name)}
                          isDurationBased={exercise.isDurationBased}
                          weightUnit={weightUnit}
                          distanceUnit={distanceUnit}
                          compact={false}
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Expandable section with original workout plan */}
                  {hasDifferentValues && (
                    <div className="mt-3 w-full">
                      <button 
                        onClick={() => toggleExerciseExpanded(index)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={14} />
                            Hide planned
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} />
                            Show planned
                          </>
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg w-full">
                          <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Planned:</div>
                          <div className="text-slate-700 dark:text-slate-300 text-sm">
                            {exercise.isDurationBased ? (
                              // Duration-based exercise (planned)
                              <span>
                                {exercise.sets || 1}× 
                                {exercise.duration || 0} 
                                {exercise.durationUnit || 'min'}
                                {exercise.distance ? 
                                  ` • ${exercise.distance}${!exercise.distance.includes('km') && !exercise.distance.includes('mi') ? ' ' + distanceUnit : ''}` : 
                                  ''}
                              </span>
                            ) : (
                              // Traditional strength exercise (planned)
                              <span>
                                {exercise.sets || 0}× 
                                {exercise.reps || 0} 
                                {exercise.weight ? 
                                  ` • ${exercise.weight} ${weightUnit}` : 
                                  ''}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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