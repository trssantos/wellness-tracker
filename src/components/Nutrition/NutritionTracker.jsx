import React, { useState, useEffect } from 'react';
import { ChevronDown,ChevronUp,Check,Battery,Apple, Search, PlusCircle, Calendar, ChevronLeft, ChevronRight, X, BarChart2, ArrowRight, Droplets, Brain, Utensils, Book, Receipt, ToastIcon, Info } from 'lucide-react';
import { FoodLogEntry } from './FoodLogEntry';
import { FoodSearchModal } from './FoodSearchModal';
import { FoodEntryForm } from './FoodEntryForm';
import { WaterTracker } from './WaterTracker';
import { MoodBasedSuggestions } from './MoodBasedSuggestions';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import NutritionStats from './NutritionStats';
import NutritionMealPlanHub from './NutritionMealPlanHub';
import NutritionAI from './NutritionAI';
import { getStorage, setStorage } from '../../utils/storage';

const NutritionTracker = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [foodEntries, setFoodEntries] = useState([]);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [addEntryModalOpen, setAddEntryModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [waterIntake, setWaterIntake] = useState(0);
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [activeMealPlans, setActiveMealPlans] = useState([]);
  const [notification, setNotification] = useState(null);
   // Add new state variables for collapsible sections
   const [waterSectionCollapsed, setWaterSectionCollapsed] = useState(false);
   const [mealsSectionCollapsed, setMealsSectionCollapsed] = useState(false);
   const [foodLogSectionCollapsed, setFoodLogSectionCollapsed] = useState(false);
  
  // Format date as YYYY-MM-DD for storage
  const formatStorageDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Format date for display
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('default', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };
  
  // Format date for mobile display (shorter)
  const formatMobileDate = (date) => {
    return date.toLocaleDateString('default', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Load food entries, water intake, and active meal plans for the current date
  useEffect(() => {
    const storage = getStorage();
    const dateKey = formatStorageDate(currentDate);
    
    // Initialize nutrition data if not exists
    if (!storage.nutrition) {
      storage.nutrition = {};
      setStorage(storage);
    }
    
    // Load entries for current date
    const dateEntries = storage.nutrition[dateKey]?.entries || [];
    
    // Load water intake for current date
    const currentWaterIntake = storage.nutrition[dateKey]?.waterIntake || 0;
    
    // Load active meal plans for current date
    const plannedMeals = storage.nutrition[dateKey]?.plannedMeals || [];
    
    setFoodEntries(dateEntries);
    setWaterIntake(currentWaterIntake);
    setActiveMealPlans(plannedMeals);
  }, [currentDate]);
  
  // Handle date navigation
  const handlePreviousDay = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setCurrentDate(prevDate);
  };
  
  const handleNextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setCurrentDate(nextDate);
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  // Handle adding new food entry
  const handleAddEntry = (entry) => {
    const storage = getStorage();
    const dateKey = formatStorageDate(currentDate);
    
    // Initialize if needed
    if (!storage.nutrition) {
      storage.nutrition = {};
    }
    
    if (!storage.nutrition[dateKey]) {
      storage.nutrition[dateKey] = { entries: [] };
    }
    
    // Create new entry with ID
    const newEntry = {
      id: Date.now().toString(),
      ...entry,
      timestamp: new Date().toISOString()
    };
    
    // Add to storage
    storage.nutrition[dateKey].entries = [
      ...storage.nutrition[dateKey].entries,
      newEntry
    ];
    
    // Update state
    setStorage(storage);
    setFoodEntries([...foodEntries, newEntry]);
    setAddEntryModalOpen(false);
    setEditingEntry(null);
    
    // Close the modal
    const modal = document.getElementById('food-entry-modal');
    if (modal) modal.close();
    
    // Show notification
    showNotification('Food entry added successfully!');
  };
  
  // Handle editing an entry
  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setAddEntryModalOpen(true);
    
    // Open the modal
    const modal = document.getElementById('food-entry-modal');
    if (modal) modal.showModal();
  };
  
  // Handle updating an entry
  const handleUpdateEntry = (updatedEntry) => {
    const storage = getStorage();
    const dateKey = formatStorageDate(currentDate);
    
    // Update the entry in storage
    const updatedEntries = foodEntries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    
    storage.nutrition[dateKey].entries = updatedEntries;
    
    // Update state
    setStorage(storage);
    setFoodEntries(updatedEntries);
    setAddEntryModalOpen(false);
    setEditingEntry(null);
    
    // Close the modal
    const modal = document.getElementById('food-entry-modal');
    if (modal) modal.close();
    
    // Show notification
    showNotification('Food entry updated successfully!');
  };
  
  // Handle initiating delete (opening confirmation modal)
  const handleInitiateDelete = (entry) => {
    setDeletingEntry(entry);
    setDeleteModalOpen(true);
    
    // Open the modal
    const modal = document.getElementById('delete-confirmation-modal');
    if (modal) modal.showModal();
  };
  
  // Handle confirming deletion
  const handleConfirmDelete = () => {
    if (!deletingEntry) return;
    
    const storage = getStorage();
    const dateKey = formatStorageDate(currentDate);
    
    // Filter out the deleted entry
    const filteredEntries = foodEntries.filter(entry => entry.id !== deletingEntry.id);
    
    storage.nutrition[dateKey].entries = filteredEntries;
    
    // Update state
    setStorage(storage);
    setFoodEntries(filteredEntries);
    setDeleteModalOpen(false);
    setDeletingEntry(null);
    
    // Close the modal
    const modal = document.getElementById('delete-confirmation-modal');
    if (modal) modal.close();
    
    // Show notification
    showNotification('Food entry deleted successfully!');
  };
  
  // Handle canceling deletion
  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setDeletingEntry(null);
    
    // Close the modal
    const modal = document.getElementById('delete-confirmation-modal');
    if (modal) modal.close();
  };
  
  // Handle adding from quick search
  const handleAddFromSearch = (foodItem) => {
    handleAddEntry({
      name: foodItem.name,
      categories: foodItem.category ? [foodItem.category] : [],
      mealType: 'snack',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emoji: foodItem.emoji,
      tags: foodItem.tags || [],
      moodImpact: foodItem.moodImpact,
      energyImpact: foodItem.energyImpact
    });
    
    setSearchModalOpen(false);
    
    // Close the modal
    const modal = document.getElementById('food-search-modal');
    if (modal) modal.close();
  };
  
  // Handle water intake update
  const handleWaterIntakeChange = (amount) => {
    const storage = getStorage();
    const dateKey = formatStorageDate(currentDate);
    
    // Initialize if needed
    if (!storage.nutrition) {
      storage.nutrition = {};
    }
    
    if (!storage.nutrition[dateKey]) {
      storage.nutrition[dateKey] = { entries: [] };
    }
    
    // Update water intake
    storage.nutrition[dateKey].waterIntake = amount;
    
    // Update state
    setStorage(storage);
    setWaterIntake(amount);
  };
  
  // Handle adding a meal from a meal plan to today's food log
  // Handle adding a meal from a meal plan to today's food log
