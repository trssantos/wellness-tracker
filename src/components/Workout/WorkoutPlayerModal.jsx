import React, { useState, useEffect, useContext } from 'react';
import WorkoutPlayer from './WorkoutPlayer';
import { ThemeContext } from '../../context/ThemeContext';

const WorkoutPlayerModal = ({ workoutId, date, onComplete, onClose }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { theme } = useContext(ThemeContext);
  
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
          onClose={handleConfirmExit}
        />
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
  
  /* Light mode styling (default) */
  .exit-confirmation-dialog {
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px;
    width: 90%;
    max-width: 350px;
    text-align: center;
    font-family: inherit;
  }
  
  .exit-confirmation-dialog h2 {
    margin-top: 0;
    font-size: 1.8rem;
    color: #1e293b;
    margin-bottom: 10px;
  }
  
  .exit-confirmation-dialog p {
    color: #334155;
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
    font-family: inherit;
    font-size: 1rem;
    border: none;
    cursor: pointer;
  }
  
  .cancel-button {
    background: #f1f5f9;
    color: #334155;
    border: 1px solid #e2e8f0;
  }
  
  .confirm-button {
    background: #ef4444;
    color: white;
  }

  /* Dark theme styling */
  .exit-confirmation-dialog.theme-dark {
    background: #1e293b;
    border: 2px solid #334155;
    color: #f1f5f9;
  }
  
  .exit-confirmation-dialog.theme-dark h2 {
    color: #f1f5f9;
  }
  
  .exit-confirmation-dialog.theme-dark p {
    color: #cbd5e1;
  }
  
  .exit-confirmation-dialog.theme-dark .cancel-button {
    background: #334155;
    color: #f1f5f9;
    border: 1px solid #475569;
  }
  
  .exit-confirmation-dialog.theme-dark .confirm-button {
    background: #dc2626;
    color: white;
  }
  
  /* Vintage theme styling */
  .exit-confirmation-dialog.theme-vintage {
    background: #F5EAD5;
    border: 2px solid #C9B690;
    border-radius: 8px;
    font-family: 'VT323', monospace;
  }
  
  .exit-confirmation-dialog.theme-vintage h2 {
    color: #5C4E33;
  }
  
  .exit-confirmation-dialog.theme-vintage p {
    color: #8A7B59;
  }
  
  .exit-confirmation-dialog.theme-vintage .cancel-button {
    background: #E5D8B9;
    color: #8A7B59;
    border: 1px solid #C9B690;
  }
  
  .exit-confirmation-dialog.theme-vintage .confirm-button {
    background: #C13628;
    color: white;
  }
  
  /* Dark vintage theme styling */
  html.dark .exit-confirmation-dialog.theme-vintage,
  .exit-confirmation-dialog.theme-vintage.theme-dark {
    background: #2A2520;
    border: 2px solid #4A4540;
    color: #F5EAD5;
  }
  
  html.dark .exit-confirmation-dialog.theme-vintage h2,
  .exit-confirmation-dialog.theme-vintage.theme-dark h2 {
    color: #F5EAD5;
  }
  
  html.dark .exit-confirmation-dialog.theme-vintage p,
  .exit-confirmation-dialog.theme-vintage.theme-dark p {
    color: #C9B690;
  }
  
  html.dark .exit-confirmation-dialog.theme-vintage .cancel-button,
  .exit-confirmation-dialog.theme-vintage.theme-dark .cancel-button {
    background: #3A3530;
    color: #C9B690;
    border: 1px solid #4A4540;
  }
  
  html.dark .exit-confirmation-dialog.theme-vintage .confirm-button,
  .exit-confirmation-dialog.theme-vintage.theme-dark .confirm-button {
    background: #C13628;
    color: #F5EAD5;
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