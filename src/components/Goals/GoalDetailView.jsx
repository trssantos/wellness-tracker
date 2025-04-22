import React, { useState, useEffect } from 'react';
import { 
  X, Target, Check, ChevronDown, ChevronUp, Clock, Calendar, 
  Edit, Trash2, ArrowLeft, Share2, Edit3, Plus, Save, AlertCircle,
  Star, Mountain, Brain, Dumbbell, Briefcase, Wallet, Sparkles,
  Minus, Award, Bell, MessageSquare, CheckCircle
} from 'lucide-react';
import { updateGoal, deleteGoal } from '../../utils/bucketListUtils';

const GoalDetailView = ({ goal, onClose, onUpdate, onOpenEditForm }) => {
  const [isExpanded, setIsExpanded] = useState({
    milestones: true,
    notes: false,
    reminders: false,
    aiTips: false
  });
  const [currentProgress, setCurrentProgress] = useState(goal?.progress || 0);
  const [currentValue, setCurrentValue] = useState(goal?.currentValue || 0);
  const [isCompleted, setIsCompleted] = useState(goal?.completed || false);
  const [milestones, setMilestones] = useState(goal?.milestones || []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newMilestone, setNewMilestone] = useState('');
  
  // AI Tips (simulated for demo)
  const aiTips = [
    "Break down your goal into smaller, manageable tasks that you can complete weekly.",
    "Share your progress with a friend to increase accountability.",
    "Set specific milestones with deadlines to track your progress more effectively.",
    "Create a vision board with images that represent this goal to stay motivated."
  ];
  
  useEffect(() => {
    if (goal) {
      setCurrentProgress(goal.progress || 0);
      setCurrentValue(goal.currentValue || 0);
      setIsCompleted(goal.completed || false);
      setMilestones(goal.milestones || []);
    }
  }, [goal]);
  
  const toggleSection = (section) => {
    setIsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Get category icon
  const getCategoryIcon = (categoryId) => {
    switch(categoryId) {
      case 'experiences': return <Mountain size={24} className="text-purple-500" />;
      case 'personal': return <Brain size={24} className="text-blue-500" />;
      case 'fitness': return <Dumbbell size={24} className="text-green-500" />;
      case 'career': return <Briefcase size={24} className="text-amber-500" />;
      case 'finance': return <Wallet size={24} className="text-emerald-500" />;
      case 'creative': return <Sparkles size={24} className="text-rose-500" />;
      default: return <Star size={24} className="text-slate-500" />;
    }
  };
  
  // Format target date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Calculate days left
  const getDaysLeft = (dateString) => {
    if (!dateString) return null;
    
    const targetDate = new Date(dateString);
    const today = new Date();
    
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Get priority classes
  const getPriorityClasses = (priority) => {
    switch(priority) {
      case 'high':
        return {
          bg: 'bg-red-50 dark:bg-red-900/30',
          text: 'text-red-700 dark:text-red-300',
          progressBg: 'bg-red-100 dark:bg-red-800/50',
          progressFill: 'bg-red-500 dark:bg-red-600'
        };
      case 'medium':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/30',
          text: 'text-amber-700 dark:text-amber-300',
          progressBg: 'bg-amber-100 dark:bg-amber-800/50',
          progressFill: 'bg-amber-500 dark:bg-amber-600'
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/30',
          text: 'text-blue-700 dark:text-blue-300',
          progressBg: 'bg-blue-100 dark:bg-blue-800/50',
          progressFill: 'bg-blue-500 dark:bg-blue-600'
        };
    }
  };
  
  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (goal.progressType === 'percentage') {
      return currentProgress;
    } else if (goal.progressType === 'counter' && goal.targetValue > 0) {
      return Math.round((currentValue / goal.targetValue) * 100);
    } else if (goal.progressType === 'milestone' && milestones.length > 0) {
      const completedCount = milestones.filter(m => m.completed).length;
      return Math.round((completedCount / milestones.length) * 100);
    } else {
      return isCompleted ? 100 : 0;
    }
  };
  
  // Get progress display text
  const getProgressDisplay = () => {
    if (goal.progressType === 'percentage') {
      return `${currentProgress}%`;
    } else if (goal.progressType === 'counter') {
      return `${currentValue} / ${goal.targetValue}`;
    } else if (goal.progressType === 'milestone') {
      const completedCount = milestones.filter(m => m.completed).length || 0;
      return `${completedCount} / ${milestones.length || 0} milestones`;
    } else {
      return isCompleted ? 'Completed' : 'In progress';
    }
  };
  
  // Handle toggle complete
  const handleToggleComplete = () => {
    const newCompletedState = !isCompleted;
    setIsCompleted(newCompletedState);
    
    // If marking as complete, set progress to 100% for percentage type
    if (newCompletedState && goal.progressType === 'percentage') {
      setCurrentProgress(100);
    }
    
    // If marking as complete, set currentValue to targetValue for counter type
    if (newCompletedState && goal.progressType === 'counter') {
      setCurrentValue(goal.targetValue);
    }
    
    // If marking as complete, set all milestones to completed
    if (newCompletedState && goal.progressType === 'milestone') {
      const updatedMilestones = milestones.map(m => ({ ...m, completed: true }));
      setMilestones(updatedMilestones);
    }
    
    // Save changes
    saveChanges(newCompletedState);
  };
  
  // Handle progress change
  const handleProgressChange = (e) => {
    const newProgress = parseInt(e.target.value);
    setCurrentProgress(newProgress);
    
    // If progress is 100%, mark as complete
    if (newProgress === 100 && !isCompleted) {
      setIsCompleted(true);
      saveChanges(true, newProgress);
    } else {
      saveChanges(isCompleted, newProgress);
    }
  };
  
  // Handle counter increment/decrement
  const handleCounter = (increment) => {
    let newValue;
    
    if (increment) {
      newValue = Math.min(currentValue + 1, goal.targetValue);
    } else {
      newValue = Math.max(currentValue - 1, 0);
    }
    
    setCurrentValue(newValue);
    
    // If value reaches target, mark as complete
    const newCompletedState = newValue >= goal.targetValue;
    if (newCompletedState !== isCompleted) {
      setIsCompleted(newCompletedState);
    }
    
    // Save changes
    saveChanges(newCompletedState, null, newValue);
  };
  
  // Handle toggle milestone
  const handleToggleMilestone = (index) => {
    if (!milestones) return;
    
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      completed: !updatedMilestones[index].completed
    };
    
    setMilestones(updatedMilestones);
    
    // Check if all milestones are completed
    const allCompleted = updatedMilestones.every(m => m.completed);
    
    // If all milestones are complete, mark the goal as complete
    if (allCompleted !== isCompleted) {
      setIsCompleted(allCompleted);
    }
    
    // Save changes
    saveChanges(allCompleted, null, null, updatedMilestones);
  };
  
  // Add new milestone
  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return;
    
    const updatedMilestones = [...milestones, { text: newMilestone, completed: false }];
    setMilestones(updatedMilestones);
    setNewMilestone('');
    
    // Save changes
    saveChanges(isCompleted, null, null, updatedMilestones);
  };
  
  // Add a progress note
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const newNoteObj = {
      id: Date.now(),
      text: newNote,
      date: new Date().toISOString()
    };
    
    const updatedNotes = [newNoteObj, ...(goal.notes || [])];
    setNewNote('');
    
    // Save changes
    saveChanges(isCompleted, currentProgress, currentValue, milestones, updatedNotes);
  };
  
  // Delete goal
  const handleDeleteGoal = () => {
    deleteGoal(goal.id);
    onUpdate(); // Refresh parent component
    onClose(); // Close the detail view
  };
  
  // Save all changes to the goal
  const saveChanges = (completed, progress = currentProgress, value = currentValue, updatedMilestones = milestones, updatedNotes = goal.notes) => {
    const updates = {
      completed,
      modifiedAt: new Date().toISOString()
    };
    
    // Add appropriate updates based on goal type
    if (goal.progressType === 'percentage') {
      updates.progress = progress;
    } else if (goal.progressType === 'counter') {
      updates.currentValue = value;
    } else if (goal.progressType === 'milestone') {
      updates.milestones = updatedMilestones;
      updates.completedMilestones = updatedMilestones?.filter(m => m.completed).length || 0;
    }
    
    // Add notes
    if (updatedNotes) {
      updates.notes = updatedNotes;
    }
    
    // Update the goal
    updateGoal(goal.id, updates);
    
    // Notify parent component
    onUpdate();
  };
  
  const progressPercentage = getProgressPercentage();
  const colorClasses = getPriorityClasses(goal?.priority || 'medium');
  
  if (!goal) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`p-4 flex justify-between items-center border-b ${colorClasses.bg} border-amber-200 dark:border-amber-800`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft size={18} className="text-slate-600 dark:text-slate-300" />
            </button>
            <div className="bg-white dark:bg-slate-700 p-2 rounded-lg">
              {getCategoryIcon(goal.category)}
            </div>
            <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px] sm:max-w-xs md:max-w-md">
              {goal.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded-full"
              title="Delete goal"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onOpenEditForm}
              className="p-2 text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 rounded-full"
              title="Edit goal details"
            >
              <Edit3 size={18} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-72px)]">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-0.5 rounded-full ${colorClasses.bg} ${colorClasses.text}`}>
                    {goal.priority ? goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1) : 'Medium'} Priority
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {getProgressDisplay()}
                  </div>
                </div>
                {goal.targetDate && (
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">{formatDate(goal.targetDate)}</span>
                    {getDaysLeft(goal.targetDate) !== null && (
                      <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                        getDaysLeft(goal.targetDate) < 0 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                          : getDaysLeft(goal.targetDate) < 7
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      }`}>
                        {getDaysLeft(goal.targetDate) < 0 
                          ? 'Overdue' 
                          : getDaysLeft(goal.targetDate) === 0
                            ? 'Today'
                            : `${getDaysLeft(goal.targetDate)} days left`}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className={`relative h-6 ${colorClasses.progressBg} rounded-lg overflow-hidden`}>
                <div 
                  className={`absolute top-0 left-0 h-full ${colorClasses.progressFill} transition-all duration-500 ease-out`}
                  style={{ width: `${progressPercentage}%` }}
                >
                  {progressPercentage >= 35 && (
                    <div className="h-full flex items-center justify-center text-white text-sm font-medium">
                      {progressPercentage}%
                    </div>
                  )}
                </div>
                {progressPercentage < 35 && (
                  <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-300">
                    {progressPercentage}%
                  </div>
                )}
              </div>
            </div>
            
            {/* Description */}
            {goal.description && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {goal.description}
                </p>
              </div>
            )}
            
            {/* Mark Complete Button */}
            <div className="flex justify-center">
              <button
                onClick={handleToggleComplete}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 text-white transition-colors ${
                  isCompleted 
                    ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700' 
                    : 'bg-slate-500 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-700'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle size={20} />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    <span>Mark as Complete</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Progress Controls */}
            {goal.progressType === 'percentage' && !isCompleted && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Target size={16} className="text-amber-500" />
                  <span>Update Progress</span>
                </h3>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentProgress}
                  onChange={handleProgressChange}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
            
            {goal.progressType === 'counter' && !isCompleted && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Target size={16} className="text-amber-500" />
                  <span>Update Progress</span>
                </h3>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => handleCounter(false)}
                    disabled={currentValue <= 0}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentValue <= 0
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500'
                    }`}
                  >
                    <Minus size={20} />
                  </button>
                  <div className="w-24 text-center">
                    <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">{currentValue}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">of {goal.targetValue}</div>
                  </div>
                  <button
                    onClick={() => handleCounter(true)}
                    disabled={currentValue >= goal.targetValue}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentValue >= goal.targetValue
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500'
                    }`}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            )}
            
            {/* Milestones */}
            {goal.progressType === 'milestone' && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
                <button
                  onClick={() => toggleSection('milestones')}
                  className="w-full p-4 text-left flex items-center justify-between border-b border-slate-200 dark:border-slate-600"
                >
                  <h3 className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Award size={16} className="text-amber-500" />
                    <span>Milestones</span>
                    {milestones?.length > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-full text-xs">
                        {milestones.filter(m => m.completed).length}/{milestones.length}
                      </span>
                    )}
                  </h3>
                  {isExpanded.milestones ? (
                    <ChevronUp size={18} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400" />
                  )}
                </button>
                
                {isExpanded.milestones && (
                  <div className="p-4">
                    {milestones?.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        {milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                            <button
                              onClick={() => handleToggleMilestone(index)}
                              className={`flex-shrink-0 w-6 h-6 rounded-full ${
                                milestone.completed 
                                  ? 'bg-green-500 text-white' 
                                  : 'border-2 border-slate-300 dark:border-slate-500'
                              } flex items-center justify-center transition-colors`}
                            >
                              {milestone.completed && <Check size={14} />}
                            </button>
                            <span className={`flex-1 ${
                              milestone.completed 
                                ? 'text-slate-500 dark:text-slate-400 line-through' 
                                : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {milestone.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-sm italic text-center py-2">
                        No milestones yet. Add some below.
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMilestone}
                        onChange={(e) => setNewMilestone(e.target.value)}
                        placeholder="Add a new milestone..."
                        className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMilestone();
                          }
                        }}
                      />
                      <button
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
                  </div>
                )}
              </div>
            )}
            
            {/* Notes */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
              <button
                onClick={() => toggleSection('notes')}
                className="w-full p-4 text-left flex items-center justify-between border-b border-slate-200 dark:border-slate-600"
              >
                <h3 className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MessageSquare size={16} className="text-amber-500" />
                  <span>Progress Notes</span>
                  {goal.notes?.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-full text-xs">
                      {goal.notes.length}
                    </span>
                  )}
                </h3>
                {isExpanded.notes ? (
                  <ChevronUp size={18} className="text-slate-400" />
                ) : (
                  <ChevronDown size={18} className="text-slate-400" />
                )}
              </button>
              
              {isExpanded.notes && (
                <div className="p-4">
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a progress note..."
                      className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNote();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className={`p-2 rounded-lg flex items-center justify-center ${
                        !newNote.trim()
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                          : 'bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-700'
                      }`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  {goal.notes?.length > 0 ? (
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {goal.notes.map(note => (
                        <div key={note.id} className="p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                          <p className="text-slate-700 dark:text-slate-300 text-sm mb-1">{note.text}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(note.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-sm italic text-center py-2">
                      No notes yet. Add your first note above.
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Simplified Reminders & AI Tips Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reminders - simplified version */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
                <div className="p-3 flex items-center justify-between">
                  <h3 className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Bell size={16} className="text-amber-500" />
                    <span>Reminders</span>
                  </h3>
                </div>
                <div className="px-3 pb-3">
                  <button className="w-full p-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-amber-600 dark:text-amber-400 text-sm flex items-center justify-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                    <Plus size={14} />
                    <span>Add Reminder</span>
                  </button>
                </div>
              </div>
              
              {/* AI Tips - simplified version */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
                <div className="p-3 flex justify-between items-center">
                  <h3 className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    <span>Tips</span>
                  </h3>
                </div>
                <div className="px-3 pb-3">
                  <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                    {aiTips[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                <AlertCircle size={24} className="text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Delete Goal</h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete "{goal.title}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGoal}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              >
                Delete Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalDetailView;