// src/utils/workoutAiService.js
import { generateContent } from './ai-service';

/**
 * Generate a workout based on user parameters
 * @param {Object} params - Workout generation parameters
 * @returns {Promise<Object>} The generated workout
 */
export const generateWorkout = async (params) => {
  const prompt = generateWorkoutPrompt(params);
  
  try {
    const responseText = await generateContent(prompt);
    
    // Try to parse the response to extract the JSON object
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      // Get the raw JSON string
      const rawJson = jsonMatch[0];
      
      try {
        // First attempt: try to parse directly (might work for well-formed JSON)
        return JSON.parse(rawJson);
      } catch (firstError) {
        console.log("First parse attempt failed, applying more robust cleaning...");
        
        try {
          // More aggressive cleaning for problematic JSON from AI
          // This fixes issues like unquoted text in numeric fields (10 (each leg))
          let cleanedJson = rawJson
            // Normalize line breaks and spaces
            .replace(/\n/g, '')
            .trim()
            // Fix trailing commas in objects and arrays
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            // Ensure property names are quoted
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
            // Handle reps values with parenthetical notes - convert to strings
            .replace(/:(\s*\d+\s*\([^)]+\))/g, ':"$1"');
            
          // One more pass to catch any complex parenthetical expressions
          cleanedJson = cleanedJson.replace(/"reps":\s*(\d+)\s*\(/g, '"reps":"$1 (');
          
          const closingParenRegex = /\)([,}])/g;
          let match;
          while ((match = closingParenRegex.exec(cleanedJson)) !== null) {
            if (match.index > 0 && cleanedJson[match.index - 1] !== '"') {
              // This closing paren needs quotes
              const before = cleanedJson.substring(0, match.index + 1);
              const after = cleanedJson.substring(match.index + 1);
              cleanedJson = before + '"' + after;
            }
          }
          
          // Parse the fixed JSON
          const parsedWorkout = JSON.parse(cleanedJson);
          
          // Validate the workout structure and provide fallbacks for missing fields
          return {
            name: parsedWorkout.name || params.type + ' Workout',
            type: parsedWorkout.type || params.type,
            location: parsedWorkout.location || params.location,
            duration: parsedWorkout.duration || params.duration || 45,
            equipment: Array.isArray(parsedWorkout.equipment) ? parsedWorkout.equipment : [],
            frequency: Array.isArray(parsedWorkout.frequency) ? parsedWorkout.frequency : ['mon', 'wed', 'fri'],
            timeOfDay: parsedWorkout.timeOfDay || 'anytime',
            exercises: Array.isArray(parsedWorkout.exercises) ? 
              parsedWorkout.exercises.map(exercise => ({
                name: exercise.name || '',
                sets: typeof exercise.sets === 'string' ? parseInt(exercise.sets) || 3 : exercise.sets || 3,
                reps: exercise.reps || '10', // Keep as string to allow "10 (each side)"
                weight: exercise.weight || '',
                restTime: typeof exercise.restTime === 'string' ? parseInt(exercise.restTime) || 60 : exercise.restTime || 60,
                notes: exercise.notes || ''
              })) : [],
            notes: parsedWorkout.notes || '',
            limitations: params.limitations || ''
          };
        } catch (parseError) {
          console.error("Error parsing workout JSON after cleaning:", parseError);
          
          // As a last resort, try even more aggressive fixing
          try {
            console.log("Attempting emergency parsing with regex extraction");
            const workout = extractWorkoutWithRegex(rawJson, params);
            if (workout) return workout;
          } catch (regexError) {
            console.error("Regex extraction failed:", regexError);
          }
          
          throw new Error('Failed to parse workout suggestion');
        }
      }
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error("Error generating workout with AI:", error);
    throw error;
  }
};

/**
 * Emergency function to extract workout data using regex when JSON parsing fails
 * @param {string} jsonText - The raw JSON text
 * @param {Object} defaultParams - Default parameters to fall back on
 * @returns {Object} Extracted workout
 */
const extractWorkoutWithRegex = (jsonText, defaultParams) => {
  // Extract workout name
  const nameMatch = jsonText.match(/"name"\s*:\s*"([^"]+)"/);
  const name = nameMatch ? nameMatch[1] : defaultParams.type + ' Workout';
  
  // Extract type
  const typeMatch = jsonText.match(/"type"\s*:\s*"([^"]+)"/);
  const type = typeMatch ? typeMatch[1] : defaultParams.type;
  
  // Extract location
  const locationMatch = jsonText.match(/"location"\s*:\s*"([^"]+)"/);
  const location = locationMatch ? locationMatch[1] : defaultParams.location;
  
  // Extract duration
  const durationMatch = jsonText.match(/"duration"\s*:\s*(\d+)/);
  const duration = durationMatch ? parseInt(durationMatch[1]) : defaultParams.duration || 45;
  
  // Extract notes
  const notesMatch = jsonText.match(/"notes"\s*:\s*"([^"]+)"/);
  const notes = notesMatch ? notesMatch[1] : '';
  
  // Extract exercises - this is the trickiest part
  const exercises = [];
  
  // Try to find each exercise block
  const exerciseBlocks = jsonText.match(/{[^{]*"name"[^}]*}/g) || [];
  
  for (const block of exerciseBlocks) {
    try {
      // Clean the block to be valid JSON
      const cleanedBlock = block
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
        .replace(/:\s*(\d+)\s*\(/g, ':"$1 (')
        .replace(/\)([,}])/g, ')"}')
        .replace(/,\s*}/g, '}');
        
      // See if we can extract the important fields
      const nameMatch = block.match(/"name"\s*:\s*"([^"]+)"/);
      const setsMatch = block.match(/"sets"\s*:\s*(\d+)/);
      const repsMatch = block.match(/"reps"\s*:\s*(?:"([^"]+)"|(\d+)[^,}]*)/);
      const notesMatch = block.match(/"notes"\s*:\s*"([^"]+)"/);
      
      if (nameMatch) {
        exercises.push({
          name: nameMatch[1],
          sets: setsMatch ? parseInt(setsMatch[1]) : 3,
          reps: repsMatch ? (repsMatch[1] || repsMatch[2]) : '10',
          weight: '',
          restTime: 60,
          notes: notesMatch ? notesMatch[1] : ''
        });
      }
    } catch (e) {
      // Skip this exercise if parsing fails
      console.error("Couldn't parse exercise block:", block);
    }
  }
  
  return {
    name,
    type,
    location,
    duration,
    equipment: defaultParams.equipment || [],
    frequency: ['mon', 'wed', 'fri'],
    timeOfDay: 'anytime',
    exercises: exercises.length > 0 ? exercises : [
      {
        name: 'Example Exercise',
        sets: 3,
        reps: '10',
        weight: '',
        restTime: 60,
        notes: 'Added as fallback when no exercises could be parsed'
      }
    ],
    notes,
    limitations: defaultParams.limitations || ''
  };
};

/**
 * Generate a prompt for workout creation
 * @param {Object} params - Parameters for workout generation
 * @returns {string} The generated prompt
 */
const generateWorkoutPrompt = (params) => {
  return `
    Create a detailed workout plan based on the following parameters:
    
    Type: ${params.type || 'General workout'}
    Location: ${params.location || 'Any location'}
    Duration: ${params.duration || 45} minutes
    Equipment available: ${params.equipment ? params.equipment.join(', ') : 'None specified'}
    Fitness level: ${params.fitnessLevel || 'Intermediate'}
    Limitations/Health concerns: ${params.limitations || 'None specified'}
    Focus areas: ${params.focusAreas ? params.focusAreas.join(', ') : 'Full body'}
    
    Please generate a complete workout with the following structure:
    - name: A clear, motivating name for this workout
    - type: The workout type (strength, cardio, flexibility, etc.)
    - location: Where this workout can be performed (gym, home, outdoors, etc.)
    - duration: Total workout time in minutes
    - equipment: Array of required equipment items
    - frequency: Recommended weekly frequency as array of days (e.g., ["mon", "wed", "fri"])
    - timeOfDay: Recommended time of day (morning, afternoon, evening, anytime)
    - exercises: Array of exercise objects, each with:
      - name: Exercise name
      - sets: Number of sets (as a number)
      - reps: Number of reps (as a string, especially if it includes notes like "10 each side")
      - weight: Weight recommendation (if applicable)
      - restTime: Rest time in seconds (as a number)
      - notes: Form tips or variations
    - notes: General notes or tips for the workout
    
    VERY IMPORTANT FOR FORMATTING: 
    - Always put the "reps" value in quotes if it includes additional text like "10 (each side)" or "10 each leg"
    - Make sure "sets" and "restTime" are always numeric values without additional text
    
    Format the response as a JSON object.
    Example:
    {
      "name": "Full Body Strength Circuit",
      "type": "strength",
      "location": "gym",
      "duration": 45,
      "equipment": ["dumbbells", "bench", "kettlebell"],
      "frequency": ["mon", "wed", "fri"],
      "timeOfDay": "morning",
      "exercises": [
        {
          "name": "Goblet Squats",
          "sets": 3,
          "reps": "12",
          "weight": "moderate kettlebell",
          "restTime": 60,
          "notes": "Keep chest up, go to parallel depth"
        },
        {
          "name": "Alternating Lunges",
          "sets": 3,
          "reps": "10 (each side)",
          "weight": "bodyweight",
          "restTime": 45,
          "notes": "Step forward and maintain balance"
        }
      ],
      "notes": "Warm up with 5 minutes of light cardio before starting."
    }
    
    Only respond with the JSON object and nothing else. No explanations or additional text.
    
    ${params.limitations ? 'IMPORTANT: Please carefully account for the mentioned health limitations/concerns in exercise selection and intensity.' : ''}
    ${params.equipment && params.equipment.length > 0 ? 'IMPORTANT: Only include exercises that can be done with the listed available equipment.' : ''}
    ${params.location === 'home' ? 'IMPORTANT: Ensure all exercises are suitable for a home environment with potentially limited space.' : ''}
  `;
};

/**
 * Generate exercise suggestions for a specific workout type
 * @param {string} workoutType - The type of workout
 * @param {string} equipment - Available equipment
 * @returns {Promise<Array>} Array of exercise objects
 */
export const generateExerciseSuggestions = async (workoutType, equipment = []) => {
  const prompt = `
    Suggest 8-10 exercises appropriate for a ${workoutType} workout${equipment.length > 0 ? ` using the following equipment: ${equipment.join(', ')}` : ''}.
    
    For each exercise, provide:
    - name: Exercise name
    - sets: Recommended sets (usually 3-5)
    - reps: Recommended reps or duration 
    - restTime: Rest time in seconds
    - notes: Brief form tips
    
    Format the response as a JSON array of exercise objects.
    Example:
    [
      {
        "name": "Barbell Squats",
        "sets": 4,
        "reps": "10",
        "restTime": 90,
        "notes": "Keep chest up, focus on depth"
      },
      {
        "name": "Alternating Lunges",
        "sets": 3,
        "reps": "10 (each side)",
        "restTime": 60,
        "notes": "Step forward and maintain balance"
      }
    ]
    
    IMPORTANT: Always put the "reps" value in quotes if it includes additional text like "10 (each side)" or "10 each leg"
    
    Only respond with the JSON array and nothing else.
  `;
  
  try {
    const responseText = await generateContent(prompt);
    
    // Try to parse the response to extract the JSON array
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      // Clean and parse the JSON
      const cleanedJson = jsonMatch[0]
        .replace(/\n/g, '')
        .replace(/,\s*]/g, ']')
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
        .replace(/:(\s*\d+\s*\([^)]+\))/g, ':"$1"')
        .replace(/"reps":\s*(\d+)\s*\(/g, '"reps":"$1 (');
        
      return JSON.parse(cleanedJson);
    } else {
      throw new Error('Invalid response format for exercise suggestions');
    }
  } catch (error) {
    console.error("Error generating exercise suggestions:", error);
    throw error;
  }
};