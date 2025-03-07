import React from 'react';
import { Award, Clock, Dumbbell, Check, X, Save } from 'lucide-react';
import './WorkoutSummary.css';

const WorkoutSummary = ({ 
  workout, 
  completedExercises, 
  totalTime, 
  notes, 
  onNotesChange, 
  onSave, 
  onClose,
  theme = 'modern'
}) => {
  // Calculate statistics
  const exerciseCount = completedExercises.length;
  const completedCount = completedExercises.filter(ex => ex.completed).length;
  const completionRate = exerciseCount > 0 ? Math.round((completedCount / exerciseCount) * 100) : 0;
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  return (
    <div className={`workout-summary theme-${theme}`}>
      <div className="summary-header">
        <div className="summary-title">
          <Award size={24} className="summary-icon" />
          <h3>Workout Complete!</h3>
        </div>
        
        <div className="summary-stats">
          <div className="stat-item">
            <Clock size={18} />
            <span>{formatTime(totalTime)}</span>
          </div>
          <div className="stat-item">
            <Dumbbell size={18} />
            <span>{completedCount}/{exerciseCount} exercises</span>
          </div>
          <div className="stat-item">
            <div className="completion-badge" style={{ backgroundColor: getCompletionColor(completionRate) }}>
              {completionRate}%
            </div>
          </div>
        </div>
      </div>
      
      <div className="exercise-summary">
        <h4>Exercise Summary</h4>
        <div className="exercises-list">
          {completedExercises.map((exercise, index) => (
            <div 
              key={index} 
              className={`exercise-item ${exercise.completed ? 'completed' : 'incomplete'}`}
            >
              <div className="exercise-status">
                {exercise.completed ? 
                  <Check size={16} className="status-icon completed" /> : 
                  <X size={16} className="status-icon incomplete" />
                }
              </div>
              <div className="exercise-name">
                {exercise.name}
              </div>
              <div className="exercise-details">
                {exercise.completed && (
                  <span>
                    {exercise.actualSets || 0}×{exercise.actualReps || 0}
                    {exercise.actualWeight && ` @ ${exercise.actualWeight}`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="notes-section">
        <h4>Workout Notes</h4>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="How did your workout feel? Any personal records or challenges?"
          className="notes-input"
        />
      </div>
      
      <div className="summary-actions">
        <button onClick={onClose} className="cancel-button">
          <X size={18} />
          Close
        </button>
        <button onClick={onSave} className="save-button">
          <Save size={18} />
          Save Workout
        </button>
      </div>
    </div>
  );
};

// Helper function to get color based on completion rate
const getCompletionColor = (rate) => {
  if (rate >= 90) return '#10b981'; // Green
  if (rate >= 75) return '#3b82f6'; // Blue
  if (rate >= 50) return '#f59e0b'; // Yellow
  return '#ef4444'; // Red
};

export default WorkoutSummary;