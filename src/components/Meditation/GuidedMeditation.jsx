import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, SkipForward, Volume2, VolumeX, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { getVoiceSettings } from '../../utils/meditationStorage';

const GuidedMeditation = ({ 
  category, 
  selectedExercise = null, 
  onClose, 
  onComplete, 
  onToggleFavorite,
  favorites = []
}) => {
  const [currentExercise, setCurrentExercise] = useState(selectedExercise || category.exercises[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [beforeFeeling, setBeforeFeeling] = useState(null);
  
  const audioRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Get meditation script based on exercise ID
  const getMeditationScript = (exerciseId) => {
    const scripts = {
      'body-scan': [
        { text: "Find a comfortable position, either sitting or lying down. Allow your body to relax and settle.", duration: 15 },
        { text: "Take a few deep breaths. Inhale through your nose, exhale through your mouth.", duration: 15 },
        { text: "Bring your awareness to your feet. Notice any sensations - warmth, coolness, tingling.", duration: 15 },
        { text: "Move your awareness up to your calves and knees. Just notice without judgment.", duration: 15 },
        { text: "Continue upward to your thighs and hips. Feel the weight of your body against the surface below.", duration: 15 },
        { text: "Notice your lower back and abdomen. Feel the gentle movement with each breath.", duration: 15 },
        { text: "Bring awareness to your chest and upper back. Notice the expansion and contraction as you breathe.", duration: 15 },
        { text: "Feel your shoulders, allowing any tension to dissolve with each breath.", duration: 15 },
        { text: "Notice your arms and hands. Are they heavy? Light? Warm? Cool?", duration: 15 },
        { text: "Bring awareness to your neck and throat. Gently release any tension here.", duration: 15 },
        { text: "Now focus on your face - jaw, cheeks, eyes, forehead. Let all the tiny muscles relax.", duration: 15 },
        { text: "Finally, bring awareness to your whole body at once. Feel its presence completely.", duration: 20 },
        { text: "Rest in this awareness for a few moments.", duration: 20 },
        { text: "When you're ready, slowly begin to deepen your breath and gently move your fingers and toes.", duration: 15 },
        { text: "Take your time to slowly open your eyes, carrying this awareness with you.", duration: 15 }
      ],
      'loving-kindness': [
        { text: "Sit comfortably, allowing your body to relax while keeping your back straight.", duration: 15 },
        { text: "Take a few deep breaths, feeling your chest and abdomen expand and contract.", duration: 15 },
        { text: "Bring to mind someone you love deeply - a child, friend, partner, or pet.", duration: 15 },
        { text: "Picture them clearly and feel the warmth of your affection for them.", duration: 15 },
        { text: "Silently repeat: May you be happy. May you be healthy. May you be safe. May you live with ease.", duration: 20 },
        { text: "Now bring to mind yourself. Picture yourself with kindness and compassion.", duration: 15 },
        { text: "Repeat: May I be happy. May I be healthy. May I be safe. May I live with ease.", duration: 20 },
        { text: "Next, think of someone you feel neutral about - perhaps a neighbor or colleague you don't know well.", duration: 15 },
        { text: "Extend the same wishes: May you be happy. May you be healthy. May you be safe. May you live with ease.", duration: 20 },
        { text: "Now, if you're ready, think of someone difficult in your life. Start with someone mildly difficult.", duration: 15 },
        { text: "Remember they too wish for happiness. May you be happy. May you be healthy. May you be safe. May you live with ease.", duration: 20 },
        { text: "Finally, extend these wishes to all beings everywhere: May all beings be happy. May all beings be healthy. May all beings be safe. May all live with ease.", duration: 20 },
        { text: "Feel your heart opening to send kindness in all directions.", duration: 15 },
        { text: "Rest in the warmth of loving kindness for a few more breaths.", duration: 20 },
        { text: "When you're ready, gently bring your awareness back to your surroundings.", duration: 15 }
      ],
      'mindfulness': [
        { text: "Find a comfortable seated position where you can be alert yet relaxed.", duration: 15 },
        { text: "Allow your eyes to close gently or maintain a soft gaze.", duration: 15 },
        { text: "Take a few deep breaths to settle into the present moment.", duration: 15 },
        { text: "Now let your breath return to its natural rhythm - not forcing or controlling it.", duration: 15 },
        { text: "Notice the sensation of breath at the nostrils, chest, or abdomen - wherever it's most obvious to you.", duration: 20 },
        { text: "Simply observe the in-breath... and the out-breath.", duration: 15 },
        { text: "When you notice your mind has wandered, gently acknowledge it without judgment.", duration: 15 },
        { text: "Then return your attention to the breath. This is the practice of mindfulness.", duration: 15 },
        { text: "You might notice sounds around you. Just acknowledge them and return to the breath.", duration: 15 },
        { text: "You might notice physical sensations. Just acknowledge them and return to the breath.", duration: 15 },
        { text: "You might notice emotions or thoughts arising. Just acknowledge them and return to the breath.", duration: 15 },
        { text: "Each time you notice wandering and return to breath, you're strengthening mindfulness.", duration: 15 },
        { text: "Continue observing your breath, moment by moment.", duration: 30 },
        { text: "Notice the beginning, middle, and end of each breath.", duration: 15 },
        { text: "Remember that thoughts will come and go. Your task is simply to notice and return to the breath.", duration: 15 },
        { text: "Take a few more breaths with this awareness.", duration: 15 },
        { text: "Gradually widen your attention to include your whole body.", duration: 15 },
        { text: "When you're ready, slowly open your eyes or lift your gaze, carrying this mindfulness with you.", duration: 15 }
      ],
      'gratitude': [
        { text: "Begin by taking a comfortable position. Relax your body and quiet your mind.", duration: 15 },
        { text: "Take a few deep breaths, allowing yourself to settle into the present moment.", duration: 15 },
        { text: "Bring to mind something simple that you're grateful for today.", duration: 15 },
        { text: "Perhaps it's the warmth of the sun, a comfortable bed, or a friendly smile you received.", duration: 15 },
        { text: "Notice how it feels in your body when you hold this gratitude in your awareness.", duration: 15 },
        { text: "Now recall a person in your life who has supported you or shown you kindness.", duration: 15 },
        { text: "It could be a family member, friend, teacher, or even a stranger who helped you.", duration: 15 },
        { text: "Take a moment to fully appreciate their presence in your life.", duration: 15 },
        { text: "Feel the sense of connection this brings.", duration: 15 },
        { text: "Now reflect on an aspect of your body or health that you're grateful for.", duration: 15 },
        { text: "Perhaps it's the ability to see, hear, walk, or simply breathe without effort.", duration: 15 },
        { text: "Take a moment to truly appreciate this gift that supports you every day.", duration: 15 },
        { text: "Now bring to mind a challenge you've faced that ultimately taught you something valuable.", duration: 15 },
        { text: "Recognize how this difficulty helped you grow or develop a strength you now possess.", duration: 15 },
        { text: "Finally, consider the wider world - nature, community, or culture - and something from it that enriches your life.", duration: 15 },
        { text: "It might be music, art, forests, oceans, or the kindness of strangers.", duration: 15 },
        { text: "Take a few moments to bask in the feeling of gratitude for all these aspects of life.", duration: 20 },
        { text: "Notice how gratitude feels in your body - perhaps a warmth, lightness, or openness.", duration: 15 },
        { text: "When you're ready, gently return your awareness to the present moment, carrying this gratitude with you.", duration: 15 }
      ]
    };
    
    return scripts[exerciseId] || [];
  };
  
  // Set up on mount
  useEffect(() => {
    // Set up speech synthesis
    speechSynthesisRef.current = window.speechSynthesis;
    
    // Calculate total meditation time
    const script = getMeditationScript(currentExercise.id);
    const totalSeconds = script.reduce((sum, step) => sum + step.duration, 0);
    setTotalTime(totalSeconds);
    
    // Show the before feelings dialog
    if (!beforeFeeling) {
      // Wait a moment before showing the dialog
      setTimeout(() => {
        document.getElementById('before-feeling-dialog').showModal();
      }, 500);
    }
    
    // Clean up on unmount
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
  }, [currentExercise]);
  
  // Start the meditation session
  const startMeditation = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    
    // Get the first step
    const script = getMeditationScript(currentExercise.id);
    setTimer(script[0].duration);
    
    // Speak the first instruction
    if (!isMuted) {
      speakText(script[0].text);
    }
    
    // Play ambient background sound
    playAmbientSound();
    
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
  
  // Main timer effect
  useEffect(() => {
    if (!isPlaying) return;
    
    let timerId;
    
    if (timer > 0) {
      timerId = setTimeout(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      // Move to next step
      const script = getMeditationScript(currentExercise.id);
      const nextStep = currentStep + 1;
      
      if (nextStep < script.length) {
        // Move to next step
        setCurrentStep(nextStep);
        setTimer(script[nextStep].duration);
        
        // Speak the next instruction
        if (!isMuted) {
          speakText(script[nextStep].text);
        }
      } else {
        // Meditation complete
        setIsPlaying(false);
        stopAmbientSound();
        
        if (speechSynthesisRef.current) {
          speechSynthesisRef.current.cancel();
          speakText("This meditation is complete. Take a moment to notice how you feel.");
        }
        
        // Stop elapsed time tracking
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        // Show the controls again
        setShowControls(true);
        
        // Show the completion dialog after a moment
        setTimeout(() => {
          document.getElementById('after-feeling-dialog').showModal();
        }, 2000);
      }
    }
    
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isPlaying, timer, currentStep, isMuted]);
  
  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    if (isPlaying) {
      // Pausing
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      stopAmbientSound();
    } else {
      // Resuming or starting
      if (currentStep === 0 && timer === 0) {
        startMeditation();
      } else {
        // Resume existing session
        const script = getMeditationScript(currentExercise.id);
        
        if (timer === 0 && currentStep < script.length) {
          speakText(script[currentStep].text);
        }
        
        // Resume elapsed time tracking
        intervalRef.current = setInterval(() => {
          setElapsedTime(prev => prev + 1);
        }, 1000);
        
        playAmbientSound();
      }
    }
  };
  
  // Skip to next step
  const skipToNextStep = () => {
    if (!isPlaying) return;
    
    // Cancel current speech
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    
    // Move to next step
    const script = getMeditationScript(currentExercise.id);
    const nextStep = currentStep + 1;
    
    if (nextStep < script.length) {
      setCurrentStep(nextStep);
      setTimer(script[nextStep].duration);
      speakText(script[nextStep].text);
    } else {
      // End of meditation
      setCurrentStep(script.length - 1);
      setTimer(0);
    }
  };
  
  // Skip to previous step
  const skipToPreviousStep = () => {
    if (!isPlaying || currentStep === 0) return;
    
    // Cancel current speech
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    
    // Move to previous step
    const script = getMeditationScript(currentExercise.id);
    const prevStep = currentStep - 1;
    
    setCurrentStep(prevStep);
    setTimer(script[prevStep].duration);
    speakText(script[prevStep].text);
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
        // Speak current instruction
        const script = getMeditationScript(currentExercise.id);
        speakText(script[currentStep].text);
        
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
    document.getElementById('before-feeling-dialog').close();
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
    const script = getMeditationScript(currentExercise.id);
    return currentStep < script.length ? script[currentStep].text : "Meditation complete";
  };
  
  // Get the favorite status
  const isFavorite = favorites.includes(currentExercise.id);
  
  return (
    <div 
      className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      {/* Audio element for ambient sound */}
      <audio 
        ref={audioRef} 
        src="/ambient-sounds/meditation-music.mp3" 
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
              {category.title} • {formatTime(elapsedTime)} / {formatTime(totalTime)}
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
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Instruction text */}
        <div className="bg-slate-800/50 rounded-xl p-6 w-full max-w-2xl mb-8">
          <p className="text-white text-xl font-light leading-relaxed text-center">
            {isPlaying ? getCurrentInstructionText() : "Press play to begin the guided meditation."}
          </p>
        </div>
        
        {/* Breathing animation */}
        {isPlaying && (
          <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mb-8 pulse-animation">
            <div className="w-16 h-16 bg-indigo-500/40 rounded-full"></div>
          </div>
        )}
      </div>
      
      {/* Bottom controls */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex justify-center items-center gap-6">
          <button
            onClick={toggleMute}
            className="p-3 text-white bg-slate-800/70 rounded-full hover:bg-slate-700/70 transition-colors"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          
          <button
            onClick={skipToPreviousStep}
            className={`p-3 text-white bg-slate-800/70 rounded-full hover:bg-slate-700/70 transition-colors ${
              !isPlaying || currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!isPlaying || currentStep === 0}
          >
            <ArrowLeft size={24} />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="p-6 text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full hover:from-purple-600 hover:to-indigo-600 transition-colors"
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </button>
          
          <button
            onClick={skipToNextStep}
            className={`p-3 text-white bg-slate-800/70 rounded-full hover:bg-slate-700/70 transition-colors ${
              !isPlaying || currentStep >= getMeditationScript(currentExercise.id).length - 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!isPlaying || currentStep >= getMeditationScript(currentExercise.id).length - 1}
          >
            <ArrowRight size={24} />
          </button>
          
          <button
            onClick={skipToNextStep}
            className={`p-3 text-white bg-slate-800/70 rounded-full hover:bg-slate-700/70 transition-colors ${
              !isPlaying ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!isPlaying}
          >
            <SkipForward size={24} />
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

export default GuidedMeditation;