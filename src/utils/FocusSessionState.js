export const saveFocusSessionState = (sessionState) => {
    if (sessionState && sessionState.focusActive) {
      // Always set isPaused to true when saving
      const stateToSave = {
        ...sessionState,
        isPaused: true
      };
      
      try {
        localStorage.setItem('focusSessionState', JSON.stringify(stateToSave));
        console.log('Focus session state saved successfully');
        return true;
      } catch (e) {
        console.error('Error saving focus session state:', e);
        return false;
      }
    }
    return false;
  };
  
  export const loadFocusSessionState = () => {
    try {
      const savedState = localStorage.getItem('focusSessionState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (e) {
      console.error('Error loading focus session state:', e);
    }
    return null;
  };
  
  export const clearFocusSessionState = () => {
    try {
      localStorage.removeItem('focusSessionState');
      console.log('Focus session state cleared');
      return true;
    } catch (e) {
      console.error('Error clearing focus session state:', e);
      return false;
    }
  };