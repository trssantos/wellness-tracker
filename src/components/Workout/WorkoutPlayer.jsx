import React, { useState, useEffect, useRef, useContext } from 'react';
import { Play, Pause, SkipForward, ArrowLeft, X, Clock, Droplet, 
         Volume2, VolumeX, Rewind, ChevronUp, Music, Zap,
         Flag, CheckCircle, Minimize, Maximize } from 'lucide-react';
import ExerciseView from './ExerciseView';
import RestPeriod from './RestPeriod';
import WaterBreakReminder from './WaterBreakReminder';
import WorkoutSummary from './WorkoutSummary';
import RetroTapePlayer from './RetroTapePlayer';
import { getWorkoutById, logWorkout } from '../../utils/workoutUtils';
import { ThemeContext } from '../../context/ThemeContext';
import './WorkoutPlayer.css';

const WorkoutPlayer = ({ workoutId, date, onComplete, onClose }) => {
  // Get theme from context
  const { theme } = useContext(ThemeContext);
  
  // Main workout player state
  const [workout, setWorkout] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentState, setCurrentState] = useState('ready'); // ready, exercise, rest, waterBreak, summary
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
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
  const [exerciseTimerSaved, setExerciseTimerSaved] = useState(0);
  const [targetAlertPlayed, setTargetAlertPlayed] = useState(false);

  // Interruption tracking
  const [lastPauseTime, setLastPauseTime] = useState(null);
  const [totalPauseDuration, setTotalPauseDuration] = useState(0);
  const [interruptionsCount, setInterruptionsCount] = useState(0);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [savedWorkoutState, setSavedWorkoutState] = useState(null);
  
  // Set tracking
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [setsCompleted, setSetsCompleted] = useState(0);
  
  // UI states
  const [activeView, setActiveView] = useState('workout'); // 'workout' or 'cassette'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const playerRef = useRef(null);
  
  // Refs for timer
  const timerRef = useRef(null);
  
  // Sound effects
  const startSound = useRef(null);//new Audio('https://freesound.org/data/previews/476/476177_7724198-lq.mp3'));
  const completeSound = useRef(null);//new Audio('https://freesound.org/data/previews/131/131660_2398403-lq.mp31'));
  const waterBreakSound = useRef(null);//new Audio('https://freesound.org/data/previews/341/341695_5858296-lq.mp3'));
  const clickSound = useRef(null);//new Audio('https://freesound.org/data/previews/573/573588_13006337-lq.mp3'));
  const setCompleteSound = useRef(null);//new Audio('https://freesound.org/data/previews/413/413749_4284968-lq.mp3'));
  const exerciseCompleteSound = useRef(null);//new Audio('https://freesound.org/data/previews/270/270402_5123851-lq.mp31'));
  const motivationSound = useRef(null);//new Audio('https://freesound.org/data/previews/448/448268_7343324-lq.mp31'));
  
  // Exercise-specific state
  const [currentExercise, setCurrentExercise] = useState(null);
  const [currentSets, setCurrentSets] = useState(3);
  const [currentReps, setCurrentReps] = useState(10);
  const [currentWeight, setCurrentWeight] = useState('');
  
  // Add support for duration-based exercises
  const [exerciseDuration, setExerciseDuration] = useState(0);
  const [exerciseDurationUnit, setExerciseDurationUnit] = useState('min');
  const [exerciseDistance, setExerciseDistance] = useState('');
  const [exerciseIntensity, setExerciseIntensity] = useState('medium');

  const [waterBreaksTaken, setWaterBreaksTaken] = useState(0);
  const [waterBreakTime, setWaterBreakTime] = useState(0);

  // Load workout on mount
  useEffect(() => {
    if (workoutId) {
      const workoutData = getWorkoutById(workoutId);
      console.log("Loaded workout:", workoutData);
      
      if (workoutData) {
        setWorkout(workoutData);
        
        // Initialize completed exercises array - now handles duration-based exercises with sets
        setCompletedExercises(
          workoutData.exercises.map(exercise => ({
            ...exercise,
            completed: false,
            // Traditional exercise properties
            actualSets: exercise.sets,
            actualReps: exercise.reps,
            actualWeight: exercise.weight || '',
            // Duration-based exercise properties
            actualDuration: exercise.duration, // Don't modify the duration
            actualDurationUnit: exercise.durationUnit || 'min',
            actualDistance: exercise.distance || '',
            actualIntensity: exercise.intensity || 'medium',
            // Track time spent per set for duration-based exercises
            setTimes: Array(exercise.sets || 1).fill(0),
            // Track total time for the exercise
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
          
          if (firstExercise.isDurationBased) {
            // Initialize duration-based exercise
            setCurrentSets(firstExercise.sets || 3);
            setExerciseDuration(firstExercise.duration); // Use exact value
            setExerciseDurationUnit(firstExercise.durationUnit || 'min');
            setExerciseDistance(firstExercise.distance || '');
            setExerciseIntensity(firstExercise.intensity || 'medium');
          } else {
            // Initialize traditional strength exercise
            setCurrentSets(firstExercise.sets || 3);
            setCurrentReps(firstExercise.reps || 10);
            setCurrentWeight(firstExercise.weight || '');
          }
        }
      }
    }
    
    // Preload sound files
    //startSound.current.preload = 'auto';
    //completeSound.current.preload = 'auto';
    //waterBreakSound.current.preload = 'auto';
    //clickSound.current.preload = 'auto';
    //setCompleteSound.current.preload = 'auto';
    //exerciseCompleteSound.current.preload = 'auto';
    //motivationSound.current.preload = 'auto';
    
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

    // Check for saved state on mount
    loadSavedWorkoutState();
    
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
        
        // Handle both traditional and duration-based exercises
        if (exercise.isDurationBased) {
          setExerciseDuration(exercise.duration); // Use exact value
          setExerciseDurationUnit(exercise.durationUnit || 'min');
          setExerciseDistance(exercise.distance || '');
          setExerciseIntensity(exercise.intensity || 'medium');
        } else {
          setCurrentSets(parseInt(exercise.sets) || 3);
          setCurrentReps(parseInt(exercise.reps) || 10);
          setCurrentWeight(exercise.weight || '');
        }
        
        // Reset set tracking for new exercise
        setCurrentSetNumber(1);
        setSetsCompleted(0);
        
        // Reset target alert played state
        setTargetAlertPlayed(false);
      }
    }
  }, [currentExerciseIndex, workout]);

  // Add this function to save workout state to localStorage
  const saveWorkoutState = () => {
    if (!workout) return;
    
    console.log("Saving workout state due to interruption");
    const workoutState = {
      workoutId: workout.id,
      date,
      currentExerciseIndex,
      currentState,
      isPlaying,
      timeElapsed,
      totalTimeElapsed,
      completedExercises,
      currentSetNumber,
      setsCompleted,
      exerciseDuration,
      exerciseDurationUnit,
      exerciseDistance,
      exerciseIntensity,
      currentWeight,
      currentReps,
      currentSets,
      waterBreaks,
      nextWaterBreak,
      lastPauseTime: new Date().toISOString(),
      totalPauseDuration,
      interruptionsCount,
      targetAlertPlayed,
      savedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('workout-player-state', JSON.stringify(workoutState));
  };

  // Add function to load saved state
  const loadSavedWorkoutState = () => {
    const savedStateStr = localStorage.getItem('workout-player-state');
    if (!savedStateStr) return null;
    
    try {
      const savedState = JSON.parse(savedStateStr);
      
      // Only restore if it's for the same workout and date
      if (savedState.workoutId !== workout?.id || savedState.date !== date) {
        return null;
      }
      
      console.log("Restoring saved workout state:", savedState);
      
      // Restore the workout state
      setSavedWorkoutState(savedState);
      setShowPauseModal(true);
      
      return savedState;
    } catch (error) {
      console.error("Error loading saved workout state:", error);
      return null;
    }
  };

  // Function to apply saved state
  const applyRestoredState = (savedState) => {
    // Set all the state values from the saved state
    setCurrentExerciseIndex(savedState.currentExerciseIndex);
    setCurrentState(savedState.currentState);
    setIsPlaying(false); // Always start paused
    setTimeElapsed(savedState.timeElapsed);
    setTotalTimeElapsed(savedState.totalTimeElapsed);
    
    // Restore exercise-specific state
    if (savedState.currentState === 'exercise') {
      setExerciseDuration(savedState.exerciseDuration);
      setExerciseDurationUnit(savedState.exerciseDurationUnit);
      setExerciseDistance(savedState.exerciseDistance);
      setExerciseIntensity(savedState.exerciseIntensity);
      setCurrentWeight(savedState.currentWeight);
      setCurrentReps(savedState.currentReps);
      setCurrentSets(savedState.currentSets);
      setTargetAlertPlayed(savedState.targetAlertPlayed || false);
    }
    
    // Restore progress
    setCompletedExercises(savedState.completedExercises);
    setCurrentSetNumber(savedState.currentSetNumber);
    setSetsCompleted(savedState.setsCompleted);
    
    // Restore water break tracking
    setWaterBreaks(savedState.waterBreaks);
    setNextWaterBreak(savedState.nextWaterBreak);
    
    // Restore interruption tracking
    setLastPauseTime(new Date(savedState.lastPauseTime));
    setTotalPauseDuration(savedState.totalPauseDuration);
    setInterruptionsCount(savedState.interruptionsCount);
  };

  // Add visibilitychange event handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App is losing focus/visibility
        if (isPlaying && currentState === 'exercise') {
          console.log('App lost focus - pausing workout timer');
          
          // Pause the timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          
          // Update state
          setIsPlaying(false);
          setLastPauseTime(new Date());
          setInterruptionsCount(prev => prev + 1);
          
          // Save the current state
          saveWorkoutState();
        }
      } else {
        // App regained focus - only show modal if we were previously playing
        if (localStorage.getItem('workout-player-state') && !showPauseModal) {
          const savedState = loadSavedWorkoutState();
          if (savedState) {
            setShowPauseModal(true);
          }
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, currentState, workout]);
  
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
    //if (!isMuted && sound.current) {
    //  sound.current.currentTime = 0;
    //  sound.current.play().catch(err => console.log('Audio error:', err));
    //}
  };

  // Calculate pause duration helper function
  const calculatePauseDuration = () => {
    if (!lastPauseTime) return 0;
    return Math.floor((new Date() - lastPauseTime) / 1000);
  };

  // Resume workout function with option to count elapsed time
  const resumeWorkout = (countElapsedTime = false) => {
    // Apply saved state if available
    if (savedWorkoutState) {
      applyRestoredState(savedWorkoutState);
      setSavedWorkoutState(null);
    }
    
    // Calculate pause duration
    const pauseDuration = calculatePauseDuration();
    
    if (countElapsedTime) {
      // If counting elapsed time (user was still exercising),
      // add the pause duration to the elapsed time
      setTimeElapsed(prev => prev + pauseDuration);
      setTotalTimeElapsed(prev => prev + pauseDuration);
      
      // Don't count this as an interruption
      if (interruptionsCount > 0) {
        setInterruptionsCount(prev => prev - 1);
      }
    } else {
      // Standard behavior - count as interruption
      setTotalPauseDuration(prev => prev + pauseDuration);
    }
    
    // Resume timer
    setIsPlaying(true);
    setShowPauseModal(false);
    
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      startTimer();
    }, 10);
    
    // Clear the saved state
    localStorage.removeItem('workout-player-state');
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

  // Start the timer - counts up instead of down
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        
        // For duration-based exercises, check if target duration is reached
        if (currentState === 'exercise' && 
            currentExercise?.isDurationBased && 
            exerciseDuration > 0) {
          
          // Calculate target duration in seconds
          const targetDurationInSeconds = exerciseDurationUnit === 'min' ? 
            exerciseDuration * 60 : exerciseDuration;
          
          // Play alert sound when target is reached (only once)
          if (newTime >= targetDurationInSeconds && !targetAlertPlayed) {
            // Play sound alert
            playSound(exerciseCompleteSound);
            triggerHapticFeedback('medium');
            setTargetAlertPlayed(true);
            
            // Show a visual indicator that target is reached
            showTargetReachedIndicator();
            
            // Don't auto-complete - let user continue or stop manually
          }
        }
        
        return newTime;
      });
      
      setTotalTimeElapsed(prev => prev + 1);
      
      // Check for water break
      if (nextWaterBreak && Math.floor(totalTimeElapsed / 60) >= nextWaterBreak) {
        triggerWaterBreak();
      }
    }, 1000);
  };

  // Add this function to create a visual indicator when target is reached
  const showTargetReachedIndicator = () => {
    // Create a notification element
    const notification = document.createElement('div');
    notification.className = 'wp-target-reached-notification';
    notification.textContent = 'Target duration reached!';
    
    // Add to the DOM
    const container = playerRef.current;
    if (container) {
      container.appendChild(notification);
      
      // Remove after animation completes
      setTimeout(() => {
        if (container.contains(notification)) {
          container.removeChild(notification);
        }
      }, 3000);
    }
  };

  // Handle duration-based exercise changes
  const handleExerciseDurationChange = (duration) => {
    setExerciseDuration(duration);
    
    setCompletedExercises(prev => {
      const updated = [...prev];
      updated[currentExerciseIndex] = {
        ...updated[currentExerciseIndex],
        actualDuration: duration
      };
      return updated;
    });
  };

  // Add this handler for duration unit changes
  const handleExerciseDurationUnitChange = (unit) => {
    setExerciseDurationUnit(unit);
    
    setCompletedExercises(prev => {
      const updated = [...prev];
      updated[currentExerciseIndex] = {
        ...updated[currentExerciseIndex],
        actualDurationUnit: unit
      };
      return updated;
    });
  };

  // Add this handler for distance changes in ExerciseView
  const handleExerciseDistanceChange = (distance) => {
    setExerciseDistance(distance);
    
    setCompletedExercises(prev => {
      const updated = [...prev];
      updated[currentExerciseIndex] = {
        ...updated[currentExerciseIndex],
        actualDistance: distance
      };
      return updated;
    });
  };

  // Add this handler for intensity changes
  const handleExerciseIntensityChange = (intensity) => {
    setExerciseIntensity(intensity);
    
    setCompletedExercises(prev => {
      const updated = [...prev];
      updated[currentExerciseIndex] = {
        ...updated[currentExerciseIndex],
        actualIntensity: intensity
      };
      return updated;
    });
  };

  // Complete current set or duration-based exercise
  const completeSet = () => {
    // Play the set complete sound
    playSound(setCompleteSound);
    triggerHapticFeedback('light');
    
    // Show set completion effect
    showSetCompletionEffect();
    
    // Update set times for duration-based exercises
    if (currentExercise.isDurationBased) {
      setCompletedExercises(prev => {
        const updated = [...prev];
        const exercise = updated[currentExerciseIndex];
        let updatedSetTimes = [...(exercise.setTimes || Array(exercise.sets || 1).fill(0))];
        
        // Update the current set's time
        updatedSetTimes[currentSetNumber - 1] = timeElapsed;
        
        updated[currentExerciseIndex] = {
          ...exercise,
          setTimes: updatedSetTimes
        };
        
        return updated;
      });
      
      // For duration-based exercises, check if we've completed all sets
      if (currentSetNumber >= currentSets) {
        // All sets complete, mark exercise as done
        completeExercise();
      } else {
        // Move to next set
        setCurrentSetNumber(prev => prev + 1);
        setSetsCompleted(prev => prev + 1);
        setTimeElapsed(0); // Reset timer for new set
      }
    } else {
      // Traditional sets/reps exercise handling
      if (currentSetNumber >= currentSets) {
        // All sets complete, mark exercise as done
        completeExercise();
      } else {
        // Move to next set
        setCurrentSetNumber(prev => prev + 1);
        setSetsCompleted(prev => prev + 1);
        setTimeElapsed(0); // Reset timer for new set
      }
    }

    // Check for achievements after completing sets
    setTimeout(() => {
      checkAchievements();
    }, 500);
  };

  const showSetCompletionEffect = () => {
    // Create the effect element
    const effectContainer = document.createElement('div');
    effectContainer.className = 'wp-set-completion-effect';
    
    // Create the inner content
    const innerContent = document.createElement('div');
    innerContent.className = 'wp-effect-content';
    
    // Create main text
    const completionText = document.createElement('div');
    completionText.className = 'wp-completion-text';
    completionText.textContent = 'SET COMPLETE!';
    
    // Create energy burst element
    const energyBurst = document.createElement('div');
    energyBurst.className = 'wp-energy-burst';
    
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
    effectContainer.className = 'wp-exercise-completion-effect';
    
    // Create the inner content
    const innerContent = document.createElement('div');
    innerContent.className = 'wp-effect-content';
    
    // Create main text
    const completionText = document.createElement('div');
    completionText.className = 'wp-completion-text';
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
    motivationalText.className = 'wp-motivational-text';
    motivationalText.textContent = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
    
    // Create confetti bursts
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'wp-confetti';
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
      const exercise = updated[currentExerciseIndex];
      
      if (exercise.isDurationBased) {
        // For duration-based exercises with sets
        let updatedSetTimes = [...(exercise.setTimes || Array(exercise.sets || 1).fill(0))];
        
        // Update the current set's time
        updatedSetTimes[currentSetNumber - 1] = timeElapsed;
        
        // Calculate total time spent
        const totalTimeSpent = updatedSetTimes.reduce((sum, time) => sum + time, 0);
        
        updated[currentExerciseIndex] = {
          ...exercise,
          completed: true,
          actualSets: currentSets, // We now track sets for duration-based exercises
          // Preserve exact duration values (don't subtract 1)
          actualDuration: exerciseDuration,
          actualDurationUnit: exerciseDurationUnit,
          actualDistance: exerciseDistance,
          actualIntensity: exerciseIntensity,
          setTimes: updatedSetTimes,
          timeSpent: totalTimeSpent // The total time is the sum of all set times
        };
      } else {
        // For traditional strength exercises
        updated[currentExerciseIndex] = {
          ...exercise,
          completed: true,
          actualSets: setsCompleted + 1, // +1 for current set
          actualReps: currentReps,
          actualWeight: currentWeight,
          timeSpent: timeElapsed
        };
      }
      
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
    effectContainer.className = 'wp-workout-completion-effect';
    
    // Create inner content
    const innerContent = document.createElement('div');
    innerContent.className = 'wp-effect-content';
    
    // Trophy icon
    const trophyIcon = document.createElement('div');
    trophyIcon.className = 'wp-trophy-icon';
    trophyIcon.innerHTML = '🏆';
    
    // Completion text
    const completionText = document.createElement('div');
    completionText.className = 'wp-completion-text';
    completionText.textContent = 'WORKOUT COMPLETE!';
    
    // Stats
    const statsText = document.createElement('div');
    statsText.className = 'wp-completion-stats';
    
    // Format total time
    const mins = Math.floor(totalTimeElapsed / 60);
    const secs = totalTimeElapsed % 60;
    const timeStr = `${mins}m ${secs}s`;
    
    statsText.textContent = `${workout.exercises.length} exercises • ${timeStr}`;
    
    // Add celebration particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'wp-celebration-particle';
      
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
    
    // Increment water break counter
    setWaterBreaksTaken(prev => prev + 1);
    
    // Save current exercise timer state to restore later
    setExerciseTimerSaved(timeElapsed);
    
    // Save current state to resume later
    const previousState = currentState;
    
    // Pause workout and show water break
    setCurrentState('waterBreak');
    setTimeElapsed(0); // Reset timer for water break
    
    // Pause timer if it's running
    if (isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Start a new timer for the water break
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    // Play water break sound
    playSound(waterBreakSound);
  };

  // Complete water break
  const completeWaterBreak = () => {
    // Stop the water break timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    console.log(`Adding ${timeElapsed} seconds to water break time`);
    
    // Add the current water break time to the total
    setWaterBreakTime(prev => prev + timeElapsed);
    
    updateNextWaterBreak();
    
    // Resume previous activity
    if (currentExerciseIndex < workout.exercises.length) {
      setCurrentState('exercise');
      setIsPlaying(true);
      
      // Restore the previous exercise timer
      setTimeElapsed(exerciseTimerSaved);
      
      // Start a new timer for the exercise
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
    
    // Clear any saved workout state
    localStorage.removeItem('workout-player-state');
    
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

  // Save workout results
  const saveWorkoutResults = (enhancedData = {}) => {
    const duration = Math.ceil(totalTimeElapsed / 60);
    
    // Process exercises to include all time data
    const processedExercises = completedExercises.map(exercise => {
      // Base exercise data
      const exerciseData = {
        ...exercise,
        notes: exercise.notes || '',
        completed: exercise.completed || false
      };
      
      // Ensure time spent data is preserved exactly as is
      if (exercise.isDurationBased) {
        exerciseData.timeSpent = exercise.timeSpent;
        exerciseData.setTimes = exercise.setTimes;
        
        // Don't modify duration values
        exerciseData.actualDuration = exercise.actualDuration;
        exerciseData.actualDurationUnit = exercise.actualDurationUnit;
      }
      
      return exerciseData;
    });
    
    // Create workout log data
    const workoutData = {
      workoutId: workout.id,
      name: workout.name,
      type: workout.type,
      duration,
      exercises: processedExercises,
      notes: enhancedData.notes || notes,
      // Include the enhanced metrics
      calories: enhancedData.calories || null,
      distance: enhancedData.distance || null,
      distanceUnit: enhancedData.distanceUnit || 'km',
      incline: enhancedData.incline || null,
      intensity: enhancedData.intensity || 'medium',
      // Add water break data - use automatically tracked values if not provided
      waterBreaksTaken: enhancedData.waterBreaksTaken || waterBreaksTaken,
      waterBreakTime: waterBreakTime
    };
    
    // Log the workout
    const completedWorkout = logWorkout(date, workoutData);
    
    // Call completion handler
    onComplete(completedWorkout);
  };

  // Handle going back
  const handleGoBack = () => {
    // Show confirmation if workout is in progress
    if (currentState !== 'ready' && currentState !== 'summary') {
      setShowCancelConfirmModal(true);
    } else {
      // If not started or already finished, just go back
      onClose();
    }
  };

  // If no workout loaded, show loader
  if (!workout) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`wp-vintage-loader theme-${theme}`}>
          <div className="wp-loader-inner"></div>
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
      className={`wp-player theme-${theme} ${activeView === 'cassette' ? 'wp-cassette-mode' : 'wp-workout-mode'}`}
      onClick={() => setShowControls(true)}
    >
      
      {/* View switcher tabs */}
      <div className="wp-view-tabs">
        <button 
          className={`wp-view-tab ${activeView === 'workout' ? 'wp-active' : ''}`}
          onClick={() => setActiveView('workout')}
        >
          <Zap size={18} />
          <span>Workout</span>
        </button>
        <button 
          className={`wp-view-tab ${activeView === 'cassette' ? 'wp-active' : ''}`}
          onClick={() => setActiveView('cassette')}
        >
          <Music size={18} />
          <span>Music</span>
        </button>
      </div>
      
      {/* Header with title and controls */}
      <div className={`wp-player-header ${showControls ? 'wp-visible' : 'wp-hidden'}`}>
        <button 
          onClick={handleGoBack}
          className="wp-player-button"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="wp-player-title">
          <h2>{workout.name}</h2>
          <div className="wp-player-timer">{formatTime(totalTimeElapsed)}</div>
        </div>
        <button 
          onClick={toggleFullscreen}
          className="wp-player-button"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>
      
      {/* View container */}
      <div className="wp-view-container">
        {/* Workout View */}
        <div className={`wp-player-view wp-workout-view ${activeView === 'workout' ? 'wp-active' : ''}`}>
          {/* Progress bar */}
          {currentState !== 'ready' && currentState !== 'summary' && (
            <div className="wp-progress-container">
              <div className="wp-progress-text">
                Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
                {currentState === 'exercise' && !currentExercise?.isDurationBased && ` • Set ${currentSetNumber} of ${currentSets}`}
                {currentState === 'exercise' && currentExercise?.isDurationBased && currentSets > 1 && ` • Set ${currentSetNumber} of ${currentSets}`}
                {currentState === 'exercise' && currentExercise?.isDurationBased && currentSets === 1 && ' • Duration-based'}
              </div>
              <div className="wp-progress-bar">
                <div 
                  className="wp-progress-fill"
                  style={{ 
                    width: `${((currentExerciseIndex + (currentState === 'rest' ? 0.5 : 0)) / workout.exercises.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Ready state */}
          {currentState === 'ready' && (
            <div className="wp-ready-state">
              <div className="wp-ready-icon">
                <Play size={40} />
              </div>
              <h3>Ready to start your workout?</h3>
              <p>
                {workout.exercises.length} exercises • {workout.duration} minutes
              </p>
              <button 
                onClick={startWorkout}
                className="wp-start-button"
              >
                <Play size={20} />
                Start Workout
              </button>
            </div>
          )}
          
          {/* Exercise state */}
          {currentState === 'exercise' && currentExercise && (
            <div className="wp-exercise-container">
              <ExerciseView 
                exercise={currentExercise}
                index={currentExerciseIndex + 1}
                total={workout.exercises.length}
                sets={currentSets}
                reps={currentReps}
                weight={currentWeight}
                duration={exerciseDuration}
                durationUnit={exerciseDurationUnit}
                distance={exerciseDistance}
                currentSet={currentSetNumber}
                totalSets={currentSets}
                timeElapsed={timeElapsed}
                onSetsChange={setCurrentSets}
                onRepsChange={setCurrentReps}
                onWeightChange={setCurrentWeight}
                onDurationChange={handleExerciseDurationChange}
                onDurationUnitChange={handleExerciseDurationUnitChange}
                onDistanceChange={handleExerciseDistanceChange}
                onIntensityChange={handleExerciseIntensityChange}
                theme={theme}
                workoutType={workout.type}
              />
              
              {/* Set completion button */}
              <button
                onClick={completeSet}
                className="wp-complete-set-button"
              >
                {currentExercise.isDurationBased ? 
                  (currentSets > 1 ? `Complete Set ${currentSetNumber}` : `Complete ${currentExercise.name}`) 
                  : `Complete Set ${currentSetNumber}`}
              </button>
            </div>
          )}
          
          {/* Rest state */}
          {currentState === 'rest' && (
            <div className="wp-rest-container">
              <RestPeriod 
                timeElapsed={timeElapsed}
                nextExercise={workout.exercises[currentExerciseIndex + 1]}
                theme={theme}
              />
              
              {/* Rest completion button */}
              <button
                onClick={completeRest}
                className="wp-complete-rest-button"
              >
                End Rest Period
              </button>
            </div>
          )}
          
          {/* Water break state */}
          {currentState === 'waterBreak' && (
            <div className="wp-waterbreak-container">
              <WaterBreakReminder 
                timeElapsed={timeElapsed}
                onSkip={completeWaterBreak}
                theme={theme}
              />
            </div>
          )}
          
          {/* Summary state */}
          {currentState === 'summary' && (
            <WorkoutSummary 
              workout={workout}
              completedExercises={completedExercises}
              totalTime={totalTimeElapsed}
              waterBreaksTaken={waterBreaksTaken}
              waterBreakTime={waterBreakTime}
              notes={notes}
              onNotesChange={setNotes}
              onSave={saveWorkoutResults}
              onClose={onClose}
              theme={theme}
            />
          )}
          
          {/* Achievement Popup */}
          {showAchievement && currentAchievement && (
            <div className="wp-achievement-popup">
              <div className="wp-achievement-icon">{currentAchievement.icon}</div>
              <div className="wp-achievement-content">
                <div className="wp-achievement-title">Achievement Unlocked!</div>
                <div className="wp-achievement-name">{currentAchievement.title}</div>
                <div className="wp-achievement-description">{currentAchievement.description}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Cassette View */}
        <div className={`wp-player-view wp-cassette-view ${activeView === 'cassette' ? 'wp-active' : ''}`}>
          <RetroTapePlayer isMuted={isMuted} theme={theme} />
        </div>
      </div>
      
      {/* Controls */}
      {currentState !== 'summary' && (
        <div className="wp-player-controls">
          <button 
            onClick={toggleMute}
            className="wp-control-button"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          
          <div className="wp-main-controls">
            {currentState !== 'ready' && currentExerciseIndex > 0 && (
              <button 
                onClick={goToPrevious}
                className="wp-control-button"
                disabled={currentExerciseIndex === 0}
              >
                <Rewind size={24} />
              </button>
            )}
            
            <button 
              onClick={togglePlayPause}
              className={`wp-play-button ${isPlaying ? 'wp-playing' : ''}`}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
            
            {currentState !== 'ready' && currentExerciseIndex < workout.exercises.length && (
              <button 
                onClick={skipToNext}
                className="wp-control-button"
              >
                <SkipForward size={24} />
              </button>
            )}
          </div>
          
          <button 
            onClick={triggerWaterBreak}
            className="wp-control-button wp-water-button"
          >
            <Droplet size={24} />
          </button>
        </div>
      )}
      
      {/* Cancel Confirmation Modal */}
      {showCancelConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                <X size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                End Workout?
              </h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to end this workout? This session will not be saved.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setShowCancelConfirmModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors order-1 sm:order-none"
              >
                Continue Workout
              </button>
              
              <button
                onClick={() => {
                  onClose();
                  localStorage.removeItem('workout-player-state');
                  setShowCancelConfirmModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <X size={20} />
                End Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Modal for interruptions */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <Pause size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                Workout Paused
              </h3>
            </div>
            
            {lastPauseTime && (
              <div className="mb-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                <p className="text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Pause duration:</span> {formatTime(calculatePauseDuration())}
                </p>
              </div>
            )}
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Your workout was paused. This could be due to screen lock or navigating away. How would you like to continue?
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => resumeWorkout(true)}
                className="px-4 py-2 rounded-lg bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Play size={20} />
                Continue with Elapsed Time
              </button>
              
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 italic">
                Use this option if you were still exercising while away from the app.
              </div>
              
              <button
                onClick={() => resumeWorkout(false)}
                className="px-4 py-2 rounded-lg bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Play size={20} />
                Continue from Pause
              </button>
              
              <button
                onClick={() => {
                  setShowPauseModal(false);
                  setShowCancelConfirmModal(true);
                  // Clear saved state
                  localStorage.removeItem('workout-player-state');
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                End Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlayer;