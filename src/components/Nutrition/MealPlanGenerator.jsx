import React, { useState } from 'react';
import { ArrowLeft, Brain, Save, Loader, Info, Check, Target, Flame, ChevronUp, ChevronDown } from 'lucide-react';
import { generateContent } from '../../utils/ai-service';
import { getStorage, setStorage } from '../../utils/storage';

const MealPlanGenerator = ({ onClose, onSaveMealPlan }) => {
  const [formData, setFormData] = useState({
    weight: '',
    weightUnit: 'kg',
    height: '',
    heightUnit: 'cm',
    age: '',
    gender: '',
    activityLevel: 'moderate',
    goal: 'maintain',
    allergies: '',
    preferences: '',
    excludedFoods: '',
    mealCount: '3',
    cuisinePreference: '', // New field
    healthConditions: '', // New field
    dietType: 'balanced', // New field with default
    planDuration: '7', // New field with default
    mealPrepTime: 'moderate', // New field with default
  });
  
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [error, setError] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Create an improved AI prompt with more detailed instructions
      const prompt = `Generate a detailed, personalized meal plan based on the following information:
      
      Basic Information:
      - Weight: ${formData.weight} ${formData.weightUnit}
      - Height: ${formData.height} ${formData.heightUnit}
      - Age: ${formData.age}
      - Gender: ${formData.gender}
      - Activity Level: ${formData.activityLevel}
      - Weight Goal: ${formData.goal}
      
      Dietary Preferences:
      - Diet Type: ${formData.dietType}
      - Cuisine Preference: ${formData.cuisinePreference || "No specific preference"}
      - Allergies/Intolerances: ${formData.allergies || "None"}
      - Food Preferences: ${formData.preferences || "No specific preferences"}
      - Excluded Foods: ${formData.excludedFoods || "None"}
      - Health Conditions: ${formData.healthConditions || "None"}
      
      Meal Plan Structure:
      - Duration: ${formData.planDuration} days
      - Meals per Day: ${formData.mealCount}
      - Meal Prep Time: ${formData.mealPrepTime}
      
      IMPORTANT FORMATTING REQUIREMENTS:
      1. Keep all meal names SHORT and CONCISE (under 30 characters)
      2. For nutritional summary, provide ONLY numbers with units:
         - calories: "1800 kcal" (just the number and unit)
         - protein: "90g" (just the number and unit)
         - carbs: "220g" (just the number and unit)
         - fat: "60g" (just the number and unit)
      
      Please create a comprehensive ${formData.planDuration}-day meal plan that:
      1. Reflects the user's dietary preferences and restrictions
      2. Provides appropriate caloric intake for their goals
      3. Includes a variety of nutrient-dense foods
      4. Is practical to prepare given their time constraints
      5. Includes specific nutritional benefits for each meal
      6. Offers simple preparation instructions where appropriate
      
      For each day and meal, provide:
      1. The meal type (breakfast, lunch, dinner, snack)
      2. A short, descriptive meal name (keep it brief!)
      3. A brief description of the meal
      4. Specific nutritional benefits
      5. A detailed list of ingredients
      6. Simple preparation instructions
      7. A list of food categories the meal belongs to (e.g., "Proteins", "Vegetables", "Whole Foods", "High Protein", etc.)
      
      Format the response as JSON with the following structure:
      {
        "weekPlan": [
          {
            "day": "Day 1",
            "meals": [
              {
                "mealType": "Breakfast",
                "name": "Meal name",
                "description": "Brief description",
                "benefits": "Key nutritional benefits",
                "ingredients": ["ingredient1", "ingredient2", "..."],
                "instructions": "Simple preparation",
                "categories": ["category1", "category2", "..."]
              }
            ]
          }
        ],
        "nutritionSummary": {
          "calories": "1800 kcal",
          "protein": "90g", 
          "carbs": "220g",
          "fat": "60g"
        },
        "tips": ["tip1", "tip2", "..."]
      }`;

      // Call the AI service
      const response = await generateContent(prompt);
      
      // Parse the JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const plan = JSON.parse(jsonMatch[0]);
        setGeneratedPlan(plan);
      } else {
        throw new Error("Failed to parse meal plan from AI response");
      }
    } catch (err) {
      console.error("Error generating meal plan:", err);
      setError("Failed to generate meal plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSaveMealPlan = () => {
    if (generatedPlan) {
      // Include user's goals and preferences in the plan for reference
      const enhancedPlan = {
        ...generatedPlan,
        userPreferences: {
          weight: formData.weight,
          weightUnit: formData.weightUnit,
          height: formData.height,
          heightUnit: formData.heightUnit,
          age: formData.age,
          gender: formData.gender,
          activityLevel: formData.activityLevel,
          goal: formData.goal,
          dietType: formData.dietType,
          allergies: formData.allergies,
          cuisinePreference: formData.cuisinePreference,
          mealCount: formData.mealCount,
          created: new Date().toISOString()
        }
      };
      
      onSaveMealPlan(enhancedPlan);
    }
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
          AI Meal Plan Generator
        </h2>
      </div>
      
      {!generatedPlan ? (
        // Meal plan form
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-600 dark:text-slate-300">
                <p className="font-medium text-slate-700 dark:text-slate-200 mb-1">
                  Smart Meal Planning
                </p>
                <p>
                  Our AI will generate a personalized meal plan based on your goals, preferences, and dietary needs. The more information you provide, the more tailored your plan will be.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Body Information</h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="weight" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Weight
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="w-full p-2 border-l border-y border-slate-300 dark:border-slate-600 rounded-l-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                        placeholder="Enter weight"
                      />
                      <select
                        name="weightUnit"
                        value={formData.weightUnit}
                        onChange={handleInputChange}
                        className="p-2 border border-slate-300 dark:border-slate-600 rounded-r-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      >
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="height" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Height
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        id="height"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        className="w-full p-2 border-l border-y border-slate-300 dark:border-slate-600 rounded-l-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                        placeholder="Enter height"
                      />
                      <select
                        name="heightUnit"
                        value={formData.heightUnit}
                        onChange={handleInputChange}
                        className="p-2 border border-slate-300 dark:border-slate-600 rounded-r-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      >
                        <option value="cm">cm</option>
                        <option value="ft">ft</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="age" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      placeholder="Enter age"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="gender" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Goals and Activity */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Goals & Activity</h3>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="activityLevel" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Activity Level
                  </label>
                  <select
                    id="activityLevel"
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="sedentary">Sedentary (little or no exercise)</option>
                    <option value="light">Light (exercise 1-3 days/week)</option>
                    <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                    <option value="active">Active (exercise 6-7 days/week)</option>
                    <option value="veryActive">Very Active (hard exercise daily)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="goal" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Weight Goal
                  </label>
                  <select
                    id="goal"
                    name="goal"
                    value={formData.goal}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="lose">Weight Loss</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain">Gain Weight/Muscle</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="dietType" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Diet Type
                  </label>
                  <select
                    id="dietType"
                    name="dietType"
                    value={formData.dietType}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="balanced">Balanced/Standard</option>
                    <option value="highProtein">High Protein</option>
                    <option value="lowCarb">Low Carb</option>
                    <option value="keto">Ketogenic</option>
                    <option value="paleo">Paleo</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="mediterranean">Mediterranean</option>
                    <option value="dairyFree">Dairy Free</option>
                    <option value="glutenFree">Gluten Free</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Meal Plan Structure */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Meal Plan Structure</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="planDuration" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Plan Duration
                </label>
                <select
                  id="planDuration"
                  name="planDuration"
                  value={formData.planDuration}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="3">3 days</option>
                  <option value="5">5 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="mealCount" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Meals per Day
                </label>
                <select
                  id="mealCount"
                  name="mealCount"
                  value={formData.mealCount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="3">3 meals</option>
                  <option value="4">3 meals + 1 snack</option>
                  <option value="5">3 meals + 2 snacks</option>
                  <option value="6">6 small meals</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="mealPrepTime" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Meal Prep Time
                </label>
                <select
                  id="mealPrepTime"
                  name="mealPrepTime"
                  value={formData.mealPrepTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="quick">Quick (under 15 min)</option>
                  <option value="moderate">Moderate (15-30 min)</option>
                  <option value="extended">Extended (30+ min)</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Advanced Options Toggle */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <button
              type="button"
              onClick={() => setAdvancedOptions(!advancedOptions)}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
            >
              {advancedOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {advancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </button>
          </div>
          
          {/* Advanced Dietary Preferences - only shown when expanded */}
          {advancedOptions && (
            <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Advanced Dietary Preferences</h3>
              
              <div>
                <label htmlFor="allergies" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Allergies & Intolerances
                </label>
                <input
                  type="text"
                  id="allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  placeholder="e.g., dairy, gluten, nuts, shellfish"
                />
              </div>
              
              <div>
                <label htmlFor="cuisinePreference" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Cuisine Preferences
                </label>
                <input
                  type="text"
                  id="cuisinePreference"
                  name="cuisinePreference"
                  value={formData.cuisinePreference}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  placeholder="e.g., Mediterranean, Asian, Mexican"
                />
              </div>
              
              <div>
                <label htmlFor="preferences" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Food Preferences
                </label>
                <input
                  type="text"
                  id="preferences"
                  name="preferences"
                  value={formData.preferences}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  placeholder="e.g., high-protein, low-sugar, plant-based"
                />
              </div>
              
              <div>
                <label htmlFor="excludedFoods" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Foods to Avoid
                </label>
                <input
                  type="text"
                  id="excludedFoods"
                  name="excludedFoods"
                  value={formData.excludedFoods}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  placeholder="e.g., red meat, processed foods, soy"
                />
              </div>
              
              <div>
                <label htmlFor="healthConditions" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Health Conditions
                </label>
                <input
                  type="text"
                  id="healthConditions"
                  name="healthConditions"
                  value={formData.healthConditions}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  placeholder="e.g., diabetes, hypertension, IBS"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Note: Always consult with healthcare professionals for medical dietary advice.
                </p>
              </div>
            </div>
          )}
          
          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 
              ${isGenerating ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600' : 
                'bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700'}`}
          >
            {isGenerating ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>Generating Meal Plan...</span>
              </>
            ) : (
              <>
                <Brain size={18} />
                <span>Generate Personalized Meal Plan</span>
              </>
            )}
          </button>
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      ) : (
        // Generated Meal Plan Display
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
            <div className="flex items-start gap-3">
              <Check size={20} className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-600 dark:text-slate-300">
                <p className="font-medium text-slate-700 dark:text-slate-200 mb-1">
                  Your Personalized Meal Plan Is Ready
                </p>
                <p>
                  Based on your information, we've created a custom meal plan designed to help you reach your goals. 
                  Review the plan below before saving it.
                </p>
              </div>
            </div>
          </div>
          
          {/* Nutrition Summary */}
          {generatedPlan.nutritionSummary && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-red-50 dark:bg-red-900/30 p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Daily Nutrition Targets</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Daily Calories</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                      <Flame size={16} className="text-red-500 dark:text-red-400" />
                      {generatedPlan.nutritionSummary.calories}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Protein</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{generatedPlan.nutritionSummary.protein}</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Carbs</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{generatedPlan.nutritionSummary.carbs}</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Fat</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{generatedPlan.nutritionSummary.fat}</div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Nutrition Distribution</div>
                  <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                    {/* Simplified macro distribution visualization */}
                    <div className="bg-red-500 h-full" style={{ width: '25%' }}></div>
                    <div className="bg-blue-500 h-full" style={{ width: '45%' }}></div>
                    <div className="bg-green-500 h-full" style={{ width: '30%' }}></div>
                  </div>
                  <div className="flex text-xs justify-between mt-1">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                      <span className="text-slate-500 dark:text-slate-400">Protein</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      <span className="text-slate-500 dark:text-slate-400">Carbs</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      <span className="text-slate-500 dark:text-slate-400">Fat</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Sample of the meal plan */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-medium text-slate-800 dark:text-slate-100">Sample Day (Day 1)</h3>
            </div>
            <div className="p-4 space-y-4">
              {generatedPlan.weekPlan[0].meals.slice(0, 3).map((meal, index) => (
                <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium text-slate-700 dark:text-slate-300">
                      {meal.mealType}: {meal.name}
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{meal.description}</p>
                  
                  <div className="text-xs mb-2">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Benefits: </span>
                    <span className="text-slate-600 dark:text-slate-400">{meal.benefits}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {meal.ingredients.slice(0, 5).map((ingredient, i) => (
                      <span key={i} className="text-xs bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                        {ingredient}
                      </span>
                    ))}
                    {meal.ingredients.length > 5 && (
                      <span className="text-xs bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                        +{meal.ingredients.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 border-t border-slate-200 dark:border-slate-700 text-center text-sm">
              <p className="text-slate-600 dark:text-slate-400">
                The full plan contains {generatedPlan.weekPlan.length} days with {generatedPlan.weekPlan.reduce((sum, day) => sum + day.meals.length, 0)} total meals.
              </p>
            </div>
          </div>
          
          {/* Tips Preview */}
          {generatedPlan.tips && generatedPlan.tips.length > 0 && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-green-50 dark:bg-green-900/30 p-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-medium text-slate-800 dark:text-slate-100">Nutrition Tips</h3>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {generatedPlan.tips.slice(0, 3).map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-green-500 dark:text-green-400">•</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{tip}</span>
                    </div>
                  ))}
                  {generatedPlan.tips.length > 3 && (
                    <div className="text-sm text-blue-500 dark:text-blue-400">
                      +{generatedPlan.tips.length - 3} more tips included in the full plan
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setGeneratedPlan(null)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Go Back & Edit
            </button>
            
            <button
              onClick={handleSaveMealPlan}
              className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 flex items-center gap-2"
            >
              <Save size={18} />
              Save Meal Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanGenerator;