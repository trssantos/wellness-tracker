import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, ArrowLeft, X, Clock, Droplet, 
         Volume2, VolumeX, Rewind, ChevronUp, Music, Zap,
         Flag, CheckCircle, Minimize, Maximize } from 'lucide-react';
import ExerciseView from './ExerciseView';
import RestPeriod from './RestPeriod';
import WaterBreakReminder from './WaterBreakReminder';
import WorkoutSummary from './WorkoutSummary';
import RetroTapePlayer from './RetroTapePlayer';
import { getWorkoutById, logWorkout } from '../../utils/workoutUtils';

const WorkoutPlayer = ({ workoutId, date, onComplete, onClose }) => {
  // Main workout player state
  const [workout, setWorkout] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentState, setCurrentState] = useState('ready'); // ready, exercise, rest, waterBreak, summary
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);  // Changed from timeRemaining to timeElapsed
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [waterBreaks, setWaterBreaks] = useState([]);
  const [nextWaterBreak, setNextWaterBreak] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [notes, setNotes] = useState('');

  const [achievements, setAchievements] = useState([]);
const [showAchievement, setShowAchievement] = useState(false);
const [currentAchievement, setCurrentAchievement] = useState(null);

  
  // Set tracking
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [setsCompleted, setSetsCompleted] = useState(0);
  
  // UI states
  const [activeView, setActiveView] = useState('workout'); // 'workout' or 'cassette'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const playerRef = useRef(null);
  
  // Refs for timer
  const timerRef = useRef(null);
  
  // Sound effects - using direct web URLs
  const startSound = useRef(new Audio('https://freesound.org/data/previews/476/476177_7724198-lq.mp3'));
  const completeSound = useRef(new Audio('https://freesound.org/data/previews/131/131660_2398403-lq.mp3'));
  const waterBreakSound = useRef(new Audio('https://freesound.org/data/previews/341/341695_5858296-lq.mp3'));
  const clickSound = useRef(new Audio('https://freesound.org/data/previews/573/573588_13006337-lq.mp3'));
  
  const setCompleteSound = useRef(new Audio('https://freesound.org/data/previews/413/413749_4284968-lq.mp3')); // Ding sound
  const exerciseCompleteSound = useRef(new Audio('https://freesound.org/data/previews/270/270402_5123851-lq.mp3')); // Triumph sound
  const motivationSound = useRef(new Audio('https://freesound.org/data/previews/448/448268_7343324-lq.mp3')); // "You can do it!"
  

  // Exercise-specific state
  const [currentExercise, setCurrentExercise] = useState(null);
  const [currentSets, setCurrentSets] = useState(3);
  const [currentReps, setCurrentReps] = useState(10);
  const [currentWeight, setCurrentWeight] = useState('');

  // Load workout on mount
  useEffect(() => {
    if (workoutId) {
      const workoutData = getWorkoutById(workoutId);
      console.log("Loaded workout:", workoutData);
      
      if (workoutData) {
        setWorkout(workoutData);
        
        // Initialize completed exercises array
        setCompletedExercises(
          workoutData.exercises.map(exercise => ({
            ...exercise,
            completed: false,
            actualSets: 0,
            actualReps: 0,
            actualWeight: exercise.weight || '',
            timeSpent: 0
          }))
        );
        
        // Set up water breaks
        if (workoutData.waterBreaks && workoutData.waterBreaks.length > 0) {
          setWaterBreaks(workoutData.waterBreaks);
          setNextWaterBreak(workoutData.waterBreaks[0]);
        } else {
          // Default water breaks at 15 and 30 minutes
          const defaultBreaks = [15, 30];
          setWaterBreaks(defaultBreaks);
          setNextWaterBreak(defaultBreaks[0]);
        }
        
        // Initialize first exercise data if available
        if (workoutData.exercises && workoutData.exercises.length > 0) {
          setCurrentExercise(workoutData.exercises[0]);
          const firstExercise = workoutData.exercises[0];
          setCurrentSets(firstExercise.sets || 3);
          setCurrentReps(firstExercise.reps || 10);
          setCurrentWeight(firstExercise.weight || '');
        }
      }
    }
    
    // Preload sound files
    startSound.current.preload = 'auto';
    completeSound.current.preload = 'auto';
    waterBreakSound.current.preload = 'auto';
    clickSound.current.preload = 'auto';
    setCompleteSound.current.preload = 'auto';
exerciseCompleteSound.current.preload = 'auto';
motivationSound.current.preload = 'auto';
    
    // Set up touch event handlers for swipe gestures
    let touchStartX = 0;
    
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const swipeDistance = touchEndX - touchStartX;
      
      // If swipe distance is significant (more than 50px)
      if (Math.abs(swipeDistance) > 50) {
        if (swipeDistance > 0) {
          // Swipe right
          setActiveView('workout');
        } else {
          // Swipe left
          setActiveView('cassette');
        }
      }
    };
    
    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Clean up timers and event listeners on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [workoutId]);
  
  // Update current exercise when exercise index changes
  useEffect(() => {
    if (workout && workout.exercises && workout.exercises.length > 0) {
      if (currentExerciseIndex < workout.exercises.length) {
        console.log("Setting current exercise to:", workout.exercises[currentExerciseIndex]);
        setCurrentExercise(workout.exercises[currentExerciseIndex]);
        const exercise = workout.exercises[currentExerciseIndex];
        setCurrentSets(parseInt(exercise.sets) || 3);
        setCurrentReps(parseInt(exercise.reps) || 10);
        setCurrentWeight(exercise.weight || '');
        
        // Reset set tracking for new exercise
        setCurrentSetNumber(1);
        setSetsCompleted(0);
      }
    }
  }, [currentExerciseIndex, workout]);

  // Call this function in useEffect to check achievements periodically
useEffect(() => {
    // Check for achievements every minute or when exercise changes
    const achievementCheckInterval = setInterval(() => {
      if (isPlaying && currentState !== 'ready' && currentState !== 'summary') {
        checkAchievements();
      }
    }, 60000);
    
    return () => clearInterval(achievementCheckInterval);
  }, [isPlaying, currentState]);
  
  // Also check achievements when completing an exercise
  useEffect(() => {
    if (currentExerciseIndex > 0) {
      checkAchievements();
    }
  }, [currentExerciseIndex]);
  

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Play sound effect
  const playSound = (sound) => {
    if (!isMuted && sound.current) {
      sound.current.currentTime = 0;
      sound.current.play().catch(err => console.log('Audio error:', err));
    }
  };

  // Create a function to check for and grant achievements
const checkAchievements = () => {
    const newAchievements = [];
    
    // Check various achievement conditions
    
    // Achievement: First Set - Triggered when the first set is completed
    if (setsCompleted === 1 && !achievements.some(a => a.id === 'first_set')) {
      newAchievements.push({
        id: 'first_set',
        title: 'First Step',
        description: 'Completed your first set of the workout',
        icon: '🎯'
      });
    }
    
    // Achievement: Half Way There - Triggered when half of exercises are completed
    if (currentExerciseIndex === Math.floor(workout.exercises.length / 2) && 
        !achievements.some(a => a.id === 'half_way')) {
      newAchievements.push({
        id: 'half_way',
        title: 'Half Way There',
        description: 'Completed half of your workout exercises',
        icon: '🔥'
      });
    }
    
    // Achievement: 10 Minute Milestone - Triggered after 10 minutes of workout
    if (Math.floor(totalTimeElapsed / 60) === 10 && 
        !achievements.some(a => a.id === 'ten_minutes')) {
      newAchievements.push({
        id: 'ten_minutes',
        title: 'Endurance Builder',
        description: '10 minutes of active workout completed',
        icon: '⏱️'
      });
    }
    
    // If we have new achievements, update state and show the first one
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      setCurrentAchievement(newAchievements[0]);
      setShowAchievement(true);
      
      // Hide after a few seconds
      setTimeout(() => {
        setShowAchievement(false);
      }, 3000);
      
      // Play achievement sound
      playSound(exerciseCompleteSound);
      triggerHapticFeedback('medium');
    }
  };
  

  // Start the workout
  const startWorkout = () => {
    console.log("Starting workout...");
    if (!workout) return;
    
    setWorkoutStartTime(Date.now());
    setCurrentState('exercise');
    setIsPlaying(true);
    setTimeElapsed(0);  // Start at 0 for count-up timer
    
    // Play start sound if not muted
    playSound(startSound);
    
    // Start the timer
    startTimer();
  };

  // Start the timer - now counts up instead of down
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
      setTotalTimeElapsed(prev => prev + 1);
      
      // Check for water break
      if (nextWaterBreak && Math.floor(totalTimeElapsed / 60) >= nextWaterBreak) {
        triggerWaterBreak();
      }
    }, 1000);
  };

  // Complete current set
  const completeSet = () => {
    // Play the set complete sound instead of click sound
    playSound(setCompleteSound);
    triggerHapticFeedback('light');
    
    // Show set completion effect
    showSetCompletionEffect();
    
    // Check if we've completed all sets
    if (currentSetNumber >= currentSets) {
      // All sets complete, mark exercise as done
      completeExercise();
    } else {
      // Move to next set
      setCurrentSetNumber(prev => prev + 1);
      setSetsCompleted(prev => prev + 1);
      setTimeElapsed(0); // Reset timer for new set
    }

    // Check for achievements after completing sets
  setTimeout(() => {
    checkAchievements();
  }, 500);
  };

  const showSetCompletionEffect = () => {
    // Create the effect element
    const effectContainer = document.createElement('div');
    effectContainer.className = 'set-completion-effect-wplayer';
    
    // Create the inner content
    const innerContent = document.createElement('div');
    innerContent.className = 'effect-content-wplayer';
    
    // Create main text
    const completionText = document.createElement('div');
    completionText.className = 'completion-text-wplayer';
    completionText.textContent = 'SET COMPLETE!';
    
    // Create energy burst element
    const energyBurst = document.createElement('div');
    energyBurst.className = 'energy-burst-wplayer';
    
    // Append elements
    innerContent.appendChild(completionText);
    innerContent.appendChild(energyBurst);
    effectContainer.appendChild(innerContent);
    
    // Add to the DOM - find the workout container
    const container = playerRef.current;
    if (container) {
      container.appendChild(effectContainer);
      
      // Remove after animation completes
      setTimeout(() => {
        if (container.contains(effectContainer)) {
          container.removeChild(effectContainer);
        }
      }, 1500);
    }
  };
  

  // Complete the current exercise
  const completeExercise = () => {
    // Mark current exercise as completed
    markCurrentExerciseCompleted();
    
    // Show exercise completion effect
    showExerciseCompletionEffect();

    triggerHapticFeedback('strong');
    
    // Move to rest period
    setCurrentState('rest');
    setTimeElapsed(0); // Reset timer for rest period
    
    // Play exercise complete sound instead of the regular complete sound
    //playSound(exerciseCompleteSound);
    
    // Play a random motivational sound 50% of the time
    if (Math.random() > 0.5) {
      setTimeout(() => {
        playSound(motivationSound);
      }, 1000);
    }
  };

  const triggerHapticFeedback = (intensity = 'medium') => {
    if (!window.navigator.vibrate) return;
    
    switch(intensity) {
      case 'light':
        window.navigator.vibrate(50);
        break;
      case 'medium':
        window.navigator.vibrate(100);
        break;
      case 'strong':
        window.navigator.vibrate([100, 50, 100]);
        break;
      default:
        window.navigator.vibrate(100);
    }
  };
  
  // Add this function to create the exercise completion effect
  const showExerciseCompletionEffect = () => {
    // Create the effect container
    const effectContainer = document.createElement('div');
    effectContainer.className = 'exercise-completion-effect-wplayer';
    
    // Create the inner content
    const innerContent = document.createElement('div');
    innerContent.className = 'effect-content-wplayer';
    
    // Create main text
    const completionText = document.createElement('div');
    completionText.className = 'completion-text-wplayer';
    completionText.textContent = 'EXERCISE COMPLETE!';
    
    // Create motivational text
    const motivationalPhrases = [
      "Great work! Keep pushing!",
      "You're crushing it!",
      "Beast mode activated!",
      "One step closer to your goals!",
      "That's how champions train!",
      "Feeling stronger already!",
      "No pain, no gain!",
      "You've got this!"
    ];
    
    const motivationalText = document.createElement('div');
    motivationalText.className = 'motivational-text-wplayer';
    motivationalText.textContent = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
    
    // Create confetti bursts
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-wplayer';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
      effectContainer.appendChild(confetti);
    }
    
    // Append elements
    innerContent.appendChild(completionText);
    innerContent.appendChild(motivationalText);
    effectContainer.appendChild(innerContent);
    
    // Add to the DOM
    const container = playerRef.current;
    if (container) {
      container.appendChild(effectContainer);
      
      // Remove after animation completes
      setTimeout(() => {
        if (container.contains(effectContainer)) {
          container.removeChild(effectContainer);
        }
      }, 2500);
    }
  };

  // Handle rest period completion
  const completeRest = () => {
    // Move to next exercise
    moveToNextExercise();
  };

  // Mark current exercise as completed
  const markCurrentExerciseCompleted = () => {
    setCompletedExercises(prev => {
      const updated = [...prev];
      updated[currentExerciseIndex] = {
        ...updated[currentExerciseIndex],
        completed: true,
        actualSets: setsCompleted + 1, // +1 for current set
        actualReps: currentReps,
        actualWeight: currentWeight,
        timeSpent: timeElapsed
      };
      return updated;
    });
  };

  // Move to next exercise
  const moveToNextExercise = () => {
    const nextIndex = currentExerciseIndex + 1;
    console.log("Moving to next exercise. Index:", nextIndex);
    
    if (nextIndex < workout.exercises.length) {
      setCurrentExerciseIndex(nextIndex);
      setCurrentState('exercise');
      setTimeElapsed(0); // Reset timer for new exercise
    } else {
      // All exercises completed - go directly to summary instead of rest
      showWorkoutCompletionEffect(); // Add special completion effect
      endWorkout();
    }
  };

  // Add this new function for the workout completion effect:
const showWorkoutCompletionEffect = () => {
    // Create the effect container
    const effectContainer = document.createElement('div');
    effectContainer.className = 'workout-completion-effect-wplayer';
    
    // Create inner content
    const innerContent = document.createElement('div');
    innerContent.className = 'completion-content-wplayer';
    
    // Trophy icon
    const trophyIcon = document.createElement('div');
    trophyIcon.className = 'trophy-icon-wplayer';
    trophyIcon.innerHTML = '🏆';
    
    // Completion text
    const completionText = document.createElement('div');
    completionText.className = 'workout-completion-text-wplayer';
    completionText.textContent = 'WORKOUT COMPLETE!';
    
    // Stats
    const statsText = document.createElement('div');
    statsText.className = 'completion-stats-wplayer';
    
    // Format total time
    const mins = Math.floor(totalTimeElapsed / 60);
    const secs = totalTimeElapsed % 60;
    const timeStr = `${mins}m ${secs}s`;
    
    statsText.textContent = `${workout.exercises.length} exercises • ${timeStr}`;
    
    // Add celebration particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'celebration-particle-wplayer';
      
      // Randomize particle appearance
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 0.5}s`;
      particle.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
      
      effectContainer.appendChild(particle);
    }
    
    // Append all elements
    innerContent.appendChild(trophyIcon);
    innerContent.appendChild(completionText);
    innerContent.appendChild(statsText);
    effectContainer.appendChild(innerContent);
    
    // Add to DOM
    const container = playerRef.current;
    if (container) {
      container.appendChild(effectContainer);
      
      // Play triumphant sound
      playSound(exerciseCompleteSound);
      
      // Add extra haptic feedback for completion
      if (window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100, 50, 200]);
      }
      
      // Remove after animation completes
      setTimeout(() => {
        if (container.contains(effectContainer)) {
          container.removeChild(effectContainer);
        }
      }, 3000); // Longer duration for final celebration
    }
  };
  

  // Trigger water break
  const triggerWaterBreak = () => {
    console.log("Triggering water break");
    
    // Save current state to resume later
    const previousState = currentState;
    
    // Pause workout and show water break
    setCurrentState('waterBreak');
    setTimeElapsed(0); // Reset timer for water break
    
    // Pause timer if it's running
    if (isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
      setIsPlaying(false);
    }
    
    // Play water break sound
    playSound(waterBreakSound);
  };

  // Complete water break
  const completeWaterBreak = () => {
    updateNextWaterBreak();
    
    // Resume previous activity
    if (currentExerciseIndex < workout.exercises.length) {
      setCurrentState('exercise');
      setIsPlaying(true);
      startTimer();
    } else {
      endWorkout();
    }
  };

  // Update next water break
  const updateNextWaterBreak = () => {
    const elapsedMinutes = Math.floor(totalTimeElapsed / 60);
    const nextBreak = waterBreaks.find(breakTime => breakTime > elapsedMinutes);
    setNextWaterBreak(nextBreak || null);
  };

  // End workout and show summary
  const endWorkout = () => {
    console.log("Ending workout...");
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsPlaying(false);
    setCurrentState('summary');
    
    // Play completion sound
    playSound(completeSound);
  };

  // Handle play/pause
  const togglePlayPause = () => {
    playSound(clickSound);
    
    if (currentState === 'ready') {
      startWorkout();
      return;
    }
    
    setIsPlaying(prev => {
      if (prev) {
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        return false;
      } else {
        // Resume timer
        startTimer();
        return true;
      }
    });
  };

  // Skip to next exercise
  const skipToNext = () => {
    playSound(clickSound);
    
    if (currentState === 'exercise') {
      markCurrentExerciseCompleted();
    }
    
    moveToNextExercise();
  };

  // Go back to previous exercise
  const goToPrevious = () => {
    playSound(clickSound);
    
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      setCurrentState('exercise');
      setTimeElapsed(0);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Auto-hide controls after a period of inactivity
  useEffect(() => {
    // Always ensure controls are visible
    setShowControls(true);
  }, []);

  // Save workout results
  const saveWorkoutResults = () => {
    const duration = Math.ceil(totalTimeElapsed / 60);
    
    // Create workout log data
    const workoutData = {
      workoutId: workout.id,
      name: workout.name,
      type: workout.type,
      duration,
      exercises: completedExercises,
      notes,
    };
    
    // Log the workout
    const completedWorkout = logWorkout(date, workoutData);
    
    // Call completion handler
    onComplete(completedWorkout);
  };

  // If no workout loaded, show loader
  if (!workout) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="vintage-loader-wplayer">
          <div className="loader-inner-wplayer"></div>
        </div>
      </div>
    );
  }
  
  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={playerRef} 
      className={`vintage-workout-player-wplayer ${activeView === 'cassette' ? 'cassette-mode-wplayer' : 'workout-mode-wplayer'}`}
      onClick={() => setShowControls(true)}
    >
      {/* View switcher tabs */}
      <div className="vintage-view-tabs-wplayer">
        <button 
          className={`vintage-tab-wplayer ${activeView === 'workout' ? 'active-wplayer' : ''}`}
          onClick={() => setActiveView('workout')}
        >
          <Zap size={18} />
          <span>Workout</span>
        </button>
        <button 
          className={`vintage-tab-wplayer ${activeView === 'cassette' ? 'active-wplayer' : ''}`}
          onClick={() => setActiveView('cassette')}
        >
          <Music size={18} />
          <span>Cassette</span>
        </button>
      </div>
      
      {/* Header with title and controls */}
      <div className={`vintage-header-wplayer ${showControls ? 'visible-wplayer' : 'hidden-wplayer'}`}>
        <button 
          onClick={onClose}
          className="vintage-button-wplayer"
        >
          <X size={20} />
        </button>
        <div className="vintage-title-wplayer">
          <h2>{workout.name}</h2>
          <div className="vintage-timer-wplayer">{formatTime(totalTimeElapsed)}</div>
        </div>
        <button 
          onClick={toggleFullscreen}
          className="vintage-button-wplayer"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>
      
      {/* View container */}
      <div className={`vintage-view-container-wplayer ${showControls ? 'controls-visible-wplayer' : 'controls-hidden-wplayer'}`}>
        {/* Workout View */}
        <div className={`vintage-view-wplayer workout-view-wplayer ${activeView === 'workout' ? 'active-wplayer' : ''}`}>
          {/* Progress bar */}
          {currentState !== 'ready' && currentState !== 'summary' && (
            <div className="vintage-progress-wplayer">
              <div className="progress-text-wplayer">
                Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
                {currentState === 'exercise' && ` • Set ${currentSetNumber} of ${currentSets}`}
              </div>
              <div className="progress-bar-wplayer">
                <div 
                  className="progress-fill-wplayer"
                  style={{ 
                    width: `${((currentExerciseIndex + (currentState === 'rest' ? 0.5 : 0)) / workout.exercises.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Ready state */}
          {currentState === 'ready' && (
            <div className="vintage-ready-state-wplayer">
              <div className="ready-icon-wplayer">
                <Play size={40} />
              </div>
              <h3>Ready to start your workout?</h3>
              <p>
                {workout.exercises.length} exercises • {workout.duration} minutes
              </p>
              <button 
                onClick={startWorkout}
                className="vintage-start-button-wplayer"
              >
                <Play size={20} />
                Start Workout
              </button>
            </div>
          )}
          
          {/* Exercise state */}
          {currentState === 'exercise' && currentExercise && (
            <div className="vintage-exercise-container-wplayer">
              <ExerciseView 
                exercise={currentExercise}
                index={currentExerciseIndex + 1}
                total={workout.exercises.length}
                sets={currentSets}
                reps={currentReps}
                weight={currentWeight}
                currentSet={currentSetNumber}
                totalSets={currentSets}
                timeElapsed={timeElapsed} // Now passing timeElapsed
                onSetsChange={setCurrentSets}
                onRepsChange={setCurrentReps}
                onWeightChange={setCurrentWeight}
                vintageMode={true}
              />
              
              {/* Set completion button */}
              <button
                onClick={completeSet}
                className="vintage-complete-set-button-wplayer"
              >
                Complete Set {currentSetNumber}
              </button>
            </div>
          )}
          
          {/* Rest state */}
          {currentState === 'rest' && (
            <div className="vintage-rest-container-wplayer">
              <RestPeriod 
                timeElapsed={timeElapsed} // Now passing timeElapsed
                nextExercise={workout.exercises[currentExerciseIndex + 1]}
                vintageMode={true}
              />
              
              {/* Rest completion button */}
              <button
                onClick={completeRest}
                className="vintage-complete-rest-button-wplayer"
              >
                End Rest Period
              </button>
            </div>
          )}
          
          {/* Water break state */}
          {currentState === 'waterBreak' && (
            <div className="vintage-waterbreak-container-wplayer">
              <WaterBreakReminder 
                timeElapsed={timeElapsed} // Now passing timeElapsed
                onSkip={completeWaterBreak}
                vintageMode={true}
              />
            </div>
          )}
          
          {/* Summary state */}
          {currentState === 'summary' && (
            <WorkoutSummary 
              workout={workout}
              completedExercises={completedExercises}
              totalTime={totalTimeElapsed}
              notes={notes}
              onNotesChange={setNotes}
              onSave={saveWorkoutResults}
              onClose={onClose}
              vintageMode={true}
            />
          )}
          {/* Achievement Popup */}
{showAchievement && currentAchievement && (
  <div className="achievement-popup-wplayer">
    <div className="achievement-icon-wplayer">{currentAchievement.icon}</div>
    <div className="achievement-content-wplayer">
      <div className="achievement-title-wplayer">Achievement Unlocked!</div>
      <div className="achievement-name-wplayer">{currentAchievement.title}</div>
      <div className="achievement-description-wplayer">{currentAchievement.description}</div>
    </div>
  </div>
)}
        </div>
        
        {/* Cassette View */}
        <div className={`vintage-view-wplayer cassette-view-wplayer ${activeView === 'cassette' ? 'active-wplayer' : ''}`}>
          <RetroTapePlayer isMuted={isMuted} />
        </div>
      </div>
      
      {/* Controls */}
      {currentState !== 'summary' && (
        <div className={`vintage-controls-wplayer ${showControls ? 'visible-wplayer' : 'hidden-wplayer'}`}>
          <button 
            onClick={toggleMute}
            className="vintage-control-button-wplayer"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          
          <div className="vintage-main-controls-wplayer">
            {currentState !== 'ready' && currentExerciseIndex > 0 && (
              <button 
                onClick={goToPrevious}
                className="vintage-control-button-wplayer"
                disabled={currentExerciseIndex === 0}
              >
                <Rewind size={24} />
              </button>
            )}
            
            <button 
              onClick={togglePlayPause}
              className={`vintage-play-button-wplayer ${isPlaying ? 'playing-wplayer' : ''}`}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
            
            {currentState !== 'ready' && currentExerciseIndex < workout.exercises.length && (
              <button 
                onClick={skipToNext}
                className="vintage-control-button-wplayer"
              >
                <SkipForward size={24} />
              </button>
            )}
          </div>
          
          <button 
            onClick={triggerWaterBreak}
            className="vintage-control-button-wplayer water-button-wplayer"
          >
            <Droplet size={24} />
          </button>
        </div>
      )}
      
      {/* Next water break indicator */}
      {nextWaterBreak && showControls && currentState !== 'ready' && currentState !== 'summary' && (
        <div className="vintage-water-indicator-wplayer">
          <Droplet size={14} />
          <span>Next break: {nextWaterBreak}min</span>
        </div>
      )}
      
      {/* Tap to show controls hint - shows briefly when controls are hidden */}
      {!showControls && (
        <div className="tap-hint-wplayer">
          Tap to show controls
        </div>
      )}
    </div>
  );
};

// Add enhanced vintage styling with fixed issues
const style = document.createElement('style');
style.innerHTML = `

/* Workout Completion Effect */
.workout-completion-effect-wplayer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 200;
  animation: fadeInOut-wplayer 3s ease-in-out forwards;
  background: rgba(201, 182, 144, 0.6);
}

.completion-content-wplayer {
  text-align: center;
  padding: 40px;
  background: rgba(245, 234, 213, 0.95);
  border: 5px solid #8A7B59;
  border-radius: 20px;
  transform: scale(0) rotate(-5deg);
  animation: bigPopIn-wplayer 0.7s 0.2s forwards cubic-bezier(0.2, 0.8, 0.2, 1.2);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
  z-index: 10;
}

.trophy-icon-wplayer {
  font-size: 5rem;
  margin-bottom: 15px;
  animation: trophyBounce-wplayer 1s 0.7s infinite alternate;
}

.workout-completion-text-wplayer {
  font-size: 2.5rem;
  font-weight: bold;
  color: #5C4E33;
  margin-bottom: 15px;
  font-family: 'VT323', monospace;
  text-shadow: 3px 3px 0 #C9B690;
}

.completion-stats-wplayer {
  font-size: 1.3rem;
  color: #8A7B59;
  font-family: 'VT323', monospace;
}

.celebration-particle-wplayer {
  position: absolute;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  opacity: 0;
  animation: particleBurst-wplayer 2s ease-out forwards;
}

@keyframes bigPopIn-wplayer {
  0% { transform: scale(0) rotate(-5deg); }
  70% { transform: scale(1.1) rotate(3deg); }
  85% { transform: scale(0.95) rotate(0deg); }
  100% { transform: scale(1) rotate(0deg); }
}

@keyframes trophyBounce-wplayer {
  0% { transform: translateY(0); }
  100% { transform: translateY(-15px); }
}

@keyframes particleBurst-wplayer {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(3) translateY(100px);
    opacity: 0;
  }
}

/* Ensure controls are always visible */
.vintage-controls-wplayer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #E5D8B9;
  border-top: 2px solid #C9B690;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 50;
  /* Remove the transform-related transitions that hide the controls */
  transform: none !important; /* Force showing */
}

/* Remove any hidden class behaviors */
.vintage-controls-wplayer.hidden-wplayer {
  transform: none !important;
  opacity: 1 !important;
  visibility: visible !important;
}

/* Update the tap-hint to never show since controls are always visible */
.tap-hint-wplayer {
  display: none;
}

  /* Vintage styling for workout player */
  @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
  
  .vintage-workout-player-wplayer {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    overflow: hidden;
    background-color: #F5EAD5;
    color: #8A7B59;
    font-family: 'VT323', monospace;
  }
  
  
  /* Vintage loader */
  .vintage-loader-wplayer {
    width: 50px;
    height: 50px;
    background: #E5D8B9;
    border-radius: 50%;
    border: 3px solid #C9B690;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    animation: loaderPulse-wplayer 1.5s infinite ease-in-out;
  }
  
  .loader-inner-wplayer {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 3px solid #8A7B59;
    border-top-color: transparent;
    animation: loaderSpin-wplayer 1s infinite linear;
  }
  
  @keyframes loaderPulse-wplayer {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  @keyframes loaderSpin-wplayer {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* View tabs */
  .vintage-view-tabs-wplayer {
    display: flex;
    background: #E5D8B9;
    padding: 4px;
    border-bottom: 2px solid #C9B690;
    z-index: 5;
  }
  
  .vintage-tab-wplayer {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    background: transparent;
    color: #8A7B59;
    border: none;
    border-radius: 4px 4px 0 0;
    transition: all 0.3s ease;
    font-family: 'VT323', monospace;
  }
  
  .vintage-tab-wplayer.active-wplayer {
    background: #C9B690;
    color: #5C4E33;
    font-weight: bold;
  }
  
  /* Header styling */
  .vintage-header-wplayer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #E5D8B9;
    border-bottom: 2px solid #C9B690;
    transition: transform 0.3s ease;
    z-index: 5;
  }
  
  .vintage-header-wplayer.hidden-wplayer {
    transform: translateY(-100%);
  }
  
  .vintage-button-wplayer {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #C9B690;
    border: 1px solid #8A7B59;
    border-radius: 4px;
    color: #5C4E33;
    transition: all 0.2s ease;
  }
  
  .vintage-button-wplayer:active {
    transform: scale(0.95);
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  .vintage-title-wplayer {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .vintage-title-wplayer h2 {
    font-size: 1.2rem;
    margin: 0;
    color: #5C4E33;
  }
  
  .vintage-timer-wplayer {
    font-size: 1rem;
    color: #8A7B59;
  }
  
  /* Main content container */
  .vintage-view-container-wplayer {
    flex: 1;
    position: relative;
    overflow: hidden;
    transition: padding 0.3s ease;
  }
  
  .vintage-view-container-wplayer.controls-hidden-wplayer {
    padding-bottom: 0;
  }
  
  .vintage-view-container-wplayer.controls-visible-wplayer {
    padding-bottom: 80px;
  }
  
  /* Fixed view styling to prevent overlap */
  .vintage-view-wplayer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease, opacity 0.3s ease;
    overflow-y: auto;
    padding: 20px;
  }
  
  .workout-view-wplayer {
    transform: translateX(-100%);
    opacity: 0;
  }
  
  .cassette-view-wplayer {
    transform: translateX(100%);
    opacity: 0;
  }
  
  .workout-mode-wplayer .workout-view-wplayer {
    transform: translateX(0);
    opacity: 1;
  }
  
  .workout-mode-wplayer .cassette-view-wplayer {
    transform: translateX(100%);
    opacity: 0;
  }
  
  .cassette-mode-wplayer .workout-view-wplayer {
    transform: translateX(-100%);
    opacity: 0;
  }
  
  .cassette-mode-wplayer .cassette-view-wplayer {
    transform: translateX(0);
    opacity: 1;
  }

  /* Set Completion Effect */
.set-completion-effect-wplayer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 100;
  animation: fadeInOut-wplayer 1.5s ease-in-out forwards;
  background: rgba(201, 182, 144, 0.3);
}

.set-completion-effect-wplayer .effect-content-wplayer {
  text-align: center;
  transform: scale(0);
  animation: popIn-wplayer 0.3s 0.1s forwards cubic-bezier(0.2, 0.8, 0.2, 1.2);
}

.set-completion-effect-wplayer .completion-text-wplayer {
  font-size: 2rem;
  font-weight: bold;
  color: #5C4E33;
  text-shadow: 2px 2px 0 #F5EAD5;
  margin-bottom: 10px;
  font-family: 'VT323', monospace;
}

.energy-burst-wplayer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, #F5EAD5 0%, rgba(201, 182, 144, 0) 70%);
  border-radius: 50%;
  z-index: -1;
  animation: burst-wplayer 0.6s ease-out forwards;
}

@keyframes burst-wplayer {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(15);
    opacity: 0;
  }
}

/* Exercise Completion Effect */
.exercise-completion-effect-wplayer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 100;
  animation: fadeInOut-wplayer 2.5s ease-in-out forwards;
  background: rgba(138, 123, 89, 0.4);
}

.exercise-completion-effect-wplayer .effect-content-wplayer {
  text-align: center;
  padding: 30px;
  background: rgba(245, 234, 213, 0.9);
  border: 3px solid #C9B690;
  border-radius: 15px;
  transform: scale(0) rotate(-5deg);
  animation: popInRotate-wplayer 0.5s 0.1s forwards cubic-bezier(0.2, 0.8, 0.2, 1.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.exercise-completion-effect-wplayer .completion-text-wplayer {
  font-size: 2.5rem;
  font-weight: bold;
  color: #5C4E33;
  margin-bottom: 15px;
  font-family: 'VT323', monospace;
  text-shadow: 3px 3px 0 #C9B690;
}

.exercise-completion-effect-wplayer .motivational-text-wplayer {
  font-size: 1.5rem;
  color: #8A7B59;
  font-family: 'VT323', monospace;
}

.confetti-wplayer {
  position: absolute;
  width: 10px;
  height: 20px;
  top: -20px;
  opacity: 0;
  animation: confettiFall-wplayer 2s ease-in-out forwards;
}

@keyframes fadeInOut-wplayer {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes popIn-wplayer {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

@keyframes popInRotate-wplayer {
  0% { transform: scale(0) rotate(-5deg); }
  70% { transform: scale(1.1) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); }
}

@keyframes confettiFall-wplayer {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(1000px) rotate(720deg);
    opacity: 0;
  }
}

/* Add pixel movement to confetti */
.confetti-wplayer:nth-child(odd) {
  animation-name: confettiFallLeft-wplayer;
}

.confetti-wplayer:nth-child(even) {
  animation-name: confettiFallRight-wplayer;
}

@keyframes confettiFallLeft-wplayer {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(1000px) translateX(-100px) rotate(720deg);
    opacity: 0;
  }
}

@keyframes confettiFallRight-wplayer {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(1000px) translateX(100px) rotate(-720deg);
    opacity: 0;
  }
}

/* Shake Effect for Completion */
@keyframes shake-wplayer {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* Screen Flash Effect */
@keyframes screenFlash-wplayer {
  0%, 100% { background-color: rgba(245, 234, 213, 0); }
  50% { background-color: rgba(245, 234, 213, 0.3); }
}
  
  /* Progress bar */
  .vintage-progress-wplayer {
    margin-bottom: 20px;
  }
  
  .progress-text-wplayer {
    font-size: 0.9rem;
    margin-bottom: 4px;
    color: #8A7B59;
    text-align: center;
  }
  
  .progress-bar-wplayer {
    height: 8px;
    background: #E5D8B9;
    border: 1px solid #C9B690;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-fill-wplayer {
    height: 100%;
    background: #C9B690;
    transition: width 0.3s ease;
  }
  
  /* Ready state */
  .vintage-ready-state-wplayer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 100%;
    padding: 20px;
    background: #F5EAD5;
    border: 1px solid #C9B690;
    border-radius: 8px;
  }
  
  .ready-icon-wplayer {
    width: 80px;
    height: 80px;
    background: #E5D8B9;
    border: 2px solid #C9B690;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    color: #8A7B59;
  }
  
  .vintage-ready-state-wplayer h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #5C4E33;
  }
  
  .vintage-ready-state-wplayer p {
    margin-bottom: 30px;
    color: #8A7B59;
  }
  
  .vintage-start-button-wplayer {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 25px;
    background: #C9B690;
    border: 1px solid #8A7B59;
    border-radius: 4px;
    color: #5C4E33;
    font-size: 1.1rem;
    font-family: 'VT323', monospace;
    transition: all 0.2s ease;
  }
  
  .vintage-start-button-wplayer:active {
    transform: scale(0.95);
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  /* Complete Set Button */
  .vintage-complete-set-button-wplayer {
    display: block;
    width: 100%;
    padding: 12px;
    margin-top: 15px;
    background: #C9B690;
    border: 1px solid #8A7B59;
    border-radius: 4px;
    color: #5C4E33;
    font-size: 1.1rem;
    font-family: 'VT323', monospace;
    transition: all 0.2s ease;
  }
  
  .vintage-complete-set-button-wplayer:active {
    transform: scale(0.98);
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  /* Rest completion button */
  .vintage-complete-rest-button-wplayer {
    display: block;
    width: 100%;
    padding: 12px;
    margin-top: 15px;
    background: #C9B690;
    border: 1px solid #8A7B59;
    border-radius: 4px;
    color: #5C4E33;
    font-size: 1.1rem;
    font-family: 'VT323', monospace;
    transition: all 0.2s ease;
  }
  
  .vintage-complete-rest-button-wplayer:active {
    transform: scale(0.98);
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  /* Controls */
.vintage-controls-wplayer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #E5D8B9;
  border-top: 2px solid #C9B690;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.3s ease;
  z-index: 5;
}

.vintage-controls-wplayer.hidden-wplayer {
  transform: translateY(100%);
}

/* Make sure controls are always visible on non-fullscreen mode */
@media (max-height: 600px) {
  .vintage-controls-wplayer {
    /* Make controls smaller on smaller screens */
    padding: 10px;
  }
  
  .vintage-control-button-wplayer, .vintage-play-button-wplayer {
    transform: scale(0.9);
  }
}
  
  .vintage-main-controls-wplayer {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .vintage-control-button-wplayer {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F5EAD5;
    border: 1px solid #C9B690;
    border-radius: 4px;
    color: #8A7B59;
    transition: all 0.2s ease;
  }
  
  /* Highlight the water button */
  .water-button-wplayer {
    background: #C9B690;
    color: #5C4E33;
  }
  
  .water-button-wplayer:active {
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  .vintage-control-button-wplayer:active {
    transform: scale(0.95);
    background: #C9B690;
    color: #5C4E33;
  }
  
  .vintage-control-button-wplayer:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .vintage-play-button-wplayer {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #C9B690;
    border: 1px solid #8A7B59;
    border-radius: 4px;
    color: #5C4E33;
    transition: all 0.2s ease;
  }
  
  .vintage-play-button-wplayer.playing-wplayer {
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  .vintage-play-button-wplayer:active {
    transform: scale(0.95);
  }
  
  /* Water break indicator */
  .vintage-water-indicator-wplayer {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #E5D8B9;
    padding: 5px 12px;
    border: 1px solid #C9B690;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: #8A7B59;
    z-index: 5;
  }
  
  /* Tap to show controls hint */
  .tap-hint-wplayer {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(229, 216, 185, 0.8);
    padding: 5px 12px;
    border: 1px solid #C9B690;
    border-radius: 4px;
    font-size: 0.8rem;
    color: #8A7B59;
    opacity: 0;
    animation: fadeInOut-wplayer 3s forwards;
    z-index: 5;
    pointer-events: none;
  }
  
  @keyframes fadeInOut-wplayer {
    0% { opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; }
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .vintage-title-wplayer h2 {
      font-size: 1rem;
    }
    
    .vintage-timer-wplayer {
      font-size: 0.8rem;
    }
    
    .vintage-play-button-wplayer {
      width: 50px;
      height: 50px;
    }
    
    .vintage-control-button-wplayer {
      width: 36px;
      height: 36px;
    }
    
    .vintage-start-button-wplayer {
      padding: 10px 20px;

      font-size: 1rem;
    }
  }
`;
document.head.appendChild(style);

const addCassettePlayerStyles = () => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Make the cassette view take up proper space */
      .vintage-workout-player-wplayer .vintage-view-wplayer.cassette-view-wplayer {
        padding: 0 !important;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      /* Give the cassette player more space */
      .vintage-workout-player-wplayer .cassette-view-wplayer .vintage-player-wplayer {
        transform: scale(1);
        max-width: 100%;
        padding: 10px;
      }
      
      /* Make cassette window taller */
      .vintage-workout-player-wplayer .cassette-view-wplayer .cassette-window-wplayer {
        height: 240px;
      }
      
      /* Ensure playlist has enough space */
      .vintage-workout-player-wplayer .cassette-view-wplayer .playlist-container-wplayer {
        min-height: 100px;
        max-height: 120px;
      }
      
      /* Fix modal styling in WorkoutPlayer context */
      .vintage-workout-player-wplayer .add-mixtape-modal-wplayer {
        background: #F5EAD5;
        border: 2px solid #C9B690;
        color: #5C4E33;
      }
      
      .vintage-workout-player-wplayer .modal-header-wplayer {
        background: #E5D8B9;
        border-bottom: 1px solid #C9B690;
      }
      
      .vintage-workout-player-wplayer .form-input-wplayer {
        border: 1px solid #C9B690;
        background: white;
        color: #5C4E33;
      }
      
      .vintage-workout-player-wplayer .modal-add-btn-wplayer {
        background: #C9B690;
        color: #5C4E33;
        border: 1px solid #8A7B59;
      }
      
      .vintage-workout-player-wplayer .modal-cancel-btn-wplayer {
        background: #E5D8B9;
        color: #8A7B59;
        border: 1px solid #C9B690;
      }
    `;
    document.head.appendChild(styleElement);
  };
  

// Add the following CSS to fix the water break animations:
const waterBreakAnimations = document.createElement('style');
waterBreakAnimations.innerHTML = `
  /* Water Break Animations */
  @keyframes dropletFall-wplayer {
    0% { transform: translateY(-20px); opacity: 0; }
    10% { opacity: 1; }
    80% { opacity: 1; }
    100% { transform: translateY(80px); opacity: 0; }
  }
  
  @keyframes ripple-wplayer {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(3); opacity: 0; }
  }
  
  @keyframes waterPulse-wplayer {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
  
  /* Add these animations to WaterBreakReminder.jsx */
  .vintage-water-break-wplayer {
    position: relative;
    overflow: hidden;
  }
  
  .water-break-header-wplayer svg {
    animation: waterPulse-wplayer 2s infinite ease-in-out;
  }
  
  /* Animated water droplets */
  .water-break-header-wplayer::before,
  .water-break-header-wplayer::after {
    content: '';
    position: absolute;
    background: #8A7B59;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    opacity: 0;
  }
  
  .water-break-header-wplayer::before {
    top: 10px;
    left: 25%;
    animation: dropletFall-wplayer 3s infinite ease-in-out;
  }
  
  .water-break-header-wplayer::after {
    top: 15px;
    right: 25%;
    animation: dropletFall-wplayer 3.5s 0.5s infinite ease-in-out;
  }
  
  /* Ripple effect under the water drop icon */
  .water-animation-container-wplayer {
    position: relative;
    width: 40px;
    height: 40px;
    margin: 0 auto;
  }
  
  .ripple-circle-wplayer {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid #8A7B59;
    opacity: 0;
  }
  
  .ripple-1-wplayer {
    animation: ripple-wplayer 2s infinite;
  }
  
  .ripple-2-wplayer {
    animation: ripple-wplayer 2s 0.5s infinite;
  }
  
  .ripple-3-wplayer {
    animation: ripple-wplayer 2s 1s infinite;
  }
  
  /* Additional water droplets around the container */
  .water-droplets-wplayer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }
  
  .droplet-wplayer {
    position: absolute;
    width: 6px;
    height: 10px;
    border-radius: 50%;
    background: #8A7B59;
    opacity: 0;
  }
  
  .droplet-wplayer:nth-child(1) {
    top: 20%;
    left: 20%;
    animation: dropletFall-wplayer 2.5s infinite;
  }
  
  .droplet-wplayer:nth-child(2) {
    top: 10%;
    left: 60%;
    animation: dropletFall-wplayer 3s 0.7s infinite;
  }
  
  .droplet-wplayer:nth-child(3) {
    top: 15%;
    left: 80%;
    animation: dropletFall-wplayer 3.2s 1.2s infinite;
  }
  
  .droplet-wplayer:nth-child(4) {
    top: 5%;
    left: 40%;
    animation: dropletFall-wplayer 2.8s 0.3s infinite;
  }
`;
document.head.appendChild(waterBreakAnimations);

// Add the CSS for the achievement popup
const achievementStyles = `
  /* Achievement Popup */
  .achievement-popup-wplayer {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    padding: 15px;
    background: #F5EAD5;
    border: 3px solid #8A7B59;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    animation: achievementSlideIn-wplayer 0.5s ease-out forwards, achievementSlideOut-wplayer 0.5s 2.5s ease-in forwards;
    max-width: 80%;
  }
  
  .achievement-icon-wplayer {
    font-size: 2.5rem;
    margin-right: 15px;
    animation: achievementPulse-wplayer 0.5s infinite alternate;
  }
  
  .achievement-content-wplayer {
    flex: 1;
  }
  
  .achievement-title-wplayer {
    font-family: 'VT323', monospace;
    color: #8A7B59;
    font-size: 0.9rem;
    margin-bottom: 3px;
  }
  
  .achievement-name-wplayer {
    font-family: 'VT323', monospace;
    color: #5C4E33;
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 3px;
  }
  
  .achievement-description-wplayer {
    font-family: 'VT323', monospace;
    color: #8A7B59;
    font-size: 0.9rem;
  }
  
  @keyframes achievementPulse-wplayer {
    0% { transform: scale(1); }
    100% { transform: scale(1.1); }
  }
  
  @keyframes achievementSlideIn-wplayer {
    0% { transform: translateX(-50%) translateY(-100px); opacity: 0; }
    100% { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  
  @keyframes achievementSlideOut-wplayer {
    0% { transform: translateX(-50%) translateY(0); opacity: 1; }
    100% { transform: translateX(-50%) translateY(-100px); opacity: 0; }
  }
`;

// Add the achievement styles to the document
const achievementStyleElement = document.createElement('style');
achievementStyleElement.innerHTML = achievementStyles;
document.head.appendChild(achievementStyleElement);

export default WorkoutPlayer;