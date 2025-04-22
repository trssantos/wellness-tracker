import React, { useState, useEffect } from 'react';
import { 
    Eye, X, Target, Edit, Percent, Hash, ListChecks, Sparkles, Filter, ArrowRight, Search, Plus, 
  MessageCircle, CheckCircle, Check, Loader, Star,
  Mountain, Brain, Dumbbell, Briefcase, Wallet, ThumbsUp,
  AlertCircle, PencilLine, Lightbulb, BookOpen, ChevronDown
} from 'lucide-react';
import { getCategories, createGoal } from '../../utils/bucketListUtils';
import { generateGoalSuggestion } from '../../utils/aiGoalService';

const GoalInspirationTab = ({ onGoalAdded, onEditGoal }) => {
  const [activeSection, setActiveSection] = useState('popular');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [addedGoals, setAddedGoals] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [previewSuggestion, setPreviewSuggestion] = useState(null);
  
  // Popular tags for quick filtering
  const popularTags = [
    "Travel", "Fitness", "Learning", "Career", "Finance", 
    "Health", "Personal", "Adventure", "Creative", "Family"
  ];
  
  // Popular goal ideas (mix of categories)
  const popularGoals = [
    { title: "Travel to 10 different countries", category: "experiences", tags: ["Travel", "Adventure"] },
    { title: "Complete a marathon", category: "fitness", tags: ["Fitness", "Health"] },
    { title: "Learn a new language", category: "personal", tags: ["Learning", "Personal"] },
    { title: "Start a side business", category: "career", tags: ["Career", "Finance"] },
    { title: "Save $10,000 emergency fund", category: "finance", tags: ["Finance"] },
    { title: "Write and publish a book", category: "creative", tags: ["Creative"] },
    { title: "Learn to play a musical instrument", category: "personal", tags: ["Creative", "Learning"] },
    { title: "Climb a major mountain", category: "experiences", tags: ["Adventure", "Fitness"] },
    { title: "Visit all 7 continents", category: "experiences", tags: ["Travel", "Adventure"] },
    { title: "Build a passive income stream", category: "finance", tags: ["Finance", "Career"] },
    { title: "Complete a triathlon", category: "fitness", tags: ["Fitness", "Health"] },
    { title: "Learn to cook cuisines from 5 different countries", category: "personal", tags: ["Learning", "Creative"] }
  ];
  
  // Pre-defined goal suggestions by category
  const categoryGoals = {
    experiences: [
      "Visit the Seven Wonders of the World",
      "Go on a hot air balloon ride",
      "Attend a major cultural festival overseas",
      "Live in a foreign country for at least 3 months",
      "Go on a wildlife safari in Africa",
      "Take a road trip across a continent",
      "Dive the Great Barrier Reef",
      "See the Northern Lights"
    ],
    personal: [
      "Meditate daily for a year",
      "Learn a new language to conversational level",
      "Read 50 classic books",
      "Take a course outside your field of expertise",
      "Mentor someone in your area of expertise",
      "Keep a journal for 365 consecutive days",
      "Learn public speaking",
      "Master a creative hobby like painting or photography"
    ],
    fitness: [
      "Run a marathon",
      "Achieve a specific strength goal (e.g. 100 push-ups)",
      "Learn a martial art",
      "Complete a challenging hike",
      "Learn to swim proficiently",
      "Master a yoga pose that seems impossible now",
      "Try 12 different fitness classes",
      "Train for and complete an obstacle course race"
    ],
    career: [
      "Get a promotion or raise",
      "Switch to a career you're passionate about",
      "Start your own business",
      "Earn a professional certification",
      "Speak at an industry conference",
      "Publish an article in your field",
      "Build a professional network of 100+ connections",
      "Lead a major project from start to finish"
    ],
    finance: [
      "Become debt free",
      "Save six months of expenses in an emergency fund",
      "Buy a home",
      "Max out retirement contributions for a year",
      "Create a passive income stream",
      "Save for a dream vacation",
      "Invest in the stock market",
      "Establish a college fund for your children"
    ],
    creative: [
      "Write a book",
      "Learn to play a musical instrument",
      "Create and sell a piece of art",
      "Direct a short film",
      "Build something with your hands",
      "Design and create a website",
      "Perform at an open mic night",
      "Create a podcast series"
    ]
  };
  
  // AI-generated topic starters
  const topicStarters = [
    "Travel dreams I've always had",
    "Skills I've always wanted to learn",
    "Physical achievements I want to accomplish",
    "Ways I want to give back to my community",
    "Creative projects I've been thinking about",
    "Professional goals to advance my career",
    "Financial milestones to build security",
    "Experiences that would push me out of my comfort zone"
  ];
  
  // Load categories on component mount
  useEffect(() => {
    const loadedCategories = getCategories();
    setCategories(loadedCategories);
  }, []);
  
  // Hide feedback toast after 3 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Handle opening the preview
  const handlePreviewSuggestion = (suggestion) => {
    setPreviewSuggestion(suggestion);
  };
  
  // Handle editing the suggestion
  const handleEditSuggestion = (suggestion) => {
    setPreviewSuggestion(null);
    
    // Check if onEditGoal is provided
    if (onEditGoal) {
      onEditGoal({
        title: suggestion.title,
        description: suggestion.description || '',
        category: suggestion.category || '',
        progressType: suggestion.progressType || 'simple',
        progress: suggestion.initialProgress || 0,
        currentValue: suggestion.currentValue || 0,
        targetValue: suggestion.targetValue || 100,
        milestones: suggestion.milestones || []
      });
    } else {
      // Fallback if onEditGoal is not provided - just add the goal directly
      handleAddGoal(
        suggestion.title, 
        suggestion.category, 
        {
          progressType: suggestion.progressType,
          description: suggestion.description,
          progress: suggestion.initialProgress,
          currentValue: suggestion.currentValue,
          targetValue: suggestion.targetValue,
          milestones: suggestion.milestones
        }
      );
      
      // Show feedback
      setFeedback({
        type: 'success',
        message: `"${suggestion.title}" added to your goals!`,
        action: 'Go to Goals tab to view'
      });
    }
  };
  
  // Get the progress display text based on goal type
  const getProgressTypeDisplay = (suggestion) => {
    switch(suggestion.progressType) {
      case 'percentage':
        return `Progress tracking with initial ${suggestion.initialProgress || 0}%`;
      case 'counter':
        return `Count from ${suggestion.currentValue || 0} to ${suggestion.targetValue || 100}`;
      case 'milestone':
        return `${suggestion.milestones?.length || 0} steps to completion`;
      default:
        return 'Simple completion tracking';
    }
  };
  
  
  // Toggle tag selection
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Filter goals by selected tags
  const filterGoalsByTags = (goals) => {
    if (selectedTags.length === 0) return goals;
    
    return goals.filter(goal => {
      const goalTags = goal.tags || [];
      return selectedTags.some(tag => goalTags.includes(tag));
    });
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
  
  // Handle generating AI suggestions
  const handleGenerateAiSuggestions = async () => {
    if (!searchTerm.trim() && !selectedCategory) {
      setError('Please enter a keyword or select a category for more targeted suggestions');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    
    try {
      const categoryName = selectedCategory 
        ? categories.find(c => c.id === selectedCategory)?.name || '' 
        : '';
      
      const suggestions = await generateGoalSuggestion(searchTerm, categoryName);
      setAiSuggestions(suggestions);
      
      // Auto-switch to the AI suggestions section
      setActiveSection('ai');
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError('Failed to generate suggestions. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Add a goal to the user's list
  const handleAddGoal = (goalTitle, category = '', goalData = {}) => {
    try {
      // Create a base goal object
      const baseGoal = {
        title: goalTitle,
        category: category,
        progressType: 'simple'
      };
      
      // Merge with additional goal data if available
      const goalToCreate = {
        ...baseGoal,
        ...goalData
      };
      
      // Process specific goal types
      if (goalData.progressType === 'percentage' && goalData.initialProgress !== undefined) {
        goalToCreate.progress = goalData.initialProgress;
      }
      
      if (goalData.progressType === 'counter') {
        if (goalData.currentValue !== undefined) goalToCreate.currentValue = goalData.currentValue;
        if (goalData.targetValue !== undefined) goalToCreate.targetValue = goalData.targetValue;
      }
      
      if (goalData.progressType === 'milestone' && goalData.milestones) {
        goalToCreate.milestones = goalData.milestones;
      }
      
      if (goalData.description) {
        goalToCreate.description = goalData.description;
      }
      
      const newGoal = createGoal(goalToCreate);
      
      setAddedGoals(prev => ({
        ...prev,
        [goalTitle]: true
      }));
      
      setFeedback({
        type: 'success',
        message: `"${goalTitle}" added to your goals!`,
        action: 'Go to Goals tab to view'
      });
      
      if (onGoalAdded) {
        onGoalAdded(newGoal);
      }
  
      return newGoal;
    } catch (err) {
      console.error('Error adding goal:', err);
      setFeedback({
        type: 'error',
        message: 'Failed to add goal. Please try again.'
      });
      return null;
    }
  };
  
  // Filtered goals based on tags
  const filteredPopularGoals = filterGoalsByTags(popularGoals);
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
        <Sparkles className="text-amber-500 flex-shrink-0" />
        <span>Goal Inspiration</span>
      </h2>
      
      {/* Feedback toast */}
      {feedback && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all animate-fadeIn ${
          feedback.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/80 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/80 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start gap-2">
            {feedback.type === 'success' ? (
              <Check className="text-green-500 dark:text-green-300 flex-shrink-0" size={20} />
            ) : (
              <AlertCircle className="text-red-500 dark:text-red-300 flex-shrink-0" size={20} />
            )}
            <div>
              <p className={feedback.type === 'success' 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
              }>
                {feedback.message}
              </p>
              {feedback.action && (
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">{feedback.action}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* AI Search Section */}
      <div className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">
            <Sparkles size={20} className="text-amber-500" />
          </div>
          <h3 className="font-medium text-slate-800 dark:text-slate-200">AI Goal Generator</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              What kind of goals are you interested in?
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Enter keywords like 'travel', 'learning', etc."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-48 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Topic starters - Mobile-friendly vertical list */}
          <div className="p-3 bg-white/70 dark:bg-slate-800/50 rounded-lg">
            <div className="mb-2 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Lightbulb size={14} className="text-amber-500" />
              <span>Try one of these prompts:</span>
            </div>
            
            <div className="space-y-2">
              {topicStarters.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => setSearchTerm(starter)}
                  className="w-full text-left p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40 text-sm transition-colors"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleGenerateAiSuggestions}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 shadow-sm ${
                isGenerating 
                  ? 'bg-slate-400 dark:bg-slate-600' 
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Ideas</span>
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
      
      {/* Tabs - Mobile-Friendly Version */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Mobile Dropdown - visible only on small screens */}
        <div className="md:hidden p-3 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg py-2 pl-3 pr-10 text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              <option value="popular">Popular Goals</option>
              <option value="browse">Browse by Category</option>
              <option value="ai">AI Suggestions</option>
              <option value="guide">Goal-Setting Guide</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
        
        {/* Desktop Tabs - hidden on mobile, visible on md screens and up */}
        <div className="hidden md:block border-b border-slate-200 dark:border-slate-700">
          <div className="flex">
            <button
              onClick={() => setActiveSection('popular')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                activeSection === 'popular' 
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400 -mb-px' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Popular Goals
            </button>
            <button
              onClick={() => setActiveSection('browse')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                activeSection === 'browse' 
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400 -mb-px' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Browse by Category
            </button>
            <button
              onClick={() => setActiveSection('ai')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                activeSection === 'ai' 
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400 -mb-px' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              AI Suggestions
            </button>
            <button
              onClick={() => setActiveSection('guide')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                activeSection === 'guide' 
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400 -mb-px' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Goal-Setting Guide
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          {/* Quick filter tags */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Filter size={16} className="text-slate-500 flex-shrink-0" />
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Quick Filters</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          {/* Content based on active section */}
          {activeSection === 'popular' && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <ThumbsUp size={18} className="text-blue-500 flex-shrink-0" />
                <span>Popular Goal Ideas</span>
              </h3>
              
              {filteredPopularGoals.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center italic py-6">
                  No goals match your selected filters. Try selecting different tags.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredPopularGoals.map((goal, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                        {getCategoryIcon(goal.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">{goal.title}</p>
                        {goal.tags && goal.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {goal.tags.map(tag => (
                              <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full truncate max-w-[80px]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {addedGoals[goal.title] ? (
                        <div className="text-green-500 dark:text-green-400 flex-shrink-0">
                          <CheckCircle size={18} />
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleAddGoal(goal.title, goal.category)}
                          className="text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 flex-shrink-0"
                        >
                          <Plus size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeSection === 'browse' && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-4">
                Browse Goals by Category
              </h3>
              
              <div className="space-y-6">
                {Object.keys(categoryGoals).map(categoryId => {
                  // Skip categories that don't exist
                  const categoryExists = categories.some(c => c.id === categoryId);
                  if (!categoryExists) return null;
                  
                  const categoryName = categories.find(c => c.id === categoryId)?.name || categoryId;
                  
                  return (
                    <div key={categoryId} className="bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 overflow-hidden">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-600 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center">
                          {getCategoryIcon(categoryId)}
                        </div>
                        <h4 className="font-medium text-slate-800 dark:text-slate-200">{categoryName}</h4>
                      </div>
                      
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categoryGoals[categoryId].map((goal, index) => (
                          <div 
                            key={`${categoryId}-${index}`}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600"
                          >
                            <p className="text-sm text-slate-700 dark:text-slate-300 mr-2 truncate">{goal}</p>
                            {addedGoals[goal] ? (
                              <div className="text-green-500 dark:text-green-400 flex-shrink-0">
                                <CheckCircle size={18} />
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleAddGoal(goal, categoryId)}
                                className="p-1 text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 bg-white dark:bg-slate-700 rounded-md flex-shrink-0"
                              >
                                <Plus size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {activeSection === 'ai' && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <MessageCircle size={18} className="text-purple-500 flex-shrink-0" />
                <span>AI-Generated Suggestions</span>
              </h3>
              
              {aiSuggestions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-700 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
                  <Sparkles size={32} className="text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Use the AI Goal Generator above to create personalized goal suggestions based on your interests.
                  </p>
                  <button
                    onClick={handleGenerateAiSuggestions}
                    disabled={isGenerating || (!searchTerm.trim() && !selectedCategory)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg inline-flex items-center gap-1 shadow-sm"
                  >
                    <Sparkles size={16} />
                    <span>Generate Suggestions</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiSuggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow relative group"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                          {suggestion.category ? 
                            getCategoryIcon(suggestion.category) : 
                            <Sparkles size={18} className="text-white" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">{suggestion.title}</p>
                          {suggestion.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {suggestion.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-1">
                            {suggestion.category && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-600 px-1.5 py-0.5 rounded-full truncate max-w-[100px]">
                                {categories.find(c => c.id === suggestion.category)?.name || suggestion.category}
                              </span>
                            )}
                            {suggestion.progressType && suggestion.progressType !== 'simple' && (
                              <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full flex items-center gap-1 truncate">
                                {suggestion.progressType === 'percentage' && <Percent size={10} className="flex-shrink-0" />}
                                {suggestion.progressType === 'counter' && <Hash size={10} className="flex-shrink-0" />}
                                {suggestion.progressType === 'milestone' && <ListChecks size={10} className="flex-shrink-0" />}
                                <span className="truncate">{suggestion.progressType.charAt(0).toUpperCase() + suggestion.progressType.slice(1)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex gap-1">
                          {/* Preview button */}
                          <button 
                            onClick={() => handlePreviewSuggestion(suggestion)}
                            className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/50 flex-shrink-0"
                            title="Preview Goal"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {/* Add button */}
                          <button 
                            onClick={() => handleAddGoal(
                              suggestion.title, 
                              suggestion.category, 
                              {
                                progressType: suggestion.progressType,
                                description: suggestion.description,
                                progress: suggestion.initialProgress,
                                currentValue: suggestion.currentValue,
                                targetValue: suggestion.targetValue,
                                milestones: suggestion.milestones
                              }
                            )}
                            className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50 flex-shrink-0"
                            title="Add Goal"
                          >
                            <Plus size={16} />
                          </button>
                          
                          {/* Edit button */}
                          <button 
                            onClick={() => handleEditSuggestion(suggestion)}
                            className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800/50 flex-shrink-0"
                            title="Edit Before Adding"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                        
                        {/* Added indicator */}
                        {addedGoals[suggestion.title] && (
                          <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-green-100 dark:bg-green-900/50 p-1 rounded-full border border-green-200 dark:border-green-800">
                            <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleGenerateAiSuggestions}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg flex items-center gap-2 shadow-sm"
                    >
                      {isGenerating ? <Loader size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      <span>Generate More Ideas</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeSection === 'guide' && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-blue-500 flex-shrink-0" />
                <span>Goal-Setting Guide</span>
              </h3>
              
              <div className="bg-white dark:bg-slate-700 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <h4 className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</div>
                    <span>Make your goals SMART</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm pl-8">
                    Effective goals are Specific, Measurable, Achievable, Relevant, and Time-bound. Instead of "travel more," try "visit 3 countries in Europe by the end of next year."
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</div>
                    <span>Break down big goals into milestones</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm pl-8">
                    Large goals can be overwhelming. Break them into smaller, achievable milestones that you can celebrate along the way.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</div>
                    <span>Connect goals to your values</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm pl-8">
                    Goals that align with your core values are more motivating and meaningful. Ask yourself why each goal matters to you personally.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">4</div>
                    <span>Balance different life areas</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm pl-8">
                    Create goals across various categories: career, health, relationships, personal growth, experiences, and finance for a well-rounded life.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">5</div>
                    <span>Review and adjust regularly</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm pl-8">
                    Life changes, and so should your goals. Schedule regular reviews to track progress, celebrate wins, and adjust as needed.
                  </p>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center gap-2">
                    <PencilLine size={18} />
                    <span>Create Your First Goal</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Additional action button */}
          {activeSection !== 'guide' && (
            <div className="mt-6 text-center">
              <button className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1 mx-auto hover:underline">
                <span>Explore more ideas</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {previewSuggestion && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="p-3 sm:p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/20">
                  <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Sparkles className="text-amber-500 flex-shrink-0" size={20} />
                    <span className="truncate">Goal Preview</span>
                  </h3>
                  <button 
                    onClick={() => setPreviewSuggestion(null)}
                    className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-64px)]">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 break-words">
                      {previewSuggestion.title}
                    </h2>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {previewSuggestion.category && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center gap-1">
                          {getCategoryIcon(previewSuggestion.category)}
                          <span className="truncate">{categories.find(c => c.id === previewSuggestion.category)?.name || previewSuggestion.category}</span>
                        </span>
                      )}
                      
                      {previewSuggestion.progressType && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-1">
                          {previewSuggestion.progressType === 'percentage' && <Percent size={14} />}
                          {previewSuggestion.progressType === 'counter' && <Hash size={14} />}
                          {previewSuggestion.progressType === 'milestone' && <ListChecks size={14} />}
                          {previewSuggestion.progressType === 'simple' && <Target size={14} />}
                          <span>{previewSuggestion.progressType.charAt(0).toUpperCase() + previewSuggestion.progressType.slice(1)}</span>
                        </span>
                      )}
                    </div>
                    
                    {previewSuggestion.description && (
                      <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-4">
                        <p className="text-slate-700 dark:text-slate-300 break-words">
                          {previewSuggestion.description}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Progress Tracking Method
                      </h4>
                      <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700">
                        <p className="text-slate-600 dark:text-slate-400">
                          {getProgressTypeDisplay(previewSuggestion)}
                        </p>
                      </div>
                    </div>
                    
                    {previewSuggestion.progressType === 'milestone' && previewSuggestion.milestones && previewSuggestion.milestones.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Milestones
                        </h4>
                        <div className="space-y-2">
                          {previewSuggestion.milestones.map((milestone, idx) => (
                            <div 
                              key={idx} 
                              className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 flex items-center gap-2"
                            >
                              <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 flex-shrink-0"></div>
                              <span className="text-slate-700 dark:text-slate-300 break-words">
                                {milestone.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                    <button
                      onClick={() => setPreviewSuggestion(null)}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleAddGoal(
                          previewSuggestion.title, 
                          previewSuggestion.category, 
                          {
                            progressType: previewSuggestion.progressType,
                            description: previewSuggestion.description,
                            progress: previewSuggestion.initialProgress,
                            currentValue: previewSuggestion.currentValue,
                            targetValue: previewSuggestion.targetValue,
                            milestones: previewSuggestion.milestones
                          }
                        );
                        setPreviewSuggestion(null);
                      }}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg shadow-sm flex items-center gap-2 justify-center"
                    >
                      <Check size={18} />
                      <span>Add Goal</span>
                    </button>
                    <button
                      onClick={() => handleEditSuggestion(previewSuggestion)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg shadow-sm flex items-center gap-2 justify-center"
                    >
                      <Edit size={18} />
                      <span>Edit Before Adding</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalInspirationTab;