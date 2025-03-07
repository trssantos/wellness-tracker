import React, { useState, useEffect } from 'react';
import { Droplet, ArrowRight } from 'lucide-react';
import './WaterBreakReminder.css';

const WaterBreakReminder = ({ 
  timeElapsed,
  onSkip,
  theme = 'modern'
}) => {
  // Local timer state
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
  
  // Use either the parent timeElapsed (if updating) or our local time
  const displayTime = timeElapsed > 0 && timeElapsed !== localTime ? timeElapsed : localTime;
  
  return (
    <div className={`water-break theme-${theme}`}>
      <div className="water-break-header">
        <div className="water-animation-container">
          <Droplet size={30} className="water-icon" />
          <div className="ripple-circle ripple-1"></div>
          <div className="ripple-circle ripple-2"></div>
          <div className="ripple-circle ripple-3"></div>
        </div>
        <h3>Water Break</h3>
      </div>
      
      <div className="water-droplets">
        <div className="droplet"></div>
        <div className="droplet"></div>
        <div className="droplet"></div>
        <div className="droplet"></div>
      </div>
      
      <div className="water-countdown">
        <div className="water-countdown-number">{formatTime(displayTime)}</div>
        <div className="water-countdown-unit">elapsed</div>
      </div>
      
      <div className="water-break-message">
        Stay hydrated! Take a moment to drink some water.
      </div>
      
      <button
        onClick={onSkip}
        className="continue-button"
      >
        <span>Continue</span>
        <ArrowRight size={16} />
      </button>
      
      <div className="hydration-tips">
        <div className="tips-header">Hydration Tips:</div>
        <ul className="tips-list">
          <li>Drink small sips rather than large amounts</li>
          <li>Room temperature water is easier to absorb</li>
          <li>Aim for 16-20 oz of water per hour of exercise</li>
        </ul>
      </div>
    </div>
  );
};

export default WaterBreakReminder;