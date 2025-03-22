// components/Templates/TemplateList.jsx
import React, { useState, useEffect } from 'react';
import { Layout, PlusCircle, BarChart2, Tag, CheckSquare, Sparkles } from 'lucide-react';
import { getTemplates } from '../../utils/templateUtils';

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

const TemplateList = ({ onSelectTemplate, onCreateTemplate, onAIGenerate, onViewAnalytics }) => {
  // IMPORTANT: Don't use the templates prop, directly get templates from storage
  const [templates, setTemplates] = useState([]);
  
  // Directly fetch from localStorage - identical to how analytics does it
  useEffect(() => {
    // Force refresh from localStorage on every render
    const freshData = localStorage.getItem('wellnessTracker') || '{}';
    const storageData = JSON.parse(freshData);
    const templatesData = storageData.templates || [];
    setTemplates(templatesData);
  }, []);
  
  // Sort by usage count to get most used templates
  const mostUsedTemplates = [...templates]
    .filter(t => (t.usageCount || 0) > 0) // Only show templates with usage
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, 3); // Top 3

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
            <Layout className="text-teal-500 dark:text-teal-400" size={24} />
            Task Templates
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onViewAnalytics}
              className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50 flex items-center gap-1 transition-colors"
            >
              <BarChart2 size={16} />
              <span className="hidden sm:inline">Analytics</span>
            </button>
            
            <button
              onClick={onAIGenerate}
              className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 flex items-center gap-1 transition-colors"
            >
              <Sparkles size={16} />
              <span className="hidden sm:inline">AI Generate</span>
            </button>
            
            <button
              onClick={onCreateTemplate}
              className="px-3 py-1.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 flex items-center gap-1 transition-colors"
            >
              <PlusCircle size={16} />
              <span className="hidden sm:inline">New Template</span>
            </button>
          </div>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="bg-teal-50 dark:bg-teal-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Layout className="text-teal-500 dark:text-teal-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No templates yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Create task templates to save time on recurring activities and streamline your daily planning.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={onCreateTemplate}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 transition-colors"
              >
                Create Template Manually
              </button>
              <button
                onClick={onAIGenerate}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-colors flex items-center gap-2"
              >
                <Sparkles size={18} />
                Generate with AI
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => {
              // Calculate total tasks in the template
              const totalTasks = template.categories
                ? template.categories.reduce((sum, cat) => sum + (cat.items?.length || 0), 0)
                : 0;
                
              return (
                <div 
                  key={template.id}
                  onClick={() => onSelectTemplate(template.id)}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-md cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <div className="bg-teal-50 dark:bg-teal-900/30 p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h4 className="font-medium text-slate-700 dark:text-slate-200">{template.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[template.difficulty || 'medium']}`}>
                      {template.difficulty || 'Medium'}
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                      {template.description || 'No description'}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {/* Show categories count */}
                      <div className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <Tag size={12} />
                        <span>{template.categories?.length || 0} categories</span>
                      </div>
                      
                      {/* Show tasks count */}
                      <div className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <CheckSquare size={12} />
                        <span>{totalTasks} tasks</span>
                      </div>
                      
                      {/* Show usage count - ensure we use same data as analytics */}
                      <div className={`px-2 py-1 rounded-full flex items-center gap-1 ${
                        (template.usageCount > 0) 
                          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300" 
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}>
                        Used {template.usageCount || 0} times
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Most Used Templates - Only show if there are used templates */}
      {mostUsedTemplates.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4">
            Most Used Templates
          </h3>
          
          <div className="space-y-3">
            {mostUsedTemplates.map(template => (
              <div 
                key={template.id}
                onClick={() => onSelectTemplate(template.id)}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-full rounded-l-lg ${difficultyColors[template.difficulty || 'medium']}`}></div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{template.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full text-xs text-green-600 dark:text-green-300">
                    Used {template.usageCount || 0} times
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateList;