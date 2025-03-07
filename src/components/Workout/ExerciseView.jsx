import React from 'react';
import { Dumbbell, Repeat, Clock, List, Plus, Minus } from 'lucide-react';
import './ExerciseView.css';

const ExerciseView = ({ 
  exercise, 
  index, 
  total, 
  sets, 
  reps, 
  weight, 
  currentSet,
  totalSets,
  timeElapsed,
  onSetsChange, 
  onRepsChange, 
  onWeightChange,
  theme = 'modern'
}) => {
  // Handle increment/decrement of numeric values
  const adjustValue = (type, amount) => {
    switch(type) {
      case 'sets':
        onSetsChange(Math.max(1, parseInt(sets) + amount));
        break;
      case 'reps':
        onRepsChange(Math.max(1, parseInt(reps) + amount));
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
          <Dumbbell size={20} />
          <h3>{exercise.name}</h3>
        </div>
        <div className="exercise-timer">
          {formatTime(timeElapsed)}
        </div>
      </div>
      
      {/* Set indicator */}
      <div className="set-indicator">
        <div className="set-label">Set {currentSet} of {totalSets}</div>
        <div className="set-progress">
          {Array.from({ length: totalSets }).map((_, i) => (
            <div 
              key={i} 
              className={`set-circle ${i < currentSet - 1 ? 'completed' : i === currentSet - 1 ? 'current' : ''}`}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Exercise configuration */}
      <div className="exercise-controls">
        {/* Sets */}
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
        
        {/* Reps */}
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
        
        {/* Weight */}
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