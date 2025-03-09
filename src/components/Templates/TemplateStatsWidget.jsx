import React from 'react';
import { Layout, BarChart2 } from 'lucide-react';
import { getTemplateAnalytics } from '../../utils/templateUtils';

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

const TemplateStatsWidget = () => {
  const analytics = getTemplateAnalytics();
  
  // Only keep templates with usage
  const usedTemplates = analytics.filter(t => t.usageCount > 0);
  
  // Sort by usage count (most used first)
  const sortedTemplates = usedTemplates.sort((a, b) => b.usageCount - a.usageCount);
  
  // Only show top 5
  const topTemplates = sortedTemplates.slice(0, 5);
  
  // Calculate total usage
  const totalUsage = analytics.reduce((sum, t) => sum + t.usageCount, 0);
  
  if (totalUsage === 0) {
    return null; // Don't show widget if no templates have been used
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors">
          <Layout className="text-teal-500 dark:text-teal-400" size={20} />
          Template Usage
        </h3>
        
        {/* Use existing pattern for changing views - we'll use a "Premium" tag instead of a button */}
        <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-md font-medium">
          PREMIUM
        </span>
      </div>
      
      {topTemplates.length === 0 ? (
        <div className="text-center py-4 text-slate-500 dark:text-slate-400">
          No templates have been used yet
        </div>
      ) : (
        <div className="space-y-3">
          {topTemplates.map(template => (
            <div key={template.id} className="relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <span className="font-medium text-slate-700 dark:text-slate-300 mr-2">
                    {template.name}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${difficultyColors[template.difficulty || 'medium']}`}>
                    {template.difficulty || 'Medium'}
                  </span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {template.usageCount} {template.usageCount === 1 ? 'use' : 'uses'}
                </span>
              </div>
              
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 dark:bg-teal-600 rounded-full"
                  style={{ width: `${(template.usageCount / totalUsage) * 100}%` }}
                ></div>
              </div>
              
              {template.completionRate > 0 && (
                <div className="flex items-center justify-end mt-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Completion: 
                    <span className={`ml-1 font-medium ${
                      template.completionRate >= 75 ? 'text-green-600 dark:text-green-400' :
                      template.completionRate >= 50 ? 'text-lime-600 dark:text-lime-400' :
                      template.completionRate >= 25 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {Math.round(template.completionRate)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Premium call-to-action */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Unlock full template analytics with ZenTrack Premium
          </p>
          <button disabled className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg text-sm opacity-80 cursor-not-allowed">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateStatsWidget;