import React, { useState, useEffect, useRef } from 'react';
import { Leaf,X, Play, Pause, SkipForward, Volume2, VolumeX, Star, ArrowLeft, ArrowRight, Eye, Target, User, Zap } from 'lucide-react';
import { getVoiceSettings, speakText } from '../../utils/meditationStorage';

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
    };
  }, []);
  
  // Calculate total time when exercise changes
  useEffect(() => {
    if (!currentExercise) return;
    
    console.log('Calculating total time for:', currentExercise.id);
    
    // Calculate total meditation time
    const script = getGroundingScript(currentExercise.id);
    const totalSeconds = script.reduce((sum, step) => sum + step.duration, 0);
    setTotalTime(totalSeconds);
    
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
    
    setIsPlaying(!isPlaying);
    
    if (isPlaying) {
      // Pausing
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      // Resuming or starting
      if (currentStep === 0 && timer === 0) {
        startExercise();
      } else {
        // Resume existing session
        const script = getGroundingScript(currentExercise.id);
        
        if (timer === 0 && currentStep < script.length) {
          speakText(script[currentStep].text, isMuted, speechSynthesisRef);
        }
        
        // Resume elapsed time tracking
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
    } else {
      // Unmuting
      if (isPlaying && currentExercise) {
        // Speak current instruction
        const script = getGroundingScript(currentExercise.id);
        if (script.length > currentStep) {
          speakText(script[currentStep].text, false, speechSynthesisRef);
        }
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
          <button
            onClick={toggleMute}
            className="p-2 xs:p-3 text-white bg-slate-800/70 rounded-full hover:bg-slate-700/70 transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
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