// PendingTasksModal.jsx
import React from 'react';
import PendingTasksPrompt from './PendingTasksPrompt';
import { X } from 'lucide-react';

export const PendingTasksModal = ({ isOpen, currentDate, previousDate, onAction }) => {
  if (!isOpen || !currentDate || !previousDate) return null;

  return (
    <dialog 
      id="pending-tasks-modal" 
      className="modal-base"
      open={isOpen}
      onClick={(e) => e.target.id === 'pending-tasks-modal' && onAction('skip')}
    >
      <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {new Date(currentDate).toLocaleDateString('default', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <p className="modal-subtitle">
              Pending Tasks from {new Date(previousDate).toLocaleDateString('default', { 
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={() => onAction('skip')}
            className="modal-close-button"
          >
            <X size={20} />
          </button>
        </div>
        
        <PendingTasksPrompt
          date={currentDate}
          previousDate={previousDate}
          onImport={(tasks) => onAction('import', tasks)}
          onSkip={() => onAction('skip')}
          onClose={() => onAction('skip')}
        />
      </div>
    </dialog>
  );
};

export default PendingTasksModal;