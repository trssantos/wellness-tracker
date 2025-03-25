import React, { useState, useEffect } from 'react';
import { Target,CalendarDays, Plus, ArrowLeft, Edit2, Trash2, Scale, Calendar, BarChart2, Filter, User, ChevronRight, Search } from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import MealPlanGenerator from './MealPlanGenerator';
import MealPlanViewer from './MealPlanViewer';
import MealPlanEditor from './MealPlanEditor';
import WeightTracker from './WeightTracker';
import MealPlanSelectionModal from './MealPlanSelectionModal';
import ManualMealPlanCreator from './ManualMealPlanCreator';
import DeletePlanConfirmationModal from './DeletePlanConfirmationModal';


const NutritionMealPlanHub = ({ onClose, onAddMealToDay }) => {
  const [mealPlans, setMealPlans] = useState([]);
  const [view, setView] = useState('list'); // list, selection, generate, create, view, edit, weight
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [filter, setFilter] = useState('all'); // all, recent, customized, adherence
  const [searchQuery, setSearchQuery] = useState('');
  const [showSelectionModal, setShowSelectionModal] = useState(false);
   // Add state for delete confirmation
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [planToDelete, setPlanToDelete] = useState(null);
  
  // Load meal plans on component mount
  useEffect(() => {
    loadMealPlans();
  }, []);
  
  // Load meal plans from storage
  const loadMealPlans = () => {
    const storage = getStorage();
    
    if (storage.mealPlans && Array.isArray(storage.mealPlans)) {
      // Sort plans by creation date (newest first)
      const sortedPlans = [...storage.mealPlans].sort((a, b) => 
        new Date(b.createdAt || b.userPreferences?.created || 0) - 
        new Date(a.createdAt || a.userPreferences?.created || 0)
      );
      setMealPlans(sortedPlans);
    } else {
      setMealPlans([]);
    }
  };
  
  // Save a new meal plan
  const handleSaveMealPlan = (plan) => {
    const storage = getStorage();
    
    if (!storage.mealPlans) {
      storage.mealPlans = [];
    }
    
    // Add the new meal plan with ID and date
    const newMealPlan = {
      id: plan.id || `mealplan-${Date.now()}`,
      createdAt: plan.createdAt || new Date().toISOString(),
      ...plan
    };
    
    storage.mealPlans.push(newMealPlan);
    setStorage(storage);
    
    // Reload plans and go back to list view
    loadMealPlans();
    setView('list');
  };
  
  // Update an existing meal plan
  const handleUpdateMealPlan = (updatedPlan) => {
    const storage = getStorage();
    
    if (!storage.mealPlans) {
      storage.mealPlans = [];
      setStorage(storage);
      return;
    }
    
    // Find and update the plan
    const planIndex = storage.mealPlans.findIndex(p => p.id === updatedPlan.id);
    
    if (planIndex !== -1) {
      storage.mealPlans[planIndex] = {
        ...updatedPlan,
        lastUpdated: new Date().toISOString()
      };
      
      setStorage(storage);
      loadMealPlans();
      
      // Update the selected plan if needed
      if (selectedPlanId === updatedPlan.id) {
        setSelectedPlan(updatedPlan);
      }
      
      // Go back to view
      setView('view');
    }
  };

   // Handle initiating plan deletion
   const handleInitiateDelete = (plan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
    
    // Open the modal
    setTimeout(() => {
      const modal = document.getElementById('delete-plan-modal');
      if (modal) modal.showModal();
    }, 50);
  };

   // Handle confirming deletion
   const handleConfirmDelete = () => {
    if (!planToDelete) return;
    
    const storage = getStorage();
    
    if (!storage.mealPlans) return;
    
    // Remove plan from storage
    storage.mealPlans = storage.mealPlans.filter(p => p.id !== planToDelete.id);
    setStorage(storage);
    
    // Remove related adherence data
    if (storage.mealPlanAdherence && storage.mealPlanAdherence[planToDelete.id]) {
      delete storage.mealPlanAdherence[planToDelete.id];
      setStorage(storage);
    }
    
    // Reload plans and reset view
    loadMealPlans();
    if (selectedPlanId === planToDelete.id) {
      setSelectedPlanId(null);
      setSelectedPlan(null);
    }
    
    // Close the modal
    setShowDeleteModal(false);
    setPlanToDelete(null);
    const modal = document.getElementById('delete-plan-modal');
    if (modal) modal.close();
  };

    // Handle canceling deletion
    const handleCancelDelete = () => {
      setShowDeleteModal(false);
      setPlanToDelete(null);
      const modal = document.getElementById('delete-plan-modal');
      if (modal) modal.close();
    };
  
  // Delete a meal plan
  const handleDeletePlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this meal plan?')) {
      const storage = getStorage();
      
      if (!storage.mealPlans) return;
      
      // Remove plan from storage
      storage.mealPlans = storage.mealPlans.filter(p => p.id !== planId);
      setStorage(storage);
      
      // Remove related adherence data
      if (storage.mealPlanAdherence && storage.mealPlanAdherence[planId]) {
        delete storage.mealPlanAdherence[planId];
        setStorage(storage);
      }
      
      // Reload plans and reset view
      loadMealPlans();
      if (selectedPlanId === planId) {
        setSelectedPlanId(null);
        setSelectedPlan(null);
        setView('list');
      }
    }
  };
  
  // Handle viewing a plan
  const handleViewPlan = (planId) => {
    const plan = mealPlans.find(p => p.id === planId);
    
    if (plan) {
      setSelectedPlanId(planId);
      setSelectedPlan(plan);
      setView('view');
    }
  };
  
  // Handle editing a plan
  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setView('edit');
  };
  
  // Handle opening the creation modal
  const handleCreatePlan = () => {
    setView('selection');
  };
  
  // Handle selection of meal plan creation method
  const handleSelectMethod = (method) => {
    if (method === 'ai') {
      setView('generate');
    } else if (method === 'manual') {
      setView('create');
    }
  };
  
  // Filter and search plans
  const getFilteredPlans = () => {
    let filtered = [...mealPlans];
    
    // Apply filter
    if (filter === 'recent') {
      // Show plans from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(plan => {
        const creationDate = new Date(plan.createdAt || plan.userPreferences?.created || 0);
        return creationDate > thirtyDaysAgo;
      });
    } else if (filter === 'customized') {
      // Show plans that have been edited
      filtered = filtered.filter(plan => plan.lastUpdated);
    } else if (filter === 'adherence') {
      // Get adherence data and sort by completion percentage
      const storage = getStorage();
      const adherenceData = storage.mealPlanAdherence || {};
      
      // Calculate completion percentage for each plan
      filtered.forEach(plan => {
        const planAdherence = adherenceData[plan.id];
        if (planAdherence && planAdherence.mealAdherence) {
          const mealKeys = Object.keys(planAdherence.mealAdherence);
          const completedCount = mealKeys.filter(key => 
            planAdherence.mealAdherence[key].completed
          ).length;
          
          plan.adherenceRate = mealKeys.length > 0 
            ? Math.round((completedCount / mealKeys.length) * 100) 
            : 0;
        } else {
          plan.adherenceRate = 0;
        }
      });
      
      // Sort by adherence rate (highest first)
      filtered.sort((a, b) => b.adherenceRate - a.adherenceRate);
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(plan => {
        // Search in plan name, nutrition summary, diet type
        const name = plan.name || '';
        const dietType = plan.userPreferences?.dietType || '';
        const goalType = plan.userPreferences?.goal || '';
        
        return name.toLowerCase().includes(query) || 
               dietType.toLowerCase().includes(query) || 
               goalType.toLowerCase().includes(query);
      });
    }
    
    return filtered;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get a color for the adherence badge
  const getAdherenceColor = (rate) => {
    if (rate >= 75) return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
    if (rate >= 50) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    if (rate >= 25) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
    return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
  };
  
  // Render list of meal plans
  const renderMealPlanList = () => {
    const filteredPlans = getFilteredPlans();
    
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Your Meal Plans
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('weight')}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
              title="Weight Tracker"
            >
              <Scale size={16} />
              <span className="hidden sm:inline">Weight</span>
            </button>
            <button
              onClick={handleCreatePlan}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Create Plan</span>
            </button>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meal plans..."
              className="w-full pl-10 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>
          
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            >
              <option value="all">All Plans</option>
              <option value="recent">Recent</option>
              <option value="customized">Customized</option>
              <option value="adherence">By Adherence</option>
            </select>
          </div>
        </div>
        
        {filteredPlans.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/20 rounded-lg border border-slate-200 dark:border-slate-700">
            <CalendarDays size={48} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No Meal Plans Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              {searchQuery 
                ? 'No meal plans match your search criteria. Try a different search or clear filters.'
                : 'Generate your first personalized meal plan based on your dietary preferences and goals.'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreatePlan}
                className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Create Your First Meal Plan
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPlans.map((plan) => {
              const storage = getStorage();
              const adherenceData = storage.mealPlanAdherence && storage.mealPlanAdherence[plan.id];
              
              // Calculate adherence rate
              let adherenceRate = 0;
              if (adherenceData && adherenceData.mealAdherence) {
                const mealKeys = Object.keys(adherenceData.mealAdherence);
                const completedCount = mealKeys.filter(key => 
                  adherenceData.mealAdherence[key].completed
                ).length;
                
                adherenceRate = mealKeys.length > 0 
                  ? Math.round((completedCount / mealKeys.length) * 100) 
                  : 0;
              }
              
              return (
                <div 
                  key={plan.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="mb-2 sm:mb-0">
                    <div className="flex items-center gap-2">
                      <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                        <Calendar size={18} className="text-red-500 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800 dark:text-slate-200">
                          {plan.nutritionSummary?.calories ? `${plan.nutritionSummary.calories} cal` : '7-Day'} Meal Plan
                          {plan.userPreferences?.dietType && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                              {plan.userPreferences.dietType}
                            </span>
                          )}
                        </h3>
                        <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500 dark:text-slate-400">
                          <span>
                            Created {formatDate(plan.createdAt || plan.userPreferences?.created)}
                          </span>
                          
                          {plan.weekPlan && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {plan.weekPlan.length} days
                            </span>
                          )}
                          
                          {plan.userPreferences?.goal && (
                            <span className="flex items-center gap-1">
                              <Target size={12} />
                              {plan.userPreferences.goal}
                            </span>
                          )}
                          
                          {adherenceRate > 0 && (
                            <span className={`px-2 py-0.5 rounded-full ${getAdherenceColor(adherenceRate)}`}>
                              {adherenceRate}% adherence
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleViewPlan(plan.id)}
                      className="p-1.5 px-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span className="text-sm">View</span>
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                      title="Edit Plan"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
        onClick={() => handleInitiateDelete(plan)}
        className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        title="Delete Plan"
      >
        <Trash2 size={16} />
      </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="px-2 sm:px-0 w-full">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">
          Meal Planning Hub
        </h2>
      </div>
      
      {view === 'list' && renderMealPlanList()}
      
      {view === 'selection' && (
        <MealPlanSelectionModal 
          onClose={() => setView('list')}
          onSelectMethod={handleSelectMethod}
        />
      )}
      
      {view === 'generate' && (
        <MealPlanGenerator 
          onClose={() => setView('list')}
          onSaveMealPlan={handleSaveMealPlan}
        />
      )}
      
      {view === 'create' && (
        <ManualMealPlanCreator 
          onClose={() => setView('list')}
          onSave={handleSaveMealPlan}
        />
      )}
      
      {view === 'view' && selectedPlan && (
        <MealPlanViewer 
          planId={selectedPlanId}
          onClose={() => setView('list')}
          onEdit={handleEditPlan}
          onAddToDay={onAddMealToDay}
        />
      )}
      
      {view === 'edit' && selectedPlan && (
        <MealPlanEditor
          plan={selectedPlan}
          onClose={() => setView('view')}
          onSave={handleUpdateMealPlan}
        />
      )}
      
      {view === 'weight' && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <button 
              onClick={() => setView('list')}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Weight Tracker
            </h2>
          </div>
          <WeightTracker />
        </div>
      )}

      {/* Add this at the end of the component, before the closing div */}
      {showDeleteModal && (
        <dialog
          id="delete-plan-modal"
          className="modal-base"
        >
          <DeletePlanConfirmationModal
            planName={planToDelete?.nutritionSummary?.calories ? 
              `${planToDelete.nutritionSummary.calories} cal Meal Plan` : 
              'Meal Plan'
            }
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
          />
        </dialog>
      )}
    </div>
  );
};

export default NutritionMealPlanHub;