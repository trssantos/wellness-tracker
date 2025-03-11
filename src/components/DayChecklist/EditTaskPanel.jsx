// DayChecklist/EditTaskPanel.jsx
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import EditCategoryForm from './EditCategoryForm';

const EditTaskPanel = ({
  editedCategories,
  setEditedCategories,
  editingError,
  setEditingError,
  saveEdits,
  cancelEditing
}) => {
  // Category editing functions
  const handleAddCategory = () => {
    setEditedCategories([
      ...editedCategories,
      { title: `Category ${editedCategories.length + 1}`, items: ['New Task'] }
    ]);
  };

  return (
    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
      {editedCategories.map((category, categoryIdx) => (
        <EditCategoryForm
          key={categoryIdx}
          category={category}
          categoryIdx={categoryIdx}
          editedCategories={editedCategories}
          setEditedCategories={setEditedCategories}
          setEditingError={setEditingError}
        />
      ))}

      <button
        onClick={handleAddCategory}
        className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40 w-full justify-center transition-colors text-sm"
      >
        <Plus size={16} />
        <span>Add Category</span>
      </button>

      {editingError && (
        <div className="mt-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg text-sm transition-colors">
          <p>{editingError}</p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={saveEdits}
          className="flex-1 py-2 px-3 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors text-sm"
        >
          Save Changes
        </button>
        <button
          onClick={cancelEditing}
          className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditTaskPanel;