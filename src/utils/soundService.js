// src/utils/soundService.js

/**
 * Sound service to manage and load available sounds dynamically
 */
class SoundService {
  constructor() {
    this.manifest = null;
    this.baseUrl = '/ambient-sounds';
    this.isLoading = false;
    this.loadPromise = null;
  }

  /**
   * Load the sound manifest file that describes available sounds
   * @returns {Promise} Promise that resolves with the manifest data
   */
  async loadManifest() {
    // If manifest is already loaded, return it
    if (this.manifest) {
      return this.manifest;
    }
    
    // If already loading, return the existing promise
    if (this.isLoading) {
      return this.loadPromise;
    }
    
    // Start loading
    this.isLoading = true;
    this.loadPromise = fetch('/sound-manifest.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load sound manifest');
        }
        return response.json();
      })
      .then(data => {
        this.manifest = data;
        return data;
      })
      .catch(error => {
        console.error('Error loading sound manifest:', error);
        return {};
      })
      .finally(() => {
        this.isLoading = false;
      });
    
    return this.loadPromise;
  }
  
  /**
   * Get all available sounds for a specific category and type
   * @param {string} category - Main category (ambient, sleep, meditation)
   * @param {string} type - Sound type within the category
   * @returns {Promise} Promise that resolves with array of sound files
   */
  async getSounds(category, type) {
    const manifest = await this.loadManifest();
    return manifest[category]?.[type]?.files || [];
  }
  
  /**
   * Get display name for a sound category
   * @param {string} category - Main category
   * @param {string} type - Sound type within the category
   * @returns {Promise<string>} Promise that resolves with the display name
   */
  async getDisplayName(category, type) {
    const manifest = await this.loadManifest();
    return manifest[category]?.[type]?.displayName || type;
  }
  
  /**
   * Get the full file path for a sound file
   * @param {string} category - Main category
   * @param {string} filePath - Relative file path from manifest
   * @returns {string} Full path to the sound file
   */
  getFilePath(category, filePath) {
    return `${this.baseUrl}/${filePath}`;
  }
  
  /**
   * Get a random sound file from a specific category and type
   * @param {string} category - Main category
   * @param {string} type - Sound type within the category
   * @returns {Promise} Promise that resolves with a random sound file
   */
  async getRandomSound(category, type) {
    const sounds = await this.getSounds(category, type);
    if (!sounds || sounds.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * sounds.length);
    const sound = sounds[randomIndex];
    return {
      ...sound,
      fullPath: this.getFilePath(category, sound.file)
    };
  }
  
  /**
   * Check if sounds are available for a category and type
   * @param {string} category - Main category
   * @param {string} type - Sound type within the category
   * @returns {Promise<boolean>} Promise that resolves with boolean indicator
   */
  async hasSounds(category, type) {
    const sounds = await this.getSounds(category, type);
    return sounds && sounds.length > 0;
  }
  
  /**
   * Get all available types in a category
   * @param {string} category - Main category
   * @returns {Promise<string[]>} Promise that resolves with array of types
   */
  async getTypes(category) {
    const manifest = await this.loadManifest();
    return manifest[category] ? Object.keys(manifest[category]) : [];
  }
  
  /**
   * Preload a set of sounds to ensure they're cached and ready
   * @param {string} category - Main category
   * @param {string} type - Sound type
   * @returns {Promise} Promise that resolves when preloading is complete
   */
  async preloadSounds(category, type) {
    const sounds = await this.getSounds(category, type);
    
    // Create a set of promises for preloading each sound
    const preloadPromises = sounds.map(sound => {
      return new Promise((resolve) => {
        const audio = new Audio();
        
        // Set up event handlers for loading
        audio.oncanplaythrough = () => {
          resolve();
        };
        
        // Handle errors
        audio.onerror = () => {
          console.warn(`Failed to preload sound: ${sound.file}`);
          resolve(); // Resolve anyway to not block other sounds
        };
        
        // Start loading
        audio.src = this.getFilePath(category, sound.file);
        audio.load();
      });
    });
    
    // Wait for all sounds to be preloaded
    return Promise.all(preloadPromises);
  }
  
  /**
   * Perform a crossfade between two audio elements
   * @param {HTMLAudioElement} fadeOutAudio - The audio element to fade out
   * @param {HTMLAudioElement} fadeInAudio - The audio element to fade in
   * @param {string} fadeInSrc - The source URL for the fade-in audio
   * @param {number} duration - Duration of crossfade in milliseconds
   * @param {number} volume - Target volume for the new audio
   * @param {boolean} isMuted - Whether audio is currently muted
   * @returns {Promise} Promise that resolves when crossfade is complete
   */
  crossFade(fadeOutAudio, fadeInAudio, fadeInSrc, duration, volume, isMuted) {
    return new Promise((resolve, reject) => {
      try {
        // Ensure both audio elements exist
        if (!fadeOutAudio || !fadeInAudio) {
          reject(new Error('Missing audio elements for crossfade'));
          return;
        }
        
        // Set the new source and load it
        fadeInAudio.src = fadeInSrc;
        fadeInAudio.load();
        fadeInAudio.loop = true;
        
        // Set initial volume
        fadeInAudio.volume = 0;
        
        // Start playing the new audio
        fadeInAudio.play().then(() => {
          // Crossfade setup
          const interval = 50; // Update every 50ms
          const steps = duration / interval;
          const fadeInStep = (isMuted ? 0 : volume) / steps;
          const fadeOutStep = fadeOutAudio.volume / steps;
          
          let currentStep = 0;
          
          // Begin crossfade
          const fadeInterval = setInterval(() => {
            currentStep++;
            
            // Increase volume of new audio (unless muted)
            if (!isMuted) {
              fadeInAudio.volume = Math.min(volume, fadeInStep * currentStep);
            }
            
            // Decrease volume of old audio
            fadeOutAudio.volume = Math.max(0, fadeOutAudio.volume - fadeOutStep);
            
            // Check if crossfade is complete
            if (currentStep >= steps) {
              clearInterval(fadeInterval);
              fadeOutAudio.pause();
              resolve();
            }
          }, interval);
        }).catch(error => {
          // If crossfade fails, still try to play the new sound
          console.error('Crossfade playback error:', error);
          fadeOutAudio.pause();
          
          if (!isMuted) {
            fadeInAudio.volume = volume;
          }
          
          fadeInAudio.play().catch(e => {
            console.error('Fallback playback error:', e);
          });
          
          resolve();
        });
      } catch (error) {
        console.error('Crossfade error:', error);
        reject(error);
      }
    });
  }
}

// Create and export singleton instance
const soundService = new SoundService();
export default soundService;