// src/utils/aiHabitService.js
import { generateTasks, generateContent } from './ai-service';

// Generate steps for a habit
export const generateStepsForHabit = async (habit) => {
  if (!habit || !habit.name) {
    throw new Error('Habit information is required');
  }
  
  const prompt = `
    I need steps for establishing the following habit: "${habit.name}"
    ${habit.description ? `Description: ${habit.description}` : ''}
    
    Please provide a small number of actionable steps that would help someone build this habit.
    Each step should be a simple instruction that can be completed in a few minutes.
    Take into account depending on the habit it can be daily, weekly or every other day.
    Format the response as a JSON array of strings.
    Example: ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]
    
    Only respond with the JSON array and nothing else. No explanations or additional text.
  `;
  
  try {
    const responseText = await generateContent(prompt);
    
    // Try to parse the response to extract the steps array
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      // Clean the response before parsing
      const cleanedJson = jsonMatch[0].replace(/\n/g, '')
        .replace(/,\s*]/, ']') // Remove trailing commas
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'); // Ensure property names are quoted
      
      try {
        return JSON.parse(cleanedJson);
      } catch (parseError) {
        console.error("Error parsing steps JSON:", parseError, cleanedJson);
        
        // Fallback to simple splitting if JSON parse fails
        const steps = responseText
          .replace(/[\[\]"']/g, '')  // Remove brackets and quotes
          .split(',')                // Split by commas
          .map(s => s.trim())        // Trim whitespace
          .filter(s => s.length > 0); // Remove empty strings
        
        return steps.length > 0 ? steps : ["Start with a small session", "Create a regular schedule", "Remove distractions", "Track your progress", "Celebrate small wins"];
      }
    } else {
      // Fallback if no JSON format is found
      const steps = responseText
        .split('\n')             // Split by newlines
        .map(s => s.replace(/^\d+\.\s*/, '').trim()) // Remove numbered lists and trim
        .filter(s => s.length > 0);   // Remove empty lines
      
      return steps.length >= 3 ? steps : ["Start with a small session", "Create a regular schedule", "Remove distractions", "Track your progress", "Celebrate small wins"];
    }
  } catch (error) {
    console.error("Error generating habit steps with AI:", error);
    // Return default steps when API fails
    return [
      "Start with a small session",
      "Create a regular schedule",
      "Remove distractions",
      "Track your progress",
      "Celebrate small wins"
    ];
  }
};

// Generate milestones for a habit
export const generateMilestonesForHabit = async (habit) => {
  if (!habit || !habit.name) {
    throw new Error('Habit information is required');
  }
  
  const prompt = `
    I need milestone suggestions for the following habit: "${habit.name}"
    ${habit.description ? `Description: ${habit.description}` : ''}
    
    Please suggest 4 meaningful milestones that would help track progress with this habit.
    Each milestone should have a name and a target value (number of days).
    Format the response as a JSON array with objects containing 'name' and 'value' properties.
    Example: [{"name": "First week complete", "value": 7}, {"name": "21-day habit formed", "value": 21}]
    
    Only respond with the JSON array and nothing else. No explanations or additional text.
  `;
  
  try {
    const responseText = await generateContent(prompt);
    
    // Try to parse the response to extract the milestones array
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      // Clean the response before parsing
      const cleanedJson = jsonMatch[0].replace(/\n/g, '')
        .replace(/,\s*]/, ']') // Remove trailing commas
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'); // Ensure property names are quoted
      
      try {
        return JSON.parse(cleanedJson);
      } catch (parseError) {
        console.error("Error parsing milestones JSON:", parseError, cleanedJson);
        
        // Return default milestones if JSON parsing fails
        return [
          { name: "7-day streak", value: 7 },
          { name: "21-day habit formation", value: 21 },
          { name: "30-day consistency", value: 30 },
          { name: "100-day mastery", value: 100 }
        ];
      }
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error("Error generating habit milestones with AI:", error);
    // Return default milestones when API fails
    return [
      { name: "7-day streak", value: 7 },
      { name: "21-day habit formation", value: 21 },
      { name: "30-day consistency", value: 30 },
      { name: "100-day mastery", value: 100 }
    ];
  }
};

// Generate a complete habit suggestion based on user input
export const generateHabitSuggestion = async (habitInput) => {
  if (!habitInput) {
    throw new Error('Habit input is required');
  }
  
  const prompt = `
    I want to build a new habit related to: "${habitInput}"
    
    Please suggest a complete habit with the following structure:
    - name: A short, clear name for the habit
    - description: A brief description of the habit and its benefits
    - steps: An array of 5-6 specific action steps to perform the habit
    - frequency: An array of days suggested for the habit (use lowercase 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun')
    - timeOfDay: Suggested time of day ('morning', 'afternoon', 'evening', or 'anytime')
    - milestones: An array of milestone objects, each with 'name' and 'value' (number of days)
    
    Format the response as a JSON object.
    Example:
    {
      "name": "Daily Meditation",
      "description": "A regular meditation practice to reduce stress and improve focus",
      "steps": ["Find a quiet space", "Set a timer", "Focus on breathing", "Notice thoughts without judgment", "Return focus to breath", "End mindfully"],
      "frequency": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      "timeOfDay": "morning",
      "milestones": [
        {"name": "7-day streak", "value": 7},
        {"name": "21-day habit formation", "value": 21},
        {"name": "30-day consistency", "value": 30},
        {"name": "100-day mindfulness master", "value": 100}
      ]
    }
    
    Only respond with the JSON object and nothing else. No explanations or additional text.
  `;
  
  try {
    const responseText = await generateContent(prompt);
    
    // Try to parse the response to extract the JSON object
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      // Clean the response before parsing
      const cleanedJson = jsonMatch[0].replace(/\n/g, '')
        .replace(/,\s*}/, '}') // Remove trailing commas
        .replace(/,\s*]/, ']') // Remove trailing commas in arrays
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'); // Ensure property names are quoted
      
      try {
        const parsedHabit = JSON.parse(cleanedJson);
        
        // Validate the habit structure and provide fallbacks for missing fields
        return {
          name: parsedHabit.name || habitInput,
          description: parsedHabit.description || `A habit for ${habitInput}`,
          steps: Array.isArray(parsedHabit.steps) && parsedHabit.steps.length > 0 
            ? parsedHabit.steps 
            : ["Start small", "Be consistent", "Track progress", "Remove obstacles", "Celebrate wins"],
          frequency: Array.isArray(parsedHabit.frequency) && parsedHabit.frequency.length > 0
            ? parsedHabit.frequency
            : ["mon", "wed", "fri"],
          timeOfDay: ['morning', 'afternoon', 'evening', 'anytime'].includes(parsedHabit.timeOfDay)
            ? parsedHabit.timeOfDay
            : "anytime",
          milestones: Array.isArray(parsedHabit.milestones) && parsedHabit.milestones.length > 0
            ? parsedHabit.milestones
            : [
                { name: "7-day streak", value: 7 },
                { name: "21-day habit formation", value: 21 },
                { name: "30-day consistency", value: 30 },
                { name: "100-day mastery", value: 100 }
              ]
        };
      } catch (parseError) {
        console.error("Error parsing habit JSON:", parseError, cleanedJson);
        throw new Error('Failed to parse habit suggestion');
      }
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error("Error generating habit suggestion with AI:", error);
    throw error;
  }
};