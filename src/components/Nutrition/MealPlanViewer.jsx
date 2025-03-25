import React, { useState, useEffect } from 'react';
import { 
    Flame,ArrowLeft, Calendar, Check, Info, PlusCircle, Edit2, 
  Trash2, ChevronDown, ChevronUp, ChevronRight, Printer,
  ClipboardCheck, Star, Share2, CheckCircle, Scale
} from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import WeightTracker from './WeightTracker';

const MealPlanViewer = ({ planId, onClose, onEdit, onAddToDay }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [expandedMeals, setExpandedMeals] = useState({});
  const [adherenceData, setAdherenceData] = useState({});
  const [showWeightTracker, setShowWeightTracker] = useState(false);
  
  // Load the meal plan data
  useEffect(() => {
    try {
      const storage = getStorage();
      if (storage.mealPlans) {
        const foundPlan = storage.mealPlans.find(p => p.id === planId);
        if (foundPlan) {
          setPlan(foundPlan);
          
          // Initialize expanded state for all meals
          const expanded = {};
          foundPlan.weekPlan.forEach((day, dayIndex) => {
            day.meals.forEach((meal, mealIndex) => {
              expanded[`${dayIndex}-${mealIndex}`] = false;
            });
          });
          setExpandedMeals(expanded);
          
          // Load adherence data
          loadAdherenceData(foundPlan);
        } else {
          setError("Meal plan not found");
        }
      } else {
        setError("No meal plans available");
      }
    } catch (err) {
      console.error("Error loading meal plan:", err);
      setError("Failed to load meal plan");
    } finally {
      setLoading(false);
    }
  }, [planId]);
  
  // Load adherence data for the meal plan
  const loadAdherenceData = (mealPlan) => {
    const storage = getStorage();
    if (!storage.mealPlanAdherence) {
      storage.mealPlanAdherence = {};
    }
    
    const adherence = storage.mealPlanAdherence[planId] || initializeAdherenceData(mealPlan);
    setAdherenceData(adherence);
  };
  
  // Initialize adherence data for a new meal plan
  const initializeAdherenceData = (mealPlan) => {
    const adherence = {
      dayAdherence: {},
      mealAdherence: {},
      lastUpdated: new Date().toISOString()
    };
    
    mealPlan.weekPlan.forEach((day, dayIndex) => {
      adherence.dayAdherence[dayIndex] = {
        completed: false,
        date: null
      };
      
      day.meals.forEach((meal, mealIndex) => {
        adherence.mealAdherence[`${dayIndex}-${mealIndex}`] = {
          completed: false,
          added: false
        };
      });
    });
    
    return adherence;
  };
  
  // Calculate overall adherence percentage
  const calculateAdherence = () => {
    if (!adherenceData.mealAdherence) return 0;
    
    const mealKeys = Object.keys(adherenceData.mealAdherence);
    if (mealKeys.length === 0) return 0;
    
    const completedCount = mealKeys.filter(key => 
      adherenceData.mealAdherence[key].completed
    ).length;
    
    return Math.round((completedCount / mealKeys.length) * 100);
  };
  
  // Toggle meal expansion
  const toggleMealExpansion = (dayIndex, mealIndex) => {
    const key = `${dayIndex}-${mealIndex}`;
    setExpandedMeals(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Mark a meal as completed/adhered to
  const toggleMealCompleted = (dayIndex, mealIndex) => {
    const key = `${dayIndex}-${mealIndex}`;
    const updatedAdherence = {
      ...adherenceData,
      mealAdherence: {
        ...adherenceData.mealAdherence,
        [key]: {
          ...adherenceData.mealAdherence[key],
          completed: !adherenceData.mealAdherence[key].completed
        }
      },
      lastUpdated: new Date().toISOString()
    };
    
    // Update storage
    const storage = getStorage();
    if (!storage.mealPlanAdherence) {
      storage.mealPlanAdherence = {};
    }
    
    storage.mealPlanAdherence[planId] = updatedAdherence;
    setStorage(storage);
    
    // Update state
    setAdherenceData(updatedAdherence);
  };
  
  // Add a meal to today's food log
  const handleAddMealToDay = (meal) => {
    onAddToDay(meal);
  };
  
  // Mark a day as completed
  const toggleDayCompleted = (dayIndex) => {
    const today = new Date().toISOString().split('T')[0];
    
    const updatedAdherence = {
      ...adherenceData,
      dayAdherence: {
        ...adherenceData.dayAdherence,
        [dayIndex]: {
          completed: !adherenceData.dayAdherence[dayIndex].completed,
          date: adherenceData.dayAdherence[dayIndex].completed ? 
            adherenceData.dayAdherence[dayIndex].date : today
        }
      },
      lastUpdated: new Date().toISOString()
    };
    
    // Update storage
    const storage = getStorage();
    if (!storage.mealPlanAdherence) {
      storage.mealPlanAdherence = {};
    }
    
    storage.mealPlanAdherence[planId] = updatedAdherence;
    setStorage(storage);
    
    // Update state
    setAdherenceData(updatedAdherence);
  };
  
  // Get formatted creation date
  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-center">
        <h3 className="font-medium">{error}</h3>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  if (showWeightTracker) {
    return (
      <div>
        <div className="mb-4 flex items-center gap-2">
          <button 
            onClick={() => setShowWeightTracker(false)}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Weight Tracker
          </h2>
        </div>
        <WeightTracker planId={planId} />
      </div>
    );
  }
  
  if (!plan) return null;
  
  return (
    <div className="px-2 sm:px-0 w-full">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 truncate">
            {plan.nutritionSummary?.calories ? `${plan.nutritionSummary.calories} cal` : '7-Day'} Meal Plan
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(plan)}
            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            title="Edit Plan"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => window.print()}
            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            title="Print Plan"
          >
            <Printer size={18} />
          </button>
        </div>
      </div>
      
      {/* Plan Overview */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-6">
        <div className="bg-red-50 dark:bg-red-900/30 p-3 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-medium text-slate-800 dark:text-slate-100">Plan Overview</h3>
        </div>
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Nutrition Summary */}
{plan.nutritionSummary && (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
    <div className="bg-red-50 dark:bg-red-900/30 p-4 border-b border-slate-200 dark:border-slate-700">
      <h3 className="font-semibold text-slate-800 dark:text-slate-100">Daily Nutrition Targets</h3>
    </div>
    <div className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="text-xs text-slate-500 dark:text-slate-400">Calories</div>
          <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
            <Flame size={16} className="text-red-500 dark:text-red-400" />
            {/* Only show the numeric value */}
            {plan.nutritionSummary.calories}
          </div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="text-xs text-slate-500 dark:text-slate-400">Protein</div>
          <div className="font-semibold text-slate-800 dark:text-slate-100">
            {/* Only show the numeric value */}
            {plan.nutritionSummary.protein}
          </div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="text-xs text-slate-500 dark:text-slate-400">Carbs</div>
          <div className="font-semibold text-slate-800 dark:text-slate-100">
            {/* Only show the numeric value */}
            {plan.nutritionSummary.carbs}
          </div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="text-xs text-slate-500 dark:text-slate-400">Fat</div>
          <div className="font-semibold text-slate-800 dark:text-slate-100">
            {/* Only show the numeric value */}
            {plan.nutritionSummary.fat}
          </div>
        </div>
      </div>
    </div>
  </div>
)}
            
            {/* Adherence Summary */}
            <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-4 md:pt-0 md:pl-6">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Plan Adherence</h4>
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-400 text-sm">Overall progress</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{calculateAdherence()}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 dark:bg-green-600 rounded-full transition-all duration-300"
                    style={{ width: `${calculateAdherence()}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {plan.weekPlan.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => toggleDayCompleted(index)}
                    className={`p-1 rounded-md flex flex-col items-center justify-center text-xs
                      ${adherenceData.dayAdherence[index]?.completed 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                  >
                    <span>Day</span>
                    <span className="font-medium">{index + 1}</span>
                    {adherenceData.dayAdherence[index]?.completed && (
                      <CheckCircle size={12} className="mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Day Selection Tabs */}
      <div className="flex overflow-x-auto no-scrollbar mb-4 border-b border-slate-200 dark:border-slate-700">
        {plan.weekPlan.map((day, index) => (
          <button
            key={index}
            onClick={() => setActiveDay(index)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1
              ${index === activeDay
                ? 'text-red-500 dark:text-red-400 border-b-2 border-red-500 dark:border-red-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            {adherenceData.dayAdherence[index]?.completed && (
              <CheckCircle size={14} className="text-green-500 dark:text-green-400" />
            )}
            Day {index + 1}
          </button>
        ))}
      </div>
      
      {/* Active Day Meal Plan */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-slate-800 dark:text-slate-100">
            {plan.weekPlan[activeDay].day}
          </h3>
          <button
            onClick={() => toggleDayCompleted(activeDay)}
            className={`text-xs px-3 py-1 rounded-full flex items-center gap-1
              ${adherenceData.dayAdherence[activeDay]?.completed
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
          >
            {adherenceData.dayAdherence[activeDay]?.completed ? (
              <>
                <CheckCircle size={12} />
                Completed
              </>
            ) : (
              'Mark as Completed'
            )}
          </button>
        </div>
        
        {/* Meals List */}
        {plan.weekPlan[activeDay].meals.map((meal, mealIndex) => {
          const key = `${activeDay}-${mealIndex}`;
          return (
            <div
              key={mealIndex}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
            >
              <div 
                className={`p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-pointer
                  ${adherenceData.mealAdherence[key]?.completed
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-slate-50 dark:bg-slate-700/50'
                  }`}
                onClick={() => toggleMealExpansion(activeDay, mealIndex)}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMealCompleted(activeDay, mealIndex);
                    }}
                    className={`p-1 rounded-full
                      ${adherenceData.mealAdherence[key]?.completed 
                        ? 'text-green-500 dark:text-green-400' 
                        : 'text-slate-400 dark:text-slate-500'
                      }`}
                  >
                    <CheckCircle size={18} />
                  </button>
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">
                    {meal.mealType}: {meal.name}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddMealToDay(meal);
                    }}
                    className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    title="Add to today's log"
                  >
                    <PlusCircle size={16} />
                  </button>
                  {expandedMeals[key] ? (
                    <ChevronUp size={16} className="text-slate-500 dark:text-slate-400" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-500 dark:text-slate-400" />
                  )}
                </div>
              </div>
              
              {expandedMeals[key] && (
                <div className="p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {meal.description}
                  </p>
                  
                  <div className="text-sm mb-3">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Benefits: </span>
                    <span className="text-slate-600 dark:text-slate-400">{meal.benefits}</span>
                  </div>
                  
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ingredients:</h5>
                    <div className="flex flex-wrap gap-2">
                      {meal.ingredients.map((ingredient, i) => (
                        <span 
                          key={i}
                          className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {meal.instructions && (
                    <div className="mb-2">
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instructions:</h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {meal.instructions}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => handleAddMealToDay(meal)}
                      className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg flex items-center gap-1.5 hover:bg-red-600 transition-colors"
                    >
                      <PlusCircle size={14} />
                      Add to Today's Log
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Nutritional Tips */}
      {plan.tips && plan.tips.length > 0 && (
        <div className="mt-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <Info size={16} className="text-blue-500 dark:text-blue-400" />
            <h3 className="font-medium text-slate-800 dark:text-slate-100">Tips & Recommendations</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-2">
              {plan.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-red-500 dark:text-red-400">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanViewer;