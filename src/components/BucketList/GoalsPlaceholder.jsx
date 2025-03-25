import React, { useState } from 'react';
import { Trophy, Target, Mountain, Star, Compass, ArrowRight, CheckCircle, Calendar, Flame, Clock, Wallet, PlusCircle, Heart, Brain, Dumbbell, User, Briefcase, Sparkles, Zap } from 'lucide-react';

const GoalsPlaceholder = () => {
  const [activeTab, setActiveTab] = useState('featured');
  
  // Placeholder goal categories
  const categories = [
    { id: 'experiences', name: 'Experiences', icon: <Mountain size={18} className="text-purple-500" /> },
    { id: 'personal', name: 'Personal Growth', icon: <Brain size={18} className="text-blue-500" /> },
    { id: 'fitness', name: 'Health & Fitness', icon: <Dumbbell size={18} className="text-green-500" /> },
    { id: 'career', name: 'Career', icon: <Briefcase size={18} className="text-amber-500" /> },
    { id: 'finance', name: 'Financial', icon: <Wallet size={18} className="text-emerald-500" /> },
    { id: 'creative', name: 'Creative', icon: <Sparkles size={18} className="text-rose-500" /> }
  ];
  
  // Placeholder featured goals
  const featuredGoals = [
    {
      id: 'travel1',
      title: 'Backpack through Southeast Asia',
      category: 'experiences',
      progress: 40,
      type: 'countries',
      target: 5,
      current: 2,
      timeline: 'Long-term',
      imgBg: 'bg-amber-50 dark:bg-amber-900/30'
    },
    {
      id: 'fitness1',
      title: 'Run a Marathon',
      category: 'fitness',
      progress: 65,
      type: 'training',
      target: 100,
      current: 65,
      timeline: 'Medium-term',
      imgBg: 'bg-green-50 dark:bg-green-900/30'
    },
    {
      id: 'finance1',
      title: 'Save for Dream Vacation',
      category: 'finance',
      progress: 75,
      type: 'savings',
      target: 5000,
      current: 3750,
      unit: '$',
      timeline: 'Medium-term',
      imgBg: 'bg-emerald-50 dark:bg-emerald-900/30'
    },
    {
      id: 'personal1',
      title: 'Learn Spanish Fluently',
      category: 'personal',
      progress: 25,
      type: 'milestone',
      milestones: [
        { name: 'Master basic vocabulary', completed: true },
        { name: 'Complete beginner course', completed: true },
        { name: 'Hold basic conversations', completed: false },
        { name: 'Complete intermediate course', completed: false },
        { name: 'Achieve B2 certification', completed: false }
      ],
      timeline: 'Long-term',
      imgBg: 'bg-blue-50 dark:bg-blue-900/30'
    }
  ];
  
  // Get category icon
  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : <Star size={18} />;
  };
  
  // Get progress format based on goal type
  const getProgressDisplay = (goal) => {
    switch(goal.type) {
      case 'milestone':
        const completed = goal.milestones.filter(m => m.completed).length;
        return `${completed}/${goal.milestones.length} milestones`;
      case 'countries':
      case 'training':
        return `${goal.current}/${goal.target} complete`;
      case 'savings':
        return `${goal.unit}${goal.current.toLocaleString()} / ${goal.unit}${goal.target.toLocaleString()}`;
      default:
        return `${goal.progress}% complete`;
    }
  };
  
  // Placeholder goal ideas
  const goalIdeas = [
    "Hike a famous trail",
    "Learn to play an instrument",
    "Write a book/novel",
    "Master a new language",
    "Travel to 10 countries",
    "Complete a triathlon",
    "Start your own business",
    "Create and launch a podcast",
    "Learn to dance professionally",
    "Achieve financial independence"
  ];

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 transition-colors">
          <Trophy className="text-amber-500 dark:text-amber-400" size={24} />
          Bucket List & Goals
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-amber-50 dark:bg-amber-900/30 p-8 rounded-xl mb-4 flex items-center justify-center flex-shrink-0">
            <Target className="text-amber-500 dark:text-amber-400" size={80} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors">
              Coming Soon
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 transition-colors">
              Set meaningful life goals and track your progress toward achieving them. Create your bucket list 
              and break down big dreams into achievable steps. Track different types of goals with flexible methods 
              that keep you motivated on your journey.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                  <Target size={18} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                    Life-changing goals
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Track progress on your biggest life ambitions and dreams
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                  <Flame size={18} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                    Milestone tracking
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Break down big goals into achievable milestones
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                  <Zap size={18} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                    Connect to habits
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Link daily habits to your long-term goals
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                    Timeline planning
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Set realistic timeframes and deadlines
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Preview Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'featured' 
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Featured Goals
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'categories' 
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('inspiration')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'inspiration' 
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Inspiration
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {activeTab === 'featured' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Top Goals</h3>
                <button className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <PlusCircle size={16} />
                  <span>Add Goal</span>
                </button>
              </div>
              
              {featuredGoals.map(goal => (
                <div 
                  key={goal.id}
                  className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-4 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className={`${goal.imgBg} w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      {getCategoryIcon(goal.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-medium text-slate-800 dark:text-slate-200">{goal.title}</h4>
                        <span className="text-xs bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full">
                          {goal.timeline}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        {getProgressDisplay(goal)}
                      </div>
                      
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 dark:bg-amber-400 rounded-full"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      
                      {goal.type === 'milestone' && (
                        <div className="mt-3 space-y-1">
                          {goal.milestones.slice(0, 3).map((milestone, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                milestone.completed 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                              }`}>
                                {milestone.completed ? <CheckCircle size={12} /> : null}
                              </div>
                              <span className={milestone.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}>
                                {milestone.name}
                              </span>
                            </div>
                          ))}
                          {goal.milestones.length > 3 && (
                            <div className="text-xs text-amber-500 dark:text-amber-400 ml-6">
                              +{goal.milestones.length - 3} more milestones
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 text-center">
                <button className="px-4 py-2 bg-amber-500 dark:bg-amber-600 text-white rounded-lg hover:bg-amber-600 dark:hover:bg-amber-700 transition-colors">
                  View All Goals
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'categories' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map(category => (
                <div 
                  key={category.id}
                  className="border border-slate-200 dark:border-slate-600 rounded-xl p-4 transition-all hover:shadow-md flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                    {React.cloneElement(category.icon, { size: 28 })}
                  </div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">{category.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Track your progress on {category.name.toLowerCase()} goals</p>
                </div>
              ))}
              
              <div className="border border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-4 transition-all hover:shadow-md flex flex-col items-center justify-center text-center h-full">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <PlusCircle size={28} className="text-slate-400 dark:text-slate-500" />
                </div>
                <h4 className="font-medium text-slate-600 dark:text-slate-400 mb-1">Custom Category</h4>
                <p className="text-xs text-slate-500 dark:text-slate-500">Create your own goal category</p>
              </div>
            </div>
          )}
          
          {activeTab === 'inspiration' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">Goal Ideas</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {goalIdeas.map((idea, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Star size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 dark:text-slate-300">{idea}</p>
                    </div>
                    <button className="text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300">
                      <PlusCircle size={18} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 border border-slate-200 dark:border-slate-600 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                  <Compass size={18} className="text-amber-500" />
                  Vision Board
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Visualize your dreams and aspirations with a digital vision board.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                    <Mountain size={24} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="aspect-square bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                    <Heart size={24} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="aspect-square bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                    <User size={24} className="text-slate-400 dark:text-slate-500" />
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <button className="text-sm text-amber-600 dark:text-amber-400">
                    Create your vision board
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Integration Preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <Zap className="text-amber-500 dark:text-amber-400" size={20} />
          Integrations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <Wallet size={20} className="text-emerald-500" />
              <h4 className="font-medium text-slate-700 dark:text-slate-300">Finance Goals</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Link your saving goals from Finance module to fund your bucket list dreams.
            </p>
            <div className="text-xs text-amber-600 dark:text-amber-400">Coming soon</div>
          </div>
          
          <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <Dumbbell size={20} className="text-blue-500" />
              <h4 className="font-medium text-slate-700 dark:text-slate-300">Habits Connection</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Link daily habits to your long-term goals and see how consistent actions lead to big results.
            </p>
            <div className="text-xs text-amber-600 dark:text-amber-400">Coming soon</div>
          </div>
          
          <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <Clock size={20} className="text-purple-500" />
              <h4 className="font-medium text-slate-700 dark:text-slate-300">Focus Sessions</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Use Focus sessions to dedicate time to working toward your most important goals.
            </p>
            <div className="text-xs text-amber-600 dark:text-amber-400">Coming soon</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsPlaceholder;