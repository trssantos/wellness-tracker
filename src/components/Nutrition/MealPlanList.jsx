import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Plus, Trash2, ChevronRight, CalendarDays } from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';

const MealPlanList = ({ onClose, onCreateNew, onViewPlan }) => {
  const [mealPlans, setMealPlans] = useState([]);
  
  // Load meal plans on component mount
  useEffect(() => {
    const storage = getStorage();
    if (storage.mealPlans && Array.isArray(storage.mealPlans)) {
      // Sort plans by creation date (newest first)
      const sortedPlans = [...storage.mealPlans].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setMealPlans(sortedPlans);
    } else {
      setMealPlans([]);
    }
  }, []);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Delete a meal plan
  const handleDeletePlan = (planId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this meal plan?')) {
      const storage = getStorage();
      if (storage.mealPlans) {
        storage.mealPlans = storage.mealPlans.filter(plan => plan.id !== planId);
        setStorage(storage);
        setMealPlans(storage.mealPlans);
      }
    }
  };
  
  return (
    <div>
      <div className="modal-header">
        <div className="flex items-center gap-2">
          <h3 className="modal-title text-slate-800 dark:text-slate-100">Your Meal Plans</h3>
        </div>
        <button onClick={onClose} className="modal-close-button text-slate-700 dark:text-slate-300">
          <ArrowLeft size={20} />
        </button>
      </div>
      
      <div className="p-4 bg-white dark:bg-slate-800">
        {mealPlans.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/20 rounded-lg border border-slate-200 dark:border-slate-700">
            <CalendarDays size={48} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No Meal Plans Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Generate your first personalized meal plan based on your dietary preferences and goals.
            </p>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Create Your First Meal Plan
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={onCreateNew}
                className="px-3 py-1.5 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 flex items-center gap-1.5"
              >
                <Plus size={16} />
                <span>New Plan</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {mealPlans.map((plan) => (
                <div 
                  key={plan.id}
                  onClick={() => onViewPlan(plan.id)}
                  className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                      <Calendar size={20} className="text-red-500 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-200">
                        {plan.nutritionSummary?.calories ? `${plan.nutritionSummary.calories} cal` : '7-Day'} Meal Plan
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Created {formatDate(plan.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeletePlan(plan.id, e)}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={18} className="text-slate-400 dark:text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MealPlanList;