/**
 * Gets a date string in YYYY-MM-DD format using local timezone
 * This prevents issues with DST transitions when using toISOString()
 */
export function formatDateForStorage(date) {
    if (!(date instanceof Date)) {
      // Handle string dates
      if (typeof date === 'string') {
        // If already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return date;
        }
        // Otherwise, convert to Date object
        date = new Date(date);
      } else {
        return null; // Invalid input
      }
    }
    
    return date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
  }