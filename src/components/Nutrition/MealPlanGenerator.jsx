// src/components/Nutrition/MealPlanGenerator.jsx
import React, { useState } from 'react';
import { ArrowLeft, PlusCircle, Check, Utensils, Brain, CalendarCheck, Info, Loader } from 'lucide-react';
import { generateContent } from '../../utils/ai-service';

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
  });
  
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
      // Create prompt for AI
      const prompt = `Generate a personalized meal plan based on the following information:
      
Weight: ${formData.weight} ${formData.weightUnit}
Height: ${formData.height} ${formData.heightUnit}
Age: ${formData.age}
Gender: ${formData.gender}
Activity Level: ${formData.activityLevel}
Goal: ${formData.goal}
Allergies/Intolerances: ${formData.allergies || 'None'}
Food Preferences: ${formData.preferences || 'No specific preferences'}
Excluded Foods: ${formData.excludedFoods || 'None'}
Meals per Day: ${formData.mealCount}

Please create a detailed 7-day meal plan with ${formData.mealCount} meals per day.
For each meal, provide:
1. The meal name
2. A brief description
3. Key nutritional benefits
4. Main ingredients
5. Optional: Simple preparation instructions

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
          "instructions": "Simple preparation"
        }
      ]
    }
  ],
  "nutritionSummary": {
    "calories": "Approximate daily calories",
    "protein": "Approximate daily protein",
    "carbs": "Approximate daily carbs",
    "fat": "Approximate daily fat"
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
      onSaveMealPlan(generatedPlan);
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
                  How it works
                </p>
                <p>
                  Our AI will generate a personalized meal plan based on your information. You can review and customize the plan before saving it.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Basic Information</h3>
              
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
                    Goal
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
                    <option value="energy">Increase Energy</option>
                    <option value="health">Improve Overall Health</option>
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
                    <option value="4">4 meals</option>
                    <option value="5">5 meals</option>
                    <option value="6">6 meals</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Dietary Preferences */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Dietary Preferences</h3>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="allergies" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Allergies/Intolerances
                </label>
                <input
                  type="text"
                  id="allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  placeholder="e.g., dairy, gluten, nuts"
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
                  placeholder="e.g., vegetarian, mediterranean, high-protein"
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
            </div>
          </div>
          
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
                <span>Generate Meal Plan</span>
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
                  Your Personalized 7-Day Meal Plan
                </p>
                <p>
                  Based on your goals and preferences, we've created a custom meal plan. You can save this plan, or go back to adjust your preferences.
                </p>
              </div>
            </div>
          </div>
          
          {/* Nutrition Summary */}
          {generatedPlan.nutritionSummary && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-red-50 dark:bg-red-900/30 p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Nutrition Summary</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Daily Calories</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{generatedPlan.nutritionSummary.calories}</div>
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
              </div>
            </div>
          )}
          
          {/* 7-Day Meal Plan */}
          <div className="space-y-4">
            {generatedPlan.weekPlan.map((day, dayIndex) => (
              <div key={dayIndex} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-medium text-slate-800 dark:text-slate-100">{day.day}</h3>
                </div>
                <div className="p-4 space-y-4">
                  {day.meals.map((meal, mealIndex) => (
                    <div key={mealIndex} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-700 dark:text-slate-300">{meal.mealType}: {meal.name}</h4>
                        <button className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full flex items-center gap-1">
                          <PlusCircle size={12} />
                          Add to Day
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{meal.description}</p>
                      
                      <div className="text-xs mb-2">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Benefits:</span> <span className="font-medium text-slate-700 dark:text-slate-300">{meal.benefits}</span>
                      </div>
                      
                      <div className="mb-2">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Ingredients:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {meal.ingredients.map((ingredient, i) => (
                            <span key={i} className="text-xs bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                              {ingredient}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {meal.instructions && (
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-medium text-slate-700 dark:text-slate-300">Instructions:</span> {meal.instructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Nutritional Tips */}
          {generatedPlan.tips && generatedPlan.tips.length > 0 && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-medium text-slate-800 dark:text-slate-100">Tips & Recommendations</h3>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {generatedPlan.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3 justify-between">
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
              <CalendarCheck size={18} />
              Save Meal Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanGenerator;