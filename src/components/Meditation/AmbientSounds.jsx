import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Star, Timer, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const AmbientSounds = ({ 
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
  const [duration, setDuration] = useState(30); // Default 30 minutes
  const [timer, setTimer] = useState(0);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [showDurationSelector, setShowDurationSelector] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [beforeFeeling, setBeforeFeeling] = useState(null);
  
  const audioRef = useRef(null);
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
  
  // Get sound file path based on exercise ID
  const getSoundFile = (exerciseId) => {
    if (!exerciseId) {
      console.error('No exercise ID provided to getSoundFile');
      return '/ambient-sounds/rain.mp3';
    }
    
    console.log('Getting sound file for:', exerciseId);
    
    // Map exercise IDs to sound files
    const soundMap = {
      'rain': '/ambient-sounds/rain.mp3',
      'waves': '/ambient-sounds/ocean-waves.mp3',
      'white-noise': '/ambient-sounds/white-noise.mp3',
      'cafe': '/ambient-sounds/cafe-ambience.mp3'
    };
    
    return soundMap[exerciseId] || '/ambient-sounds/rain.mp3';
  };
  
  // Background images for visualization
  const getBackgroundImage = (exerciseId) => {
    if (!exerciseId) return '/ambient-backgrounds/rain.jpg';
    
    const imageMap = {
      'rain': '/ambient-backgrounds/rain.jpg',
      'waves': '/ambient-backgrounds/ocean.jpg',
      'white-noise': '/ambient-backgrounds/white-noise.jpg',
      'cafe': '/ambient-backgrounds/cafe.jpg'
    };
    
    return imageMap[exerciseId] || '/ambient-backgrounds/rain.jpg';
  };
  
  // Set up on mount
  useEffect(() => {
    // Load audio file when exercise changes
    if (currentExercise && audioRef.current) {
      const soundFile = getSoundFile(currentExercise.id);
      console.log('Loading sound file:', soundFile);
      audioRef.current.src = soundFile;
      audioRef.current.load();
    }
    
    // Initialize timer based on selected duration
    setTimer(duration * 60); // Convert minutes to seconds
    
    // Show the before feelings dialog
    if (!beforeFeeling && currentExercise) {
      // Wait a moment before showing the dialog
      setTimeout(() => {
        const dialog = document.getElementById('before-feeling-dialog');
        if (dialog) dialog.showModal();
      }, 500);
    }
    
    return () => {
      // Clean up
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentExercise, duration, beforeFeeling]);
  
  // Start the ambient sound
  const startAmbientSound = () => {
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
  
  // Toggle play/pause
  const togglePlayPause = () => {
    if (!currentExercise) return;
    
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      // Play/resume
      startAmbientSound();
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
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
  
  // Loading state
  if (!currentExercise) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="text-white">Loading exercise...</div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 overflow-y-auto">
      {/* Background visualization */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
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
              Ambient Sound
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
            {isPlaying ? 'Playing' : 'Paused'} • {formatTime(elapsedTime)} elapsed
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md mb-12">
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="space-y-6">
          {/* Play/Pause button */}
          <div className="flex justify-center">
            <button
              onClick={togglePlayPause}
              className="p-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg"
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
                    {[5, 10, 15, 30, 45, 60].map(mins => (
                      <button
                        key={mins}
                        onClick={() => handleDurationChange(mins)}
                        className={`w-full px-4 py-2 rounded-lg text-sm transition-colors ${
                          duration === mins 
                            ? 'bg-amber-500 text-white' 
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

export default AmbientSounds;