// DayChecklist/TaskList.jsx
import React from 'react';
import { CheckCircle2, Circle, Bell, Plus, X } from 'lucide-react';
import TaskItem from './TaskItem';
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
  handleQuickAddTask
}) => {
  const currentCategory = categories[activeCategory];
  
  if (!currentCategory) {
    return (
      <div className="p-4 text-center text-slate-500 dark:text-slate-400">
        No tasks available for this category.
      </div>
    );
  }
  
  return (
    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
      {/* Task Items */}
      {currentCategory.items.map((item, idx) => (
        <TaskItem 
          key={idx}
          taskText={item}
          isChecked={checked[item] || false}
          hasReminder={hasReminderForTask(item)}
          onCheck={() => handleCheck(item)}
          onSetReminder={() => handleSetReminder(item)}
        />
      ))}
      
      {/* Quick Add Task UI */}
      {quickAddCategory === activeCategory ? (
        <QuickAddTask 
          quickAddText={quickAddText}
          setQuickAddText={setQuickAddText}
          onAdd={() => handleQuickAddTask(activeCategory)}
          onCancel={() => {
            setQuickAddCategory(null);
            setQuickAddText('');
          }}
        />
      ) : (
        <button
          onClick={() => setQuickAddCategory(activeCategory)}
          className="mt-2 flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg w-full"
        >
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      )}
    </div>
  );
};

export default TaskList;