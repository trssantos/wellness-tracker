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
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors">
        <div className="flex items-center mb-4 sm:mb-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 ml-3 transition-colors flex items-center gap-2">
            <BarChart2 className="text-teal-500 dark:text-teal-400" size={18} />
            Template Analytics
          </h1>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg">
            <div className="text-xs sm:text-sm text-teal-600 dark:text-teal-400 mb-1">Templates</div>
            <div className="text-xl sm:text-2xl font-bold text-teal-700 dark:text-teal-300">{analytics.length}</div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mb-1">Uses</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">{totalUsage}</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 mb-1">Tasks</div>
            <div className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300">{totalTasks}</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 mb-1">Completion</div>
            <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300">{overallCompletionRate}%</div>
          </div>
        </div>
        
        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4">
            <h3 className="font-medium text-sm sm:text-base text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 flex items-center gap-2">
              <Tag size={14} className="text-teal-500 dark:text-teal-400" />
              Difficulty Breakdown
            </h3>
            
            <div className="flex gap-2">
              <div className="flex flex-col items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg flex-1">
                <span className="text-xs text-green-600 dark:text-green-400">Easy</span>
                <span className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-300">{difficultyCount.easy}</span>
              </div>
              
              <div className="flex flex-col items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex-1">
                <span className="text-xs text-yellow-600 dark:text-yellow-400">Medium</span>
                <span className="text-lg sm:text-xl font-bold text-yellow-700 dark:text-yellow-300">{difficultyCount.medium}</span>
              </div>
              
              <div className="flex flex-col items-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg flex-1">
                <span className="text-xs text-red-600 dark:text-red-400">Hard</span>
                <span className="text-lg sm:text-xl font-bold text-red-700 dark:text-red-300">{difficultyCount.hard}</span>
              </div>
            </div>
          </div>
          
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4">
            <h3 className="font-medium text-sm sm:text-base text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 flex items-center gap-2">
              <Zap size={14} className="text-teal-500 dark:text-teal-400" />
              Completion Insights
            </h3>
            
            <div className="space-y-2 sm:space-y-3">
              {mostCompleteTemplate && mostCompleteTemplate.usageCount > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Most Completed</div>
                    <div className="font-medium text-slate-700 dark:text-slate-300 text-sm truncate">{mostCompleteTemplate.name}</div>
                  </div>
                  <div className="text-green-500 dark:text-green-400 font-bold text-sm ml-2">
                    {Math.round(mostCompleteTemplate.completionRate)}%
                  </div>
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  No completion data available yet
                </div>
              )}
              
              {leastCompleteTemplate && leastCompleteTemplate.usageCount > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Least Completed</div>
                    <div className="font-medium text-slate-700 dark:text-slate-300 text-sm truncate">{leastCompleteTemplate.name}</div>
                  </div>
                  <div className="text-red-500 dark:text-red-400 font-bold text-sm ml-2">
                    {Math.round(leastCompleteTemplate.completionRate)}%
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      
      {/* Templates Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <CheckSquare className="text-teal-500 dark:text-teal-400" size={16} />
            Template Performance
          </h2>
          
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="pr-7 py-1 pl-2 appearance-none border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <Filter size={12} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400" />
            </div>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pr-7 py-1 pl-2 appearance-none border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs"
              >
                <option value="usageCount">By Usage</option>
                <option value="completionRate">By Completion</option>
                <option value="name">By Name</option>
              </select>
              <Filter size={12} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
        
        {analytics.length === 0 ? (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
            No template usage data available yet
          </div>
        ) : filteredAnalytics.length === 0 ? (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
            No templates match the selected filters
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* For mobile: card-based view */}
            <div className="block sm:hidden space-y-3">
              {filteredAnalytics.map(template => (
                <div key={template.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm truncate">{template.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${difficultyColors[template.difficulty || 'medium']}`}>
                      {template.difficulty || 'Medium'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                      <div className="text-slate-500 dark:text-slate-400">Uses</div>
                      <div className="font-medium text-slate-700 dark:text-slate-300">{template.usageCount}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                      <div className="text-slate-500 dark:text-slate-400">Tasks</div>
                      <div className="font-medium text-slate-700 dark:text-slate-300">{template.completedTasks}/{template.totalTasks}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Completion</div>
                      <span className={`text-xs font-medium ${
                        template.completionRate >= 75 ? 'text-green-600 dark:text-green-400' :
                        template.completionRate >= 50 ? 'text-lime-600 dark:text-lime-400' :
                        template.completionRate >= 25 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {Math.round(template.completionRate)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
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
                  </div>
                </div>
              ))}
            </div>
            
            {/* For tablet/desktop: table view */}
            <table className="w-full border-collapse hidden sm:table">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 px-3 text-left text-slate-600 dark:text-slate-400 font-medium text-xs sm:text-sm">Template</th>
                  <th className="py-2 px-3 text-left text-slate-600 dark:text-slate-400 font-medium text-xs sm:text-sm">Difficulty</th>
                  <th className="py-2 px-3 text-right text-slate-600 dark:text-slate-400 font-medium text-xs sm:text-sm">Uses</th>
                  <th className="py-2 px-3 text-right text-slate-600 dark:text-slate-400 font-medium text-xs sm:text-sm">Tasks</th>
                  <th className="py-2 px-3 text-right text-slate-600 dark:text-slate-400 font-medium text-xs sm:text-sm">Completion</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnalytics.map(template => (
                  <tr key={template.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm truncate max-w-[140px] sm:max-w-none">
                      {template.name}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${difficultyColors[template.difficulty || 'medium']}`}>
                        {template.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                      {template.usageCount}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500 dark:text-slate-400 text-xs">
                      {template.completedTasks}/{template.totalTasks}
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 sm:w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
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
                        <span className={`text-xs ${
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