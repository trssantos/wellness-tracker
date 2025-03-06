import React, { useState, useEffect } from 'react';
import WorkoutPlayer from './WorkoutPlayer';

const WorkoutPlayerModal = ({ workoutId, date, onComplete, onClose }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Implementation without using dialog element
  useEffect(() => {
    // Add event listener for escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        // Show confirmation instead of closing directly
        setShowConfirmation(true);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    // Clean up
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, []);

  // Handle confirm exit
  const handleConfirmExit = () => {
    setShowConfirmation(false);
    onClose();
  };

  // Handle cancel exit
  const handleCancelExit = () => {
    setShowConfirmation(false);
  };

  return (
    <div 
      id="workout-player-modal" 
      className="workout-modal-overlay"
      // Prevent closing when clicking overlay
      onClick={(e) => {
        if (e.target.id === "workout-player-modal") {
          setShowConfirmation(true);
        }
      }}
    >
      <div 
        className="workout-modal-content"
        onClick={e => e.stopPropagation()}
      >
        <WorkoutPlayer 
          workoutId={workoutId}
          date={date}
          onComplete={onComplete}
          onClose={() => setShowConfirmation(true)}
        />
        
        {/* Exit Confirmation Dialog */}
        {showConfirmation && (
          <div className="exit-confirmation-overlay">
            <div className="exit-confirmation-dialog">
              <h2>End Workout?</h2>
              <p>Are you sure you want to end your workout? Your progress will not be saved.</p>
              <div className="exit-confirmation-buttons">
                <button 
                  className="cancel-button"
                  onClick={handleCancelExit}
                >
                  Continue Workout
                </button>
                <button 
                  className="confirm-button"
                  onClick={handleConfirmExit}
                >
                  End Workout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add styling for the modal and confirmation dialog
const style = document.createElement('style');
style.innerHTML = `
  .workout-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.85);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .workout-modal-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
  
  /* Exit confirmation dialog */
  .exit-confirmation-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  }
  
  .exit-confirmation-dialog {
    background: #F5EAD5;
    border: 2px solid #C9B690;
    border-radius: 8px;
    padding: 20px;
    width: 90%;
    max-width: 350px;
    text-align: center;
    font-family: 'VT323', monospace;
  }
  
  .exit-confirmation-dialog h2 {
    margin-top: 0;
    font-size: 1.8rem;
    color: #5C4E33;
    margin-bottom: 10px;
  }
  
  .exit-confirmation-dialog p {
    color: #8A7B59;
    margin-bottom: 20px;
  }
  
  .exit-confirmation-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  
  .exit-confirmation-buttons button {
    padding: 10px 15px;
    border-radius: 4px;
    font-family: 'VT323', monospace;
    font-size: 1rem;
    border: none;
    cursor: pointer;
  }
  
  .cancel-button {
    background: #E5D8B9;
    color: #8A7B59;
    border: 1px solid #C9B690;
  }
  
  .confirm-button {
    background: #C13628;
    color: white;
  }
  
  @media (min-width: 768px) {
    .workout-modal-content {
      width: 90%;
      height: 90%;
      max-width: 1200px;
      max-height: 800px;
      border-radius: 8px;
    }
  }
`;
document.head.appendChild(style);

export default WorkoutPlayerModal;