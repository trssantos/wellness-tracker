// src/utils/workoutUtils.js
import { getStorage, setStorage } from './storage';
import { handleDataChange } from './dayCoachUtils';
import { formatDateForStorage } from './dateUtils';


/**
 * Initialize workout data if it doesn't exist
 * @returns {Object} The current workout data
 */
export const initWorkoutData = () => {
  const storage = getStorage();
  
  // Initialize workouts array if it doesn't exist
  if (!storage.workouts) {
    storage.workouts = [];
    setStorage(storage);
  }
  
  // Initialize completedWorkouts if it doesn't exist
  if (!storage.completedWorkouts) {
    storage.completedWorkouts = [];
    setStorage(storage);
  }
  
  return {
    workouts: storage.workouts || [],
    completedWorkouts: storage.completedWorkouts || []
  };
};

/**
 * Get all workout templates
 * @returns {Array} Array of workout template objects
 */
export const getWorkouts = () => {
  const storage = getStorage();
  return storage.workouts || [];
};

/**
 * Get a specific workout template by ID
 * @param {string} workoutId - The ID of the workout to retrieve
 * @returns {Object|null} The workout object or null if not found
 */
export const getWorkoutById = (workoutId) => {
  const workouts = getWorkouts();
  return workouts.find(workout => workout.id === workoutId) || null;
};

/**
 * Get all workouts for a specific date
 * @param {string} date - The date in YYYY-MM-DD format
 * @returns {Array} Array of workout objects for that date
 */
export const getWorkoutsForDate = (date) => {
    const storage = getStorage();
    const dayData = storage[date] || {};
    
    // Check for new array-based format
    if (Array.isArray(dayData.workouts)) {
      return dayData.workouts;
    }
    
    // Check for legacy format (single workout object)
    if (dayData.workout) {
      return [dayData.workout];
    }
    
    return [];
  };

  /**
 * Get a specific completed workout by ID
 * @param {string} workoutId - The ID of the completed workout
 * @returns {Object|null} The completed workout or null if not found
 */
export const getCompletedWorkoutById = (workoutId) => {
    const storage = getStorage();
    const completedWorkouts = storage.completedWorkouts || [];
    return completedWorkouts.find(workout => workout.id === workoutId) || null;
  };
  

  /**
  * Create a new workout template
  * @param {Object} workoutData - The workout data
  * @returns {Object} The created workout
  */
 export const createWorkout = (workoutData) => {
   const storage = getStorage();
   
   // Initialize workouts array if it doesn't exist
   if (!storage.workouts) {
     storage.workouts = [];
   }
   
   // Generate a unique ID for the workout
   const id = `workout-${Date.now()}`;
   
   // Create the new workout object with defaults
   const newWorkout = {
     id,
     name: workoutData.name,
     type: workoutData.type || 'strength',
     location: workoutData.location || 'gym',
     equipment: workoutData.equipment || [],
     limitations: workoutData.limitations || '',
     duration: workoutData.duration || 45,
     calories: workoutData.calories || null,
     frequency: workoutData.frequency || ['mon', 'wed', 'fri'],
     timeOfDay: workoutData.timeOfDay || 'anytime',
     exercises: workoutData.exercises || [],
     waterBreaks: workoutData.waterBreaks || [15, 30],
     notes: workoutData.notes || '',
     isTemplate: true,
     createdAt: new Date().toISOString(),
     lastUpdated: new Date().toISOString(),

     // Swimming fields
  swimStroke: workoutData.swimStroke,
  poolLength: workoutData.poolLength,
  swimTargetType: workoutData.swimTargetType,
  swimTargetValue: workoutData.swimTargetValue,
  swimGoal: workoutData.swimGoal,
  
  // Running/walking fields
  runType: workoutData.runType,
  surfaceType: workoutData.surfaceType,
  
  // Cycling fields
  cyclingType: workoutData.cyclingType,
  cyclingTargetType: workoutData.cyclingTargetType,
  cyclingTargetValue: workoutData.cyclingTargetValue,
  cyclingGoal: workoutData.cyclingGoal,
  
  // Yoga/pilates/flexibility fields
  practiceStyle: workoutData.practiceStyle,
  experienceLevel: workoutData.experienceLevel,
  poseTime: workoutData.poseTime,
  
  // Sports fields
  sportType: workoutData.sportType,
  sportGoal: workoutData.sportGoal,
  teamSize: workoutData.teamSize,
  
  // Boxing/martial arts fields
  martialStyle: workoutData.martialStyle,
  trainingType: workoutData.trainingType,
  numRounds: workoutData.numRounds,
  roundLength: workoutData.roundLength,
  
  // Strength/bodyweight/hiit/crossfit fields
  workoutFormat: workoutData.workoutFormat,
  restInterval: workoutData.restInterval,
  
  // Shared fields
  skillLevel: workoutData.skillLevel,
  intensityLevel: workoutData.intensityLevel,
  focusAreas: workoutData.focusAreas || [],
   };
   
   // Add the workout to storage
   storage.workouts.push(newWorkout);
   setStorage(storage);
   
   return newWorkout;
 };

 /**
 * Update an existing workout template
 * @param {string} workoutId - The ID of the workout to update
 * @param {Object} updates - The updates to apply
 * @returns {Object|null} The updated workout or null if not found
 */
