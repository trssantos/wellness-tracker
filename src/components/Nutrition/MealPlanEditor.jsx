import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, PlusCircle, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';

const MealPlanEditor = ({ plan, onClose, onSave }) => {
  const [editedPlan, setEditedPlan] = useState(null);
  const [expandedDay, setExpandedDay] = useState(0);
  const [expandedMeals, setExpandedMeals] = useState({});
  
  // Initialize form with plan data
  useEffect(() => {
    if (plan) {
      setEditedPlan(JSON.parse(JSON.stringify(plan))); // Deep clone
      
      // Initialize expanded state
      const expanded = {};
      plan.weekPlan.forEach((day, dayIndex) => {
        day.meals.forEach((_, mealIndex) => {
          expanded[`${dayIndex}-${mealIndex}`] = false;
        });
      });
      setExpandedMeals(expanded);
    }
  }, [plan]);
  
  if (!editedPlan) return null;
  
  // Toggle meal expansion
  const toggleMealExpansion = (dayIndex, mealIndex) => {
    const key = `${dayIndex}-${mealIndex}`;
    setExpandedMeals(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Update meal field
  const updateMealField = (dayIndex, mealIndex, field, value) => {
    const updatedPlan = { ...editedPlan };
    updatedPlan.weekPlan[dayIndex].meals[mealIndex][field] = value;
    setEditedPlan(updatedPlan);
  };
  
  // Update ingredient
  const updateIngredient = (dayIndex, mealIndex, ingredientIndex, value) => {
    const updatedPlan = { ...editedPlan };
    updatedPlan.weekPlan[dayIndex].meals[mealIndex].ingredients[ingredientIndex] = value;
    setEditedPlan(updatedPlan);
  };
  
  // Add ingredient
  const addIngredient = (dayIndex, mealIndex) => {
    const updatedPlan = { ...editedPlan };
    updatedPlan.weekPlan[dayIndex].meals[mealIndex].ingredients.push('');
    setEditedPlan(updatedPlan);
  };
  
  // Remove ingredient
  const removeIngredient = (dayIndex, mealIndex, ingredientIndex) => {
    const updatedPlan = { ...editedPlan };
    updatedPlan.weekPlan[dayIndex].meals[mealIndex].ingredients.splice(ingredientIndex, 1);
    setEditedPlan(updatedPlan);
  };
  
  // Add a new meal to a day
  const addMeal = (dayIndex) => {
    const updatedPlan = { ...editedPlan };
    const newMeal = {
      mealType: "Snack",
      name: "New Meal",
      description: "",
      benefits: "",
      ingredients: [""],
      instructions: ""
    };
    updatedPlan.weekPlan[dayIndex].meals.push(newMeal);
    setEditedPlan(updatedPlan);
    
    // Set the new meal to be expanded
    const newMealIndex = updatedPlan.weekPlan[dayIndex].meals.length - 1;
    setExpandedMeals(prev => ({
      ...prev,
      [`${dayIndex}-${newMealIndex}`]: true
    }));
  };
  
  // Remove a meal
  const removeMeal = (dayIndex, mealIndex) => {
    const updatedPlan = { ...editedPlan };
    updatedPlan.weekPlan[dayIndex].meals.splice(mealIndex, 1);
    setEditedPlan(updatedPlan);
    
    // Update expanded meals
    const newExpandedMeals = { ...expandedMeals };
    delete newExpandedMeals[`${dayIndex}-${mealIndex}`];
    
    // Adjust keys for meals after the removed one
    Object.keys(newExpandedMeals).forEach(key => {
      const [day, meal] = key.split('-').map(Number);
      if (day === dayIndex && meal > mealIndex) {
        newExpandedMeals[`${day}-${meal-1}`] = newExpandedMeals[key];
        delete newExpandedMeals[key];
      }
    });
    
    setExpandedMeals(newExpandedMeals);
  };
  
  // Update nutrition summary field
  const updateNutritionField = (field, value) => {
    const updatedPlan = { ...editedPlan };
    if (!updatedPlan.nutritionSummary) {
      updatedPlan.nutritionSummary = {};
    }
    updatedPlan.nutritionSummary[field] = value;
    setEditedPlan(updatedPlan);
  };
  
  // Update tip
  const updateTip = (index, value) => {
    const updatedPlan = { ...editedPlan };
    if (!updatedPlan.tips) {
      updatedPlan.tips = [];
    }
    updatedPlan.tips[index] = value;
    setEditedPlan(updatedPlan);
  };
  
  // Add tip
  const addTip = () => {
    const updatedPlan = { ...editedPlan };
    if (!updatedPlan.tips) {
      updatedPlan.tips = [];
    }
    updatedPlan.tips.push('');
    setEditedPlan(updatedPlan);
  };
  
  // Remove tip
  const removeTip = (index) => {
    const updatedPlan = { ...editedPlan };
    updatedPlan.tips.splice(index, 1);
    setEditedPlan(updatedPlan);
  };
  
  // Save the meal plan
  const handleSave = () => {
    onSave(editedPlan);
  };
  
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
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">
            Edit Meal Plan
          </h2>
        </div>
        
        <button
          onClick={handleSave}
          className="px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1.5"
        >
          <Save size={16} />
          Save Plan
        </button>
      </div>
      
      {/* Nutrition Summary */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-6">
        <div className="bg-red-50 dark:bg-red-900/30 p-3 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-medium text-slate-800 dark:text-slate-100">Nutrition Summary</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['calories', 'protein', 'carbs', 'fat'].map(field => (
              <div key={field} className="space-y-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">
                  {field}
                </label>
                <input
                  type="text"
                  value={editedPlan.nutritionSummary?.[field] || ''}
                  onChange={(e) => updateNutritionField(field, e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  placeholder={`Enter ${field}...`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Day Tabs */}
      <div className="flex overflow-x-auto no-scrollbar mb-4 border-b border-slate-200 dark:border-slate-700">
        {editedPlan.weekPlan.map((day, index) => (
          <button
            key={index}
            onClick={() => setExpandedDay(index)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap
              ${index === expandedDay
                ? 'text-red-500 dark:text-red-400 border-b-2 border-red-500 dark:border-red-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            Day {index + 1}
          </button>
        ))}
      </div>
      
      {/* Active Day Meal Plan */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-slate-800 dark:text-slate-100">
            {editedPlan.weekPlan[expandedDay].day}
          </h3>
          <button
            onClick={() => addMeal(expandedDay)}
            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1.5 text-sm"
          >
            <PlusCircle size={14} />
            Add Meal
          </button>
        </div>
        
        {/* Meals List */}
        {editedPlan.weekPlan[expandedDay].meals.map((meal, mealIndex) => {
          const key = `${expandedDay}-${mealIndex}`;
          return (
            <div
              key={mealIndex}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
            >
              <div 
                className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-pointer bg-slate-50 dark:bg-slate-700/50"
                onClick={() => toggleMealExpansion(expandedDay, mealIndex)}
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">
                    {meal.mealType}: {meal.name}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMeal(expandedDay, mealIndex);
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  {expandedMeals[key] ? (
                    <ChevronUp size={16} className="text-slate-500 dark:text-slate-400" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-500 dark:text-slate-400" />
                  )}
                </div>
              </div>
              
              {expandedMeals[key] && (
                <div className="p-4 space-y-4">
                  {/* Meal Type and Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Meal Type
                      </label>
                      <input
                        type="text"
                        value={meal.mealType}
                        onChange={(e) => updateMealField(expandedDay, mealIndex, 'mealType', e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                        placeholder="Enter meal type..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Meal Name
                      </label>
                      <input
                        type="text"
                        value={meal.name}
                        onChange={(e) => updateMealField(expandedDay, mealIndex, 'name', e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                        placeholder="Enter meal name..."
                      />
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Description
                    </label>
                    <textarea
                      value={meal.description}
                      onChange={(e) => updateMealField(expandedDay, mealIndex, 'description', e.target.value)}
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      placeholder="Enter meal description..."
                      rows="2"
                    />
                  </div>
                  
                  {/* Benefits */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Nutritional Benefits
                    </label>
                    <input
                      type="text"
                      value={meal.benefits}
                      onChange={(e) => updateMealField(expandedDay, mealIndex, 'benefits', e.target.value)}
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      placeholder="Enter nutritional benefits..."
                    />
                  </div>
                  
                  {/* Ingredients */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Ingredients
                      </label>
                      <button
                        type="button"
                        onClick={() => addIngredient(expandedDay, mealIndex)}
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        <PlusCircle size={12} />
                        Add
                      </button>
                    </div>
                    
                    {meal.ingredients.map((ingredient, ingredientIndex) => (
                      <div key={ingredientIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={ingredient}
                          onChange={(e) => updateIngredient(expandedDay, mealIndex, ingredientIndex, e.target.value)}
                          className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                          placeholder={`Ingredient ${ingredientIndex + 1}...`}
                        />
                        <button
                          type="button"
                          onClick={() => removeIngredient(expandedDay, mealIndex, ingredientIndex)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Instructions */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Instructions
                    </label>
                    <textarea
                      value={meal.instructions}
                      onChange={(e) => updateMealField(expandedDay, mealIndex, 'instructions', e.target.value)}
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      placeholder="Enter cooking instructions..."
                      rows="3"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Tips */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-medium text-slate-800 dark:text-slate-100">Tips & Recommendations</h3>
          <button
            onClick={addTip}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
          >
            <PlusCircle size={12} />
            Add Tip
          </button>
        </div>
        <div className="p-4 space-y-3">
          {editedPlan.tips && editedPlan.tips.map((tip, index) => (
            <div key={index} className="flex gap-2">
              <textarea
                value={tip}
                onChange={(e) => updateTip(index, e.target.value)}
                className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                placeholder={`Tip ${index + 1}...`}
                rows="2"
              />
              <button
                type="button"
                onClick={() => removeTip(index)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          
          {(!editedPlan.tips || editedPlan.tips.length === 0) && (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              No tips added yet. Click "Add Tip" to include nutritional or preparation recommendations.
            </div>
          )}
        </div>
      </div>
      
      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Check size={18} />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default MealPlanEditor;