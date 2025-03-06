import React from 'react';
import { Award, Clock, Dumbbell, CheckCircle, Save, BarChart2, X } from 'lucide-react';

const WorkoutSummary = ({ 
  workout, 
  completedExercises, 
  totalTime, 
  notes, 
  onNotesChange, 
  onSave, 
  onClose,
  vintageMode = false
}) => {
  // Calculate completion statistics
  const totalExercises = workout.exercises.length;
  const completedCount = completedExercises.filter(ex => ex.completed).length;
  const completionPercentage = Math.round((completedCount / totalExercises) * 100);
  
  // Format total time in minutes and seconds
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  // Get appropriate completion message
  const getCompletionMessage = () => {
    if (completionPercentage === 100) {
      return "Perfect! You completed all exercises.";
    } else if (completionPercentage >= 75) {
      return "Great job! You completed most of your workout.";
    } else if (completionPercentage >= 50) {
      return "Good effort! You made it through half your workout.";
    } else {
      return "Every bit counts! Keep it up next time.";
    }
  };
  
  if (vintageMode) {
    return (
      <div className="vintage-workout-summary">
        {/* Completion header */}
        <div className="vintage-summary-header">
          <div className="summary-icon">
            <Award size={30} />
          </div>
          <h3>Workout Complete!</h3>
          <p className="completion-message">{getCompletionMessage()}</p>
        </div>
        
        {/* Stats overview */}
        <div className="vintage-stats-grid">
          <div className="vintage-stat-box">
            <div className="stat-icon">
              <Clock size={20} />
            </div>
            <div className="stat-value">{Math.round(totalTime / 60)}</div>
            <div className="stat-label">Minutes</div>
          </div>
          
          <div className="vintage-stat-box">
            <div className="stat-icon">
              <Dumbbell size={20} />
            </div>
            <div className="stat-value">{completedCount}</div>
            <div className="stat-label">Exercises</div>
          </div>
          
          <div className="vintage-stat-box">
            <div className="stat-icon">
              <CheckCircle size={20} />
            </div>
            <div className="stat-value">{completionPercentage}%</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        
        {/* Exercise completion summary */}
        <div className="vintage-exercise-summary">
          <h4>Exercise Summary</h4>
          
          <div className="exercises-list">
            {completedExercises.map((exercise, index) => (
              <div 
                key={index}
                className={`exercise-item ${exercise.completed ? 'completed' : ''}`}
              >
                <div className="exercise-status">
                  {exercise.completed 
                    ? <CheckCircle size={14} /> 
                    : <X size={14} />
                  }
                </div>
                
                <div className="exercise-details">
                  <div className="exercise-name">{exercise.name}</div>
                  {exercise.completed && (
                    <div className="exercise-metrics">
                      {exercise.actualSets} sets × {exercise.actualReps} reps
                      {exercise.actualWeight && ` • ${exercise.actualWeight}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Notes field */}
        <div className="vintage-notes-field">
          <label>Workout Notes</label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="How did you feel during this workout? Any achievements or challenges?"
            className="vintage-textarea"
          />
        </div>
        
        {/* Action buttons */}
        <div className="vintage-action-buttons">
          <button
            onClick={onSave}
            className="vintage-save-button"
          >
            <Save size={18} />
            Save Workout
          </button>
          
          <button
            onClick={onClose}
            className="vintage-discard-button"
          >
            <X size={18} />
            Discard
          </button>
        </div>
      </div>
    );
  }
  
  // Original version
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 transition-colors">
      {/* Original code */}
    </div>
  );
};

// Add vintage summary styles
const style = document.createElement('style');
style.innerHTML = `
  /* Vintage Workout Summary */
  .vintage-workout-summary {
    background: #F5EAD5;
    border: 1px solid #C9B690;
    border-radius: 8px;
    padding: 20px;
    color: #8A7B59;
    font-family: 'VT323', monospace;
  }
  
  /* Summary header */
  .vintage-summary-header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .summary-icon {
    width: 60px;
    height: 60px;
    background: #E5D8B9;
    border: 2px solid #C9B690;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px;
    color: #8A7B59;
  }
  
  .vintage-summary-header h3 {
    font-size: 1.8rem;
    color: #5C4E33;
    margin-bottom: 5px;
  }
  
  .completion-message {
    color: #8A7B59;
  }
  
  /* Stats grid */
  .vintage-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .vintage-stat-box {
    background: #E5D8B9;
    border: 1px solid #C9B690;
    border-radius: 8px;
    padding: 15px 10px;
    text-align: center;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    background: #F5EAD5;
    border: 1px solid #C9B690;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 5px;
    color: #8A7B59;
  }
  
  .stat-value {
    font-size: 1.8rem;
    font-weight: bold;
    color: #5C4E33;
  }
  
  .stat-label {
    font-size: 0.8rem;
    color: #8A7B59;
  }
  
  /* Exercise summary */
  .vintage-exercise-summary {
    margin-bottom: 20px;
  }
  
  .vintage-exercise-summary h4 {
    font-size: 1.2rem;
    color: #5C4E33;
    margin-bottom: 10px;
  }
  
  .exercises-list {
    max-height: 200px;
    overflow-y: auto;
    background: #E5D8B9;
    border: 1px solid #C9B690;
    border-radius: 8px;
    padding: 10px;
  }
  
  .exercise-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px;
    border-bottom: 1px solid rgba(201, 182, 144, 0.5);
  }
  
  .exercise-item:last-child {
    border-bottom: none;
  }
  
  .exercise-item.completed {
    background: rgba(201, 182, 144, 0.2);
  }
  
  .exercise-status {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #C9B690;
    flex-shrink: 0;
  }
  
  .exercise-item.completed .exercise-status {
    color: #8A7B59;
  }
  
  .exercise-details {
    flex: 1;
  }
  
  .exercise-name {
    font-weight: bold;
    color: #5C4E33;
  }
  
  .exercise-metrics {
    font-size: 0.8rem;
    color: #8A7B59;
  }
  
  /* Notes field */
  .vintage-notes-field {
    margin-bottom: 20px;
  }
  
  .vintage-notes-field label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #5C4E33;
  }
  
  .vintage-textarea {
    width: 100%;
    height: 100px;
    background: #E5D8B9;
    border: 1px solid #C9B690;
    border-radius: 8px;
    padding: 10px;
    font-family: 'VT323', monospace;
    color: #5C4E33;
    resize: vertical;
  }
  
  .vintage-textarea:focus {
    outline: none;
    border-color: #8A7B59;
  }
  
  /* Action buttons */
  .vintage-action-buttons {
    display: flex;
    gap: 10px;
  }
  
  .vintage-save-button, .vintage-discard-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border-radius: 8px;
    font-family: 'VT323', monospace;
    font-size: 1rem;
  }
  
  .vintage-save-button {
    background: #C9B690;
    border: 1px solid #8A7B59;
    color: #5C4E33;
  }
  
  .vintage-save-button:active {
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  .vintage-discard-button {
    background: #F5EAD5;
    border: 1px solid #C9B690;
    color: #8A7B59;
  }
  
  .vintage-discard-button:active {
    background: #E5D8B9;
  }
  
  /* Responsive adjustments */
  @media (max-width: 576px) {
    .vintage-stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .vintage-stat-box:last-child {
      grid-column: span 2;
    }
    
    .vintage-action-buttons {
      flex-direction: column;
    }
  }
`;
document.head.appendChild(style);

export default WorkoutSummary;