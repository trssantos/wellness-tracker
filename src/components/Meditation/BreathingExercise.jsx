import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Play, Pause, SkipForward, Volume2, VolumeX, Star, Clock } from 'lucide-react';
import { getVoiceSettings } from '../../utils/meditationStorage';

const BreathingExercise = ({ 
  category, 
  selectedExercise = null, 
  onClose, 
  onComplete, 
  onToggleFavorite,
  favorites = [],
  isQuick = false
}) => {
  const [currentExercise, setCurrentExercise] = useState(selectedExercise || category.exercises[0]);
  const [activePhase, setActivePhase] = useState('intro'); // intro, inhale, hold, exhale, complete
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [instructions, setInstructions] = useState('');
  const [beforeFeeling, setBeforeFeeling] = useState(null);
  
  const audioRef = useRef(null);
  const circleRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  
  // Get exercise configuration based on exercise ID
  useEffect(() => {
    // Configure based on exercise ID
    const config = getExerciseConfig(currentExercise.id);
    
    // If it's a quick exercise, reduce the cycles
    if (isQuick && config) {
      config.cycles = 3;
    }
    
    // Set total time based on estimated duration or fixed duration
    setTotalTime(currentExercise.duration * 60); // Convert minutes to seconds
    
    // Show the before feelings dialog
    if (!beforeFeeling) {
      // Wait a moment before showing the dialog
      setTimeout(() => {
        document.getElementById('before-feeling-dialog').showModal();
      }, 500);
    }
  }, [currentExercise, isQuick]);
  
  // Speech synthesis setup
  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
    
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);
  
  // Get exercise configuration
  const getExerciseConfig = (exerciseId) => {
    // Default configuration
    const defaultConfig = {
      inhaleDuration: 4,
      holdDuration: 0,
      exhaleDuration: 4,
      cycles: 7,
      cycleBreak: 2,
      introText: "Find a comfortable position. We'll begin with a deep breath in."
    };
    
    // Specific exercise configurations
    const configs = {
      'box-breathing': {
        inhaleDuration: 4,
        holdDuration: 4,
        exhaleDuration: 4,
        holdAfterExhaleDuration: 4,
        cycles: 8,
        cycleBreak: 0,
        introText: "Box breathing: inhale for 4, hold for 4, exhale for 4, hold for 4."
      },
      '4-7-8-breathing': {
        inhaleDuration: 4,
        holdDuration: 7,
        exhaleDuration: 8,
        cycles: 6,
        cycleBreak: 2,
        introText: "4-7-8 breathing: inhale for 4, hold for 7, exhale for 8."
      },
      'deep-breathing': {
        inhaleDuration: 5,
        holdDuration: 2,
        exhaleDuration: 7,
        cycles: 7,
        cycleBreak: 0,
        introText: "Deep breathing: inhale deeply through your nose, filling your lungs completely."
      },
      'alternate-nostril': {
        inhaleDuration: 4,
        holdDuration: 4,
        exhaleDuration: 4,
        cycles: 10,
        cycleBreak: 0,
        introText: "Use your right thumb to close your right nostril. Inhale through your left nostril. Then close your left nostril with your finger and exhale through your right."
      },
      'one-minute': {
        inhaleDuration: 3,
        holdDuration: 0,
        exhaleDuration: 3,
        cycles: 5,
        cycleBreak: 0,
        introText: "A quick reset. Take a comfortable position and follow the breathing pattern."
      },
      'quick-breath': {
        inhaleDuration: 2,
        holdDuration: 1,
        exhaleDuration: 3,
        cycles: 6,
        cycleBreak: 0,
        introText: "Quick breaths to energize. Inhale quickly, hold briefly, then release completely."
      },
      'tension-release': {
        inhaleDuration: 4,
        holdDuration: 2,
        exhaleDuration: 6,
        cycles: 4,
        cycleBreak: 0,
        introText: "Inhale and tense your whole body. Hold the tension briefly, then exhale and release completely."
      },
      'visualize': {
        inhaleDuration: 3,
        holdDuration: 0,
        exhaleDuration: 3,
        cycles: 5,
        cycleBreak: 0,
        introText: "As you breathe, visualize a calm, peaceful place. See it clearly with each breath."
      }
    };
    
    return configs[exerciseId] || defaultConfig;
  };
  
  // Start the exercise
  const startExercise = () => {
    setIsPlaying(true);
    setActivePhase('intro');
    setCycleCount(0);
    setTimer(5); // 5 second intro
    
    // Speak the intro
    if (!isMuted) {
      speakText(getExerciseConfig(currentExercise.id).introText);
    }
    
    // Hide controls after a moment
    setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };
  
  // Text-to-speech function
  const speakText = (text) => {
    if (speechSynthesisRef.current && !isMuted) {
      speechSynthesisRef.current.cancel(); // Cancel any ongoing speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get user's voice settings
      const voiceSettings = getVoiceSettings();
      
      // Apply settings
      utterance.rate = voiceSettings.voiceRate;
      utterance.pitch = voiceSettings.voicePitch;
      utterance.volume = voiceSettings.voiceVolume;
      
      // Select voice based on settings
      const voices = speechSynthesisRef.current.getVoices();
      
      let selectedVoice = null;
      
      if (voiceSettings.voiceType === 'female') {
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
      
      // Add natural pauses between sentences for more realistic speech
      const sentences = text.split(/(?<=[.!?])\s+/);
      if (sentences.length > 1) {
        // Use SSML-like approach with small pauses between sentences
        text = sentences.join('. <break time="500ms"> ');
      }
      
      utterance.text = text;
      
      speechSynthesisRef.current.speak(utterance);
    }
  };
  
  // Play ambient sound
  const playAmbientSound = () => {
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(e => console.error("Couldn't play audio:", e));
    }
  };
  
  // Stop ambient sound
  const stopAmbientSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  
  // Main timer effect
  useEffect(() => {
    if (!isPlaying) return;
    
    const config = getExerciseConfig(currentExercise.id);
    let timerId;
    
    if (timer > 0) {
      timerId = setTimeout(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      // Move to next phase
      if (activePhase === 'intro') {
        setActivePhase('inhale');
        setTimer(config.inhaleDuration);
        speakText("Breathe in");
        playAmbientSound();
      } else if (activePhase === 'inhale') {
        if (config.holdDuration > 0) {
          setActivePhase('hold');
          setTimer(config.holdDuration);
          speakText("Hold");
        } else {
          setActivePhase('exhale');
          setTimer(config.exhaleDuration);
          speakText("Breathe out");
        }
      } else if (activePhase === 'hold') {
        setActivePhase('exhale');
        setTimer(config.exhaleDuration);
        speakText("Breathe out");
      } else if (activePhase === 'exhale') {
        if (config.holdAfterExhaleDuration > 0) {
          setActivePhase('holdAfterExhale');
          setTimer(config.holdAfterExhaleDuration);
          speakText("Hold");
        } else {
          // Check if we've completed a cycle
          const newCycleCount = cycleCount + 1;
          setCycleCount(newCycleCount);
          
          if (newCycleCount >= config.cycles) {
            // Exercise complete
            setActivePhase('complete');
            setIsPlaying(false);
            stopAmbientSound();
            speakText("Breathing exercise complete. Take a moment to notice how you feel.");
            
            // Show the controls again
            setShowControls(true);
            
            // Show the completion dialog after a moment
            setTimeout(() => {
              document.getElementById('after-feeling-dialog').showModal();
            }, 2000);
          } else {
            // Start next cycle
            if (config.cycleBreak > 0 && newCycleCount < config.cycles) {
              setActivePhase('break');
              setTimer(config.cycleBreak);
              speakText("Take a natural breath");
            } else {
              setActivePhase('inhale');
              setTimer(config.inhaleDuration);
              speakText("Breathe in");
            }
          }
        }
      } else if (activePhase === 'holdAfterExhale') {
        // Check if we've completed a cycle
        const newCycleCount = cycleCount + 1;
        setCycleCount(newCycleCount);
        
        if (newCycleCount >= config.cycles) {
          // Exercise complete
          setActivePhase('complete');
          setIsPlaying(false);
          stopAmbientSound();
          speakText("Breathing exercise complete. Take a moment to notice how you feel.");
          
          // Show the controls again
          setShowControls(true);
          
          // Show the completion dialog after a moment
          setTimeout(() => {
            document.getElementById('after-feeling-dialog').showModal();
          }, 2000);
        } else {
          // Start next cycle
          setActivePhase('inhale');
          setTimer(config.inhaleDuration);
          speakText("Breathe in");
        }
      } else if (activePhase === 'break') {
        setActivePhase('inhale');
        setTimer(config.inhaleDuration);
        speakText("Breathe in");
      }
    }
    
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isPlaying, timer, activePhase, cycleCount, currentExercise.id, isMuted]);
  
  // Animation effect for the breathing circle
  useEffect(() => {
    if (!circleRef.current) return;
    
    // Reset animation
    circleRef.current.style.animation = 'none';
    
    // Get exercise config
    const config = getExerciseConfig(currentExercise.id);
    
    // Set animation based on active phase
    if (activePhase === 'inhale') {
      circleRef.current.style.animation = `breathe-in ${config.inhaleDuration}s ease-in-out forwards`;
    } else if (activePhase === 'hold' || activePhase === 'holdAfterExhale') {
      circleRef.current.style.animation = 'none';
    } else if (activePhase === 'exhale') {
      circleRef.current.style.animation = `breathe-out ${config.exhaleDuration}s ease-in-out forwards`;
    } else if (activePhase === 'intro' || activePhase === 'break') {
      circleRef.current.style.animation = `idle-breathing 3s infinite alternate ease-in-out`;
    } else if (activePhase === 'complete') {
      circleRef.current.style.animation = `idle-breathing 4s infinite alternate ease-in-out`;
    }
  }, [activePhase, currentExercise.id]);
  
  // Toggle play/pause
  const togglePlayPause = () => {
    if (activePhase === 'complete') {
      // Restart the exercise
      startExercise();
    } else {
      setIsPlaying(!isPlaying);
      
      if (isPlaying) {
        // Pausing
        if (speechSynthesisRef.current) {
          speechSynthesisRef.current.cancel();
        }
        stopAmbientSound();
      } else {
        // Resuming
        playAmbientSound();
      }
    }
  };
  
  // Skip to next phase
  const skipToNextPhase = () => {
    setTimer(0);
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (!isMuted) {
      // Muting
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      stopAmbientSound();
    } else {
      // Unmuting
      if (isPlaying) {
        playAmbientSound();
      }
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
    // Close dialog
    document.getElementById('after-feeling-dialog').close();
    
    // Create session data
    const sessionData = {
      exerciseId: currentExercise.id,
      category: category.id,
      name: currentExercise.name,
      duration: currentExercise.duration,
      cycles: cycleCount,
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
    document.getElementById('before-feeling-dialog').close();
  };
  
  // Get phase name for display
  const getPhaseDisplayName = () => {
    switch (activePhase) {
      case 'intro': return 'Prepare';
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'holdAfterExhale': return 'Hold';
      case 'break': return 'Rest';
      case 'complete': return 'Complete';
      default: return '';
    }
  };
  
  // Get display time for totalTime
  const formatTimeDisplay = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get the favorite status
  const isFavorite = favorites.includes(currentExercise.id);
  
  // Get dynamic breathing instructions based on active phase
  useEffect(() => {
    const config = getExerciseConfig(currentExercise.id);
    
    if (activePhase === 'intro') {
      setInstructions('Prepare for the exercise...');
    } else if (activePhase === 'inhale') {
      setInstructions('Inhale slowly and deeply');
    } else if (activePhase === 'hold') {
      setInstructions('Hold your breath');
    } else if (activePhase === 'exhale') {
      setInstructions('Exhale slowly and completely');
    } else if (activePhase === 'holdAfterExhale') {
      setInstructions('Hold after exhale');
    } else if (activePhase === 'break') {
      setInstructions('Take a natural breath');
    } else if (activePhase === 'complete') {
      setInstructions('Exercise complete');
    }
  }, [activePhase, currentExercise.id]);
  
  return (
    <div 
      className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      {/* Audio element for ambient sound */}
      <audio 
        ref={audioRef} 
        src="/ambient-sounds/calm-meditation.mp3" 
        loop 
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
            <p className="text-slate-300 text-sm">
              {category.title} • Cycle {cycleCount}/{getExerciseConfig(currentExercise.id).cycles}
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
      
      {/* Main breathing animation */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative mb-4">
          <div 
            ref={circleRef}
            className="w-64 h-64 bg-purple-500/20 rounded-full flex items-center justify-center"
          >
            <div className="w-52 h-52 bg-purple-500/30 rounded-full flex items-center justify-center pulse-animation">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                <Heart size={48} className="text-white" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Phase indicator and timer */}
        <div className="text-center">
          <h3 className="text-2xl font-medium text-white mb-2">{getPhaseDisplayName()}</h3>
          <p className="text-4xl font-bold text-white mb-4">{timer}</p>
          <p className="text-lg text-slate-300">{instructions}</p>
        </div>
      </div>
      
      {/* Bottom controls */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex justify-center items-center gap-8">
          <button
            onClick={toggleMute}
            className="p-3 text-white bg-slate-800/70 rounded-full hover:bg-slate-700/70 transition-colors"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          
          <button
            onClick={togglePlayPause}
            className="p-6 text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full hover:from-purple-600 hover:to-indigo-600 transition-colors"
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </button>
          
          <button
            onClick={skipToNextPhase}
            className="p-3 text-white bg-slate-800/70 rounded-full hover:bg-slate-700/70 transition-colors"
            disabled={activePhase === 'complete'}
          >
            <SkipForward size={24} className={activePhase === 'complete' ? 'opacity-50' : ''} />
          </button>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes breathe-in {
          from {
            transform: scale(0.8);
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.2);
          }
          to {
            transform: scale(1.1);
            box-shadow: 0 0 30px 10px rgba(147, 51, 234, 0.4);
          }
        }
        
        @keyframes breathe-out {
          from {
            transform: scale(1.1);
            box-shadow: 0 0 30px 10px rgba(147, 51, 234, 0.4);
          }
          to {
            transform: scale(0.8);
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.2);
          }
        }
        
        @keyframes idle-breathing {
          from {
            transform: scale(0.95);
            box-shadow: 0 0 15px 5px rgba(147, 51, 234, 0.2);
          }
          to {
            transform: scale(1);
            box-shadow: 0 0 20px 7px rgba(147, 51, 234, 0.3);
          }
        }
        
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(147, 51, 234, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0);
          }
        }
      `}</style>
      
      {/* Before feeling dialog */}
      <dialog 
        id="before-feeling-dialog" 
        className="bg-white dark:bg-slate-800 rounded-xl p-6 w-80 max-w-full shadow-xl"
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
        className="bg-white dark:bg-slate-800 rounded-xl p-6 w-80 max-w-full shadow-xl"
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

export default BreathingExercise;