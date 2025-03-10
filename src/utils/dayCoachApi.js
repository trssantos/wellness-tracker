
import { getStorage, setStorage } from './storage';
import { generateTasks, generateContent } from './ai-service';

// Fetch a response from the AI coach
export const fetchCoachResponse = async (context) => {
  try {
    // Get user data with the tiered summarization approach
    const userData = await gatherUserDataWithSummarization();
    
    // Add user data to the context
    const fullContext = {
      ...context,
      userData
    };
    
    // Call the AI service
    return await fetchFromAI(fullContext);
  } catch (error) {
    console.error('Error fetching coach response:', error);
    throw error;
  }
};

// Gather user data with the tiered summarization approach
const gatherUserDataWithSummarization = async () => {
  const storage = getStorage();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Get cached summaries if they exist
  const cachedSummaries = storage.dayCoachSummaries || {
    weeklySummaries: {},
    monthlySummaries: {},
    lastSummarized: null
  };
  
  // Check if we need to regenerate summaries (daily)
  const needsResummarization = !cachedSummaries.lastSummarized || 
                             new Date(cachedSummaries.lastSummarized).toDateString() !== today.toDateString();
  
  let summaries = cachedSummaries;
  
  // Regenerate summaries if needed
  if (needsResummarization) {
    console.log("Regenerating data summaries for day coach...");
    summaries = await generateDataSummaries(storage, cachedSummaries);
    
    // Save the updated summaries
    storage.dayCoachSummaries = summaries;
    setStorage(storage);
  }
  
  // Get recent detailed data (last 7 days)
  const recentData = getRecentDetailedData(storage, today);
  
  // Prepare final data object
  return {
    today: todayStr,
    recentData,
    weeklySummaries: summaries.weeklySummaries,
    monthlySummaries: summaries.monthlySummaries,
    // Additional user context
    habits: storage.habits || [],
    focusSessions: (storage.focusSessions || []).slice(-10), // Last 10 focus sessions
    workouts: (storage.completedWorkouts || []).slice(-10) // Last 10 workouts
  };
};

// Generate weekly and monthly summaries
const generateDataSummaries = async (storage, cachedSummaries = {}) => {
  const today = new Date();
  
  // Initialize summaries structure
  const summaries = {
    weeklySummaries: {...(cachedSummaries.weeklySummaries || {})},
    monthlySummaries: {...(cachedSummaries.monthlySummaries || {})},
    lastSummarized: today.toISOString()
  };
  
  // Get all date keys from storage (YYYY-MM-DD format)
  const dateKeys = Object.keys(storage).filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key));
  
  // Group dates by week and month
  const dateGroups = groupDatesByPeriod(dateKeys, today);
  
  // Generate or update weekly summaries (for data 7-30 days old)
  for (const weekKey of Object.keys(dateGroups.weeks)) {
    // Skip the current week (we'll use detailed data)
    if (weekKey === dateGroups.currentWeekKey) continue;
    
    // Skip weeks that already have a summary (unless they're from the last month)
    const weekStart = new Date(weekKey);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 30);
    
    if (summaries.weeklySummaries[weekKey] && weekStart < oneMonthAgo) {
      continue;
    }
    
    // Generate summary for this week
    const weekDates = dateGroups.weeks[weekKey];
    summaries.weeklySummaries[weekKey] = await generateWeeklySummary(storage, weekDates, weekKey);
  }
  
  // Generate or update monthly summaries (for data older than 30 days)
  for (const monthKey of Object.keys(dateGroups.months)) {
    // Skip the current month (we'll use weekly summaries or detailed data)
    if (monthKey === dateGroups.currentMonthKey) continue;
    
    // Skip months that already have a summary (unless they're from the last 3 months)
    const monthStart = new Date(monthKey);
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    if (summaries.monthlySummaries[monthKey] && monthStart < threeMonthsAgo) {
      continue;
    }
    
    // Generate summary for this month
    const monthDates = dateGroups.months[monthKey];
    summaries.monthlySummaries[monthKey] = await generateMonthlySummary(storage, monthDates, monthKey);
  }
  
  return summaries;
};

// Group dates by week and month
const groupDatesByPeriod = (dateKeys, today) => {
  // Initialize result structure
  const result = {
    weeks: {},
    months: {},
    currentWeekKey: getWeekKey(today),
    currentMonthKey: getMonthKey(today)
  };
  
  // Process each date
  dateKeys.forEach(dateStr => {
    const date = new Date(dateStr);
    
    // Skip future dates
    if (date > today) return;
    
    // Get week and month keys
    const weekKey = getWeekKey(date);
    const monthKey = getMonthKey(date);
    
    // Add to weeks
    if (!result.weeks[weekKey]) {
      result.weeks[weekKey] = [];
    }
    result.weeks[weekKey].push(dateStr);
    
    // Add to months
    if (!result.months[monthKey]) {
      result.months[monthKey] = [];
    }
    result.months[monthKey].push(dateStr);
  });
  
  return result;
};

