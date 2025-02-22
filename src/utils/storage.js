export const getStorage = () => {
    const data = localStorage.getItem('wellnessTracker');
    return data ? JSON.parse(data) : {};
  };
  
  export const setStorage = (data) => {
    localStorage.setItem('wellnessTracker', JSON.stringify(data));
  };