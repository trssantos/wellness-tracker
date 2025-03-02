// DayChecklist/EditCategoryForm.jsx
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import EditTaskItem from './EditTaskItem';

const EditCategoryForm = ({
  category,
  categoryIdx,
  editedCategories,
  setEditedCategories,
  setEditingError
}) => {
  const handleCategoryTitleChange = (newTitle) => {
    const newCategories = [...editedCategories];
    newCategories[categoryIdx].title = newTitle;
    setEditedCategories(newCategories);
  };

  const handleAddTask = () => {
    const newCategories = [...editedCategories];
    newCategories[categoryIdx].items.push('New Task');
    setEditedCategories(newCategories);
  };

  const handleDeleteTask = (taskIdx) => {
    if (editedCategories[categoryIdx].items.length <= 1) {
      setEditingError("Each category must have at least one task");
      return;
    }
    
    const newCategories = [...editedCategories];
    newCategories[categoryIdx].items = newCategories[categoryIdx].items.filter(
      (_, idx) => idx !== taskIdx
    );
    setEditedCategories(newCategories);
    setEditingError(null);
  };

  const handleTaskChange = (taskIdx, newText) => {
    const newCategories = [...editedCategories];
    newCategories[categoryIdx].items[taskIdx] = newText;
    setEditedCategories(newCategories);
  };

  const handleDeleteCategory = () => {
    if (editedCategories.length <= 1) {
      setEditingError("You must have at least one category");
      return;
    }
    setEditedCategories(editedCategories.filter((_, index) => index !== categoryIdx));
    setEditingError(null);
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 transition-colors">
      <div className="flex items-center justify-between mb-4 bg-slate-100 dark:bg-slate-700 p-3 rounded-lg border-l-4 border-blue-500 transition-colors">
        <input
          type="text"
          value={category.title}
          onChange={(e) => handleCategoryTitleChange(e.target.value)}
          className="flex-1 p-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md font-medium text-slate-700 dark:text-slate-200 transition-colors"
          placeholder="Category title"
        />
        <button
          onClick={handleDeleteCategory}
          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded-md ml-2 transition-colors"
          title="Delete category"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-2 ml-4 pl-2 border-l-2 border-slate-200 dark:border-slate-700 transition-colors">
        {category.items.map((task, taskIdx) => (
          <EditTaskItem
            key={taskIdx}
            task={task}
            onTaskChange={(newText) => handleTaskChange(taskIdx, newText)}
            onDeleteTask={() => handleDeleteTask(taskIdx)}
          />
        ))}
        <button
          onClick={handleAddTask}
          className="flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 mt-2 transition-colors"
        >
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
};

export default EditCategoryForm;