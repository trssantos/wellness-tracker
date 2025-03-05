// src/utils/workoutUtils.js
import { getStorage, setStorage } from './storage';

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
      
      while (workoutsByDate[checkDate.toISOString().split('T')[0]]) {
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