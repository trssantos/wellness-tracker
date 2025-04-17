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
              parsedWorkout.exercises.map(exercise => {
                if (exercise.isDurationBased) {
                  // Process duration-based exercise
                  return {
                    name: exercise.name || '',
                    isDurationBased: true,
                    sets: typeof exercise.sets === 'string' ? parseInt(exercise.sets) || 1 : exercise.sets || 1,
                    duration: exercise.duration || 0,
                    durationUnit: exercise.durationUnit || 'min',
                    distance: exercise.distance || '',
                    intensity: exercise.intensity || 'medium',
                    restTime: typeof exercise.restTime === 'string' ? parseInt(exercise.restTime) || 60 : exercise.restTime || 60,
                    notes: exercise.notes || ''
                  };
                } else {
                  // Process traditional strength exercise
                  return {
                    name: exercise.name || '',
                    isDurationBased: false,
                    sets: typeof exercise.sets === 'string' ? parseInt(exercise.sets) || 3 : exercise.sets || 3,
                    reps: exercise.reps || '10', // Keep as string to allow "10 (each side)"
                    weight: exercise.weight || '',
                    restTime: typeof exercise.restTime === 'string' ? parseInt(exercise.restTime) || 60 : exercise.restTime || 60,
                    notes: exercise.notes || ''
                  };
                }
              }) : [],
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
        
      // Check for isDurationBased flag
      const isDurationBased = block.includes('"isDurationBased":true') || 
                             block.includes('"isDurationBased": true');
      
      if (isDurationBased) {
        // Extract duration-based exercise properties
        const nameMatch = block.match(/"name"\s*:\s*"([^"]+)"/);
        const durationMatch = block.match(/"duration"\s*:\s*(\d+)/);
        const setsMatch = block.match(/"sets"\s*:\s*(\d+)/);
        const distanceMatch = block.match(/"distance"\s*:\s*"([^"]+)"/);
        const notesMatch = block.match(/"notes"\s*:\s*"([^"]+)"/);
        const durationUnitMatch = block.match(/"durationUnit"\s*:\s*"([^"]+)"/);
        
        if (nameMatch) {
          exercises.push({
            name: nameMatch[1],
            isDurationBased: true,
            sets: setsMatch ? parseInt(setsMatch[1]) : 1,
            duration: durationMatch ? parseInt(durationMatch[1]) : 5,
            durationUnit: durationUnitMatch ? durationUnitMatch[1] : 'min',
            distance: distanceMatch ? distanceMatch[1] : '',
            intensity: 'medium',
            restTime: 60,
            notes: notesMatch ? notesMatch[1] : ''
          });
        }
      } else {
        // Extract traditional strength exercise properties
        const nameMatch = block.match(/"name"\s*:\s*"([^"]+)"/);
        const setsMatch = block.match(/"sets"\s*:\s*(\d+)/);
        const repsMatch = block.match(/"reps"\s*:\s*(?:"([^"]+)"|(\d+)[^,}]*)/);
        const notesMatch = block.match(/"notes"\s*:\s*"([^"]+)"/);
        
        if (nameMatch) {
          exercises.push({
            name: nameMatch[1],
            isDurationBased: false,
            sets: setsMatch ? parseInt(setsMatch[1]) : 3,
            reps: repsMatch ? (repsMatch[1] || repsMatch[2]) : '10',
            weight: '',
            restTime: 60,
            notes: notesMatch ? notesMatch[1] : ''
          });
        }
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
        isDurationBased: false,
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
  const distanceUnit = params.preferredUnits?.distance || 'mi';
  const weightUnit = params.preferredUnits?.weight || 'lbs';

  return `
    Create a detailed workout plan based on the following parameters:
    
    Type: ${params.type || 'General workout'}
    Location: ${params.location || 'Any location'}
    Duration: ${params.duration || 45} minutes
    Equipment available: ${params.equipment ? params.equipment.join(', ') : 'None specified'}
    Fitness level: ${params.fitnessLevel || 'Intermediate'}
    Limitations/Health concerns: ${params.limitations || 'None specified'}
    Focus areas: ${params.focusAreas ? params.focusAreas.join(', ') : 'Full body'}
    Workout Objective: ${params.objective || 'General fitness'}
    Preferred units: Weight in ${weightUnit}, Distance in ${distanceUnit}
    
    Please generate a complete workout with the following structure:
    - name: A clear, motivating name for this workout
    - type: The workout type (strength, cardio, flexibility, etc.)
    - location: Where this workout can be performed (gym, home, outdoors, etc.)
    - duration: Total workout time in minutes
    - equipment: Array of required equipment items
    - frequency: Recommended weekly frequency as array of days (e.g., ["mon", "wed", "fri"])
    - timeOfDay: Recommended time of day (morning, afternoon, evening, anytime)
    - exercises: Array of exercise objects

    IMPORTANT: You can only recommend two types of exercises according to these templates, you can recommend all exercises of one type if applicable (ex. In swimming only recommed swim type exercises or postures and distances):
    
    1. Traditional strength exercises - use this format for strength-based exercises with repetitions:
       {
         "name": "Exercise name",
         "isDurationBased": false,
         "sets": number of sets (as a number),
         "reps": number of reps (as a string, especially if it includes notes like "10 each side"),
         "weight": weight recommendation (if applicable),
         "restTime": rest time in seconds (as a number),
         "notes": form tips or variations
       }
       
    2. Duration-based exercises - use this format for cardio, planks, or timed exercises:
       {
         "name": "Exercise name",
         "isDurationBased": true,
         "sets": number of sets/intervals (as a number),
         "duration": time for each set (as a number),
         "durationUnit": unit for duration ("min" or "sec"),
         "distance": target distance if applicable (as a string),
         "restTime": rest time in seconds (as a number),
         "notes": form tips or variations
       }
    
    - notes: General notes or tips for the workout
    
    VERY IMPORTANT FOR FORMATTING: 
    - Always include "isDurationBased" property for every exercise
    - Always put the "reps" value in quotes if it includes additional text like "10 (each side)" or "10 each leg"
    - Make sure "sets", "duration" and "restTime" are always numeric values without additional text
    - Use "isDurationBased: true" for cardio exercises, planks, wall sits, and other timed exercises
    - Use "isDurationBased: false" for traditional strength exercises with repetitions
    - For running, cycling, swimming, sports and similar cardio activities, include distance if appropriate
    - On outdoor cardio or sports don't mix like running and cycling in the same workout since it is not practical
    - Use the user's preferred distance and weight units
    
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
          "isDurationBased": false,
          "sets": 3,
          "reps": "12",
          "weight": "moderate kettlebell",
          "restTime": 60,
          "notes": "Keep chest up, go to parallel depth"
        },
        {
          "name": "Alternating Lunges",
          "isDurationBased": false,
          "sets": 3,
          "reps": "10 (each side)",
          "weight": "bodyweight",
          "restTime": 45,
          "notes": "Step forward and maintain balance"
        },
        {
          "name": "Plank Hold",
          "isDurationBased": true,
          "sets": 3,
          "duration": 45,
          "durationUnit": "sec",
          "restTime": 30,
          "notes": "Keep core tight and maintain straight line from head to heels"
        },
        {
          "name": "Treadmill Run",
          "isDurationBased": true,
          "sets": 1,
          "duration": 10,
          "durationUnit": "min",
          "distance": "1 mile",
          "intensity": "medium",
          "notes": "Maintain steady pace throughout"
        }
      ],
      "notes": "Warm up with 5 minutes of light cardio before starting."
    }
    
    Only respond with the JSON object and nothing else. No explanations or additional text.
    
    ${params.objective ? `IMPORTANT: This workout should be specifically designed for: ${params.objective}` : ''}
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
    Suggest exercises appropriate for a ${workoutType} workout${equipment.length > 0 ? ` using the following equipment: ${equipment.join(', ')}` : ''}.
    
    For each exercise, provide:
    
    IMPORTANT: You can suggest BOTH traditional strength exercises AND duration-based exercises as appropriate.
    
    For traditional strength exercises:
    - name: Exercise name
    - isDurationBased: false
    - sets: Recommended sets (usually 3-5)
    - reps: Recommended reps
    - restTime: Rest time in seconds
    - notes: Brief form tips
    
    For duration-based exercises:
    - name: Exercise name
    - isDurationBased: true
    - sets: Number of sets/intervals
    - duration: Duration for each set
    - durationUnit: Unit of measurement ("min" or "sec")
    - distance: Target distance (if applicable)
    - intensity: Intensity level ("light", "medium", "high")
    - restTime: Rest time in seconds
    - notes: Brief form tips
    
    Format the response as a JSON array of exercise objects.
    Example with mixed exercise types:
    [
      {
        "name": "Barbell Squats",
        "isDurationBased": false,
        "sets": 4,
        "reps": "10",
        "restTime": 90,
        "notes": "Keep chest up, focus on depth"
      },
      {
        "name": "Alternating Lunges",
        "isDurationBased": false,
        "sets": 3,
        "reps": "10 (each side)",
        "restTime": 60,
        "notes": "Step forward and maintain balance"
      },
      {
        "name": "Plank",
        "isDurationBased": true,
        "sets": 3,
        "duration": 45,
        "durationUnit": "sec",
        "restTime": 30,
        "notes": "Keep body straight and core engaged"
      },
      {
        "name": "Treadmill Intervals",
        "isDurationBased": true,
        "sets": 5,
        "duration": 1,
        "durationUnit": "min",
        "intensity": "high",
        "restTime": 60,
        "notes": "Sprint for 1 minute, then rest for 1 minute"
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