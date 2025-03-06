import React from 'react';
import { Clock, ChevronRight, Activity } from 'lucide-react';

const RestPeriod = ({ 
  timeElapsed,  // Changed from timeRemaining to timeElapsed
  nextExercise, 
  retroMode = false, 
  vintageMode = false 
}) => {
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (vintageMode) {
    return (
      <div className="vintage-rest-period">
        <div className="rest-header">
          <Clock size={24} />
          <h3>Rest Period</h3>
        </div>
        
        <div className="rest-countdown">
          <div className="countdown-display">
            <div className="countdown-number">{formatTime(timeElapsed)}</div>
            <div className="countdown-unit">elapsed</div>
          </div>
        </div>
        
        <div className="rest-message">
          Take a breather before the next exercise
        </div>
        
        {/* Next exercise preview */}
        {nextExercise && (
          <div className="next-exercise">
            <div className="next-label">Up Next:</div>
            <div className="next-exercise-container">
              <div className="next-exercise-icon">
                <Activity size={20} />
              </div>
              <div className="next-exercise-name">
                {nextExercise.name}
              </div>
              <ChevronRight size={16} className="next-arrow" />
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Original version
  return (
    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 text-center transition-colors">
      {/* Original code */}
    </div>
  );
};

// Add updated styles
const style = document.createElement('style');
style.innerHTML = `
  /* Vintage Rest Period */
  .vintage-rest-period {
    background: #F5EAD5;
    border: 1px solid #C9B690;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    color: #8A7B59;
    font-family: 'VT323', monospace;
    margin-bottom: 20px;
  }
  
  /* Rest header */
  .rest-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    color: #5C4E33;
  }
  
  .rest-header h3 {
    font-size: 1.8rem;
    margin: 0;
  }
  
  /* Countdown display */
  .rest-countdown {
    margin-bottom: 20px;
  }
  
  .countdown-display {
    margin-bottom: 10px;
  }
  
  .countdown-number {
    font-size: 3rem;
    color: #8A7B59;
    font-weight: bold;
  }
  
  .countdown-unit {
    font-size: 1rem;
    color: #8A7B59;
  }
  
  /* Rest message */
  .rest-message {
    margin-bottom: 20px;
    color: #8A7B59;
    font-size: 1.1rem;
  }
  
  /* Next exercise */
  .next-exercise {
    text-align: left;
  }
  
  .next-label {
    margin-bottom: 5px;
    color: #8A7B59;
    font-size: 0.9rem;
  }
  
  .next-exercise-container {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #E5D8B9;
    border: 1px solid #C9B690;
    border-radius: 4px;
    padding: 10px;
  }
  
  .next-exercise-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: #F5EAD5;
    border: 1px solid #C9B690;
    border-radius: 4px;
    color: #8A7B59;
  }
  
  .next-exercise-name {
    flex: 1;
    font-size: 1.1rem;
    color: #5C4E33;
    font-weight: bold;
  }
  
  .next-arrow {
    color: #8A7B59;
  }
`;
document.head.appendChild(style);

export default RestPeriod;