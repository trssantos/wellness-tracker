import { getStorage } from './storage';

// Get API key from environment variables or localStorage
const getApiKey = () => {
  const storage = getStorage();
  const useEnvVariableKey = storage.settings?.useEnvVariableKey !== false;
  
  // If set to use environment variable, try that first
  if (useEnvVariableKey) {
    const envApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (envApiKey) {
      return envApiKey;
    }
    
    // If we're supposed to use env var but it's not set, throw an error
    throw new Error('OpenAI API key not configured in environment variables. Add REACT_APP_OPENAI_API_KEY to your environment or choose to use a custom key in Settings.');
  }
  
  // Otherwise try to get from localStorage settings
  const apiKey = storage.settings?.openaiApiKey;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add your API key in Settings.');
  }
  
  return apiKey;
};

// Get OpenAI settings (model, etc.)
export const getOpenAISettings = () => {
  const storage = getStorage();
  const defaultSettings = {
    model: 'gpt-3.5-turbo',
    temperature: 0.7
  };
  
  return storage.settings?.openaiSettings || defaultSettings;
};

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
    const apiKey = getApiKey();
    const prompt = generatePromptTemplate(userContext);
    
    // Get settings from storage
    const settings = getOpenAISettings();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: settings.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates task lists in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: settings.temperature || 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      
      // Check for specific errors
      if (response.status === 401) {
        throw new Error('Invalid OpenAI API key');
      } else if (response.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      } else if (response.status === 503) {
        throw new Error('503: OpenAI service is currently overloaded. Please try again later.');
      }
      
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    try {
      // Find the JSON object in the response text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      const taskData = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the structure
      const validatedData = validateTasksStructure(taskData);
      
      console.log('Generated tasks with OpenAI:', validatedData);
      
      return validatedData;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse OpenAI response');
    }
  } catch (error) {
    console.error('Error generating tasks with OpenAI:', error);
    throw error;
  }
};