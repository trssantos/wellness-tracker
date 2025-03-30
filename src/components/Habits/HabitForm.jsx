import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Target, Sparkles, RotateCcw, Save, X, Loader } from 'lucide-react';
import { createHabit, updateHabit } from '../../utils/habitTrackerUtils';
import { generateStepsForHabit, generateMilestonesForHabit } from '../../utils/aiHabitService';
import { formatDateForStorage } from '../../utils/dateUtils';

const HabitForm = ({ habit, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: ['mon', 'wed', 'fri'],
    steps: [''],
    startDate: formatDateForStorage(new Date()),
    targetDate: '',
    timeOfDay: 'anytime',
    milestones: [{ name: '7-day streak', value: 7 }]
  });
  
  const [isGeneratingSteps, setIsGeneratingSteps] = useState(false);
  const [isGeneratingMilestones, setIsGeneratingMilestones] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [customFrequency, setCustomFrequency] = useState(false);
  const [errors, setErrors] = useState({});
  const [aiError, setAiError] = useState(null);
  
  // If editing an existing habit, load its data
  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        description: habit.description || '',
        frequency: habit.frequency || ['mon', 'wed', 'fri'],
        steps: habit.steps && habit.steps.length > 0 ? habit.steps : [''],
        startDate: habit.startDate || formatDateForStorage(new Date()),
        targetDate: habit.targetDate || '',
        timeOfDay: habit.timeOfDay || 'anytime',
        milestones: habit.milestones && habit.milestones.length > 0 ? habit.milestones : [{ name: '7-day streak', value: 7 }]
      });
      setCustomFrequency(true);
    }
  }, [habit]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleFrequencyToggle = (day) => {
    setFormData(prev => {
      const newFrequency = prev.frequency.includes(day)
        ? prev.frequency.filter(d => d !== day)
        : [...prev.frequency, day];
      return { ...prev, frequency: newFrequency };
    });
    
    // Clear frequency error if at least one day is selected
    if (errors.frequency) {
      setErrors(prev => ({ ...prev, frequency: null }));
    }
  };
  
  const handleAddStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }));
  };
  
  const handleStepChange = (index, value) => {
    setFormData(prev => {
      const newSteps = [...prev.steps];
      newSteps[index] = value;
      return { ...prev, steps: newSteps };
    });
  };
  
  const handleRemoveStep = (index) => {
    setFormData(prev => {
      const newSteps = prev.steps.filter((_, i) => i !== index);
      return { ...prev, steps: newSteps.length ? newSteps : [''] };
    });
  };
  
  const handleAddMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { name: '', value: 0 }]
    }));
  };
  
  const handleMilestoneChange = (index, field, value) => {
    setFormData(prev => {
      const newMilestones = [...prev.milestones];
      newMilestones[index] = { ...newMilestones[index], [field]: value };
      return { ...prev, milestones: newMilestones };
    });
  };
  
  const handleRemoveMilestone = (index) => {
    setFormData(prev => {
      const newMilestones = prev.milestones.filter((_, i) => i !== index);
      return { ...prev, milestones: newMilestones };
    });
  };
  
  const handleTimeOfDayChange = (timeOfDay) => {
    setFormData(prev => ({ ...prev, timeOfDay }));
  };
  
  const handleFrequencyPreset = (preset) => {
    let frequency = [];
    
    switch(preset) {
      case 'daily':
        frequency = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        break;
      case 'weekdays':
        frequency = ['mon', 'tue', 'wed', 'thu', 'fri'];
        break;
      case 'weekends':
        frequency = ['sat', 'sun'];
        break;
      case 'alternate':
        frequency = ['mon', 'wed', 'fri', 'sun'];
        break;
      case 'custom':
        setCustomFrequency(true);
        return;
      default:
        frequency = ['mon', 'wed', 'fri'];
    }
    
    setFormData(prev => ({ ...prev, frequency }));
    setCustomFrequency(true);
    
    // Clear frequency error
    if (errors.frequency) {
      setErrors(prev => ({ ...prev, frequency: null }));
    }
  };
  
  // Method to generate steps with AI
  const handleGenerateStepsWithAI = async () => {
    if (!formData.name || !formData.description) {
      setErrors({
        ...errors,
        name: !formData.name ? "Name is required to generate steps" : null,
        description: !formData.description ? "Description is required to generate steps" : null
      });
      return;
    }
    
    setIsGeneratingSteps(true);
    setAiError(null);
    
    try {
      // Create a temporary habit object to pass to the AI service
      const tempHabit = {
        name: formData.name,
        description: formData.description
      };
      
      // Generate steps
      const steps = await generateStepsForHabit(tempHabit);
      
      // Update form data with the generated steps
      setFormData(prev => ({
        ...prev,
        steps: steps
      }));
      
      setUseAI(false); // Switch back to normal step view
    } catch (error) {
      console.error("Error generating steps:", error);
      setAiError(error.message || "Failed to generate steps");
    } finally {
      setIsGeneratingSteps(false);
    }
  };
  
  // Method to generate milestones with AI
  const handleGenerateMilestonesWithAI = async () => {
    if (!formData.name || !formData.description) {
      setErrors({
        ...errors,
        name: !formData.name ? "Name is required to generate milestones" : null,
        description: !formData.description ? "Description is required to generate milestones" : null
      });
      return;
    }
    
    setIsGeneratingMilestones(true);
    setAiError(null);
    
    try {
      // Create a temporary habit object to pass to the AI service
      const tempHabit = {
        name: formData.name,
        description: formData.description
      };
      
      // Generate milestones
      const milestones = await generateMilestonesForHabit(tempHabit);
      
      // Update form data with the generated milestones
      setFormData(prev => ({
        ...prev,
        milestones: milestones
      }));
    } catch (error) {
      console.error("Error generating milestones:", error);
      setAiError(error.message || "Failed to generate milestones");
    } finally {
      setIsGeneratingMilestones(false);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Habit name is required';
    }
    
    if (formData.frequency.length === 0) {
      newErrors.frequency = 'Please select at least one day';
    }
    
    // Check for empty steps
    const emptySteps = formData.steps.some(step => !step.trim());
    if (emptySteps) {
      newErrors.steps = 'Please fill in all steps or remove empty ones';
    }
    
    // Check for empty milestone names
    const emptyMilestones = formData.milestones.some(m => !m.name.trim());
    if (emptyMilestones) {
      newErrors.milestones = 'Please fill in all milestone names or remove empty ones';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    // Clean empty steps and milestones
    const cleanedSteps = formData.steps.filter(step => step.trim() !== '');
    const cleanedMilestones = formData.milestones.filter(m => m.name.trim() !== '');
    
    const habitData = {
      ...formData,
      steps: cleanedSteps,
      milestones: cleanedMilestones
    };
    
    if (habit) {
      // Update existing habit
      const updatedHabit = updateHabit(habit.id, habitData);
      onSave(updatedHabit);
    } else {
      // Create new habit
      const newHabit = createHabit(habitData);
      onSave(newHabit);
    }
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm w-full sm:w-[90%] md:w-3/4 lg:w-2/3 mx-auto overflow-x-hidden px-3 sm:px-4 md:px-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100">
          {habit ? 'Edit Habit' : 'Create New Habit'}
        </h2>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>
      
      {/* Display AI error if any */}
      {aiError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-xs">
          <p>{aiError}</p>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Basic Information */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Habit Name*
          </label>
          <input 
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Morning Meditation"
            className={`w-full p-2 sm:p-3 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 ${
              errors.name 
                ? 'border-red-500 dark:border-red-600' 
                : 'border-slate-300 dark:border-slate-600'
            }`}
          />
          {errors.name && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your habit and why it's important to you"
            className="w-full p-2 sm:p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 h-20"
          ></textarea>
        </div>
        
        {/* Frequency Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Frequency*
          </label>
          
          {/* Preset buttons with overflow scroll on mobile */}
          <div className="flex flex-wrap gap-1 mb-2 overflow-x-auto pb-1 -mx-1 px-1">
            <button 
              type="button"
              onClick={() => handleFrequencyPreset('daily')}
              className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                formData.frequency.length === 7 
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Daily
            </button>
            <button 
              type="button"
              onClick={() => handleFrequencyPreset('weekdays')}
              className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                formData.frequency.length === 5 && !formData.frequency.includes('sat') 
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Weekdays
            </button>
            <button 
              type="button"
              onClick={() => handleFrequencyPreset('weekends')}
              className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                formData.frequency.length === 2 && formData.frequency.includes('sat') 
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Weekends
            </button>
            <button 
              type="button"
              onClick={() => handleFrequencyPreset('alternate')}
              className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                formData.frequency.length === 4 && formData.frequency.includes('mon') && formData.frequency.includes('wed')
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Every Other Day
            </button>
            <button 
              type="button"
              onClick={() => handleFrequencyPreset('custom')}
              className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                customFrequency
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Custom
            </button>
          </div>
          
          {/* Day selector */}
          {(customFrequency || errors.frequency) && (
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleFrequencyToggle(day)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                    formData.frequency.includes(day)
                      ? 'bg-blue-500 dark:bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                </button>
              ))}
            </div>
          )}
          
          {errors.frequency && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.frequency}</p>
          )}
        </div>
        
        {/* Time of Day Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Time of Day (Optional)
          </label>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {['morning', 'afternoon', 'evening', 'anytime'].map(time => (
              <button
                key={time}
                type="button"
                onClick={() => handleTimeOfDayChange(time)}
                className={`px-2 py-1 rounded-full text-xs capitalize ${
                  formData.timeOfDay === time
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
        
        {/* Steps Section */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Habit Steps
            </label>
            <div>
              <button
                type="button"
                onClick={() => setUseAI(!useAI)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  useAI 
                    ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sparkles size={12} />
                AI
              </button>
            </div>
          </div>
          
          {useAI ? (
            <div className="border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 mb-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                Our AI can help create personalized habit steps based on your goal. Enter a habit name and description above.
              </p>
              <button 
                type="button"
                onClick={handleGenerateStepsWithAI}
                disabled={isGeneratingSteps || !formData.name}
                className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-xs ${
                  isGeneratingSteps || !formData.name
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    : 'bg-purple-500 dark:bg-purple-600 text-white hover:bg-purple-600 dark:hover:bg-purple-700'
                }`}
              >
                {isGeneratingSteps ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Generate Steps
                  </>
                )}
              </button>

              {/* Display AI-generated steps after generation */}
              {!isGeneratingSteps && formData.steps.length > 0 && formData.steps[0] !== '' && (
                <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                  <h4 className="font-medium text-xs text-slate-700 dark:text-slate-300 mb-2">Generated Steps:</h4>
                  <div className="space-y-2">
                    {formData.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg">
                        <div className="w-5 h-5 flex-shrink-0 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                        <span className="text-xs text-slate-700 dark:text-slate-300">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 mb-2">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-6 h-6 flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs"
                  />
                  <button 
                    type="button"
                    onClick={() => handleRemoveStep(index)}
                    className="p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {errors.steps && (
            <p className="text-red-500 dark:text-red-400 text-xs mb-2">{errors.steps}</p>
          )}
          
          {!useAI && (
            <button
              type="button"
              onClick={handleAddStep}
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs"
            >
              <Plus size={14} />
              Add Step
            </button>
          )}
        </div>
        
        {/* Milestones */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Milestones
            </label>
            <button
              type="button"
              onClick={handleGenerateMilestonesWithAI}
              disabled={isGeneratingMilestones || !formData.name}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                isGeneratingMilestones || !formData.name
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                  : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
              }`}
            >
              {isGeneratingMilestones ? (
                <>
                  <Loader size={12} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={12} />
                  AI Generate
                </>
              )}
            </button>
          </div>
          <div className="space-y-2 mb-2">
            {formData.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="w-6 h-6 flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full flex items-center justify-center">
                  <Target size={14} />
                </div>
                <input
                  type="text"
                  value={milestone.name}
                  onChange={(e) => handleMilestoneChange(index, 'name', e.target.value)}
                  placeholder="Milestone name"
                  className="flex-1 min-w-0 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs"
                />
                <input
                  type="number"
                  value={milestone.value}
                  onChange={(e) => handleMilestoneChange(index, 'value', parseInt(e.target.value) || 0)}
                  placeholder="Value"
                  className="w-14 sm:w-16 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs"
                />
                <button 
                  type="button"
                  onClick={() => handleRemoveMilestone(index)}
                  className="p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          
          {errors.milestones && (
            <p className="text-red-500 dark:text-red-400 text-xs mb-2">{errors.milestones}</p>
          )}
          
          <button
            type="button"
            onClick={handleAddMilestone}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs"
          >
            <Plus size={14} />
            Add Milestone
          </button>
        </div>
        
        {/* Date Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Start Date
            </label>
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500">
                <Calendar size={14} />
              </div>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full p-2 pl-8 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Target Date (Optional)
            </label>
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500">
                <Target size={14} />
              </div>
              <input
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleInputChange}
                className="w-full p-2 pl-8 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-6 pt-3 border-t border-slate-200 dark:border-slate-700">
        <button 
          type="button"
          onClick={onCancel}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 text-sm text-center"
        >
          Cancel
        </button>
        <button 
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
        >
          <Save size={16} />
          {habit ? 'Update Habit' : 'Save Habit'}
        </button>
      </div>
    </div>
  );
};

export default HabitForm;