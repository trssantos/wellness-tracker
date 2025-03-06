import React from 'react';
import { Droplet, ArrowRight } from 'lucide-react';

const WaterBreakReminder = ({ 
  timeElapsed, // Changed from timeRemaining to timeElapsed
  onSkip, 
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
      <div className="vintage-water-break">
        <div className="water-break-header">
  <div className="water-animation-container">
    <Droplet size={30} />
    <div className="ripple-circle ripple-1"></div>
    <div className="ripple-circle ripple-2"></div>
    <div className="ripple-circle ripple-3"></div>
  </div>
  <h3>Water Break</h3>
  <div className="water-droplets">
    <div className="droplet"></div>
    <div className="droplet"></div>
    <div className="droplet"></div>
    <div className="droplet"></div>
  </div>
</div>
        
        <div className="water-countdown">
          <div className="water-countdown-display">
            <div className="water-countdown-number">{formatTime(timeElapsed)}</div>
            <div className="water-countdown-unit">elapsed</div>
          </div>
        </div>
        
        <div className="water-break-message">
          Stay hydrated! Take a moment to drink some water.
        </div>
        
        <button
          onClick={onSkip}
          className="vintage-continue-button"
        >
          <span>Continue</span>
          <ArrowRight size={16} />
        </button>
        
        <div className="vintage-hydration-tips">
          <div className="tips-header">Hydration Tips:</div>
          <ul className="tips-list">
            <li>Drink small sips rather than large amounts</li>
            <li>Room temperature water is easier to absorb</li>
            <li>Aim for 16-20 oz of water per hour of exercise</li>
          </ul>
        </div>
      </div>
    );
  }
  
  // Original version
  return (
    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-6 text-center transition-colors">
      {/* Original code */}
    </div>
  );
};

// Add updated styles
const style = document.createElement('style');
style.innerHTML = `
  /* Vintage Water Break */
  .vintage-water-break {
    background: #F5EAD5;
    border: 1px solid #C9B690;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    color: #8A7B59;
    font-family: 'VT323', monospace;
    margin-bottom: 20px;
  }
  
  /* Water break header */
  .water-break-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    color: #5C4E33;
  }
  
  .water-break-header h3 {
    font-size: 1.8rem;
    margin: 0;
  }
  
  /* Countdown display */
  .water-countdown {
    margin-bottom: 20px;
  }
  
  .water-countdown-display {
    margin-bottom: 10px;
  }
  
  .water-countdown-number {
    font-size: 3rem;
    color: #8A7B59;
    font-weight: bold;
  }
  
  .water-countdown-unit {
    font-size: 1rem;
    color: #8A7B59;
  }
  
  /* Water break message */
  .water-break-message {
    margin-bottom: 20px;
    color: #8A7B59;
    font-size: 1.1rem;
  }
  
  /* Continue button */
  .vintage-continue-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: #C9B690;
    border: 1px solid #8A7B59;
    border-radius: 4px;
    color: #5C4E33;
    font-size: 1rem;
    margin-bottom: 20px;
    font-family: 'VT323', monospace;
  }
  
  .vintage-continue-button:active {
    transform: scale(0.95);
    background: #8A7B59;
    color: #F5EAD5;
  }
  
  /* Hydration tips */
  .vintage-hydration-tips {
    background: #E5D8B9;
    border: 1px solid #C9B690;
    border-radius: 4px;
    padding: 12px;
    text-align: left;
  }
  
  .tips-header {
    margin-bottom: 8px;
    color: #5C4E33;
    font-weight: bold;
  }
  
  .tips-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .tips-list li {
    position: relative;
    padding-left: 15px;
    margin-bottom: 5px;
    font-size: 0.9rem;
  }
  
  .tips-list li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #8A7B59;
  }
`;
document.head.appendChild(style);

export default WaterBreakReminder;