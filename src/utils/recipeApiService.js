/**
 * Recipe API Service
 * Uses TheMealDB's free API for recipe data
 * https://www.themealdb.com/api.php
 */

// Base URL for TheMealDB API
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

/**
 * Fetch recipes by category
 * @param {string} category - Recipe category (e.g., "Breakfast", "Vegetarian")
 * @returns {Promise<Object>} Recipe data
 */
export const fetchRecipesByCategory = async (category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipes by category:', error);
    throw error;
  }
};

/**
 * Fetch recipes by main ingredient
 * @param {string} ingredient - Main ingredient (e.g., "chicken", "salmon")
 * @returns {Promise<Object>} Recipe data
 */
export const fetchRecipesByIngredient = async (ingredient) => {
  try {
    const response = await fetch(`${API_BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipes by ingredient:', error);
    throw error;
  }
};

/**
 * Fetch recipe details by ID
 * @param {string} id - Recipe ID
 * @returns {Promise<Object>} Detailed recipe data
 */
export const fetchRecipeDetails = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    throw error;
  }
};

/**
 * Search recipes by name
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search results
 */
export const searchRecipes = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
};

/**
 * Get list of all categories
 * @returns {Promise<Object>} Categories data
 */
export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories.php`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get recipe recommendations based on mood and energy needs
 * This is a mock function since TheMealDB doesn't provide this capability
 * In a real implementation, this would incorporate data from the user's mood and energy tracking
 * 
 * @param {Object} preferences - User preferences and needs
 * @returns {Promise<Array>} Recommended recipes
 */
export const getRecommendedRecipes = async (preferences = {}) => {
  try {
    // Map preferences to categories that might help
    const defaultCategories = ['Vegetarian', 'Seafood', 'Breakfast'];
    
    // If user needs energy boost, prioritize protein-rich categories
    const categories = preferences.needsEnergy 
      ? ['Chicken', 'Beef', 'Breakfast', ...defaultCategories]
      : defaultCategories;
    
    // Get a random category from the selected ones
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Fetch recipes for that category
    const data = await fetchRecipesByCategory(randomCategory);
    
    if (data && data.meals) {
      // Select a subset of recipes
      const selectedRecipes = data.meals.slice(0, 5);
      
      // For each recipe, fetch details to get ingredients and instructions
      const enhancedRecipes = await Promise.all(
        selectedRecipes.map(async (recipe) => {
          try {
            const details = await fetchRecipeDetails(recipe.idMeal);
            return {
              ...recipe,
              details: details.meals[0],
              // Add mock mood and energy impact
              moodImpact: Math.floor(Math.random() * 20) + 10,
              energyImpact: Math.floor(Math.random() * 20) + 10
            };
          } catch (error) {
            return recipe;
          }
        })
      );
      
      return enhancedRecipes;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting recommended recipes:', error);
    return [];
  }
};