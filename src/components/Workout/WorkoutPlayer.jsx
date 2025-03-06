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
    playSound(clickSound);
    
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
  };

  // Complete the current exercise
  const completeExercise = () => {
    // Mark current exercise as completed
    markCurrentExerciseCompleted();
    
    // Move to rest period
    setCurrentState('rest');
    setTimeElapsed(0); // Reset timer for rest period
    
    // Play complete sound
    playSound(completeSound);
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
      // All exercises completed
      endWorkout();
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
    if (currentState !== 'ready' && currentState !== 'summary') {
      // Show controls when state changes
      setShowControls(true);
      
      // Set up a timer to hide controls after 5 seconds
      const hideControlsTimer = setTimeout(() => {
        if (isPlaying) { // Only hide if playing
          setShowControls(false);
        }
      }, 5000);
      
      return () => clearTimeout(hideControlsTimer);
    }
  }, [currentState, isPlaying]);

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
        <div className="vintage-loader">
          <div className="loader-inner"></div>
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
      className={`vintage-workout-player ${activeView === 'cassette' ? 'cassette-mode' : 'workout-mode'}`}
      onClick={() => setShowControls(true)}
    >
      {/* View switcher tabs */}
      <div className="vintage-view-tabs">
        <button 
          className={`vintage-tab ${activeView === 'workout' ? 'active' : ''}`}
          onClick={() => setActiveView('workout')}
        >
          <Zap size={18} />
          <span>Workout</span>
        </button>
        <button 
          className={`vintage-tab ${activeView === 'cassette' ? 'active' : ''}`}
          onClick={() => setActiveView('cassette')}
        >
          <Music size={18} />
          <span>Cassette</span>
        </button>
      </div>
      
      {/* Header with title and controls */}
      <div className={`vintage-header ${showControls ? 'visible' : 'hidden'}`}>
        <button 
          onClick={onClose}
          className="vintage-button"
        >
          <X size={20} />
        </button>
        <div className="vintage-title">
          <h2>{workout.name}</h2>
          <div className="vintage-timer">{formatTime(totalTimeElapsed)}</div>
        </div>
        <button 
          onClick={toggleFullscreen}
          className="vintage-button"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>
      
      {/* View container */}
      <div className={`vintage-view-container ${showControls ? 'controls-visible' : 'controls-hidden'}`}>
        {/* Workout View */}
        <div className={`vintage-view workout-view ${activeView === 'workout' ? 'active' : ''}`}>
          {/* Progress bar */}
          {currentState !== 'ready' && currentState !== 'summary' && (
            <div className="vintage-progress">
              <div className="progress-text">
                Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
                {currentState === 'exercise' && ` • Set ${currentSetNumber} of ${currentSets}`}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${((currentExerciseIndex + (currentState === 'rest' ? 0.5 : 0)) / workout.exercises.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Ready state */}
          {currentState === 'ready' && (
            <div className="vintage-ready-state">
              <div className="ready-icon">
                <Play size={40} />
              </div>
              <h3>Ready to start your workout?</h3>
              <p>
                {workout.exercises.length} exercises • {workout.duration} minutes
              </p>
              <button 
                onClick={startWorkout}
                className="vintage-start-button"
              >
                <Play size={20} />
                Start Workout
              </button>
            </div>
          )}
          
          {/* Exercise state */}
          {currentState === 'exercise' && currentExercise && (
            <div className="vintage-exercise-container">
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
                className="vintage-complete-set-button"
              >
                Complete Set {currentSetNumber}
              </button>
            </div>
          )}
          
          {/* Rest state */}
          {currentState === 'rest' && (
            <div className="vintage-rest-container">
              <RestPeriod 
                timeElapsed={timeElapsed} // Now passing timeElapsed
                nextExercise={workout.exercises[currentExerciseIndex + 1]}
                vintageMode={true}
              />
              
              {/* Rest completion button */}
              <button
                onClick={completeRest}
                className="vintage-complete-rest-button"
              >
                End Rest Period
              </button>
            </div>
          )}
          
          {/* Water break state */}
          {currentState === 'waterBreak' && (
            <div className="vintage-waterbreak-container">
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
        </div>
        
        {/* Cassette View */}
        <div className={`vintage-view cassette-view ${activeView === 'cassette' ? 'active' : ''}`}>
          <RetroTapePlayer isMuted={isMuted} />
        </div>
      </div>
      
      {/* Controls */}
      {currentState !== 'summary' && (
        <div className={`vintage-controls ${showControls ? 'visible' : 'hidden'}`}>
          <button 
            onClick={toggleMute}
            className="vintage-control-button"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          
          <div className="vintage-main-controls">
            {currentState !== 'ready' && currentExerciseIndex > 0 && (
              <button 
                onClick={goToPrevious}
                className="vintage-control-button"
                disabled={currentExerciseIndex === 0}
              >
                <Rewind size={24} />
              </button>
            )}
            
            <button 
              onClick={togglePlayPause}
              className={`vintage-play-button ${isPlaying ? 'playing' : ''}`}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
            
            {currentState !== 'ready' && currentExerciseIndex < workout.exercises.length && (
              <button 
                onClick={skipToNext}
                className="vintage-control-button"
              >
                <SkipForward size={24} />
              </button>
            )}
          </div>
          
          <button 
            onClick={triggerWaterBreak}
            className="vintage-control-button water-button"
          >
            <Droplet size={24} />
          </button>
        </div>
      )}
      
      {/* Next water break indicator */}
      {nextWaterBreak && showControls && currentState !== 'ready' && currentState !== 'summary' && (
        <div className="vintage-water-indicator">
          <Droplet size={14} />
          <span>Next break: {nextWaterBreak}min</span>
        </div>
      )}
      
      {/* Tap to show controls hint - shows briefly when controls are hidden */}
      {!showControls && (
        <div className="tap-hint">
          Tap to show controls
        </div>
      )}
    </div>
  );
};

// Add enhanced vintage styling with fixed issues
const style = document.createElement('style');
style.innerHTML = `
  /* Vintage styling for workout player */
  @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
  
  .vintage-workout-player {
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
  .vintage-loader {
    width: 50px;
    height: 50px;
    background: #E5D8B9;
    border-radius: 50%;
    border: 3px solid #C9B690;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    animation: loaderPulse 1.5s infinite ease-in-out;
  }
  
  .loader-inner {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 3px solid #8A7B59;
    border-top-color: transparent;
    animation: loaderSpin 1s infinite linear;
  }
  
  @keyframes loaderPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  @keyframes loaderSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* View tabs */
  .vintage-view-tabs {
    display: flex;
    background: #E5D8B9;
    padding: 4px;
    border-bottom: 2px solid #C9B690;
    z-index: 5;
  }
  
  .vintage-tab {
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
  
  .vintage-tab.active {
    background: #C9B690;
    color: #5C4E33;
    font-weight: bold;
  }
  
  /* Header styling */
  .vintage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #E5D8B9;
    border-bottom: 2px solid #C9B690;
    transition: transform 0.3s ease;
    z-index: 5;
  }
  
  .vintage-header.hidden {
    transform: translateY(-100%);
  }
  
  .vintage-button {
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
  
  .vintage-button:active {
    transform: scale(0.95);
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  .vintage-title {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .vintage-title h2 {
    font-size: 1.2rem;
    margin: 0;
    color: #5C4E33;
  }
  
  .vintage-timer {
    font-size: 1rem;
    color: #8A7B59;
  }
  
  /* Main content container */
  .vintage-view-container {
    flex: 1;
    position: relative;
    overflow: hidden;
    transition: padding 0.3s ease;
  }
  
  .vintage-view-container.controls-hidden {
    padding-bottom: 0;
  }
  
  .vintage-view-container.controls-visible {
    padding-bottom: 80px;
  }
  
  /* Fixed view styling to prevent overlap */
  .vintage-view {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease, opacity 0.3s ease;
    overflow-y: auto;
    padding: 20px;
  }
  
  .workout-view {
    transform: translateX(-100%);
    opacity: 0;
  }
  
  .cassette-view {
    transform: translateX(100%);
    opacity: 0;
  }
  
  .workout-mode .workout-view {
    transform: translateX(0);
    opacity: 1;
  }
  
  .workout-mode .cassette-view {
    transform: translateX(100%);
    opacity: 0;
  }
  
  .cassette-mode .workout-view {
    transform: translateX(-100%);
    opacity: 0;
  }
  
  .cassette-mode .cassette-view {
    transform: translateX(0);
    opacity: 1;
  }
  
  /* Progress bar */
  .vintage-progress {
    margin-bottom: 20px;
  }
  
  .progress-text {
    font-size: 0.9rem;
    margin-bottom: 4px;
    color: #8A7B59;
    text-align: center;
  }
  
  .progress-bar {
    height: 8px;
    background: #E5D8B9;
    border: 1px solid #C9B690;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: #C9B690;
    transition: width 0.3s ease;
  }
  
  /* Ready state */
  .vintage-ready-state {
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
  
  .ready-icon {
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
  
  .vintage-ready-state h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #5C4E33;
  }
  
  .vintage-ready-state p {
    margin-bottom: 30px;
    color: #8A7B59;
  }
  
  .vintage-start-button {
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
  
  .vintage-start-button:active {
    transform: scale(0.95);
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  /* Complete Set Button */
  .vintage-complete-set-button {
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
  
  .vintage-complete-set-button:active {
    transform: scale(0.98);
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  /* Rest completion button */
  .vintage-complete-rest-button {
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
  
  .vintage-complete-rest-button:active {
    transform: scale(0.98);
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  /* Controls */
  .vintage-controls {
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
  
  .vintage-controls.hidden {
    transform: translateY(100%);
  }
  
  .vintage-main-controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .vintage-control-button {
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
  .water-button {
    background: #C9B690;
    color: #5C4E33;
  }
  
  .water-button:active {
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  .vintage-control-button:active {
    transform: scale(0.95);
    background: #C9B690;
    color: #5C4E33;
  }
  
  .vintage-control-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .vintage-play-button {
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
  
  .vintage-play-button.playing {
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  .vintage-play-button:active {
    transform: scale(0.95);
  }
  
  /* Water break indicator */
  .vintage-water-indicator {
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
  .tap-hint {
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
    animation: fadeInOut 3s forwards;
    z-index: 5;
    pointer-events: none;
  }
  
  @keyframes fadeInOut {
    0% { opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; }
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .vintage-title h2 {
      font-size: 1rem;
    }
    
    .vintage-timer {
      font-size: 0.8rem;
    }
    
    .vintage-play-button {
      width: 50px;
      height: 50px;
    }
    
    .vintage-control-button {
      width: 36px;
      height: 36px;
    }
    
    .vintage-start-button {
      padding: 10px 20px;
      font-size: 1rem;
    }
  }
`;
document.head.appendChild(style);

export default WorkoutPlayer;