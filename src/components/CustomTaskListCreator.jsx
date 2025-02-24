import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Save } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';

export const CustomTaskListCreator = ({ date, onClose, onTasksGenerated }) => {
  const [categories, setCategories] = useState([
    { title: 'Category 1', items: ['Task 1'], isEditingTitle: false }
  ]);
  const [error, setError] = useState(null);
  
  // Reset state when date changes
  useEffect(() => {
    setCategories([
      { title: 'Category 1', items: ['Task 1'], isEditingTitle: false }
    ]);
    setError(null);
  }, [date]);

  const handleAddCategory = () => {
    setCategories([
      ...categories,
      { 
        title: `Category ${categories.length + 1}`, 
        items: ['New Task'], 
        isEditingTitle: false 
      }
    ]);
  };

  const handleDeleteCategory = (categoryIndex) => {
    // Don't delete if it's the last category
    if (categories.length <= 1) {
      setError("You must have at least one category");
      return;
    }
    
    setCategories(categories.filter((_, idx) => idx !== categoryIndex));
    setError(null);
  };

  const handleCategoryTitleChange = (categoryIndex, newTitle) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].title = newTitle;
    setCategories(newCategories);
  };

  const handleToggleEditCategoryTitle = (categoryIndex) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].isEditingTitle = !newCategories[categoryIndex].isEditingTitle;
    setCategories(newCategories);
  };

  const handleAddTask = (categoryIndex) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items.push('New Task');
    setCategories(newCategories);
  };

  const handleDeleteTask = (categoryIndex, taskIndex) => {
    // Don't delete if it's the last task in the category
    if (categories[categoryIndex].items.length <= 1) {
      setError("Each category must have at least one task");
      return;
    }
    
    const newCategories = [...categories];
    newCategories[categoryIndex].items = newCategories[categoryIndex].items.filter(
      (_, idx) => idx !== taskIndex
    );
    setCategories(newCategories);
    setError(null);
  };

  const handleTaskChange = (categoryIndex, taskIndex, newText) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items[taskIndex] = newText;
    setCategories(newCategories);
  };

  const handleSave = () => {
    // Validate: Check that we have at least one category with one task
    if (categories.length === 0) {
      setError("You must have at least one category");
      return;
    }

    for (const category of categories) {
      if (category.items.length === 0) {
        setError("Each category must have at least one task");
        return;
      }
      
      // Check for empty titles or tasks
      if (!category.title.trim()) {
        setError("Category titles cannot be empty");
        return;
      }
      
      for (const task of category.items) {
        if (!task.trim()) {
          setError("Tasks cannot be empty");
          return;
        }
      }
    }

    // Clean up the data for storage (remove editing state)
    const cleanCategories = categories.map(category => ({
      title: category.title.trim(),
      items: category.items.map(item => item.trim())
    }));

    try {
      // Prepare data for storage
      const storage = getStorage();
      const existingData = storage[date] || {};
      
      storage[date] = {
        ...existingData,  // Preserve any existing data for this date
        customTasks: cleanCategories,
        checked: existingData.checked || Object.fromEntries(
          cleanCategories.flatMap(cat => 
            cat.items.map(item => [item, false])
          )
        )
      };
      setStorage(storage);

      // Reset state
      setCategories([
        { title: 'Category 1', items: ['Task 1'], isEditingTitle: false }
      ]);
      setError(null);

      onTasksGenerated();
    } catch (error) {
      console.error('Failed to save custom tasks:', error);
      setError('Failed to save custom tasks. Please try again.');
    }
  };

  return (
    <dialog 
      id="custom-tasklist-modal" 
      className="rounded-xl p-0 bg-transparent backdrop:bg-black backdrop:bg-opacity-50"
      onClick={(e) => e.target.id === 'custom-tasklist-modal' && onClose()}
    >
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">Create Custom Task List</h3>
            <p className="text-sm text-slate-600">
              {new Date(date).toLocaleDateString('default', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                {category.isEditingTitle ? (
                  <input
                    type="text"
                    value={category.title}
                    onChange={(e) => handleCategoryTitleChange(categoryIndex, e.target.value)}
                    className="flex-1 p-2 border border-slate-300 rounded-md"
                    autoFocus
                    onBlur={() => handleToggleEditCategoryTitle(categoryIndex)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleToggleEditCategoryTitle(categoryIndex);
                    }}
                  />
                ) : (
                  <h4 className="font-medium text-slate-700">{category.title}</h4>
                )}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleEditCategoryTitle(categoryIndex)}
                    className="p-1.5 hover:bg-slate-100 rounded-md"
                    title={category.isEditingTitle ? "Save title" : "Edit category title"}
                  >
                    {category.isEditingTitle ? <Save size={16} /> : <Edit2 size={16} />}
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(categoryIndex)}
                    className="p-1.5 hover:bg-red-100 text-red-500 rounded-md"
                    title="Delete category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {category.items.map((task, taskIndex) => (
                  <div key={taskIndex} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => handleTaskChange(categoryIndex, taskIndex, e.target.value)}
                      className="flex-1 p-2 border border-slate-200 rounded-md"
                      placeholder="Task description"
                    />
                    <button
                      onClick={() => handleDeleteTask(categoryIndex, taskIndex)}
                      className="p-1.5 hover:bg-red-100 text-red-500 rounded-md"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddTask(categoryIndex)}
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-600 mt-2"
                >
                  <Plus size={16} />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddCategory}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 w-full justify-center"
          >
            <Plus size={20} />
            <span>Add Category</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 px-4 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 mt-6"
        >
          Save Custom Task List
        </button>
      </div>
    </dialog>
  );
};

export default CustomTaskListCreator;