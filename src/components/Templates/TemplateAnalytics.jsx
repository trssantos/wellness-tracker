import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart2, Filter, Tag, CheckSquare, Calendar, Zap } from 'lucide-react';
import { getTemplateAnalytics, getTemplatesByDifficulty } from '../../utils/templateUtils';

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

const TemplateAnalytics = ({ onBack }) => {
  const [analytics, setAnalytics] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('usageCount');
  
  useEffect(() => {
    const data = getTemplateAnalytics();
    setAnalytics(data);
  }, []);
  
  // Filter and sort analytics data
  const filteredAnalytics = analytics
    .filter(template => selectedDifficulty === 'all' || template.difficulty === selectedDifficulty)
    .sort((a, b) => {
      if (sortBy === 'usageCount') return b.usageCount - a.usageCount;
      if (sortBy === 'completionRate') return b.completionRate - a.completionRate;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  
  // Calculate totals
  const totalUsage = analytics.reduce((sum, template) => sum + template.usageCount, 0);
  const totalTasks = analytics.reduce((sum, template) => sum + template.totalTasks, 0);
  const totalCompletedTasks = analytics.reduce((sum, template) => sum + template.completedTasks, 0);
  const overallCompletionRate = totalTasks > 0 
    ? Math.round((totalCompletedTasks / totalTasks) * 100) 
    : 0;
  
  // Count by difficulty
  const difficultyCount = {
    easy: analytics.filter(t => t.difficulty === 'easy').length,
    medium: analytics.filter(t => t.difficulty === 'medium').length,
    hard: analytics.filter(t => t.difficulty === 'hard').length
  };
  
  // Get most complete template
  const mostCompleteTemplate = analytics.length > 0 
    ? analytics.reduce((prev, current) => 
        (current.completionRate > prev.completionRate) ? current : prev
      ) 
    : null;
  
  // Get least complete template
  const leastCompleteTemplate = analytics.length > 0 && analytics.some(t => t.usageCount > 0)
    ? analytics
        .filter(t => t.usageCount > 0)
        .reduce((prev, current) => 
          (current.completionRate < prev.completionRate) ? current : prev
        ) 
    : null;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <div className="flex items-center mb-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 ml-4 transition-colors flex items-center gap-2">
            <BarChart2 className="text-teal-500 dark:text-teal-400" size={20} />
            Template Analytics
          </h1>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
            <div className="text-sm text-teal-600 dark:text-teal-400 mb-1">Total Templates</div>
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">{analytics.length}</div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Uses</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalUsage}</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Total Tasks</div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{totalTasks}</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">Completion Rate</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{overallCompletionRate}%</div>
          </div>
        </div>
        
        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Tag size={16} className="text-teal-500 dark:text-teal-400" />
              Difficulty Breakdown
            </h3>
            
            <div className="flex gap-2 mb-4">
              <div className="flex flex-col items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg flex-1">
                <span className="text-xs text-green-600 dark:text-green-400">Easy</span>
                <span className="text-xl font-bold text-green-700 dark:text-green-300">{difficultyCount.easy}</span>
              </div>
              
              <div className="flex flex-col items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex-1">
                <span className="text-xs text-yellow-600 dark:text-yellow-400">Medium</span>
                <span className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{difficultyCount.medium}</span>
              </div>
              
              <div className="flex flex-col items-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg flex-1">
                <span className="text-xs text-red-600 dark:text-red-400">Hard</span>
                <span className="text-xl font-bold text-red-700 dark:text-red-300">{difficultyCount.hard}</span>
              </div>
            </div>
          </div>
          
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Zap size={16} className="text-teal-500 dark:text-teal-400" />
              Completion Insights
            </h3>
            
            <div className="space-y-3">
              {mostCompleteTemplate && mostCompleteTemplate.usageCount > 0 ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Most Completed</div>
                    <div className="font-medium text-slate-700 dark:text-slate-300">{mostCompleteTemplate.name}</div>
                  </div>
                  <div className="text-green-500 dark:text-green-400 font-bold">
                    {Math.round(mostCompleteTemplate.completionRate)}%
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  No completion data available yet
                </div>
              )}
              
              {leastCompleteTemplate && leastCompleteTemplate.usageCount > 0 ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Least Completed</div>
                    <div className="font-medium text-slate-700 dark:text-slate-300">{leastCompleteTemplate.name}</div>
                  </div>
                  <div className="text-red-500 dark:text-red-400 font-bold">
                    {Math.round(leastCompleteTemplate.completionRate)}%
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      
      {/* Templates Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <CheckSquare className="text-teal-500 dark:text-teal-400" size={18} />
            Template Performance
          </h2>
          
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="pr-8 py-1.5 pl-2 appearance-none border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <Filter size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400" />
            </div>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pr-8 py-1.5 pl-2 appearance-none border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm"
              >
                <option value="usageCount">Sort by Usage</option>
                <option value="completionRate">Sort by Completion</option>
                <option value="name">Sort by Name</option>
              </select>
              <Filter size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
        
        {analytics.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No template usage data available yet
          </div>
        ) : filteredAnalytics.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No templates match the selected filters
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 px-4 text-left text-slate-600 dark:text-slate-400 font-medium">Template</th>
                  <th className="py-2 px-4 text-left text-slate-600 dark:text-slate-400 font-medium">Difficulty</th>
                  <th className="py-2 px-4 text-right text-slate-600 dark:text-slate-400 font-medium">Uses</th>
                  <th className="py-2 px-4 text-right text-slate-600 dark:text-slate-400 font-medium">Tasks</th>
                  <th className="py-2 px-4 text-right text-slate-600 dark:text-slate-400 font-medium">Completion</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnalytics.map(template => (
                  <tr key={template.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {template.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${difficultyColors[template.difficulty || 'medium']}`}>
                        {template.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">
                      {template.usageCount}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400">
                      {template.completedTasks}/{template.totalTasks}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              template.completionRate >= 75 ? 'bg-green-500 dark:bg-green-600' :
                              template.completionRate >= 50 ? 'bg-lime-500 dark:bg-lime-600' :
                              template.completionRate >= 25 ? 'bg-yellow-500 dark:bg-yellow-600' :
                              'bg-red-500 dark:bg-red-600'
                            }`}
                            style={{ width: `${template.completionRate}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm ${
                          template.completionRate >= 75 ? 'text-green-600 dark:text-green-400' :
                          template.completionRate >= 50 ? 'text-lime-600 dark:text-lime-400' :
                          template.completionRate >= 25 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {Math.round(template.completionRate)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateAnalytics;