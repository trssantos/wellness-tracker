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