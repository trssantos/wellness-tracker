
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
    
    prompt += `\n\nProvide 5-8 specific, actionable goals. Each goal should be ambitious but achievable. For each goal, include details for different tracking methods:

1. For counter-based goals, include current and target values
2. For percentage-based goals, include initial progress value 
3. For milestone-based goals, include 3-5 specific milestones/steps to achieve the goal

Format the response as a JSON array with this structure:
[
  {
    "title": "Goal title - be specific and measurable",
    "category": "category_id",
    "description": "Brief description of why this goal matters",
    "progressType": "simple|percentage|counter|milestone", // Choose the most appropriate tracking type
    "initialProgress": 0, // For percentage type (0-100)
    "currentValue": 0, // For counter type
    "targetValue": 100, // For counter type
    "milestones": [ // For milestone type
      {"text": "First milestone step", "completed": false},
      {"text": "Second milestone step", "completed": false},
      {"text": "Third milestone step", "completed": false}
    ]
  }
]

The available categories are: ${categoryList}
The category IDs to use are: ${categories.map(c => c.id).join(', ')}

Don't invent new categories. If a suggested goal doesn't fit any category well, you can omit the category field.
Each goal should be specific, inspiring, and have the most appropriate progress tracking method.`;
    
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
        { 
          title: 'Learn a new language', 
          category: 'personal',
          progressType: 'percentage',
          initialProgress: 0,
          description: 'Expand your communication skills and cultural understanding'
        },
        { 
          title: 'Run a 5K race', 
          category: 'fitness',
          progressType: 'counter',
          currentValue: 0,
          targetValue: 5,
          description: 'Improve your cardiovascular health and endurance'
        },
        { 
          title: 'Save for a dream vacation', 
          category: 'finance',
          progressType: 'counter',
          currentValue: 0,
          targetValue: 3000,
          description: 'Build financial discipline while working toward a rewarding experience'
        },
        { 
          title: 'Plan a trip to Europe', 
          category: 'experiences',
          progressType: 'milestone',
          milestones: [
            {text: 'Research destinations', completed: false},
            {text: 'Set budget and savings goal', completed: false},
            {text: 'Apply for passport/visa', completed: false},
            {text: 'Book flights and accommodation', completed: false}
          ],
          description: 'Experience different cultures and create lasting memories'
        }
      ];
    }
  } catch (error) {
    console.error('Error generating goal suggestions:', error);
    throw error;
  }
};