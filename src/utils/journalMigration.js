// src/utils/journalMigration.js

import { getStorage, setStorage } from './storage';
import { handleDataChange } from './dayCoachUtils';

/**
 * Migrate legacy day notes to the new journal entry system
 * This ensures backward compatibility while introducing the new structure
 */
export const migrateLegacyNotes = () => {
  try {
    const storage = getStorage();
    let migrationPerformed = false;
    
    // Create meditationData if it doesn't exist
    if (!storage.meditationData) {
      storage.meditationData = {};
    }
    
    // Create journalEntries array if it doesn't exist
    if (!storage.meditationData.journalEntries) {
      storage.meditationData.journalEntries = [];
    }
    
    // Get all date keys from storage (YYYY-MM-DD format)
    const dateKeys = Object.keys(storage).filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key));
    
    // For each date that has a notes field, convert it to a journal entry if not already done
    for (const dateKey of dateKeys) {
      const dayData = storage[dateKey];
      
      if (dayData.notes && typeof dayData.notes === 'string' && dayData.notes.trim()) {
        // Check if this day already has a migrated flag to avoid double migration
        if (!dayData.notesMigrated) {
          // Create a new journal entry from the day notes
          const newEntry = {
            id: `legacy-note-${dateKey}`,
            title: 'Daily Note',
            text: dayData.notes.trim(),
            mood: dayData.mood || dayData.morningMood || 3,
            energy: dayData.energyLevel || dayData.morningEnergy || 2,
            categories: ['personal'],
            tags: ['notes', 'daily'],
            date: dateKey,
            timestamp: new Date(`${dateKey}T12:00:00`).toISOString(),
            isLegacyNote: true // Flag to identify migrated notes
          };
          
          // Add to journal entries
          storage.meditationData.journalEntries.push(newEntry);
          
          // Mark as migrated in the day data
          storage[dateKey].notesMigrated = true;
          
          migrationPerformed = true;
        }
      }
    }
    
    // Save changes if any migrations were performed
    if (migrationPerformed) {
      setStorage(storage);
      console.log('Legacy notes migration completed');
    }
    
    return migrationPerformed;
  } catch (error) {
    console.error('Error migrating legacy notes:', error);
    return false;
  }
};

/**
 * Sync journal entries with day notes (for backward compatibility)
 * This ensures that old modules still work with the new data structure
 */
export const syncJournalToDayNotes = (dateStr, entries) => {
  try {
    const storage = getStorage();
    const dayData = storage[dateStr] || {};
    
    // If there are no entries, don't modify day notes
    if (!entries || entries.length === 0) return false;
    
    // If there are entries, update the day notes field
    // Create a combined note from all entries for the day
    const combinedNote = entries
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(entry => `[${new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] ${entry.title}\n${entry.text}`)
      .join('\n\n---\n\n');
    
    // Only update if the content has changed
    if (dayData.notes !== combinedNote) {
      storage[dateStr] = {
        ...dayData,
        notes: combinedNote,
        notesSynced: true // Flag to indicate this was auto-synced
      };
      
      setStorage(storage);
      handleDataChange(dateStr, 'journal', { notes: combinedNote });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error syncing journal to day notes:', error);
    return false;
  }
};

/**
 * Get all journal entries for a specific date
 */
export const getJournalEntriesForDate = (dateStr) => {
  try {
    const storage = getStorage();
    const meditationData = storage.meditationData || {};
    const allEntries = meditationData.journalEntries || [];
    
    // Filter entries for this date
    const entriesForDate = allEntries.filter(entry => {
      const entryDate = entry.date || entry.timestamp.split('T')[0];
      return entryDate === dateStr;
    });
    
    // Sort by timestamp, newest first
    return entriesForDate.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error getting journal entries:', error);
    return [];
  }
};

/**
 * Get all unique people mentioned across journal entries
 */
export const getAllPeopleMentioned = () => {
  try {
    const storage = getStorage();
    const meditationData = storage.meditationData || {};
    const allEntries = meditationData.journalEntries || [];
    
    // Extract people from all entries
    const peopleSet = new Set();
    
    allEntries.forEach(entry => {
      if (entry.people && Array.isArray(entry.people)) {
        entry.people.forEach(person => peopleSet.add(person));
      }
    });
    
    return Array.from(peopleSet);
  } catch (error) {
    console.error('Error getting people mentioned:', error);
    return [];
  }
};

/**
 * Get all unique tags used across journal entries
 */
export const getAllTags = () => {
  try {
    const storage = getStorage();
    const meditationData = storage.meditationData || {};
    const allEntries = meditationData.journalEntries || [];
    
    // Extract tags from all entries
    const tagsSet = new Set();
    
    allEntries.forEach(entry => {
      if (entry.tags && Array.isArray(entry.tags)) {
        entry.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    
    return Array.from(tagsSet);
  } catch (error) {
    console.error('Error getting tags:', error);
    return [];
  }
};

/**
 * Get summary statistics for journal entries
 */
export const getJournalStats = () => {
  try {
    const storage = getStorage();
    const meditationData = storage.meditationData || {};
    const allEntries = meditationData.journalEntries || [];
    
    // Basic stats
    const totalEntries = allEntries.length;
    
    // Get date range
    const dateSet = new Set();
    allEntries.forEach(entry => {
      const dateStr = entry.date || entry.timestamp.split('T')[0];
      dateSet.add(dateStr);
    });
    const daysWithEntries = dateSet.size;
    
    // Get mood average
    let moodSum = 0;
    let moodCount = 0;
    allEntries.forEach(entry => {
      if (entry.mood) {
        moodSum += entry.mood;
        moodCount++;
      }
    });
    const avgMood = moodCount > 0 ? moodSum / moodCount : null;
    
    // Get energy average
    let energySum = 0;
    let energyCount = 0;
    allEntries.forEach(entry => {
      if (entry.energy) {
        energySum += entry.energy;
        energyCount++;
      }
    });
    const avgEnergy = energyCount > 0 ? energySum / energyCount : null;
    
    // Get category counts
    const categoryCount = {};
    allEntries.forEach(entry => {
      if (entry.categories && Array.isArray(entry.categories)) {
        entry.categories.forEach(cat => {
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
      }
    });
    
    // Get top categories
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
    
    return {
      totalEntries,
      daysWithEntries,
      avgMood,
      avgEnergy,
      topCategories,
      lastEntryDate: allEntries.length > 0 ? 
        allEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0].timestamp : null
    };
  } catch (error) {
    console.error('Error getting journal stats:', error);
    return {
      totalEntries: 0,
      daysWithEntries: 0,
      avgMood: null,
      avgEnergy: null,
      topCategories: [],
      lastEntryDate: null
    };
  }
};

/**
 * Run this during application startup to ensure data compatibility
 */
export const initializeJournalSystem = () => {
  // Migrate legacy notes to journal entries
  migrateLegacyNotes();
  
  // Ensure the meditation data structure exists
  const storage = getStorage();
  if (!storage.meditationData) {
    storage.meditationData = {};
    setStorage(storage);
  }
  
  if (!storage.meditationData.journalEntries) {
    storage.meditationData.journalEntries = [];
    setStorage(storage);
  }
  
  // Return some stats to verify the system is ready
  return getJournalStats();
};