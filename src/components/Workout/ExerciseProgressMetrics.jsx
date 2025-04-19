import React from 'react';
import { TrendingUp, Award, ArrowUp, ArrowDown } from 'lucide-react';
import { getPreviousExercisePerformance } from '../../utils/workoutUtils';

/**
 * Component to display progress metrics between current and previous exercise performances
 */
const ExerciseProgressMetrics = ({ 
  currentExercise,  // Current exercise data 
  previousExercise, // Previous exercise data for comparison
  isDurationBased = false, // Whether this is a duration-based exercise
  weightUnit = 'lbs', // Unit for weight display
  distanceUnit = 'km', // Unit for distance display
  compact = false // For more compact display in some contexts
}) => {
  
  // Only show if we have both current and previous data
  if (!currentExercise || !previousExercise) {
    return null;
  }
  
  // Calculate progress between current and previous value with improved logic
  const calculateProgress = (current, previous, isHigherBetter = true) => {
    // Ensure we have valid numbers to compare
    if (current === undefined || previous === undefined || 
        current === null || previous === null) {
      return { value: 0, direction: 'neutral' };
    }
    
    // Convert to numbers if they're not already
    const currentVal = typeof current === 'number' ? current : parseFloat(current);
    const previousVal = typeof previous === 'number' ? previous : parseFloat(previous);
    
    // Check for NaN after conversion
    if (isNaN(currentVal) || isNaN(previousVal)) {
      console.log('Invalid values for progress calculation:', { current, previous });
      return { value: 0, direction: 'neutral' };
    }
    
    // Calculate the difference
    const diff = currentVal - previousVal;
    
    // Use a small epsilon for floating point comparison
    const epsilon = 0.001;
    if (Math.abs(diff) < epsilon) {
      return { value: 0, direction: 'neutral' };
    }
    
    const direction = diff > 0 ? 'up' : 'down';
    const isPositive = isHigherBetter ? direction === 'up' : direction === 'down';
    
    return {
      value: Math.abs(diff),
      direction,
      isPositive
    };
  };

  // Get trend icon based on progress direction
  const getTrendIcon = (progress) => {
    if (!progress) return null;
    
    if (progress.direction === 'up') {
      return <ArrowUp size={12} className={progress.isPositive ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"} />;
    }
    if (progress.direction === 'down') {
      return <ArrowDown size={12} className={progress.isPositive ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"} />;
    }
    return null;
  };
  
  // Extract values for strength exercises - improved parsing logic
  // For weight, strip any non-numeric characters except decimal point before parsing
  const parseWeight = (weightStr) => {
    if (!weightStr) return 0;
    // Allow for decimal numbers but remove any non-numeric characters (like 'kg', 'lbs')
    const cleaned = String(weightStr).replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  };
  
  const currentWeight = parseWeight(currentExercise.actualWeight || currentExercise.weight);
  const previousWeight = parseWeight(previousExercise.actualWeight || previousExercise.weight);
  
  // For reps and sets, ensure we're getting clean integer values
  const currentReps = parseInt(currentExercise.actualReps || currentExercise.reps || 0);
  const previousReps = parseInt(previousExercise.actualReps || previousExercise.reps || 0);
  
  const currentSets = parseInt(currentExercise.actualSets || currentExercise.sets || 0);
  const previousSets = parseInt(previousExercise.actualSets || previousExercise.sets || 0);
  
  // Calculate volume (sets * reps * weight)
  const currentVolume = currentSets * currentReps * currentWeight;
  const previousVolume = previousSets * previousReps * previousWeight;
  
  // Extract values for duration-based exercises
  const currentDuration = parseInt(currentExercise.actualDuration || currentExercise.duration || 0);
  const currentDurationUnit = currentExercise.actualDurationUnit || currentExercise.durationUnit || 'min';
  const currentDurationInSec = currentDurationUnit === 'min' ? currentDuration * 60 : currentDuration;
  
  const previousDuration = parseInt(previousExercise.actualDuration || previousExercise.duration || 0);
  const previousDurationUnit = previousExercise.actualDurationUnit || previousExercise.durationUnit || 'min';
  const previousDurationInSec = previousDurationUnit === 'min' ? previousDuration * 60 : previousDuration;
  
  // Extract distance values if available
  const getDistanceValue = (distStr) => {
    if (!distStr) return 0;
    const match = distStr.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  };
  
  const currentDistance = getDistanceValue(currentExercise.actualDistance || currentExercise.distance);
  const previousDistance = getDistanceValue(previousExercise.actualDistance || previousExercise.distance);
  
  // Calculate pace (seconds per distance unit)
  const currentPace = currentDistance > 0 ? currentDurationInSec / currentDistance : 0;
  const previousPace = previousDistance > 0 ? previousDurationInSec / previousDistance : 0;
  
  // Calculate progress metrics
  // Also track sets changes
  const setsProgress = calculateProgress(currentSets, previousSets);
  
  // Calculate progress metrics with improved handling
  const weightProgress = currentWeight && previousWeight ? calculateProgress(currentWeight, previousWeight) : { direction: 'neutral' };
  const repsProgress = currentReps && previousReps ? calculateProgress(currentReps, previousReps) : { direction: 'neutral' };
  const volumeProgress = currentVolume > 0 && previousVolume > 0 ? calculateProgress(currentVolume, previousVolume) : { direction: 'neutral' };
  const durationProgress = currentDuration && previousDuration ? calculateProgress(currentDuration, previousDuration) : { direction: 'neutral' };
  const distanceProgress = currentDistance && previousDistance ? calculateProgress(currentDistance, previousDistance) : { direction: 'neutral' };
  const paceProgress = currentPace > 0 && previousPace > 0 ? calculateProgress(previousPace, currentPace) : { direction: 'neutral' }; // Note: lower pace is better
  
  // Determine if we should show any progress metrics
  const hasStrengthProgress = (weightProgress.direction !== 'neutral' || 
                              repsProgress.direction !== 'neutral' || 
                              setsProgress.direction !== 'neutral' ||
                              volumeProgress.direction !== 'neutral') && 
                              !isDurationBased;
  
  const hasCardioProgress = (durationProgress.direction !== 'neutral' || 
                           distanceProgress.direction !== 'neutral' || 
                           paceProgress.direction !== 'neutral') && 
                           isDurationBased;
  
  // If no progress to show, return null
  if (!hasStrengthProgress && !hasCardioProgress) {
    return null;
  }
  
  // Render progress badges
  return (
    <div className="exercise-progress-metrics mt-2 flex flex-wrap gap-2">
      {!isDurationBased ? (
        // Strength exercise progress indicators
        <>
          {/* Show weight changes in both directions */}
          {weightProgress.direction === 'up' && (
            <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowUp size={12} />
              <span>{compact ? 'Weight' : 'Weight increase!'}</span>
              {!compact && <span className="ml-1 text-xs opacity-75">+{weightProgress.value} {weightUnit}</span>}
            </div>
          )}
          
          {weightProgress.direction === 'down' && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowDown size={12} />
              <span>{compact ? 'Weight' : 'Weight decrease'}</span>
              {!compact && <span className="ml-1 text-xs opacity-75">-{weightProgress.value} {weightUnit}</span>}
            </div>
          )}
          
          {/* Show sets changes in both directions */}
          {setsProgress.direction === 'up' && (
            <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowUp size={12} />
              <span>{compact ? 'Sets' : 'Sets increase!'}</span>
              {!compact && <span className="ml-1 text-xs opacity-75">+{setsProgress.value}</span>}
            </div>
          )}
          
          {setsProgress.direction === 'down' && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowDown size={12} />
              <span>{compact ? 'Sets' : 'Sets decrease'}</span>
              {!compact && <span className="ml-1 text-xs opacity-75">-{setsProgress.value}</span>}
            </div>
          )}
          
          {/* Show reps changes in both directions */}
          {repsProgress.direction === 'up' && (
            <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowUp size={12} />
              <span>{compact ? 'Reps' : 'Rep increase!'}</span>
              {!compact && <span className="ml-1 text-xs opacity-75">+{repsProgress.value}</span>}
            </div>
          )}
          
          {repsProgress.direction === 'down' && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowDown size={12} />
              <span>{compact ? 'Reps' : 'Rep decrease'}</span>
              {!compact && <span className="ml-1 text-xs opacity-75">-{repsProgress.value}</span>}
            </div>
          )}
          
          {/* Volume changes */}
          {volumeProgress.direction === 'up' && currentWeight > 0 && previousWeight > 0 && (
            <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowUp size={12} />
              <span>{compact ? 'Total Volume' : 'Total volume increase!'}</span>
            </div>
          )}
          
          {volumeProgress.direction === 'down' && currentWeight > 0 && previousWeight > 0 && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowDown size={12} />
              <span>{compact ? 'Total Volume' : 'Total Volume decrease'}</span>
            </div>
          )}
        </>
      ) : (
        // Duration-based exercise progress indicators
        <>
          {/* Duration changes in both directions */}
          {durationProgress.direction === 'up' && (
            <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowUp size={12} />
              <span>{compact ? 'Duration' : 'Duration increase!'}</span>
              {!compact && <span className="ml-1 text-xs opacity-75">+{durationProgress.value} {currentDurationUnit}</span>}
            </div>
          )}
          
          {durationProgress.direction === 'down' && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowDown size={12} />
              <span>{compact ? 'Duration' : 'Duration decrease'}</span>
              {!compact && <span className="ml-1 text-xs opacity-75">-{durationProgress.value} {currentDurationUnit}</span>}
            </div>
          )}
          
          {/* Distance changes in both directions */}
          {distanceProgress.direction === 'up' && currentDistance > 0 && previousDistance > 0 && (
            <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowUp size={12} />
              <span>{compact ? 'Distance' : 'Distance increase!'}</span>
              {!compact && <span className="ml-1 text-xs opacity-75">+{distanceProgress.value.toFixed(1)} {distanceUnit}</span>}
            </div>
          )}
          
          {distanceProgress.direction === 'down' && currentDistance > 0 && previousDistance > 0 && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowDown size={12} />
              <span>{compact ? 'Distance' : 'Distance decrease'}</span>
              {!compact && <span className="ml-1 text-xs opacity-75">-{distanceProgress.value.toFixed(1)} {distanceUnit}</span>}
            </div>
          )}
          
          {/* Pace changes */}
          {paceProgress.direction !== 'neutral' && currentPace > 0 && previousPace > 0 && (
            <div className={`${paceProgress.isPositive ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'} text-xs px-2 py-1 rounded-full flex items-center gap-1`}>
              {paceProgress.isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              <span>{compact ? 
                (paceProgress.isPositive ? 'Pace' : 'Pace ↓') : 
                (paceProgress.isPositive ? 'Pace improved!' : 'Pace decreased')}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExerciseProgressMetrics;