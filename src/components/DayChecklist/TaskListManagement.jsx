import React, { useState, useEffect } from 'react';
import { Layout, Trash2, Plus, AlertTriangle, X, Check } from 'lucide-react';
import { getTemplates, applyTemplatesToDay } from '../../utils/templateUtils';

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

const TaskListManagement = ({ date, onClose, onUpdateTasks, onDeleteTaskList }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Load templates
  useEffect(() => {
    setTemplates(getTemplates());
  }, []);
  
  // Toggle template selection
  const toggleTemplate = (templateId) => {
    if (selectedTemplates.includes(templateId)) {
      setSelectedTemplates(selectedTemplates.filter(id => id !== templateId));
    } else {
      setSelectedTemplates([...selectedTemplates, templateId]);
    }
    // Clear error when user makes changes
    setError('');
  };
  
  // Apply selected templates
  const applySelectedTemplates = () => {
    if (selectedTemplates.length === 0) {
      setError('Please select at least one template');
      return;
    }
    
    // Check for duplicate tasks
    try {
      const storage = JSON.parse(localStorage.getItem('wellnessTracker') || '{}');
      const dateData = storage[date] || {};
      const existingTasks = new Set();
      
      // Collect existing tasks
      if (dateData.customTasks) {
        dateData.customTasks.forEach(cat => {
          cat.items.forEach(task => existingTasks.add(task));
        });
      }
      if (dateData.aiTasks) {
        dateData.aiTasks.forEach(cat => {
          cat.items.forEach(task => existingTasks.add(task));
        });
      }
      if (dateData.defaultTasks) {
        dateData.defaultTasks.forEach(cat => {
          cat.items.forEach(task => existingTasks.add(task));
        });
      }
      
      // Check selected templates for duplicates
      const selectedTemplateObjects = templates.filter(t => selectedTemplates.includes(t.id));
      const conflicts = [];
      
      selectedTemplateObjects.forEach(template => {
        template.categories.forEach(category => {
          category.items.forEach(task => {
            if (existingTasks.has(task)) {
              conflicts.push(task);
            }
            existingTasks.add(task);
          });
        });
      });
      
      if (conflicts.length > 0) {
        setError(`Task name conflicts: ${conflicts.join(', ')}. Please select different templates.`);
        return;
      }
    } catch (error) {
      console.error('Error checking for duplicate tasks:', error);
    }
    
    // Apply templates to the date
    applyTemplatesToDay(date, selectedTemplates);
    
    // Notify parent component to refresh
    onUpdateTasks();
    onClose();
  };
  
  // Handle delete confirmation
  const handleDeleteTaskList = () => {
    // Perform deletion
    const storage = JSON.parse(localStorage.getItem('wellnessTracker') || '{}');
    if (storage[date]) {
      // Keep other date data but remove tasks
      delete storage[date].defaultTasks;
      delete storage[date].aiTasks;
      delete storage[date].customTasks;
      delete storage[date].checked;
      delete storage[date].usedTemplates;
      delete storage[date].templateTasks;
      
      localStorage.setItem('wellnessTracker', JSON.stringify(storage));
      
      // Notify parent
      onDeleteTaskList();
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Layout size={20} className="text-blue-500 dark:text-blue-400" />
          Task List Management
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900 rounded-lg p-3 text-red-600 dark:text-red-400 flex items-start gap-2 mb-4">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      
      {/* Add Templates Section */}
      <div>
        <h4 className="font-medium text-slate-600 dark:text-slate-400 mb-3">
          Add Tasks from Templates
        </h4>
        
        {templates.length === 0 ? (
          <div className="text-center py-4 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
            No templates available. Create templates in the Templates section.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
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
                    
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                      {template.categories?.reduce((count, cat) => count + cat.items.length, 0) || 0} tasks
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button
          onClick={applySelectedTemplates}
          className="mt-4 w-full py-2 px-4 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
          disabled={selectedTemplates.length === 0}
        >
          <Plus size={16} />
          <span>Add Selected Templates</span>
        </button>
      </div>
      
      {/* Delete Tasks Section */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <h4 className="font-medium text-slate-600 dark:text-slate-400 mb-3">
          Delete Task List
        </h4>
        
        {showDeleteConfirm ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-3">
              <AlertTriangle size={20} />
              <h5 className="font-medium">Confirm Deletion</h5>
            </div>
            
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Are you sure you want to delete all tasks for {new Date(date).toLocaleDateString()}? This action cannot be undone.
            </p>
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTaskList}
                className="px-3 py-1.5 bg-red-500 dark:bg-red-600 text-white rounded-lg flex items-center gap-1"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-2 px-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2 justify-center"
          >
            <Trash2 size={16} />
            <span>Delete Task List</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskListManagement;