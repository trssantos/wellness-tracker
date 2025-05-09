import React, { useState, useEffect } from 'react';
import { Repeat,Route, BarChart2, ArrowLeft, Edit3, Trash2, Play, Clock, Calendar, 
         MapPin, DollarSign, Dumbbell, Activity, AlertTriangle } from 'lucide-react';
import { getWorkoutTypes, getWorkoutLocations, getEquipmentOptions, getWorkoutById, getAllCompletedWorkouts } from '../../utils/workoutUtils';
import WorkoutPlayer from './WorkoutPlayer';
import WorkoutCalendar from './WorkoutCalendar';
import { formatDateForStorage } from '../../utils/dateUtils';
import { getWeightUnit } from '../../utils/storage';
import WorkoutProgress from './WorkoutProgress';
import PersonalRecords from './ExerciseProgressionTracker';
import WorkoutTypeDetails from './WorkoutTypeDetails';


const WorkoutDetails = ({ workout, onEdit, onBack, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentDate, setCurrentDate] = useState(formatDateForStorage(new Date()));
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'calendar'
  const [workoutData, setWorkoutData] = useState(null); // Store our workout data
  const [refreshTrigger, setRefreshTrigger] = useState(0); // To trigger refreshes
  const [weightUnit, setWeightUnit] = useState('lbs');
  // Add state to track if player is showing
  const [isPlayerShowing, setIsPlayerShowing] = useState(false);

  // Initialize with the workout prop and load completions
  useEffect(() => {
    if (workout) {
      setWorkoutData(workout);
      loadCompletedWorkouts(workout.id);
    }
  }, [workout, refreshTrigger]); // Add refreshTrigger as a dependency

  useEffect(() => {
    setWeightUnit(getWeightUnit());
  }, []);
  

  // Load completed instances of this workout
  const loadCompletedWorkouts = (workoutId) => {
    if (workoutId) {
      const allWorkouts = getAllCompletedWorkouts();
      // Filter for this specific workout template
      const filtered = allWorkouts.filter(w => w.workoutId === workoutId);
      setCompletedWorkouts(filtered);
    }
  };

  // Refresh data when returning from edit
  const refreshWorkoutData = () => {
    if (workoutData?.id) {
      // Get fresh data for this workout
      const refreshedWorkout = getWorkoutById(workoutData.id);
      if (refreshedWorkout) {
        setWorkoutData(refreshedWorkout);
      }
      // Also reload completions
      loadCompletedWorkouts(workoutData.id);
    }
    // Increment refresh trigger to force a re-render
    setRefreshTrigger(prev => prev + 1);
  };

  // Helper function to get workout type label
  const getWorkoutTypeLabel = (type) => {
    const types = getWorkoutTypes();
    const foundType = types.find(t => t.value === type);
    return foundType ? foundType.label : 'Workout';
  };

  // Helper function to get workout location label
  const getLocationLabel = (location) => {
    const locations = getWorkoutLocations();
    const foundLocation = locations.find(l => l.value === location);
    return foundLocation ? foundLocation.label : 'Other';
  };

  const formatTime = (seconds) => {
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

  const formatExerciseTime = (timeValue) => {
    // If it's a number (seconds), format as duration
    if (typeof timeValue === 'number') {
      const mins = Math.floor(timeValue / 60);
      const secs = timeValue % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // If it's a string that contains a timestamp or date
    if (typeof timeValue === 'string' && 
        (timeValue.includes(':') || timeValue.includes('T') || 
         timeValue.includes('AM') || timeValue.includes('PM'))) {
      try {
        // Try to extract just the minutes and seconds
        const date = new Date(timeValue);
        // If it's a valid date
        if (!isNaN(date.getTime())) {
          const mins = date.getHours() * 60 + date.getMinutes();
          const secs = date.getSeconds();
          return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
      } catch (e) {
        console.error("Error parsing time:", e);
      }
    }
    
    // Return the original value as a fallback
    return timeValue;
  };

  // Helper function to get day name from abbreviation
  const getDayName = (day) => {
    const days = {
      'mon': 'Monday',
      'tue': 'Tuesday',
      'wed': 'Wednesday',
      'thu': 'Thursday',
      'fri': 'Friday',
      'sat': 'Saturday',
      'sun': 'Sunday'
    };
    return days[day] || day;
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

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  // Format the frequency days
  const frequencyText = workoutData?.frequency?.map(day => getDayName(day)).join(', ') || '';

  // Start workout - update the state to show the player
  const startWorkout = () => {
    setIsPlayerShowing(true);
  };

  // Handle workout completion
  const handleWorkoutComplete = (completedWorkout) => {
    setIsPlayerShowing(false);
    // Refresh data after completing a workout
    refreshWorkoutData();
  };

  // Handle date click on calendar
  const handleCalendarDateClick = (date, workouts) => {
    if (workouts && workouts.length > 0) {
      // Could show details of the completed workout on this date
      console.log('Completed workouts on', date, workouts);
    }
  };

  // Handle edit with a refresh
  const handleEdit = () => {
    // Call the parent's edit handler
    onEdit();
    
    // Set a timer to refresh data when coming back from edit view
    // This ensures we get the latest data after editing
    setTimeout(() => {
      refreshWorkoutData();
    }, 500);
  };

  // Render calendar content
  const renderCalendarTab = () => (
    <div className="space-y-4">
      <WorkoutCalendar 
        workoutData={completedWorkouts}
        workoutId={workoutData?.id}
        onDateClick={handleCalendarDateClick}
      />
      
      <div className="text-sm text-slate-600 dark:text-slate-400 text-center">
        {completedWorkouts.length > 0 
          ? `Completed ${completedWorkouts.length} times`
          : 'No workout completions yet. Start this workout to track your progress!'}
      </div>
      
      {completedWorkouts.length > 0 && (
        <div className="mt-6 bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Recent Completions
          </h3>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {completedWorkouts.slice(0, 5).map((workout, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium text-sm text-slate-700 dark:text-slate-300">
                    {new Date(workout.completedAt || workout.timestamp).toLocaleDateString('default', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(workout.completedAt || workout.timestamp).toLocaleTimeString('default', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                    {workout.duration} min
                  </span>
                  
                  {workout.calories && (
                    <span className="text-xs px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
                      {workout.calories} kcal
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render overview content
  const renderOverviewTab = () => (
    <>
      {/* Workout Overview */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-4">Overview</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Activity size={16} className="text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Type</div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
                {getWorkoutTypeLabel(workoutData?.type)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-green-500 dark:text-green-400" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Duration</div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
                {workoutData?.duration} minutes
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-purple-500 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Location</div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
                {getLocationLabel(workoutData?.location)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar size={16} className="text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Schedule</div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
                {workoutData?.timeOfDay?.charAt(0).toUpperCase() + workoutData?.timeOfDay?.slice(1) || 'Any time'}
              </div>
            </div>
          </div>
        </div>
        
        {workoutData?.notes && (
          <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-300 break-words">
            {workoutData.notes}
          </div>
        )}
      </div>

      {/* Workout Type Specific Information */}
      <WorkoutTypeDetails workout={workoutData} />

      {/* Schedule */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-slate-500 dark:text-slate-400" />
          Schedule
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => {
            const isActive = workoutData?.frequency?.includes(day);
            return (
              <div
                key={day}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-blue-500 dark:bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                }`}
              >
                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
              </div>
            );
          })}
        </div>
        
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <p className="line-clamp-2">This workout is scheduled for <span className="font-medium text-slate-700 dark:text-slate-300">{frequencyText}</span> in the <span className="font-medium text-slate-700 dark:text-slate-300">{workoutData?.timeOfDay || 'any time'}</span>.</p>
        </div>
      </div>

      {/* Equipment */}
      {workoutData?.equipment && workoutData.equipment.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Dumbbell size={16} className="text-slate-500 dark:text-slate-400" />
            Equipment
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {workoutData.equipment.map((item, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Exercises */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Activity size={16} className="text-slate-500 dark:text-slate-400" />
          Exercises
        </h3>
        
        {!workoutData?.exercises || workoutData.exercises.length === 0 ? (
          <div className="text-sm text-slate-500 dark:text-slate-400 text-center p-4">
            No exercises added to this workout yet.
          </div>
        ) : (
          <div className="space-y-3">
            {workoutData.exercises.map((exercise, index) => (
  <div 
    key={index}
    className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg"
  >
    <div className="flex justify-between items-start">
      <div className="w-[70%] overflow-hidden">
        <div className="font-medium text-slate-700 dark:text-slate-200 text-sm truncate">{exercise.name}</div>
      </div>
      <div className="w-[30%] text-right">
        {exercise.isDurationBased ? (
          // For duration-based exercises with sets
          exercise.sets && exercise.sets > 1 ? 
            // Multi-set duration exercise
            <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full inline-block">
              {exercise.sets}×{exercise.duration || 0} {exercise.durationUnit || 'min'}
              {exercise.distance ? ` (${exercise.distance})` : ''}
            </div> 
            : 
            // Single-set duration exercise
            <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full inline-block">
              {exercise.duration || 0} {exercise.durationUnit || 'min'}
              {exercise.distance ? ` (${exercise.distance})` : ''}
            </div>
        ) : (
          // Traditional strength exercise
          <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full inline-block">
            {exercise.sets} × {exercise.reps}
            {exercise.weight ? ` (${exercise.weight} ${weightUnit})` : ''}
          </div>
        )}
      </div>
    </div>
    
    {/* Additional details shown below the exercise name */}
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
      {exercise.isDurationBased ? (
        // Duration-based exercise details
        <>
          {exercise.sets && exercise.sets > 1 && (
            <div className="flex items-center gap-1">
              <Repeat size={12} />
              <span>{exercise.sets} sets</span>
            </div>
          )}
          
          {exercise.distance && (
            <div className="flex items-center gap-1">
              <Route size={12} />
              <span>{exercise.distance}</span>
            </div>
          )}
          
          {exercise.intensity && (
            <div className="flex items-center gap-1">
              <Activity size={12} />
              <span>Intensity: {formatIntensity(exercise.intensity)}</span>
            </div>
          )}
        </>
      ) : (
        // Traditional strength exercise details
        <>
          {exercise.weight && (
            <div className="flex items-center gap-1">
              <Dumbbell size={12} />
              <span>{exercise.weight} {weightUnit}</span>
            </div>
          )}
          
          {exercise.restTime && (
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{exercise.restTime}s rest</span>
            </div>
          )}
        </>
      )}
    </div>
    
    {exercise.notes && (
      <div className="w-full mt-1 text-xs italic text-slate-500 dark:text-slate-400 line-clamp-2">
        {exercise.notes}
      </div>
    )}
  </div>
))}
          </div>
        )}
      </div>

      {/* Completion Stats */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <BarChart2 size={16} className="text-slate-500 dark:text-slate-400" />
          Completion Stats
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            <div className="text-xs text-slate-500 dark:text-slate-400">Completions</div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{completedWorkouts.length}</div>
          </div>
          
          <div className="flex flex-col bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            <div className="text-xs text-slate-500 dark:text-slate-400">Last Completed</div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
              {completedWorkouts.length > 0 
                ? new Date(completedWorkouts[0].completedAt || completedWorkouts[0].timestamp)
                    .toLocaleDateString('default', { month: 'short', day: 'numeric' })
                : 'Never'}
            </div>
          </div>
        </div>
      </div>

       {/* Workout Progress Tracking */}
      <WorkoutProgress 
        workout={workoutData}
        completedWorkouts={completedWorkouts}
      />

      {/* Personal Records */}
      <PersonalRecords
        workoutType={workoutData?.type}
        exerciseFilter={workoutData?.exercises?.map(ex => ex.name) || []}
      />
    </>
    
  );

  if (!workoutData) return null;

  // If the player is showing, render the player instead of workout details
  if (isPlayerShowing) {
    return (
      <div className="px-2 sm:px-0 w-full">
        <WorkoutPlayer
          workoutId={workoutData.id}
          date={currentDate}
          onComplete={handleWorkoutComplete}
          onClose={() => setIsPlayerShowing(false)}
        />
      </div>
    );
  }

  // Otherwise render the normal workout details view
  return (
    <div className="px-2 sm:px-0 w-full">
      <div className="grid grid-cols-[auto,1fr] items-center gap-2 mb-4 sm:mb-6">
        <button 
          onClick={onBack}
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 truncate pr-2">
          {workoutData.name}
        </h2>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={startWorkout}
          className="flex-1 py-2 sm:py-3 rounded-lg bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Play size={18} />
          Start Workout
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'overview'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'calendar'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Calendar
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? renderOverviewTab() : renderCalendarTab()}

     

      {/* Edit / Delete Buttons */}
      <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
        <button 
          onClick={handleEdit}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
        >
          <Edit3 size={16} />
          Edit Workout
        </button>
        
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4 text-amber-500 dark:text-amber-400">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">Delete Workout</h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete <span className="font-medium text-slate-800 dark:text-slate-100 line-clamp-1">{workoutData.name}</span>? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg"
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

export default WorkoutDetails;