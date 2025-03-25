import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, Minus, Calendar, Star, Mountain, Brain, Dumbbell, Briefcase, Wallet, Sparkles, Check, Clock, Link } from 'lucide-react';
import { createGoal, updateGoal, deleteGoal, getCategories } from '../../utils/bucketListUtils';

const GoalDetail = ({ goal, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    progressType: 'simple',
    targetDate: '',
    priority: 'medium',
    progress: 0,
    currentValue: 0,
    targetValue: 100,
    milestones: [],
    integrations: {
      habitIds: [],
      financeGoalId: null
    }
  });
  const [categories, setCategories] = useState([]);
  const [newMilestone, setNewMilestone] = useState('');
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    // Load categories
    const loadedCategories = getCategories();
    setCategories(loadedCategories);
    
    // Initialize form with goal data if editing
    if (goal) {
      setFormData({
        ...goal,
        // Make sure we have defaults for all fields
        milestones: goal.milestones || [],
        integrations: goal.integrations || {
          habitIds: [],
          financeGoalId: null
        }
      });
    }
  }, [goal]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle number input changes
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue)) {
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };
  
  // Handle adding a milestone
  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { text: newMilestone, completed: false }]
    }));
    
    setNewMilestone('');
  };
  
  // Handle removing a milestone
  const handleRemoveMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };
  
  // Handle toggling a milestone
  const handleToggleMilestone = (index) => {
    setFormData(prev => {
      const updatedMilestones = [...prev.milestones];
      updatedMilestones[index] = {
        ...updatedMilestones[index],
        completed: !updatedMilestones[index].completed
      };
      
      return {
        ...prev,
        milestones: updatedMilestones,
        completedMilestones: updatedMilestones.filter(m => m.completed).length
      };
    });
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.progressType === 'counter' && formData.targetValue <= 0) {
      newErrors.targetValue = 'Target value must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    // Create or update goal
    let savedGoal;
    if (goal) {
      savedGoal = updateGoal(goal.id, formData);
    } else {
      savedGoal = createGoal(formData);
    }
    
    // Call onUpdate callback
    onUpdate(savedGoal);
    onClose();
  };
  
  // Handle goal deletion
  const handleDelete = () => {
    if (!goal) return;
    
    if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      deleteGoal(goal.id);
      onUpdate();
      onClose();
    }
  };
  
  // Get icon for category
  const getCategoryIcon = (categoryId) => {
    switch(categoryId) {
      case 'experiences': return <Mountain size={18} className="text-purple-500" />;
      case 'personal': return <Brain size={18} className="text-blue-500" />;
      case 'fitness': return <Dumbbell size={18} className="text-green-500" />;
      case 'career': return <Briefcase size={18} className="text-amber-500" />;
      case 'finance': return <Wallet size={18} className="text-emerald-500" />;
      case 'creative': return <Sparkles size={18} className="text-rose-500" />;
      default: return <Star size={18} className="text-slate-500" />;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
            {goal ? 'Edit Goal' : 'Add New Goal'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Form content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form>
            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Goal Title*
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.title ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100`}
                placeholder="What do you want to achieve?"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>
            
            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                placeholder="Why is this goal important to you?"
              ></textarea>
            </div>
            
            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option value="">-- Select Category --</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Priority & Target Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="targetDate"
                    value={formData.targetDate}
                    onChange={handleChange}
                    className="w-full p-2 pl-9 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                  <Calendar className="absolute left-2 top-2.5 text-slate-400" size={18} />
                </div>
              </div>
            </div>
            
            {/* Progress Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Progress Tracking Type
              </label>
              <select
                name="progressType"
                value={formData.progressType}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option value="simple">Simple (Done/Not Done)</option>
                <option value="percentage">Percentage</option>
                <option value="counter">Counter (e.g., saving money, weight loss)</option>
                <option value="milestone">Milestone-based</option>
              </select>
            </div>
            
            {/* Progress-specific fields */}
            {formData.progressType === 'percentage' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Progress ({formData.progress}%)
                </label>
                <input
                  type="range"
                  name="progress"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={handleNumberChange}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
            
            {formData.progressType === 'counter' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Current Value
                  </label>
                  <input
                    type="number"
                    name="currentValue"
                    value={formData.currentValue}
                    onChange={handleNumberChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Value
                  </label>
                  <input
                    type="number"
                    name="targetValue"
                    value={formData.targetValue}
                    onChange={handleNumberChange}
                    className={`w-full p-2 border ${errors.targetValue ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100`}
                  />
                  {errors.targetValue && (
                    <p className="mt-1 text-sm text-red-500">{errors.targetValue}</p>
                  )}
                </div>
              </div>
            )}
            
            {formData.progressType === 'milestone' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Milestones
                  </label>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formData.milestones.filter(m => m.completed).length} of {formData.milestones.length} completed
                  </span>
                </div>
                
                {/* Existing milestones */}
                <div className="space-y-2 mb-3">
                  {formData.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleMilestone(index)}
                        className={`flex-shrink-0 w-5 h-5 rounded-full border ${
                          milestone.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-slate-300 dark:border-slate-600'
                        } flex items-center justify-center`}
                      >
                        {milestone.completed && <Check size={12} />}
                      </button>
                      <span className={`flex-1 text-sm ${
                        milestone.completed 
                          ? 'text-slate-500 dark:text-slate-400 line-through' 
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {milestone.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(index)}
                        className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                      >
                        <Minus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Add new milestone */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    placeholder="Add a milestone..."
                    className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMilestone();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            )}
            
            {/* Status checkbox */}
            <div className="mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="completed"
                  name="completed"
                  checked={formData.completed || false}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500"
                />
                <label htmlFor="completed" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                  Mark as completed
                </label>
              </div>
            </div>
            
            {/* Integrations section */}
            <div className="mb-4 border-t border-slate-200 dark:border-slate-700 pt-4">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                <Link size={16} className="text-slate-400" />
                Integrations
              </h4>
              
              {/* Habit connection */}
              <div className="mb-2">
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Connect to Habits (Coming Soon)
                </label>
                <div className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-sm">
                  Link your habits to track progress automatically
                </div>
              </div>
              
              {/* Finance goal connection */}
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Connect to Finance (Coming Soon)
                </label>
                <div className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-sm">
                  Link savings goals to fund this bucket list item
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between items-center p-4 border-t border-slate-200 dark:border-slate-700">
          {goal ? (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-1"
            >
              <Trash2 size={18} />
              Delete
            </button>
          ) : (
            <div></div> // Empty div to maintain flex justification
          )}
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-amber-500 dark:bg-amber-600 text-white rounded-lg hover:bg-amber-600 dark:hover:bg-amber-700 flex items-center gap-1"
            >
              <Save size={18} />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalDetail;