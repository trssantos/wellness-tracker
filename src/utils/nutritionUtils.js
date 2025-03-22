import { getStorage, setStorage } from './storage';

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
  
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  const foodFrequency = {};
  const foodMoodImpact = {};
  const foodEnergyImpact = {};
  
  // Iterate through all dates in range
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    
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
  
  // Sort by frequency
  correlations.sort((a, b) => b.frequency - a.frequency);
  
  // Get top mood and energy boosters
  const moodBoosters = [...correlations]
    .filter(item => item.moodImpact > 0)
    .sort((a, b) => b.moodImpact - a.moodImpact)
    .slice(0, 5);
    
  const energyBoosters = [...correlations]
    .filter(item => item.energyImpact > 0)
    .sort((a, b) => b.energyImpact - a.energyImpact)
    .slice(0, 5);
  
  return {
    correlations: correlations.slice(0, 10),
    moodBoosters,
    energyBoosters,
    dataPoints: correlations.length
  };
};

/**
 * Convert mood string to numeric value
 * @param {string} mood - Mood string
 * @returns {number} Numeric mood value
 */
export const convertMoodToValue = (mood) => {
  const moodMap = {
    'GREAT': 5,
    'GOOD': 4, 
    'OKAY': 3,
    'MEH': 2,
    'BAD': 1,
    'OVERWHELMED': 0
  };
  
  return moodMap[mood] || 3;
};