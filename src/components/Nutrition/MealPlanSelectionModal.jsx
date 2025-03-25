import React from 'react';
import { Brain, Edit, X } from 'lucide-react';

const MealPlanSelectionModal = ({ onClose, onSelectMethod }) => {
  return (
    <div className="modal-content max-w-md w-full" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3 className="modal-title">Create Meal Plan</h3>
        <button 
          onClick={onClose} 
          className="modal-close-button"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="p-4">
        <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
          Choose how you'd like to create your meal plan
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onSelectMethod('ai')}
            className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex flex-col items-center gap-3 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Brain size={32} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">AI-Generated</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Let Solaris create a personalized meal plan based on your preferences and goals
              </p>
            </div>
          </button>
          
          <button
            onClick={() => onSelectMethod('manual')}
            className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex flex-col items-center gap-3 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Edit size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">Manual Creation</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Create your own meal plan from scratch with complete control
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealPlanSelectionModal;