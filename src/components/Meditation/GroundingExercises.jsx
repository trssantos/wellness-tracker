import React, { useState, useEffect, useRef } from 'react';
import { Leaf, X, Play, Pause, SkipForward, Volume2, VolumeX, Star, ArrowLeft, ArrowRight, Eye, Target, User, Zap, Music, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { getVoiceSettings, speakText } from '../../utils/meditationStorage';
import soundService from '../../utils/soundService';

const GroundingExercises = ({ 
  category, 
  selectedExercise = null, 
  onClose, 
  onComplete, 
  onToggleFavorite,
  favorites = []
}) => {
  const [currentExercise, setCurrentExercise] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [beforeFeeling, setBeforeFeeling] = useState(null);
  const [volume, setVolume] = useState(0.3); // Add volume state
  const [showVolumeControl, setShowVolumeControl] = useState(false); // Add volume control toggle
  
  // Add states for audio selection
  const [selectedSoundIndex, setSelectedSoundIndex] = useState(0);
  const [showSoundSelector, setShowSoundSelector] = useState(false);
  const [availableSounds, setAvailableSounds] = useState([]);
  const [isLoadingSounds, setIsLoadingSounds] = useState(false);
  const [secondaryAudioActive, setSecondaryAudioActive] = useState(false);
  
  const audioRef = useRef(null);
  const secondaryAudioRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const intervalRef = useRef(null);
  
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
  
  // Load available sounds for meditation background
  useEffect(() => {
    if (!currentExercise) return;
    
    const loadSounds = async () => {
      setIsLoadingSounds(true);
      try {
        // Load calm sounds category for grounding exercises
        const sounds = await soundService.getSounds('meditation', 'calm');
        setAvailableSounds(sounds);
        
        // If we have sounds and none is selected yet, select the first one
        if (sounds.length > 0 && selectedSoundIndex === 0) {
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
  
  // Get current sound based on selected index
  const getCurrentSound = () => {
    if (!availableSounds.length) return null;
    return availableSounds[selectedSoundIndex] || availableSounds[0];
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
      setSelectedSoundIndex(0);
      const sound = availableSounds[0];
      if (!sound) return '';
      
      return soundService.getFilePath('meditation', sound.file);
    }
    
    const sound = availableSounds[selectedSoundIndex];
    if (!sound) {
      console.warn('Selected sound is undefined');
      return '';
    }
    
    return soundService.getFilePath('meditation', sound.file);
  };
  
  // Load audio file when exercise or selected sound changes
  useEffect(() => {
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
  
  // Get grounding script based on exercise ID
  const getGroundingScript = (exerciseId) => {
    if (!exerciseId) {
      console.error('No exercise ID provided to getGroundingScript');
      return [];
    }
    
    console.log('Getting grounding script for:', exerciseId);
    
    const scripts = {
      '5-4-3-2-1': [
        { text: "Find a comfortable position and take a deep breath.", duration: 10 },
        { text: "Look around and name 5 things you can see. Take your time.", duration: 20 },
        { text: "Now notice 4 things you can touch or feel. Perhaps the texture of your clothing or the surface you're sitting on.", duration: 20 },
        { text: "Listen for 3 things you can hear right now. Maybe distant sounds or your own breathing.", duration: 20 },
        { text: "Identify 2 things you can smell or like the smell of.", duration: 15 },
        { text: "Finally, notice 1 thing you can taste right now.", duration: 15 },
        { text: "Take a deep breath. Notice how you feel more present and grounded in this moment.", duration: 15 }
      ],
      '3-3-3': [
        { text: "Let's begin this quick grounding exercise. Take a deep breath.", duration: 10 },
        { text: "Now, name 3 things you can see around you. Just observe without judgment.", duration: 15 },
        { text: "Next, identify 3 sounds you can hear right now.", duration: 15 },
        { text: "Finally, move 3 parts of your body. Perhaps wiggle your fingers, rotate your shoulders, or move your ankles.", duration: 15 },
        { text: "Take another deep breath. Notice how this brief exercise has brought you back to the present moment.", duration: 10 }
      ],
      'progressive-relaxation': [
        { text: "Find a comfortable position, either sitting or lying down. Take a few deep breaths to begin.", duration: 15 },
        { text: "Focus your attention on your feet. Tense all the muscles in your feet for 5 seconds.", duration: 10 },
        { text: "Now release and relax your feet completely. Notice the difference between tension and relaxation.", duration: 10 },
        { text: "Move your attention to your calf muscles. Tense them for 5 seconds.", duration: 10 },
        { text: "Release and relax your calves. Feel the tension flowing away.", duration: 10 },
        { text: "Now tense your thigh muscles for 5 seconds.", duration: 10 },
        { text: "Release and relax. Feel the warmth and heaviness in your legs.", duration: 10 },
        { text: "Tighten your abdominal muscles for 5 seconds.", duration: 10 },
        { text: "Release and relax your abdomen.", duration: 10 },
        { text: "Now clench your fists and tense your arms for 5 seconds.", duration: 10 },
        { text: "Release and relax your hands and arms.", duration: 10 },
        { text: "Shrug your shoulders up to your ears for 5 seconds.", duration: 10 },
        { text: "Release and relax, letting your shoulders drop down completely.", duration: 10 },
        { text: "Tense all the muscles in your face for 5 seconds.", duration: 10 },
        { text: "Release and relax, feeling the tension melting away from your face.", duration: 10 },
        { text: "Finally, tense your entire body at once for 5 seconds.", duration: 10 },
        { text: "And release everything. Feel the relaxation flowing throughout your entire body.", duration: 15 },
        { text: "Take a few deep breaths, noticing how much more relaxed your body feels now.", duration: 15 }
      ],
      'object-focus': [
        { text: "Choose an object nearby that you can see clearly. Any small item will do.", duration: 10 },
        { text: "Focus all your attention on this object. Examine it as if you're seeing it for the first time.", duration: 15 },
        { text: "Notice its color. Is it one color or many? Are there variations in shade?", duration: 15 },
        { text: "Observe the shape and form. Notice the contours, edges, and any patterns.", duration: 15 },
        { text: "Consider the texture. How would it feel if you touched it?", duration: 15 },
        { text: "Think about the object's function or purpose. How is it used?", duration: 15 },
        { text: "If your mind wanders, gently bring your focus back to the object.", duration: 10 },
        { text: "Take one more moment to observe the object fully, with all your attention.", duration: 15 },
        { text: "Now, gradually expand your awareness beyond the object to the room around you.", duration: 10 },
        { text: "Notice how this focused attention has helped clear your mind and ground you in the present moment.", duration: 15 }
      ]
    };
    
    return scripts[exerciseId] || [];
  };

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
    
    // Set up speech synthesis
    speechSynthesisRef.current = window.speechSynthesis;
    
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
      
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
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
  
  // Calculate total time when exercise changes
  useEffect(() => {
    if (!currentExercise) return;
    
    console.log('Calculating total time for:', currentExercise.id);
    
    // Calculate total time
    const script = getGroundingScript(currentExercise.id);
    const totalSeconds = script.reduce((sum, step) => sum + step.duration, 0);
    setTotalTime(totalSeconds);
    
    // Only initialize timer on mount or when the exercise changes
    if (!isPlaying) {
      setTimer(script[0]?.duration || 0);
    }
    
    // Show the before feelings dialog
    if (!beforeFeeling) {
      // Wait a moment before showing the dialog
      setTimeout(() => {
        const dialog = document.getElementById('before-feeling-dialog');
        if (dialog) dialog.showModal();
      }, 500);
    }
  }, [currentExercise, beforeFeeling]);
  
  // Start the grounding exercise
  const startExercise = () => {
    if (!currentExercise) {
      console.error('Cannot start exercise: No exercise selected');
      return;
    }
    
    setIsPlaying(true);
    setCurrentStep(0);
    
    // Get the first step
    const script = getGroundingScript(currentExercise.id);
    if (script.length === 0) {
      console.error('No script found for exercise:', currentExercise.id);
      return;
    }
    
    setTimer(script[0].duration);
    
    // Speak the first instruction
    if (!isMuted) {
      speakText(script[0].text, isMuted, speechSynthesisRef);
    }
    
    // Play background music
    playBackgroundMusic();
    
    // Start elapsed time tracking
    setElapsedTime(0);
    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    // Hide controls after a moment
    setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };
  
  // Play background music
  const playBackgroundMusic = () => {
    if (!audioRef.current || !availableSounds || availableSounds.length === 0) {
      console.log('Cannot play background music: no audio element or no sounds available');
      return;
    }
    
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
    console.log('Playing background music');
    audioRef.current.play()
      .then(() => {
        console.log('Background music playing successfully');
      })
      .catch(error => {
        console.error('Failed to play background music:', error);
        
        // Try a different approach - sometimes reloading helps
        console.log('Trying to reload audio and play again...');
        audioRef.current.load();
        
        setTimeout(() => {
          audioRef.current.play()
            .then(() => {
              console.log('Audio playback started on second attempt');
            })
            .catch(e => {
              console.error('Failed to play audio on second attempt:', e);
            });
        }, 300);
      });
  };
  
  
  // Stop background music
  const stopBackgroundMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    if (secondaryAudioRef.current) {
      secondaryAudioRef.current.pause();
    }
  };
  
  // Main timer effect
  useEffect(() => {
    if (!isPlaying || !currentExercise) return;
    
    let timerId;
    
    if (timer > 0) {
      timerId = setTimeout(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      // Move to next step
      const script = getGroundingScript(currentExercise.id);
      const nextStep = currentStep + 1;
      
      if (nextStep < script.length) {
        // Move to next step
        setCurrentStep(nextStep);
        setTimer(script[nextStep].duration);
        
        // Speak the next instruction
        if (!isMuted) {
          speakText(script[nextStep].text, isMuted, speechSynthesisRef);
        }
      } else {
        // Exercise complete
        setIsPlaying(false);
        
        if (speechSynthesisRef.current) {
          speechSynthesisRef.current.cancel();
          speakText("This grounding exercise is complete. Take a moment to notice how you feel.", isMuted, speechSynthesisRef);
        }
        
        // Stop background music
        stopBackgroundMusic();
        
        // Stop elapsed time tracking
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        // Show the controls again
        setShowControls(true);
        
        // Show the completion dialog after a moment
        setTimeout(() => {
          const dialog = document.getElementById('after-feeling-dialog');
          if (dialog) dialog.showModal();
        }, 2000);
      }
    }
    
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isPlaying, timer, currentStep, currentExercise, isMuted]);
  
  // Toggle play/pause
  const togglePlayPause = () => {
    if (!currentExercise) return;
    
    if (isPlaying) {
      // Pausing
      console.log('Pausing grounding exercise');
      setIsPlaying(false);
      
      // Pause the speech synthesis
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      
      // Pause the background music
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Clear the timer interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      // Starting or resuming
      console.log('Starting or resuming grounding exercise');
      
      if (currentStep === 0 && timer === 0) {
        startExercise();
      } else {
        // Resume existing session
        setIsPlaying(true);
        
        // Resume the speech
        const script = getGroundingScript(currentExercise.id);
        if (timer === 0 && currentStep < script.length) {
          speakText(script[currentStep].text, isMuted, speechSynthesisRef);
        }
        
        // Resume the background music
        playBackgroundMusic();
        
        // Resume the timer
        intervalRef.current = setInterval(() => {
          setElapsedTime(prev => prev + 1);
        }, 1000);
      }
    }
  };
  
  // Skip to next step
  const skipToNextStep = () => {
    if (!isPlaying || !currentExercise) return;
    
    // Cancel current speech
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    
    // Move to next step
    const script = getGroundingScript(currentExercise.id);
    const nextStep = currentStep + 1;
    
    if (nextStep < script.length) {
      setCurrentStep(nextStep);
      setTimer(script[nextStep].duration);
      speakText(script[nextStep].text, isMuted, speechSynthesisRef);
    } else {
      // End of exercise
      setCurrentStep(script.length - 1);
      setTimer(0);
    }
  };
  
  // Skip to previous step
  const skipToPreviousStep = () => {
    if (!isPlaying || currentStep === 0 || !currentExercise) return;
    
    // Cancel current speech
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    
    // Move to previous step
    const script = getGroundingScript(currentExercise.id);
    const prevStep = currentStep - 1;
    
    setCurrentStep(prevStep);
    setTimer(script[prevStep].duration);
    speakText(script[prevStep].text, isMuted, speechSynthesisRef);
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (!isMuted) {
      // Muting
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      
      // Mute background music
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
      
      if (secondaryAudioRef.current) {
        secondaryAudioRef.current.volume = 0;
      }
    } else {
      // Unmuting
      if (isPlaying && currentExercise) {
        // Speak current instruction
        const script = getGroundingScript(currentExercise.id);
        if (script.length > currentStep) {
          speakText(script[currentStep].text, false, speechSynthesisRef);
        }
        
        // Unmute background music
        const activeAudio = secondaryAudioActive ? secondaryAudioRef.current : audioRef.current;
        if (activeAudio) {
          activeAudio.volume = volume;
        }
      }
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (!isMuted && isPlaying) {
      // Apply to active audio element
      const activeAudio = secondaryAudioActive ? secondaryAudioRef.current : audioRef.current;
      if (activeAudio) {
        activeAudio.volume = newVolume;
      }
    }
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
    const newSoundFile = soundService.getFilePath('meditation', availableSounds[index].file);
    console.log('New sound file path:', newSoundFile);
    
    // Update the selected index right away
    setSelectedSoundIndex(index);
    
    // If not currently playing, just update source without playing
    if (!isPlaying) {
      const activeAudio = audioRef.current;
      if (activeAudio) {
        activeAudio.src = newSoundFile;
        activeAudio.load();
      }
      setShowSoundSelector(false);
      return;
    }
    
    // SIMPLER APPROACH: Instead of trying to do a complex crossfade, we'll use a simpler approach
    try {
      const activeAudio = audioRef.current;
      
      // Remember the current volume
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
  
  // Handle mouse movement to show controls
  const handleMouseMove = () => {
    if (!showControls) {
      setShowControls(true);
      
      // Hide controls after 3 seconds of inactivity
      const hideTimer = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
      
      return () => clearTimeout(hideTimer);
    }
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
      soundId: currentSound?.id || "default",
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
  
  // Format time display (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progressPercentage = totalTime > 0 ? (elapsedTime / totalTime) * 100 : 0;
  
  // Get the current instruction text
  const getCurrentInstructionText = () => {
    if (!currentExercise) return "Select an exercise to begin";
    
    const script = getGroundingScript(currentExercise.id);
    return currentStep < script.length ? script[currentStep].text : "Exercise complete";
  };
  
  // Get appropriate icon for exercise
  const getExerciseIcon = () => {
    if (!currentExercise) return <Leaf size={36} />;
    
    switch (currentExercise.id) {
      case '5-4-3-2-1':
        return <Eye size={36} />;
      case '3-3-3':
        return <Zap size={36} />;
      case 'progressive-relaxation':
        return <User size={36} />;
      case 'object-focus':
        return <Target size={36} />;
      default:
        return <Leaf size={36} />;
    }
  };
  
  // Get the favorite status
  const isFavorite = currentExercise ? favorites.includes(currentExercise.id) : false;
  
  // Get current sound
  const currentSound = getCurrentSound();
  
  // Loading state
  if (!currentExercise) {
    return (
      <div className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center">
        <div className="text-white">Loading exercise...</div>
      </div>
    );
  }
  
  return (
    <div 
      className="fixed inset-0 bg-gradient-to-b from-green-900/90 to-slate-900/90 z-50 flex flex-col items-center justify-center overflow-y-auto"
      onMouseMove={handleMouseMove}
    >
      {/* Audio element */}
<audio 
  ref={audioRef} 
  src={getCurrentSoundFile()} 
  loop={true}
  preload="auto"
/>
      
      {/* Header with controls */}
      <div className={`absolute top-0 left-0 right-0 p-4 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
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
              Grounding Exercise
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
      <div className="flex-1 flex flex-col items-center justify-center w-full p-6">
        {/* Sound selector */}
        {availableSounds.length > 0 && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowSoundSelector(!showSoundSelector)}
              className="bg-slate-800/70 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700/70 transition-colors"
            >
              <Music size={18} />
              <span>{currentSound?.name || "Select Background Music"}</span>
              {showSoundSelector ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showSoundSelector && (
              <div className="mt-2 bg-slate-800 rounded-lg p-2 shadow-lg w-64 max-w-full absolute left-1/2 transform -translate-x-1/2 z-20">
                <h3 className="text-white text-sm px-2 py-1">Select Background Music</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {availableSounds.map((sound, index) => (
                    <button
                      key={sound.id}
                      onClick={() => handleSoundSelection(index)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center ${
                        index === selectedSoundIndex 
                          ? 'bg-green-600 text-white' 
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
        
        {/* Progress bar */}
        <div className="w-full max-w-2xl mb-10">
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>{formatTime(elapsedTime)}</span>
            <span>{formatTime(totalTime)}</span>
          </div>
        </div>
        
        {/* Exercise icon */}
        <div className="mb-6">
          <div className="w-16 h-16 xs:w-20 xs:h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <div className="w-12 h-12 xs:w-16 xs:h-16 rounded-full bg-green-500/30 flex items-center justify-center pulse-animation">
              {getExerciseIcon()}
            </div>
          </div>
        </div>
        
        {/* Instruction text */}
        <div className="bg-slate-800/50 rounded-xl p-4 xs:p-6 w-full max-w-2xl mb-4 xs:mb-8">
          <p className="text-white text-lg xs:text-xl sm:text-2xl font-light leading-relaxed text-center">
            {isPlaying ? getCurrentInstructionText() : "Press play to begin the grounding exercise."}
          </p>
        </div>
        
        {/* Timer */}
        {isPlaying && (
          <div className="text-3xl xs:text-4xl font-light text-white mb-6 xs:mb-8">
            {timer}
          </div>
        )}
      </div>
      
      {/* Bottom controls */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex justify-center items-center gap-3 xs:gap-4 sm:gap-6">
          {/* Volume control */}
          <div className="relative">
            <button
              onClick={() => setShowVolumeControl(!showVolumeControl)}
              className="p-2 xs:p-3 text-white bg-slate-800/70 rounded-full hover:bg-slate-700/70 transition-colors"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
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
          
          <button
            onClick={skipToPreviousStep}
            className={`p-2 xs:p-3 text-white bg-slate-800/70 rounded-full hover:bg-slate-700/70 transition-colors ${
              !isPlaying || currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!isPlaying || currentStep === 0}
          >
            <ArrowLeft size={20} />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="p-4 xs:p-6 text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-full hover:from-green-600 hover:to-emerald-600 transition-colors"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button
            onClick={skipToNextStep}
            className={`p-2 xs:p-3 text-white bg-slate-800/70 rounded-full hover:bg-slate-700/70 transition-colors ${
              !isPlaying || currentStep >= getGroundingScript(currentExercise.id).length - 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!isPlaying || currentStep >= getGroundingScript(currentExercise.id).length - 1}
          >
            <ArrowRight size={20} />
          </button>
          
          <button
            onClick={skipToNextStep}
            className={`p-2 xs:p-3 text-white bg-slate-800/70 rounded-full hover:bg-slate-700/70 transition-colors ${
              !isPlaying ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!isPlaying}
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        .pulse-animation {
          animation: pulse 4s infinite ease-in-out;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
          }
        }
      `}</style>
      
      {/* Before feeling dialog */}
      <dialog 
        id="before-feeling-dialog" 
        className="bg-white dark:bg-slate-800 rounded-xl p-4 xs:p-6 w-64 xs:w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto shadow-xl"
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
        className="bg-white dark:bg-slate-800 rounded-xl p-4 xs:p-6 w-64 xs:w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto shadow-xl"
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

export default GroundingExercises;