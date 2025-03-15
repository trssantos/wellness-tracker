import React, { useState } from 'react';
import { X, PiggyBank, DollarSign, FileText, Calendar } from 'lucide-react';
import { addSavingsGoal } from '../../utils/financeUtils';

const AddSavingsGoalModal = ({ onClose, onSavingsAdded }) => {
  // State variables
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('blue');
  const [error, setError] = useState('');

  // Available colors for goals
  const colors = [
    { id: 'blue', name: 'Blue' },
    { id: 'green', name: 'Green' },
    { id: 'amber', name: 'Amber' },
    { id: 'purple', name: 'Purple' },
    { id: 'red', name: 'Red' },
    { id: 'pink', name: 'Pink' },
    { id: 'indigo', name: 'Indigo' },
    { id: 'teal', name: 'Teal' }
  ];

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      setError('Goal name is required');
      return;
    }
    
    if (!target || isNaN(parseFloat(target)) || parseFloat(target) <= 0) {
      setError('Target amount must be a positive number');
      return;
    }
    
    // Create goal object
    const goal = {
      name: name.trim(),
      target: parseFloat(target),
      current: parseFloat(current) || 0,
      targetDate: targetDate || null,
      notes: notes.trim(),
      color
    };
    
    try {
      // Save goal
      addSavingsGoal(goal);
      
      // Notify parent component
      if (onSavingsAdded) {
        onSavingsAdded();
      } else {
        onClose();
      }
    } catch (error) {
      setError(`Failed to add savings goal: ${error.message}`);
    }
  };

  return (
    <dialog 
      className="modal-base fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      open
    >
      <div 
        className="modal-content max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">Add Savings Goal</h3>
          <button
            onClick={onClose}
            className="modal-close-button"
          >
            <X size={20} />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Goal Name
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field pl-10"
                placeholder="E.g., Emergency Fund"
                required
              />
              <PiggyBank className="absolute left-3 top-3 text-slate-400" size={18} />
            </div>
          </div>
          
          {/* Goal Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Goal Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-8 h-8 rounded-full bg-${c.id}-500 dark:bg-${c.id}-600 ${
                    color === c.id ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-800' : ''
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>
          
          {/* Target Amount */}
          <div>
            <label htmlFor="target" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Target Amount
            </label>
            <div className="relative">
              <input
                id="target"
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="input-field pl-10"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
              <DollarSign className="absolute left-3 top-3 text-slate-400" size={18} />
            </div>
          </div>
          
          {/* Current Amount */}
          <div>
            <label htmlFor="current" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Current Amount (Optional)
            </label>
            <div className="relative">
              <input
                id="current"
                type="number"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="input-field pl-10"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <DollarSign className="absolute left-3 top-3 text-slate-400" size={18} />
            </div>
          </div>
          
          {/* Target Date */}
          <div>
            <label htmlFor="targetDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Target Date (Optional)
            </label>
            <div className="relative">
              <input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="input-field pl-10"
              />
              <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Notes (Optional)
            </label>
            <div className="relative">
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="textarea-field pl-10"
                placeholder="Why are you saving for this goal?"
                rows="3"
              ></textarea>
              <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Add Goal
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default AddSavingsGoalModal;