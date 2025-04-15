import React from 'react';
import { Dumbbell, Repeat, Clock, List, Plus, Minus, Route } from 'lucide-react';
import './ExerciseView.css';

const ExerciseView = ({ 
  exercise, 
  index, 
  total, 
  sets, 
  reps, 
  weight, 
  duration,
  durationUnit = 'min', // Add unit parameter (min or sec)
  distance,
  currentSet,
  totalSets,
  timeElapsed,
  onSetsChange, 
  onRepsChange, 
  onWeightChange,
  onDurationChange,
  onDistanceChange,
  theme = 'modern',
  workoutType = 'strength' // New prop to determine UI mode
}) => {
  // Determine if we're showing a duration-based exercise
  const isDurationBased = exercise.isDurationBased || workoutType === 'cardio' || 
                          workoutType === 'running' || workoutType === 'swimming' || 
                          workoutType === 'cycling' || workoutType === 'walking' || 
                          workoutType === 'yoga' || workoutType === 'pilates' || 
                          workoutType === 'flexibility';

  // Get the actual duration in seconds (for progress calculation)
  const durationInSeconds = durationUnit === 'min' ? 
    (duration || 0) * 60 : 
    (duration || 0);

  // Format the duration display with appropriate unit
  const formatDurationDisplay = () => {
    const value = duration || 0;
    return `${value} ${durationUnit === 'min' ? 'min' : 'sec'}`;
  };

  // Handle increment/decrement of numeric values
  const adjustValue = (type, amount) => {
    switch(type) {
      case 'sets':
        onSetsChange(Math.max(1, parseInt(sets) + amount));
        break;
      case 'reps':
        onRepsChange(Math.max(1, parseInt(reps) + amount));
        break;
      case 'duration':
        if (onDurationChange) {
          onDurationChange(Math.max(1, (parseInt(duration) || 0) + amount));
        }
        break;
      default:
        break;
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={`exercise-view theme-${theme}`}>
      {/* Exercise header */}
      <div className="exercise-header">
        <div className="exercise-name">
          {isDurationBased ? <Route size={20} /> : <Dumbbell size={20} />}
          <h3>{exercise.name}</h3>
        </div>
        <div className="exercise-timer">
          {formatTime(timeElapsed)}
        </div>
      </div>
      
      {/* Set indicator - show for ALL exercises now, including duration-based */}
      <div className="set-indicator">
        <div className="set-label">
          {isDurationBased 
            ? `Set ${currentSet} of ${totalSets} • Target: ${formatDurationDisplay()}`
            : `Set ${currentSet} of ${totalSets}`
          }
          {isDurationBased && durationInSeconds > 0 && timeElapsed > 0 && (
            <span className="text-xs ml-2">
              ({Math.round((timeElapsed / durationInSeconds) * 100)}%)
            </span>
          )}
        </div>
        <div className="set-progress">
          {Array.from({ length: totalSets }).map((_, i) => (
            <div 
              key={i} 
              className={`set-circle ${i < currentSet - 1 ? 'completed' : i === currentSet - 1 ? 'current' : ''}`}
            ></div>
          ))}
        </div>
        
        {/* Duration progress bar - only for duration-based exercises */}
        {isDurationBased && (
          <div className="duration-progress">
            <div className="duration-progress-bar" 
              style={{ width: `${durationInSeconds > 0 ? Math.min(100, (timeElapsed / durationInSeconds) * 100) : 0}%` }}>
            </div>
          </div>
        )}
      </div>
      
      {/* Exercise configuration - different UI based on workout type */}
      <div className="exercise-controls">
        {/* Sets control - now shown for ALL exercise types */}
        <div className="control-group">
          <div className="control-label">
            <Repeat size={16} />
            <span>Sets</span>
          </div>
          <div className="control-inputs">
            <button 
              onClick={() => adjustValue('sets', -1)}
              className="adjust-btn"
              disabled={sets <= 1}
            >
              <Minus size={14} />
            </button>
            <div className="value-display">{sets}</div>
            <button 
              onClick={() => adjustValue('sets', 1)}
              className="adjust-btn"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
            
        {isDurationBased ? (
          // Duration-based exercise inputs
          <>
            <div className="control-group">
              <div className="control-label">
                <Clock size={16} />
                <span>Duration</span>
              </div>
              <div className="control-inputs">
                <button 
                  onClick={() => adjustValue('duration', -1)}
                  className="adjust-btn"
                  disabled={(duration || 0) <= 1}
                >
                  <Minus size={14} />
                </button>
                <div className="value-display">{duration || 0}</div>
                <button 
                  onClick={() => adjustValue('duration', 1)}
                  className="adjust-btn"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="text-xs text-center mt-1">
                {durationUnit}
              </div>
            </div>
            
            <div className="control-group">
              <div className="control-label">
                <Route size={16} />
                <span>Distance</span>
              </div>
              <div className="weight-input">
                <input
                  type="text"
                  value={distance || ''}
                  onChange={(e) => onDistanceChange && onDistanceChange(e.target.value)}
                  className="text-input"
                  placeholder="km/mi"
                />
              </div>
            </div>
          </>
        ) : (
          // Traditional strength controls
          <>  
            <div className="control-group">
              <div className="control-label">
                <List size={16} />
                <span>Reps</span>
              </div>
              <div className="control-inputs">
                <button 
                  onClick={() => adjustValue('reps', -1)}
                  className="adjust-btn"
                  disabled={reps <= 1}
                >
                  <Minus size={14} />
                </button>
                <div className="value-display">{reps}</div>
                <button 
                  onClick={() => adjustValue('reps', 1)}
                  className="adjust-btn"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            
            <div className="control-group">
              <div className="control-label">
                <Dumbbell size={16} />
                <span>Weight</span>
              </div>
              <div className="weight-input">
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => onWeightChange(e.target.value)}
                  className="text-input"
                  placeholder="lbs"
                />
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Exercise notes */}
      {exercise.notes && (
        <div className="exercise-notes">
          <p>{exercise.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ExerciseView;