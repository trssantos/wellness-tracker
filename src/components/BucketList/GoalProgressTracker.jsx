import React, { useState, useRef } from 'react';
import { X, Edit, CheckCircle, Circle, Zap, Target, Trophy, Calendar, Clock, ChevronRight, ChevronDown, Info, Plus, Minus, Edit3, Mountain, Brain, Dumbbell, Briefcase, Wallet, Sparkles, Star, Check, Trash2, AlertCircle, Save } from 'lucide-react';
import { updateGoal, deleteGoal } from '../../utils/bucketListUtils';

const GoalProgressTracker = ({ goal, onClose, onUpdate, onOpenEditForm }) => {
  const [currentProgress, setCurrentProgress] = useState(goal.progress || 0);
  const [currentValue, setCurrentValue] = useState(goal.currentValue || 0);
  const [milestones, setMilestones] = useState(goal.milestones || []);
  const [isCompleted, setIsCompleted] = useState(goal.completed || false);
  const [showNotes, setShowNotes] = useState(false);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState(goal.notes || []);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const editInputRef = useRef(null);
  
  // Calculate days left
  const getDaysLeft = (dateString) => {
    if (!dateString) return null;
    
    const targetDate = new Date(dateString);
    const today = new Date();
    
    // Reset time components for accurate day calculation
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
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
  
  // Get appropriate color classes based on priority
  const getPriorityClasses = (priority) => {
    switch(priority) {
      case 'high':
        return {
          bg: 'bg-red-50 dark:bg-red-900/30',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-700 dark:text-red-300',
          progressBg: 'bg-red-100 dark:bg-red-800/50',
          progressFill: 'bg-red-500 dark:bg-red-600'
        };
      case 'medium':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/30',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-700 dark:text-amber-300',
          progressBg: 'bg-amber-100 dark:bg-amber-800/50',
          progressFill: 'bg-amber-500 dark:bg-amber-600'
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/30',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-700 dark:text-blue-300',
          progressBg: 'bg-blue-100 dark:bg-blue-800/50',
          progressFill: 'bg-blue-500 dark:bg-blue-600'
        };
    }
  };
  
  const colorClasses = getPriorityClasses(goal.priority);
  
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
    
    // If marking as complete, complete all milestones
    if (newCompletedState && goal.progressType === 'milestone') {
      setMilestones(milestones.map(m => ({...m, completed: true})));
    }
    
    // Save changes
    saveChanges(newCompletedState);
  };
  
  // Handle toggle milestone
  const handleToggleMilestone = (index) => {
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
    saveChanges(allCompleted, null, updatedMilestones);
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
    saveChanges(newCompletedState, null, null, newValue);
  };
  
  // Add a progress note
  const handleAddNote = () => {
    if (!note.trim()) return;
    
    const newNote = {
      id: Date.now(),
      text: note,
      date: new Date().toISOString()
    };
    
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setNote('');
    
    // Save changes
    saveChanges(isCompleted, currentProgress, milestones, currentValue, updatedNotes);
  };
  
  // Start editing a note
  const handleEditNote = (noteId, noteText) => {
    setEditingNoteId(noteId);
    setEditingNoteText(noteText);
    
    // Focus the edit input after it's rendered
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 50);
  };
  
  // Save edited note
  const handleSaveNote = () => {
    if (!editingNoteText.trim()) return;
    
    const updatedNotes = notes.map(note => 
      note.id === editingNoteId 
        ? { ...note, text: editingNoteText, editedAt: new Date().toISOString() }
        : note
    );
    
    setNotes(updatedNotes);
    setEditingNoteId(null);
    setEditingNoteText('');
    
    // Save changes
    saveChanges(isCompleted, currentProgress, milestones, currentValue, updatedNotes);
  };
  
  // Cancel editing note
  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
  };
  
  // Delete a note
  const handleDeleteNote = (noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    
    // Save changes
    saveChanges(isCompleted, currentProgress, milestones, currentValue, updatedNotes);
  };
  
  // Handle delete goal confirmation
  const handleDeleteGoal = () => {
    deleteGoal(goal.id);
    onUpdate(); // Refresh parent component
    onClose(); // Close the tracker
  };
  
  // Save all changes to the goal
  const saveChanges = (completed, progress = currentProgress, updatedMilestones = milestones, value = currentValue, updatedNotes = notes) => {
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
      updates.completedMilestones = updatedMilestones.filter(m => m.completed).length;
    }
    
    // Add notes
    updates.notes = updatedNotes;
    
    // Update the goal
    updateGoal(goal.id, updates);
    
    // Notify parent component
    onUpdate();
  };
  
  // Calculate progress percentage for different goal types
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
  
  // Get a formatted display of the progress
  const getProgressDisplay = () => {
    if (goal.progressType === 'percentage') {
      return `${currentProgress}%`;
    } else if (goal.progressType === 'counter') {
      return `${currentValue} / ${goal.targetValue}`;
    } else if (goal.progressType === 'milestone') {
      const completedCount = milestones.filter(m => m.completed).length;
      return `${completedCount} / ${milestones.length} milestones`;
    } else {
      return isCompleted ? 'Completed' : 'In progress';
    }
  };
  
  const progressPercentage = getProgressPercentage();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg max-w-2xl w-full ${colorClasses.border} border overflow-hidden`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-4 ${colorClasses.bg}`}>
          <div className="flex items-center gap-2">
            <div className="bg-white dark:bg-slate-700 p-2 rounded-lg">
              {goal.category ? getCategoryIcon(goal.category) : <Target size={24} className="text-amber-500" />}
            </div>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-sm">
              {goal.title}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full"
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
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        {/* Progress Section */}
        <div className="p-6">
          {/* Visual Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {getProgressDisplay()}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {goal.targetDate && (
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(goal.targetDate)}</span>
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
            </div>
            
            <div className={`relative h-5 ${colorClasses.progressBg} rounded-lg overflow-hidden`}>
              <div 
                className={`absolute top-0 left-0 h-full ${colorClasses.progressFill} transition-all duration-500 ease-out`}
                style={{ width: `${progressPercentage}%` }}
              >
                {progressPercentage >= 35 && (
                  <div className="h-full flex items-center justify-center text-white text-xs font-medium">
                    {getProgressPercentage()}%
                  </div>
                )}
              </div>
              {progressPercentage < 35 && (
                <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                  {getProgressPercentage()}%
                </div>
              )}
            </div>
          </div>
          
          {/* Type-specific controls */}
          <div className="space-y-6">
            {/* Toggle Complete button (for all types) */}
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
                    <Circle size={20} />
                    <span>Mark as Complete</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Type-specific progress controls */}
            {goal.progressType === 'percentage' && !isCompleted && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Zap size={16} className="text-amber-500" />
                  <span>Update Progress</span>
                </div>
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
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Zap size={16} className="text-amber-500" />
                  <span>Update Progress</span>
                </div>
                <div className="flex items-center justify-center gap-3">
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
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{currentValue}</div>
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
            
            {goal.progressType === 'milestone' && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-amber-500" />
                  <span>Milestones</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                      <button
                        onClick={() => handleToggleMilestone(index)}
                        className={`flex-shrink-0 w-5 h-5 rounded-full border ${
                          milestone.completed 
                            ? 'bg-green-500 border-green-500 text-white dark:bg-green-600 dark:border-green-600' 
                            : 'border-slate-300 dark:border-slate-500'
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
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Progress notes */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1"
                >
                  <Info size={16} className="text-slate-400" />
                  <span>Progress Notes</span>
                  {showNotes ? 
                    <ChevronDown size={16} className="ml-1 text-slate-400" /> : 
                    <ChevronRight size={16} className="ml-1 text-slate-400" />
                  }
                </button>
              </div>
              
              {showNotes && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add a progress note..."
                      className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNote();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!note.trim()}
                      className={`p-2 rounded-lg ${
                        !note.trim()
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                          : `${colorClasses.bg} ${colorClasses.text}`
                      }`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  {notes.length === 0 ? (
                    <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4 border-t border-slate-200 dark:border-slate-700">
                      No notes yet. Add one to track your progress!
                    </div>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-2">
                      {notes.map(note => (
                        <div key={note.id} className="p-2 bg-white dark:bg-slate-700 rounded-lg text-sm group relative">
                          {editingNoteId === note.id ? (
                            <div className="flex gap-2">
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editingNoteText}
                                onChange={(e) => setEditingNoteText(e.target.value)}
                                className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveNote();
                                  } else if (e.key === 'Escape') {
                                    handleCancelEditNote();
                                  }
                                }}
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={handleSaveNote}
                                  className="p-2 text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
                                  title="Save changes"
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  onClick={handleCancelEditNote}
                                  className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                  title="Cancel"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-start">
                                <p className="text-slate-700 dark:text-slate-300 pr-14">{note.text}</p>
                                <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                                  {new Date(note.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white dark:bg-slate-700 p-1 rounded-md">
                                <button
                                  onClick={() => handleEditNote(note.id, note.text)}
                                  className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Edit note"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  title="Delete note"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Description (if exists) */}
        {goal.description && (
          <div className="px-6 pb-6">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400">
              {goal.description}
            </div>
          </div>
        )}
        
        {/* Delete Goal Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm w-full shadow-lg">
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
    </div>
  );
};

export default GoalProgressTracker;