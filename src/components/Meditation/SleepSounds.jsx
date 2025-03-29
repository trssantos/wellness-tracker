import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Star, Timer, Moon, BookOpen, Radio, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { getVoiceSettings } from '../../utils/meditationStorage';

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
  
  const audioRef = useRef(null);
  const narratorAudioRef = useRef(null);
  const intervalRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  
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
  
  // Get sound file path based on exercise ID
  const getSoundFile = (exerciseId) => {
    if (!exerciseId) {
      console.error('No exercise ID provided to getSoundFile');
      return '/ambient-sounds/soft-rain.mp3';
    }
    
    console.log('Getting sound file for:', exerciseId);
    
    // Map exercise IDs to sound files
    const soundMap = {
      'sleep-story': '/ambient-sounds/soft-rain.mp3', // Background for story
      'delta-waves': '/ambient-sounds/delta-waves.mp3',
      'brown-noise': '/ambient-sounds/brown-noise.mp3',
      'night-sounds': '/ambient-sounds/night-sounds.mp3'
    };
    
    return soundMap[exerciseId] || '/ambient-sounds/soft-rain.mp3';
  };
  
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
    };
  }, []);
  
  // Handle exercise changes
  useEffect(() => {
    if (!currentExercise) return;
    
    // Load audio file when exercise changes
    if (audioRef.current) {
      const soundFile = getSoundFile(currentExercise.id);
      console.log('Loading sound file:', soundFile);
      audioRef.current.src = soundFile;
      audioRef.current.load();
    }
    
    // Initialize timer based on selected duration
    setTimer(duration * 60); // Convert minutes to seconds
    
    // Show the before feelings dialog
    if (!beforeFeeling) {
      // Wait a moment before showing the dialog
      setTimeout(() => {
        const dialog = document.getElementById('before-feeling-dialog');
        if (dialog) dialog.showModal();
      }, 500);
    }
  }, [currentExercise, duration, beforeFeeling]);
  
  // Start the sleep sound
  const startSleepSound = () => {
    if (!currentExercise) {
      console.error('Cannot start sound: No exercise selected');
      return;
    }
    
    setIsPlaying(true);
    
    // Play audio
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play().catch(e => console.error("Couldn't play audio:", e));
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
    
    // Get voice settings
    const voiceSettings = getVoiceSettings();
    
    // Narrate each paragraph with pauses between
    story.forEach((paragraph, index) => {
      const utterance = new SpeechSynthesisUtterance(paragraph);
      
      // Apply voice settings
      utterance.rate = voiceSettings?.voiceRate || 0.75; // Slower for sleep
      utterance.pitch = voiceSettings?.voicePitch || 0.9; // Slightly deeper
      utterance.volume = (voiceSettings?.voiceVolume || 0.8) * 0.8; // Slightly quieter than the ambience
      
      // Select voice based on settings
      const voices = speechSynthesisRef.current.getVoices();
      
      let selectedVoice = null;
      
      if (!voiceSettings || voiceSettings.voiceType === 'female') {
        // Try to find a good female voice
        const femalePriorities = [
          'Google UK English Female',
          'Microsoft Zira',
          'Samantha',
          'Victoria',
          'Female' // Generic term that might match various voices
        ];
        
        // Try each priority voice until we find one
        for (const voiceName of femalePriorities) {
          const found = voices.find(v => v.name.includes(voiceName));
          if (found) {
            selectedVoice = found;
            break;
          }
        }
      } else if (voiceSettings.voiceType === 'male') {
        // Try to find a good male voice
        const malePriorities = [
          'Google UK English Male',
          'Microsoft David',
          'Daniel',
          'Alex',
          'Male' // Generic term that might match various voices
        ];
        
        // Try each priority voice until we find one
        for (const voiceName of malePriorities) {
          const found = voices.find(v => v.name.includes(voiceName));
          if (found) {
            selectedVoice = found;
            break;
          }
        }
      }
      
      // Use the selected voice or default
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Add a delay before starting (15s * index)
      setTimeout(() => {
        // Only speak if still playing
        if (isPlaying && !isMuted) {
          speechSynthesisRef.current.speak(utterance);
        }
      }, 15000 * index);
    });
  };
  
  // Toggle play/pause
  const togglePlayPause = () => {
    if (!currentExercise) return;
    
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.pause();
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      // Play/resume
      startSleepSound();
      
      if (currentExercise.id === 'sleep-story' && isStoryPlaying) {
        speechSynthesisRef.current.resume();
      }
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
    
    if (speechSynthesisRef.current) {
      if (!isMuted) {
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
    
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };
  
  // Set custom duration
  const handleDurationChange = (mins) => {
    setDuration(mins);
    setTimer(mins * 60);
    setShowDurationSelector(false);
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
    
    // Create session data
    const sessionData = {
      exerciseId: currentExercise.id,
      category: category.id,
      name: currentExercise.name,
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
      
      {/* Audio element */}
      <audio 
        ref={audioRef} 
        src={getSoundFile(currentExercise.id)} 
        loop 
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
              className="p-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg"
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
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-slate-800 p-3 rounded-lg shadow-lg max-w-[calc(100vw-2rem)]">
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
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-slate-800 p-3 rounded-lg shadow-lg max-w-[calc(100vw-2rem)]">
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

export default SleepSounds;