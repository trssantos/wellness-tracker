import { getStorage, setStorage } from './storage';
import { formatDateForStorage } from './dateUtils'; // Add this missing import

/**
 * Get all nutrition entries for a specific date
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {Array} Array of food entries
 */
export const getFoodEntries = (dateStr) => {
  const storage = getStorage();
  
  if (!storage.nutrition || !storage.nutrition[dateStr]) {
    return [];
  }
  
  return storage.nutrition[dateStr].entries || [];
};

/**
 * Add a new food entry
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {Object} entry - Food entry data
 * @returns {Object} Updated storage data
 */
export const addFoodEntry = (dateStr, entry) => {
  const storage = getStorage();
  
  // Initialize nutrition storage if not exists
  if (!storage.nutrition) {
    storage.nutrition = {};
  }
  
  // Initialize date entry if not exists
  if (!storage.nutrition[dateStr]) {
    storage.nutrition[dateStr] = { entries: [] };
  }
  
  // Create a new entry with ID
  const newEntry = {
    id: Date.now().toString(),
    ...entry,
    timestamp: new Date().toISOString()
  };
  
  // Add to storage
  storage.nutrition[dateStr].entries = [
    ...storage.nutrition[dateStr].entries,
    newEntry
  ];
  
  setStorage(storage);
  return newEntry;
};

/**
 * Update an existing food entry
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {Object} updatedEntry - Updated entry data
 * @returns {boolean} Success status
 */
export const updateFoodEntry = (dateStr, updatedEntry) => {
  const storage = getStorage();
  
  if (!storage.nutrition || !storage.nutrition[dateStr]) {
    return false;
  }
  
  const entries = storage.nutrition[dateStr].entries || [];
  const index = entries.findIndex(entry => entry.id === updatedEntry.id);
  
  if (index === -1) {
    return false;
  }
  
  // Update the entry
  entries[index] = {
    ...entries[index],
    ...updatedEntry,
    updatedAt: new Date().toISOString()
  };
  
  storage.nutrition[dateStr].entries = entries;
  setStorage(storage);
  
  return true;
};

/**
 * Delete a food entry
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {string} entryId - ID of the entry to delete
 * @returns {boolean} Success status
 */
export const deleteFoodEntry = (dateStr, entryId) => {
  const storage = getStorage();
  
  if (!storage.nutrition || !storage.nutrition[dateStr]) {
    return false;
  }
  
  const entries = storage.nutrition[dateStr].entries || [];
  const filteredEntries = entries.filter(entry => entry.id !== entryId);
  
  if (filteredEntries.length === entries.length) {
    return false; // No entry was deleted
  }
  
  storage.nutrition[dateStr].entries = filteredEntries;
  setStorage(storage);
  
  return true;
};

/**
 * Get food entries grouped by type
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {Object} Entries grouped by meal type
 */
export const getGroupedFoodEntries = (dateStr) => {
  const entries = getFoodEntries(dateStr);
  
  return entries.reduce((acc, entry) => {
    const mealType = entry.mealType || 'other';
    if (!acc[mealType]) {
      acc[mealType] = [];
    }
    acc[mealType].push(entry);
    return acc;
  }, {});
};

/**
 * Analyze food entries to find correlations with mood and energy
 * @param {number} days - Number of days to analyze
 * @returns {Object} Correlation data
 */
