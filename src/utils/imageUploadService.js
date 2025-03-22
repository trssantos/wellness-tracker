/**
 * Image Upload Service
 * Uses ImgBB's free API for storing food images
 */

// Replace with your own API key from https://api.imgbb.com/
const IMGBB_API_KEY = 'aadfd2652bcb6b1f8aba73a67bc6d5ef';

/**
 * Uploads an image file to ImgBB
 * @param {File} file - The image file to upload
 * @param {Function} progressCallback - Optional callback for upload progress
 * @returns {Promise<string>} The URL of the uploaded image
 */
export const uploadImage = async (file, progressCallback = null) => {
  if (!file) {
    throw new Error('No file provided');
  }
  
  // Create FormData for multipart upload
  const formData = new FormData();
  formData.append('image', file);
  
  // Create XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    if (progressCallback) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          progressCallback(percentComplete);
        }
      };
    }
    
    // Handle response
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          
          if (response.success) {
            // Return the URL of the uploaded image
            resolve(response.data.url);
          } else {
            reject(new Error(response.error?.message || 'Upload failed'));
          }
        } catch (error) {
          reject(new Error('Failed to parse response'));
        }
      } else {
        reject(new Error(`HTTP error: ${xhr.status}`));
      }
    };
    
    // Handle network errors
    xhr.onerror = () => {
      reject(new Error('Network error occurred during upload'));
    };
    
    // Initialize request
    xhr.open('POST', `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`);
    
    // Send the form data
    xhr.send(formData);
  });
};

/**
 * Generates a placeholder image URL for testing
 * @param {string} text - Optional text to display on the placeholder
 * @returns {string} Placeholder image URL
 */
export const getPlaceholderImage = (text = 'Food Image') => {
  const encodedText = encodeURIComponent(text);
  return `https://via.placeholder.com/400x300/EAEAEA/999999?text=${encodedText}`;
};

/**
 * Fallback function for when uploading isn't possible
 * Stores image in localStorage as base64 and returns a data URL
 * NOTE: This is not recommended for production as it consumes a lot of storage
 * @param {File} file - The image file
 * @param {Function} progressCallback - Optional callback for conversion progress
 * @returns {Promise<string>} Data URL for the image
 */
export const storeImageLocally = async (file, progressCallback = null) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    // Update progress as file is read
    if (progressCallback) {
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          progressCallback(percentComplete);
        }
      };
    }
    
    // Handle successful read
    reader.onload = () => {
      try {
        const dataUrl = reader.result;
        
        // Store the image URL in localStorage with a unique key
        const imageKey = `food_img_${Date.now()}`;
        localStorage.setItem(imageKey, dataUrl);
        
        // Return the key that can be used to retrieve the image later
        resolve(imageKey);
      } catch (error) {
        reject(new Error('Failed to save image locally'));
      }
    };
    
    // Handle errors
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
    
    // Read the file as data URL
    reader.readAsDataURL(file);
  });
};

/**
 * Retrieves a locally stored image
 * @param {string} imageKey - The key used to store the image
 * @returns {string|null} The image data URL or null if not found
 */
export const getLocalImage = (imageKey) => {
  return localStorage.getItem(imageKey);
};