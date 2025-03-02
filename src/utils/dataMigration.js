// utils/dataMigration.js

/**
 * Migrates existing mood/energy data to the new morning/evening format
 * This is a one-time operation to be run when upgrading to the new format
 */
export const migrateToMorningEveningFormat = () => {
    try {
      // Get all stored data
      const storageData = JSON.parse(localStorage.getItem('wellnessTracker') || '{}');
      let migrationCount = 0;
      let migrationNeeded = false;
      
      // Check if we need migration - look for mood/energyLevel without morning/evening equivalents
      Object.keys(storageData).forEach(key => {
        // Only process date entries (YYYY-MM-DD format)
        if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const dayData = storageData[key];
          
          if (
            (dayData.mood && !dayData.morningMood && !dayData.eveningMood) ||
            (dayData.energyLevel && !dayData.morningEnergy && !dayData.eveningEnergy)
          ) {
            migrationNeeded = true;
          }
        }
      });
      
      if (!migrationNeeded) {
        console.log('No migration needed - data already in morning/evening format');
        return { migrated: false, count: 0 };
      }
      
      // Perform migration for each date entry
      Object.keys(storageData).forEach(key => {
        // Only process date entries (YYYY-MM-DD format)
        if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const dayData = storageData[key];
          
          // Migrate mood data
          if (dayData.mood && !dayData.morningMood) {
            dayData.morningMood = dayData.mood;
            migrationCount++;
          }
          
          // Migrate energy level data
          if (dayData.energyLevel && !dayData.morningEnergy) {
            dayData.morningEnergy = dayData.energyLevel;
            migrationCount++;
          }
          
          // Make sure AI context gets updated too
          if (dayData.aiContext && dayData.aiContext.mood && !dayData.morningMood) {
            dayData.morningMood = dayData.aiContext.mood;
            migrationCount++;
          }
          
          if (dayData.aiContext && dayData.aiContext.energyLevel && !dayData.morningEnergy) {
            dayData.morningEnergy = dayData.aiContext.energyLevel;
            migrationCount++;
          }
        }
      });
      
      // Save the migrated data back to localStorage
      localStorage.setItem('wellnessTracker', JSON.stringify(storageData));
      
      console.log(`Migration complete - updated ${migrationCount} entries`);
      return { migrated: true, count: migrationCount };
    } catch (error) {
      console.error('Error during data migration:', error);
      return { migrated: false, error: error.message };
    }
  };