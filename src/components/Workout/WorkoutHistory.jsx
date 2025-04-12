import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Save, Clock, Calendar, CheckSquare, ArrowLeft, 
         Trash2, Dumbbell, Flame, Edit, AlertTriangle } from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import { getWorkoutTypesWithColors } from '../../utils/workoutUtils';
import { formatDateForStorage } from '../../utils/dateUtils';
import WorkoutLogger from './WorkoutLogger';

const WorkoutHistory = ({ onBack, onEditWorkout }) => {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  
  // Add new state for editing
  const [workoutToEdit, setWorkoutToEdit] = useState(null);
  const [showWorkoutLogger, setShowWorkoutLogger] = useState(false);
  const [showManualEditor, setShowManualEditor] = useState(false);
  
  // Load workouts on mount
  useEffect(() => {
    loadWorkouts();
  }, []);
  
  // Load workouts from all storage locations
  const loadWorkouts = () => {
    try {
      // Get data from localStorage
      const storageString = localStorage.getItem('wellnessTracker');
      
      if (!storageString) {
        console.warn("No workout data found in localStorage");
        setWorkouts([]);
        return;
      }
      
      const storageData = JSON.parse(storageString);
      
      let allWorkouts = [];
      const processedWorkoutIds = new Set();
      
      // Process completedWorkouts array (top level)
      if (storageData.completedWorkouts && Array.isArray(storageData.completedWorkouts)) {
        storageData.completedWorkouts.forEach(workout => {
          const workoutId = workout.id || `workout-${Date.now()}-${Math.random()}`;
          if (!processedWorkoutIds.has(workoutId)) {
            processedWorkoutIds.add(workoutId);
            allWorkouts.push({
              ...workout,
              date: workout.date || formatDateForStorage(new Date(workout.timestamp || workout.completedAt)),
              id: workoutId
            });
          }
        });
      }
      
      // Process date entries with workout property
      Object.entries(storageData).forEach(([dateKey, dateData]) => {
        // Skip if not a date entry or if it's a special key
        if (!dateKey.match(/^\d{4}-\d{2}-\d{2}$/) || 
            !dateData || 
            typeof dateData !== 'object') {
          return;
        }
        
        // Process single workout
        if (dateData.workout) {
          const workout = dateData.workout;
          const workoutId = workout.id || `workout-${dateKey}`;
          
          if (!processedWorkoutIds.has(workoutId)) {
            processedWorkoutIds.add(workoutId);
            allWorkouts.push({
              ...workout,
              date: dateKey,
              id: workoutId
            });
          }
        }
        
        // Process workouts array
        if (dateData.workouts && Array.isArray(dateData.workouts)) {
          dateData.workouts.forEach(workout => {
            const workoutId = workout.id || `workout-${dateKey}-${Math.random()}`;
            
            if (!processedWorkoutIds.has(workoutId)) {
              processedWorkoutIds.add(workoutId);
              allWorkouts.push({
                ...workout,
                date: workout.date || dateKey,
                id: workoutId
              });
            }
          });
        }
      });
      
      // Sort workouts by date/time (newest first)
      allWorkouts.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.timestamp || a.date);
        const dateB = new Date(b.completedAt || b.timestamp || b.date);
        return dateB - dateA;
      });
      
      setWorkouts(allWorkouts);
    } catch (error) {
      console.error("Error loading workouts:", error);
      setWorkouts([]);
    }
  };
  
  // Format time from ISO string to readable time
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString('default', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Return to workout list
  const handleBackClick = () => {
    setSelectedWorkout(null);
  };
  
  // Delete a workout
  const handleDeleteWorkout = (workoutId) => {
    setWorkoutToDelete(workoutId);
    setShowDeleteConfirm(true);
  };
  
  // Confirm deletion
  const confirmDeleteWorkout = () => {
    if (!workoutToDelete) return;
    
    // Get storage
    const storage = getStorage();
    
    // Find and remove the workout
    let workoutRemoved = false;
    
    // Check in completedWorkouts array
    if (storage.completedWorkouts && Array.isArray(storage.completedWorkouts)) {
      const initialLength = storage.completedWorkouts.length;
      storage.completedWorkouts = storage.completedWorkouts.filter(w => w.id !== workoutToDelete);
      if (storage.completedWorkouts.length < initialLength) {
        workoutRemoved = true;
      }
    }
    
    // If not found in completedWorkouts, check in date entries
    if (!workoutRemoved) {
      Object.entries(storage).forEach(([dateKey, dateData]) => {
        if (!dateKey.match(/^\d{4}-\d{2}-\d{2}$/) || 
            !dateData || 
            typeof dateData !== 'object') {
          return;
        }
        
        // Check single workout
        if (dateData.workout && dateData.workout.id === workoutToDelete) {
          delete dateData.workout;
          workoutRemoved = true;
        }
        
        // Check workouts array
        if (dateData.workouts && Array.isArray(dateData.workouts)) {
          const initialLength = dateData.workouts.length;
          dateData.workouts = dateData.workouts.filter(w => w.id !== workoutToDelete);
          if (dateData.workouts.length < initialLength) {
            workoutRemoved = true;
          }
          
          // If array is now empty, remove it
          if (dateData.workouts.length === 0) {
            delete dateData.workouts;
          }
        }
        
        // Update storage for this date
        storage[dateKey] = dateData;
      });
    }
    
    // Save updated storage
    if (workoutRemoved) {
      setStorage(storage);
      
      // Update local state
      setWorkouts(workouts.filter(w => w.id !== workoutToDelete));
      
      // If deleting the selected workout, go back to list
      if (selectedWorkout && selectedWorkout.id === workoutToDelete) {
        setSelectedWorkout(null);
      }
    }
    
    // Reset delete state
    setWorkoutToDelete(null);
    setShowDeleteConfirm(false);
  };
  
  // Handle editing a workout - UPDATED FUNCTION
  const handleEditWorkout = (workout) => {
    // Check what type of workout it is (template-based or manual)
    if (workout.workoutId) {
      // It's a template-based workout, use WorkoutLogger for editing
      setWorkoutToEdit(workout);
      setShowWorkoutLogger(true);
    } else {
      // It's a quick log workout, use the manual editor
      setWorkoutToEdit(workout);
      setShowManualEditor(true);
    }
  };
  
  // Handle workout completed from logger
  const handleWorkoutCompleted = (completedWorkout) => {
    setShowWorkoutLogger(false);
    setWorkoutToEdit(null);
    loadWorkouts(); // Refresh the list after editing
  };
  
  // Handle saving manual workout
  const handleSaveManualWorkout = (updatedWorkout) => {
    // Close the manual editor
    setShowManualEditor(false);
    setWorkoutToEdit(null);
    
    // Get storage
    const storage = getStorage();
    let updated = false;
    
    // Find the workout in storage
    if (storage.completedWorkouts && Array.isArray(storage.completedWorkouts)) {
      const index = storage.completedWorkouts.findIndex(w => w.id === updatedWorkout.id);
      if (index !== -1) {
        storage.completedWorkouts[index] = updatedWorkout;
        updated = true;
      }
    }
    
    // If not found in completedWorkouts, check date entries
    if (!updated) {
      const dateKey = updatedWorkout.date;
      if (dateKey && storage[dateKey]) {
        if (storage[dateKey].workout && storage[dateKey].workout.id === updatedWorkout.id) {
          storage[dateKey].workout = updatedWorkout;
          updated = true;
        } else if (storage[dateKey].workouts && Array.isArray(storage[dateKey].workouts)) {
          const index = storage[dateKey].workouts.findIndex(w => w.id === updatedWorkout.id);
          if (index !== -1) {
            storage[dateKey].workouts[index] = updatedWorkout;
            updated = true;
          }
        }
      }
    }
    
    // If workout was updated, save changes
    if (updated) {
      setStorage(storage);
      loadWorkouts(); // Refresh the list
    }
  };
  
  // Get workout type color based on type
  const getTypeColor = (type) => {
    if (!type) return "bg-slate-500";
    
    const typeColors = {
      'WEIGHTLIFTING': "bg-blue-500",
      'CARDIO': "bg-red-500",
      'YOGA': "bg-purple-500",
      'SWIMMING': "bg-cyan-500",
      'CYCLING': "bg-green-500",
      'HIIT': "bg-orange-500",
      'PILATES': "bg-pink-500",
      'BOXING': "bg-red-500",
      'CALISTHENICS': "bg-amber-500",
      'STRETCHING': "bg-teal-500",
      'WALKING': "bg-lime-500"
    };
    
    const normalizedType = type.toUpperCase();
    return typeColors[normalizedType] || "bg-slate-500";
  };
  
  // Render workout details
  const renderWorkoutDetails = (workout) => {
    const startTime = workout.completedAt || workout.timestamp || new Date();
    
    return (
      <div className="workout-details">
        {/* Header with back button */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBackClick}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 transition-colors">
              Workout Details
            </h3>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleEditWorkout(workout)}
              className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
              title="Edit workout"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => handleDeleteWorkout(workout.id)}
              className="p-2 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/40 transition-colors"
              title="Delete workout"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        
        {/* Workout header card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-5 mb-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 transition-colors">
                {formatDate(workout.date || startTime)} at {formatTime(startTime)}
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-1 transition-colors truncate">
                {workout.name || 'Workout'}
              </h2>
              
              {/* Workout Type Badges */}
              <div className="flex flex-wrap gap-2 mt-2">
                {workout.types && workout.types.map((type, i) => (
                  <span 
                    key={i}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs text-white ${getTypeColor(type)}`}
                  >
                    {type}
                  </span>
                ))}
                
                {(!workout.types || workout.types.length === 0) && workout.type && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs text-white ${getTypeColor(workout.type)}`}>
                    {workout.type}
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors">
                {workout.duration || 0} min
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
                Duration
              </div>
              
              {workout.calories && (
                <div className="mt-2">
                  <div className="text-lg font-bold text-red-600 dark:text-red-400 transition-colors">
                    {workout.calories} kcal
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
                    Calories Burned
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Workout Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {/* Intensity */}
          {workout.intensity && (
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell size={18} className="text-blue-500 dark:text-blue-400" />
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Intensity</div>
              </div>
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300 transition-colors">
                {workout.intensity}/5
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
                Perceived effort level
              </div>
            </div>
          )}
          
          {/* Time of Day */}
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-purple-500 dark:text-purple-400" />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Time</div>
            </div>
            <div className="text-xl font-bold text-purple-700 dark:text-purple-300 transition-colors">
              {formatTime(startTime)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
              Workout start time
            </div>
          </div>
          
          {/* Date */}
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-green-500 dark:text-green-400" />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Date</div>
            </div>
            <div className="text-xl font-bold text-green-700 dark:text-green-300 transition-colors truncate">
              {formatDate(workout.date || startTime)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
              Workout day
            </div>
          </div>
        </div>
        
        {/* Exercises */}
        {workout.exercises && workout.exercises.length > 0 && (
          <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 transition-colors">
              Exercises ({workout.exercises.length})
            </h4>
            <div className="space-y-2">
              {workout.exercises.map((exercise, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-700 dark:text-slate-300 transition-colors">
                        {exercise.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 transition-colors">
                        {exercise.sets && exercise.reps && (
                          <span>{exercise.sets} sets × {exercise.reps} reps</span>
                        )}
                        {exercise.weight && (
                          <span>• {exercise.weight} weight</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Notes */}
        {workout.notes && (
          <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 transition-colors">
              Notes
            </h4>
            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap transition-colors">
              {workout.notes}
            </p>
          </div>
        )}
      </div>
    );
  };
  
  // Render the workout list
  const renderWorkoutList = () => {
    return (
      <div>
        {/* Add back button at the top */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 transition-colors">
              Workout History
            </h3>
          </div>
        </div>

        {workouts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4 transition-colors">
              <Dumbbell size={40} className="text-slate-400 dark:text-slate-500 transition-colors" />
            </div>
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
              No Workouts Yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto transition-colors">
              Your completed workouts will appear here once you've tracked some workouts.
            </p>
          </div>
        ) : (
          // Group workouts by date
          (() => {
            const workoutsByDate = {};
            workouts.forEach(workout => {
              const dateStr = workout.date || formatDateForStorage(new Date(workout.completedAt || workout.timestamp));
              
              if (!workoutsByDate[dateStr]) {
                workoutsByDate[dateStr] = [];
              }
              workoutsByDate[dateStr].push(workout);
            });
            
            // Sort dates in descending order
            const sortedDates = Object.keys(workoutsByDate).sort((a, b) => b.localeCompare(a));
            
            return (
              <div className="space-y-6">
                {sortedDates.map(dateStr => (
                  <div key={dateStr}>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2 transition-colors">
                      <Calendar size={16} className="text-slate-400 dark:text-slate-500" />
                      {formatDate(dateStr)}
                    </h3>
                    
                    <div className="space-y-3">
                      {workoutsByDate[dateStr].map(workout => (
                        <div 
                          key={workout.id}
                          className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div 
                              onClick={() => setSelectedWorkout(workout)} 
                              className="cursor-pointer flex-1"
                            >
                              <h4 className="font-medium text-slate-800 dark:text-slate-200 transition-colors">
                                {workout.name || 'Workout'}
                              </h4>
                              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-4 mt-1 transition-colors">
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  <span>{formatTime(workout.completedAt || workout.timestamp)}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Dumbbell size={14} />
                                  <span>{workout.duration || 0} min</span>
                                </span>
                              </div>
                              
                              {/* Workout Type Badges */}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {workout.types && workout.types.map((type, i) => (
                                  <span 
                                    key={i}
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs text-white ${getTypeColor(type)}`}
                                  >
                                    {type}
                                  </span>
                                ))}
                                
                                {(!workout.types || workout.types.length === 0) && workout.type && (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs text-white ${getTypeColor(workout.type)}`}>
                                    {workout.type}
                                  </span>
                                )}
                                
                                {workout.calories && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 transition-colors">
                                    <Flame size={12} />
                                    {workout.calories} kcal
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="ml-4 flex items-center">
                              {/* Actions */}
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditWorkout(workout);
                                  }}
                                  className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                  title="Edit workout"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteWorkout(workout.id);
                                  }}
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                  title="Delete workout"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()
        )}
      </div>
    );
  };
  
  // NEW: The Manual Workout Editor Component
  const ManualWorkoutEditor = ({ workout, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      ...workout,
      // Ensure all required fields exist
      types: workout.types || [],
      duration: workout.duration || 30,
      intensity: workout.intensity || 3,
      calories: workout.calories || '',
      notes: workout.notes || '',
      exercises: workout.exercises || []
    });
    
    // State for new exercise form
    const [currentExercise, setCurrentExercise] = useState({
      name: '',
      sets: 3,
      reps: 10,
      weight: ''
    });
    
    // Available workout types with icons and colors
    const WORKOUT_TYPES = {
      WEIGHTLIFTING: { 
        name: "Weightlifting", 
        icon: "🏋️", 
        color: "bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700" 
      },
      CARDIO: { 
        name: "Cardio", 
        icon: "🏃", 
        color: "bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-800/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700" 
      },
      YOGA: { 
        name: "Yoga", 
        icon: "🧘", 
        color: "bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-800/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700" 
      },
      SWIMMING: { 
        name: "Swimming", 
        icon: "🏊", 
        color: "bg-cyan-50 dark:bg-cyan-900/30 hover:bg-cyan-100 dark:hover:bg-cyan-800/40 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700" 
      },
      CYCLING: { 
        name: "Cycling", 
        icon: "🚴", 
        color: "bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-800/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700" 
      },
      HIIT: { 
        name: "HIIT", 
        icon: "⚡", 
        color: "bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-800/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700" 
      },
      PILATES: { 
        name: "Pilates", 
        icon: "🤸", 
        color: "bg-pink-50 dark:bg-pink-900/30 hover:bg-pink-100 dark:hover:bg-pink-800/40 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-700" 
      },
      BOXING: { 
        name: "Boxing", 
        icon: "🥊", 
        color: "bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-800/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700" 
      },
      CALISTHENICS: { 
        name: "Calisthenics", 
        icon: "💪", 
        color: "bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-800/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700" 
      },
      STRETCHING: { 
        name: "Stretching", 
        icon: "🧠", 
        color: "bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-800/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-700" 
      },
      WALKING: { 
        name: "Walking", 
        icon: "👣", 
        color: "bg-lime-50 dark:bg-lime-900/30 hover:bg-lime-100 dark:hover:bg-lime-800/40 text-lime-800 dark:text-lime-300 border-lime-200 dark:border-lime-700" 
      },
      OTHER: { 
        name: "Other", 
        icon: "🏅", 
        color: "bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-600" 
      }
    };
    
    // Predefined intensity levels
    const INTENSITY_LEVELS = [
      { value: 1, label: "Light", color: "bg-green-100 dark:bg-green-900/40" },
      { value: 2, label: "Moderate", color: "bg-yellow-100 dark:bg-yellow-900/40" },
      { value: 3, label: "Challenging", color: "bg-orange-100 dark:bg-orange-900/40" },
      { value: 4, label: "Intense", color: "bg-red-100 dark:bg-red-900/40" },
      { value: 5, label: "Maximum", color: "bg-purple-100 dark:bg-purple-900/40" }
    ];
    
    // Handle workout type toggle
    const handleTypeToggle = (typeKey) => {
      if (formData.types.includes(typeKey)) {
        setFormData({
          ...formData,
          types: formData.types.filter(type => type !== typeKey)
        });
      } else {
        setFormData({
          ...formData,
          types: [...formData.types, typeKey]
        });
      }
    };
    
    // Handle duration adjustment
    const adjustDuration = (amount) => {
      setFormData({
        ...formData,
        duration: Math.max(5, parseInt(formData.duration) + amount)
      });
    };
    
    // Handle intensity selection
    const handleIntensityChange = (value) => {
      setFormData({
        ...formData,
        intensity: value
      });
    };
    
    // Handle calories input
    const handleCaloriesChange = (e) => {
      // Allow only numbers
      const value = e.target.value.replace(/\D/g, '');
      setFormData({
        ...formData,
        calories: value
      });
    };
    
    // Handle notes input
    const handleNotesChange = (e) => {
      setFormData({
        ...formData,
        notes: e.target.value
      });
    };
    
    // Handle exercise input change
    const handleExerciseChange = (index, field, value) => {
      const updatedExercises = [...formData.exercises];
      updatedExercises[index][field] = value;
      
      setFormData({
        ...formData,
        exercises: updatedExercises
      });
    };
    
    // Handle adding a new exercise
    const handleAddExercise = () => {
      if (!currentExercise.name.trim()) return;
      
      setFormData({
        ...formData,
        exercises: [...formData.exercises, { ...currentExercise }]
      });
      
      // Reset form
      setCurrentExercise({
        name: '',
        sets: 3,
        reps: 10,
        weight: ''
      });
    };
    
    // Handle removing an exercise
    const handleRemoveExercise = (index) => {
      const updatedExercises = [...formData.exercises];
      updatedExercises.splice(index, 1);
      
      setFormData({
        ...formData,
        exercises: updatedExercises
      });
    };
    
    // Handle saving the workout
    const handleSaveWorkout = () => {
      // Create updated workout object
      const updatedWorkout = {
        ...workout,
        ...formData,
        // Make sure name is set from the types if it's empty
        name: formData.name || formData.types.map(type => WORKOUT_TYPES[type]?.name).join(', ') || 'Workout'
      };
      
      onSave(updatedWorkout);
    };
    
    return (
      <dialog 
        id="manual-workout-editor-modal" 
        className="modal-base"
        open={true}
      >
        <div className="modal-content max-w-2xl">
          <div className="modal-header">
            <div>
              <h3 className="modal-title flex items-center gap-2">
                <Dumbbell className="text-blue-500 dark:text-blue-400" size={20} />
                Edit Workout
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="modal-close-button"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Workout Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                Workout Type
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {Object.entries(WORKOUT_TYPES).slice(0, 12).map(([key, { name, icon, color }]) => (
                  <button
                    key={key}
                    onClick={() => handleTypeToggle(key)}
                    className={`
                      flex flex-col items-center p-2 rounded-lg border border-slate-200 dark:border-slate-700
                      ${formData.types.includes(key) 
                        ? color.replace('hover:', '') 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}
                      transition-colors
                    `}
                  >
                    <span className="text-xl mb-1">{icon}</span>
                    <span className="text-xs text-center leading-tight">{name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Duration Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors">
                  <Clock size={16} className="text-slate-500 dark:text-slate-400" />
                  Duration (minutes)
                </label>
                <span className="text-lg font-semibold text-blue-700 dark:text-blue-400 transition-colors">{formData.duration} min</span>
              </div>
              {/* Duration Adjuster */}
              <div className="flex items-center justify-center gap-3 mb-3">
                <button
                  onClick={() => adjustDuration(-5)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <Minus size={16} className="text-slate-600 dark:text-slate-300" />
                </button>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  min="5"
                  step="5"
                  className="w-16 text-center font-semibold border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 p-1"
                />
                <button
                  onClick={() => adjustDuration(5)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <Plus size={16} className="text-slate-600 dark:text-slate-300" />
                </button>
              </div>
              <input
                type="range"
                min="5"
                max="180"
                step="5"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full h-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:accent-blue-600 transition-colors"
              />
            </div>
            
            {/* Intensity Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1 transition-colors">
                <Flame size={16} className="text-slate-500 dark:text-slate-400" />
                Intensity Level
              </label>
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {INTENSITY_LEVELS.map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => handleIntensityChange(value)}
                    className={`
                      p-2 rounded-lg text-center transition-colors
                      ${formData.intensity === value 
                        ? `${color} ring-2 ring-blue-500 font-medium` 
                        : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}
                    `}
                  >
                    <div className="text-lg font-semibold text-slate-700 dark:text-slate-200 transition-colors">{value}</div>
                    <div className="text-xs truncate text-slate-600 dark:text-slate-400 transition-colors">{label}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Calories Burned */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1 transition-colors">
                <Flame size={16} className="text-red-500 dark:text-red-400" />
                Calories Burned
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.calories}
                  onChange={handleCaloriesChange}
                  placeholder="Enter calories..."
                  className="w-full p-2 pr-14 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500 dark:text-slate-400">
                  kcal
                </div>
              </div>
            </div>
            
            {/* Exercises */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                Exercises
              </label>
              
              {/* Exercise list */}
              {formData.exercises.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.exercises.map((exercise, index) => (
                    <div 
                      key={index}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{exercise.name}</p>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                          <span>
                            {exercise.sets} × {exercise.reps}
                          </span>
                          {exercise.weight && (
                            <span>• {exercise.weight}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveExercise(index)}
                        className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* New exercise form */}
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Exercise name"
                      value={currentExercise.name}
                      onChange={(e) => setCurrentExercise({...currentExercise, name: e.target.value})}
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Sets"
                      value={currentExercise.sets}
                      onChange={(e) => setCurrentExercise({...currentExercise, sets: e.target.value})}
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Reps"
                      value={currentExercise.reps}
                      onChange={(e) => setCurrentExercise({...currentExercise, reps: e.target.value})}
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Weight (optional)"
                    value={currentExercise.weight}
                    onChange={(e) => setCurrentExercise({...currentExercise, weight: e.target.value})}
                    className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                  />
                  <button
                    onClick={handleAddExercise}
                    disabled={!currentExercise.name.trim()}
                    className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
                      !currentExercise.name.trim() 
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500' 
                        : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
                    }`}
                  >
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={handleNotesChange}
                placeholder="Add any notes about your workout..."
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 h-24"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700 transition-colors">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSaveWorkout}
                disabled={formData.types.length === 0}
                className={`
                  flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors
                  ${formData.types.length === 0 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600' 
                    : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'}
                `}
              >
                <Save size={18} />
                Update Workout
              </button>
            </div>
          </div>
        </div>
      </dialog>
    );
  };
  
  return (
    <div className="workout-history">
      {/* If there's a selected workout, show details, otherwise show list */}
      {selectedWorkout ? renderWorkoutDetails(selectedWorkout) : renderWorkoutList()}
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100">
                Delete Workout?
              </h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete this workout? This action cannot be undone and the workout data will be permanently removed from your history.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              
              <button
                onClick={confirmDeleteWorkout}
                className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* WorkoutLogger for template-based workouts */}
      {showWorkoutLogger && (
        <dialog 
          id="workout-logger-modal" 
          className="modal-base"
          open={true}
        >
          <div className="modal-content max-w-2xl">
            <WorkoutLogger 
              workoutId={workoutToEdit.workoutId}
              date={workoutToEdit.date}
              existingWorkoutId={workoutToEdit.id}
              onComplete={handleWorkoutCompleted}
              onCancel={() => {
                setShowWorkoutLogger(false);
                setWorkoutToEdit(null);
              }}
            />
          </div>
        </dialog>
      )}
      
      {/* Manual editor for quick log workouts */}
      {showManualEditor && (
        <ManualWorkoutEditor 
          workout={workoutToEdit}
          onSave={handleSaveManualWorkout}
          onCancel={() => {
            setShowManualEditor(false);
            setWorkoutToEdit(null);
          }}
        />
      )}
    </div>
  );
};

export default WorkoutHistory;