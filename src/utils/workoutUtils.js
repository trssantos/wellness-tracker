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
     lastUpdated: new Date().toISOString()
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
        exercises: workoutData.exercises,
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
        exercises: workoutData.exercises,
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