// Get week key (YYYY-Www format)
const getWeekKey = (date) => {
  const d = new Date(date);
  const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
  const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
  const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
};

// Get month key (YYYY-MM format)
const getMonthKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
};

// Generate a weekly summary using AI
const generateWeeklySummary = async (storage, dates, weekKey) => {
  try {
    // Gather data for these dates
    const weekData = {};
    dates.forEach(dateStr => {
      weekData[dateStr] = storage[dateStr] || {};
    });
    
    // Build a prompt for the AI to summarize the week
    const prompt = `
      Summarize the following week of user data into a concise but informative summary. 
      Focus on patterns and notable events. Keep the summary under 200 words.
      
      Week: ${weekKey}
      Data: ${JSON.stringify(weekData, null, 2)}
      
      Format your response as a JSON object with:
      1. "summary": A concise text summarizing the week
      2. "moodPattern": The predominant mood pattern (if any)
      3. "achievements": Top 2-3 achievements
      4. "challenges": Any notable challenges
      5. "metrics": Key metrics like average task completion percentage, workout count, etc.
      
      Only return the JSON object, nothing else.
    `;
    
    // Call AI to generate summary
    const result = await generateContent(prompt);
    
    try {
      // Try to parse the result as JSON
      return JSON.parse(extractJSON(result));
    } catch (e) {
      console.error("Failed to parse weekly summary JSON:", e);
      
      // Return a basic summary if parsing failed
      return {
        summary: "Data available for this week but summary generation failed.",
        moodPattern: "Unknown",
        achievements: [],
        challenges: [],
        metrics: {},
        error: true,
        dates: dates
      };
    }
  } catch (error) {
    console.error("Error generating weekly summary:", error);
    return {
      summary: "Error generating summary for this week.",
      dates: dates,
      error: true
    };
  }
};

// Generate a monthly summary using AI
const generateMonthlySummary = async (storage, dates, monthKey) => {
  try {
    // For monthly summaries, we don't need to send all the data
    // Just count occurrences and extract key metrics
    
    // Extract some statistics
    const metrics = {
      totalDays: dates.length,
      moodCounts: {},
      workoutCount: 0,
      avgTaskCompletion: 0,
      completionDataPoints: 0,
      journalEntryCount: 0,
      focusSessionCount: 0
    };
    
    // Process each date
    dates.forEach(dateStr => {
      const dayData = storage[dateStr] || {};
      
      // Count moods
      if (dayData.morningMood) {
        metrics.moodCounts[dayData.morningMood] = (metrics.moodCounts[dayData.morningMood] || 0) + 1;
      }
      if (dayData.eveningMood) {
        metrics.moodCounts[dayData.eveningMood] = (metrics.moodCounts[dayData.eveningMood] || 0) + 1;
      }
      
      // Count workouts
      if (dayData.workout || (dayData.workouts && dayData.workouts.length > 0)) {
        metrics.workoutCount++;
      }
      
      // Calculate task completion
      if (dayData.checked) {
        const total = Object.keys(dayData.checked).length;
        const completed = Object.values(dayData.checked).filter(Boolean).length;
        if (total > 0) {
          metrics.avgTaskCompletion += (completed / total) * 100;
          metrics.completionDataPoints++;
        }
      }
      
      // Count journal entries
      if (dayData.notes && dayData.notes.length > 0) {
        metrics.journalEntryCount++;
      }
    });
    
    // Calculate average task completion
    if (metrics.completionDataPoints > 0) {
      metrics.avgTaskCompletion = Math.round(metrics.avgTaskCompletion / metrics.completionDataPoints);
    }
    
    // Count focus sessions for this month
    if (storage.focusSessions) {
      metrics.focusSessionCount = storage.focusSessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return getMonthKey(sessionDate) === monthKey;
      }).length;
    }
    
    // Build a prompt for the AI to summarize the month
    const prompt = `
      Create a brief summary of the user's month based on these metrics. 
      Keep it under 150 words and focus on the most important patterns.
      
      Month: ${monthKey}
      Metrics: ${JSON.stringify(metrics, null, 2)}
      
      Format your response as a JSON object with:
      1. "summary": A concise text summarizing the month
      2. "dominantMood": The most frequent mood
      3. "keyInsight": One key insight about the month
      4. "metrics": The processed metrics
      
      Only return the JSON object, nothing else.
    `;
    
    // Call AI to generate summary
    const result = await generateContent(prompt);
    
    try {
      // Try to parse the result as JSON
      return {
        ...JSON.parse(extractJSON(result)),
        rawMetrics: metrics
      };
    } catch (e) {
      console.error("Failed to parse monthly summary JSON:", e);
      
      // Return a basic summary if parsing failed
      return {
        summary: "Data available for this month but summary generation failed.",
        dominantMood: Object.entries(metrics.moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown",
        keyInsight: "Summary generation failed.",
        metrics: metrics,
        rawMetrics: metrics,
        error: true
      };
    }
  } catch (error) {
    console.error("Error generating monthly summary:", error);
    return {
      summary: "Error generating summary for this month.",
      rawMetrics: {
        totalDays: dates.length
      },
      error: true
    };
  }
};

// Get recent detailed data (last 7 days)
const getRecentDetailedData = (storage, today) => {
  const result = {};
  
  // Get last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    if (storage[dateStr]) {
      // Include full data for the last 7 days
      result[dateStr] = storage[dateStr];
    }
  }
  
  return result;
};

// Call AI with prepared context
const fetchFromAI = async (context) => {
  try {
    // Build a system prompt that establishes the coach's persona
    const systemPrompt = `
      You are a supportive and insightful day coach within the ZenTracker wellness app. 
      Your role is to provide users with personalized guidance, insights, and encouragement based on their tracked data.

      You have access to the user's:
      - Mood and energy levels (morning and evening)
      - Task completion rates
      - Workout history
      - Focus session statistics
      - Habit tracking data
      - Journal entries
      
      For recent data (last 7 days), you have detailed information. For older data, you have weekly and monthly summaries.
      
      Respond conversationally and empathetically. Be concise but thorough (under 250 words). When appropriate, ask follow-up questions to deepen the conversation.
      
      Your responses should include:
      1. A thoughtful, personalized message responding to the user's context
      2. Any relevant observations or patterns you notice in their data
      3. Actionable suggestions when appropriate
      4. A conversational question to continue the dialogue
      
      Current date: ${context.userData.today}
    `;
    
    // Build a user prompt based on the context
    const userPrompt = buildUserPrompt(context);
    
    // Call the AI service
    const response = await generateContent(`
      ${systemPrompt}
      
      ${userPrompt}
      
      Please format your response in a conversational tone. At the end, include 2-3 suggested replies the user might want to choose from, in the format:
      
      SUGGESTED_REPLIES:
      - Suggestion 1
      - Suggestion 2
      - Suggestion 3
    `);
    
    // Extract suggestions from the response
    const suggestions = extractSuggestions(response);
    
    // Remove suggestions from the main message
    let message = response.replace(/SUGGESTED_REPLIES:[\s\S]*$/, '').trim();
    
    return {
      message,
      suggestions
    };
  } catch (error) {
    console.error('Error with AI API:', error);
    throw error;
  }
};

// Build user prompt based on context
const buildUserPrompt = (context) => {
  const { messageType, userData, userMessage, specificContext } = context;
  
  // Base prompt with user data summary
  let prompt = `
    Here's a summary of the user's data:
    
    Recent data (last 7 days): ${Object.keys(userData.recentData).length} days
    Weekly summaries: ${Object.keys(userData.weeklySummaries).length} weeks
    Monthly summaries: ${Object.keys(userData.monthlySummaries).length} months
    Active habits: ${userData.habits.length}
    Recent focus sessions: ${userData.focusSessions.length}
    Recent workouts: ${userData.workouts.length}
  `;
  
  // Add specific context based on message type
  switch (messageType) {
    case 'morningMood':
      prompt += `
        The user has just logged their morning mood as "${specificContext}".
        Their energy level is ${userData.recentData[userData.today]?.morningEnergy || 'not specified'}.
        Acknowledge this mood, provide a supportive response, and offer a suggestion relevant to their current state.
      `;
      break;
      
    case 'eveningMood':
      prompt += `
        The user has just logged their evening mood as "${specificContext}".
        Their morning mood today was "${userData.recentData[userData.today]?.morningMood || 'not specified'}".
        Their evening energy level is ${userData.recentData[userData.today]?.eveningEnergy || 'not specified'}.
        Reflect on how their day went, considering the change in mood throughout the day.
      `;
      break;
      
    case 'workout':
      prompt += `
        The user has just completed a workout.
        Details: ${JSON.stringify(getLatestWorkout(userData))}
        Acknowledge this achievement and provide encouragement or recovery advice.
      `;
      break;
      
    case 'journalEntry':
      prompt += `
        The user has just written in their journal.
        Entry: "${getLatestJournalEntry(userData)}"
        Acknowledge this reflective practice and ask an insightful follow-up question.
      `;
      break;
      
    case 'allTasksCompleted':
      prompt += `
        The user has completed all their tasks for today!
        Task list: ${JSON.stringify(getTodaysTasks(userData))}
        Celebrate this achievement and offer an insight about their productivity.
      `;
      break;
      
    case 'progressMade':
      prompt += `
        The user has made good progress on their tasks today, but still has some remaining.
        Completed: ${getCompletedTaskCount(userData)} tasks
        Remaining: ${getRemainingTaskCount(userData)} tasks
        Acknowledge their progress and offer encouragement.
      `;
      break;
      
    case 'focusSession':
      prompt += `
        The user has just completed a focus session.
        Session details: ${JSON.stringify(specificContext)}
        Comment on their focus session and offer a relevant tip if they had interruptions.
      `;
      break;
      
    case 'userQuery':
      prompt += `
        The user has asked: "${userMessage}"
        Provide a helpful response based on their data. If they're asking about patterns or insights, analyze their data to give a meaningful answer.
      `;
      break;
      
    default:
      prompt += `
        Generate a supportive check-in message for the user based on their recent data.
        Look for meaningful insights, correlations, or patterns that might be helpful for them.
      `;
  }
  
  // Add detailed recent data for better context
  prompt += `\nRecent data details (last few days):\n${JSON.stringify(getRecentDataSummary(userData), null, 2)}`;
  
  return prompt;
};

// Helper functions to extract specific data
const getLatestWorkout = (userData) => {
  const today = userData.today;
  
  // Check if there's a workout today
  if (userData.recentData[today]?.workout) {
    return userData.recentData[today].workout;
  }
  
  if (userData.recentData[today]?.workouts && userData.recentData[today].workouts.length > 0) {
    return userData.recentData[today].workouts[userData.recentData[today].workouts.length - 1];
  }
  
  // Check recent workouts
  if (userData.workouts && userData.workouts.length > 0) {
    return userData.workouts[userData.workouts.length - 1];
  }
  
  return null;
};

const getLatestJournalEntry = (userData) => {
  const today = userData.today;
  
  // Check if there's a journal entry today
  if (userData.recentData[today]?.notes) {
    return userData.recentData[today].notes;
  }
  
  // Find the most recent journal entry
  const recentDates = Object.keys(userData.recentData).sort().reverse();
  for (const date of recentDates) {
    if (userData.recentData[date].notes) {
      return userData.recentData[date].notes;
    }
  }
  
  return "No recent journal entries found.";
};

const getTodaysTasks = (userData) => {
  const today = userData.today;
  if (!userData.recentData[today]?.checked) return [];
  
  const tasks = userData.recentData[today].checked;
  return Object.keys(tasks);
};

const getCompletedTaskCount = (userData) => {
  const today = userData.today;
  if (!userData.recentData[today]?.checked) return 0;
  
  const tasks = userData.recentData[today].checked;
  return Object.values(tasks).filter(Boolean).length;
};

const getRemainingTaskCount = (userData) => {
  const today = userData.today;
  if (!userData.recentData[today]?.checked) return 0;
  
  const tasks = userData.recentData[today].checked;
  return Object.values(tasks).filter(v => !v).length;
};

const getRecentDataSummary = (userData) => {
  const summary = {};
  
  // Get the 3 most recent days with data
  const recentDates = Object.keys(userData.recentData).sort().reverse().slice(0, 3);
  
  recentDates.forEach(date => {
    const dayData = userData.recentData[date];
    
    summary[date] = {
      date,
      morningMood: dayData.morningMood,
      eveningMood: dayData.eveningMood,
      morningEnergy: dayData.morningEnergy,
      eveningEnergy: dayData.eveningEnergy,
      hasWorkout: !!(dayData.workout || (dayData.workouts && dayData.workouts.length > 0)),
      hasJournal: !!dayData.notes,
      taskCompletion: calculateTaskCompletion(dayData)
    };
  });
  
  return summary;
};

// Helper to calculate task completion percentage
const calculateTaskCompletion = (dayData) => {
  if (!dayData.checked) return null;
  
  const totalTasks = Object.keys(dayData.checked).length;
  if (totalTasks === 0) return null;
  
  const completedTasks = Object.values(dayData.checked).filter(Boolean).length;
  return Math.round((completedTasks / totalTasks) * 100);
};

// Extract suggested replies from the AI response
const extractSuggestions = (response) => {
  const suggestionsMatch = response.match(/SUGGESTED_REPLIES:[\s\S]*$/);
  
  if (!suggestionsMatch) return [];
  
  // Extract suggestions lines
  const suggestionsText = suggestionsMatch[0].replace('SUGGESTED_REPLIES:', '').trim();
  
  // Split by lines and clean up
  return suggestionsText
    .split('\n')
    .map(line => line.trim().replace(/^-\s*/, ''))
    .filter(line => line.length > 0);
};

// Extract JSON from a string that might contain extra text
const extractJSON = (text) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : '{}';
};

export default { fetchCoachResponse };