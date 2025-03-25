import React, { useState } from 'react';
import { ArrowLeft, Save, PlusCircle, Trash2, Calendar, ChevronDown, ChevronUp, Tag, Search, AlertTriangle } from 'lucide-react';

const ManualMealPlanCreator = ({ onClose, onSave }) => {
  const [mealPlan, setMealPlan] = useState({
    weekPlan: [{ day: 'Day 1', meals: [] }], // Start with just 1 day
    nutritionSummary: {
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    },
    tips: ['']
  });
  
  const [activeDay, setActiveDay] = useState(0);
  const [expandedMeals, setExpandedMeals] = useState({});
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  
  // Map of food categories to icons
  const categoryIcons = {
    'Fruits': '🍎',
    'Vegetables': '🥦',
    'Proteins': '🥩',
    'Dairy': '🥛',
    'Grains': '🍞',
    'Legumes': '🫘',
    'Nuts & Seeds': '🥜',
    'Seafood': '🐟',
    'Poultry': '🍗',
    'Red Meat': '🥩',
    'Eggs': '🥚',
    'Sweets': '🍫',
    'Beverages': '☕',
    'Snacks': '🥨',
    'Fast Food': '🍔',
    'Home Cooked': '🍲',
    'Breakfast Foods': '🥞',
    'Soups': '🍜',
    'Salads': '🥗',
    'High Protein': '💪',
    'Low Carb': '🥑',
    'Keto': '🥓',
    'Vegan': '🌱',
    'Vegetarian': '🥬',
    'Gluten Free': '🌾',
    'Dairy Free': '🥥',
    'Whole Foods': '🌽',
    'Processed Foods': '🥫',
    'Fermented': '🧀',
    'Planned Meal': '📝'
  };
  
  // Add a new day
  const handleAddDay = () => {
    if (mealPlan.weekPlan.length >= 7) return; // Max 7 days
    
    const updatedPlan = { ...mealPlan };
    const newDayIndex = updatedPlan.weekPlan.length + 1;
    updatedPlan.weekPlan.push({
      day: `Day ${newDayIndex}`,
      meals: []
    });
    
    setMealPlan(updatedPlan);
    setActiveDay(newDayIndex - 1); // Switch to the new day
  };
  
  // Remove a day
  const handleRemoveDay = (dayIndex) => {
    if (mealPlan.weekPlan.length <= 1) return; // Need at least 1 day
    
    const updatedPlan = { ...mealPlan };
    updatedPlan.weekPlan.splice(dayIndex, 1);
    
    // Update day names to maintain order
    updatedPlan.weekPlan.forEach((day, index) => {
      day.day = `Day ${index + 1}`;
    });
    
    // Update expanded meals state
    const newExpandedMeals = {};
    Object.keys(expandedMeals).forEach(key => {
      const [day, meal] = key.split('-').map(Number);
      if (day < dayIndex) {
        newExpandedMeals[key] = expandedMeals[key];
      } else if (day > dayIndex) {
        newExpandedMeals[`${day-1}-${meal}`] = expandedMeals[key];
      }
    });
    
    setMealPlan(updatedPlan);
    setExpandedMeals(newExpandedMeals);
    
    // If active day was removed or is now out of bounds, set to the last day
    if (activeDay >= updatedPlan.weekPlan.length) {
      setActiveDay(updatedPlan.weekPlan.length - 1);
    }
  };
  
  // Toggle meal expansion
  const toggleMealExpansion = (dayIndex, mealIndex) => {
    const key = `${dayIndex}-${mealIndex}`;
    setExpandedMeals(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Update nutrition summary
  const handleNutritionChange = (field, value) => {
    setMealPlan(prev => ({
      ...prev,
      nutritionSummary: {
        ...prev.nutritionSummary,
        [field]: value
      }
    }));
  };
  
  // Add a new meal to a day
  const handleAddMeal = (dayIndex) => {
    const updatedPlan = { ...mealPlan };
    const newMeal = {
      mealType: "Breakfast",
      name: "New Meal",
      description: "",
      benefits: "",
      ingredients: [""],
      instructions: "",
      categories: ["Planned Meal"]
    };
    updatedPlan.weekPlan[dayIndex].meals.push(newMeal);
    setMealPlan(updatedPlan);
    
    // Set the new meal to be expanded
    const newMealIndex = updatedPlan.weekPlan[dayIndex].meals.length - 1;
    setExpandedMeals(prev => ({
      ...prev,
      [`${dayIndex}-${newMealIndex}`]: true
    }));
  };
  
  // Remove a meal
  const handleRemoveMeal = (dayIndex, mealIndex) => {
    const updatedPlan = { ...mealPlan };
    updatedPlan.weekPlan[dayIndex].meals.splice(mealIndex, 1);
    setMealPlan(updatedPlan);
    
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
  
  // Update meal field
  const handleMealFieldChange = (dayIndex, mealIndex, field, value) => {
    const updatedPlan = { ...mealPlan };
    updatedPlan.weekPlan[dayIndex].meals[mealIndex][field] = value;
    setMealPlan(updatedPlan);
  };
  
  // Update ingredient
  const handleIngredientChange = (dayIndex, mealIndex, ingredientIndex, value) => {
    const updatedPlan = { ...mealPlan };
    updatedPlan.weekPlan[dayIndex].meals[mealIndex].ingredients[ingredientIndex] = value;
    setMealPlan(updatedPlan);
  };
  
  // Add ingredient
  const handleAddIngredient = (dayIndex, mealIndex) => {
    const updatedPlan = { ...mealPlan };
    updatedPlan.weekPlan[dayIndex].meals[mealIndex].ingredients.push('');
    setMealPlan(updatedPlan);
  };
  
  // Remove ingredient
  const handleRemoveIngredient = (dayIndex, mealIndex, ingredientIndex) => {
    const updatedPlan = { ...mealPlan };
    updatedPlan.weekPlan[dayIndex].meals[mealIndex].ingredients.splice(ingredientIndex, 1);
    setMealPlan(updatedPlan);
  };
  
  // Toggle category
  const handleCategoryToggle = (dayIndex, mealIndex, category) => {
    const updatedPlan = { ...mealPlan };
    const meal = updatedPlan.weekPlan[dayIndex].meals[mealIndex];
    
    if (!meal.categories) {
      meal.categories = [];
    }
    
    if (meal.categories.includes(category)) {
      meal.categories = meal.categories.filter(c => c !== category);
    } else {
      meal.categories.push(category);
    }
    
    setMealPlan(updatedPlan);
  };
  
  // Add custom category
  const handleAddCustomCategory = (dayIndex, mealIndex) => {
    if (!newCategory.trim()) return;
    
    // Add to custom categories if not already there
    if (!customCategories.includes(newCategory.trim()) && !categoryIcons[newCategory.trim()]) {
      setCustomCategories([...customCategories, newCategory.trim()]);
    }
    
    // Add to meal categories
    handleCategoryToggle(dayIndex, mealIndex, newCategory.trim());
    setNewCategory('');
  };
  
  // Update tip
  const handleTipChange = (tipIndex, value) => {
    const updatedPlan = { ...mealPlan };
    updatedPlan.tips[tipIndex] = value;
    setMealPlan(updatedPlan);
  };
  
  // Add tip
  const handleAddTip = () => {
    const updatedPlan = { ...mealPlan };
    updatedPlan.tips.push('');
    setMealPlan(updatedPlan);
  };
  
  // Remove tip
  const handleRemoveTip = (tipIndex) => {
    const updatedPlan = { ...mealPlan };
    updatedPlan.tips.splice(tipIndex, 1);
    setMealPlan(updatedPlan);
  };
  
  // Validate the meal plan
  const validateMealPlan = () => {
    const errors = [];
    
    // Check if there's at least one meal in the plan
    const hasMeals = mealPlan.weekPlan.some(day => day.meals.length > 0);
    if (!hasMeals) {
      errors.push("Add at least one meal to your plan");
    }
    
    // Check nutrition summary
    const nutritionSummary = mealPlan.nutritionSummary;
    if (!nutritionSummary.calories || !nutritionSummary.protein || 
        !nutritionSummary.carbs || !nutritionSummary.fat) {
      errors.push("Complete all nutrition summary fields");
    }
    
    // Check for empty meal names or missing ingredients
    let emptyMealName = false;
    let emptyIngredients = false;
    
    mealPlan.weekPlan.forEach(day => {
      day.meals.forEach(meal => {
        if (!meal.name.trim()) {
          emptyMealName = true;
        }
        
        // Check if all ingredients are filled
        if (meal.ingredients.some(ing => !ing.trim())) {
          emptyIngredients = true;
        }
      });
    });
    
    if (emptyMealName) {
      errors.push("All meals must have a name");
    }
    
    if (emptyIngredients) {
      errors.push("Fill in all ingredient fields or remove empty ones");
    }
    
    // Ensure there's at least one tip
    if (!mealPlan.tips.some(tip => tip.trim())) {
      errors.push("Add at least one nutrition tip");
    }
    
    return errors;
  };
  
  // Handle save
  const handleSave = () => {
    // Validate the meal plan
    const errors = validateMealPlan();
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors([]);
    
    // Add creation timestamp
    const planWithTimestamp = {
      ...mealPlan,
      createdAt: new Date().toISOString()
    };
    
    onSave(planWithTimestamp);
  };
  
  // Get filtered categories
  const getFilteredCategories = (dayIndex, mealIndex) => {
    const allCategories = [...Object.keys(categoryIcons), ...customCategories];
    
    if (!categorySearchQuery.trim()) {
      return allCategories;
    }
    
    return allCategories.filter(
      category => category.toLowerCase().includes(categorySearchQuery.toLowerCase())
    );
  };
  
  // Render the category selection grid
  const renderCategoryGrid = (dayIndex, mealIndex) => {
    const meal = mealPlan.weekPlan[dayIndex].meals[mealIndex];
    const filteredCategories = getFilteredCategories(dayIndex, mealIndex);
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Categories
          </label>
        </div>
        
        {/* Category Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={categorySearchQuery}
            onChange={(e) => setCategorySearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-9 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
          />
        </div>
        
        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto pb-2">
          {filteredCategories.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryToggle(dayIndex, mealIndex, category)}
              className={`flex items-center p-2 rounded-lg border ${
                meal.categories && meal.categories.includes(category)
                  ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-xl mr-2">{categoryIcons[category] || '🏷️'}</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-left leading-tight">{category}</span>
            </button>
          ))}
        </div>
        
        {/* Custom Category Input */}
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Add custom category..."
            className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
          />
          <button
            type="button"
            onClick={() => handleAddCustomCategory(dayIndex, mealIndex)}
            className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
          >
            <PlusCircle size={20} />
          </button>
        </div>
        
        {/* Selected Categories Pills */}
        {meal.categories && meal.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {meal.categories.map((category, index) => (
              <div 
                key={index} 
                className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full text-sm flex items-center gap-1"
              >
                <span>{categoryIcons[category] || '🏷️'}</span>
                <span>{category}</span>
                <button
                  type="button"
                  onClick={() => handleCategoryToggle(dayIndex, mealIndex, category)}
                  className="ml-1 text-red-500 hover:text-red-700 dark:hover:text-red-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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
            Create Meal Plan
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
      
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-700 dark:text-red-400 mb-1">
                Please fix the following issues:
              </h3>
              <ul className="list-disc pl-5 text-sm text-red-600 dark:text-red-300 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Nutrition Summary */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-6">
        <div className="bg-red-50 dark:bg-red-900/30 p-3 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-medium text-slate-800 dark:text-slate-100">Daily Nutrition Targets</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Calories
              </label>
              <input
                type="text"
                value={mealPlan.nutritionSummary.calories}
                onChange={(e) => handleNutritionChange('calories', e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                placeholder="e.g., 1800 kcal"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Protein
              </label>
              <input
                type="text"
                value={mealPlan.nutritionSummary.protein}
                onChange={(e) => handleNutritionChange('protein', e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                placeholder="e.g., 90g"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Carbs
              </label>
              <input
                type="text"
                value={mealPlan.nutritionSummary.carbs}
                onChange={(e) => handleNutritionChange('carbs', e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                placeholder="e.g., 220g"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Fat
              </label>
              <input
                type="text"
                value={mealPlan.nutritionSummary.fat}
                onChange={(e) => handleNutritionChange('fat', e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                placeholder="e.g., 60g"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Day Management */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {mealPlan.weekPlan.length} day{mealPlan.weekPlan.length > 1 ? 's' : ''} in plan (max 7)
        </div>
        <button
          onClick={handleAddDay}
          disabled={mealPlan.weekPlan.length >= 7}
          className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1.5
            ${mealPlan.weekPlan.length >= 7
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 transition-colors'
            }`}
        >
          <PlusCircle size={14} />
          Add Day
        </button>
      </div>
      
      {/* Day Selection Tabs */}
      <div className="flex overflow-x-auto no-scrollbar mb-4 border-b border-slate-200 dark:border-slate-700">
        {mealPlan.weekPlan.map((day, index) => (
          <div 
            key={index}
            className="relative"
          >
            <button
              onClick={() => setActiveDay(index)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap
                ${index === activeDay
                  ? 'text-red-500 dark:text-red-400 border-b-2 border-red-500 dark:border-red-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              Day {index + 1}
            </button>
            {mealPlan.weekPlan.length > 1 && (
              <button
                onClick={() => handleRemoveDay(index)}
                className="absolute -top-1 -right-1 p-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                title="Remove day"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Active Day Meal Plan */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-slate-800 dark:text-slate-100">
            {mealPlan.weekPlan[activeDay].day}
          </h3>
          <button
            onClick={() => handleAddMeal(activeDay)}
            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1.5 text-sm"
          >
            <PlusCircle size={14} />
            Add Meal
          </button>
        </div>
        
        {/* Meals List */}
        {mealPlan.weekPlan[activeDay].meals.length === 0 ? (
          <div className="text-center p-10 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <Calendar size={32} className="mx-auto text-slate-400 dark:text-slate-500 mb-3" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No Meals Added</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Add your first meal to this day to start building your plan.
            </p>
            <button
              onClick={() => handleAddMeal(activeDay)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors inline-flex items-center gap-2"
            >
              <PlusCircle size={16} />
              Add Meal
            </button>
          </div>
        ) : (
          mealPlan.weekPlan[activeDay].meals.map((meal, mealIndex) => {
            const key = `${activeDay}-${mealIndex}`;
            return (
              <div
                key={mealIndex}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
              >
                <div 
                  className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-pointer bg-slate-50 dark:bg-slate-700/50"
                  onClick={() => toggleMealExpansion(activeDay, mealIndex)}
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
                        handleRemoveMeal(activeDay, mealIndex);
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
                        <select
                          value={meal.mealType}
                          onChange={(e) => handleMealFieldChange(activeDay, mealIndex, 'mealType', e.target.value)}
                          className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                        >
                          <option value="Breakfast">Breakfast</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Dinner">Dinner</option>
                          <option value="Snack">Snack</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                          Meal Name
                        </label>
                        <input
                          type="text"
                          value={meal.name}
                          onChange={(e) => handleMealFieldChange(activeDay, mealIndex, 'name', e.target.value)}
                          className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                          placeholder="Enter meal name..."
                          maxLength={30}
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
                        onChange={(e) => handleMealFieldChange(activeDay, mealIndex, 'description', e.target.value)}
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
                        onChange={(e) => handleMealFieldChange(activeDay, mealIndex, 'benefits', e.target.value)}
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
                          onClick={() => handleAddIngredient(activeDay, mealIndex)}
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
                            onChange={(e) => handleIngredientChange(activeDay, mealIndex, ingredientIndex, e.target.value)}
                            className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                            placeholder={`Ingredient ${ingredientIndex + 1}...`}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(activeDay, mealIndex, ingredientIndex)}
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
                        onChange={(e) => handleMealFieldChange(activeDay, mealIndex, 'instructions', e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                        placeholder="Enter cooking instructions..."
                        rows="3"
                      />
                    </div>
                    
                    {/* Categories with Grid Selection */}
                    {renderCategoryGrid(activeDay, mealIndex)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Tips */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-medium text-slate-800 dark:text-slate-100">Tips & Recommendations</h3>
          <button
            onClick={handleAddTip}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
          >
            <PlusCircle size={12} />
            Add Tip
          </button>
        </div>
        <div className="p-4 space-y-3">
          {mealPlan.tips.map((tip, tipIndex) => (
            <div key={tipIndex} className="flex gap-2">
              <textarea
                value={tip}
                onChange={(e) => handleTipChange(tipIndex, e.target.value)}
                className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                placeholder={`Tip ${tipIndex + 1}...`}
                rows="2"
              />
              <button
                type="button"
                onClick={() => handleRemoveTip(tipIndex)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors align-self-start"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Save size={18} />
          Save Meal Plan
        </button>
      </div>
    </div>
  );
};

export default ManualMealPlanCreator;