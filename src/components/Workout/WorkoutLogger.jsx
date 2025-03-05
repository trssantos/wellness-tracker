import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, Calendar, 
         Save, Plus, Minus, Info, AlertTriangle } from 'lucide-react';
import { getWorkoutById, logWorkout } from '../../utils/workoutUtils';

const WorkoutLogger = ({ workoutId, date, onComplete, onCancel }) => {
  const [workout, setWorkout] = useState(null);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [duration, setDuration] = useState(0);
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load workout details on mount
  useEffect(() => {
    if (!workoutId) {
      setError("No workout selected");
      setLoading(false);
      return;
    }

    try {
      const workoutDetails = getWorkoutById(workoutId);
      if (!workoutDetails) {
        setError("Workout not found");
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
      console.error("Error loading workout:", err);
      setError("Failed to load workout details");
      setLoading(false);
    }
  }, [workoutId]);

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
    setDuration(prev => Math.max(1, prev + amount));
  };

  // Handle calories input
  const handleCaloriesChange = (e) => {
    // Allow only numbers
    const value = e.target.value.replace(/\D/g, '');
    setCalories(value);
  };

  // Save completed workout
  const handleSaveWorkout = () => {
    try {
      // Create logged workout data
      const workoutData = {
        workoutId,
        name: workout.name,
        type: workout.type,
        duration,
        calories: calories ? parseInt(calories) : null,
        exercises: completedExercises.map(ex => ({
          name: ex.name,
          sets: ex.actualSets,
          reps: ex.actualReps,
          weight: ex.actualWeight,
          completed: ex.completed
        })),
        notes
      };
      
      // Save to storage
      const completedWorkout = logWorkout(date, workoutData);
      
      // Call onComplete with the saved workout
      onComplete(completedWorkout);
    } catch (error) {
      console.error("Error saving workout:", error);
      setError("Failed to save workout completion");
    }
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

  if (!workout) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg text-center">
        No workout found.
      </div>
    );
  }

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
          Log: {workout.name}
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
            Logging workout completion
          </div>
        </div>
      </div>

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
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
          >
            <Minus size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          
          <div className="w-24 text-center">
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{duration}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">minutes</div>
          </div>
          
          <button
            onClick={() => adjustDuration(5)}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
          >
            <Plus size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Completed Exercises */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
        <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-4">
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
                className={`p-3 rounded-lg border ${
                  exercise.completed 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900'
                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2 cursor-pointer"
                    onClick={() => handleExerciseToggle(index)}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      exercise.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {exercise.completed && <CheckCircle size={12} className="text-white" />}
                    </div>
                    {exercise.name}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Sets
                    </label>
                    <input
                      type="number"
                      value={exercise.actualSets}
                      onChange={(e) => handleExerciseValueChange(index, 'actualSets', parseInt(e.target.value) || 0)}
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
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
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
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
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                      placeholder="lbs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Details */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
        <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-4">
          Additional Details
        </h3>
        
        <div className="space-y-4">
          {/* Calories */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
              Calories Burned (optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={calories}
                onChange={handleCaloriesChange}
                placeholder="Enter calories..."
                className="w-full p-2 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none">
                kcal
              </div>
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout feel? Any achievements or challenges?"
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 h-20"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSaveWorkout}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center gap-2"
        >
          <Save size={18} />
          Log Completed Workout
        </button>
      </div>
    </div>
  );
};

export default WorkoutLogger;