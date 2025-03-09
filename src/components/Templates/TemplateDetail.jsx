import React, { useState } from 'react';
import { 
    Circle,ArrowLeft, Edit2, Trash2, Tag, Calendar, BarChart2, 
  Check, X, ChevronDown, ChevronUp, Clock, CheckSquare, AlertTriangle
} from 'lucide-react';
import { deleteTemplate } from '../../utils/templateUtils';

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

const TemplateDetail = ({ template, onEdit, onBack, onDelete }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!template) return null;

  // Toggle category expansion
  const toggleCategory = (categoryIndex) => {
    setExpandedCategories({
      ...expandedCategories,
      [categoryIndex]: !expandedCategories[categoryIndex]
    });
  };

  // Handle delete confirmation
  const handleDelete = () => {
    deleteTemplate(template.id);
    setShowDeleteConfirm(false);
    onDelete();
  };

  // Count total tasks
  const totalTasks = template.categories?.reduce(
    (count, category) => count + (category.items?.length || 0), 
    0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Header with back button, title and actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Templates</span>
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors">
            {template.name}
          </h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-2 py-0.5 rounded-full flex items-center gap-1 text-sm ${difficultyColors[template.difficulty || 'medium']}`}>
              <Tag size={14} />
              {template.difficulty || 'Medium'} Difficulty
            </span>
            
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center gap-1 text-sm">
              <Clock size={14} />
              Used {template.usageCount || 0} times
            </span>
            
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center gap-1 text-sm">
              <CheckSquare size={14} />
              {totalTasks} tasks
            </span>
          </div>
          
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            {template.description || 'No description provided.'}
          </p>
          
          <div className="text-xs text-slate-500 dark:text-slate-500">
            Created {new Date(template.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      {/* Template Contents */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h2 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <CheckSquare className="text-teal-500 dark:text-teal-400" size={20} />
          Template Tasks
        </h2>
        
        <div className="space-y-4">
          {template.categories?.map((category, catIndex) => (
            <div key={catIndex} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div 
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 cursor-pointer"
                onClick={() => toggleCategory(catIndex)}
              >
                <h3 className="font-medium text-slate-700 dark:text-slate-200">
                  {category.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {category.items?.length || 0} tasks
                  </span>
                  {expandedCategories[catIndex] ? 
                    <ChevronUp size={16} className="text-slate-500 dark:text-slate-400" /> : 
                    <ChevronDown size={16} className="text-slate-500 dark:text-slate-400" />
                  }
                </div>
              </div>
              
              {expandedCategories[catIndex] && (
                <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                  {category.items?.map((task, taskIndex) => (
                    <div 
                      key={taskIndex} 
                      className="flex items-center p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg"
                    >
                      <div className="flex items-center justify-center w-5 h-5 mr-3">
                        <Circle size={18} className="text-slate-300 dark:text-slate-600" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-200">
                        {task}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {(!template.categories || template.categories.length === 0) && (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400">
              This template doesn't have any tasks yet.
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200">Delete Template?</h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete "{template.name}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateDetail;