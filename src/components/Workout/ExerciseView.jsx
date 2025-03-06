import React from 'react';
import { Dumbbell, Repeat, Clock, List, Plus, Minus } from 'lucide-react';

const ExerciseView = ({ 
  exercise, 
  index, 
  total, 
  sets, 
  reps, 
  weight, 
  currentSet,
  totalSets,
  timeElapsed, // Changed from timeRemaining to timeElapsed
  onSetsChange, 
  onRepsChange, 
  onWeightChange,
  retroMode = false,
  vintageMode = false
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
  
  if (vintageMode) {
    return (
      <div className="vintage-exercise-view">
        {/* Exercise header */}
        <div className="vintage-exercise-header">
          <div className="exercise-name">
            <Dumbbell size={20} />
            <h3>{exercise.name}</h3>
          </div>
          <div className="exercise-timer">
            {formatTime(timeElapsed)}
          </div>
        </div>
        
        {/* Set indicator */}
        <div className="vintage-set-indicator">
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
        <div className="vintage-exercise-controls">
          {/* Sets */}
          <div className="vintage-control-group">
            <div className="control-label">
              <Repeat size={16} />
              <span>Sets</span>
            </div>
            <div className="control-inputs">
              <button 
                onClick={() => adjustValue('sets', -1)}
                className="vintage-adjust-btn"
                disabled={sets <= 1}
              >
                <Minus size={14} />
              </button>
              <div className="vintage-value">{sets}</div>
              <button 
                onClick={() => adjustValue('sets', 1)}
                className="vintage-adjust-btn"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          
          {/* Reps */}
          <div className="vintage-control-group">
            <div className="control-label">
              <List size={16} />
              <span>Reps</span>
            </div>
            <div className="control-inputs">
              <button 
                onClick={() => adjustValue('reps', -1)}
                className="vintage-adjust-btn"
                disabled={reps <= 1}
              >
                <Minus size={14} />
              </button>
              <div className="vintage-value">{reps}</div>
              <button 
                onClick={() => adjustValue('reps', 1)}
                className="vintage-adjust-btn"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          
          {/* Weight */}
          <div className="vintage-control-group">
            <div className="control-label">
              <Dumbbell size={16} />
              <span>Weight</span>
            </div>
            <div className="weight-input">
              <input
                type="text"
                value={weight}
                onChange={(e) => onWeightChange(e.target.value)}
                className="vintage-text-input"
                placeholder="lbs"
              />
            </div>
          </div>
        </div>
        
        {/* Exercise notes */}
        {exercise.notes && (
          <div className="vintage-exercise-notes">
            <p>{exercise.notes}</p>
          </div>
        )}
      </div>
    );
  }
  
  // Original version
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 transition-all">
      {/* Original version code */}
    </div>
  );
};

// Add updated styles
const style = document.createElement('style');
style.innerHTML = `
  /* Vintage Exercise View */
  .vintage-exercise-view {
    background: #F5EAD5;
    border: 1px solid #C9B690;
    border-radius: 8px;
    padding: 20px;
    color: #8A7B59;
    font-family: 'VT323', monospace;
    margin-bottom: 20px;
  }
  
  /* Exercise header */
  .vintage-exercise-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .exercise-name {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #5C4E33;
  }
  
  .exercise-name h3 {
    font-size: 1.2rem;
    margin: 0;
  }
  
  .exercise-timer {
    font-size: 1.8rem;
    color: #8A7B59;
    font-weight: bold;
    background: #E5D8B9;
    padding: 5px 12px;
    border: 1px solid #C9B690;
    border-radius: 4px;
  }
  
  /* Set indicator */
  .vintage-set-indicator {
    margin-bottom: 20px;
    text-align: center;
  }
  
  .set-label {
    font-size: 1rem;
    color: #5C4E33;
    margin-bottom: 5px;
  }
  
  .set-progress {
    display: flex;
    justify-content: center;
    gap: 5px;
  }
  
  .set-circle {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #E5D8B9;
    border: 1px solid #C9B690;
  }
  
  .set-circle.completed {
    background: #C9B690;
    border-color: #8A7B59;
  }
  
  .set-circle.current {
    background: #E5D8B9;
    border-color: #8A7B59;
    box-shadow: 0 0 0 2px rgba(138, 123, 89, 0.3);
  }
  
  /* Controls */
  .vintage-exercise-controls {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .vintage-control-group {
    background: #E5D8B9;
    border: 1px solid #C9B690;
    border-radius: 4px;
    padding: 10px;
  }
  
  .control-label {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 8px;
    color: #5C4E33;
    font-size: 0.9rem;
  }
  
  .control-inputs {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 5px;
  }
  
  .vintage-adjust-btn {
    width: 30px;
    height: 30px;
    background: #F5EAD5;
    border: 1px solid #C9B690;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8A7B59;
  }
  
  .vintage-adjust-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .vintage-value {
    font-size: 1.5rem;
    color: #5C4E33;
    font-weight: bold;
  }
  
  .weight-input {
    width: 100%;
  }
  
  .vintage-text-input {
    width: 100%;
    background: #F5EAD5;
    border: 1px solid #C9B690;
    border-radius: 4px;
    padding: 5px;
    text-align: center;
    font-family: 'VT323', monospace;
    font-size: 1.2rem;
    color: #5C4E33;
  }
  
  /* Notes */
  .vintage-exercise-notes {
    background: #E5D8B9;
    border: 1px solid #C9B690;
    border-radius: 4px;
    padding: 10px;
    color: #5C4E33;
    font-size: 0.9rem;
  }
  
  /* Responsive adjustments */
  @media (max-width: 576px) {
    .vintage-exercise-controls {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .vintage-control-group:last-child {
      grid-column: span 2;
    }
  }
`;
document.head.appendChild(style);

export default ExerciseView;