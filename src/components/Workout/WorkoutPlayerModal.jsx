import React, { useEffect } from 'react';
import WorkoutPlayer from './WorkoutPlayer';

const WorkoutPlayerModal = ({ workoutId, date, onComplete, onClose }) => {
  // Implementation without using dialog element
  useEffect(() => {
    // Add event listener for escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
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
  }, [onClose]);

  return (
    <div 
      id="workout-player-modal" 
      className="workout-modal-overlay"
      onClick={() => onClose()}
    >
      <div 
        className="workout-modal-content"
        onClick={e => e.stopPropagation()}
      >
        <WorkoutPlayer 
          workoutId={workoutId}
          date={date}
          onComplete={onComplete}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

// Add styling for the modal
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