const handleAddMealToDay = (meal) => {
  // Infer categories from meal information if not provided
  let categories = meal.categories || [];
  
  // If no categories provided, infer based on ingredients and meal type
  if (categories.length === 0) {
    // Always add Planned Meal category
    categories.push('Planned Meal');
    
    // Add category based on meal type
    if (meal.mealType.toLowerCase().includes('breakfast')) {
      categories.push('Breakfast Foods');
    }
    
    // Infer categories from ingredients
    const ingredients = meal.ingredients || [];
    const ingredientText = ingredients.join(' ').toLowerCase();
    
    // Simple keyword mapping
    if (ingredientText.match(/chicken|turkey|poultry/)) categories.push('Poultry');
    if (ingredientText.match(/beef|steak|lamb|pork/)) categories.push('Red Meat');
    if (ingredientText.match(/salmon|tuna|fish|seafood|shrimp/)) categories.push('Seafood');
    if (ingredientText.match(/tofu|tempeh|seitan/)) categories.push('Vegan');
    if (ingredientText.match(/spinach|kale|broccoli|veggie|vegetable/)) categories.push('Vegetables');
    if (ingredientText.match(/apple|banana|berry|fruit/)) categories.push('Fruits');
    if (ingredientText.match(/rice|pasta|bread|grain|wheat|oat/)) categories.push('Grains');
    if (ingredientText.match(/yogurt|cheese|milk|cream/)) categories.push('Dairy');
    if (ingredientText.match(/bean|lentil|chickpea/)) categories.push('Legumes');
    if (ingredientText.match(/almond|walnut|cashew|nut|seed/)) categories.push('Nuts & Seeds');
  }
  
  // Create a food entry from the meal
  const entry = {
    name: meal.name,
    categories: categories,
    mealType: meal.mealType.toLowerCase(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    emoji: '🍽️',
    ingredients: meal.ingredients,
    instructions: meal.instructions,
    description: meal.description,
    benefits: meal.benefits,
    tags: meal.ingredients ? meal.ingredients.slice(0, 3) : [],
    fromMealPlan: true,
    mealPlanId: meal.mealPlanId
  };
  
  // Add the entry to the food log
  handleAddEntry(entry);
  
  // Add to active meal plans for this day
  const storage = getStorage();
  const dateKey = formatStorageDate(currentDate);
  
  if (!storage.nutrition[dateKey].plannedMeals) {
    storage.nutrition[dateKey].plannedMeals = [];
  }
  
  // Check if meal is already in planned meals
  const alreadyPlanned = storage.nutrition[dateKey].plannedMeals.some(
    plannedMeal => plannedMeal.name === meal.name && plannedMeal.mealType === meal.mealType
  );
  
  if (!alreadyPlanned) {
    storage.nutrition[dateKey].plannedMeals.push({
      id: Date.now().toString(),
      name: meal.name,
      mealType: meal.mealType,
      added: new Date().toISOString()
    });
    
    setStorage(storage);
    
    // Update active meal plans state
    setActiveMealPlans(storage.nutrition[dateKey].plannedMeals);
  }
  
  // Show notification
  showNotification(`Added ${meal.name} to your food log!`);
};
  
  // Show notification
  const showNotification = (message) => {
    setNotification(message);
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  // Group entries by meal type
  const groupedEntries = foodEntries.reduce((acc, entry) => {
    const mealType = entry.mealType || 'other';
    if (!acc[mealType]) {
      acc[mealType] = [];
    }
    acc[mealType].push(entry);
    return acc;
  }, {});
  
  // Order of meal types
  const mealTypeOrder = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

  // Open the search modal
  const handleOpenSearchModal = () => {
    const modal = document.getElementById('food-search-modal');
    if (modal) modal.showModal();
    setSearchModalOpen(true);
  };

  // Open the add entry modal
  const handleOpenAddEntryModal = (entry = null) => {
    setEditingEntry(entry);
    setAddEntryModalOpen(true);
    
    // Open the modal
    const modal = document.getElementById('food-entry-modal');
    if (modal) modal.showModal();
  };

  // Toggle analytics view
  const toggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
  };

  // Handle open meal planner
  const handleOpenMealPlanner = () => {
    setShowMealPlanner(true);
    
    // Use setTimeout to ensure the modal element exists before trying to open it
    setTimeout(() => {
      const modal = document.getElementById('meal-planner-modal');
      if (modal) {
        modal.showModal();
      }
    }, 50);
  };

  // Handle open AI prompt
  const handleOpenAIPrompt = () => {
    setShowAIPrompt(true);
    
    // Use setTimeout to ensure the modal element exists before trying to open it
    setTimeout(() => {
      const modal = document.getElementById('nutrition-ai-modal');
      if (modal) {
        modal.showModal();
      }
    }, 50);
  };

  // Get user's current mood and energy level for the day
  const getUserMoodEnergyForDay = () => {
    const storage = getStorage();
    const dateKey = formatStorageDate(currentDate);
    
    const dayData = storage[dateKey] || {};
    return {
      mood: dayData.morningMood || dayData.mood || null,
      energy: dayData.morningEnergy || dayData.energyLevel || 0
    };
  };

  // If showing analytics, render the stats component
  if (showAnalytics) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
              <BarChart2 className="text-red-500 dark:text-red-400" size={24} />
              Nutrition Analytics
            </h2>
            
            <button
              onClick={toggleAnalytics}
              className="px-3 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <ArrowRight size={16} className="transform rotate-180" />
              <span className="hidden sm:inline">Back to Tracker</span>
            </button>
          </div>
        </div>
        
        <NutritionStats />
      </div>
    );
  }

  const { mood, energy } = getUserMoodEnergyForDay();
  
  // Check if there are active meal plans for today
  const hasMealPlans = activeMealPlans && activeMealPlans.length > 0;

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-out">
          <Check size={18} />
          {notification}
        </div>
      )}
      
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        {/* Header Section - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors mb-1 sm:mb-0">
            <Apple className="text-red-500 dark:text-red-400" size={24} />
            Nutrition Tracker
          </h2>
          
          <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={toggleAnalytics}
              className="p-2 sm:px-3 sm:py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <BarChart2 size={16} />
              <span className="hidden sm:inline">Analytics</span>
            </button>
            
            <button
              onClick={handleOpenMealPlanner}
              className="p-2 sm:px-3 sm:py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Book size={16} />
              <span className="hidden sm:inline">Meal Plans</span>
            </button>
            
            <button
              onClick={handleOpenAIPrompt}
              className="p-2 sm:px-3 sm:py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Brain size={16} />
              <span className="hidden sm:inline">Ask Solaris</span>
            </button>
          </div>
        </div>
        
        {/* Mobile-only Date Display */}
        <div className="flex sm:hidden w-full justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePreviousDay}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
            </button>
            
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {formatMobileDate(currentDate)}
            </span>
            
            <button 
              onClick={handleNextDay}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
          
          <button
            onClick={handleToday}
            className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded px-2 py-1"
          >
            Today
          </button>
        </div>
        
        {/* Desktop-only Date Navigation */}
        <div className="hidden sm:flex items-center gap-2">
          <button 
            onClick={handlePreviousDay}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
          </button>
          
          <button 
            onClick={handleToday}
            className="px-2 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Today
          </button>
          
          <button 
            onClick={handleNextDay}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>
        
        {/* Desktop-only Full Date Display */}
        <div className="hidden sm:flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-red-500 dark:text-red-400" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {formatDisplayDate(currentDate)}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleOpenSearchModal}
              className="px-3 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Search size={16} />
              <span className="hidden sm:inline">Quick Search</span>
            </button>
            
            <button
              onClick={() => handleOpenAddEntryModal()}
              className="px-3 py-1.5 text-sm font-medium bg-red-500 text-white rounded-lg flex items-center gap-1.5 hover:bg-red-600 transition-colors"
            >
              <PlusCircle size={16} />
              <span className="hidden sm:inline">Add Entry</span>
            </button>
          </div>
        </div>
        
        {/* Mobile-only Action Buttons */}
        <div className="flex sm:hidden justify-between mb-4">
          <button
            onClick={handleOpenSearchModal}
            className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label="Quick Search"
          >
            <Search size={20} />
          </button>
          
          <button
            onClick={() => handleOpenAddEntryModal()}
            className="p-2 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
            aria-label="Add Entry"
          >
            <PlusCircle size={20} />
          </button>
        </div>

        <div className="mb-6">
          {/* Collapsible Section Header */}
          <div 
            className="flex items-center justify-between cursor-pointer mb-2"
            onClick={() => setWaterSectionCollapsed(!waterSectionCollapsed)}
          >
            <h3 className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Droplets className="text-blue-500 dark:text-blue-400" size={18} />
              Water Intake
            </h3>
            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
              {waterSectionCollapsed ? (
                <ChevronDown size={16} className="text-slate-500 dark:text-slate-400" />
              ) : (
                <ChevronUp size={16} className="text-slate-500 dark:text-slate-400" />
              )}
            </button>
          </div>
          
          {/* Collapsible Content */}
          <div className={waterSectionCollapsed ? "hidden" : "block"}>
            <WaterTracker 
              waterIntake={waterIntake}
              onChange={handleWaterIntakeChange}
            />
          </div>
        </div>
        
        {/* 2. ACTIVE MEAL PLANS SECTION - NOW SECOND */}
        {hasMealPlans && (
          <div className="mb-6 border border-slate-200 dark:border-slate-700 rounded-lg">
            {/* Collapsible Section Header */}
            <div 
              className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer"
              onClick={() => setMealsSectionCollapsed(!mealsSectionCollapsed)}
            >
              <h3 className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Receipt size={16} className="text-blue-500 dark:text-blue-400" />
                Today's Planned Meals
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenMealPlanner();
                  }}
                  className="text-xs text-blue-500 hover:text-blue-600 whitespace-nowrap"
                >
                  View All Plans
                </button>
                <button className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-full">
                  {mealsSectionCollapsed ? (
                    <ChevronDown size={16} className="text-slate-500 dark:text-slate-400" />
                  ) : (
                    <ChevronUp size={16} className="text-slate-500 dark:text-slate-400" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Collapsible Content */}
            <div className={mealsSectionCollapsed ? "hidden" : "block"}>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {activeMealPlans.map((plannedMeal, index) => (
                  <div 
                    key={index}
                    className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between"
                  >
                    <div className="w-full overflow-hidden">
                      <div className="font-medium text-slate-700 dark:text-slate-300 truncate capitalize">
                        {plannedMeal.mealType}: {plannedMeal.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Added at {new Date(plannedMeal.added).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full mt-2 sm:mt-0 whitespace-nowrap">
                      Added to Log
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* 3. FOOD ENTRIES LISTING - NOW THIRD */}
        <div className="space-y-6">
          {/* Collapsible Section Header */}
          <div 
            className="flex items-center justify-between cursor-pointer mb-3"
            onClick={() => setFoodLogSectionCollapsed(!foodLogSectionCollapsed)}
          >
            <h3 className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Apple className="text-red-500 dark:text-red-400" size={18} />
              Food Entries
            </h3>
            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
              {foodLogSectionCollapsed ? (
                <ChevronDown size={16} className="text-slate-500 dark:text-slate-400" />
              ) : (
                <ChevronUp size={16} className="text-slate-500 dark:text-slate-400" />
              )}
            </button>
          </div>
          
          {/* Collapsible Content */}
          <div className={foodLogSectionCollapsed ? "hidden" : "block"}>
            {foodEntries.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <Apple size={32} className="text-red-500 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No Food Entries</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                  Start tracking what you eat to see correlations with your mood and energy levels.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={() => handleOpenAddEntryModal()}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors inline-flex items-center gap-2"
                  >
                    <PlusCircle size={18} />
                    Add Food Entry
                  </button>
                  
                  <button
                    onClick={handleOpenMealPlanner}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
                  >
                    <Book size={18} />
                    Use Meal Plan
                  </button>
                </div>
              </div>
            ) : (
              <>
                {mealTypeOrder.map(mealType => {
                  if (!groupedEntries[mealType] || groupedEntries[mealType].length === 0) return null;
                  
                  return (
                    <div key={mealType} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-4">
                      <div className="bg-red-50 dark:bg-red-900/30 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-medium text-slate-700 dark:text-slate-300 capitalize">{mealType}</h3>
                      </div>
                      <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {groupedEntries[mealType].map(entry => (
                          <FoodLogEntry 
                            key={entry.id} 
                            entry={entry}
                            onEdit={() => handleEditEntry(entry)}
                            onDelete={() => handleInitiateDelete(entry)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Nutrition Tips Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-0 flex items-center gap-2">
            <Info className="text-blue-500 dark:text-blue-400" size={20} />
            Nutrition Tips & Resources
          </h3>
          
          <button
            onClick={handleOpenAIPrompt}
            className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
          >
            Ask Solaris
            <ArrowRight size={14} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Brain size={16} className="text-purple-500" />
              Mood-Boosting Foods
            </h4>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="text-purple-500">•</span>
                Fatty fish (salmon, mackerel) rich in omega-3s
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-purple-500">•</span>
                Dark chocolate (70%+ cocoa) contains mood-enhancing compounds
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-purple-500">•</span>
                Berries provide antioxidants that fight oxidative stress
              </li>
            </ul>
            <button 
              onClick={handleOpenAIPrompt}
              className="mt-3 text-xs text-blue-500 hover:text-blue-600"
            >
              Get more personalized tips
            </button>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Battery size={16} className="text-green-500" />
              Energy-Boosting Nutrition
            </h4>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="text-green-500">•</span>
                Complex carbs like oatmeal provide steady energy
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-green-500">•</span>
                Nuts and seeds offer protein, healthy fats, and fiber
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-green-500">•</span>
                Hydration is essential - even mild dehydration causes fatigue
              </li>
            </ul>
            <button 
              onClick={handleOpenMealPlanner}
              className="mt-3 text-xs text-blue-500 hover:text-blue-600"
            >
              Create energy-focused meal plan
            </button>
          </div>
        </div>
      </div>
      
      {/* Mood-Based Suggestions */}
      {(mood || energy > 0) && (
        <MoodBasedSuggestions mood={mood} energy={energy} />
      )}
      
      {/* Modals */}
      <dialog
        id="food-search-modal"
        className="modal-base"
      >
        <FoodSearchModal 
          onClose={() => {
            document.getElementById('food-search-modal').close();
            setSearchModalOpen(false);
          }}
          onSelectFood={handleAddFromSearch}
        />
      </dialog>
      
      <dialog
        id="food-entry-modal"
        className="modal-base"
      >
        <FoodEntryForm
          entry={editingEntry}
          onClose={() => {
            document.getElementById('food-entry-modal').close();
            setAddEntryModalOpen(false);
            setEditingEntry(null);
          }}
          onSave={editingEntry ? handleUpdateEntry : handleAddEntry}
        />
      </dialog>
      
      <dialog
        id="delete-confirmation-modal"
        className="modal-base"
      >
        <DeleteConfirmationModal
          entry={deletingEntry}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </dialog>
      
      {/* Meal Planner Modal */}
      {showMealPlanner && (
        <dialog
          id="meal-planner-modal"
          className="modal-base"
        >
          <div className="modal-content max-w-3xl w-full bg-white dark:bg-slate-800" onClick={e => e.stopPropagation()}>
            <NutritionMealPlanHub 
              onClose={() => {
                document.getElementById('meal-planner-modal').close();
                setShowMealPlanner(false);
              }}
              onAddMealToDay={handleAddMealToDay}
            />
          </div>
        </dialog>
      )}

      {/* AI Prompt Modal */}
      {showAIPrompt && (
        <dialog
          id="nutrition-ai-modal"
          className="modal-base"
        >
          <div className="modal-content max-w-2xl w-full bg-white dark:bg-slate-800" onClick={e => e.stopPropagation()}>
            <NutritionAI
              onClose={() => {
                document.getElementById('nutrition-ai-modal').close();
                setShowAIPrompt(false);
              }}
            />
          </div>
        </dialog>
      )}
    </div>
  );
};

export default NutritionTracker;