import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckSquare, ArrowLeft, 
         Trash2, Dumbbell, Flame, Edit, AlertTriangle } from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import { getWorkoutTypesWithColors } from '../../utils/workoutUtils';
import { formatDateForStorage } from '../../utils/dateUtils';

const WorkoutHistory = ({ onBack, onEditWorkout }) => {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  
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
  
  // Handle editing a workout
  const handleEditWorkout = (workout) => {
    if (onEditWorkout) {
      onEditWorkout(workout);
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
            {onEditWorkout && (
              <button
                onClick={() => handleEditWorkout(workout)}
                className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
                title="Edit workout"
              >
                <Edit size={18} />
              </button>
            )}
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
                                {onEditWorkout && (
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
                                )}
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
    </div>
  );
};

export default WorkoutHistory;