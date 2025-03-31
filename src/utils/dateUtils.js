/**
 * Gets a date string in YYYY-MM-DD format using local timezone
 * This prevents issues with DST transitions when using toISOString()
 */
export function formatDateForStorage(date) {
  // If it's already a string in YYYY-MM-DD format, return as is
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // Handle different date inputs
  let dateObj;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    // Create a new date, but be careful with ISO strings
    if (date.includes('T')) {
      // For ISO strings, use explicit components to avoid timezone issues
      const parts = date.split('T')[0].split('-');
      dateObj = new Date(
        parseInt(parts[0]), 
        parseInt(parts[1]) - 1, 
        parseInt(parts[2])
      );
    } else {
      dateObj = new Date(date);
    }
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    // Return today's date if invalid input
    dateObj = new Date();
    console.warn('Invalid date input to formatDateForStorage:', date);
  }
  
  // Return date in YYYY-MM-DD format, using local timezone
  return dateObj.getFullYear() + '-' + 
    String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
    String(dateObj.getDate()).padStart(2, '0');
}