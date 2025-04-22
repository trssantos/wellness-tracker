import React, { useState, useEffect } from 'react';
import { 
  X, ArrowLeft, Save, Check, Calendar, Star, Info, Link,
  Target, Percent, Hash, ListChecks, AlertCircle, HelpCircle,
  Mountain, Brain, Dumbbell, Briefcase, Wallet, Sparkles, Plus
} from 'lucide-react';
import { createGoal, updateGoal, getCategories } from '../../utils/bucketListUtils';

const GoalEditorForm = ({ goal, onClose, onSave }) => {
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
    completed: false,
    pinned: false,
    integrations: {
      habitIds: [],
      financeGoalId: null
    }
  });
  
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [newMilestone, setNewMilestone] = useState('');
  const [isNew, setIsNew] = useState(!goal);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Load data on component mount
  useEffect(() => {
    const loadedCategories = getCategories();
    setCategories(loadedCategories);
    
    if (goal) {
      setFormData({
        ...goal,
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
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
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
  
  // Add a milestone
  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { text: newMilestone, completed: false }]
    }));
    
    setNewMilestone('');
  };
  
  // Remove a milestone
  const handleRemoveMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };
  
  // Handle milestone completion toggle
  const handleToggleMilestone = (index) => {
    setFormData(prev => {
      const updatedMilestones = [...prev.milestones];
      updatedMilestones[index] = {
        ...updatedMilestones[index],
        completed: !updatedMilestones[index].completed
      };
      
      return {
        ...prev,
        milestones: updatedMilestones
      };
    });
  };
  
  // Get category icon
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
    
    try {
      let savedGoal;
      
      if (isNew) {
        // Create new goal
        savedGoal = createGoal(formData);
      } else {
        // Update existing goal
        savedGoal = updateGoal(goal.id, formData);
      }
      
      // Call the save callback
      onSave(savedGoal);
      onClose();
    } catch (error) {
      console.error('Error saving goal:', error);
      setErrors({
        form: 'Failed to save goal. Please try again.'
      });
    }
  };
  
  // Get icon for progress type
  const getProgressTypeIcon = (type) => {
    switch(type) {
      case 'percentage': return <Percent size={16} />;
      case 'counter': return <Hash size={16} />;
      case 'milestone': return <ListChecks size={16} />;
      default: return <Target size={16} />;
    }
  };
  
  // Get label for progress type
  const getProgressTypeLabel = (type) => {
    switch(type) {
      case 'percentage': return 'Percentage';
      case 'counter': return 'Counter';
      case 'milestone': return 'Milestones';
      default: return 'Simple (Done/Not Done)';
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft size={18} className="text-slate-600 dark:text-slate-300" />
            </button>
            <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200">
              {isNew ? 'Create New Goal' : 'Edit Goal'}
            </h2>
          </div>
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg shadow-sm transition-colors"
          >
            <Save size={18} />
            <span>Save Goal</span>
          </button>
        </div>
        
        {/* Form content */}
        <div className="overflow-y-auto max-h-[calc(90vh-72px)]">
          <div className="p-6 space-y-6">
            {/* General section */}
            <div>
              <h3 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Info size={18} className="text-amber-500" />
                <span>General Information</span>
              </h3>
              
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
                  className={`w-full p-3 border ${errors.title ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100`}
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
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  placeholder="Why is this goal important to you?"
                ></textarea>
              </div>
              
              {/* Category selector with icons */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                      className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                        formData.category === category.id
                          ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        {getCategoryIcon(category.id)}
                      </div>
                      <span className="text-xs text-center text-slate-700 dark:text-slate-300">
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Priority and Target Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <div className="flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: 'low' }))}
                      className={`flex-1 py-2 text-center text-sm ${
                        formData.priority === 'low'
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      Low
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: 'medium' }))}
                      className={`flex-1 py-2 text-center text-sm ${
                        formData.priority === 'medium'
                          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: 'high' }))}
                      className={`flex-1 py-2 text-center text-sm ${
                        formData.priority === 'high'
                          ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      High
                    </button>
                  </div>
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
                      className="w-full p-3 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    />
                    <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  </div>
                </div>
              </div>
              
              {/* Extra options */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="completed"
                    name="completed"
                    checked={formData.completed}
                    onChange={handleChange}
                    className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="completed" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                    Mark as completed
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pinned"
                    name="pinned"
                    checked={formData.pinned}
                    onChange={handleChange}
                    className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="pinned" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                    Pin to dashboard
                  </label>
                </div>
              </div>
            </div>
            
            {/* Progress Tracking section */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Target size={18} className="text-amber-500" />
                <span>Progress Tracking</span>
              </h3>
              
              {/* Progress type selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  How do you want to track your progress?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {['simple', 'percentage', 'counter', 'milestone'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, progressType: type }))}
                      className={`p-3 rounded-lg border flex flex-col items-center gap-2 text-center transition-all ${
                        formData.progressType === type
                          ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        {getProgressTypeIcon(type)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {getProgressTypeLabel(type)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {type === 'simple' && 'Done or not done'}
                          {type === 'percentage' && 'Track with percentages'}
                          {type === 'counter' && 'Track with numbers'}
                          {type === 'milestone' && 'Step by step progress'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Percentage-specific settings */}
              {formData.progressType === 'percentage' && (
                <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Initial progress ({formData.progress}%)
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
                  <div className="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
              
              {/* Counter-specific settings */}
              {formData.progressType === 'counter' && (
                <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className={`w-full p-2 border ${errors.targetValue ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100`}
                      />
                      {errors.targetValue && (
                        <p className="mt-1 text-sm text-red-500">{errors.targetValue}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center text-sm">
                    <HelpCircle size={14} className="text-slate-400 mr-1" />
                    <span className="text-slate-500 dark:text-slate-400">
                      Example: "Save $5000" with current value $1000 and target value 5000
                    </span>
                  </div>
                </div>
              )}
              
              {/* Milestone-specific settings */}
              {formData.progressType === 'milestone' && (
                <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Milestones
                  </label>
                  
                  {formData.milestones.length > 0 ? (
                    <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                      {formData.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                          <button
                            type="button"
                            onClick={() => handleToggleMilestone(index)}
                            className={`flex-shrink-0 w-5 h-5 rounded-full ${
                              milestone.completed 
                                ? 'bg-green-500 text-white' 
                                : 'border-2 border-slate-300 dark:border-slate-500'
                            } flex items-center justify-center transition-colors`}
                          >
                            {milestone.completed && <Check size={12} />}
                          </button>
                          <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                            {milestone.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMilestone(index)}
                            className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg mb-3">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No milestones yet. Add your first milestone below.
                      </p>
                    </div>
                  )}
                  
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
                      disabled={!newMilestone.trim()}
                      className={`p-2 rounded-lg flex items-center justify-center ${
                        !newMilestone.trim()
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                          : 'bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-700'
                      }`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  <div className="mt-3 flex items-center text-sm">
                    <HelpCircle size={14} className="text-slate-400 mr-1" />
                    <span className="text-slate-500 dark:text-slate-400">
                      Break down your goal into smaller, achievable steps
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            
            {/* Form error */}
            {errors.form && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm">{errors.form}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalEditorForm;