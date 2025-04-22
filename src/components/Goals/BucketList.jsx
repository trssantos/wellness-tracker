import React, { useState, useEffect } from 'react';
import { Sparkles, Target, BarChart2, Image, List, Search, Filter, ChevronDown, Plus, ArrowRight, Calendar, Check, X, Mountain, Brain, Dumbbell, Briefcase, Wallet, Star, CheckCircle, Circle } from 'lucide-react';
import { getGoals, getCategories, getSummaryStats, getGoalsByCategory, getGoalsByStatus, deleteGoal, updateGoal } from '../../utils/bucketListUtils';

// Import all our components
import BucketListDashboard from './BucketListDashboard';
import GoalDetailView from './GoalDetailView';
import GoalEditorForm from './GoalEditorForm';
import GoalInspirationTab from './GoalInspirationTab';
import VisionBoardComponent from './VisionBoardComponent';


const BucketList = () => {
  // Main state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storageVersion, setStorageVersion] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  // Load goals data on component mount and when storageVersion changes
  useEffect(() => {
    refreshData();
  }, [storageVersion]);

  // Function to refresh data from storage
  const refreshData = () => {
    const loadedGoals = getGoals();
    const loadedCategories = getCategories();
    setGoals(loadedGoals);
    setCategories(loadedCategories);
  };

  // Handle selecting a goal to view/edit
  const handleSelectGoal = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    setSelectedGoal(goal);
    setIsDetailOpen(true);
  };

  // Handle closing goal detail view
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedGoal(null);
  };

  // Handle opening the editor form
  const handleOpenEditor = (goal = null) => {
    setSelectedGoal(goal); // Null for new goal
    setIsEditorOpen(true);
    
    if (isDetailOpen) {
      setIsDetailOpen(false);
    }
  };

  // Handle closing the editor form
  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    
    // If we were editing an existing goal, go back to detail view
    if (selectedGoal && !isDetailOpen) {
      setIsDetailOpen(true);
    } else {
      setSelectedGoal(null);
    }
  };

  // Handle saving a goal (new or edited)
  const handleSaveGoal = (goal) => {
    // Increment storage version to trigger a refresh
    setStorageVersion(prev => prev + 1);
    
    // If this was a new goal, show its details
    if (!selectedGoal) {
      setSelectedGoal(goal);
      setIsDetailOpen(true);
    }
  };

  // Handle goal updates from detail view
  const handleGoalUpdate = (updatedGoal) => {
    // Increment storage version to trigger a refresh
    setStorageVersion(prev => prev + 1);
    
    // If an updated goal was passed, update the selected goal state
    if (updatedGoal) {
      setSelectedGoal(updatedGoal);
    }
  };

  // Handle tab change
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  // Get category icon
  const getCategoryIcon = (categoryId) => {
    switch(categoryId) {
      case 'experiences': return <Mountain size={18} className="text-purple-500" />;
      case 'personal': return <Brain size={18} className="text-blue-500" />;
      case 'fitness': return <Dumbbell size={18} className="text-green-500" />;
      case 'career': return <Briefcase size={18} className="text-amber-500" />;
      case 'finance': return <Wallet size={18} className="text-emerald-500" />;
      case 'creative': return <Sparkles size={18} className="text-rose-500" />;
      default: return <Star size={18} className="text-slate-500" />;
    }
  };

  // Calculate progress percentage
  const calculateProgress = (goal) => {
    if (goal.completed) return 100;
    
    if (goal.progressType === 'percentage') {
      return goal.progress || 0;
    } else if (goal.progressType === 'counter' && goal.targetValue > 0) {
      return Math.round((goal.currentValue / goal.targetValue) * 100);
    } else if (goal.progressType === 'milestone' && goal.milestones?.length > 0) {
      const completedCount = goal.milestones.filter(m => m.completed).length;
      return Math.round((completedCount / goal.milestones.length) * 100);
    }
    
    return 0;
  };

  // Format remaining time display
  const formatRemainingTime = (dateString) => {
    if (!dateString) return null;
    
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days left`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks left`;
    return `${Math.floor(diffDays / 30)} months left`;
  };

  // Filter and sort goals for the All Goals page
  const getFilteredGoals = () => {
    let filtered = [...goals];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = getGoalsByStatus(statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(goal => goal.category === categoryFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(goal => 
        goal.title.toLowerCase().includes(term) || 
        (goal.description && goal.description.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        filtered.sort((a, b) => priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium']);
        break;
      case 'progress':
        filtered.sort((a, b) => calculateProgress(b) - calculateProgress(a));
        break;
      case 'date':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    
    return filtered;
  };

  // Handle goal completion from the All Goals view
  const handleToggleComplete = (goalId, isCompleted) => {
    const updates = {
      completed: isCompleted,
      modifiedAt: new Date().toISOString()
    };
    
    // If completing, update progress-related fields
    if (isCompleted) {
      const goal = goals.find(g => g.id === goalId);
      if (goal.progressType === 'percentage') {
        updates.progress = 100;
      } else if (goal.progressType === 'counter') {
        updates.currentValue = goal.targetValue;
      } else if (goal.progressType === 'milestone') {
        updates.milestones = goal.milestones.map(m => ({ ...m, completed: true }));
      }
    }
    
    updateGoal(goalId, updates);
    setStorageVersion(prev => prev + 1);
  };

  // Handle goal deletion
  const handleDeleteGoal = (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(goalId);
      setStorageVersion(prev => prev + 1);
    }
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <BucketListDashboard 
            onSelectGoal={handleSelectGoal}
            onCreateGoal={() => handleOpenEditor()}
            onChangeTab={handleTabChange}
          />
        );
      case 'goals':
        return (
          <div className="space-y-4">
            {/* Filters and search - With improved mobile layout */}
<div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-xl shadow-sm flex flex-col gap-3">
  {/* Search - Full width on mobile */}
  <div className="relative w-full">
    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
    <input
      type="text"
      placeholder="Search goals..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
    />
  </div>
  
  {/* Filters stacked on mobile for better space usage */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
    <div className="relative">
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full appearance-none pl-8 pr-8 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>
      <Filter className="absolute left-2 top-2.5 text-slate-400" size={16} />
      <ChevronDown className="absolute right-2 top-2.5 text-slate-400" size={16} />
    </div>
    
    <div className="relative">
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="w-full appearance-none pl-8 pr-8 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
      >
        <option value="all">All Categories</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>
      <Filter className="absolute left-2 top-2.5 text-slate-400" size={16} />
      <ChevronDown className="absolute right-2 top-2.5 text-slate-400" size={16} />
    </div>
  </div>
  
  {/* Sort and Create - grouped at bottom on mobile */}
  <div className="flex flex-wrap gap-2">
    <div className="relative flex-1 min-w-[140px]">
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="w-full appearance-none pl-8 pr-8 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
      >
        <option value="date">Date Created</option>
        <option value="title">Title</option>
        <option value="priority">Priority</option>
        <option value="progress">Progress</option>
      </select>
      <Filter className="absolute left-2 top-2.5 text-slate-400" size={16} />
      <ChevronDown className="absolute right-2 top-2.5 text-slate-400" size={16} />
    </div>
    <button
      onClick={() => handleOpenEditor()}
      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg shadow-sm flex items-center gap-1.5"
    >
      <Plus size={16} />
      <span className="text-sm font-medium">New</span>
    </button>
  </div>
</div>

            
            {/* Goals list */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
              {getFilteredGoals().length === 0 ? (
                <div className="p-8 text-center">
                  <div className="bg-slate-100 dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target size={24} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                    No goals found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    {searchTerm 
                      ? "No goals match your search criteria." 
                      : "You haven't created any goals yet."}
                  </p>
                  <button
                    onClick={() => handleOpenEditor()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg shadow-sm inline-flex items-center gap-2"
                  >
                    <Plus size={18} />
                    <span>Create Your First Goal</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {getFilteredGoals().map(goal => (
  <div 
    key={goal.id}
    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
  >
    <div className="flex items-start gap-3">
      <button
        onClick={() => handleToggleComplete(goal.id, !goal.completed)}
        className={`flex-shrink-0 w-6 h-6 mt-1 rounded-full ${
          goal.completed 
            ? 'bg-green-500 text-white' 
            : 'border-2 border-slate-300 dark:border-slate-500'
        } flex items-center justify-center transition-colors`}
      >
        {goal.completed && <Check size={14} />}
      </button>
      
      <div 
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => handleSelectGoal(goal.id)}
      >
        <div className="flex flex-wrap items-center gap-2">
          {goal.category && (
            <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-700 p-1 rounded">
              {getCategoryIcon(goal.category)}
            </div>
          )}
          <h3 className={`font-medium break-words ${
            goal.completed 
              ? 'text-slate-500 dark:text-slate-400 line-through' 
              : 'text-slate-800 dark:text-slate-200'
          }`}>
            {goal.title}
          </h3>
          
          {goal.priority === 'high' && (
            <span className="inline-flex flex-shrink-0 items-center text-xs py-0.5 px-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
              High
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <div className="w-24 sm:w-32 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 dark:bg-amber-600 transition-all"
              style={{ width: `${calculateProgress(goal)}%` }}
            ></div>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {calculateProgress(goal)}%
          </span>
          
          {goal.targetDate && (
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar size={12} className="flex-shrink-0" />
              <span className="truncate">{formatRemainingTime(goal.targetDate)}</span>
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-shrink-0 flex gap-1">
        <button
          onClick={() => handleOpenEditor(goal)}
          className="p-1.5 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"
        >
          <Sparkles size={16} />
        </button>
        <button
          onClick={() => handleDeleteGoal(goal.id)}
          className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  </div>
))}
                </div>
              )}
            </div>
          </div>
        );
      case 'inspiration':
        return (
          <GoalInspirationTab 
            onGoalAdded={(goal) => {
              setStorageVersion(prev => prev + 1);
              if (goal) {
                // Automatically show details of the newly added goal
                setSelectedGoal(goal);
                setIsDetailOpen(true);
              }
            }}
          />
        );
      case 'vision':
        return <VisionBoardComponent />;
      default:
        return <BucketListDashboard 
          onSelectGoal={handleSelectGoal}
          onCreateGoal={() => handleOpenEditor()}
          onChangeTab={handleTabChange}
        />;
    }
  };

  return (
    
    <div className="relative">
    {/* Header with navigation tabs - always visible */}
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Target className="text-amber-500 flex-shrink-0" />
            <span className="truncate">My Bucket List</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-1">
            Track your life goals and dreams
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleOpenEditor()}
            className="px-3 md:px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg shadow-sm flex items-center gap-2 transition-all"
          >
            <Plus size={18} />
            <span className="font-medium">New Goal</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Dropdown Navigation - visible only on small screens */}
      <div className="sm:hidden bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm mt-3">
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => handleTabChange(e.target.value)}
            className="w-full appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg py-2 pl-3 pr-10 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="dashboard">Dashboard</option>
            <option value="goals">All Goals</option>
            <option value="inspiration">Inspiration</option>
            <option value="vision">Vision Board</option>
          </select>
          <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
        </div>
      </div>
      
      {/* Desktop Navigation - hidden on mobile, visible on sm screens and up */}
      <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden mt-3">
        <nav className="flex">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'dashboard' 
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleTabChange('goals')}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'goals' 
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All Goals
          </button>
          <button
            onClick={() => handleTabChange('inspiration')}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'inspiration' 
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Inspiration
          </button>
          <button
            onClick={() => handleTabChange('vision')}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'vision' 
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Vision Board
          </button>
        </nav>
      </div>
    </div>
    
    {/* Main Content */}
    <div className="space-y-6">
      {renderTabContent()}
    </div>
    
    {/* Goal Detail Modal */}
    {isDetailOpen && selectedGoal && (
      <GoalDetailView 
        goal={selectedGoal}
        onClose={handleCloseDetail}
        onUpdate={handleGoalUpdate}
        onOpenEditForm={() => handleOpenEditor(selectedGoal)}
      />
    )}
    
    {/* Goal Editor Modal */}
    {isEditorOpen && (
      <GoalEditorForm 
        goal={selectedGoal}
        onClose={handleCloseEditor}
        onSave={handleSaveGoal}
      />
    )}
  </div>
);
};

export default BucketList;