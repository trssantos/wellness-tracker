import React, { useState } from 'react';
import { PiggyBank, DollarSign, FileText, Calendar } from 'lucide-react';
import { updateSavingsGoal } from '../../utils/financeUtils';
import ModalContainer from './ModalContainer';
import InputField from './InputField';

const EditSavingsGoalModal = ({ goal, onClose, onGoalUpdated, currency = '$' }) => {
  // State variables
  const [name, setName] = useState(goal.name || '');
  const [target, setTarget] = useState(goal.target || '');
  const [current, setCurrent] = useState(goal.current || 0);
  const [targetDate, setTargetDate] = useState(goal.targetDate || '');
  const [notes, setNotes] = useState(goal.notes || '');
  const [color, setColor] = useState(goal.color || 'blue');
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
    
    // Create updated goal object
    const updatedGoal = {
      name: name.trim(),
      target: parseFloat(target),
      current: parseFloat(current) || 0,
      targetDate: targetDate || null,
      notes: notes.trim(),
      color
    };
    
    try {
      // Update goal
      updateSavingsGoal(goal.id, updatedGoal);
      
      // Notify parent component
      if (onGoalUpdated) {
        onGoalUpdated();
      } else {
        onClose();
      }
    } catch (error) {
      setError(`Failed to update savings goal: ${error.message}`);
    }
  };

  return (
    <ModalContainer title="Edit Savings Goal" onClose={onClose}>
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
          <InputField
            icon={PiggyBank}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g., Emergency Fund"
            required
          />
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
                  color === c.id ? 'ring-2 ring-offset-2 ring-amber-500 dark:ring-offset-slate-800 dark:ring-amber-400' : ''
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
          <InputField
            icon={DollarSign}
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        
        {/* Current Amount */}
        <div>
          <label htmlFor="current" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Current Amount
          </label>
          <InputField
            icon={DollarSign}
            type="number"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        
        {/* Target Date */}
        <div>
          <label htmlFor="targetDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Target Date (Optional)
          </label>
          <InputField
            icon={Calendar}
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>
        
        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Notes (Optional)
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-slate-800 dark:text-slate-400 pointer-events-none">
              <FileText size={18} />
            </div>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full pl-10 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
              placeholder="Why are you saving for this goal?"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex flex-col xs:flex-row justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full xs:w-auto mb-2 xs:mb-0 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full xs:w-auto px-4 py-2 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </form>
    </ModalContainer>
  );
};

export default EditSavingsGoalModal;