import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Plus, PlusCircle, Star, Loader, ThumbsUp, Mountain, Brain, Dumbbell, Briefcase, Wallet, MessageCircle, Check, AlertCircle, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { getCategories, createGoal } from '../../utils/bucketListUtils';
import { generateGoalSuggestion } from '../../utils/aiGoalService';

const GoalInspirationTab = ({ onAddGoal }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [addedGoals, setAddedGoals] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [activeSection, setActiveSection] = useState('popular');
  const [expandedCategoryIds, setExpandedCategoryIds] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  
  // Popular tags for quick filtering
  const popularTags = [
    "Travel", "Fitness", "Learning", "Career", "Finance", 
    "Health", "Personal", "Adventure", "Creative", "Family"
  ];
  
  // Load categories on component mount
  useEffect(() => {
    const loadedCategories = getCategories();
    setCategories(loadedCategories);
  }, []);
  
  // Hide feedback after 3 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [feedback]);
  
  // Pre-defined goal suggestions by category
  const predefinedGoals = {
    experiences: [
      "Visit all 7 continents",
      "Road trip across the country",
      "See the Northern Lights",
      "Attend a major music festival",
      "Go skydiving",
      "Learn to scuba dive",
      "Ride in a hot air balloon"
    ],
    personal: [
      "Learn a new language",
      "Read 50 books in a year",
      "Learn to play a musical instrument",
      "Complete a meditation retreat",
      "Take a public speaking course",
      "Keep a daily journal for a year"
    ],
    fitness: [
      "Run a marathon",
      "Complete a triathlon",
      "Do 100 consecutive push-ups",
      "Master a yoga pose",
      "Hike a famous trail",
      "Reach a specific fitness benchmark"
    ],
    career: [
      "Get a promotion or raise",
      "Start a side business",
      "Learn a valuable new skill",
      "Mentor someone in your field",
      "Publish an article in your industry",
      "Speak at a conference"
    ],
    finance: [
      "Save for a down payment on a house",
      "Pay off all debt",
      "Build an emergency fund",
      "Save for early retirement",
      "Start investing consistently",
      "Create a passive income stream"
    ],
    creative: [
      "Write a book or screenplay",
      "Learn to paint or draw",
      "Create a photography portfolio",
      "Start a blog or vlog",
      "Design and create a handmade item",
      "Compose a song or piece of music"
    ]
  };
  
  // Popular goal ideas (mix of categories)
  const popularGoals = [
    { title: "Travel to 10 different countries", category: "experiences", tags: ["Travel", "Adventure"] },
    { title: "Complete a marathon", category: "fitness", tags: ["Fitness", "Health"] },
    { title: "Learn a new language", category: "personal", tags: ["Learning", "Personal"] },
    { title: "Start a side business", category: "career", tags: ["Career", "Finance"] },
    { title: "Save $10,000 emergency fund", category: "finance", tags: ["Finance"] },
    { title: "Write and publish a book", category: "creative", tags: ["Creative"] },
    { title: "Learn to play a musical instrument", category: "personal", tags: ["Creative", "Learning"] },
    { title: "Climb a major mountain", category: "experiences", tags: ["Adventure", "Fitness"] }
  ];
  
  // Function to toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    if (expandedCategoryIds.includes(categoryId)) {
      setExpandedCategoryIds(expandedCategoryIds.filter(id => id !== categoryId));
    } else {
      setExpandedCategoryIds([...expandedCategoryIds, categoryId]);
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
  
  // Handle generating AI suggestions
  const handleGenerateAiSuggestions = async () => {
    if (!searchQuery.trim() && !selectedCategory) {
      setError('Please enter a search term or select a category for more targeted suggestions');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    
    try {
      const categoryName = selectedCategory ? 
        categories.find(c => c.id === selectedCategory)?.name || selectedCategory : 
        '';
      
      const suggestions = await generateGoalSuggestion(searchQuery, categoryName);
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
  const handleAddGoal = (goalTitle, category = '') => {
    try {
      const newGoal = createGoal({
        title: goalTitle,
        category: category,
        progressType: 'simple'
      });
      
      setAddedGoals(prev => ({
        ...prev,
        [goalTitle]: true
      }));
      
      setFeedback({
        type: 'success',
        message: `"${goalTitle}" added to your goals!`,
        action: 'Go to Goals tab to view'
      });
      
      onAddGoal(newGoal);
    } catch (err) {
      console.error('Error adding goal:', err);
      setFeedback({
        type: 'error',
        message: 'Failed to add goal. Please try again.'
      });
    }
  };
  
  // Get icon for category
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
  
  // Get filtered popular goals
  const filteredPopularGoals = filterGoalsByTags(popularGoals);
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
        <Sparkles className="text-amber-500" size={20} />
        Goal Inspiration
      </h3>
      
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
      
      {/* Tabs for different sections */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSection('popular')}
          className={`px-4 py-2 text-sm font-medium ${
            activeSection === 'popular'
              ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400 -mb-px'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Popular
        </button>
        <button
          onClick={() => setActiveSection('browse')}
          className={`px-4 py-2 text-sm font-medium ${
            activeSection === 'browse'
              ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400 -mb-px'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Browse by Category
        </button>
        <button
          onClick={() => setActiveSection('ai')}
          className={`px-4 py-2 text-sm font-medium ${
            activeSection === 'ai'
              ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400 -mb-px'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          AI Suggestions
        </button>
      </div>
      
      {/* Quick filter tags */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter size={16} className="text-slate-500" />
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Quick Filters</h4>
        </div>
        <div className="flex gap-2 flex-wrap">
          {popularTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2 py-1 text-xs rounded-full ${
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
      
      {/* AI Search Section (always visible) */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={20} className="text-amber-500" />
          <h4 className="font-medium text-slate-800 dark:text-slate-200">AI Goal Generator</h4>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Describe your interests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-amber-200 dark:border-amber-800 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="sm:w-48 p-2 border border-amber-200 dark:border-amber-800 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleGenerateAiSuggestions}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-lg text-white flex items-center gap-1 whitespace-nowrap ${
              isGenerating 
                ? 'bg-slate-400 dark:bg-slate-600' 
                : 'bg-amber-500 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-700'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span className="whitespace-nowrap">Generating...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span className="whitespace-nowrap">Generate Ideas</span>
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="text-red-500 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
      
      {/* Content Sections */}
      {activeSection === 'popular' && (
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
            <ThumbsUp size={18} className="text-blue-500" />
            Popular Goal Ideas
          </h4>
          
          {filteredPopularGoals.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm italic">
              No goals match your selected filters. Try selecting different tags.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredPopularGoals.map((goal, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                    {getCategoryIcon(goal.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{goal.title}</p>
                    {goal.tags && goal.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1">
                        {goal.tags.map(tag => (
                          <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {addedGoals[goal.title] ? (
                    <div className="text-green-500 dark:text-green-400 flex-shrink-0">
                      <Check size={18} />
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAddGoal(goal.title, goal.category)}
                      className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 flex-shrink-0"
                    >
                      <PlusCircle size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeSection === 'browse' && (
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Browse by Category</h4>
          
          <div className="space-y-3">
            {Object.keys(predefinedGoals).map(categoryId => {
              // Skip categories that don't exist
              const categoryExists = categories.some(c => c.id === categoryId);
              if (!categoryExists) return null;
              
              const categoryName = categories.find(c => c.id === categoryId)?.name || categoryId;
              const isExpanded = expandedCategoryIds.includes(categoryId);
              
              return (
                <div key={categoryId} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => toggleCategoryExpansion(categoryId)}
                    className="w-full p-3 flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 text-left"
                  >
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(categoryId)}
                      <span className="font-medium text-slate-800 dark:text-slate-200">{categoryName}</span>
                    </div>
                    {isExpanded ? 
                      <ChevronUp size={18} className="text-slate-400" /> : 
                      <ChevronDown size={18} className="text-slate-400" />
                    }
                  </button>
                  
                  {isExpanded && (
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {predefinedGoals[categoryId].map((goal, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 p-2 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{goal}</p>
                          </div>
                          {addedGoals[goal] ? (
                            <div className="text-green-500 dark:text-green-400 flex-shrink-0">
                              <Check size={16} />
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleAddGoal(goal, categoryId)}
                              className="text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 flex-shrink-0"
                            >
                              <PlusCircle size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {activeSection === 'ai' && (
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
            <MessageCircle size={18} className="text-amber-500" />
            AI-Generated Suggestions
          </h4>
          
          {aiSuggestions.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
              <Sparkles size={32} className="text-slate-400 dark:text-slate-500 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Use the AI Goal Generator above to create personalized goal suggestions based on your interests.
              </p>
              <button
                onClick={() => handleGenerateAiSuggestions()}
                disabled={isGenerating || (!searchQuery.trim() && !selectedCategory)}
                className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg inline-flex items-center gap-1"
              >
                <Sparkles size={16} />
                <span>Generate Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aiSuggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 rounded-lg border border-amber-200 dark:border-amber-800"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    {suggestion.category ? 
                      getCategoryIcon(suggestion.category) : 
                      <Star size={16} className="text-amber-600 dark:text-amber-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{suggestion.title}</p>
                  </div>
                  {addedGoals[suggestion.title] ? (
                    <div className="text-green-500 dark:text-green-400 flex-shrink-0">
                      <Check size={18} />
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAddGoal(suggestion.title, suggestion.category)}
                      className="text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 flex-shrink-0"
                    >
                      <PlusCircle size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoalInspirationTab;