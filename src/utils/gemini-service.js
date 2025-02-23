import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Prompt template for task generation
const generatePromptTemplate = ({ mood, energyLevel, objective, context }) => {
  return `As an AI assistant specialized in mental health and ADHD-friendly task planning, help create a personalized daily task list based on the following context:

Current Mood: ${mood}
Energy Level: ${energyLevel}/3
Main Objective: ${objective}
Daily Context: ${context}

Consider these key factors:
- Tasks should be achievable in 5-15 minutes
- Break down complex tasks into smaller, manageable steps
- Account for potential executive function challenges
- Consider the user's current mood and energy level
- Focus on progress over perfection
- Include small dopamine rewards/wins
- Build in breaks and self-care moments

Format your response EXACTLY as a JSON object with this structure:
{
  "categories": [
    {
      "title": "Category Name",
      "items": [
        "task 1 description",
        "task 2 description",
        "task 3 description"
      ]
    }
  ]
}

Create 5-6 categories, each with 4-5 simple tasks ideally add an appropriate icon to the end of each task. Tasks MUST be strings, not objects.
Make tasks specific, actionable, and encouraging.
Make sure each task is a simple string, not an object or complex structure.`;
};

const validateTasksStructure = (data) => {
    // Check if we have the basic structure
    if (!data || !Array.isArray(data.categories)) {
      throw new Error('Invalid response structure: missing categories array');
    }
  
    // Validate and clean each category
    const validatedCategories = data.categories
      .filter(category => 
        category &&
        typeof category.title === 'string' &&
        Array.isArray(category.items)
      )
      .map(category => ({
        title: category.title.trim(),
        items: category.items
          .filter(item => item !== null && item !== undefined)
          .map(item => {
            // If item is a string, just trim it
            if (typeof item === 'string') {
              return item.trim();
            }
            // If item is an object, try to extract the text
            if (typeof item === 'object') {
              if (item.task) return item.task.trim();
              if (item.text) return item.text.trim();
              if (item.description) return item.description.trim();
              // Try to get any string value
              const stringValue = Object.values(item).find(val => typeof val === 'string');
              if (stringValue) return stringValue.trim();
            }
            // Last resort: convert to string
            return String(item).trim();
          })
          .filter(item => item.length > 0) // Remove empty strings
      }))
      .filter(category => category.items.length > 0); // Remove empty categories
  
    if (validatedCategories.length === 0) {
      throw new Error('No valid categories found after validation');
    }
  
    return { categories: validatedCategories };
  };

export const generateTasks = async (userContext) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = generatePromptTemplate(userContext);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      // Find the JSON object in the response text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      const taskData = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the structure
      const validatedData = validateTasksStructure(taskData);
      
      console.log('Generated tasks:', validatedData);
      
      return validatedData;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Error generating tasks:', error);
    throw error;
  }
};