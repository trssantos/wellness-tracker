// DayChecklist/TaskList.jsx
import React, { useState } from 'react';
import { Check, Bell, Trash2, Plus, X, PenSquare, Save, Lock, AlertTriangle } from 'lucide-react';
import { registerTask } from '../../utils/taskRegistry';

const TaskList = ({
  categories,
  activeCategory,
  checked,
  handleCheck,
  hasReminderForTask,
  handleSetReminder,
  quickAddCategory,
  setQuickAddCategory,
  quickAddText,
  setQuickAddText,
  handleQuickAddTask,
  handleDeleteTask,
  handleEditTask
}) => {
  const activeItems = categories[activeCategory]?.items || [];
  const activeCategoryTitle = categories[activeCategory]?.title || '';
  
  // State for tracking editing
  const [editingTaskIndex, setEditingTaskIndex] = useState(null);
  const [editTaskText, setEditTaskText] = useState('');
  
  // State for deletion confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  
  // Helper function to check if a task is a protected task (habit or deferred)
  const isProtectedTask = (taskText, categoryTitle) => {
    // Habit tasks are identified by starting with "[" and containing "]"
    const isHabitTask = taskText.startsWith('[') && taskText.includes(']');
    
    // Deferred tasks are in a category named "Deferred" or other similar names
    const isDeferredCategory = 
      categoryTitle === 'Deferred' || 
      categoryTitle === 'Imported' || 
      categoryTitle === 'From Previous Days' ||
      categoryTitle.toLowerCase().includes('defer') ||
      categoryTitle.toLowerCase().includes('import');
    
    return isHabitTask || isDeferredCategory;
  };
  
  // Start editing a task
  const startEditing = (index, taskText) => {
    // Safety check - don't allow editing protected tasks
    if (isProtectedTask(taskText, activeCategoryTitle)) return;
    
    setEditingTaskIndex(index);
    setEditTaskText(taskText);
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingTaskIndex(null);
    setEditTaskText('');
  };
  
  // Save edit
  const saveEdit = (oldTaskText) => {
    // Safety check - don't allow editing protected tasks
    if (isProtectedTask(oldTaskText, activeCategoryTitle)) return;
    
    if (!editTaskText.trim()) {
      return; // Don't save empty tasks
    }
    
    // Check if this exact task text already exists in this category
    if (activeItems.includes(editTaskText.trim()) && editTaskText.trim() !== oldTaskText) {
      // Could add error handling here
      return;
    }
    
    // Register the task for auto-complete suggestions
    registerTask(editTaskText.trim());
    
    // Call the handler from parent component
    handleEditTask(oldTaskText, editTaskText.trim(), activeCategoryTitle);
    
    // Reset editing state
    setEditingTaskIndex(null);
    setEditTaskText('');
  };
  
  // Show the delete confirmation modal for a specific task
  const confirmDelete = (task) => {
    setTaskToDelete(task);
    setShowDeleteConfirm(true);
  };
  
  // Handle confirming deletion
  const handleConfirmDelete = () => {
    if (taskToDelete) {
      handleDeleteTask(taskToDelete);
      setTaskToDelete(null);
      setShowDeleteConfirm(false);
    }
  };
  
  // Handle canceling deletion
  const handleCancelDelete = () => {
    setTaskToDelete(null);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 mb-4 overflow-y-auto max-h-96 transition-colors relative">
      {activeItems.length === 0 ? (
        <div className="text-center text-slate-500 dark:text-slate-400 py-4 transition-colors">
          No tasks in this category yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {activeItems.map((item, index) => {
            // Create the taskId that combines category and item
            const taskId = `${activeCategoryTitle}|${item}`;
            
            // Check if this task is being edited
            const isEditing = editingTaskIndex === index;
            
            // Check if this is a protected task
            const isProtected = isProtectedTask(item, activeCategoryTitle);
            
            return (
              <li key={index} className="flex items-center">
                {isEditing ? (
                  // Editing mode
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={editTaskText}
                      onChange={(e) => setEditTaskText(e.target.value)}
                      className="flex-1 p-2 border border-blue-200 dark:border-blue-700 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveEdit(item);
                        } else if (e.key === 'Escape') {
                          cancelEditing();
                        }
                      }}
                    />
                    <button
                      onClick={() => saveEdit(item)}
                      className="p-1.5 bg-green-500 dark:bg-green-600 text-white rounded-md hover:bg-green-600 dark:hover:bg-green-700"
                      title="Save"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1.5 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500"
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  // Normal display mode
                  <>
                    <button
                      onClick={() => handleCheck(item, activeCategoryTitle)}
                      className={`flex-shrink-0 w-5 h-5 rounded-full ${checked[taskId] ? 'bg-blue-500 dark:bg-blue-600' : 'border border-slate-300 dark:border-slate-600'} mr-3 transition-colors flex items-center justify-center`}
                    >
                      {checked[taskId] && <Check size={12} className="text-white" />}
                    </button>
                    <span className={`flex-1 text-slate-700 dark:text-slate-200 transition-colors ${checked[taskId] ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                      {item}
                    </span>
                    <div className="flex items-center space-x-1">
                      {/* Only show edit button for non-protected tasks */}
                      {isProtected ? (
                        <button
                          className="p-1.5 text-slate-300 dark:text-slate-600 rounded-full cursor-not-allowed"
                          title={
                            isProtectedTask(item, '') 
                              ? "Cannot edit habit tasks" 
                              : "Cannot edit deferred/imported tasks"
                          }
                          disabled
                        >
                          <Lock size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => startEditing(index, item)}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 rounded-full transition-colors"
                          title="Edit task"
                        >
                          <PenSquare size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleSetReminder(item)}
                        className={`p-1.5 rounded-full transition-colors ${
                          hasReminderForTask(item) 
                            ? 'text-amber-500 dark:text-amber-400' 
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                        }`}
                        title={hasReminderForTask(item) ? "Edit reminder" : "Set reminder"}
                      >
                        <Bell size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(item)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
      
      {/* Quick add form */}
      {quickAddCategory === activeCategory && (
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={quickAddText}
            onChange={(e) => setQuickAddText(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && quickAddText.trim()) {
                handleQuickAddTask(activeCategory);
              } else if (e.key === 'Escape') {
                setQuickAddCategory(null);
              }
            }}
            autoFocus
          />
          <button
            onClick={() => handleQuickAddTask(activeCategory)}
            disabled={!quickAddText.trim()}
            className={`p-2 rounded-lg ${
              !quickAddText.trim() 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600' 
                : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
            } transition-colors`}
            title="Add task"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={() => setQuickAddCategory(null)}
            className="p-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
            title="Cancel"
          >
            <X size={20} />
          </button>
        </div>
      )}
      
      {quickAddCategory !== activeCategory && (
        <button
          onClick={() => setQuickAddCategory(activeCategory)}
          className="mt-4 px-4 py-2 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          <Plus size={16} />
          <span>Add task</span>
        </button>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-lg max-w-sm w-full">
            <div className="flex items-center gap-2 mb-3 text-amber-500 dark:text-amber-400">
              <AlertTriangle size={24} />
              <h4 className="font-medium text-slate-800 dark:text-slate-200 text-lg">Delete Task?</h4>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;