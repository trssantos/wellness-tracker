import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Layout, Check, AlertTriangle, Lock } from 'lucide-react';
import { getTemplates, applyTemplatesToDay } from '../utils/templateUtils';

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

const CustomTaskListCreator = ({ date, onClose, onTasksGenerated }) => {
  const [categories, setCategories] = useState([{ title: 'General', items: [''] }]);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(true);
  const [templateTasks, setTemplateTasks] = useState({}); // Track tasks from templates
  
  // Reset to template selection whenever date changes
  useEffect(() => {
    setShowTemplates(true);
    setError('');
    setSelectedTemplates([]);
    setTemplateTasks({});
  }, [date]);
  
  // Load templates and existing tasks if any
  useEffect(() => {
    setTemplates(getTemplates());
    loadExistingTasks();
  }, [date]);
  
  // Load existing tasks for this date if any
  const loadExistingTasks = () => {
    try {
      const storage = JSON.parse(localStorage.getItem('wellnessTracker') || '{}');
      const dateData = storage[date] || {};
      
      // If there are already custom tasks for this date, load them
      if (dateData.customTasks && dateData.customTasks.length > 0) {
        setCategories(JSON.parse(JSON.stringify(dateData.customTasks)));
        
        // If there are template-sourced tasks, load their info
        if (dateData.templateTasks) {
          setTemplateTasks(JSON.parse(JSON.stringify(dateData.templateTasks)));
        }
      } else {
        // Otherwise reset to default
        setCategories([{ title: 'General', items: [''] }]);
        setTemplateTasks({});
      }
    } catch (error) {
      console.error('Error loading existing tasks:', error);
      setCategories([{ title: 'General', items: [''] }]);
      setTemplateTasks({});
    }
  };
  
  const addCategory = () => {
    setCategories([...categories, { title: '', items: [''] }]);
  };
  
  const removeCategory = (categoryIndex) => {
    if (categories.length <= 1) {
      setError('You must have at least one category');
      return;
    }
    
    // Check if removing this category would remove template-sourced tasks
    const categoryTasks = categories[categoryIndex].items || [];
    const hasTemplateTasks = categoryTasks.some(task => templateTasks[task]);
    
    if (hasTemplateTasks) {
      // Allow removal of template tasks, just remove their tracking
      const newTemplateTasks = { ...templateTasks };
      categoryTasks.forEach(task => {
        if (newTemplateTasks[task]) {
          delete newTemplateTasks[task];
        }
      });
      setTemplateTasks(newTemplateTasks);
    }
    
    const newCategories = [...categories];
    newCategories.splice(categoryIndex, 1);
    setCategories(newCategories);
    setError('');
  };
  
  const updateCategoryTitle = (categoryIndex, title) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].title = title;
    setCategories(newCategories);
    setError('');
  };
  
  const addTask = (categoryIndex) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items.push('');
    setCategories(newCategories);
  };
  
  const removeTask = (categoryIndex, taskIndex) => {
    if (categories[categoryIndex].items.length <= 1) {
      setError('Each category must have at least one task');
      return;
    }
    
    // Check if this is a template-sourced task
    const taskToRemove = categories[categoryIndex].items[taskIndex];
    if (templateTasks[taskToRemove]) {
      // Allow removal, just remove from tracking
      const newTemplateTasks = { ...templateTasks };
      delete newTemplateTasks[taskToRemove];
      setTemplateTasks(newTemplateTasks);
    }
    
    const newCategories = [...categories];
    newCategories[categoryIndex].items.splice(taskIndex, 1);
    setCategories(newCategories);
    setError('');
  };
  
  const updateTask = (categoryIndex, taskIndex, text) => {
    const currentTask = categories[categoryIndex].items[taskIndex];
    
    // If this is a template task, don't allow renaming
    if (templateTasks[currentTask]) {
      setError('Tasks from templates cannot be renamed to maintain analytics tracking');
      return;
    }
    
    // Check for duplicate task names
    const allTasks = categories.flatMap(category => category.items);
    if (allTasks.includes(text) && text !== currentTask) {
      setError('Tasks must have unique names');
      return;
    }
    
    const newCategories = [...categories];
    newCategories[categoryIndex].items[taskIndex] = text;
    setCategories(newCategories);
    setError('');
  };
  
  // Toggle template selection
  const toggleTemplate = (templateId) => {
    if (selectedTemplates.includes(templateId)) {
      setSelectedTemplates(selectedTemplates.filter(id => id !== templateId));
    } else {
      setSelectedTemplates([...selectedTemplates, templateId]);
    }
    setError('');
  };
  
  // Apply selected templates to categories
  const applySelectedTemplates = () => {
    setError('');
    
    // If no templates selected, just proceed to next screen
    if (selectedTemplates.length === 0) {
      setShowTemplates(false);
      return;
    }
    
    // Get selected template objects
    const selectedTemplateObjects = templates.filter(t => selectedTemplates.includes(t.id));
    
    // Start with current categories (or empty array if just the default empty one)
    let newCategories = [...categories];
    if (newCategories.length === 1 && 
        newCategories[0].title === 'General' && 
        newCategories[0].items.length === 1 && 
        !newCategories[0].items[0].trim()) {
      newCategories = [];
    }
    
    // Track new template tasks
    let newTemplateTasks = { ...templateTasks };
    
    // Check for duplicate tasks across all templates and existing categories
    const existingTaskNames = new Set();
    
    // Collect existing task names that aren't empty
    categories.forEach(category => {
      category.items.forEach(item => {
        if (item.trim()) {
          existingTaskNames.add(item);
        }
      });
    });
    
    // Check for conflicts in templates
    const templateTaskConflicts = [];
    
    // First pass - identify conflicts
    selectedTemplateObjects.forEach(template => {
      template.categories.forEach(category => {
        category.items.forEach(item => {
          if (existingTaskNames.has(item)) {
            templateTaskConflicts.push(item);
          }
          existingTaskNames.add(item);
        });
      });
    });
    
    // If we have conflicts, show error and don't proceed
    if (templateTaskConflicts.length > 0) {
      setError(`Duplicate task names detected: ${templateTaskConflicts.join(', ')}. Please select different templates or modify existing tasks.`);
      return;
    }
    
    // Second pass - apply templates
    selectedTemplateObjects.forEach(template => {
      template.categories.forEach(category => {
        const existingCategoryIndex = newCategories.findIndex(c => c.title === category.title);
        
        if (existingCategoryIndex !== -1) {
          // Add unique tasks to existing category
          const existingItems = newCategories[existingCategoryIndex].items;
          const newItems = category.items.filter(item => !existingItems.includes(item));
          
          // Mark all new items as template-sourced
          newItems.forEach(task => {
            newTemplateTasks[task] = {
              templateId: template.id,
              templateName: template.name
            };
          });
          
          newCategories[existingCategoryIndex].items = [...existingItems, ...newItems];
        } else {
          // Add new category with all its items
          const newCategory = {
            title: category.title,
            items: [...category.items]
          };
          
          // Mark all items as template-sourced
          category.items.forEach(task => {
            newTemplateTasks[task] = {
              templateId: template.id,
              templateName: template.name
            };
          });
          
          newCategories.push(newCategory);
        }
      });
    });
    
    // If we ended up with no categories (unlikely but possible), add default
    if (newCategories.length === 0) {
      newCategories = [{ title: 'General', items: [''] }];
    }
    
    // Update state
    setCategories(newCategories);
    setTemplateTasks(newTemplateTasks);
    setShowTemplates(false);
  }
  
  // Skip templates - explicit button handler
  const skipTemplates = () => {
    setError('');
    setShowTemplates(false);
  };
  
  const validateTaskList = () => {
    // Reset error
    setError('');
    
    // Check if any category title is empty
    const invalidCategory = categories.find(category => !category.title.trim());
    if (invalidCategory) {
      setError('All categories must have a title');
      return false;
    }
    
    // Check if any task is empty
    for (const category of categories) {
      const emptyTask = category.items.find(item => !item.trim());
      if (emptyTask !== undefined) {
        setError('All tasks must have a description');
        return false;
      }
    }
    
    // Check for duplicate task names
    const allTasks = categories.flatMap(category => category.items);
    const uniqueTasks = new Set(allTasks);
    if (uniqueTasks.size !== allTasks.length) {
      setError('Tasks must have unique names');
      return false;
    }
    
    return true;
  };
  
  const handleSave = () => {
    if (!validateTaskList()) {
      return;
    }
    
    // Get existing data
    const existingData = JSON.parse(localStorage.getItem('wellnessTracker') || '{}');
    const dateData = existingData[date] || {};
    
    // Initialize checked state
    const allTasks = categories.flatMap(category => category.items);
    const initialChecked = allTasks.reduce((acc, task) => {
      // Preserve existing checked status if it exists
      acc[task] = dateData.checked && dateData.checked[task] !== undefined 
        ? dateData.checked[task] 
        : false;
      return acc;
    }, {});
    
    // Save to storage
    existingData[date] = {
      ...dateData,
      customTasks: categories,
      templateTasks: templateTasks, // Save template task tracking
      checked: { ...(dateData.checked || {}), ...initialChecked }
    };
    
    // Record selected templates if any
    if (selectedTemplates.length > 0) {
      applyTemplatesToDay(date, selectedTemplates);
    } else {
      localStorage.setItem('wellnessTracker', JSON.stringify(existingData));
    }
    
    onTasksGenerated();
  };
  
  return (
    <dialog id="custom-tasklist-modal" className="modal">
      <div className="modal-box max-w-4xl bg-white dark:bg-slate-800 p-0 rounded-lg shadow-lg transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
            <Layout className="text-blue-500 dark:text-blue-400" size={24} />
            Create Custom Task List
          </h2>
          <button 
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Error Display - Always visible at top */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900 rounded-lg p-3 text-red-600 dark:text-red-400 flex items-start gap-2 mb-4">
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        
          {/* Templates Section */}
          {showTemplates ? (
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                  Select Templates
                </h3>
                <button
                  onClick={applySelectedTemplates}
                  className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                >
                  <Check size={16} />
                  <span>{selectedTemplates.length > 0 ? 'Apply Selected' : 'Continue'}</span>
                </button>
              </div>
              
              {templates.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No templates available. Create templates in the Templates section.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {templates.map(template => (
                    <div 
                      key={template.id}
                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedTemplates.includes(template.id)
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                      onClick={() => toggleTemplate(template.id)}
                    >
                      <div className="flex items-center p-3 gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          selectedTemplates.includes(template.id)
                            ? 'bg-blue-500 dark:bg-blue-600'
                            : 'border border-slate-300 dark:border-slate-600'
                        }`}>
                          {selectedTemplates.includes(template.id) && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-slate-700 dark:text-slate-200">{template.name}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[template.difficulty || 'medium']}`}>
                              {template.difficulty || 'Medium'}
                            </span>
                          </div>
                          
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {template.description || 'No description'}
                          </p>
                          
                          <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                            {template.categories?.reduce((count, cat) => count + cat.items.length, 0) || 0} tasks
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex justify-between">
                <button
                  onClick={skipTemplates}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Skip Templates
                </button>
                
                <button
                  onClick={applySelectedTemplates}
                  className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                >
                  <Check size={16} />
                  <span>{selectedTemplates.length > 0 ? `Apply ${selectedTemplates.length} Selected` : 'Continue Without Templates'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Custom Tasks Editor */}
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                  Edit Task List for {new Date(date).toLocaleDateString()}
                </h3>
                <button
                  onClick={addCategory}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg flex items-center gap-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Plus size={16} />
                  <span>Add Category</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {categories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <input
                        type="text"
                        placeholder="Category Name"
                        value={category.title}
                        onChange={(e) => updateCategoryTitle(categoryIndex, e.target.value)}
                        className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                      />
                      <button
                        onClick={() => removeCategory(categoryIndex)}
                        className="ml-2 p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Remove Category"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="space-y-2 ml-4 pl-2 border-l-2 border-slate-200 dark:border-slate-700 transition-colors">
                      {category.items.map((task, taskIndex) => {
                        const isTemplateTask = !!templateTasks[task];
                        
                        return (
                          <div key={taskIndex} className="flex items-center">
                            <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full mr-2 transition-colors"></div>
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                placeholder="Task description"
                                value={task}
                                onChange={(e) => updateTask(categoryIndex, taskIndex, e.target.value)}
                                className={`w-full p-2 border ${
                                  isTemplateTask 
                                    ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20' 
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700'
                                } rounded-lg text-slate-700 dark:text-slate-200 transition-colors`}
                                readOnly={isTemplateTask}
                              />
                              {isTemplateTask && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400">
                                  <Lock size={14} />
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => removeTask(categoryIndex, taskIndex)}
                              className="ml-2 p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Remove Task"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                      
                      <button
                        onClick={() => addTask(categoryIndex)}
                        className="flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 mt-2 transition-colors"
                      >
                        <Plus size={16} />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => {
                    setError('');
                    setShowTemplates(true);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
                >
                  <Layout size={16} />
                  <span>Back to Templates</span>
                </button>
                
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  <span>Save Task List</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="modal-backdrop bg-slate-900/50" onClick={onClose}></div>
    </dialog>
  );
};

export default CustomTaskListCreator;