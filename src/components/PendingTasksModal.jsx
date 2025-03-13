import React from 'react';
import PendingTasksPrompt from './PendingTasksPrompt';
import { X } from 'lucide-react';

export const PendingTasksModal = ({ currentDate, previousDate, onAction }) => {
  return (
    <dialog 
      id="pending-tasks-modal" 
      className="modal-base"
      onClick={(e) => e.target.id === 'pending-tasks-modal' && onAction('skip')}
    >
      <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {currentDate && new Date(currentDate).toLocaleDateString('default', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <p className="modal-subtitle">
              Pending Tasks from Previous Days
            </p>
          </div>
          <button
            onClick={() => onAction('skip')}
            className="modal-close-button"
          >
            <X size={20} />
          </button>
        </div>
        
        {currentDate && previousDate && (
          <PendingTasksPrompt
            date={currentDate}
            previousDate={previousDate}
            onImport={(tasks) => onAction('import', tasks)}
            onSkip={() => onAction('skip')}
            onClose={() => onAction('skip')}
          />
        )}
      </div>
    </dialog>
  );
};

export default PendingTasksModal;