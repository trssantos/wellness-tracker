export const getStorage = () => {
  const data = localStorage.getItem('wellnessTracker');
  return data ? JSON.parse(data) : {};
};

export const setStorage = (data) => {
  localStorage.setItem('wellnessTracker', JSON.stringify(data));
};

// Add this to App.jsx or utils/storage.js to help debug/reset if needed
// This can be called from the console if you need to reset everything
export const resetStoredData = () => {
try {
  localStorage.removeItem('wellnessTracker');
  console.log('All stored data has been reset');
  return true;
} catch (error) {
  console.error('Failed to reset stored data:', error);
  return false;
}
};

// Also add this to see what's in storage for debugging
export const debugStorage = () => {
try {
  const data = localStorage.getItem('wellnessTracker');
  const parsed = data ? JSON.parse(data) : {};
  console.log('Current storage data:', parsed);
  
  // List all dates with task data
  const dates = Object.keys(parsed).filter(key => key.match(/^\d{4}-\d{2}-\d{2}$/));
  console.log('Dates with data:', dates);
  
  // For each date, summarize what kind of tasks it has
  dates.forEach(date => {
    const dayData = parsed[date];
    const hasDefault = !!dayData.defaultTasks;
    const hasAI = !!dayData.aiTasks;
    const hasCustom = !!dayData.customTasks;
    const checkedCount = dayData.checked ? Object.keys(dayData.checked).length : 0;
    const uncompletedCount = dayData.checked ? 
      Object.values(dayData.checked).filter(val => val === false).length : 0;
    
    console.log(`Date: ${date}`);
    console.log(`  Task types: ${hasDefault ? 'Default' : ''}${hasAI ? 'AI' : ''}${hasCustom ? 'Custom' : ''}`);
    console.log(`  Checked items: ${checkedCount} (${uncompletedCount} uncompleted)`);
  });
  
  return parsed;
} catch (error) {
  console.error('Failed to debug storage:', error);
  return null;
}
};

// ADDED: Function to get day notes from storage
export const getDayNotes = (date) => {
const storage = getStorage();
const dayData = storage[date] || {};

// Check if there are notes in the day object directly
if (dayData.notes && typeof dayData.notes === 'string') {
  return dayData.notes;
}

// Fallback to checking for meditation notes
const meditationData = storage.meditationData || {};
if (meditationData.journalEntries) {
  // Find entries for this date
  const entriesForDate = meditationData.journalEntries.filter(entry => {
    const entryDate = entry.date || entry.timestamp?.split('T')[0];
    return entryDate === date;
  });
  
  // If there's an entry with notes, return that
  const entryWithNotes = entriesForDate.find(entry => entry.text);
  if (entryWithNotes) {
    return entryWithNotes.text;
  }
}

return '';
};

// Save daily note
export const saveDailyNote = (date, noteText) => {
const storage = getStorage();
const dayData = storage[date] || {};

storage[date] = {
  ...dayData,
  notes: noteText.trim()
};

setStorage(storage);
return true;
};

// ADDED: Functions for people whitelist/blacklist
export const getPeopleLists = () => {
const storage = getStorage();
if (!storage.peopleWhitelist) {
  storage.peopleWhitelist = [];
  setStorage(storage);
}
if (!storage.peopleBlacklist) {
  storage.peopleBlacklist = [];
  setStorage(storage);
}

return {
  whitelist: storage.peopleWhitelist || [],
  blacklist: storage.peopleBlacklist || []
};
};

export const addPersonToWhitelist = (name) => {
const storage = getStorage();
if (!storage.peopleWhitelist) {
  storage.peopleWhitelist = [];
}

// Add if not already in the list
if (!storage.peopleWhitelist.includes(name)) {
  storage.peopleWhitelist.push(name);
  
  // Remove from blacklist if present
  if (storage.peopleBlacklist && storage.peopleBlacklist.includes(name)) {
    storage.peopleBlacklist = storage.peopleBlacklist.filter(p => p !== name);
  }
  
  setStorage(storage);
}
};

export const addPersonToBlacklist = (name) => {
const storage = getStorage();
if (!storage.peopleBlacklist) {
  storage.peopleBlacklist = [];
}

// Add if not already in the list
if (!storage.peopleBlacklist.includes(name)) {
  storage.peopleBlacklist.push(name);
  
  // Remove from whitelist if present
  if (storage.peopleWhitelist && storage.peopleWhitelist.includes(name)) {
    storage.peopleWhitelist = storage.peopleWhitelist.filter(p => p !== name);
  }
  
  setStorage(storage);
}
};

// Get user's preferred weight unit
export const getWeightUnit = () => {
  const storage = getStorage();
  return storage.settings?.weightUnit || 'lbs'; // Default to lbs
};

// Optional: Function to convert between units
export const convertWeight = (weight, fromUnit, toUnit) => {
  if (!weight || fromUnit === toUnit) return weight;
  
  // Convert string to number if needed
  const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight;
  
  if (isNaN(numWeight)) return weight; // Return original if not a number
  
  if (fromUnit === 'lbs' && toUnit === 'kg') {
    // Convert lbs to kg (1 lb ≈ 0.453592 kg)
    return (numWeight * 0.453592).toFixed(1);
  } else if (fromUnit === 'kg' && toUnit === 'lbs') {
    // Convert kg to lbs (1 kg ≈ 2.20462 lbs)
    return (numWeight * 2.20462).toFixed(1);
  }
  
  return weight; // Return original if units are invalid
};