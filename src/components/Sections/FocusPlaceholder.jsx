import React from 'react';
import { Clock, Timer, CheckSquare, Focus, BarChart2, Zap, Target, Award, Bell, ListChecks, Hourglass, Calendar, LayoutDashboard, Play, Pause, RefreshCw, Maximize, RotateCw } from 'lucide-react';

const FocusPlaceholder = () => {
  // Features for focus section
  const features = [
    { icon: <Timer size={18} />, title: "Smart Timers", description: "Track productivity with countdown or stopwatch timers" },
    { icon: <Zap size={18} />, title: "Pomodoro Technique", description: "Built-in work-break cycles to maximize productivity" },
    { icon: <Target size={18} />, title: "Task Integration", description: "Link timers to your daily tasks for automated tracking" },
    { icon: <BarChart2 size={18} />, title: "Focus Analytics", description: "Visualize your productivity patterns and improvements" }
  ];

  // Mock data for productivity hours (24-hour format with productivity score 0-10)
  const productivityByHour = [
    { hour: 0, score: 0 }, { hour: 1, score: 0 }, { hour: 2, score: 0 }, { hour: 3, score: 0 },
    { hour: 4, score: 0 }, { hour: 5, score: 1 }, { hour: 6, score: 2 }, { hour: 7, score: 3 },
    { hour: 8, score: 5 }, { hour: 9, score: 8 }, { hour: 10, score: 9 }, { hour: 11, score: 7 },
    { hour: 12, score: 5 }, { hour: 13, score: 6 }, { hour: 14, score: 8 }, { hour: 15, score: 9 },
    { hour: 16, score: 7 }, { hour: 17, score: 5 }, { hour: 18, score: 4 }, { hour: 19, score: 3 },
    { hour: 20, score: 2 }, { hour: 21, score: 1 }, { hour: 22, score: 0 }, { hour: 23, score: 0 }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 transition-colors">
          <Focus className="text-blue-500 dark:text-blue-400" size={24} />
          Focus & Productivity
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-8 rounded-xl mb-4 flex items-center justify-center flex-shrink-0">
            <Clock className="text-blue-500 dark:text-blue-400" size={80} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors">
              Coming Soon
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 transition-colors">
              Enhance your productivity with our advanced focus timer system. Track your deep work sessions,
              integrate with your daily tasks, and discover your most productive hours with detailed analytics.
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
      
      {/* Interactive Timer Demo */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-6 transition-colors flex items-center gap-2">
          <Timer className="text-blue-500 dark:text-blue-400" size={20} />
          Focus Timer
        </h3>
        
        <div className="flex flex-col items-center">
          <div className="relative mb-8 w-64 h-64">
            {/* Timer Circle */}
            <div className="absolute inset-0 rounded-full border-8 border-slate-100 dark:border-slate-700 transition-colors"></div>
            <div className="absolute inset-0 rounded-full border-8 border-blue-500 dark:border-blue-400 transition-colors" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 65%, 0 65%)' }}></div>
            
            {/* Timer Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-slate-800 dark:text-slate-100 transition-colors">25:00</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors">Pomodoro</div>
              
              {/* Selected Task */}
              <div className="mt-4 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center gap-1 transition-colors">
                <CheckSquare size={14} className="text-blue-500 dark:text-blue-400" />
                <span className="text-xs text-blue-700 dark:text-blue-300">Complete project research</span>
              </div>
            </div>
            
            {/* Timer Controls */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
              <button className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <RefreshCw size={20} />
              </button>
              <button className="p-4 rounded-full bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors">
                <Play size={24} fill="currentColor" />
              </button>
              <button className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <Maximize size={20} />
              </button>
            </div>
          </div>
          
          {/* Timer Presets */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-8 w-full max-w-lg">
            <button className="px-3 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
              Pomodoro
            </button>
            <button className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
              Short Break
            </button>
            <button className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
              Long Break
            </button>
            <button className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors hidden sm:block">
              Custom
            </button>
            <button className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors hidden sm:block">
              Stopwatch
            </button>
          </div>
        </div>
      </div>
      
      {/* Task Integration */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <ListChecks className="text-teal-500 dark:text-teal-400" size={20} />
          Task Integration
        </h3>
        
        <div className="bg-teal-50 dark:bg-teal-900/30 rounded-lg p-4 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-slate-700 dark:text-slate-200">Select tasks to focus on:</h4>
            <button className="px-2 py-1 text-xs bg-teal-500 dark:bg-teal-600 text-white rounded-md">
              Select All
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-500 rounded border-slate-300 dark:border-slate-500" checked />
              <span className="ml-3 text-slate-700 dark:text-slate-200">Complete project research</span>
            </div>
            <div className="flex items-center p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-500 rounded border-slate-300 dark:border-slate-500" />
              <span className="ml-3 text-slate-700 dark:text-slate-200">Write documentation</span>
            </div>
            <div className="flex items-center p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-500 rounded border-slate-300 dark:border-slate-500" />
              <span className="ml-3 text-slate-700 dark:text-slate-200">Review code changes</span>
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <button className="flex items-center gap-1 text-sm text-teal-600 dark:text-teal-400">
              <span className="text-xs">+ Add new task</span>
            </button>
            <button className="px-3 py-1 bg-teal-500 dark:bg-teal-600 text-white rounded-md text-sm">
              Start Focusing
            </button>
          </div>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Link your focus sessions to specific tasks from your daily checklist. When your timer ends, 
          you'll be prompted to mark completed tasks, keeping your productivity tracking seamless.
        </p>
      </div>
      
      {/* Analytics Preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <BarChart2 className="text-purple-500 dark:text-purple-400" size={20} />
          Focus Analytics
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Timer size={18} className="text-purple-500" />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Today's Focus</div>
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">2h 45m</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">3 sessions completed</div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target size={18} className="text-blue-500" />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Week Total</div>
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">12h 30m</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">+15% from last week</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare size={18} className="text-green-500" />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Task Completion</div>
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">85%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">17 tasks completed</div>
          </div>
        </div>
        
        {/* Productivity by Hour Chart */}
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Your Most Productive Hours</h4>
          
          <div className="relative h-40">
            {/* Hour labels */}
            <div className="absolute inset-x-0 bottom-0 flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>12am</span>
              <span>6am</span>
              <span>12pm</span>
              <span>6pm</span>
              <span>12am</span>
            </div>
            
            {/* Productivity bars */}
            <div className="absolute inset-0 flex items-end pt-6 pb-4">
              {productivityByHour.map((hour, index) => (
                <div 
                  key={index} 
                  className="flex-1 mx-0.5"
                  style={{ height: '100%' }}
                >
                  <div 
                    className={`w-full ${hour.score > 7 ? 'bg-purple-500 dark:bg-purple-400' : hour.score > 4 ? 'bg-blue-500 dark:bg-blue-400' : 'bg-slate-300 dark:bg-slate-600'} rounded-t-sm transition-all`}
                    style={{ height: `${hour.score * 10}%` }}
                  ></div>
                </div>
              ))}
            </div>
            
            {/* Peak productivity indicator */}
            <div className="absolute top-1 left-1/3 right-1/3 text-center">
              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                Peak Productivity: 10am-3pm
              </span>
            </div>
          </div>
        </div>
        
        {/* Focus Streaks */}
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Focus Streaks</h4>
            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs">
              Current: 5 days
            </span>
          </div>
          
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((day) => (
              <div 
                key={day} 
                className={`h-8 flex-1 rounded-sm ${day <= 5 ? 'bg-amber-500 dark:bg-amber-400' : 'bg-slate-200 dark:bg-slate-600'}`}
              ></div>
            ))}
          </div>
          
          <div className="mt-2 text-xs text-center text-slate-500 dark:text-slate-400">
            Last 14 days - Longest streak: 8 days
          </div>
        </div>
      </div>
      
      {/* Full-Screen Mode Preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors overflow-hidden">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <Maximize className="text-blue-500 dark:text-blue-400" size={20} />
          Distraction-Free Mode
        </h3>
        
        <div className="relative bg-black rounded-lg h-64 overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="text-7xl font-bold font-mono">18:42</div>
            <div className="text-sm mt-2 opacity-80">Focus Session in Progress</div>
            
            <div className="flex items-center gap-3 mt-6">
              <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <Pause size={20} />
              </button>
              <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <RotateCw size={20} />
              </button>
              <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <Bell size={20} />
              </button>
            </div>
          </div>
          
          <div className="absolute bottom-4 right-4">
            <button className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm flex items-center gap-1 transition-colors">
              <Maximize size={14} />
              Exit Fullscreen
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 text-center">
          Enter distraction-free mode to eliminate interruptions and maximize your focus.
          Perfect for deep work sessions on desktop or mobile.
        </div>
      </div>
    </div>
  );
};

export default FocusPlaceholder;