export const analyzeFoodMoodCorrelations = (days = 30) => {
  const storage = getStorage();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  // Fixed the typos and variable names
  const startDateStr = formatDateForStorage(startDate);
  const endDateStr = formatDateForStorage(endDate);
  
  const foodFrequency = {};
  const foodMoodImpact = {};
  const foodEnergyImpact = {};
  
  // Iterate through all dates in range
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = formatDateForStorage(d);
    
    // Skip if no data for this date
    if (!storage[dateStr]) continue;
    
    // Get mood and energy data
    const dayMood = storage[dateStr].morningMood || storage[dateStr].mood;
    const dayEnergy = storage[dateStr].morningEnergy || storage[dateStr].energyLevel;
    
    // Skip if no nutrition data
    if (!storage.nutrition || !storage.nutrition[dateStr]) continue;
    
    // Process food entries
    const entries = storage.nutrition[dateStr].entries || [];
    
    entries.forEach(entry => {
      const foodName = entry.name;
      
      // Track food frequency
      if (!foodFrequency[foodName]) {
        foodFrequency[foodName] = 0;
      }
      foodFrequency[foodName]++;
      
      // Initialize impact tracking
      if (!foodMoodImpact[foodName]) {
        foodMoodImpact[foodName] = { 
          total: 0, 
          count: 0, 
          emoji: entry.emoji || '🍽️',
          category: entry.category || 'Other'
        };
      }
      
      if (!foodEnergyImpact[foodName]) {
        foodEnergyImpact[foodName] = { 
          total: 0, 
          count: 0, 
          emoji: entry.emoji || '🍽️',
          category: entry.category || 'Other'
        };
      }
      
      // Calculate impact based on mood conversion
      if (dayMood) {
        const moodValue = convertMoodToValue(dayMood);
        foodMoodImpact[foodName].total += moodValue;
        foodMoodImpact[foodName].count++;
      }
      
      if (dayEnergy) {
        foodEnergyImpact[foodName].total += dayEnergy;
        foodEnergyImpact[foodName].count++;
      }
    });
  }
  
  // Calculate correlations
  const correlations = [];
  
  Object.keys(foodFrequency).forEach(food => {
    if (foodFrequency[food] >= 2) { // Only consider foods eaten multiple times
      const moodImpact = foodMoodImpact[food].count > 0 
        ? Math.round((foodMoodImpact[food].total / foodMoodImpact[food].count) * 10) 
        : 0;
        
      const energyImpact = foodEnergyImpact[food].count > 0
        ? Math.round((foodEnergyImpact[food].total / foodEnergyImpact[food].count) * 10)
        : 0;
        
      correlations.push({
        food,
        frequency: foodFrequency[food],
        moodImpact,
        energyImpact,
        emoji: foodMoodImpact[food].emoji,
        category: foodMoodImpact[food].category
      });
    }
  });
  
  return {
    correlations: correlations.sort((a, b) => b.frequency - a.frequency),
    totalFoods: Object.keys(foodFrequency).length,
    analysisRange: {
      start: startDateStr,
      end: endDateStr,
      days
    }
  };
};

/**
 * Helper function to convert mood string to numeric value
 * @param {string|number} mood - Mood value
 * @returns {number} Numeric mood value
 */
const convertMoodToValue = (mood) => {
  if (typeof mood === 'number') return mood;
  
  // Convert mood strings to numbers if needed
  const moodMap = {
    'terrible': 1,
    'bad': 2,
    'okay': 3,
    'good': 4,
    'excellent': 5
  };
  
  return moodMap[mood] || 3; // Default to 3 if unknown
};

/**
 * Get daily nutritional summaries for a date range
 * @param {number} days - Number of days to include
 * @returns {Array} Array of daily nutrition summaries
 */
export const getDailyNutritionSummaries = (days = 7) => {
  const storage = getStorage();
  const summaries = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = formatDateForStorage(date);
    
    const entries = getFoodEntries(dateStr);
    const waterIntake = storage.nutrition?.[dateStr]?.waterIntake || 0;
    
    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    entries.forEach(entry => {
      totalCalories += entry.calories || 0;
      totalProtein += entry.protein || 0;
      totalCarbs += entry.carbs || 0;
      totalFat += entry.fat || 0;
    });
    
    summaries.push({
      date: dateStr,
      displayDate: date.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
      entries: entries.length,
      waterIntake,
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat
    });
  }
  
  return summaries.reverse(); // Most recent first
};

/**
 * Get water intake for a specific date
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {number} Water intake amount
 */
export const getWaterIntake = (dateStr) => {
  const storage = getStorage();
  return storage.nutrition?.[dateStr]?.waterIntake || 0;
};

/**
 * Update water intake for a specific date
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {number} amount - Water intake amount
 * @returns {boolean} Success status
 */
export const updateWaterIntake = (dateStr, amount) => {
  const storage = getStorage();
  
  // Initialize nutrition storage if not exists
  if (!storage.nutrition) {
    storage.nutrition = {};
  }
  
  // Initialize date entry if not exists
  if (!storage.nutrition[dateStr]) {
    storage.nutrition[dateStr] = { entries: [] };
  }
  
  storage.nutrition[dateStr].waterIntake = Math.max(0, amount);
  setStorage(storage);
  
  return true;
};