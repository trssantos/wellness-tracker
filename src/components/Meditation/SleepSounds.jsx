import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Star, Timer, Moon, BookOpen, Radio, Clock, ChevronDown, ChevronUp, Music, Check } from 'lucide-react';
import { getVoiceSettings, speakText } from '../../utils/meditationStorage';
import soundService from '../../utils/soundService';

const SleepSounds = ({ 
  category, 
  selectedExercise = null, 
  onClose, 
  onComplete, 
  onToggleFavorite,
  favorites = []
}) => {
  const [currentExercise, setCurrentExercise] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(60); // Default 60 minutes
  const [timer, setTimer] = useState(0);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [showDurationSelector, setShowDurationSelector] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [beforeFeeling, setBeforeFeeling] = useState(null);
  const [isStoryPlaying, setIsStoryPlaying] = useState(false);
  const [selectedSoundIndex, setSelectedSoundIndex] = useState(0);
  const [showSoundSelector, setShowSoundSelector] = useState(false);
  const [availableSounds, setAvailableSounds] = useState([]);
  const [isLoadingSounds, setIsLoadingSounds] = useState(false);
  const [secondaryAudioActive, setSecondaryAudioActive] = useState(false);
  
  const audioRef = useRef(null);
  const secondaryAudioRef = useRef(null);
  const intervalRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  
  // Background images for visualization
  const getBackgroundImage = (exerciseId) => {
    if (!exerciseId) return '/ambient-backgrounds/night-sky.jpg';
    
    const imageMap = {
      'sleep-story': '/ambient-backgrounds/night-sky.jpg',
      'delta-waves': '/ambient-backgrounds/deep-sleep.jpg',
      'brown-noise': '/ambient-backgrounds/dark-clouds.jpg',
      'night-sounds': '/ambient-backgrounds/forest-night.jpg'
    };
    
    return imageMap[exerciseId] || '/ambient-backgrounds/night-sky.jpg';
  };
  
  // Initialize audio elements when component mounts
  useEffect(() => {
    // Initialize audio elements when component mounts
    if (audioRef.current) {
      // Set initial properties
      audioRef.current.loop = true;
      audioRef.current.volume = isMuted ? 0 : volume;
      
      // Add event listeners to help debug potential issues
      audioRef.current.addEventListener('play', () => {
        console.log('Audio started playing');
      });
      
      audioRef.current.addEventListener('pause', () => {
        console.log('Audio paused');
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
      });
      
      console.log('Audio element initialized');
    }
    
    return () => {
      // Clean up
      if (audioRef.current) {
        // Remove event listeners
        audioRef.current.removeEventListener('play', () => {});
        audioRef.current.removeEventListener('pause', () => {});
        audioRef.current.removeEventListener('error', () => {});
        
        // Stop playback and clear source
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      if (secondaryAudioRef.current) {
        secondaryAudioRef.current.pause();
        secondaryAudioRef.current.src = '';
      }
    };
  }, []);
  
  // Set current exercise when component mounts or selectedExercise changes
  useEffect(() => {
    // If selectedExercise is provided, use it
    if (selectedExercise) {
      console.log('Using selected exercise:', selectedExercise.id);
      setCurrentExercise(selectedExercise);
    } else if (category && category.exercises && category.exercises.length > 0) {
      // Otherwise default to first exercise in category
      console.log('Using first exercise in category:', category.exercises[0].id);
      setCurrentExercise(category.exercises[0]);
    }
  }, [selectedExercise, category]);
  
  // Load available sounds for current exercise
  useEffect(() => {
    if (!currentExercise) return;
    
    const loadSounds = async () => {
      setIsLoadingSounds(true);
      try {
        // Explicitly console log exercise id for debugging
        console.log('Loading sounds for exercise ID:', currentExercise.id);
        
        // Get sounds for this specific category and type
        const sounds = await soundService.getSounds('sleep', currentExercise.id);
        console.log('Loaded sounds:', sounds);
        
        if (sounds && sounds.length > 0) {
          setAvailableSounds(sounds);
          setSelectedSoundIndex(0); // Always set to first sound to ensure selection
          
          // Log sound file path for first sound
          console.log('First sound file path:', soundService.getFilePath('sleep', sounds[0].file));
        } else {
          // Fallback to general sleep sounds if specific ones aren't found
          console.log('No specific sounds found, loading fallback sounds');
          const fallbackSounds = await soundService.getSounds('sleep', 'night-sounds');
          console.log('Fallback sounds:', fallbackSounds);
          setAvailableSounds(fallbackSounds);
          setSelectedSoundIndex(0);
        }
      } catch (error) {
        console.error('Error loading sounds:', error);
        setAvailableSounds([]);
      } finally {
        setIsLoadingSounds(false);
      }
    };
    
    loadSounds();
  }, [currentExercise]);
  
  // Ensure the audio source gets set when a sound is selected
  useEffect(() => {
    if (!availableSounds || availableSounds.length === 0) {
      console.log('No available sounds to set source');
      return;
    }
    
    // Ensure selected index is valid
    if (selectedSoundIndex >= availableSounds.length) {
      console.log('Selected index out of range, resetting to 0');
      setSelectedSoundIndex(0);
      return;
    }
    
    // Get the current sound file
    const soundFile = getCurrentSoundFile();
    if (!soundFile) {
      console.log('No sound file to set');
      return;
    }
    
    console.log('Setting initial sound source:', soundFile);
    
    // Set the source for the active audio element
    const activeAudio = secondaryAudioActive ? secondaryAudioRef.current : audioRef.current;
    if (activeAudio) {
      activeAudio.src = soundFile;
      activeAudio.load();
    }
  }, [availableSounds, selectedSoundIndex]);
  
  // Get current sound based on selected index
  const getCurrentSound = () => {
    if (!availableSounds || availableSounds.length === 0) return null;
    
    // Check if selected index is in range
    if (selectedSoundIndex >= availableSounds.length) {
      console.warn('Selected sound index out of range, using first sound');
      return availableSounds[0];
    }
    
    return availableSounds[selectedSoundIndex];
  };
  
  // Get current sound file path
  const getCurrentSoundFile = () => {
    if (!availableSounds || availableSounds.length === 0) {
      console.warn('No available sounds when getting current sound file');
      return '';
    }
    
    // Check if selected index is in range
    if (selectedSoundIndex >= availableSounds.length) {
      console.warn('Selected sound index out of range, using first sound');
      const sound = availableSounds[0];
      if (!sound) return '';
      return soundService.getFilePath('sleep', sound.file);
    }
    
    const sound = availableSounds[selectedSoundIndex];
    if (!sound) {
      console.warn('Selected sound is undefined');
      return '';
    }
    
    return soundService.getFilePath('sleep', sound.file);
  };
  
  // Load audio file when exercise or selected sound changes
  useEffect(() => {
    if (!currentExercise) return;
    
    if (currentExercise && audioRef.current && secondaryAudioRef.current) {
      const soundFile = getCurrentSoundFile();
      if (soundFile) {
        console.log('Loading sound file:', soundFile);
        
        // Load into the currently active audio element
        const activeAudio = secondaryAudioActive ? secondaryAudioRef.current : audioRef.current;
        activeAudio.src = soundFile;
        activeAudio.load();
        
        // Ensure looping is enabled
        activeAudio.loop = true;
      }
    }
  }, [currentExercise, secondaryAudioActive]);

  // Setup timer and feelings dialog
  useEffect(() => {
    if (!currentExercise) return;
    
    // Only initialize timer on mount or when duration/exercise changes
    // but NOT when secondaryAudioActive changes
    if (!isPlaying) {
      // Initialize timer based on selected duration
      setTimer(duration * 60); // Convert minutes to seconds
    }
    
    // Show the before feelings dialog
    if (!beforeFeeling) {
      // Wait a moment before showing the dialog
      setTimeout(() => {
        const dialog = document.getElementById('before-feeling-dialog');
        if (dialog) dialog.showModal();
      }, 500);
    }
  }, [currentExercise, duration, beforeFeeling]);
  
  // Sleep story content
  const getSleepStory = () => {
    return [
      "As you rest comfortably, imagine yourself in a peaceful cottage by the ocean.",
      "The gentle sound of waves creates a soothing rhythm that invites your body to relax even more deeply.",
      "You can feel a soft breeze coming through the window, carrying the fresh scent of salt water.",
      "The room is dimly lit with warm light that creates a comforting glow around you.",
      "Outside, stars fill the night sky, each one a distant point of light in the vast darkness.",
      "Your breathing naturally slows as you listen to the rhythm of the waves.",
      "With each breath out, you feel yourself sinking deeper into relaxation.",
      "The weight of the day gently lifts away, leaving your body feeling increasingly heavy and comfortable.",
      "Any thoughts that arise simply drift away like clouds on the horizon.",
      "You notice the soft blanket against your skin, providing just the right amount of warmth.",
      "The cottage feels like the most peaceful place in the world right now.",
      "There is nothing to do, nowhere to go, just this moment of complete rest.",
      "The tension in your shoulders melts away as you sink deeper into comfort.",
      "Your eyelids feel heavier with each passing moment.",
      "The sound of the ocean continues its gentle lullaby, inviting you to let go completely.",
      "Your mind becomes quieter, thoughts becoming fewer and further between.",
      "You are entering the peaceful space between wakefulness and sleep.",
      "Each breath takes you deeper into tranquility.",
      "The night wraps around you like a protective cocoon of calm.",
      "You drift peacefully, safely held in perfect comfort.",
      "Sleep approaches gently, a welcome friend coming to meet you."
    ];
  };
  
  // Set up on mount
  useEffect(() => {
    // Set up speech synthesis
    speechSynthesisRef.current = window.speechSynthesis;
    
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      if (secondaryAudioRef.current) {
        secondaryAudioRef.current.pause();
      }
    };
  }, []);
  
  // Start the sleep sound
  const startSleepSound = () => {
    if (!currentExercise) {
      console.error('Cannot start sound: No exercise selected');
      return;
    }
    
    if (!availableSounds || availableSounds.length === 0) {
      console.error('Cannot start sound: No sounds available');
      return;
    }
    
    console.log('Starting sleep sound, available sounds:', availableSounds.length);
    
    setIsPlaying(true);
    
    // Make sure we have a valid sound selection
    if (selectedSoundIndex >= availableSounds.length) {
      setSelectedSoundIndex(0);
    }
    
    // Play audio using the active audio element
    const activeAudio = secondaryAudioActive ? secondaryAudioRef.current : audioRef.current;
    if (activeAudio) {
      // Ensure we have a valid source
      if (!activeAudio.src || activeAudio.src === window.location.href) {
        const soundFile = getCurrentSoundFile();
        console.log('Setting source before playing:', soundFile);
        activeAudio.src = soundFile;
        activeAudio.load();
      }
      
      console.log('Playing audio from:', activeAudio.src);
      activeAudio.volume = isMuted ? 0 : volume;
      activeAudio.play().catch(e => console.error("Couldn't play audio:", e));
    }
    
    // If it's a sleep story, start narration
    if (currentExercise.id === 'sleep-story') {
      setIsStoryPlaying(true);
      startSleepStory();
    }
    
    // Reset and start the timer
    setTimer(duration * 60);
    setElapsedTime(0);
    
    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          // Timer finished
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          // Stop playing
          setIsPlaying(false);
          
          if (audioRef.current) {
            audioRef.current.pause();
          }
          
          if (secondaryAudioRef.current) {
            secondaryAudioRef.current.pause();
          }
          
          if (speechSynthesisRef.current) {
            speechSynthesisRef.current.cancel();
          }
          
          // Show the completion dialog after a moment
          setTimeout(() => {
            const dialog = document.getElementById('after-feeling-dialog');
            if (dialog) dialog.showModal();
          }, 1000);
          
          return 0;
        }
        return prev - 1;
      });
      
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };
  
  // Start narrating the sleep story
  const startSleepStory = () => {
    if (!speechSynthesisRef.current || isMuted) return;
    
    // Get the story content
    const story = getSleepStory();
    
    // Clear any existing speech
    speechSynthesisRef.current.cancel();
    
    // Narrate each paragraph with pauses between
    story.forEach((paragraph, index) => {
      // Add a delay before starting (15s * index)
      setTimeout(() => {
        // Only speak if still playing
        if (isPlaying && !isMuted) {
          speakText(paragraph, isMuted, speechSynthesisRef);
        }
      }, 15000 * index);
    });
  };
  
  // Toggle play/pause
  const togglePlayPause = () => {
    if (!currentExercise || !availableSounds || availableSounds.length === 0) {
      console.log('Cannot toggle play/pause: No exercise or sounds available');
      return;
    }
    
    if (isPlaying) {
      // Pausing
      console.log('Pausing audio playback');
      setIsPlaying(false);
      
      // Pause the active audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Cancel any speech synthesis
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      
      // Clear the timer interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      // Starting or resuming playback
      console.log('Starting or resuming audio playback');
      
      // Make sure we have a valid sound file
      const soundFile = getCurrentSoundFile();
      if (!soundFile) {
        console.error('No valid sound file to play');
        return;
      }
      
      // Ensure the audio element has the correct source
      if (!audioRef.current.src || audioRef.current.src === window.location.href || 
          !audioRef.current.src.includes(availableSounds[selectedSoundIndex].file)) {
        console.log('Setting audio source before playing:', soundFile);
        audioRef.current.src = soundFile;
        audioRef.current.load();
      }
      
      // Set the audio volume
      audioRef.current.volume = isMuted ? 0 : volume;
      
      // Try to play
      audioRef.current.play()
        .then(() => {
          // Successfully started playback
          console.log('Audio playback started successfully');
          setIsPlaying(true);
          
          // If it's a sleep story, start narration
          if (currentExercise.id === 'sleep-story') {
            setIsStoryPlaying(true);
            startSleepStory();
          }
          
          
          // Start the timer interval
          intervalRef.current = setInterval(() => {
            setTimer(prev => {
              if (prev <= 1) {
                // Timer finished
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                }
                
                // Stop playing
                setIsPlaying(false);
                
                if (audioRef.current) {
                  audioRef.current.pause();
                }
                
                if (speechSynthesisRef.current) {
                  speechSynthesisRef.current.cancel();
                }
                
                // Show the completion dialog after a moment
                setTimeout(() => {
                  const dialog = document.getElementById('after-feeling-dialog');
                  if (dialog) dialog.showModal();
                }, 1000);
                
                return 0;
              }
              return prev - 1;
            });
            
            setElapsedTime(prev => prev + 1);
          }, 1000);
        })
        .catch(error => {
          // Failed to start playback
          console.error('Failed to start audio playback:', error);
          
          // Try a different approach - sometimes reloading helps
          console.log('Trying to reload audio and play again...');
          audioRef.current.load();
          
          setTimeout(() => {
            audioRef.current.play()
              .then(() => {
                console.log('Audio playback started on second attempt');
                setIsPlaying(true);
              })
              .catch(e => {
                console.error('Failed to play audio on second attempt:', e);
              });
          }, 300);
        });
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Apply to primary audio
    if (audioRef.current) {
      audioRef.current.volume = newMutedState ? 0 : (secondaryAudioActive ? 0 : volume);
    }
    
    // Apply to secondary audio
    if (secondaryAudioRef.current) {
      secondaryAudioRef.current.volume = newMutedState ? 0 : (secondaryAudioActive ? volume : 0);
    }
    
    // Handle speech synthesis
    if (speechSynthesisRef.current) {
      if (newMutedState) {
        speechSynthesisRef.current.cancel();
      } else if (isPlaying && currentExercise.id === 'sleep-story') {
        // Restart the story if unmuting
        startSleepStory();
      }
    }
  };
  
  // Change volume
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (!isMuted) {
      // Apply to active audio element
      if (audioRef.current) {
        audioRef.current.volume = secondaryAudioActive ? 0 : newVolume;
      }
      
      if (secondaryAudioRef.current) {
        secondaryAudioRef.current.volume = secondaryAudioActive ? newVolume : 0;
      }
    }
  };
  
  // Set custom duration
  const handleDurationChange = (mins) => {
    setDuration(mins);
    setTimer(mins * 60);
    setShowDurationSelector(false);
  };

  // Handle sound selection with seamless crossfade
  const handleSoundSelection = (index) => {
    // If the new sound is the same as current, do nothing
    if (index === selectedSoundIndex) {
      setShowSoundSelector(false);
      return;
    }
    
    console.log('Switching sound to index:', index, availableSounds[index].name);
    
    // Get sound file for the newly selected sound
    const newSoundFile = soundService.getFilePath('sleep', availableSounds[index].file);
    console.log('New sound file path:', newSoundFile);
    
    // Update the selected index right away
    setSelectedSoundIndex(index);
    
    // If not currently playing, just update source without playing
    if (!isPlaying) {
      const activeAudio = secondaryAudioActive ? secondaryAudioRef.current : audioRef.current;
      if (activeAudio) {
        activeAudio.src = newSoundFile;
        activeAudio.load();
      }
      setShowSoundSelector(false);
      return;
    }
    
    // SIMPLER APPROACH: Instead of trying to do a complex crossfade, we'll use a simpler approach
    try {
      const activeAudio = secondaryAudioActive ? secondaryAudioRef.current : audioRef.current;
      
      // Remember the current playback time and volume
      const currentTime = activeAudio.currentTime || 0;
      const currentVolume = isMuted ? 0 : volume;
      
      // Prepare for immediate switch
      console.log('Switching audio directly');
      
      // Pause the current audio
      activeAudio.pause();
      
      // Change source and reload
      activeAudio.src = newSoundFile;
      activeAudio.load();
      
      // Set up the oncanplaythrough event to start playing when loaded
      activeAudio.oncanplaythrough = () => {
        // Remove the handler to prevent multiple calls
        activeAudio.oncanplaythrough = null;
        
        // Set volume
        activeAudio.volume = currentVolume;
        
        // Set the loop property
        activeAudio.loop = true;
        
        // Play the audio
        console.log('Starting playback of new sound');
        activeAudio.play()
          .then(() => {
            console.log('Successfully switched to new sound');
          })
          .catch(err => {
            console.error('Error playing new sound:', err);
          });
      };
      
      // Handle errors
      activeAudio.onerror = (e) => {
        console.error('Error loading audio:', e);
      };
      
      // Close the selector
      setShowSoundSelector(false);
    } catch (error) {
      console.error("Error during sound selection:", error);
      setShowSoundSelector(false);
    }
  };
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle exercise completion
  const handleCompleteExercise = (afterFeeling) => {
    if (!currentExercise) return;
    
    // Close dialog
    const dialog = document.getElementById('after-feeling-dialog');
    if (dialog) dialog.close();
    
    // Get the current sound details
    const currentSound = getCurrentSound();
    
    // Create session data
    const sessionData = {
      exerciseId: currentExercise.id,
      category: category.id,
      name: currentExercise.name,
      soundName: currentSound?.name || "Default",
      soundId: currentSound?.id || currentExercise.id,
      duration: Math.round(elapsedTime / 60), // Convert seconds to minutes
      timestamp: new Date().toISOString(),
      type: 'meditation',
      moodBefore: beforeFeeling,
      moodAfter: afterFeeling
    };
    
    // Pass the data to parent
    onComplete(sessionData);
    
    // Close modal
    onClose();
  };
  
  // Handle setting the before feeling
  const handleBeforeFeeling = (feeling) => {
    setBeforeFeeling(feeling);
    const dialog = document.getElementById('before-feeling-dialog');
    if (dialog) dialog.close();
  };
  
  // Get the favorite status
  const isFavorite = currentExercise ? favorites.includes(currentExercise.id) : false;
  
  // Calculate progress percentage
  const progressPercentage = duration > 0 ? ((duration * 60 - timer) / (duration * 60)) * 100 : 0;
  
  // Get current sound
  const currentSound = getCurrentSound();
  
  // Get icon based on exercise type
  const getExerciseIcon = () => {
    if (!currentExercise) return <Moon size={24} />;
    
    switch (currentExercise.id) {
      case 'sleep-story':
        return <BookOpen size={24} />;
      case 'delta-waves':
      case 'brown-noise':
        return <Radio size={24} />;
      case 'night-sounds':
        return <Moon size={24} />;
      default:
        return <Moon size={24} />;
    }
  };
  
  // Loading state
  if (!currentExercise) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
        <div className="text-white">Loading exercise...</div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 overflow-y-auto">
      {/* Background visualization */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${getBackgroundImage(currentExercise.id)})` }}
      ></div>
      
      {/* Primary audio element */}
<audio 
  ref={audioRef} 
  src={getCurrentSoundFile()} 
  loop={true}
  preload="auto"
/>

{/* Secondary audio element - not using this in our simplified approach */}
<audio 
  ref={secondaryAudioRef} 
  preload="auto"
/>
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="flex justify-between items-center">
          <button 
            onClick={onClose}
            className="p-2 text-white bg-slate-800/70 rounded-full hover:bg-slate-700/70 transition-colors"
          >
            <X size={24} />
          </button>
          
          <div>
            <h2 className="text-xl font-medium text-white">{currentExercise.name}</h2>
            <p className="text-slate-300 text-sm text-center">
              Sleep Sound
            </p>
          </div>
          
          <button
            onClick={() => onToggleFavorite(currentExercise.id)}
            className="p-2 text-white bg-slate-800/70 rounded-full hover:bg-slate-700/70 transition-colors"
          >
            <Star size={24} className={isFavorite ? 'fill-amber-500 text-amber-500' : ''} />
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        {/* Sound selector */}
        {availableSounds && availableSounds.length > 0 && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowSoundSelector(!showSoundSelector)}
              className="bg-slate-800/70 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700/70 transition-colors"
            >
              <Music size={18} />
              <span>{currentSound?.name || "Select Sound"}</span>
              {showSoundSelector ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showSoundSelector && (
              <div className="mt-2 bg-slate-800 rounded-lg p-2 shadow-lg w-64 max-w-full absolute left-1/2 transform -translate-x-1/2 z-20">
                <h3 className="text-white text-sm px-2 py-1">Select Sound</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {availableSounds.map((sound, index) => (
                    <button
                      key={sound.id}
                      onClick={() => handleSoundSelection(index)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center ${
                        index === selectedSoundIndex 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-white hover:bg-slate-700 transition-colors'
                      }`}
                    >
                      <span>{sound.name}</span>
                      {index === selectedSoundIndex && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Loading state for sounds */}
        {isLoadingSounds && (
          <div className="mb-8 text-center">
            <div className="text-slate-300 text-sm">Loading available sounds...</div>
          </div>
        )}
        
        {/* No sounds available */}
        {!isLoadingSounds && (!availableSounds || availableSounds.length === 0) && (
          <div className="mb-8 text-center">
            <div className="text-red-400 text-sm">No sounds available for this exercise.</div>
          </div>
        )}
        
        {/* Timer display */}
        <div className="mb-8 text-center">
          <div className="text-4xl xs:text-5xl sm:text-6xl font-light text-white mb-2">
            {formatTime(timer)}
          </div>
          <div className="text-slate-300 text-sm">
            {isPlaying ? 'Playing' : 'Paused'} • Timer: {duration} minutes
          </div>
        </div>
        
        {/* Sound visualization */}
        <div className="mb-10">
          <div className="w-16 h-16 xs:w-20 xs:h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
            <div className="w-12 h-12 xs:w-16 xs:h-16 bg-indigo-500/30 rounded-full flex items-center justify-center text-indigo-400 pulse-animation">
              {getExerciseIcon()}
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md mb-12">
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Current story text (only for sleep story) */}
        {currentExercise.id === 'sleep-story' && isPlaying && (
          <div className="bg-slate-800/50 rounded-xl p-4 max-w-md mb-8">
            <p className="text-white text-sm text-center italic opacity-70">
              "As you rest comfortably, imagine yourself in a peaceful cottage by the ocean..."
            </p>
          </div>
        )}
        
        {/* Controls */}
        <div className="space-y-6">
          {/* Play/Pause button */}
          <div className="flex justify-center">
            <button
              onClick={togglePlayPause}
              disabled={!availableSounds || availableSounds.length === 0}
              className={`p-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white 
                ${!availableSounds || availableSounds.length === 0
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:from-indigo-600 hover:to-purple-600 shadow-lg'}`}
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
          </div>
          
          {/* Volume and timer controls */}
          <div className="flex justify-center gap-8">
            {/* Volume control */}
            <div className="relative">
              <button
                onClick={() => setShowVolumeControl(!showVolumeControl)}
                className="p-3 text-white bg-slate-800/70 rounded-full hover:bg-slate-700/70 transition-colors"
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              
              {showVolumeControl && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-slate-800 p-3 rounded-lg shadow-lg max-w-[calc(100vw-2rem)] z-20">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-32 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <button
                    onClick={toggleMute}
                    className="w-full mt-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm"
                  >
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Duration selector */}
            <div className="relative">
              <button
                onClick={() => setShowDurationSelector(!showDurationSelector)}
                className="p-3 text-white bg-slate-800/70 rounded-full hover:bg-slate-700/70 transition-colors flex items-center gap-1"
              >
                <Timer size={24} />
                {showDurationSelector ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {showDurationSelector && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-slate-800 p-3 rounded-lg shadow-lg max-w-[calc(100vw-2rem)] z-20">
                  <div className="text-center mb-2 text-white text-sm">Duration</div>
                  <div className="space-y-2">
                    {[30, 45, 60, 90, 120, 180].map(mins => (
                      <button
                        key={mins}
                        onClick={() => handleDurationChange(mins)}
                        className={`w-full px-4 py-2 rounded-lg text-sm transition-colors ${
                          duration === mins 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-slate-700 text-white hover:bg-slate-600'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Note about screen dimming */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-slate-400 text-xs">
          Your screen will remain on during the session.
          <br />
          Place your device face down for the best sleep experience.
        </p>
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        .pulse-animation {
          animation: pulse 6s infinite ease-in-out;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
          }
        }
      `}</style>
      
      {/* Before feeling dialog */}
      <dialog 
        id="before-feeling-dialog" 
        className="bg-white dark:bg-slate-800 rounded-xl p-4 xs:p-6 w-64 xs:w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto shadow-xl z-50"
      >
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4">
          How are you feeling now?
        </h3>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(feeling => (
            <button
              key={feeling}
              onClick={() => handleBeforeFeeling(feeling)}
              className={`p-3 rounded-full flex items-center justify-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-700`}
            >
              <span className="text-2xl">
                {feeling === 1 ? '😔' : 
                 feeling === 2 ? '😕' : 
                 feeling === 3 ? '😐' : 
                 feeling === 4 ? '🙂' : 
                 '😊'}
              </span>
            </button>
          ))}
        </div>
        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Stressed</span>
          <span>Relaxed</span>
        </div>
      </dialog>
      
      {/* After feeling dialog */}
      <dialog 
        id="after-feeling-dialog" 
        className="bg-white dark:bg-slate-800 rounded-xl p-4 xs:p-6 w-64 xs:w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto shadow-xl z-50"
      >
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4">
          How do you feel now?
        </h3>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(feeling => (
            <button
              key={feeling}
              onClick={() => handleCompleteExercise(feeling)}
              className={`p-3 rounded-full flex items-center justify-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-700`}
            >
              <span className="text-2xl">
                {feeling === 1 ? '😔' : 
                 feeling === 2 ? '😕' : 
                 feeling === 3 ? '😐' : 
                 feeling === 4 ? '🙂' : 
                 '😊'}
              </span>
            </button>
          ))}
        </div>
        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Stressed</span>
          <span>Relaxed</span>
        </div>
      </dialog>
    </div>
  );
};

export default SleepSounds;