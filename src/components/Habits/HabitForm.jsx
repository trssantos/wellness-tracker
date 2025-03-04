import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Target, Sparkles, RotateCcw, Save, X } from 'lucide-react';
import { createHabit, updateHabit } from '../../utils/habitTrackerUtils';

const HabitForm = ({ habit, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: ['mon', 'wed', 'fri'],
    steps: [''],
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    timeOfDay: 'anytime',
    milestones: [{ name: '7-day streak', value: 7 }]
  });
  
  const [useAI, setUseAI] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customFrequency, setCustomFrequency] = useState(false);
  const [errors, setErrors] = useState({});
  
  // If editing an existing habit, load its data
  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        description: habit.description || '',
        frequency: habit.frequency || ['mon', 'wed', 'fri'],
        steps: habit.steps && habit.steps.length > 0 ? habit.steps : [''],
        startDate: habit.startDate || new Date().toISOString().split('T')[0],
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
  
  const handleGenerateWithAI = () => {
    if (!formData.name) {
      setErrors(prev => ({ ...prev, name: 'Please enter a habit name before generating' }));
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate AI generation (in a real implementation, this would call your AI service)
    setTimeout(() => {
      let generatedSteps = [];
      let generatedMilestones = [];
      
      // Generate steps based on habit name
      if (formData.name.toLowerCase().includes('meditation')) {
        generatedSteps = [
          'Find a quiet space (2 minutes)',
          'Sit comfortably with good posture',
          'Close your eyes and focus on your breath',
          'Notice thoughts without judgment',
          'Return attention to breath when distracted',
          'Gradually increase duration over time'
        ];
        
        generatedMilestones = [
          { name: '7-day streak', value: 7 },
          { name: '21 days consistent', value: 21 },
          { name: '5-minute to 10-minute sessions', value: 30 }
        ];
      } else if (formData.name.toLowerCase().includes('read')) {
        generatedSteps = [
          'Select a book or article',
          'Find a comfortable, quiet place',
          'Set a timer for your reading session',
          'Put phone in do-not-disturb mode',
          'Read mindfully for the set duration',
          'Take brief notes if desired'
        ];
        
        generatedMilestones = [
          { name: '7-day reading streak', value: 7 },
          { name: '1 book completed', value: 14 },
          { name: '30 days of consistent reading', value: 30 }
        ];
      } else if (formData.name.toLowerCase().includes('exercise') || formData.name.toLowerCase().includes('workout')) {
        generatedSteps = [
          'Prepare workout clothes and equipment',
          'Warm up for 5 minutes',
          'Complete your main exercise routine',
          'Cool down with light stretching',
          'Drink water to rehydrate',
          'Track your progress in a journal'
        ];
        
        generatedMilestones = [
          { name: '5 workout sessions', value: 5 },
          { name: '15 workout sessions', value: 15 },
          { name: '30-day exercise streak', value: 30 }
        ];
      } else {
        // Default steps for any habit
        generatedSteps = [
          'Prepare your environment',
          'Remove potential distractions',
          'Set a specific time for your habit',
          'Create a visual cue or reminder',
          'Track completion in your journal',
          'Celebrate small victories'
        ];
        
        generatedMilestones = [
          { name: '3-day streak', value: 3 },
          { name: '7-day streak', value: 7 },
          { name: '21 days (habit forming)', value: 21 },
          { name: '66 days (habit solidified)', value: 66 }
        ];
      }
      
      setFormData(prev => ({
        ...prev,
        steps: generatedSteps,
        milestones: generatedMilestones
      }));
      
      setIsGenerating(false);
    }, 1500);
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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {habit ? 'Edit Habit' : 'Create New Habit'}
        </h2>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Habit Name*
          </label>
          <input 
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Morning Meditation"
            className={`w-full p-3 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 ${
              errors.name 
                ? 'border-red-500 dark:border-red-600' 
                : 'border-slate-300 dark:border-slate-600'
            }`}
          />
          {errors.name && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your habit and why it's important to you"
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 h-24"
          ></textarea>
        </div>
        
        {/* Frequency Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Frequency*
          </label>
          
          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            <button 
              type="button"
              onClick={() => handleFrequencyPreset('daily')}
              className={`px-3 py-1.5 rounded-full text-sm ${
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
              className={`px-3 py-1.5 rounded-full text-sm ${
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
              className={`px-3 py-1.5 rounded-full text-sm ${
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
              className={`px-3 py-1.5 rounded-full text-sm ${
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
              className={`px-3 py-1.5 rounded-full text-sm ${
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
            <div className="flex flex-wrap gap-2">
              {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleFrequencyToggle(day)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
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
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.frequency}</p>
          )}
        </div>
        
        {/* Time of Day Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Time of Day (Optional)
          </label>
          <div className="flex gap-2 flex-wrap">
            {['morning', 'afternoon', 'evening', 'anytime'].map(time => (
              <button
                key={time}
                type="button"
                onClick={() => handleTimeOfDayChange(time)}
                className={`px-3 py-1.5 rounded-full text-sm capitalize ${
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
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Habit Steps
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUseAI(!useAI)}
                className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full ${
                  useAI 
                    ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sparkles size={14} />
                Generate with AI
              </button>
            </div>
          </div>
          
          {useAI ? (
            <div className="border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Our AI can help create personalized habit steps based on your goal. Enter a habit name and description above.
              </p>
              <button 
                type="button"
                onClick={handleGenerateWithAI}
                disabled={isGenerating || !formData.name}
                className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 ${
                  isGenerating || !formData.name
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    : 'bg-purple-500 dark:bg-purple-600 text-white hover:bg-purple-600 dark:hover:bg-purple-700'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RotateCcw size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Steps & Milestones
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-2 mb-2">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-8 h-8 flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
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
            <p className="text-red-500 dark:text-red-400 text-sm mb-2">{errors.steps}</p>
          )}
          
          {!useAI && (
            <button
              type="button"
              onClick={handleAddStep}
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm"
            >
              <Plus size={16} />
              Add Step
            </button>
          )}
        </div>
        
        {/* Milestones */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Milestones
          </label>
          <div className="space-y-2 mb-2">
            {formData.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-8 h-8 flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full flex items-center justify-center">
                  <Target size={16} />
                </div>
                <input
                  type="text"
                  value={milestone.name}
                  onChange={(e) => handleMilestoneChange(index, 'name', e.target.value)}
                  placeholder="Milestone name"
                  className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
                <input
                  type="number"
                  value={milestone.value}
                  onChange={(e) => handleMilestoneChange(index, 'value', parseInt(e.target.value) || 0)}
                  placeholder="Value"
                  className="w-20 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
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
            <p className="text-red-500 dark:text-red-400 text-sm mb-2">{errors.milestones}</p>
          )}
          
          <button
            type="button"
            onClick={handleAddMilestone}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm"
          >
            <Plus size={16} />
            Add Milestone
          </button>
        </div>
        
        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Start Date
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400 dark:text-slate-500">
                <Calendar size={16} />
              </div>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full p-3 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Target Date (Optional)
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400 dark:text-slate-500">
                <Target size={16} />
              </div>
              <input
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleInputChange}
                className="w-full p-3 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-between mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button 
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300"
        >
          Cancel
        </button>
        <button 
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center gap-2"
        >
          <Save size={18} />
          {habit ? 'Update Habit' : 'Save Habit'}
        </button>
      </div>
    </div>
  );
};

export default HabitForm;