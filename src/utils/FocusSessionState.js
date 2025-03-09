// src/utils/FocusSessionState.js

// Save the focus session state to localStorage
export const saveFocusSessionState = (sessionState) => {
  try {
    localStorage.setItem('focusSessionState', JSON.stringify({
      ...sessionState,
      lastSaveTime: new Date().toISOString() // Always include a save timestamp
    }));
    return true;
  } catch (e) {
    console.error('Error saving focus session state:', e);
    return false;
  }
};

// Load the focus session state from localStorage with validation
export const loadFocusSessionState = () => {
  try {
    const savedState = localStorage.getItem('focusSessionState');
    if (!savedState) return null;
    
    const state = JSON.parse(savedState);
    
    // Check if the state is too old (more than 24 hours since last save)
    // This is just a sanity check for very old sessions
    if (state.lastSaveTime) {
      const lastSaveTime = new Date(state.lastSaveTime);
      const now = new Date();
      const timeDiff = now - lastSaveTime;
      
      // If saved more than 24 hours ago, consider it abandoned
      if (timeDiff > 24 * 60 * 60 * 1000) {
        console.log('Saved focus session state is very old (>24hr), clearing it');
        clearFocusSessionState();
        return null;
      }
    }
    
    // Only adjust time for sessions that were actively running (not paused)
    // AND only do this for very brief gaps (like page refreshes)
    if (!state.isPaused && state.lastSaveTime) {
      const lastSaveTime = new Date(state.lastSaveTime);
      const now = new Date();
      const secondsElapsed = Math.floor((now - lastSaveTime) / 1000);
      
      // Only apply this logic if the elapsed time is very small (<10 seconds)
      // This handles cases like page refreshes but won't interfere with 
      // intentional navigation away which should properly pause the timer
      if (secondsElapsed < 10) {
        if (state.timerType === 'countdown' && state.timeRemaining > 0) {
          // For countdown timer, subtract brief elapsed time
          state.timeRemaining = Math.max(0, state.timeRemaining - secondsElapsed);
        } else if (state.timerType === 'countup') {
          // For countup timer, add brief elapsed time
          state.elapsedTime += secondsElapsed;
        }
      } else {
        // For longer gaps, the timer should have been paused by handleNavigationAway
        // If we got here, it means the pause didn't happen properly
        // So we enforce the paused state to match expected behavior
        state.isPaused = true;
      }
    }
    
    // NEVER automatically mark a session as complete when loading state
    // This should only happen when the timer naturally finishes or user explicitly ends it
    
    return state;
  } catch (e) {
    console.error('Error loading focus session state:', e);
    return null;
  }
};

// Clear the focus session state from localStorage
export const clearFocusSessionState = () => {
  try {
    localStorage.removeItem('focusSessionState');
    return true;
  } catch (e) {
    console.error('Error clearing focus session state:', e);
    return false;
  }
};