import React from 'react';
import { Trophy, Calendar, CheckSquare, Sparkles, Award, BarChart2, Bell, Zap, Target, Medal, Flame, ArrowRight, RefreshCcw, ListChecks, Activity } from 'lucide-react';

const HabitsPlaceholder = () => {
  // Features for habits section
  const features = [
    { icon: <Target size={18} />, title: "Habit Builder", description: "Create and customize habits with step-by-step actions" },
    { icon: <Sparkles size={18} />, title: "AI Suggestions", description: "Get personalized habit recommendations based on your goals" },
    { icon: <Zap size={18} />, title: "Streak Tracking", description: "Visualize your progress and maintain consistency" },
    { icon: <Award size={18} />, title: "Milestones", description: "Set achievement goals and celebrate your progress" }
  ];

  // Mock data for completion patterns (1=completed, 0=not scheduled/skipped, -1=missed)
  const completionData = [
    { date: 'Mar 1', status: 1 },
    { date: 'Mar 2', status: 1 },
    { date: 'Mar 3', status: 0 }, // not scheduled
    { date: 'Mar 4', status: 0 }, // not scheduled
    { date: 'Mar 5', status: 1 },
    { date: 'Mar 6', status: 1 },
    { date: 'Mar 7', status: 1 },
    { date: 'Mar 8', status: 1 },
    { date: 'Mar 9', status: 1 },
    { date: 'Mar 10', status: 0 }, // not scheduled
    { date: 'Mar 11', status: 0 }, // not scheduled
    { date: 'Mar 12', status: 1 },
    { date: 'Mar 13', status: -1 }, // missed
    { date: 'Mar 14', status: 1 },
    { date: 'Mar 15', status: 1 },
    { date: 'Mar 16', status: 1 },
    { date: 'Mar 17', status: 0 }, // not scheduled
    { date: 'Mar 18', status: 0 }, // not scheduled
    { date: 'Mar 19', status: 1 },
    { date: 'Mar 20', status: 1 },
    { date: 'Mar 21', status: 1 },
    { date: 'Mar 22', status: -1 }, // missed
    { date: 'Mar 23', status: 1 },
    { date: 'Mar 24', status: 0 }, // not scheduled
    { date: 'Mar 25', status: 0 }, // not scheduled
    { date: 'Mar 26', status: 1 },
    { date: 'Mar 27', status: 1 },
    { date: 'Mar 28', status: 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 transition-colors">
          <Calendar className="text-blue-500 dark:text-blue-400" size={24} />
          Habit Tracking
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-8 rounded-xl mb-4 flex items-center justify-center flex-shrink-0">
            <Calendar className="text-blue-500 dark:text-blue-400" size={80} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors">
              Coming Soon
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 transition-colors">
              Build lasting habits with our science-based tracking system. Monitor your streaks,
              set milestones, and get AI-powered suggestions to help you stay consistent
              and achieve your goals.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Integration with task system */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <RefreshCcw className="text-teal-500 dark:text-teal-400" size={20} />
          Seamless Integration
        </h3>
        
        <div className="bg-teal-50 dark:bg-teal-900/30 rounded-lg p-4 mb-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={18} className="text-blue-500 dark:text-blue-400" />
                <p className="font-medium text-slate-700 dark:text-slate-300">Morning Meditation</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 dark:border-blue-400 rounded-sm flex items-center justify-center bg-blue-500 dark:bg-blue-400">
                    <CheckSquare size={10} className="text-white" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Prepare quiet space</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 dark:border-blue-400 rounded-sm">
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">5 minutes of mindfulness</span>
                </div>
              </div>
            </div>
            
            <div className="text-teal-600 dark:text-teal-400">
              <ArrowRight size={24} className="hidden sm:block" />
              <ArrowRight size={24} className="sm:hidden rotate-90" />
            </div>
            
            <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks size={18} className="text-teal-500 dark:text-teal-400" />
                <p className="font-medium text-slate-700 dark:text-slate-300">Daily Tasks</p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Your habits automatically integrate with your daily task lists, creating a connected system that helps you build consistency.
              </p>
              <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                Habits that become tasks that track your streaks!
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Every habit you create is automatically transformed into actionable tasks in your daily planner. Complete your tasks to build your habit streaks - everything works together in one connected system.
        </p>
      </div>
      
      {/* Analytics preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <BarChart2 className="text-blue-500 dark:text-blue-400" size={20} />
          Extensive Analytics
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-amber-500" />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Streak</div>
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">14 days</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Medal size={18} className="text-purple-500" />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Habits</div>
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">8</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={18} className="text-green-500" />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Completion Rate</div>
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">87%</div>
          </div>
        </div>
        
        {/* Daily Completion Pattern Chart - Now with more realistic visualization */}
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Activity size={16} className="text-blue-500" />
              Daily Completion Patterns
            </h4>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Missed</span>
              </div>
            </div>
          </div>
          
          <div className="relative h-32 w-full">
            {/* Chart grid lines */}
            <div className="absolute inset-0">
              <div className="border-b border-slate-200 dark:border-slate-600 absolute top-0 w-full"></div>
              <div className="border-b border-slate-200 dark:border-slate-600 absolute top-1/3 w-full"></div>
              <div className="border-b border-slate-200 dark:border-slate-600 absolute top-2/3 w-full"></div>
              <div className="border-b border-slate-200 dark:border-slate-600 absolute bottom-0 w-full"></div>
            </div>
            
            {/* Data points */}
            <div className="absolute inset-0 flex items-end">
              {completionData.map((item, index) => {
                // Calculate position
                const xPos = `${(index / (completionData.length - 1)) * 100}%`;
                
                // Determine point appearance based on status
                let pointColor = '';
                let pointSize = '';
                let yPos = '';
                
                if (item.status === 1) {
                  // Completed - green dot at top
                  pointColor = 'bg-green-500 dark:bg-green-400';
                  pointSize = 'w-2 h-2 sm:w-3 sm:h-3';
                  yPos = 'top-2';
                } else if (item.status === -1) {
                  // Missed - red dot at bottom
                  pointColor = 'bg-red-500 dark:bg-red-400';
                  pointSize = 'w-2 h-2 sm:w-3 sm:h-3';
                  yPos = 'bottom-2';
                } else {
                  // Not scheduled - no dot
                  return null;
                }
                
                return (
                  <div key={index} className="absolute" style={{ left: xPos }}>
                    <div className={`${pointColor} ${pointSize} rounded-full ${yPos} relative`}></div>
                  </div>
                );
              })}
              
              {/* Area chart fill */}
              <svg className="absolute inset-0 w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <path
                  d={`M0,${80} ${completionData.map((item, index) => {
                    const x = (index / (completionData.length - 1)) * 100;
                    const y = item.status === 1 ? 10 : item.status === -1 ? 80 : 40;
                    return `L${x},${y}`;
                  }).join(' ')} L100,${80} Z`}
                  fill="url(#areaGradient)"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="transition-colors dark:stroke-blue-400 dark:fill-blue-900/30"
                />
              </svg>
              
              {/* Connecting line */}
              <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                <polyline
                  points={completionData.map((item, index) => {
                    const x = (index / (completionData.length - 1)) * 100;
                    const y = item.status === 1 ? 10 : item.status === -1 ? 80 : 40;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeDasharray="1,1"
                  className="transition-colors dark:stroke-blue-400"
                />
              </svg>
            </div>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 w-full flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
              <span>Mar 1</span>
              <span>Mar 7</span>
              <span>Mar 14</span>
              <span>Mar 21</span>
              <span>Mar 28</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <strong>Advanced insights:</strong> Track day-of-week performance, time-of-day completion rates, habit correlation analysis, and streak breakdowns. All analytics connect with your task completion data for a complete picture of your productivity.
        </p>
      </div>
      
      {/* Achievements preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <Award className="text-amber-500" size={20} />
          Badges & Achievements
        </h3>
        
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          <div className="aspect-square rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-100 dark:bg-amber-900/30 flex flex-col items-center justify-center p-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 streak-pulse">
              <Award size={24} className="text-amber-500" />
            </div>
            <p className="font-medium text-center text-slate-700 dark:text-slate-300 text-xs">
              Week Warrior
            </p>
          </div>
          
          <div className="aspect-square rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-100 dark:bg-blue-900/30 flex flex-col items-center justify-center p-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1">
              <Zap size={24} className="text-blue-500" />
            </div>
            <p className="font-medium text-center text-slate-700 dark:text-slate-300 text-xs">
              Habit Starter
            </p>
          </div>
          
          <div className="aspect-square rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center p-3 opacity-60 grayscale">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1">
              <Target size={24} className="text-slate-400 dark:text-slate-600" />
            </div>
            <p className="font-medium text-center text-slate-700 dark:text-slate-300 text-xs">
              Monthly Master
            </p>
          </div>
          
          <div className="aspect-square rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center p-3 opacity-60 grayscale">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1">
              <Medal size={24} className="text-slate-400 dark:text-slate-600" />
            </div>
            <p className="font-medium text-center text-slate-700 dark:text-slate-300 text-xs">
              Balanced Life
            </p>
          </div>
          
          <div className="aspect-square rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center p-3 opacity-60 grayscale">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1">
              <Trophy size={24} className="text-slate-400 dark:text-slate-600" />
            </div>
            <p className="font-medium text-center text-slate-700 dark:text-slate-300 text-xs">
              Century Club
            </p>
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <div className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm">
            Unlock more achievements as you build your habits!
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitsPlaceholder;