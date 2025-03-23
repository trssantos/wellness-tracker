// DayChecklist/TaskList.jsx
import React from 'react';
import {Check,Bell,Trash2, Plus, X } from 'lucide-react';
import TaskItem from './TaskItem'; // Fallback to regular TaskItem if needed
import QuickAddTask from './QuickAddTask';

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
  handleDeleteTask
}) => {
  const activeItems = categories[activeCategory]?.items || [];
  const activeCategoryTitle = categories[activeCategory]?.title || '';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 mb-4 overflow-y-auto max-h-96 transition-colors">
      {activeItems.length === 0 ? (
        <div className="text-center text-slate-500 dark:text-slate-400 py-4 transition-colors">
          No tasks in this category yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {activeItems.map((item, index) => {
            // Create the taskId that combines category and item
            const taskId = `${activeCategoryTitle}|${item}`;
            
            return (
              <li key={index} className="flex items-center">
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
                    onClick={() => handleDeleteTask(item)}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-colors"
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      
      {/* Quick add form */}
      {quickAddCategory === activeCategory && (
        <div className="mt-4 flex items-center">
          <input
            type="text"
            value={quickAddText}
            onChange={(e) => setQuickAddText(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && quickAddText.trim()) {
                handleQuickAddTask(activeCategory);
              }
            }}
            autoFocus
          />
          <button
            onClick={() => handleQuickAddTask(activeCategory)}
            disabled={!quickAddText.trim()}
            className={`ml-2 p-2 rounded-lg ${
              !quickAddText.trim() 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600' 
                : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
            } transition-colors`}
          >
            <Plus size={20} />
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
    </div>
  );
};

export default TaskList;