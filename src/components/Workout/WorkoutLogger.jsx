import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, Calendar, 
         Save, Plus, Minus, Info, AlertTriangle,
         Flame, Award, Trash2, RotateCcw, Dumbbell } from 'lucide-react';
import { getWorkoutById, logWorkout, getCompletedWorkoutById } from '../../utils/workoutUtils';
import { getStorage, getWeightUnit } from '../../utils/storage';

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
  const [originalTimestamp, setOriginalTimestamp] = useState(null); // New state for original timestamp
  const [weightUnit, setWeightUnit] = useState('lbs');


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
          
          // Set the completed exercises
          if (existingWorkout.exercises) {
            setCompletedExercises(
              existingWorkout.exercises.map(ex => ({
                ...ex,
                completed: ex.completed !== undefined ? ex.completed : true,
                actualSets: ex.actualSets || ex.sets,
                actualReps: ex.actualReps || ex.reps,
                actualWeight: ex.actualWeight || ex.weight || ''
              }))
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
      
      // Initialize completed exercises with the template values
      setCompletedExercises(
        workoutDetails.exercises.map(exercise => ({
          ...exercise,
          completed: false,
          actualSets: exercise.sets,
          actualReps: exercise.reps,
          actualWeight: exercise.weight || ''
        }))
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
      updated[index] = {
        ...updated[index],
        [field]: value
      };
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
        workout.exercises.map(exercise => ({
          ...exercise,
          completed: false,
          actualSets: exercise.sets,
          actualReps: exercise.reps,
          actualWeight: exercise.weight || ''
        }))
      );
    } else {
      setDuration(45);
      setCalories('');
      setNotes('');
      setCompletedExercises([]);
    }
  };

  // Save completed workout
  const handleSaveWorkout = () => {
    try {
      // Create logged workout data
      const workoutData = {
        workoutId: workout?.id || null,
        name: workout?.name || "Completed Workout",
        type: workout?.type || "strength",
        duration: parseInt(duration) || 45,
        calories: calories ? parseInt(calories) : null,
        exercises: completedExercises.map(ex => ({
          name: ex.name,
          sets: ex.actualSets,
          reps: ex.actualReps,
          weight: ex.actualWeight,
          completed: ex.completed
        })),
        notes,
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
                    <span className="text-base">{exercise.name}</span>
                  </div>
                  
                  {/* Exercise completion status badge */}
                  {exercise.completed && (
                    <span className="bg-green-500 dark:bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                
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
                  </div>
                </div>
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