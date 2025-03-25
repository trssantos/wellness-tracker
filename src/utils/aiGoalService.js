import { generateContent } from './ai-service';
import { getCategories } from './bucketListUtils';

/**
 * Generate AI-powered goal suggestions based on user input
 * @param {string} query - User input about their interests or goals
 * @param {string} category - Optional category name to focus the suggestions
 * @returns {Promise<Array>} - Array of goal suggestions
 */
export const generateGoalSuggestion = async (query, categoryName = '') => {
  try {
    // Build the prompt for the AI
    const categories = getCategories();
    const categoryList = categories.map(c => c.name).join(', ');
    
    let prompt = `You are an expert life coach specializing in helping people set meaningful goals. 
    
Create personalized goal suggestions based on this input: "${query}"`;
    
    if (categoryName) {
      prompt += `\n\nFocus on goals in the category: ${categoryName}`;
    }
    
    prompt += `\n\nProvide 5-8 specific, actionable goals. Each goal should be ambitious but achievable. 
    
Format the response as a JSON array with this structure:
[
  {
    "title": "Goal title - be specific and measurable",
    "category": "category_id"
  }
]

The available categories are: ${categoryList}
The category IDs to use are: ${categories.map(c => c.id).join(', ')}

Don't invent new categories. If a suggested goal doesn't fit any category well, you can omit the category field.
Each goal should be specific and inspiring.`;
    
    // Generate suggestions with AI
    const response = await generateContent(prompt);
    
    // Parse response as JSON
    try {
      // Look for JSON array in the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return suggestions.slice(0, 8); // Limit to 8 suggestions max
      }
      
      throw new Error('Could not extract valid JSON from AI response');
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback: Create basic suggestions
      return [
        { title: 'Learn a new language', category: 'personal' },
        { title: 'Run a 5K race', category: 'fitness' },
        { title: 'Save for a dream vacation', category: 'finance' },
        { title: 'Travel to a new country', category: 'experiences' }
      ];
    }
  } catch (error) {
    console.error('Error generating goal suggestions:', error);
    throw error;
  }
};