export const updateWorkout = (workoutId, updates) => {
  const storage = getStorage();
  
  if (!storage.workouts) {
    return null;
  }
  
  // Find the workout index
  const workoutIndex = storage.workouts.findIndex(w => w.id === workoutId);
  
  if (workoutIndex === -1) {
    return null;
  }
  
  // Create updated workout
  const updatedWorkout = {
    ...storage.workouts[workoutIndex],
    ...updates,
    lastUpdated: new Date().toISOString()
  };
  
  // Update the workout in storage
  storage.workouts[workoutIndex] = updatedWorkout;
  setStorage(storage);
  
  return updatedWorkout;
};


/**
 * Delete a workout template
 * @param {string} workoutId - The ID of the workout to delete
 * @returns {boolean} True if deleted, false if not found
 */
export const deleteWorkout = (workoutId) => {
    const storage = getStorage();
    
    if (!storage.workouts) {
      return false;
    }
    
    // Find the workout index
    const workoutIndex = storage.workouts.findIndex(w => w.id === workoutId);
    
    if (workoutIndex === -1) {
      return false;
    }
    
    // Remove the workout from storage
    storage.workouts.splice(workoutIndex, 1);
    setStorage(storage);
    
    return true;
  };

/**
 * Log a completed workout
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {Object} workoutData - The completed workout data
 * @param {string|null} existingWorkoutId - ID of existing workout to update (or null for new)
 * @returns {Object} The logged workout
 */
export const logWorkout = (date, workoutData, existingWorkoutId = null) => {
  const storage = getStorage();
  const dayData = storage[date] || {};
  
  // Initialize necessary arrays
  if (!storage.completedWorkouts) {
    storage.completedWorkouts = [];
  }
  
  // Prepare the workout entry
  let workoutToLog;
  
  // Process exercises to ensure all properties are preserved
  const processedExercises = workoutData.exercises ? workoutData.exercises.map(exercise => {
    // Create a clean copy of the exercise
    const exerciseCopy = { ...exercise };
    
    // Ensure duration-based exercise properties are preserved exactly as they are
    if (exercise.isDurationBased) {
      exerciseCopy.duration = exercise.duration;
      exerciseCopy.durationUnit = exercise.durationUnit || 'min';
      exerciseCopy.actualDuration = exercise.actualDuration; 
      exerciseCopy.actualDurationUnit = exercise.actualDurationUnit || exercise.durationUnit || 'min';
      exerciseCopy.timeSpent = exercise.timeSpent;
      exerciseCopy.setTimes = exercise.setTimes;
      exerciseCopy.sets = exercise.sets || 1;
      exerciseCopy.actualSets = exercise.actualSets || exercise.sets || 1;
    }
    
    return exerciseCopy;
  }) : [];
  
  if (existingWorkoutId) {
    // Update existing workout
    // First, check in the completedWorkouts array
    const completedIndex = storage.completedWorkouts.findIndex(w => w.id === existingWorkoutId);
    
    // Then check in the day's workouts array
    const dayWorkouts = Array.isArray(dayData.workouts) ? dayData.workouts : [];
    const dayWorkoutIndex = dayWorkouts.findIndex(w => w.id === existingWorkoutId);
    
    workoutToLog = {
      id: existingWorkoutId,
      date,
      workoutId: workoutData.workoutId, // Original template ID if applicable
      name: workoutData.name,
      type: workoutData.type,
      duration: workoutData.duration,
      calories: workoutData.calories,
      exercises: processedExercises,
      notes: workoutData.notes,
      intensity: workoutData.intensity,
      types: workoutData.types,
      updatedAt: new Date().toISOString(),
      completedAt: workoutData.completedAt || new Date().toISOString()
    };
    
    // Update the entry in completedWorkouts if it exists
    if (completedIndex !== -1) {
      storage.completedWorkouts[completedIndex] = workoutToLog;
    } else {
      // Otherwise add it
      storage.completedWorkouts.push(workoutToLog);
    }
    
    // Update the entry in day's workouts if it exists
    if (dayWorkoutIndex !== -1) {
      dayWorkouts[dayWorkoutIndex] = workoutToLog;
    } else {
      // Otherwise add it
      dayWorkouts.push(workoutToLog);
    }
    
    // Update the day's workouts array
    dayData.workouts = dayWorkouts;
    
    // Handle legacy format - remove individual workout property if it exists
    if (dayData.workout && dayData.workout.id === existingWorkoutId) {
      delete dayData.workout;
    }
  } else {
    // Create new completed workout
    workoutToLog = {
      id: `completed-${Date.now()}`,
      date,
      workoutId: workoutData.workoutId, // Original template ID if applicable
      name: workoutData.name || "Workout",
      type: workoutData.type,
      duration: workoutData.duration,
      calories: workoutData.calories,
      exercises: processedExercises,
      notes: workoutData.notes,
      intensity: workoutData.intensity,
      types: workoutData.types,
      completedAt: new Date().toISOString()
    };
    
    // Add to completedWorkouts array
    storage.completedWorkouts.push(workoutToLog);
    
    // Add to the day's workouts array - create if it doesn't exist
    if (!Array.isArray(dayData.workouts)) {
      dayData.workouts = [];
    }
    
    dayData.workouts.push(workoutToLog);
    
    // Handle legacy format - if single workout exists, migrate it to the array
    if (dayData.workout && !dayData.workout.id) {
      const legacyWorkout = {
        ...dayData.workout,
        id: `legacy-${Date.now()}`,
        date,
        completedAt: dayData.workout.timestamp || new Date().toISOString()
      };
      
      // Add legacy workout to both arrays if it's not already the one we're adding
      if (legacyWorkout.id !== workoutToLog.id) {
        dayData.workouts.push(legacyWorkout);
        storage.completedWorkouts.push(legacyWorkout);
      }
      
      // Remove the legacy workout property
      delete dayData.workout;
    }
  }
  
  // Save the updated day data
  storage[date] = dayData;
  setStorage(storage);

  handleDataChange(date, 'workout', { workoutData });
  
  return workoutToLog;
};
  
  /**
 * Delete a specific completed workout
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {string} workoutId - The ID of the workout to delete
 * @returns {boolean} True if deleted, false if not found
 */
export const deleteCompletedWorkout = (date, workoutId) => {
    const storage = getStorage();
    const dayData = storage[date] || {};
    
    // Check if workout exists in the day data
    if (!dayData.workouts && !dayData.workout) {
      return false;
    }
    
    let deleted = false;
    
    // Handle new array format
    if (Array.isArray(dayData.workouts)) {
      const workoutIndex = dayData.workouts.findIndex(w => w.id === workoutId);
      
      if (workoutIndex !== -1) {
        dayData.workouts.splice(workoutIndex, 1);
        deleted = true;
      }
    }
    
    // Handle legacy single workout format
    if (dayData.workout && dayData.workout.id === workoutId) {
      delete dayData.workout;
      deleted = true;
    }
    
    // Also remove from completedWorkouts array
    if (storage.completedWorkouts) {
      const completedIndex = storage.completedWorkouts.findIndex(w => w.id === workoutId);
      
      if (completedIndex !== -1) {
        storage.completedWorkouts.splice(completedIndex, 1);
        deleted = true;
      }
    }
    
    // Update storage if changes were made
    if (deleted) {
      storage[date] = dayData;
      setStorage(storage);
    }
    
    return deleted;
  };

/**
 * Get completed workouts for a specific date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Array} Array of completed workout objects
 */
export const getCompletedWorkouts = (startDate, endDate) => {
  const storage = getStorage();
  const completedWorkouts = storage.completedWorkouts || [];
  
  if (!startDate && !endDate) {
    return completedWorkouts;
  }
  
  return completedWorkouts.filter(workout => {
    const workoutDate = workout.date;
    
    if (startDate && endDate) {
      return workoutDate >= startDate && workoutDate <= endDate;
    } else if (startDate) {
      return workoutDate >= startDate;
    } else if (endDate) {
      return workoutDate <= endDate;
    }
    
    return true;
  });
};

/**
 * Get workout statistics
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Object} Statistics object
 */
export const getWorkoutStats = (startDate, endDate) => {
  const completedWorkouts = getCompletedWorkouts(startDate, endDate);
  
  if (completedWorkouts.length === 0) {
    return {
      totalWorkouts: 0,
      totalDuration: 0,
      totalCalories: 0,
      averageDuration: 0,
      workoutsByType: {},
      streak: 0,
      longestStreak: 0
    };
  }
  
  // Calculate basic stats
  const totalWorkouts = completedWorkouts.length;
  const totalDuration = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalCalories = completedWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const averageDuration = Math.round(totalDuration / totalWorkouts);
  
  // Count workouts by type
  const workoutsByType = completedWorkouts.reduce((types, workout) => {
    const type = workout.type || 'other';
    types[type] = (types[type] || 0) + 1;
    return types;
  }, {});
  
  // Calculate current and longest streaks
  let currentStreak = 0;
  let longestStreak = 0;
  
  // First sort by date
  const sortedWorkouts = [...completedWorkouts].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  if (sortedWorkouts.length > 0) {
    // Check if the most recent workout was today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const mostRecentDate = new Date(sortedWorkouts[0].date);
    
    if (mostRecentDate.getTime() === today.getTime() || 
        mostRecentDate.getTime() === yesterday.getTime()) {
      currentStreak = 1;
      
      // Group workouts by date
      const workoutsByDate = {};
      sortedWorkouts.forEach(workout => {
        workoutsByDate[workout.date] = true;
      });
      
      // Check consecutive days
      let checkDate = new Date(mostRecentDate);
      checkDate.setDate(checkDate.getDate() - 1);
      
      while (workoutsByDate[formatDateForStorage(checkDate)]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
      
      longestStreak = Math.max(longestStreak, currentStreak);
    }
  }
  
  return {
    totalWorkouts,
    totalDuration,
    totalCalories,
    averageDuration,
    workoutsByType,
    streak: currentStreak,
    longestStreak
  };
};

/**
 * Get common workout types for dropdown options
 * @returns {Array} Array of workout type objects
 */
export const getWorkoutTypes = () => {
  return [
    { value: 'strength', label: 'Strength Training' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'hiit', label: 'HIIT' },
    { value: 'flexibility', label: 'Flexibility & Stretching' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'pilates', label: 'Pilates' },
    { value: 'sports', label: 'Sports' },
    { value: 'crossfit', label: 'CrossFit' },
    { value: 'bodyweight', label: 'Bodyweight' },
    { value: 'swimming', label: 'Swimming' },
    { value: 'cycling', label: 'Cycling' },
    { value: 'running', label: 'Running' },
    { value: 'walking', label: 'Walking' },
    { value: 'dance', label: 'Dance' },
    { value: 'boxing', label: 'Boxing' },
    { value: 'martial_arts', label: 'Martial Arts' },
    { value: 'other', label: 'Other' }
  ];
};

/**
 * Get common workout locations for dropdown options
 * @returns {Array} Array of location objects
 */
export const getWorkoutLocations = () => {
  return [
    { value: 'gym', label: 'Gym' },
    { value: 'home', label: 'Home' },
    { value: 'outdoors', label: 'Outdoors' },
    { value: 'studio', label: 'Studio' },
    { value: 'pool', label: 'Pool' },
    { value: 'court', label: 'Court/Field' },
    { value: 'other', label: 'Other' }
  ];
};

/**
 * Get common equipment options
 * @returns {Array} Array of equipment objects
 */
export const getEquipmentOptions = () => {
  return [
    { value: 'none', label: 'None / Bodyweight' },
    { value: 'dumbbells', label: 'Dumbbells' },
    { value: 'barbell', label: 'Barbell' },
    { value: 'kettlebells', label: 'Kettlebells' },
    { value: 'resistance_bands', label: 'Resistance Bands' },
    { value: 'pull_up_bar', label: 'Pull-up Bar' },
    { value: 'bench', label: 'Bench' },
    { value: 'medicine_ball', label: 'Medicine Ball' },
    { value: 'stability_ball', label: 'Stability Ball' },
    { value: 'foam_roller', label: 'Foam Roller' },
    { value: 'yoga_mat', label: 'Yoga Mat' },
    { value: 'cardio_machines', label: 'Cardio Machines' },
    { value: 'weight_machines', label: 'Weight Machines' },
    { value: 'cable_machine', label: 'Cable Machine' },
    { value: 'squat_rack', label: 'Squat Rack' },
    { value: 'trx', label: 'TRX / Suspension Trainer' },
    { value: 'plates', label: 'Weight Plates' },
    { value: 'battle_ropes', label: 'Battle Ropes' },
    { value: 'box', label: 'Plyo Box' },
    { value: 'ab_roller', label: 'Ab Roller' },
    { value: 'other', label: 'Other' }
  ];
};

/**
 * Calculate workout statistics based on completed workouts
 * @param {Array} workouts - Array of completed workouts
 * @returns {Object} Statistics object
 */
export const calculateWorkoutStats = (workouts) => {
  if (!workouts || workouts.length === 0) {
    return {
      totalWorkouts: 0,
      totalMinutes: 0,
      totalCalories: 0,
      avgDuration: 0,
      avgIntensity: 0,
      consistency: 0,
      completionRate: 0,
      longestStreak: 0,
      currentStreak: 0
    };
  }
  
  // Calculate basic stats
  const totalWorkouts = workouts.length;
  const totalMinutes = workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0);
  const totalCalories = workouts.reduce((sum, workout) => sum + (workout.calories || 0), 0);
  const avgDuration = Math.round(totalMinutes / totalWorkouts);
  
  // Calculate average intensity (if available)
  const workoutsWithIntensity = workouts.filter(w => w.intensity);
  const avgIntensity = workoutsWithIntensity.length > 0 
    ? workoutsWithIntensity.reduce((sum, w) => sum + w.intensity, 0) / workoutsWithIntensity.length
    : null;
  
  // Calculate consistency (workouts completed / days in period)
  const dates = new Set();
  workouts.forEach(workout => {
    const date = new Date(workout.date || workout.completedAt || workout.timestamp);
    dates.add(formatDateForStorage(date));
  });
  
  // Find earliest and latest workout dates
  const workoutDates = Array.from(dates).map(d => new Date(d));
  const earliestDate = new Date(Math.min(...workoutDates));
  const latestDate = new Date(Math.max(...workoutDates));
  
  // Calculate total days in period
  const daysDiff = Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24)) + 1;
  const consistency = Math.round((dates.size / daysDiff) * 100);
  
  // Calculate completion rate (completed exercises / total exercises)
  let totalExercises = 0;
  let completedExercises = 0;
  
  workouts.forEach(workout => {
    if (workout.exercises && workout.exercises.length > 0) {
      totalExercises += workout.exercises.length;
      completedExercises += workout.exercises.filter(ex => ex.completed !== false).length;
    }
  });
  
  const completionRate = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 100;
  
  // Calculate streaks
  const sortedDates = Array.from(dates).sort();
  
  // Current streak
  let currentStreak = 0;
  const today = formatDateForStorage(new Date());
  
  // Check if worked out today
  const hasWorkoutToday = sortedDates.includes(today);
  
  if (hasWorkoutToday) {
    currentStreak = 1;
    let checkDate = new Date(today);
    
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const dateStr = formatDateForStorage(checkDate);
      if (sortedDates.includes(dateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else if (sortedDates.length > 0) {
    // Check if worked out yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateForStorage(yesterday);
    
    if (sortedDates.includes(yesterdayStr)) {
      currentStreak = 1;
      let checkDate = new Date(yesterdayStr);
      
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const dateStr = formatDateForStorage(checkDate);
        if (sortedDates.includes(dateStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }
  
  // Longest streak
  let longestStreak = 0;
  let currentLongest = 0;
  
  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    
    if (i === 0) {
      currentLongest = 1;
    } else {
      const prevDate = new Date(sortedDates[i - 1]);
      const dayDiff = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        currentLongest++;
      } else {
        currentLongest = 1;
      }
    }
    
    if (currentLongest > longestStreak) {
      longestStreak = currentLongest;
    }
  }
  
  return {
    totalWorkouts,
    totalMinutes,
    totalCalories,
    avgDuration,
    avgIntensity,
    consistency,
    completionRate,
    longestStreak,
    currentStreak
  };
};

/**
 * Get all completed workouts from storage
 * @returns {Array} Array of completed workouts
 */
export const getAllCompletedWorkouts = () => {
  const storage = getStorage();
  const workouts = [];
  
  // Iterate through all dates in storage
  Object.entries(storage).forEach(([date, dayData]) => {
    if (dayData.workout) {
      // Add legacy workout format (single workout per day)
      workouts.push({
        ...dayData.workout,
        date: date,
        id: `workout-${date}`
      });
    }
    
    // Add new format workouts (multiple per day)
    if (dayData.workouts && Array.isArray(dayData.workouts)) {
      dayData.workouts.forEach(workout => {
        workouts.push({
          ...workout,
          date: date
        });
      });
    }
  });
  
  return workouts.sort((a, b) => {
    const dateA = new Date(a.date || a.completedAt || a.timestamp);
    const dateB = new Date(b.date || b.completedAt || b.timestamp);
    return dateB - dateA; // Sort from newest to oldest
  });
};

/**
 * Get workout types with colors for charts
 * @returns {Array} Array of workout types
 */
export const getWorkoutTypesWithColors = () => {
  return [
    { value: 'WEIGHTLIFTING', label: 'Weightlifting', color: '#3B82F6' },
    { value: 'CARDIO', label: 'Cardio', color: '#EF4444' },
    { value: 'YOGA', label: 'Yoga', color: '#8B5CF6' },
    { value: 'SWIMMING', label: 'Swimming', color: '#06B6D4' },
    { value: 'CYCLING', label: 'Cycling', color: '#10B981' },
    { value: 'HIIT', label: 'HIIT', color: '#F59E0B' },
    { value: 'PILATES', label: 'Pilates', color: '#EC4899' },
    { value: 'BOXING', label: 'Boxing', color: '#DC2626' },
    { value: 'CALISTHENICS', label: 'Calisthenics', color: '#F97316' },
    { value: 'STRETCHING', label: 'Stretching', color: '#14B8A6' },
    { value: 'WALKING', label: 'Walking', color: '#84cc16' },
    { value: 'OTHER', label: 'Other', color: '#6B7280' },
    { value: 'strength', label: 'Strength', color: '#3B82F6' },
    { value: 'cardio', label: 'Cardio', color: '#EF4444' },
    { value: 'running', label: 'Running', color: '#F59E0B' },
    { value: 'cycling', label: 'Cycling', color: '#10B981' },
    { value: 'yoga', label: 'Yoga', color: '#8B5CF6' },
    { value: 'pilates', label: 'Pilates', color: '#EC4899' },
    { value: 'swimming', label: 'Swimming', color: '#06B6D4' },
    { value: 'hiit', label: 'HIIT', color: '#F97316' },
    { value: 'sports', label: 'Sports', color: '#84cc16' },
    { value: 'flexibility', label: 'Flexibility', color: '#14B8A6' },
    { value: 'walking', label: 'Walking', color: '#0EA5E9' },
    { value: 'boxing', label: 'Boxing', color: '#DC2626' },
    { value: 'bodyweight', label: 'Bodyweight', color: '#6366F1' },
    { value: 'crossfit', label: 'CrossFit', color: '#7C3AED' },
    { value: 'martial_arts', label: 'Martial Arts', color: '#D946EF' }
  ];
};

// Add these functions to src/utils/workoutUtils.js

/**
 * Get exercise progress history for a specific exercise name
 * @param {string} exerciseName - The name of the exercise to track
 * @param {number} limit - Maximum number of records to return
 * @returns {Array} Array of exercise instances sorted by date
 */
export const getExerciseProgressHistory = (exerciseName, limit = 10) => {
  const allWorkouts = getAllCompletedWorkouts();
  
  // Extract all instances of this exercise from completed workouts
  const exerciseInstances = [];
  
  allWorkouts.forEach(workout => {
    if (!workout.exercises) return;
    
    const matchingExercises = workout.exercises.filter(ex => 
      ex.name.toLowerCase() === exerciseName.toLowerCase()
    );
    
    if (matchingExercises.length > 0) {
      matchingExercises.forEach(exercise => {
        exerciseInstances.push({
          ...exercise,
          workoutDate: workout.completedAt || workout.timestamp || workout.date,
          workoutName: workout.name,
          workoutId: workout.id,
          workoutOriginalId: workout.workoutId
        });
      });
    }
  });
  
  // Sort by date (newest first)
  exerciseInstances.sort((a, b) => {
    return new Date(b.workoutDate) - new Date(a.workoutDate);
  });
  
  // Limit the results
  return exerciseInstances.slice(0, limit);
};

/**
 * Calculate progress metrics for a specific workout template
 * @param {string} workoutId - The template workout ID
 * @returns {Object} Progress metrics
 */
export const calculateWorkoutProgress = (workoutId) => {
  const completedInstances = getAllCompletedWorkouts()
    .filter(workout => workout.workoutId === workoutId)
    .sort((a, b) => {
      return new Date(a.completedAt || a.timestamp || a.date) - 
             new Date(b.completedAt || b.timestamp || b.date);
    });
  
  if (completedInstances.length < 2) {
    return {
      hasEnoughData: false,
      totalCompletions: completedInstances.length
    };
  }
  
  // Get the first and most recent completion
  const firstCompletion = completedInstances[0];
  const latestCompletion = completedInstances[completedInstances.length - 1];
  
  // Duration trend
  const durationChange = (latestCompletion.duration || 0) - (firstCompletion.duration || 0);
  const durationPercentChange = firstCompletion.duration ? 
    Math.round((durationChange / firstCompletion.duration) * 100) : 0;
  
  // Intensity trend
  const getIntensityValue = (intensity) => {
    if (!intensity) return 3;
    if (typeof intensity === 'number') return intensity;
    
    switch(intensity.toLowerCase()) {
      case 'light': case 'easy': return 1;
      case 'moderate': return 2;
      case 'medium': return 3;
      case 'challenging': return 4;
      case 'intense': case 'high': case 'maximum': return 5;
      default: return 3;
    }
  };
  
  const firstIntensity = getIntensityValue(firstCompletion.intensity);
  const latestIntensity = getIntensityValue(latestCompletion.intensity);
  const intensityChange = latestIntensity - firstIntensity;
  
  // Exercise completion trends
  const getCompletionRate = (workout) => {
    if (!workout.exercises || workout.exercises.length === 0) return 100;
    const completed = workout.exercises.filter(ex => ex.completed !== false).length;
    return Math.round((completed / workout.exercises.length) * 100);
  };
  
  const firstCompletionRate = getCompletionRate(firstCompletion);
  const latestCompletionRate = getCompletionRate(latestCompletion);
  const completionRateChange = latestCompletionRate - firstCompletionRate;
  
  // Calculate average frequency
  const averageFrequencyDays = calculateAverageFrequency(completedInstances);
  
  return {
    hasEnoughData: true,
    totalCompletions: completedInstances.length,
    firstDate: new Date(firstCompletion.completedAt || firstCompletion.timestamp || firstCompletion.date),
    latestDate: new Date(latestCompletion.completedAt || latestCompletion.timestamp || latestCompletion.date),
    duration: {
      first: firstCompletion.duration || 0,
      latest: latestCompletion.duration || 0,
      change: durationChange,
      percentChange: durationPercentChange
    },
    intensity: {
      first: firstIntensity,
      latest: latestIntensity,
      change: intensityChange
    },
    completionRate: {
      first: firstCompletionRate,
      latest: latestCompletionRate,
      change: completionRateChange
    },
    averageFrequencyDays
  };
};

/**
 * Calculate the average frequency between workout completions
 * @param {Array} workouts - Array of completed workouts
 * @returns {number} Average days between workouts
 */
export const calculateAverageFrequency = (workouts) => {
  if (!workouts || workouts.length < 2) return null;
  
  // Extract and sort dates
  const dates = workouts.map(workout => 
    new Date(workout.completedAt || workout.timestamp || workout.date)
  ).sort((a, b) => a - b);
  
  // Calculate total days between first and last workout
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const totalDays = Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24));
  
  // Calculate average days between sessions
  return Math.round(totalDays / (dates.length - 1));
};

/**
 * Get personal records for all exercises
 * @returns {Object} Map of exercise names to personal records
 */
export const getPersonalRecords = () => {
  const allWorkouts = getAllCompletedWorkouts();
  const records = {};
  
  allWorkouts.forEach(workout => {
    if (!workout.exercises) return;
    
    workout.exercises.forEach(exercise => {
      if (!exercise || !exercise.name) return;
      
      const name = exercise.name;
      
      if (!records[name]) {
        records[name] = {
          // For strength exercises
          maxWeight: 0,
          maxReps: 0,
          maxVolume: 0, // sets * reps * weight
          // For duration exercises
          maxDuration: 0,
          maxDistance: 0,
          bestPace: null,
          // Metadata
          isDurationBased: exercise.isDurationBased || false,
          date: workout.completedAt || workout.timestamp || workout.date,
          workoutId: workout.id
        };
      }
      
      const date = new Date(workout.completedAt || workout.timestamp || workout.date);
      
      // Update strength records
      if (!exercise.isDurationBased) {
        const weight = parseFloat(exercise.actualWeight || exercise.weight || 0);
        const reps = parseInt(exercise.actualReps || exercise.reps || 0);
        const sets = parseInt(exercise.actualSets || exercise.sets || 0);
        const volume = sets * reps * weight;
        
        // Update max weight
        if (weight > records[name].maxWeight) {
          records[name].maxWeight = weight;
          records[name].maxWeightDate = date;
        }
        
        // Update max reps
        if (reps > records[name].maxReps) {
          records[name].maxReps = reps;
          records[name].maxRepsDate = date;
        }
        
        // Update max volume
        if (volume > records[name].maxVolume && weight > 0) {
          records[name].maxVolume = volume;
          records[name].maxVolumeDate = date;
        }
      } 
      // Update duration-based records
      else {
        const duration = parseInt(exercise.actualDuration || exercise.duration || 0);
        const durationInSeconds = (exercise.actualDurationUnit || exercise.durationUnit || 'min') === 'min' ? 
          duration * 60 : duration;
        
        // Try to parse distance if available
        let distance = 0;
        if (exercise.actualDistance || exercise.distance) {
          const distanceStr = exercise.actualDistance || exercise.distance;
          const match = distanceStr.match(/\d+(\.\d+)?/);
          if (match) {
            distance = parseFloat(match[0]);
          }
        }
        
        // Calculate pace (time per distance unit)
        const pace = distance > 0 && durationInSeconds > 0 ? 
          durationInSeconds / distance : null;
        
        // Update max duration
        if (durationInSeconds > records[name].maxDuration) {
          records[name].maxDuration = durationInSeconds;
          records[name].maxDurationDate = date;
        }
        
        // Update max distance
        if (distance > records[name].maxDistance) {
          records[name].maxDistance = distance;
          records[name].maxDistanceDate = date;
        }
        
        // Update best pace (lower is better)
        if (pace && (records[name].bestPace === null || pace < records[name].bestPace)) {
          records[name].bestPace = pace;
          records[name].bestPaceDate = date;
        }
      }
    });
  });
  
  return records;
};

/**
 * Get previous performance data for a specific exercise with improved reliability
 * @param {string} exerciseName - Name of the exercise
 * @param {string} currentWorkoutId - ID of the current workout (to exclude from history)
 * @returns {Object|null} Previous exercise performance or null if not found
 */
export const getPreviousExercisePerformance = (exerciseName, currentWorkoutId = null) => {
  const DEBUG = true;
  if (DEBUG) console.log(`Looking for previous performance of "${exerciseName}" (excluding ${currentWorkoutId})`);
  
  try {
    const allWorkouts = getAllCompletedWorkouts();
    if (DEBUG) console.log(`Total completed workouts found: ${allWorkouts.length}`);
    
    // Filter to only include workouts with this exercise, excluding current workout
    const relevantWorkouts = allWorkouts
      .filter(workout => {
        // Make sure workout has exercises array
        if (!workout.exercises || !Array.isArray(workout.exercises)) return false;
        
        // Exclude current workout
        if (currentWorkoutId && workout.id === currentWorkoutId) return false;
        
        // Check if workout contains the exercise
        const hasExercise = workout.exercises.some(ex => 
          ex && ex.name && ex.name.toLowerCase() === exerciseName.toLowerCase()
        );
        
        return hasExercise;
      })
      .sort((a, b) => {
        // Sort from newest to oldest
        const dateA = new Date(a.completedAt || a.timestamp || a.date);
        const dateB = new Date(b.completedAt || b.timestamp || b.date);
        return dateB - dateA;
      });
    
    if (DEBUG) console.log(`Relevant workouts with "${exerciseName}": ${relevantWorkouts.length}`);
    
    // If no previous workout found, return null
    if (relevantWorkouts.length === 0) {
      if (DEBUG) console.log(`No previous instances of "${exerciseName}" found.`);
      return null;
    }
    
    // Find the exercise in the most recent workout
    const mostRecentWorkout = relevantWorkouts[0];
    if (DEBUG) console.log(`Most recent workout found:`, {
      id: mostRecentWorkout.id,
      date: mostRecentWorkout.completedAt || mostRecentWorkout.timestamp || mostRecentWorkout.date
    });
    
    // Find the specific exercise in the workout using case-insensitive comparison
    const previousExercise = mostRecentWorkout.exercises.find(ex => 
      ex && ex.name && ex.name.toLowerCase() === exerciseName.toLowerCase()
    );
    
    if (!previousExercise) {
      if (DEBUG) console.log(`Exercise "${exerciseName}" not found in the most recent workout.`);
      return null;
    }
    
    if (DEBUG) {
      console.log(`Previous exercise performance found:`, {
        sets: previousExercise.actualSets || previousExercise.sets,
        reps: previousExercise.actualReps || previousExercise.reps,
        weight: previousExercise.actualWeight || previousExercise.weight
      });
    }
    
    // Return the exercise with additional metadata
    return {
      ...previousExercise,
      date: mostRecentWorkout.completedAt || mostRecentWorkout.timestamp || mostRecentWorkout.date,
      workoutId: mostRecentWorkout.id
    };
  } catch (error) {
    console.error('Error getting previous exercise performance:', error);
    return null;
  }
};

// Add this to workoutUtils.js or create a new file

/**
 * Debugging helper to check exercise comparison
 * @param {Object} current - Current exercise data
 * @param {Object} previous - Previous exercise data
 * @param {string} exerciseName - Name of the exercise for reference
 */
export const debugExerciseComparison = (current, previous, exerciseName) => {
  console.log(`=== DEBUGGING EXERCISE: ${exerciseName} ===`);
  
  // Extract values with clear logging
  const extractAndLog = (exercise, prefix) => {
    const weight = exercise.actualWeight || exercise.weight || 0;
    const reps = exercise.actualReps || exercise.reps || 0;
    const sets = exercise.actualSets || exercise.sets || 0;
    
    console.log(`${prefix} VALUES:`);
    console.log(`- Weight: ${weight} (raw: ${JSON.stringify(exercise.actualWeight || exercise.weight)})`);
    console.log(`- Reps: ${reps} (raw: ${JSON.stringify(exercise.actualReps || exercise.reps)})`);
    console.log(`- Sets: ${sets} (raw: ${JSON.stringify(exercise.actualSets || exercise.sets)})`);
    
    return { weight, reps, sets };
  };
  
  const currentVals = extractAndLog(current, 'CURRENT');
  const previousVals = extractAndLog(previous, 'PREVIOUS');
  
  // Calculate and log differences
  console.log('DIFFERENCES:');
  console.log(`- Weight: ${currentVals.weight - previousVals.weight}`);
  console.log(`- Reps: ${currentVals.reps - previousVals.reps}`);
  console.log(`- Sets: ${currentVals.sets - previousVals.sets}`);
  
  // Calculate and log volume
  const currentVolume = currentVals.weight * currentVals.reps * currentVals.sets;
  const previousVolume = previousVals.weight * previousVals.reps * previousVals.sets;
  console.log(`- Volume: Current=${currentVolume}, Previous=${previousVolume}, Diff=${currentVolume - previousVolume}`);
  
  console.log('=== END DEBUG ===');
};

/**
 * Update an exercise in a workout template to use actual values as the new baseline
 * @param {string} workoutId - The ID of the workout template
 * @param {string} exerciseName - The name of the exercise to update
 * @param {Object} actualValues - The actual values to set as baseline
 * @returns {Object|null} The updated workout or null if not found
 */
export const updateExerciseBaseline = (workoutId, exerciseName, actualValues) => {
  // Get the workout template
  const workout = getWorkoutById(workoutId);
  if (!workout) return null;
  
  // Find the exercise in the template
  const exerciseIndex = workout.exercises.findIndex(e => e.name === exerciseName);
  if (exerciseIndex === -1) return null;
  
  // Create updated exercise object
  let updatedExercise;
  
  if (workout.exercises[exerciseIndex].isDurationBased) {
    // For duration-based exercises
    updatedExercise = {
      ...workout.exercises[exerciseIndex],
      sets: actualValues.actualSets || workout.exercises[exerciseIndex].sets,
      duration: actualValues.actualDuration || workout.exercises[exerciseIndex].duration,
      durationUnit: actualValues.actualDurationUnit || workout.exercises[exerciseIndex].durationUnit,
      distance: actualValues.actualDistance || workout.exercises[exerciseIndex].distance
    };
  } else {
    // For traditional strength exercises
    updatedExercise = {
      ...workout.exercises[exerciseIndex],
      sets: actualValues.actualSets || workout.exercises[exerciseIndex].sets,
      reps: actualValues.actualReps || workout.exercises[exerciseIndex].reps,
      weight: actualValues.actualWeight || workout.exercises[exerciseIndex].weight
    };
  }
  
  // Update the workout template
  const updatedExercises = [...workout.exercises];
  updatedExercises[exerciseIndex] = updatedExercise;
  
  return updateWorkout(workoutId, {
    exercises: updatedExercises
  });
};

/**
 * Get detailed exercise progression history for a specific exercise
 * @param {string} exerciseName - Name of the exercise to track
 * @param {number} limit - Maximum number of records to return
 * @returns {Array} Array of exercise instances sorted by date (newest first)
 */
export const getExerciseProgressionHistory = (exerciseName, limit = 10) => {
  const allWorkouts = getAllCompletedWorkouts();
  
  // Extract all instances of this exercise from completed workouts
  const exerciseInstances = [];
  
  allWorkouts.forEach(workout => {
    if (!workout.exercises) return;
    
    const matchingExercises = workout.exercises.filter(ex => 
      ex && ex.name && ex.name.toLowerCase() === exerciseName.toLowerCase()
    );
    
    if (matchingExercises.length > 0) {
      matchingExercises.forEach(exercise => {
        // Create a normalized exercise object
        const normalizedExercise = {
          name: exercise.name,
          isDurationBased: exercise.isDurationBased || false,
          // For strength exercises
          sets: exercise.actualSets || exercise.sets,
          reps: exercise.actualReps || exercise.reps,
          weight: exercise.actualWeight || exercise.weight,
          // For duration exercises
          duration: exercise.actualDuration || exercise.duration,
          durationUnit: exercise.actualDurationUnit || exercise.durationUnit || 'min',
          distance: exercise.actualDistance || exercise.distance,
          intensity: exercise.actualIntensity || exercise.intensity,
          // Metadata
          date: workout.completedAt || workout.timestamp || workout.date,
          workoutId: workout.id,
          workoutName: workout.name
        };
        
        exerciseInstances.push(normalizedExercise);
      });
    }
  });
  
  // Sort by date (newest first)
  exerciseInstances.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Limit the results
  return exerciseInstances.slice(0, limit);
};