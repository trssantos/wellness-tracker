// src/components/Nutrition/NutritionTracker.jsx
import React, { useState, useEffect } from 'react';
import { Apple, Search, PlusCircle, Calendar, ChevronLeft, ChevronRight, X, BarChart2, ArrowRight, Droplets, Brain, Utensils } from 'lucide-react';
import { FoodLogEntry } from './FoodLogEntry';
import { FoodSearchModal } from './FoodSearchModal';
import { FoodEntryForm } from './FoodEntryForm';
import { WaterTracker } from './WaterTracker';
import { MoodBasedSuggestions } from './MoodBasedSuggestions';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import NutritionStats from './NutritionStats';
import MealPlanGenerator from './MealPlanGenerator';
import NutritionAI from './NutritionAI';
import MealPlanList from './MealPlanList';
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
  const [showMealPlanList, setShowMealPlanList] = useState(true); // Default to showing list
  
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
  
  // Format year for mobile display (separate line)
  const formatYear = (date) => {
    return date.getFullYear();
  };
  
  // Load food entries and water intake for the current date
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
    
    setFoodEntries(dateEntries);
    setWaterIntake(currentWaterIntake);
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
      categories: foodItem.category ? [foodItem.category] : [], // Updated for multiple categories
      mealType: 'snack',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emoji: foodItem.emoji,
      tags: foodItem.tags || []
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
    setShowMealPlanList(true); // Start by showing the list of meal plans
    
    // Use setTimeout to ensure the modal element exists before trying to open it
    setTimeout(() => {
      const modal = document.getElementById('meal-planner-modal');
      if (modal) {
        modal.showModal();
      }
    }, 50);
  };

  const handleViewMealPlan = (planId) => {
    const storage = getStorage();
    if (storage.mealPlans) {
      const plan = storage.mealPlans.find(p => p.id === planId);
      if (plan) {
        // You could either:
        // 1. Set some state to show the plan details
        // 2. Or use the existing meal plan generator with this plan loaded
        console.log("Viewing meal plan:", plan);
      }
    }
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

  // Handle save meal plan
  const handleSaveMealPlan = (mealPlan) => {
    const storage = getStorage();
    if (!storage.mealPlans) {
      storage.mealPlans = [];
    }
    
    // Add the new meal plan with ID and date
    const newMealPlan = {
      id: `mealplan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...mealPlan
    };
    
    storage.mealPlans.push(newMealPlan);
    setStorage(storage);
    
    // Show success message and return to the list view
    setShowMealPlanner(false);
    setShowMealPlanList(true);
    alert("Meal plan saved successfully!"); // Replace with a nicer notification if you have one
    
    const modal = document.getElementById('meal-planner-modal');
    if (modal) modal.close();
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

  return (
    <div className="space-y-6">
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
              <Utensils size={16} />
              <span className="hidden sm:inline">Meal Plans</span>
            </button>
            
            <button
              onClick={handleOpenAIPrompt}
              className="p-2 sm:px-3 sm:py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Brain size={16} />
              <span className="hidden sm:inline">Ask AI</span>
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
        
        {/* Water Intake Tracker */}
        <div className="mb-6">
          <WaterTracker 
            waterIntake={waterIntake}
            onChange={handleWaterIntakeChange}
          />
        </div>
        
        {/* Food entries listing */}
        <div className="space-y-6">
          {foodEntries.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <Apple size={32} className="text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No Food Entries</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                Start tracking what you eat to see correlations with your mood and energy levels.
              </p>
              <button
                onClick={() => handleOpenAddEntryModal()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors inline-flex items-center gap-2"
              >
                <PlusCircle size={18} />
                Add Your First Entry
              </button>
            </div>
          ) : (
            <>
              {mealTypeOrder.map(mealType => {
                if (!groupedEntries[mealType] || groupedEntries[mealType].length === 0) return null;
                
                return (
                  <div key={mealType} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
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
    <div className="modal-content max-w-2xl w-full bg-white dark:bg-slate-800" onClick={e => e.stopPropagation()}>
      {showMealPlanList ? (
        <MealPlanList 
          onClose={() => {
            document.getElementById('meal-planner-modal').close();
            setShowMealPlanner(false);
          }}
          onCreateNew={() => setShowMealPlanList(false)}
          onViewPlan={(planId) => handleViewMealPlan(planId)}
        />
      ) : (
        <MealPlanGenerator
          onClose={() => {
            document.getElementById('meal-planner-modal').close();
            setShowMealPlanner(false);
          }}
          onSaveMealPlan={handleSaveMealPlan}
        />
      )}
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