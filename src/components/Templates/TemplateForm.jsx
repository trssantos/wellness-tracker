import React, { useState, useEffect } from 'react';
import { ArrowLeft, PlusCircle, X, Save, AlertTriangle } from 'lucide-react';
import { createTemplate, updateTemplate } from '../../utils/templateUtils';

const TemplateForm = ({ template, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [categories, setCategories] = useState([{ title: 'General', items: [''] }]);
  const [errors, setErrors] = useState({});
  
  // Initialize form if editing an existing template
  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setDescription(template.description || '');
      setDifficulty(template.difficulty || 'medium');
      
      if (template.categories && template.categories.length > 0) {
        setCategories(template.categories.map(cat => ({
          title: cat.title,
          items: [...cat.items]
        })));
      }
    }
  }, [template]);
  
  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Template name is required';
    }
    
    if (categories.length === 0) {
      newErrors.categories = 'At least one category is required';
    } else {
      // Check each category
      const categoriesWithEmptyTitles = categories.filter(cat => !cat.title.trim());
      if (categoriesWithEmptyTitles.length > 0) {
        newErrors.categoryTitles = 'All categories must have a title';
      }
      
      // Check each category has at least one task
      const categoriesWithNoTasks = categories.filter(cat => 
        cat.items.length === 0 || cat.items.every(item => !item.trim())
      );
      if (categoriesWithNoTasks.length > 0) {
        newErrors.categoryItems = 'All categories must have at least one task';
      }
      
      // Check for empty tasks
      let hasEmptyTask = false;
      categories.forEach(cat => {
        cat.items.forEach(item => {
          if (!item.trim()) {
            hasEmptyTask = true;
          }
        });
      });
      
      if (hasEmptyTask) {
        newErrors.emptyTasks = 'All tasks must have content';
      }
      
      // Check for duplicate task names - only when submitting
      const allTasks = categories.flatMap(cat => cat.items);
      const uniqueTasks = new Set();
      const duplicates = [];
      
      allTasks.forEach(task => {
        if (task && task.trim()) {
          if (uniqueTasks.has(task)) {
            duplicates.push(task);
          } else {
            uniqueTasks.add(task);
          }
        }
      });
      
      if (duplicates.length > 0) {
        newErrors.duplicateTasks = `Duplicate tasks found: ${duplicates.join(', ')}`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const templateData = {
      name,
      description,
      difficulty,
      categories
    };
    
    if (template) {
      // Update existing
      updateTemplate(template.id, templateData);
    } else {
      // Create new
      createTemplate(templateData);
    }
    
    onSave();
  };
  
  // Category management
  const addCategory = () => {
    setCategories([...categories, { title: '', items: [''] }]);
  };
  
  const removeCategory = (index) => {
    if (categories.length === 1) {
      setErrors({...errors, categories: 'At least one category is required'});
      return;
    }
    
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    setCategories(newCategories);
  };
  
  const updateCategoryTitle = (index, title) => {
    const newCategories = [...categories];
    newCategories[index].title = title;
    setCategories(newCategories);
  };
  
  // Task management
  const addTask = (categoryIndex) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items.push('');
    setCategories(newCategories);
  };
  
  const removeTask = (categoryIndex, taskIndex) => {
    if (categories[categoryIndex].items.length === 1) {
      setErrors({...errors, categoryItems: 'Each category must have at least one task'});
      return;
    }
    
    const newCategories = [...categories];
    newCategories[categoryIndex].items.splice(taskIndex, 1);
    setCategories(newCategories);
  };
  
  const updateTask = (categoryIndex, taskIndex, text) => {
    // Simple update without checking for duplicates during typing
    const newCategories = [...categories];
    newCategories[categoryIndex].items[taskIndex] = text;
    setCategories(newCategories);
  };
  
  return (
    <div className="space-y-4">
      {/* Header with back button and title */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors">
        <div className="flex items-center mb-4 sm:mb-6">
          <button 
            onClick={onCancel}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 ml-3 sm:ml-4 transition-colors">
            {template ? 'Edit Template' : 'Create Template'}
          </h1>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Display validation errors at the top */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                <AlertTriangle size={18} />
                <h5 className="font-medium text-sm">Please fix the following errors:</h5>
              </div>
              <ul className="list-disc pl-6 space-y-1 text-xs sm:text-sm">
                {Object.values(errors).map((error, index) => (
                  <li key={index} className="text-red-600 dark:text-red-400">{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Template Details */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Template Name*
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm"
                placeholder="E.g., Morning Routine, Work Day"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm"
                placeholder="What is this template for?"
                rows={2}
              />
            </div>
            
            <div>
              <label htmlFor="difficulty" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          
          {/* Categories and Tasks */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-sm sm:text-lg font-medium text-slate-700 dark:text-slate-300">Categories & Tasks</h2>
              <button
                type="button"
                onClick={addCategory}
                className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors text-xs sm:text-sm"
              >
                <PlusCircle size={14} />
                <span>Add Category</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {categories.map((category, catIndex) => (
                <div key={catIndex} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <input
                      type="text"
                      value={category.title}
                      onChange={(e) => updateCategoryTitle(catIndex, e.target.value)}
                      className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm"
                      placeholder="Category Name"
                    />
                    <button
                      type="button"
                      onClick={() => removeCategory(catIndex)}
                      className="ml-2 p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                      title="Remove Category"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-2 ml-2 sm:ml-4 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
                    {category.items.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full mr-2 mt-2.5 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={task}
                            onChange={(e) => updateTask(catIndex, taskIndex, e.target.value)}
                            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm"
                            placeholder="Task description"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTask(catIndex, taskIndex)}
                          className="ml-1 p-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg flex-shrink-0"
                          title="Remove Task"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => addTask(catIndex)}
                      className="flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 mt-2 text-xs"
                    >
                      <PlusCircle size={12} />
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 sm:py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 sm:py-2 bg-teal-500 dark:bg-teal-600 text-white rounded-lg hover:bg-teal-600 dark:hover:bg-teal-700 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Save size={14} />
              {template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateForm;