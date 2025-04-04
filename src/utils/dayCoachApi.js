import { getStorage, setStorage } from './storage';
import { generateTasks, generateContent } from './ai-service';
import { formatDateForStorage } from './dateUtils';

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
  const todayStr = formatDateForStorage(today);
  
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
  
  // Get finance data (filtered to relevant dates)
  const financeData = getRelevantFinanceData(storage, today);
  
  // Get nutrition data (filtered to relevant dates)
  const nutritionData = getRelevantNutritionData(storage, today);
  
  // NEW: Get detailed journal entries (last 14 days)
  const journalData = getRecentJournalData(storage, today);
  
  // Prepare final data object
  return {
    today: todayStr,
    recentData,
    weeklySummaries: summaries.weeklySummaries,
    monthlySummaries: summaries.monthlySummaries,
    // Additional user context
    habits: storage.habits || [],
    focusSessions: (storage.focusSessions || []).slice(-10), // Last 10 focus sessions
    workouts: (storage.completedWorkouts || []).slice(-10), // Last 10 workouts
    finance: financeData, // Add finance data
    nutrition: nutritionData, // Add nutrition data
    journal: journalData, // NEW: Add detailed journal data
  };
};

// New function to get recent journal entries in a format Solaris can use
const getRecentJournalData = (storage, today) => {
  const result = {
    entries: [],
    stats: {
      entryCount: 0,
      avgMood: null,
      avgEnergy: null,
      recentCategories: [],
      peopleMentioned: []
    },
    recentPeople: {}
  };
  
  // If no meditation data exists, return empty result
  if (!storage.meditationData || !storage.meditationData.journalEntries) {
    return result;
  }
  
  // Create date threshold for filtering (14 days ago)
  const threshold = new Date(today);
  threshold.setDate(threshold.getDate() - 14);
  
  // Filter entries to only include recent ones
  const recentEntries = storage.meditationData.journalEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= threshold;
  });
  
  // Sort entries by date (newest first)
  recentEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Calculate stats for these entries
  let moodSum = 0;
  let moodCount = 0;
  let energySum = 0;
  let energyCount = 0;
  const categoryCounts = {};
  const peopleCounts = {};
  
  recentEntries.forEach(entry => {
    // Calculate mood average
    if (entry.mood !== undefined) {
      moodSum += entry.mood;
      moodCount++;
    }
    
    // Calculate energy average
    if (entry.energy !== undefined) {
      energySum += entry.energy;
      energyCount++;
    }
    
    // Count categories
    if (entry.categories && Array.isArray(entry.categories)) {
      entry.categories.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    }
    
    // Count people mentioned
    if (entry.people && Array.isArray(entry.people)) {
      entry.people.forEach(person => {
        peopleCounts[person] = (peopleCounts[person] || 0) + 1;
      });
    }
  });
  
  // Get top categories and people
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));
    
  const topPeople = Object.entries(peopleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([person, count]) => ({ person, count }));
  
  // Populate stats
  result.stats.entryCount = recentEntries.length;
  result.stats.avgMood = moodCount > 0 ? moodSum / moodCount : null;
  result.stats.avgEnergy = energyCount > 0 ? energySum / energyCount : null;
  result.stats.recentCategories = topCategories;
  result.stats.peopleMentioned = topPeople;
  
  // Add entries to result (simplified for Solaris's needs)
  result.entries = recentEntries.map(entry => ({
    id: entry.id,
    title: entry.title,
    text: entry.text,
    date: entry.date || entry.timestamp.split('T')[0],
    timestamp: entry.timestamp,
    mood: entry.mood,
    energy: entry.energy,
    categories: entry.categories || [],
    people: entry.people || [],
    tags: entry.tags || []
  }));
  
  // Add a special section for people mentioned and their associated moods
  // This helps Solaris understand relationships
  const peopleData = {};
  
  recentEntries.forEach(entry => {
    if (entry.people && Array.isArray(entry.people) && entry.mood !== undefined) {
      entry.people.forEach(person => {
        if (!peopleData[person]) {
          peopleData[person] = {
            mentions: 0,
            moodSum: 0,
            moodCount: 0,
            entries: []
          };
        }
        
        peopleData[person].mentions++;
        peopleData[person].moodSum += entry.mood;
        peopleData[person].moodCount++;
        peopleData[person].entries.push({
          id: entry.id,
          date: entry.date || entry.timestamp.split('T')[0],
          mood: entry.mood
        });
      });
    }
  });
  
  // Calculate average mood for each person
  Object.keys(peopleData).forEach(person => {
    peopleData[person].avgMood = peopleData[person].moodCount > 0 
      ? peopleData[person].moodSum / peopleData[person].moodCount 
      : null;
  });
  
  result.recentPeople = peopleData;
  
  return result;
};

// Get finance data filtered to relevant dates (recent period)
const getRelevantFinanceData = (storage, today) => {
  // If no finance data exists, return an empty object
  if (!storage.finance) return {};
  
  const finance = { ...storage.finance };
  
  // Create date threshold for filtering (7 days ago)
  const threshold = new Date(today);
  threshold.setDate(threshold.getDate() - 7);
  
  // Filter transactions to only include recent ones
  if (finance.transactions && Array.isArray(finance.transactions)) {
    finance.transactions = finance.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= threshold;
    });
  }
  
  // Include all budgets and goals (they're relevant regardless of date)
  // Include all recurring transactions (they're relevant for planning)
  // Include categories and settings (they're metadata)
  
  return finance;
};

// Get nutrition data filtered to relevant dates (recent period)
const getRelevantNutritionData = (storage, today) => {
  // If no nutrition data exists, return an empty object
  if (!storage.nutrition) return {};
  
  const nutrition = {};
  
  // Create date threshold for filtering (7 days ago)
  const threshold = new Date(today);
  threshold.setDate(threshold.getDate() - 7);
  
  // Filter nutrition entries by date
  for (const dateKey in storage.nutrition) {
    const entryDate = new Date(dateKey);
    if (entryDate >= threshold) {
      nutrition[dateKey] = storage.nutrition[dateKey];
    }
  }
  
  return nutrition;
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
    const dateStr = formatDateForStorage(date);
    
    if (storage[dateStr]) {
      // Include full data for the last 7 days
      result[dateStr] = storage[dateStr];
    }
  }
  
  return result;
};


const buildUserPrompt = (context) => {
  const { messageType, userData, userMessage, specificContext, previousMessages } = context;
  
  // Base prompt with user data summary
  let prompt = `
    Here's a summary of the user's data:
    
    Recent data (last 7 days): ${Object.keys(userData.recentData).length} days
    Weekly summaries: ${Object.keys(userData.weeklySummaries).length} weeks
    Monthly summaries: ${Object.keys(userData.monthlySummaries).length} months
    Active habits: ${userData.habits.length}
    Recent focus sessions: ${userData.focusSessions.length}
    Recent workouts: ${userData.workouts.length}
    Finance data: ${userData.finance?.transactions ? `${userData.finance.transactions.length} recent transactions` : 'None available'}
    Nutrition data: ${Object.keys(userData.nutrition || {}).length > 0 ? `Available for ${Object.keys(userData.nutrition).length} recent days` : 'None available'}
    Journal entries: ${userData.journal?.entries.length || 0} entries in the last 14 days
  `;

  // Add conversation history for context
  if (previousMessages && previousMessages.length > 0) {
    prompt += `\n\nRECENT CONVERSATION HISTORY (newest last):\n`;
    previousMessages.forEach((msg, index) => {
      const role = msg.sender === 'coach' ? 'SOLARIS' : 'USER';
      prompt += `\n${role}: ${msg.content}\n`;
    });
    prompt += `\nPlease continue this conversation thread naturally.\n`;
  }
  
  // Add specific context based on message type
  switch (messageType) {
    case 'journalEntry':
      // NEW: Add specific handling for journal entries
      prompt += `
        The user has just added a new journal entry.
        Entry: "${specificContext.text}"
        Mood: ${specificContext.mood || 'not specified'}
        Energy: ${specificContext.energy || 'not specified'}
        ${specificContext.people && specificContext.people.length > 0 ? `People mentioned: ${specificContext.people.join(', ')}` : ''}
        ${specificContext.categories && specificContext.categories.length > 0 ? `Categories: ${specificContext.categories.join(', ')}` : ''}
        
        IMPORTANT INSTRUCTIONS:
        1. Pay special attention to their journal content to personalize your response.
        2. Extract topics, emotions, challenges, goals or people mentioned in their journal.
        3. Acknowledge any personal or social events they mention.
        4. If they mentioned any people by name, reference these social connections in your response.
        5. Make your response feel personalized by connecting to something specific they mentioned.
        6. Based on the content of their journal, suggest an action, habit, or activity that feels appropriate - this could be something new or a refinement of something they already do.
      `;
      break;
    case 'morningMood':
      prompt += `
        The user has just logged their morning mood as "${specificContext.mood}".
        Their energy level is ${specificContext.energy || 'not specified'}.
        ${userData.journal && userData.journal.entries.length > 0 ? 
          `They have ${userData.journal.entries.length} recent journal entries. Their average mood in recent entries is ${userData.journal.stats.avgMood?.toFixed(1) || 'unknown'}.` : 
          'They haven\'t written journal entries recently.'}
        
        Acknowledge this mood, provide a supportive response, and offer a suggestion relevant to their current state.
        The suggestion could be a new task or a way to adapt an existing habit - choose based on what seems most helpful for their current mood and energy level.
      `;
      break;
      
    case 'eveningMood':
      prompt += `
        The user has just logged their evening mood as "${specificContext.eveningMood}".
        Their morning mood today was "${specificContext.morningMood || 'not specified'}".
        Their evening energy level is ${specificContext.eveningEnergy || 'not specified'}.
        Reflect on how their day went, considering the change in mood throughout the day.
        Based on this pattern, suggest either a new evening routine or a modification to their existing habits that could improve their wellbeing.
      `;
      break;
      
    case 'workout':
      prompt += `
        The user has just completed a workout.
        Details: ${JSON.stringify(specificContext.workout)}
        Acknowledge this achievement and provide encouragement.
        Based on their workout history and preferences, suggest either a complementary exercise they might enjoy or a completely new physical activity that aligns with their fitness goals.
      `;
      break;
      
    case 'journalEntry':
      prompt += `
        The user has made a journal entry.
        Entry: "${specificContext.notes}"
        
        IMPORTANT INSTRUCTIONS:
        1. Pay special attention to their journal content to personalize your response.
        2. Extract topics, emotions, challenges, goals or people mentioned in their journal.
        3. Acknowledge any personal or social events they mention.
        4. If they mentioned any people by name, reference these social connections in your response.
        5. Make your response feel personalized by connecting to something specific they mentioned.
        6. Based on the content of their journal, suggest an action, habit, or activity that feels appropriate - this could be something new or a refinement of something they already do.
      `;
      break;
      
    case 'allTasksCompleted':
      prompt += `
        The user has completed all their tasks for today!
        Task list: ${JSON.stringify(specificContext.tasks)}
        Celebrate this achievement and offer an insight about their productivity.
        Based on their task history and accomplishments, suggest something they might enjoy - either a reward activity or a new challenge that builds on their success.
      `;
      break;
      
    case 'progressMade':
      prompt += `
        The user has made good progress on their tasks today, but still has some remaining.
        Completed: ${specificContext.completed} tasks
        Remaining: ${specificContext.total - specificContext.completed} tasks
        Recently completed: ${JSON.stringify(specificContext.recentlyCompleted)}
        Acknowledge their progress and offer encouragement.
        Suggest a specific strategy to help with their remaining tasks - this could be a new approach or an improvement to their current method, whichever seems more appropriate.
      `;
      break;
      
    case 'sleep':
      prompt += `
        The user has logged their sleep data.
        Details: ${JSON.stringify(specificContext.sleep)}
        
        Comment on their sleep quality and pattern. Note any factors they've identified that affected their sleep.
        Based on their sleep data trends, suggest an appropriate action - this could be a new sleep habit or a refinement of their current routine.
      `;
      break;
      
    case 'timeBasedGreeting':
      prompt += `
        It's ${specificContext.timeOfDay} on ${specificContext.date}.
        
        Check in with the user and suggest something appropriate for the time of day and their typical patterns - this could be something that fits their routine or a refreshing change.
      `;
      break;
      
    case 'userQuery':
      prompt += `
        The user has asked: "${userMessage}"
        
        Provide a helpful, specific response based on their data and prior conversation. The user's question may be about 
        their tasks, habits, mood, energy, workouts, focus sessions, finance, nutrition, or other tracked data.
        
        Be specific - if they're asking about their data, reference the actual items from their data
        in your response (like specific task names, habit details, etc.) rather than being vague.

        If they ask for suggestions, determine what would be most helpful based on context:
        - Sometimes suggest entirely new activities if they're looking for fresh inspiration
        - Other times recommend improvements to existing habits if consistency and gradual progress are important
        - Always consider their mood, energy levels, and the conversation flow when deciding
        
        Below you'll find detailed information about the user's recent activities and data.
        Use this information to give them a personalized, relevant answer.
      `;
      break;
      
    default:
      prompt += `
        Generate a supportive check-in message for the user based on their recent data.
        Look for meaningful insights, correlations, or patterns that might be helpful for them.
      `;
  }
  
  // Rest of the function remains the same - adding data for context
  const today = userData.today;
  const todayData = userData.recentData[today] || {};
  
  prompt += `\n\nTODAY'S COMPLETE DATA (${today}):\n${JSON.stringify(todayData, null, 2)}`;
  
  // Add RECENT DAYS' complete data
  prompt += `\n\nRECENT DAYS' COMPLETE DATA:\n${JSON.stringify(userData.recentData, null, 2)}`;
  
  // Add habits data
  prompt += `\n\nHABITS DATA:\n${JSON.stringify(userData.habits, null, 2)}`;
  
  // Add focus sessions
  prompt += `\n\nRECENT FOCUS SESSIONS:\n${JSON.stringify(userData.focusSessions, null, 2)}`;
  
  // Add workouts
  prompt += `\n\nRECENT WORKOUTS:\n${JSON.stringify(userData.workouts, null, 2)}`;
  
  // Add finance data
  if (userData.finance && Object.keys(userData.finance).length > 0) {
    prompt += `\n\nFINANCE DATA:\n${JSON.stringify(userData.finance, null, 2)}`;
  }
  
  // Add nutrition data
  if (userData.nutrition && Object.keys(userData.nutrition).length > 0) {
    prompt += `\n\nNUTRITION DATA:\n${JSON.stringify(userData.nutrition, null, 2)}`;
  }

  // Add NEW section for detailed journal data if available
  if (userData.journal && userData.journal.entries.length > 0) {
    prompt += `\n\nRECENT JOURNAL DATA:\n`;
    
    // Add journal stats
    prompt += `Journal Stats: ${userData.journal.stats.entryCount} entries in the last 14 days\n`;
    prompt += `Average Mood: ${userData.journal.stats.avgMood?.toFixed(1) || 'unknown'}/5\n`;
    prompt += `Average Energy: ${userData.journal.stats.avgEnergy?.toFixed(1) || 'unknown'}/3\n`;
    
    // Add top categories if available
    if (userData.journal.stats.recentCategories.length > 0) {
      prompt += `Top Categories: ${userData.journal.stats.recentCategories.map(c => c.category).join(', ')}\n`;
    }
    
    // Add people mentioned if available
    if (userData.journal.stats.peopleMentioned.length > 0) {
      prompt += `People Mentioned: ${userData.journal.stats.peopleMentioned.map(p => p.person).join(', ')}\n`;
    }
    
    // Add detailed entries (limit to most recent 5 to keep prompt size reasonable)
    prompt += `\nMost Recent Journal Entries:\n`;
    userData.journal.entries.slice(0, 5).forEach(entry => {
      prompt += `\n[${new Date(entry.timestamp).toLocaleDateString()}] ${entry.title}\n`;
      prompt += `Mood: ${entry.mood !== undefined ? `${entry.mood}/5` : 'not specified'}, Energy: ${entry.energy !== undefined ? `${entry.energy}/3` : 'not specified'}\n`;
      
      if (entry.people && entry.people.length > 0) {
        prompt += `People: ${entry.people.join(', ')}\n`;
      }
      
      if (entry.categories && entry.categories.length > 0) {
        prompt += `Categories: ${entry.categories.join(', ')}\n`;
      }
      
      prompt += `${entry.text.substring(0, 300)}${entry.text.length > 300 ? '...' : ''}\n`;
    });
    
    // Add relationship data if available
    if (Object.keys(userData.journal.recentPeople).length > 0) {
      prompt += `\nPeople Data from Journal:\n`;
      Object.entries(userData.journal.recentPeople).forEach(([person, data]) => {
        prompt += `${person}: ${data.mentions} mentions, Average mood: ${data.avgMood?.toFixed(1) || 'unknown'}/5\n`;
      });
    }
  }
  
  // Add weekly summaries (but limit to prevent prompt from getting too large)
  const recentWeeklySummaries = Object.entries(userData.weeklySummaries || {})
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 2)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
    
  prompt += `\n\nRECENT WEEKLY SUMMARIES:\n${JSON.stringify(recentWeeklySummaries, null, 2)}`;
  
  return prompt;
};

// Also modify the system prompt in the fetchFromAI function for better balance:

const fetchFromAI = async (context) => {
  try {
    // Build a system prompt that establishes the coach's persona
    // In fetchFromAI function in src/utils/dayCoachApi.js
const systemPrompt = `
You are Solaris, a supportive, friendly day coach within the ZenTracker app. 
Your role is to be a compassionate companion, offering insights, encouragement, suggestions and guide the user and be there to listen to him.

Keep your responses casual, warm and concise. Write like a supportive friend texting, not a formal coach writing an email.

Be thoughtfully varied in your suggestions - don't focus repeatedly on habits unless the user specifically mentions them. 
Consider the user's full context including their mood, energy, focus sessions, tasks, journal entries, workouts, nutrition.

Make connections between different aspects of the user's data to provide unique, personalized insights rather than generic advice.

Your responses should be:
- Short (30-70 words)
- Contextually relevant to what the user is currently experiencing
- Varied (don't repeat similar suggestions)
- Empathetic to the user's current state

Vary your conversation style - sometimes ask questions, sometimes offer observations, sometimes give encouragement, you don't have to this everytime only if the user message indicates something you can advise in, otherwise just keep normal conversation going.

Always maintain continuity with the prior conversation and refer back to things previously discussed.

Use thoughtful judgment to determine what kind of suggestions would be most helpful:
       - Sometimes recommend completely new ideas when the user seems open to exploration
       - Other times suggest manageable variations or improvements to existing habits, tasks, hobbies when consistency is important
       - Base this decision on their mood, energy level, and the conversation context
Make use of connections between different aspects of their data (e.g., sleep quality affecting mood) if you see it's relevant to advise the user
Be personalized - avoid generic advice that could apply to anyone
If they mention people in their journals, acknowledge these social connections

On consecutive messages that are not the first of the day don't keep saying "hey" or "hi"

Current date: ${context.userData.today}
You have access to the user's:
- Mood and energy levels (morning and evening)
- Task completion rates
- Workout history
- Focus session statistics
- Habit tracking data
- Journal entries
- Finance data
- Nutrition data
- Previous conversation history
  
For recent data (last 7 days), you have detailed information. For older data, you have weekly and monthly summaries.
`;
    
    // Rest of function remains the same as original fix
    const userPrompt = buildUserPrompt(context);
    
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