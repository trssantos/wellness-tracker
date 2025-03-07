import React, { useState, useEffect } from 'react';
import { Clock, ChevronRight, Activity } from 'lucide-react';
import './RestPeriod.css';

const RestPeriod = ({ 
  timeElapsed,
  nextExercise, 
  theme = 'modern'
}) => {
  // Local timer state (separate from parent component)
  const [localTime, setLocalTime] = useState(0);
  
  // Start a local timer to ensure time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTime(prevTime => prevTime + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={`rest-period theme-${theme}`}>
      <div className="rest-header">
        <Clock size={24} className="rest-clock-icon" />
        <h3>Rest Period</h3>
      </div>
      
      <div className="rest-countdown">
        <div className="countdown-number">{formatTime(localTime)}</div>
        <div className="countdown-unit">elapsed</div>
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
};

export default RestPeriod;