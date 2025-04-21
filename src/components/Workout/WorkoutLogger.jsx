import React, { useState, useEffect } from 'react';
import { Check, AlertCircle,Activity, ArrowLeft, CheckCircle, Clock, Calendar, 
         Save, Plus, Minus, Info, AlertTriangle,
         Flame, Award, Trash2, RotateCcw, Dumbbell, Route, 
         TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { getWorkoutById, logWorkout, getCompletedWorkoutById, getAllCompletedWorkouts,updateExerciseBaseline } from '../../utils/workoutUtils';
import { getStorage, getWeightUnit, getDistanceUnit } from '../../utils/storage';

/**
 * Get previous performances for a specific exercise
 * @param {string} exerciseName - Name of the exercise to find
 * @returns {Array} Previous performances, sorted from newest to oldest
 */
const getPreviousPerformances = (exerciseName) => {
  try {
    const allWorkouts = getAllCompletedWorkouts();
    
    // Filter to only include workouts with this exercise
    const relevantWorkouts = allWorkouts
      .filter(workout => 
        workout.exercises && 
        workout.exercises.some(ex => ex.name === exerciseName)
      )
      .sort((a, b) => {
        // Sort from newest to oldest
        const dateA = new Date(a.completedAt || a.timestamp || a.date);
        const dateB = new Date(b.completedAt || b.timestamp || b.date);
        return dateB - dateA;
      });
    
    // Extract just the exercise data from the relevant workouts
    return relevantWorkouts.map(workout => {
      const exercise = workout.exercises.find(ex => ex.name === exerciseName);
      return {
        ...exercise,
        date: workout.completedAt || workout.timestamp || workout.date
      };
    }).slice(0, 3); // Get the last 3 performances
  } catch (error) {
    console.error('Error getting previous performances:', error);
    return [];
  }
};

// Add a success handler function to the WorkoutLogger component
const handleBaselineUpdated = (exerciseName, updatedWorkout) => {
  console.log(`Baseline updated for ${exerciseName}`);
  // Optionally refresh the workout data if needed
};


const WorkoutLogger = ({ workoutId, date, existingWorkoutId, onComplete, onCancel }) => {
  const [workout, setWorkout] = useState(null);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [duration, setDuration] = useState(0);
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [completedWorkoutId, setCompletedWorkoutId] = useState(null);
  const [originalTimestamp, setOriginalTimestamp] = useState(null);
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [distanceUnit, setDistanceUnit] = useState('mi');
  const [intensity, setIntensity] = useState('3');

  // Load workout details or existing log on mount
  useEffect(() => {
    if (!date) {
      setError("No date selected");
      setLoading(false);
      return;
    }
    
    try {
      // Check if we're editing an existing workout
      if (existingWorkoutId) {
        setIsEditing(true);
        
        // Load the existing workout data
        const existingWorkout = getCompletedWorkoutById(existingWorkoutId);
        
        if (existingWorkout) {
          // First set the basic details from the completed workout
          setDuration(existingWorkout.duration || 45);
          setCalories(existingWorkout.calories || '');
          setNotes(existingWorkout.notes || '');
          setCompletedWorkoutId(existingWorkout.id);
          setIntensity(existingWorkout.intensity || '3');
          
          // Store the original timestamp for editing
          setOriginalTimestamp(existingWorkout.completedAt || existingWorkout.timestamp);
          
          // If this is a template-based workout, also load the template
          if (existingWorkout.workoutId) {
            // Load the workout template to get the structure
            const templateWorkout = getWorkoutById(existingWorkout.workoutId);
            if (templateWorkout) {
              setWorkout(templateWorkout);
            }
          }
          
          // Set the completed exercises with previous performance data
          if (existingWorkout.exercises) {
            setCompletedExercises(
              existingWorkout.exercises.map(ex => {
                // Get previous performances for this exercise (excluding current one)
                const previousPerformances = getPreviousPerformances(ex.name)
                  .filter(p => {
                    // Exclude the current workout being edited
                    const perfDate = new Date(p.date).getTime();
                    const currentDate = new Date(existingWorkout.completedAt || existingWorkout.timestamp).getTime();
                    return Math.abs(perfDate - currentDate) > 1000; // More than 1 second difference
                  });
                
                return {
                  ...ex,
                  completed: ex.completed !== undefined ? ex.completed : true,
                  actualSets: ex.actualSets || ex.sets,
                  actualReps: ex.actualReps || ex.reps,
                  actualWeight: ex.actualWeight || ex.weight || '',
                  // Add support for duration-based exercises
                  isDurationBased: ex.isDurationBased || false,
                  actualDuration: ex.actualDuration || ex.duration || 0,
                  actualDurationUnit: ex.actualDurationUnit || ex.durationUnit || 'min',
                  actualDistance: ex.actualDistance || ex.distance || '',
                  actualIntensity: ex.actualIntensity || ex.intensity || 'medium',
                  // Add previous performances
                  previousPerformances
                };
              })
            );
          }
          
          setLoading(false);
        } else {
          setError("Workout not found");
          setLoading(false);
        }
      } else if (workoutId) {
        // Load a workout template
        loadWorkoutTemplate(workoutId);
      } else {
        setError("No workout selected");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error loading workout data:", err);
      setError("Failed to load workout data");
      setLoading(false);
    }
  }, [workoutId, date, existingWorkoutId]);

  useEffect(() => {
    setWeightUnit(getWeightUnit());
    setDistanceUnit(getDistanceUnit());
  }, []);
  
  // Helper function to load a workout template
  const loadWorkoutTemplate = (id) => {
    try {
      const workoutDetails = getWorkoutById(id);
      if (!workoutDetails) {
        setError("Workout template not found");
        setLoading(false);
        return;
      }

      setWorkout(workoutDetails);
      
      // Initialize completed exercises with the template values and previous performance data
      setCompletedExercises(
        workoutDetails.exercises.map(exercise => {
          // Get previous performances for this exercise
          const previousPerformances = getPreviousPerformances(exercise.name);
          
          return {
            ...exercise,
            completed: false,
            actualSets: exercise.sets,
            actualReps: exercise.reps,
            actualWeight: exercise.weight || '',
            // Add support for duration-based exercises
            isDurationBased: exercise.isDurationBased || false,
            actualDuration: exercise.duration || 0,
            actualDurationUnit: exercise.durationUnit || 'min',
            actualDistance: exercise.distance || '',
            actualIntensity: exercise.intensity || 'medium',
            // Add previous performances
            previousPerformances
          };
        })
      );
      
      // Set initial duration from the template
      setDuration(workoutDetails.duration);
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading workout template:", err);
      setError("Failed to load workout template");
      setLoading(false);
    }
  };

  // Calculate progress between current and previous value
  const calculateProgress = (current, previous, isHigherBetter = true) => {
    if (!current || !previous) return { value: 0, direction: 'neutral' };
    
    const currentVal = parseFloat(current);
    const previousVal = parseFloat(previous);
    
    if (isNaN(currentVal) || isNaN(previousVal)) return { value: 0, direction: 'neutral' };
    
    const diff = currentVal - previousVal;
    
    if (diff === 0) return { value: 0, direction: 'neutral' };
    
    const direction = diff > 0 ? 'up' : 'down';
    const isPositive = isHigherBetter ? direction === 'up' : direction === 'down';
    
    return {
      value: Math.abs(diff),
      direction,
      isPositive
    };
  };

  // Handle exercise completion toggle
  const handleExerciseToggle = (index) => {
    setCompletedExercises(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        completed: !updated[index].completed
      };
      return updated;
    });
  };

  // Handle exercise actual values changes
  const handleExerciseValueChange = (index, field, value) => {
    setCompletedExercises(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Adjust duration
  const adjustDuration = (amount) => {
    setDuration(prev => {
      const newValue = parseInt(prev) + amount;
      return Math.max(5, isNaN(newValue) ? 45 : newValue);
    });
  };

  // Handle calories input
  const handleCaloriesChange = (e) => {
    // Allow only numbers
    const value = e.target.value.replace(/\D/g, '');
    setCalories(value);
  };

  // Toggle all exercises completion
  const toggleAllExercises = (completed) => {
    setCompletedExercises(prev => 
      prev.map(ex => ({
        ...ex,
        completed
      }))
    );
  };

  // Reset form to initial values
  const resetForm = () => {
    if (workout) {
      setDuration(workout.duration);
      setCalories('');
      setNotes('');
      
      setCompletedExercises(
        workout.exercises.map(exercise => {
          // Get previous performances for this exercise
          const previousPerformances = getPreviousPerformances(exercise.name);
          
          return {
            ...exercise,
            completed: false,
            actualSets: exercise.sets,
            actualReps: exercise.reps,
            actualWeight: exercise.weight || '',
            isDurationBased: exercise.isDurationBased || false,
            actualDuration: exercise.duration || 0,
            actualDurationUnit: exercise.durationUnit || 'min',
            actualDistance: exercise.distance || '',
            actualIntensity: exercise.intensity || 'medium',
            previousPerformances
          };
        })
      );
    } else {
      setDuration(45);
      setCalories('');
      setNotes('');
      setCompletedExercises([]);
    }
  };

  // Get progress trend icon
  const getTrendIcon = (progress) => {
    if (!progress) return null;
    
    if (progress.direction === 'up') {
      return <ArrowUp size={12} className={progress.isPositive ? "text-green-500" : "text-red-500"} />;
    }
    if (progress.direction === 'down') {
      return <ArrowDown size={12} className={progress.isPositive ? "text-green-500" : "text-red-500"} />;
    }
    return null;
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('default', {
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      return '';
    }
  };

  // Add this component inside WorkoutLogger.jsx
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
        parseInt(actualValues.actualSets) !== parseInt(exercise.sets) ||
        parseInt(actualValues.actualDuration) !== parseInt(exercise.duration) ||
        actualValues.actualDurationUnit !== exercise.durationUnit ||
        actualValues.actualDistance !== exercise.distance
      );
    } else {
      return (
        parseInt(actualValues.actualSets) !== parseInt(exercise.sets) ||
        parseInt(actualValues.actualReps) !== parseInt(exercise.reps) ||
        (actualValues.actualWeight !== exercise.weight && 
         actualValues.actualWeight !== '')
      );
    }
  };
  
  // Handle the button click
  const handleClick = async () => {
    try {
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

  // Save completed workout
  const handleSaveWorkout = () => {
    try {
      // Map exercises based on their type (duration-based or traditional)
      const mappedExercises = completedExercises.map(ex => {
        if (ex.isDurationBased) {
          return {
            name: ex.name,
            isDurationBased: true,
            // Add these missing fields to fix the bug
            sets: ex.actualSets || ex.sets || 1,
            duration: ex.actualDuration || ex.duration || 0,
            durationUnit: ex.actualDurationUnit || ex.durationUnit || 'min',
            distance: ex.actualDistance || ex.distance || '',
            intensity: ex.actualIntensity || ex.intensity || 'medium',
            timeSpent: ex.timeSpent || 0,
            setTimes: ex.setTimes || [],
            notes: ex.notes || '',
            completed: ex.completed
          };
        } else {
          return {
            name: ex.name,
            sets: ex.actualSets,
            reps: ex.actualReps,
            weight: ex.actualWeight,
            notes: ex.notes || '',
            completed: ex.completed
          };
        }
      });

      // Calculate completion rate
      const totalExercises = mappedExercises.length;
      const completedCount = mappedExercises.filter(ex => ex.completed !== false).length;
      const completionRate = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 100;

      // Create logged workout data
      const workoutData = {
        workoutId: workout?.id || null,
        name: workout?.name || "Completed Workout",
        type: workout?.type || "strength",
        duration: parseInt(duration) || 45,
        calories: calories ? parseInt(calories) : null,
        // Add intensity to the saved data:
        intensity: intensity,
        exercises: mappedExercises,
        notes,
        // Add progress tracking metrics
        completionRate: completionRate,
        totalExercises,
        completedExercises: completedCount,
        // Preserve the original timestamp when editing
        completedAt: isEditing ? originalTimestamp : null
      };
      
      // Log workout, passing the existing ID if editing
      const completedWorkout = logWorkout(date, workoutData, isEditing ? completedWorkoutId : null);
      
      // Call onComplete with the saved workout
      onComplete(completedWorkout);
    } catch (error) {
      console.error("Error saving workout:", error);
      setError("Failed to save workout completion");
    }
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    if (completedExercises.length === 0) return 0;
    
    const completed = completedExercises.filter(ex => ex.completed).length;
    return Math.round((completed / completedExercises.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-center flex flex-col items-center">
        <AlertTriangle size={24} className="mb-2" />
        <h3 className="font-medium text-lg">Error</h3>
        <p>{error}</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  const completionPercentage = calculateCompletion();

  return (
    <div className="px-2 sm:px-0 w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <button 
          onClick={onCancel}
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 truncate">
          {isEditing ? 'Edit: ' : 'Log: '}{workout?.name || "Workout"}
        </h2>
      </div>

      {/* Workout Date */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center gap-3 mb-6">
        <Calendar size={20} className="text-blue-500 dark:text-blue-400" />
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-100">
            {new Date(date).toLocaleDateString('default', { 
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {isEditing ? 'Editing workout log' : 'Logging workout completion'}
          </div>
        </div>
      </div>

      {/* Completion Progress */}
      {completedExercises.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-slate-800 dark:text-slate-100">Completion Progress</h3>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{completionPercentage}%</div>
          </div>
          
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                completionPercentage > 75 
                  ? 'bg-green-500 dark:bg-green-600' 
                  : completionPercentage > 50 
                    ? 'bg-blue-500 dark:bg-blue-600' 
                    : completionPercentage > 25 
                      ? 'bg-yellow-500 dark:bg-yellow-600' 
                      : 'bg-red-500 dark:bg-red-600'
              }`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-3">
            <button
              onClick={() => toggleAllExercises(true)}
              className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 flex items-center gap-1"
            >
              <CheckCircle size={14} />
              Mark All Complete
            </button>
            
            <button
              onClick={() => toggleAllExercises(false)}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 flex items-center gap-1"
            >
              <RotateCcw size={14} />
              Reset All
            </button>
          </div>
        </div>
      )}

      {/* Workout Duration */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Clock size={18} className="text-slate-500 dark:text-slate-400" />
            Workout Duration
          </h3>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => adjustDuration(-5)}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Minus size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          
          <div className="w-24 text-center relative">
            <input 
              type="number" 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="5"
              step="5"
              className="w-full text-center text-2xl font-bold text-slate-800 dark:text-slate-100 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            />
            <div className="text-xs text-slate-500 dark:text-slate-400">minutes</div>
          </div>
          
          <button
            onClick={() => adjustDuration(5)}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Plus size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Calories */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Flame size={18} className="text-red-500 dark:text-red-400" />
            Calories Burned
          </h3>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={calories}
            onChange={handleCaloriesChange}
            placeholder="Enter calories burned..."
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 pl-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none">
            kcal
          </div>
        </div>
      </div>

      {/* Intensity Selector */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
        <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Activity size={18} className="text-purple-500 dark:text-purple-400" />
          Workout Intensity
        </h3>
        
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
                type="button"
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
            {parseInt(intensity) === 1 && "Light (1/5)"}
            {parseInt(intensity) === 2 && "Moderate (2/5)"}
            {parseInt(intensity) === 3 && "Challenging (3/5)"}
            {parseInt(intensity) === 4 && "Intense (4/5)"}
            {parseInt(intensity) === 5 && "Maximum (5/5)"}
          </div>
        </div>
      </div>

      {/* Completed Exercises */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
        <h3 className="font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <Dumbbell size={18} className="text-slate-500 dark:text-slate-400" />
          Exercise Completion
        </h3>
        
        {completedExercises.length === 0 ? (
          <div className="text-center p-4 text-slate-500 dark:text-slate-400">
            No exercises in this workout.
          </div>
        ) : (
          <div className="space-y-4">
            {completedExercises.map((exercise, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border transition-all transform ${
                  exercise.completed 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900'
                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div 
                    className="font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2 cursor-pointer"
                    onClick={() => handleExerciseToggle(index)}
                  >
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                      exercise.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {exercise.completed && <CheckCircle size={14} className="text-white" />}
                    </div>
                    <span className="flex items-center gap-1">
                      {exercise.isDurationBased ? 
                        <Route size={16} className="text-slate-500 dark:text-slate-400" /> : 
                        <Dumbbell size={16} className="text-slate-500 dark:text-slate-400" />
                      }
                      <span className="text-base">{exercise.name}</span>
                    </span>
                  </div>
                  
                  {/* Exercise completion status badge */}
                  {exercise.completed && (
                    <span className="bg-green-500 dark:bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      Completed
                    </span>
                  )}

                  {/* Add the Set as Baseline button */}
    {workout && workout.id && (
      <SetAsBaselineButton
        exercise={workout.exercises[index]}
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
                </div>
                
                {/* Previous Performance Data */}
                {exercise.previousPerformances && exercise.previousPerformances.length > 0 && (
                  <div className="mt-1 mb-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-2 rounded-lg flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">Last performance:</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {formatDate(exercise.previousPerformances[0].date)}
                      </span>
                    </div>
                    <div>
                      {!exercise.isDurationBased 
                        ? <span>
                            {exercise.previousPerformances[0].actualSets || exercise.previousPerformances[0].sets || 0}×
                            {exercise.previousPerformances[0].actualReps || exercise.previousPerformances[0].reps || 0}
                            {exercise.previousPerformances[0].actualWeight || exercise.previousPerformances[0].weight 
                              ? ` @ ${exercise.previousPerformances[0].actualWeight || exercise.previousPerformances[0].weight} ${weightUnit}` 
                              : ''}
                          </span> 
                        : <span>
                            {exercise.previousPerformances[0].actualDuration || exercise.previousPerformances[0].duration || 0} 
                            {exercise.previousPerformances[0].actualDurationUnit || exercise.previousPerformances[0].durationUnit || 'min'}
                            {exercise.previousPerformances[0].actualDistance || exercise.previousPerformances[0].distance 
                              ? ` - ${exercise.previousPerformances[0].actualDistance || exercise.previousPerformances[0].distance}`
                              : ''}
                          </span>
                      }
                    </div>
                  </div>
                )}
                
                {exercise.isDurationBased ? (
                  // Duration-based exercise inputs
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {/* Add Sets control for duration-based exercises */}
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Sets
                      </label>
                      <input
                        type="number"
                        value={exercise.actualSets || 1}
                        onChange={(e) => handleExerciseValueChange(index, 'actualSets', parseInt(e.target.value) || 1)}
                        className={`w-full p-2 border rounded-lg text-sm transition-colors ${
                          exercise.completed 
                            ? 'bg-white dark:bg-slate-700 border-green-200 dark:border-green-800 text-slate-800 dark:text-slate-100' 
                            : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100'
                        }`}
                        min="1"
                      />
                      
                      {/* Show progress indicator */}
                      {exercise.previousPerformances && exercise.previousPerformances.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          {(() => {
                            const prevSets = exercise.previousPerformances[0].actualSets || exercise.previousPerformances[0].sets || 0;
                            const currentSets = exercise.actualSets || 0;
                            const progress = calculateProgress(currentSets, prevSets);
                            return progress.direction !== 'neutral' && (
                              <div className={`flex items-center ${progress.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                {getTrendIcon(progress)}
                                <span>{progress.value}</span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Duration (Target)
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          value={exercise.actualDuration || 0}
                          onChange={(e) => handleExerciseValueChange(index, 'actualDuration', parseInt(e.target.value) || 0)}
                          className={`w-2/3 p-2 border-r-0 rounded-l-lg text-sm transition-colors ${
                            exercise.completed 
                              ? 'bg-white dark:bg-slate-700 border-green-200 dark:border-green-800 text-slate-800 dark:text-slate-100' 
                              : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100'
                          }`}
                          min="0"
                        />
                        <select
                          value={exercise.actualDurationUnit || 'min'}
                          onChange={(e) => handleExerciseValueChange(index, 'actualDurationUnit', e.target.value)}
                          className={`w-1/3 p-2 border-l-0 rounded-r-lg text-sm transition-colors ${
                            exercise.completed 
                              ? 'bg-white dark:bg-slate-700 border-green-200 dark:border-green-800 text-slate-800 dark:text-slate-100' 
                              : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          <option value="sec">sec</option>
                          <option value="min">min</option>
                        </select>
                      </div>
                      
                      {/* Show progress indicator */}
                      {exercise.previousPerformances && exercise.previousPerformances.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          {(() => {
                            const prevDuration = exercise.previousPerformances[0].actualDuration || exercise.previousPerformances[0].duration || 0;
                            const currentDuration = exercise.actualDuration || 0;
                            const progress = calculateProgress(currentDuration, prevDuration);
                            return progress.direction !== 'neutral' && (
                              <div className={`flex items-center ${progress.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                {getTrendIcon(progress)}
                                <span>{progress.value}</span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Distance
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={exercise.actualDistance || ''}
                          onChange={(e) => handleExerciseValueChange(index, 'actualDistance', e.target.value)}
                          className={`flex-1 p-2 border border-r-0 rounded-l-lg text-sm transition-colors ${
                            exercise.completed 
                              ? 'bg-white dark:bg-slate-700 border-green-200 dark:border-green-800 text-slate-800 dark:text-slate-100' 
                              : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100'
                          }`}
                          placeholder="Distance"
                        />
                        <span className={`inline-flex items-center px-3 border border-l-0 rounded-r-lg text-sm ${
                          exercise.completed 
                            ? 'bg-white dark:bg-slate-700 border-green-200 dark:border-green-800 text-slate-500 dark:text-slate-400' 
                            : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                        }`}>
                          {distanceUnit}
                        </span>
                      </div>
                      
                      {/* Show progress indicator */}
                      {exercise.previousPerformances && exercise.previousPerformances.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          {(() => {
                            // Extract numeric values from distance strings
                            const getDistanceValue = (distStr) => {
                              if (!distStr) return 0;
                              const match = distStr.match(/(\d+\.?\d*)/);
                              return match ? parseFloat(match[1]) : 0;
                            };
                            
                            const prevDistance = getDistanceValue(
                              exercise.previousPerformances[0].actualDistance || exercise.previousPerformances[0].distance
                            );
                            const currentDistance = getDistanceValue(exercise.actualDistance);
                            
                            if (prevDistance > 0 && currentDistance > 0) {
                              const progress = calculateProgress(currentDistance, prevDistance);
                              return progress.direction !== 'neutral' && (
                                <div className={`flex items-center ${progress.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                  {getTrendIcon(progress)}
                                  <span>{progress.value.toFixed(1)}</span>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Traditional strength exercise inputs
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Sets
                      </label>
                      <input
                        type="number"
                        value={exercise.actualSets}
                        onChange={(e) => handleExerciseValueChange(index, 'actualSets', parseInt(e.target.value) || 0)}
                        className={`w-full p-2 border rounded-lg text-sm transition-colors ${
                          exercise.completed 
                            ? 'bg-white dark:bg-slate-700 border-green-200 dark:border-green-800 text-slate-800 dark:text-slate-100' 
                            : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100'
                        }`}
                        min="0"
                      />
                      
                      {/* Show progress indicator */}
                      {exercise.previousPerformances && exercise.previousPerformances.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          {(() => {
                            const prevSets = exercise.previousPerformances[0].actualSets || exercise.previousPerformances[0].sets || 0;
                            const currentSets = exercise.actualSets || 0;
                            const progress = calculateProgress(currentSets, prevSets);
                            return progress.direction !== 'neutral' && (
                              <div className={`flex items-center ${progress.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                {getTrendIcon(progress)}
                                <span>{progress.value}</span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Reps
                      </label>
                      <input
                        type="text"
                        value={exercise.actualReps}
                        onChange={(e) => handleExerciseValueChange(index, 'actualReps', e.target.value)}
                        className={`w-full p-2 border rounded-lg text-sm transition-colors ${
                          exercise.completed 
                            ? 'bg-white dark:bg-slate-700 border-green-200 dark:border-green-800 text-slate-800 dark:text-slate-100' 
                            : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100'
                        }`}
                      />
                      
                      {/* Show progress indicator */}
                      {exercise.previousPerformances && exercise.previousPerformances.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          {(() => {
                            const prevReps = exercise.previousPerformances[0].actualReps || exercise.previousPerformances[0].reps || 0;
                            const currentReps = exercise.actualReps || 0;
                            const progress = calculateProgress(currentReps, prevReps);
                            return progress.direction !== 'neutral' && (
                              <div className={`flex items-center ${progress.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                {getTrendIcon(progress)}
                                <span>{progress.value}</span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Weight
                      </label>
                      <input
                        type="text"
                        value={exercise.actualWeight}
                        onChange={(e) => handleExerciseValueChange(index, 'actualWeight', e.target.value)}
                        className={`w-full p-2 border rounded-lg text-sm transition-colors ${
                          exercise.completed 
                            ? 'bg-white dark:bg-slate-700 border-green-200 dark:border-green-800 text-slate-800 dark:text-slate-100' 
                            : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100'
                        }`}
                        placeholder={weightUnit}
                      />
                      
                      {/* Show progress indicator */}
                      {exercise.previousPerformances && exercise.previousPerformances.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          {(() => {
                            const prevWeight = exercise.previousPerformances[0].actualWeight || exercise.previousPerformances[0].weight || 0;
                            const currentWeight = exercise.actualWeight || 0;
                            const progress = calculateProgress(currentWeight, prevWeight);
                            return progress.direction !== 'neutral' && (
                              <div className={`flex items-center ${progress.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                {getTrendIcon(progress)}
                                <span>{progress.value}</span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Exercise notes - same for both types */}
                {exercise.notes && (
                  <div className="mt-3 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                    <p>{exercise.notes}</p>
                  </div>
                )}
                
                {/* Progress indicators */}
                {exercise.previousPerformances && exercise.previousPerformances.length > 0 && exercise.completed && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {/* For weight training exercises */}
                    {!exercise.isDurationBased && (
                      <>
                        {/* Weight progress */}
                        {parseFloat(exercise.actualWeight) > parseFloat(exercise.previousPerformances[0].actualWeight || exercise.previousPerformances[0].weight || 0) && (
                          <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp size={12} />
                            <span>Weight increase!</span>
                          </div>
                        )}
                        
                        {/* Rep progress */}
                        {parseInt(exercise.actualReps) > parseInt(exercise.previousPerformances[0].actualReps || exercise.previousPerformances[0].reps || 0) && (
                          <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp size={12} />
                            <span>Rep increase!</span>
                          </div>
                        )}
                        
                        {/* Volume progress (sets * reps * weight) */}
                        {(() => {
                          const prevSets = parseInt(exercise.previousPerformances[0].actualSets || exercise.previousPerformances[0].sets || 0);
                          const prevReps = parseInt(exercise.previousPerformances[0].actualReps || exercise.previousPerformances[0].reps || 0);
                          const prevWeight = parseFloat(exercise.previousPerformances[0].actualWeight || exercise.previousPerformances[0].weight || 0);
                          
                          const currentSets = parseInt(exercise.actualSets || 0);
                          const currentReps = parseInt(exercise.actualReps || 0);
                          const currentWeight = parseFloat(exercise.actualWeight || 0);
                          
                          const prevVolume = prevSets * prevReps * prevWeight;
                          const currentVolume = currentSets * currentReps * currentWeight;
                          
                          return (currentVolume > prevVolume && currentVolume > 0 && prevVolume > 0) && (
                            <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <Award size={12} />
                              <span>Total volume increase!</span>
                            </div>
                          );
                        })()}
                      </>
                    )}
                    
                    {/* For duration-based exercises */}
                    {exercise.isDurationBased && (
                      <>
                        {/* Duration progress */}
                        {parseInt(exercise.actualDuration || 0) > parseInt(exercise.previousPerformances[0].actualDuration || exercise.previousPerformances[0].duration || 0) && (
                          <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp size={12} />
                            <span>Duration increase!</span>
                          </div>
                        )}
                        
                        {/* Distance progress */}
                        {(() => {
                          const getDistanceValue = (distStr) => {
                            if (!distStr) return 0;
                            const match = distStr.match(/(\d+\.?\d*)/);
                            return match ? parseFloat(match[1]) : 0;
                          };
                          
                          const prevDistance = getDistanceValue(
                            exercise.previousPerformances[0].actualDistance || exercise.previousPerformances[0].distance
                          );
                          const currentDistance = getDistanceValue(exercise.actualDistance);
                          
                          return (currentDistance > prevDistance && currentDistance > 0 && prevDistance > 0) && (
                            <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <TrendingUp size={12} />
                              <span>Distance increase!</span>
                            </div>
                          );
                        })()}
                        
                        {/* Pace progress - for running/swimming/cycling */}
                        {exercise.name.toLowerCase().includes('run') || 
                         exercise.name.toLowerCase().includes('swim') || 
                         exercise.name.toLowerCase().includes('cycling') ? (
                          (() => {
                            // Calculate pace (time per distance)
                            const getDistanceValue = (distStr) => {
                              if (!distStr) return 0;
                              const match = distStr.match(/(\d+\.?\d*)/);
                              return match ? parseFloat(match[1]) : 0;
                            };
                            
                            const prevDuration = parseInt(exercise.previousPerformances[0].actualDuration || exercise.previousPerformances[0].duration || 0);
                            const prevDurationInSec = (exercise.previousPerformances[0].actualDurationUnit || exercise.previousPerformances[0].durationUnit || 'min') === 'min' 
                              ? prevDuration * 60 : prevDuration;
                              
                            const currentDuration = parseInt(exercise.actualDuration || 0);
                            const currentDurationInSec = (exercise.actualDurationUnit || 'min') === 'min'
                              ? currentDuration * 60 : currentDuration;
                            
                            const prevDistance = getDistanceValue(
                              exercise.previousPerformances[0].actualDistance || exercise.previousPerformances[0].distance
                            );
                            const currentDistance = getDistanceValue(exercise.actualDistance);
                            
                            // Calculate pace (lower is better)
                            const prevPace = prevDistance > 0 ? prevDurationInSec / prevDistance : 0;
                            const currentPace = currentDistance > 0 ? currentDurationInSec / currentDistance : 0;
                            
                            return (prevPace > 0 && currentPace > 0 && currentPace < prevPace) && (
                              <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <Award size={12} />
                                <span>Pace improved!</span>
                              </div>
                            );
                          })()
                        ) : null}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
        <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-3">
          Workout Notes
        </h3>
        
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did the workout feel? Any achievements or challenges?"
          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 h-24"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={resetForm}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
        >
          <RotateCcw size={18} />
          Reset
        </button>
        
        <button
          onClick={handleSaveWorkout}
          className="px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center gap-2"
        >
          <Save size={18} />
          {isEditing ? 'Update Workout' : 'Log Completed Workout'}
        </button>
      </div>
    </div>
  );
};

export default WorkoutLogger;