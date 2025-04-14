// src/components/WorkoutTracker.jsx
import React, { useState, useEffect } from 'react';
import { Minus, X, Save, Dumbbell, Clock, Flame, BarChart, Plus, Trash2, Edit, Calendar, List, Route } from 'lucide-react';
import { getStorage, setStorage, getWeightUnit } from '../utils/storage';
import { getWorkoutsForDate, logWorkout, deleteCompletedWorkout } from '../utils/workoutUtils';
import WorkoutSelector from './Workout/WorkoutSelector';
import WorkoutLogger from './Workout/WorkoutLogger';
import QuickLogWorkout from './Workout/QuickLogWorkout';

export const WorkoutTracker = ({ date, onClose, workoutToEdit = null }) => {
  // List view state
  const [workoutsForDay, setWorkoutsForDay] = useState([]);
  const [showWorkoutList, setShowWorkoutList] = useState(true);
  
  // UI states
  const [workoutSaved, setWorkoutSaved] = useState(false);
  
  // New states for workout module integration
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
  const [showWorkoutLogger, setShowWorkoutLogger] = useState(false);
  const [showQuickLogWorkout, setShowQuickLogWorkout] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const [workoutMode, setWorkoutMode] = useState('list'); // 'list', 'manual', 'template', 'edit'
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [weightUnit, setWeightUnit] = useState('lbs');
  
  // Load existing workouts for the day
  useEffect(() => {
    if (date) {
      loadWorkoutsForDay();
      
      // If a specific workout is passed for editing, set it up
      if (workoutToEdit) {
        handleEditWorkout(workoutToEdit);
      } else {
        // Always start with the list view if no workout to edit
        setShowWorkoutList(true);
        setWorkoutMode('list');
      }
    }

    // Load weight unit preference
    setWeightUnit(getWeightUnit());
  }, [date, workoutToEdit]);
  
  // Load workouts for the selected day
  const loadWorkoutsForDay = () => {
    console.log('[WorkoutTracker] Loading workouts for day:', date);
    const workouts = getWorkoutsForDate(date);
    console.log('[WorkoutTracker] Loaded workouts:', workouts.length);
    setWorkoutsForDay(workouts);
  };

  // Handler for opening the workout selector
  const handleOpenWorkoutSelector = () => {
    setWorkoutMode('template');
    setShowWorkoutList(false);
    setShowWorkoutSelector(true);
    // Use setTimeout to ensure the modal element exists before trying to open it
    setTimeout(() => {
      const modal = document.getElementById('workout-selector-modal');
      if (modal) {
        modal.showModal();
      }
    }, 50);
  };

  // Handler for workout selection from the template list
  const handleSelectWorkout = (workoutId) => {
    setSelectedWorkoutId(workoutId);
    setShowWorkoutSelector(false);
    setShowWorkoutLogger(true);
    setWorkoutMode('template');
    document.getElementById('workout-selector-modal').close();
  };

  // Handler for completing a workout using a template
  const handleWorkoutCompleted = (completedWorkout) => {
    console.log('[WorkoutTracker] Workout completed/updated:', completedWorkout);
    setShowWorkoutLogger(false);
    setShowQuickLogWorkout(false);
    setEditingWorkout(null); // Reset editing state
    
    // Always load fresh data
    loadWorkoutsForDay();
    
    // Signal to parent that data has been updated
    if (onClose) {
      onClose({ dataUpdated: true });
    }
  };

  // Handler for editing an existing workout
  const handleEditWorkout = (workout) => {
    console.log('[WorkoutTracker] Editing workout:', workout);
    if (workout.workoutId) {
      // It's a template-based workout, use the WorkoutLogger
      setSelectedWorkoutId(workout.workoutId);
      setEditingWorkout(workout);
      setShowWorkoutLogger(true);
      setWorkoutMode('edit');
      setShowWorkoutList(false);
    } else {
      // It's a quick log workout, use the QuickLogWorkout component
      setEditingWorkout(workout);
      setShowQuickLogWorkout(true);
      setWorkoutMode('manual');
      setShowWorkoutList(false);
    }
  };
  
  // Start a new manual workout log
  const handleNewManualWorkout = () => {
    setWorkoutMode('manual');
    setShowWorkoutList(false);
    setEditingWorkout(null);
    setShowQuickLogWorkout(true);
  };
  
  // Delete a workout
  const handleDeleteWorkout = (workoutId) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      deleteCompletedWorkout(date, workoutId);
      loadWorkoutsForDay();
      
      // Signal to parent that data has been updated
      if (onClose) {
        onClose({ dataUpdated: true });
      }
    }
  };

  const getFormattedDate = () => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('default', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time from ISO string to readable time
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('default', {
      hour: '2-digit',
      minute: '2-digit'
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

  // Format intensity consistently
  const formatIntensity = (intensity) => {
    // Handle numeric format
    if (!isNaN(parseInt(intensity))) {
      const level = parseInt(intensity);
      switch(level) {
        case 1: return "light (1/5)";
        case 2: return "moderate (2/5)";
        case 3: return "challenging (3/5)";
        case 4: return "intense (4/5)";
        case 5: return "maximum (5/5)";
        default: return `${intensity}/5`;
      }
    }
    
    // Handle string format
    if (typeof intensity === 'string') {
      switch(intensity.toLowerCase()) {
        case 'light': return "light (1/5)";
        case 'medium': return "moderate (3/5)";
        case 'high': return "intense (4/5)";
        default: return intensity;
      }
    }
    
    return intensity;
  };

  // Render list of workouts
  const renderWorkoutList = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          
          <div className="flex gap-2">
            <button
              onClick={handleNewManualWorkout}
              className="p-2 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg flex items-center gap-1"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Quick Log</span>
            </button>
            <button
              onClick={handleOpenWorkoutSelector}
              className="p-2 bg-purple-500 dark:bg-purple-600 hover:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg flex items-center gap-1"
            >
              <List size={16} />
              <span className="hidden sm:inline">Template</span>
            </button>
          </div>
        </div>
      
        {workoutsForDay.length === 0 ? (
          <div className="text-center p-10 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <Dumbbell size={40} className="mx-auto text-slate-400 dark:text-slate-500 mb-3" />
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">No Workouts Logged</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Log your workouts to track your fitness journey and see your progress over time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleNewManualWorkout}
                className="px-4 py-2 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Quick Log Workout
              </button>
              <button
                onClick={handleOpenWorkoutSelector}
                className="px-4 py-2 bg-purple-500 dark:bg-purple-600 hover:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <List size={18} />
                Use Workout Template
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {workoutsForDay.map((workout, index) => (
              <div 
                key={workout.id || index}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-100">
                      {workout.name || 'Workout'}
                    </h4>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {formatTime(workout.completedAt || workout.timestamp)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditWorkout(workout)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      title="Edit workout"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      title="Delete workout"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Show workout type badges */}
                  {workout.types && workout.types.map((type, i) => (
                    <span 
                      key={i}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getWorkoutTypeColor(type)}`}
                    >
                      <span className="mr-1">{getWorkoutTypeIcon(type)}</span>
                      {getWorkoutTypeName(type)}
                    </span>
                  ))}
                  
                  {/* If no types, but has a type property */}
                  {(!workout.types || workout.types.length === 0) && workout.type && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                    </span>
                  )}
                  
                  {/* Duration badge */}
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    <Clock size={12} />
                    {workout.duration} min
                  </span>
                  
                  {/* Calories badge (if available) */}
                  {workout.calories && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                      <Flame size={12} />
                      {workout.calories} kcal
                    </span>
                  )}
                </div>
                
                {/* Exercise summary - UPDATED to use actual values */}
                {workout.exercises && workout.exercises.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Exercises ({workout.exercises.length})
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {workout.exercises.slice(0, 4).map((exercise, i) => (
  <div key={i} className="text-xs text-slate-600 dark:text-slate-400">
    • {exercise.name} {
      exercise.isDurationBased ? 
        /* Duration based exercises - Show actual time spent */
        `(${exercise.timeSpent ? 
          formatExerciseTime(exercise.timeSpent) + ' actual' :
          `${exercise.actualDuration || exercise.duration || 0} ${exercise.actualDurationUnit || exercise.durationUnit || 'min'}`}${(exercise.actualDistance || exercise.distance) ? ` - ${exercise.actualDistance || exercise.distance}` : ''})`
        :
        /* Traditional strength exercises */
        ((exercise.actualSets || exercise.sets) && (exercise.actualReps || exercise.reps)) ? 
          `(${exercise.actualSets || exercise.sets} × ${exercise.actualReps || exercise.reps}${(exercise.actualWeight || exercise.weight) ? ` @ ${exercise.actualWeight || exercise.weight} ${weightUnit}` : ''})` 
          : ''
    }
  </div>
))}
                      {workout.exercises.length > 4 && (
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          +{workout.exercises.length - 4} more exercises
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Notes */}
                {workout.notes && (
                  <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {workout.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Helper functions for workout types
  const getWorkoutTypeColor = (type) => {
    const typeColors = {
      'WEIGHTLIFTING': "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      'CARDIO': "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300",
      'YOGA': "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
      'SWIMMING': "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
      'CYCLING': "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300",
      'HIIT': "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
      'PILATES': "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
      'BOXING': "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300",
      'CALISTHENICS': "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
      'STRETCHING': "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
      'WALKING': "bg-lime-50 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300",
      'OTHER': "bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
    };
    
    const normalizedType = type.toUpperCase();
    return typeColors[normalizedType] || "bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
  };

  const getWorkoutTypeIcon = (type) => {
    const typeIcons = {
      'WEIGHTLIFTING': "🏋️",
      'CARDIO': "🏃",
      'YOGA': "🧘",
      'SWIMMING': "🏊",
      'CYCLING': "🚴",
      'HIIT': "⚡",
      'PILATES': "🤸",
      'BOXING': "🥊",
      'CALISTHENICS': "💪",
      'STRETCHING': "🧠",
      'WALKING': "👣",
      'OTHER': "🏅"
    };
    
    const normalizedType = type.toUpperCase();
    return typeIcons[normalizedType] || "🏋️";
  };

  const getWorkoutTypeName = (type) => {
    const typeNames = {
      'WEIGHTLIFTING': "Weightlifting",
      'CARDIO': "Cardio",
      'YOGA': "Yoga",
      'SWIMMING': "Swimming",
      'CYCLING': "Cycling",
      'HIIT': "HIIT",
      'PILATES': "Pilates",
      'BOXING': "Boxing",
      'CALISTHENICS': "Calisthenics",
      'STRETCHING': "Stretching",
      'WALKING': "Walking",
      'OTHER': "Other"
    };
    
    const normalizedType = type.toUpperCase();
    return typeNames[normalizedType] || type;
  };

  // Render main workout modal
  return (
    <>
      <dialog 
        id="workout-modal" 
        className="modal-base"
        onClick={(e) => e.target.id === 'workout-modal' && onClose()}
      >
        <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
          {/* If showing workout logger, render it instead of the regular form */}
          {showWorkoutLogger ? (
            <WorkoutLogger 
              workoutId={selectedWorkoutId}
              date={date}
              existingWorkoutId={editingWorkout?.id}
              onComplete={(workout) => {
                console.log('[WorkoutTracker] Logger completed workout:', workout);
                handleWorkoutCompleted(workout);
              }}
              onCancel={() => {
                setShowWorkoutLogger(false);
                setSelectedWorkoutId(null);
                setEditingWorkout(null);
                setShowWorkoutList(true);
                setWorkoutMode('list');
              }}
            />
          ) : showQuickLogWorkout ? (
            <QuickLogWorkout 
              workout={editingWorkout}
              date={date}
              onComplete={(workout) => {
                console.log('[WorkoutTracker] QuickLog completed workout:', workout);
                handleWorkoutCompleted(workout);
              }}
              onClose={() => {
                setShowQuickLogWorkout(false);
                setEditingWorkout(null);
                setShowWorkoutList(true);
                setWorkoutMode('list');
              }}
              isDialog={false}
            />
          ) : (
            <>
              <div className="modal-header">
                <div>
                  <h3 className="modal-title flex items-center gap-2">
                    <Dumbbell className="text-blue-500 dark:text-blue-400" size={20} />
                    Workout Tracker
                  </h3>
                  <p className="modal-subtitle">
                    {getFormattedDate()}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="modal-close-button"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Workout content */}
              {workoutMode === 'list' && showWorkoutList && renderWorkoutList()}
            </>
          )}
        </div>
      </dialog>

      {/* Always render WorkoutSelector conditionally to avoid the null reference issue */}
      {showWorkoutSelector && (
        <WorkoutSelector
          date={date}
          onClose={() => {
            setShowWorkoutSelector(false);
            setShowWorkoutList(true);
            setWorkoutMode('list');
            const modal = document.getElementById('workout-selector-modal');
            if (modal) modal.close();
          }}
          onSelectWorkout={handleSelectWorkout}
          onCreateWorkout={() => {
            setShowWorkoutSelector(false);
            setShowWorkoutList(true);
            setWorkoutMode('list');
            const modal = document.getElementById('workout-selector-modal');
            if (modal) modal.close();
            // Redirect to the workout module section
            window.location.hash = "#workout"; // For simple navigation
          }}
        />
      )}
    </>
  );
};

export default WorkoutTracker;