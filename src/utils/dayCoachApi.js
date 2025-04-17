import { getStorage, setStorage } from './storage';
import { generateTasks, generateContent } from './ai-service';
import { formatDateForStorage } from './dateUtils';

// Constants for data management
const DATA_LIMITS = {
  RECENT_DAYS_MAX: 5,              // Maximum days of detailed data to send
  JOURNAL_ENTRIES_MAX: 5,          // Maximum journal entries to include
  JOURNAL_TEXT_LENGTH: 200,        // Character length for journal text
  WORKOUTS_MAX: 5,                 // Maximum workouts to include in detail
  FOCUS_SESSIONS_MAX: 3,           // Maximum focus sessions to include
  WEEKLY_SUMMARIES_MAX: 2,         // Maximum weekly summaries to include
  MONTHLY_SUMMARIES_MAX: 1,        // Maximum monthly summaries to include
  PEOPLE_MENTIONED_MAX: 5,         // Maximum people data to include
};

// Smart data filtering function
const filterRelevantData = (data, dataType) => {
  if (!data) return null;
  
  switch(dataType) {
    case 'dailyData':
      return {
        mood: {
          morning: data.morningMood,
          evening: data.eveningMood,
          morningEnergy: data.morningEnergy,
          eveningEnergy: data.eveningEnergy
        },
        taskCompletion: data.checked ? {
          total: Object.keys(data.checked).length,
          completed: Object.values(data.checked).filter(Boolean).length,
          completedTasks: Object.keys(data.checked).filter(key => data.checked[key])
        } : null,
        workouts: data.workouts || (data.workout ? [data.workout] : []),
        journalEntry: data.notes ? {
          exists: true,
          length: data.notes.length
        } : false,
        habitProgress: data.habitProgress || null
      };
    
    case 'workout':
      return {
        id: data.id,
        type: data.type,
        date: data.date,
        time: data.time || data.startTime, // Make sure we include time 
        duration: data.duration,
        intensity: data.intensity, // Keep intensity as requested
        calories: data.calories,
        distance: data.distance,
        notes: data.notes ? data.notes.substring(0, 50) : null
      };
    
    case 'habit':
      return {
        id: data.id,
        name: data.name,
        frequency: data.frequency,
        streak: data.streak,
        lastCompletedDate: data.lastCompletedDate,
        // Include category but not full history
        category: data.category
      };
    
    case 'focusSession':
      return {
        id: data.id,
        startTime: data.startTime,
        duration: data.duration,
        taskCompleted: data.taskCompleted,
        rating: data.rating,
        distractions: data.distractions,
        // Don't include full notes, just a snippet if exists
        notes: data.notes ? `${data.notes.substring(0, 30)}...` : null
      };
    
    case 'journalEntry':
      // For journal entries, keep more data as they're important
      return {
        id: data.id,
        title: data.title,
        date: data.date || data.timestamp?.split('T')[0],
        timestamp: data.timestamp,
        // Include full text for journal entries but cap at reasonable length
        text: data.text.substring(0, DATA_LIMITS.JOURNAL_TEXT_LENGTH) + 
              (data.text.length > DATA_LIMITS.JOURNAL_TEXT_LENGTH ? '...' : ''),
        mood: data.mood,
        energy: data.energy,
        // Keep all people mentioned as they're important for social aspects
        people: data.people || [],
        categories: data.categories || [],
        tags: (data.tags || []).slice(0, 3) // Limit tags to top 3
      };
      
    default:
      return data;
  }
};

// Main entry point for getting responses from the AI coach
export const fetchCoachResponse = async (context) => {
  try {
    // Get the storage settings to determine which approach to use
    const storage = getStorage();
    
    // Check if we should use the two-pass approach
    // Can be configured in settings or set based on performance metrics
    const useTwoPass = storage.settings?.useTwoPassAI !== false; // Default to true
    
    if (useTwoPass) {
      console.log("Using two-pass approach for AI response");
      
      // Get user data with the tiered summarization approach
      const userData = await gatherUserDataWithSummarization();
      
      // Add user data to the context
      const fullContext = {
        ...context,
        userData
      };
      
      // Call the two-pass AI method
      return await fetchFromAI(fullContext);
    } else {
      // Fall back to the original approach
      console.log("Using single-pass approach for AI response");
      
      // Get user data with the tiered summarization approach
      const userData = await gatherUserDataWithSummarization();
      
      // Add user data to the context
      const fullContext = {
        ...context,
        userData
      };
      
      // Call the single-pass fallback method
      return await fallbackSinglePassApproach(fullContext);
    }
  } catch (error) {
    console.error('Error fetching coach response:', error);
    
    // Create a basic error response
    return {
      message: "I'm sorry, I'm having trouble accessing your data right now. Could you try again in a moment?",
      suggestions: [
        "How are you feeling today?",
        "What's on your mind?",
        "Can I help with anything else?"
      ]
    };
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
  
  // Determine optimal time window based on user activity
  const detailedDaysWindow = determineDetailedDataWindow(storage);
  console.log(`Using ${detailedDaysWindow} days for detailed data window based on activity`);
  
  // Get recent detailed data (dynamic window)
  const recentData = {};
  for (let i = 0; i < detailedDaysWindow; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDateForStorage(date);
    
    if (storage[dateStr]) {
      // Filter to only relevant fields rather than full object
      recentData[dateStr] = filterRelevantData(storage[dateStr], 'dailyData');
    }
  }
  
  // Select only the most recent weekly summaries (limited number)
  const recentWeeklySummaries = Object.entries(summaries.weeklySummaries || {})
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, DATA_LIMITS.WEEKLY_SUMMARIES_MAX)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
    
  // Select only the most recent monthly summaries (limited number)
  const recentMonthlySummaries = Object.entries(summaries.monthlySummaries || {})
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, DATA_LIMITS.MONTHLY_SUMMARIES_MAX)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
  
  // Filter habits to relevant fields
  const filteredHabits = (storage.habits || []).map(habit => 
    filterRelevantData(habit, 'habit')
  );
  
  // Get focus sessions with summary for older ones
  const focusSessions = summarizeFocusSessions(
    storage.focusSessions || [], 
    DATA_LIMITS.FOCUS_SESSIONS_MAX
  );
  
  // Get workouts with improved summary for older ones
  const workouts = summarizeWorkouts(
    storage.completedWorkouts || [],
    DATA_LIMITS.WORKOUTS_MAX
  );
  
  // Get finance data (filtered to relevant dates and fields)
  const financeData = getRelevantFinanceData(storage, today);
  
  // Get nutrition data (filtered to relevant dates)
  const nutritionData = getRelevantNutritionData(storage, today);
  
  // Get detailed journal entries with optimized structure
  const journalData = getRecentJournalData(storage, today);
  
  // Get user personal information 
  const personalInfo = storage.dayCoach?.userData?.personalInfo || {
    qualities: [],
    interests: [],
    challenges: [],
    goals: [],
    communicationStyle: 'balanced'
  };
  
  // Prepare final data object
  return {
    today: todayStr,
    recentData,
    weeklySummaries: recentWeeklySummaries,
    monthlySummaries: recentMonthlySummaries,
    habits: filteredHabits,
    focusSessions,
    workouts,
    finance: financeData,
    nutrition: nutritionData,
    journal: journalData,
    personalInfo,
    // Add metadata about the data size
    _meta: {
      detailedDaysIncluded: detailedDaysWindow,
      totalJournalEntries: journalData.stats.entryCount,
      journalEntriesIncluded: journalData.entries.length,
      totalWorkouts: (storage.completedWorkouts || []).length,
      workoutsIncluded: workouts.length,
      totalFocusSessions: (storage.focusSessions || []).length,
      focusSessionsIncluded: focusSessions.length
    }
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
  
  if (!storage.meditationData || !storage.meditationData.journalEntries) {
    return result;
  }
  
  // Create date threshold for filtering (10 days ago instead of 14)
  // Still keeping a good window for journal data but not as excessive
  const threshold = new Date(today);
  threshold.setDate(threshold.getDate() - 10);
  
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
    .slice(0, DATA_LIMITS.PEOPLE_MENTIONED_MAX)
    .map(([person, count]) => ({ person, count }));
  
  // Populate stats
  result.stats.entryCount = recentEntries.length;
  result.stats.avgMood = moodCount > 0 ? moodSum / moodCount : null;
  result.stats.avgEnergy = energyCount > 0 ? energySum / energyCount : null;
  result.stats.recentCategories = topCategories;
  result.stats.peopleMentioned = topPeople;
  
  // Add entries to result (limit to 5 most recent)
  result.entries = recentEntries
    .slice(0, DATA_LIMITS.JOURNAL_ENTRIES_MAX)
    .map(entry => filterRelevantData(entry, 'journalEntry'));
  
  // Special section for people mentioned (important for social aspects)
  const peopleData = {};
  
  // Process all entries for people data (not just the limited set)
  recentEntries.forEach(entry => {
    if (entry.people && Array.isArray(entry.people) && entry.mood !== undefined) {
      entry.people.forEach(person => {
        if (!peopleData[person]) {
          peopleData[person] = {
            mentions: 0,
            moodSum: 0,
            moodCount: 0,
            // Keep track of recent dates mentioned but not full entries
            recentDates: []
          };
        }
        
        peopleData[person].mentions++;
        peopleData[person].moodSum += entry.mood;
        peopleData[person].moodCount++;
        
        // Add date if not already included
        const date = entry.date || entry.timestamp.split('T')[0];
        if (!peopleData[person].recentDates.includes(date)) {
          peopleData[person].recentDates.push(date);
        }
      });
    }
  });
  
  // Add top people data (limited to most mentioned)
  Object.keys(peopleData)
    .sort((a, b) => peopleData[b].mentions - peopleData[a].mentions)
    .slice(0, DATA_LIMITS.PEOPLE_MENTIONED_MAX)
    .forEach(person => {
      result.recentPeople[person] = {
        mentions: peopleData[person].mentions,
        avgMood: peopleData[person].moodCount > 0 
          ? peopleData[person].moodSum / peopleData[person].moodCount 
          : null,
        recentDates: peopleData[person].recentDates.slice(0, 3) // Just keep the 3 most recent dates
      };
    });
  
  return result;
};

// Dynamic time window implementation
const determineDetailedDataWindow = (storage) => {
  // Start with a sensible default range
  const minDays = 3;
  const maxDays = DATA_LIMITS.RECENT_DAYS_MAX;
  
  // Check when the user was last active
  const today = new Date();
  let activeDays = 0;
  
  for (let i = 0; i < maxDays; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDateForStorage(date);
    
    // If we have meaningful data for this day, count it as active
    if (storage[dateStr] && hasSignificantData(storage[dateStr])) {
      activeDays++;
    }
  }
  
  // Return a window size between min and max based on activity
  return Math.max(minDays, Math.min(activeDays + 1, maxDays));
};

// Helper to check if a day has significant data worth including
const hasSignificantData = (dayData) => {
  if (!dayData) return false;
  
  return (
    dayData.morningMood || 
    dayData.eveningMood || 
    (dayData.checked && Object.keys(dayData.checked).length > 0) ||
    dayData.workout || 
    (dayData.workouts && dayData.workouts.length > 0) ||
    (dayData.notes && dayData.notes.length > 30) ||
    (dayData.habitProgress && Object.keys(dayData.habitProgress).length > 0)
  );
};

// Implement workout summary function with the requested fields
const summarizeWorkouts = (workouts, limit = DATA_LIMITS.WORKOUTS_MAX) => {
  if (!workouts || workouts.length === 0) return [];
  
  // Sort by date, newest first
  const sortedWorkouts = [...workouts].sort((a, b) => 
    new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)
  );
  
  // Include most recent workouts with all requested fields
  const recentWorkouts = sortedWorkouts
    .slice(0, limit)
    .map(workout => filterRelevantData(workout, 'workout'));
  
  // For older workouts, create a summary
  if (sortedWorkouts.length > limit) {
    const olderWorkouts = sortedWorkouts.slice(limit);
    
    // Group by type
    const workoutTypes = {};
    let totalDuration = 0;
    let totalIntensity = 0;
    let countWithIntensity = 0;
    
    olderWorkouts.forEach(workout => {
      // Count by type
      const type = workout.type || 'unknown';
      if (!workoutTypes[type]) workoutTypes[type] = 0;
      workoutTypes[type]++;
      
      // Sum duration
      if (workout.duration) {
        totalDuration += parseFloat(workout.duration);
      }
      
      // Sum intensity (if available)
      if (workout.intensity) {
        totalIntensity += parseFloat(workout.intensity);
        countWithIntensity++;
      }
    });
    
    // Add a summary entry
    recentWorkouts.push({
      isSummary: true,
      count: olderWorkouts.length,
      types: Object.entries(workoutTypes).map(([type, count]) => ({ type, count })),
      avgDuration: totalDuration > 0 ? totalDuration / olderWorkouts.length : null,
      avgIntensity: countWithIntensity > 0 ? totalIntensity / countWithIntensity : null,
      dateRange: {
        earliest: olderWorkouts[olderWorkouts.length - 1].date,
        latest: olderWorkouts[0].date
      }
    });
  }
  
  return recentWorkouts;
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

// Helper function to determine relevant data types based on context
const getRelevantDataTypes = (messageType, userMessage = '') => {
  // Start with basic info that's always relevant
  const relevantTypes = ['basic', 'today'];
  
  // Add types based on message type
  switch(messageType) {
    case 'morningMood':
    case 'eveningMood':
      relevantTypes.push('mood', 'journal');
      break;
      
    case 'workout':
      relevantTypes.push('workouts', 'health');
      break;
      
    case 'journalEntry':
      relevantTypes.push('journal', 'mood', 'people');
      break;
      
    case 'allTasksCompleted':
    case 'progressMade':
      relevantTypes.push('tasks', 'habits');
      break;
      
    case 'focusSession':
      relevantTypes.push('focus', 'tasks');
      break;
      
    case 'sleep':
      relevantTypes.push('sleep', 'mood', 'health');
      break;
      
    case 'userQuery':
      // For user queries, check the content to determine relevance
      const lowerQuery = userMessage.toLowerCase();
      
      if (lowerQuery.includes('mood') || lowerQuery.includes('feel') || 
          lowerQuery.includes('emotion') || lowerQuery.includes('happy') || 
          lowerQuery.includes('sad') || lowerQuery.includes('energy')) {
        relevantTypes.push('mood', 'journal');
      }
      
      if (lowerQuery.includes('task') || lowerQuery.includes('todo') || 
          lowerQuery.includes('done') || lowerQuery.includes('complete')) {
        relevantTypes.push('tasks', 'habits');
      }
      
      if (lowerQuery.includes('workout') || lowerQuery.includes('exercise') || 
          lowerQuery.includes('gym') || lowerQuery.includes('run') || 
          lowerQuery.includes('fitness')) {
        relevantTypes.push('workouts', 'health');
      }
      
      if (lowerQuery.includes('focus') || lowerQuery.includes('productivity') || 
          lowerQuery.includes('concentrate') || lowerQuery.includes('distract')) {
        relevantTypes.push('focus', 'tasks');
      }
      
      if (lowerQuery.includes('journal') || lowerQuery.includes('wrote') || 
          lowerQuery.includes('entry')) {
        relevantTypes.push('journal');
      }
      
      if (lowerQuery.includes('sleep') || lowerQuery.includes('rest') || 
          lowerQuery.includes('tired') || lowerQuery.includes('bed')) {
        relevantTypes.push('sleep');
      }
      
      if (lowerQuery.includes('finance') || lowerQuery.includes('money') || 
          lowerQuery.includes('spend') || lowerQuery.includes('budget')) {
        relevantTypes.push('finance');
      }
      
      if (lowerQuery.includes('nutrition') || lowerQuery.includes('food') || 
          lowerQuery.includes('eat') || lowerQuery.includes('diet')) {
        relevantTypes.push('nutrition');
      }
      
      if (lowerQuery.includes('friend') || lowerQuery.includes('people') || 
          lowerQuery.includes('social') || lowerQuery.includes('relationship')) {
        relevantTypes.push('journal', 'people');
      }
      
      if (lowerQuery.includes('history') || lowerQuery.includes('trend') || 
          lowerQuery.includes('pattern') || lowerQuery.includes('progress') ||
          lowerQuery.includes('over time') || lowerQuery.includes('last week') ||
          lowerQuery.includes('last month')) {
        relevantTypes.push('history', 'recent');
      }
      
      // If we couldn't determine specific relevance, include a broader context
      if (relevantTypes.length <= 2) { // Just the basics
        relevantTypes.push('mood', 'tasks', 'journal', 'recent');
      }
      break;
      
    default:
      // For general or check-in messages, include a moderate amount of context
      relevantTypes.push('mood', 'tasks', 'journal');
  }
  
  return relevantTypes;
};


const buildUserPrompt = (context) => {
  const { messageType, userData, userMessage, specificContext, previousMessages } = context;
  
  // Track token usage for analysis
  let estimatedTokens = 0;
  const trackTokens = (section, text) => {
    // Rough estimate: ~4 chars per token
    const tokens = Math.ceil(text.length / 4);
    estimatedTokens += tokens;
    console.log(`${section}: ~${tokens} tokens (total: ~${estimatedTokens})`);
    return text;
  };
  
  // Determine which data types are relevant for this interaction
  const relevantDataTypes = getRelevantDataTypes(messageType, userMessage);
  console.log(`Relevant data types for this interaction: ${relevantDataTypes.join(', ')}`);
  
  // Base prompt with user data summary - always include
  let prompt = trackTokens("Base prompt", `
    Here's a summary of the user's data:
    
    Recent data (last ${userData._meta.detailedDaysIncluded} days): ${Object.keys(userData.recentData).length} days
    Weekly summaries: ${Object.keys(userData.weeklySummaries).length} weeks
    Monthly summaries: ${Object.keys(userData.monthlySummaries).length} months
    Active habits: ${userData.habits.length}
    Recent focus sessions: ${userData._meta.focusSessionsIncluded} (out of ${userData._meta.totalFocusSessions} total)
    Recent workouts: ${userData._meta.workoutsIncluded} (out of ${userData._meta.totalWorkouts} total)
    Journal entries: ${userData._meta.journalEntriesIncluded} (out of ${userData.journal.stats.entryCount} in the last 10 days)
    Finance data: ${userData.finance?.transactions ? `${userData.finance.transactions.length} recent transactions` : 'None available'}
    Nutrition data: ${Object.keys(userData.nutrition || {}).length > 0 ? `Available for ${Object.keys(userData.nutrition).length} recent days` : 'None available'}
  `);

  // Add personal information if available - always include
  if (userData.personalInfo) {
    prompt += trackTokens("Personal info", `\n\nUSER PERSONAL INFORMATION:
      ${userData.personalInfo.qualities && userData.personalInfo.qualities.length > 0 
        ? `\nQualities & Strengths: ${userData.personalInfo.qualities.join(', ')}` : ''}
      ${userData.personalInfo.interests && userData.personalInfo.interests.length > 0 
        ? `\nInterests & Hobbies: ${userData.personalInfo.interests.join(', ')}` : ''}
      ${userData.personalInfo.challenges && userData.personalInfo.challenges.length > 0 
        ? `\nChallenges & Difficulties: ${userData.personalInfo.challenges.join(', ')}` : ''}
      ${userData.personalInfo.goals && userData.personalInfo.goals.length > 0 
        ? `\nGoals & Aspirations: ${userData.personalInfo.goals.join(', ')}` : ''}
      ${userData.personalInfo.communicationStyle 
        ? `\nPreferred Communication Style: ${userData.personalInfo.communicationStyle}` : ''}
      
      IMPORTANT INSTRUCTIONS FOR PERSONALIZING YOUR RESPONSE:
      1. Take into account the user's qualities, interests, challenges, and goals when relevant
      2. Be empathetic about their specific challenges
      3. Align suggestions with their goals and interests or if none are defined suggest based on the rest of the information, don't be afraid to suggest new things
      4. Emphasize and encourage their strengths and qualities
      5. Match your communication style to their preference (direct, balanced, or supportive)
      6. When making suggestions, consider how they relate to the user's specific challenges and goals
      7. Use specific examples that connect to their interests or totally new but that can interest them when possible
    `);
  }

  // Add conversation history for context - always include
  if (previousMessages && previousMessages.length > 0) {
    const conversationContext = `\n\nRECENT CONVERSATION HISTORY (newest last):\n${
      previousMessages.map((msg, index) => {
        const role = msg.sender === 'coach' ? 'SOLARIS' : 'USER';
        return `\n${role}: ${msg.content}\n`;
      }).join('')
    }\nPlease continue this conversation thread naturally.\n`;
    
    prompt += trackTokens("Conversation history", conversationContext);
  }
  
  // Add specific context based on message type - always include
  let contextPrompt = "\n\n";
  switch (messageType) {
    case 'journalEntry':
      contextPrompt += `
        The user has just added a new journal entry.
        Entry: "${specificContext.text ? specificContext.text.substring(0, 200) : ''}"
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
      contextPrompt += `
        The user has just logged their morning mood as "${specificContext.mood}".
        Their energy level is ${specificContext.energy || 'not specified'}.
        ${userData.journal && userData.journal.entries.length > 0 ? 
          `They have ${userData.journal.stats.entryCount} recent journal entries. Their average mood in recent entries is ${userData.journal.stats.avgMood?.toFixed(1) || 'unknown'}.` : 
          'They haven\'t written journal entries recently.'}
        
        Acknowledge this mood, provide a supportive response, and offer a suggestion relevant to their current state.
        The suggestion could be a new task or a way to adapt an existing habit - choose based on what seems most helpful for their current mood and energy level.
      `;
      break;
      
    // Other case statements remain similar but would be included here
    default:
      contextPrompt += `
        Generate a supportive check-in message for the user based on their recent data.
        Look for meaningful insights, correlations, or patterns that might be helpful for them.
      `;
  }
  
  prompt += trackTokens("Context-specific instructions", contextPrompt);
  
  // Add data sections based on relevance
  const today = userData.today;
  const todayData = userData.recentData[today] || {};
  
  // Today's data - almost always relevant
  if (relevantDataTypes.includes('basic') || relevantDataTypes.includes('today')) {
    prompt += trackTokens("Today's data", `\n\nTODAY'S DATA (${today}):\n${JSON.stringify(todayData, null, 2)}`);
  }
  
  // Recent days data - only if explicitly needed
  if (relevantDataTypes.includes('recent')) {
    prompt += trackTokens("Recent days data", `\n\nRECENT DAYS' DATA:\n${JSON.stringify(userData.recentData, null, 2)}`);
  }
  
  // Habits data - only if relevant to the current context
  if (relevantDataTypes.includes('habits')) {
    prompt += trackTokens("Habits data", `\n\nHABITS DATA:\n${JSON.stringify(userData.habits, null, 2)}`);
  }
  
  // Focus sessions - only if relevant
  if (relevantDataTypes.includes('focus')) {
    prompt += trackTokens("Focus sessions", `\n\nRECENT FOCUS SESSIONS:\n${JSON.stringify(userData.focusSessions, null, 2)}`);
  }
  
  // Workouts - only if relevant
  if (relevantDataTypes.includes('workouts')) {
    prompt += trackTokens("Workouts", `\n\nRECENT WORKOUTS:\n${JSON.stringify(userData.workouts, null, 2)}`);
  }
  
  // Finance data - only if explicitly mentioned or directly relevant
  if (relevantDataTypes.includes('finance') && userData.finance && Object.keys(userData.finance).length > 0) {
    prompt += trackTokens("Finance data", `\n\nFINANCE DATA:\n${JSON.stringify(userData.finance, null, 2)}`);
  }
  
  // Nutrition data - only if explicitly mentioned or directly relevant
  if (relevantDataTypes.includes('nutrition') && userData.nutrition && Object.keys(userData.nutrition).length > 0) {
    prompt += trackTokens("Nutrition data", `\n\nNUTRITION DATA:\n${JSON.stringify(userData.nutrition, null, 2)}`);
  }

  // Journal data - prioritize if relevant (as you mentioned it's most important)
  if (relevantDataTypes.includes('journal') && userData.journal && userData.journal.entries.length > 0) {
    const journalSection = `\n\nRECENT JOURNAL DATA:\n` +
      `Journal Stats: ${userData.journal.stats.entryCount} entries in the last 10 days\n` +
      `Average Mood: ${userData.journal.stats.avgMood?.toFixed(1) || 'unknown'}/5\n` +
      `Average Energy: ${userData.journal.stats.avgEnergy?.toFixed(1) || 'unknown'}/3\n` +
      
      // Add top categories if available
      (userData.journal.stats.recentCategories.length > 0 
        ? `Top Categories: ${userData.journal.stats.recentCategories.map(c => c.category).join(', ')}\n` 
        : '') +
      
      // Add people mentioned if available - keep all of these as they're important
      (userData.journal.stats.peopleMentioned.length > 0 
        ? `People Mentioned: ${userData.journal.stats.peopleMentioned.map(p => p.person).join(', ')}\n` 
        : '') +
      
      // Add detailed entries
      `\nMost Recent Journal Entries:\n` +
      userData.journal.entries.map(entry => 
        `\n[${new Date(entry.timestamp).toLocaleDateString()}] ${entry.title || 'Journal Entry'}\n` +
        `Mood: ${entry.mood !== undefined ? `${entry.mood}/5` : 'not specified'}, ` +
        `Energy: ${entry.energy !== undefined ? `${entry.energy}/3` : 'not specified'}\n` +
        (entry.people && entry.people.length > 0 ? `People: ${entry.people.join(', ')}\n` : '') +
        (entry.categories && entry.categories.length > 0 ? `Categories: ${entry.categories.join(', ')}\n` : '') +
        `${entry.text}\n`
      ).join('') +
      
      // Add relationship data - keep all of this as social aspects are important
      (Object.keys(userData.journal.recentPeople).length > 0 
        ? `\nPeople Data from Journal:\n` +
          Object.entries(userData.journal.recentPeople)
            .map(([person, data]) => 
              `${person}: ${data.mentions} mentions, ` +
              `Average mood: ${data.avgMood?.toFixed(1) || 'unknown'}/5\n` +
              (data.recentDates && data.recentDates.length > 0 
                ? `Recent mentions: ${data.recentDates.join(', ')}\n` 
                : '')
            ).join('') 
        : '');
    
    prompt += trackTokens("Journal data", journalSection);
  }
  
  // Weekly summaries - only include if we need historical context
  if (relevantDataTypes.includes('history')) {
    prompt += trackTokens("Weekly summaries", `\n\nRECENT WEEKLY SUMMARIES:\n${JSON.stringify(userData.weeklySummaries, null, 2)}`);
  }
  
  console.log(`Total estimated tokens for prompt: ~${estimatedTokens}`);
  return prompt;
};


// Also modify the system prompt in the fetchFromAI function for better balance:

const fetchFromAI = async (context) => {
  try {
    const { userMessage, previousMessages } = context;
    
    // Track token usage and latency
    const startTime = Date.now();
    let totalTokens = 0;
    
    // FIRST PASS: Identify needed data types
    console.log("Starting first pass to identify relevant data types...");
    const relevantDataTypes = await firstPassAnalysis(
      context.userMessage, 
      (previousMessages || []).slice(-5) // Include last 5 messages for context
    );
    
    console.log("First pass identified needed data types:", relevantDataTypes);
    
    // Estimate tokens for first pass
    const firstPassTokens = 
      (context.userMessage?.length || 0) / 4 + 
      (previousMessages ? previousMessages.slice(-5).reduce((sum, msg) => sum + msg.content.length / 4, 0) : 0) +
      1000; // Base system prompt and overhead
    
    totalTokens += firstPassTokens;
    console.log(`First pass estimated tokens: ~${Math.round(firstPassTokens)}`);
    
    // Record first pass timing
    const firstPassTime = Date.now() - startTime;
    console.log(`First pass completed in ${firstPassTime}ms`);
    
    // SECOND PASS: Get the actual response with only relevant data
    console.log("Starting second pass with relevant data only...");
    
    // Override the context to use targeted data selection
    const targetedContext = {
      ...context,
      targetedDataTypes: relevantDataTypes
    };
    
    // Build system prompt for the actual response
    const systemPrompt = `
      You are Solaris, a supportive, friendly day coach within the ZenTracker app. 
      Your role is to be a compassionate companion, offering insights, encouragement, and suggestions to guide the user and be there to listen to them.
      
      IMPORTANT: You have access to their personal information, including qualities, interests, challenges, and goals. Use this information to personalize your responses and make them feel truly understood.
      
      Adapt your communication style based on the user's preference:
      - If they prefer "direct & concise": Be straightforward with minimal explanation, focus on clear instructions and actionable steps
      - If they prefer "balanced": Use a mix of information and warmth, with moderate detail (this is the default)
      - If they prefer "supportive & detailed": Be more empathetic and encouraging, provide thorough explanations
      
      Keep your responses casual, warm and concise. Write like a supportive friend texting, not a formal coach writing an email.
      
      Be thoughtfully varied in your suggestions - don't focus repeatedly on habits unless the user specifically mentions them. 
      Consider the user's full context including their mood, energy, focus sessions, tasks, journal entries, workouts, nutrition.
      
      When suggesting new activities or habits:
      - Connect them to the user's stated interests when possible
      - Frame them as ways to overcome their specific challenges
      - Show how they contribute to their personal goals
      - Emphasize how they can leverage their existing qualities/strengths
      
      Make connections between different aspects of the user's data to provide unique, personalized insights rather than generic advice.
      
      Your responses should be:
      - Short (30-70 words)
      - Contextually relevant to what the user is currently experiencing
      - Varied (don't repeat similar suggestions)
      - Empathetic to the user's current state
      
      Vary your conversation style - sometimes ask questions, sometimes offer observations, sometimes give encouragement.
      
      Always maintain continuity with the prior conversation and refer back to things previously discussed.
      
      Use thoughtful judgment to determine what kind of suggestions would be most helpful:
      - Sometimes recommend completely new ideas when the user seems open to exploration
      - Other times suggest manageable variations or improvements to existing habits, tasks, hobbies when consistency is important
      - Base this decision on their mood, energy level, and the conversation context
      
      Make use of connections between different aspects of their data (e.g., sleep quality affecting mood) if you see it's relevant to advise the user.
      Be personalized - avoid generic advice that could apply to anyone.
      If they mention people in their journals, acknowledge these social connections.
      
      On consecutive messages that are not the first of the day, don't keep saying "hey" or "hi".
    `;
    
    // Get user data with only the relevant types
    const userData = await gatherUserDataWithSummarization();
    
    // Build a targeted user prompt
    targetedContext.userData = userData;
    const userPrompt = buildTargetedUserPrompt(targetedContext);
    
    // Make second API call with only relevant data
    const response = await generateContent(`
      ${systemPrompt}
      
      ${userPrompt}
      
      Please format your response in a conversational tone. At the end, include 2-3 suggested replies the user might want to choose from, in the format:
      
      SUGGESTED_REPLIES:
      - Suggestion 1
      - Suggestion 2
      - Suggestion 3
    `);
    
    // Estimate tokens for second pass
    const secondPassTokens = userPrompt.length / 4 + 
                            systemPrompt.length / 4 + 
                            response.length / 4 + 
                            500; // Overhead
    
    totalTokens += secondPassTokens;
    console.log(`Second pass estimated tokens: ~${Math.round(secondPassTokens)}`);
    
    // Extract suggestions from the response
    const suggestions = extractSuggestions(response);
    
    // Remove suggestions from the main message
    let message = response.replace(/SUGGESTED_REPLIES:[\s\S]*$/, '').trim();
    
    // Record total time and tokens
    const totalTime = Date.now() - startTime;
    console.log(`Two-pass approach completed in ${totalTime}ms with ~${Math.round(totalTokens)} total tokens`);
    
    return {
      message,
      suggestions,
      _meta: {
        approach: 'two-pass',
        totalTokens: Math.round(totalTokens),
        totalTimeMs: totalTime,
        relevantDataTypes
      }
    };
  } catch (error) {
    console.error('Error with two-pass AI approach:', error);
    
    // Fallback to single-pass if something goes wrong
    console.log('Falling back to single-pass approach...');
    return fallbackSinglePassApproach(context);
  }
};
// Targeted user prompt building that only includes specified data types
const buildTargetedUserPrompt = (context) => {
  const { messageType, userData, userMessage, specificContext, previousMessages, targetedDataTypes } = context;
  
  // Start with the same base prompt approach
  let prompt = `
    Here's a summary of the user's data that's relevant to their query:
    
    Today: ${userData.today}
  `;
  
  // Add personal information if available - considered essential
  if (userData.personalInfo) {
    prompt += `\n\nUSER PERSONAL INFORMATION:
      ${userData.personalInfo.qualities && userData.personalInfo.qualities.length > 0 
        ? `\nQualities & Strengths: ${userData.personalInfo.qualities.join(', ')}` : ''}
      ${userData.personalInfo.interests && userData.personalInfo.interests.length > 0 
        ? `\nInterests & Hobbies: ${userData.personalInfo.interests.join(', ')}` : ''}
      ${userData.personalInfo.challenges && userData.personalInfo.challenges.length > 0 
        ? `\nChallenges & Difficulties: ${userData.personalInfo.challenges.join(', ')}` : ''}
      ${userData.personalInfo.goals && userData.personalInfo.goals.length > 0 
        ? `\nGoals & Aspirations: ${userData.personalInfo.goals.join(', ')}` : ''}
      ${userData.personalInfo.communicationStyle 
        ? `\nPreferred Communication Style: ${userData.personalInfo.communicationStyle}` : ''}
    `;
  }
  
  // Add conversation history - considered essential
  if (previousMessages && previousMessages.length > 0) {
    prompt += `\n\nRECENT CONVERSATION HISTORY (newest last):\n`;
    previousMessages.forEach((msg, index) => {
      const role = msg.sender === 'coach' ? 'SOLARIS' : 'USER';
      prompt += `\n${role}: ${msg.content}\n`;
    });
  }
  
  // Add specific context based on message type
  switch (messageType) {
    case 'journalEntry':
      prompt += `
        The user has just added a new journal entry.
        Entry: "${specificContext.text ? specificContext.text.substring(0, 200) : ''}"
        Mood: ${specificContext.mood || 'not specified'}
        Energy: ${specificContext.energy || 'not specified'}
        ${specificContext.people && specificContext.people.length > 0 ? `People mentioned: ${specificContext.people.join(', ')}` : ''}
        ${specificContext.categories && specificContext.categories.length > 0 ? `Categories: ${specificContext.categories.join(', ')}` : ''}
      `;
      break;
    
    // Other message types would be handled here
    case 'userQuery':
      prompt += `
        The user has asked: "${userMessage}"
        
        I'll provide relevant data below that's needed to answer this query effectively.
      `;
      break;
    
    default:
      // Default handling for other types
      break;
  }
  
  // Now add only the data types identified as relevant
  const today = userData.today;
  const todayData = userData.recentData[today] || {};
  
  // Today's basic data is almost always needed
  prompt += `\n\nTODAY'S BASIC DATA:\n${JSON.stringify(
    {
      date: today,
      morningMood: todayData.mood?.morning,
      eveningMood: todayData.mood?.evening,
      taskCompletion: todayData.taskCompletion
    }, 
    null, 2
  )}`;
  
  // Add other data types only if they were identified as relevant
  if (targetedDataTypes.includes('mood')) {
    const moodData = {};
    
    // Extract mood data from recent days
    Object.keys(userData.recentData).forEach(date => {
      if (userData.recentData[date].mood) {
        moodData[date] = userData.recentData[date].mood;
      }
    });
    
    prompt += `\n\nRECENT MOOD DATA:\n${JSON.stringify(moodData, null, 2)}`;
  }
  
  if (targetedDataTypes.includes('tasks')) {
    const taskData = {};
    
    // Extract task data from recent days
    Object.keys(userData.recentData).forEach(date => {
      if (userData.recentData[date].taskCompletion) {
        taskData[date] = userData.recentData[date].taskCompletion;
      }
    });
    
    prompt += `\n\nRECENT TASK DATA:\n${JSON.stringify(taskData, null, 2)}`;
  }
  
  if (targetedDataTypes.includes('habits') && userData.habits) {
    prompt += `\n\nHABITS DATA:\n${JSON.stringify(userData.habits, null, 2)}`;
  }
  
  if (targetedDataTypes.includes('focus') && userData.focusSessions) {
    prompt += `\n\nRECENT FOCUS SESSIONS:\n${JSON.stringify(userData.focusSessions, null, 2)}`;
  }
  
  if (targetedDataTypes.includes('workouts') && userData.workouts) {
    prompt += `\n\nRECENT WORKOUTS:\n${JSON.stringify(userData.workouts, null, 2)}`;
  }
  
  // Journal entries are often valuable for personalization
  if (targetedDataTypes.includes('journal') && userData.journal && userData.journal.entries.length > 0) {
    prompt += `\n\nRECENT JOURNAL DATA:\n`;
    
    // Add journal stats
    prompt += `Journal Stats: ${userData.journal.stats.entryCount} entries in the last 10 days\n`;
    
    if (userData.journal.stats.avgMood) {
      prompt += `Average Mood: ${userData.journal.stats.avgMood.toFixed(1)}/5\n`;
    }
    
    if (userData.journal.stats.avgEnergy) {
      prompt += `Average Energy: ${userData.journal.stats.avgEnergy.toFixed(1)}/3\n`;
    }
    
    // Add entries
    prompt += `\nMost Recent Journal Entries:\n`;
    userData.journal.entries.forEach(entry => {
      prompt += `\n[${new Date(entry.timestamp).toLocaleDateString()}] ${entry.title || 'Journal Entry'}\n`;
      
      if (entry.mood !== undefined) {
        prompt += `Mood: ${entry.mood}/5, `;
      }
      
      if (entry.energy !== undefined) {
        prompt += `Energy: ${entry.energy}/3\n`;
      } else {
        prompt += '\n';
      }
      
      if (entry.people && entry.people.length > 0) {
        prompt += `People: ${entry.people.join(', ')}\n`;
      }
      
      prompt += `${entry.text}\n`;
    });
  }
  
  // People data is important for social connection
  if (targetedDataTypes.includes('people') && userData.journal && Object.keys(userData.journal.recentPeople).length > 0) {
    prompt += `\n\nPEOPLE DATA FROM JOURNAL:\n`;
    
    Object.entries(userData.journal.recentPeople).forEach(([person, data]) => {
      prompt += `${person}: ${data.mentions} mentions, `;
      
      if (data.avgMood) {
        prompt += `Average mood when mentioned: ${data.avgMood.toFixed(1)}/5\n`;
      } else {
        prompt += '\n';
      }
      
      if (data.recentDates && data.recentDates.length > 0) {
        prompt += `Recent mentions: ${data.recentDates.join(', ')}\n`;
      }
    });
  }
  
  if (targetedDataTypes.includes('finance') && userData.finance) {
    prompt += `\n\nFINANCE DATA:\n${JSON.stringify(userData.finance, null, 2)}`;
  }
  
  if (targetedDataTypes.includes('nutrition') && userData.nutrition) {
    prompt += `\n\nNUTRITION DATA:\n${JSON.stringify(userData.nutrition, null, 2)}`;
  }
  
  if (targetedDataTypes.includes('sleep')) {
    // Extract sleep data from recent days
    const sleepData = {};
    Object.keys(userData.recentData).forEach(date => {
      if (userData.recentData[date].sleep) {
        sleepData[date] = userData.recentData[date].sleep;
      }
    });
    
    if (Object.keys(sleepData).length > 0) {
      prompt += `\n\nRECENT SLEEP DATA:\n${JSON.stringify(sleepData, null, 2)}`;
    }
  }
  
  if (targetedDataTypes.includes('history')) {
    // Add weekly summaries for historical perspective
    prompt += `\n\nRECENT WEEKLY SUMMARIES:\n${JSON.stringify(userData.weeklySummaries, null, 2)}`;
  }
  
  return prompt;
};

// Fallback to traditional single-pass approach if two-pass fails
const fallbackSinglePassApproach = async (context) => {
  try {
    const startTime = Date.now();
    
    // Build a system prompt that establishes the coach's persona
    const systemPrompt = `
      You are Solaris, a supportive, friendly day coach within the ZenTracker app.
      // (Rest of the original system prompt)
    `;
    
    // Use the original non-targeted prompt building
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
    
    // Estimate tokens
    const estimatedTokens = userPrompt.length / 4 + systemPrompt.length / 4 + response.length / 4;
    
    // Extract suggestions from the response
    const suggestions = extractSuggestions(response);
    
    // Remove suggestions from the main message
    let message = response.replace(/SUGGESTED_REPLIES:[\s\S]*$/, '').trim();
    
    // Record total time
    const totalTime = Date.now() - startTime;
    console.log(`Single-pass fallback completed in ${totalTime}ms with ~${Math.round(estimatedTokens)} tokens`);
    
    return {
      message,
      suggestions,
      _meta: {
        approach: 'single-pass-fallback',
        totalTokens: Math.round(estimatedTokens),
        totalTimeMs: totalTime
      }
    };
  } catch (error) {
    console.error('Error with fallback approach:', error);
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

// First Pass: Determine what data is needed
const firstPassAnalysis = async (userMessage, conversationHistory) => {
  try {
    // Create a minimal system prompt that explains the task
    const systemPrompt = `
      You are an AI assistant helping to determine what user data is needed to answer a query or give the most input and advice to it.
      Your task is to analyze the user's question and conversation history, then identify which
      types of data would be relevant for providing a helpful response.
      
      Respond with ONLY a JSON object listing the data types needed, with no additional explanation.
      Use the following format:
      {
        "relevantData": ["dataType1", "dataType2", "..."]
      }
      
      Available data types:
      - "mood": User's mood and energy data
      - "tasks": Task completion information (from the user daily tasklists)
      - "habits": Habit tracking data (what habits the user is working on and their completion)
      - "focus": Focus session data (productivity data using techniques like pomodoro etc...)
      - "workouts": Workout and fitness data
      - "journal": Journal entries and personal reflections (Journaling module like the user diary, reflects emotions, social interactions, work, all he wants to write)
      - "finance": Financial information and budgeting
      - "nutrition": Food and diet tracking (also weight tracking)
      - "sleep": Sleep patterns and data
      - "people": Social relationships data (people frequently mentioned in journal entries)
      - "goals": Personal goals information
      - "history": Historical trends and patterns
    `;
    
    // Build a minimal content prompt
    const contentPrompt = `
      Based on the following user message and conversation history, which types of data would be most 
      relevant to provide a helpful, personalized response?
      
      USER MESSAGE: "${userMessage}"
      
      ${conversationHistory ? `RECENT CONVERSATION:
      ${conversationHistory.map(msg => `${msg.sender === 'coach' ? 'SOLARIS' : 'USER'}: ${msg.content}`).join('\n')}` : ''}
      
      Remember to respond with ONLY a JSON object listing the relevant data types, with no additional text.
    `;
    
    // Make API call to determine relevant data
    // Here we use the same generateContent function but could be modified to use a smaller model
    const response = await generateContent(systemPrompt + '\n\n' + contentPrompt);
    
    // Extract the JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : '{"relevantData": ["mood", "tasks", "habits", "journal"]}';
    
    try {
      // Parse the JSON response
      const result = JSON.parse(jsonStr);
      return result.relevantData || ["mood", "tasks", "habits", "journal"]; // Default fallback
    } catch (e) {
      console.error("Error parsing first pass JSON:", e);
      // Return a default set if parsing fails
      return ["mood", "tasks", "habits", "journal"];
    }
    
  } catch (error) {
    console.error("Error in first pass analysis:", error);
    // Return a default set if anything goes wrong
    return ["mood", "tasks", "habits", "journal"];
  }
};

// Generate summaries for focus sessions
const summarizeFocusSessions = (sessions, limit = DATA_LIMITS.FOCUS_SESSIONS_MAX) => {
  if (!sessions || sessions.length === 0) return [];
  
  // Sort by date, newest first
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.startTime || b.timestamp) - new Date(a.startTime || a.timestamp)
  );
  
  // Include most recent sessions in detail
  const recentSessions = sortedSessions
    .slice(0, limit)
    .map(session => filterRelevantData(session, 'focusSession'));
  
  // For older sessions, create a summary
  if (sortedSessions.length > limit) {
    const olderSessions = sortedSessions.slice(limit);
    
    // Calculate summary metrics
    let totalDuration = 0;
    let totalRating = 0;
    let ratingCount = 0;
    let totalDistractions = 0;
    let distractionsCount = 0;
    let taskCompletionCount = 0;
    
    olderSessions.forEach(session => {
      // Sum duration
      if (session.duration) {
        totalDuration += parseFloat(session.duration);
      }
      
      // Sum ratings
      if (session.rating !== undefined) {
        totalRating += parseFloat(session.rating);
        ratingCount++;
      }
      
      // Sum distractions
      if (session.distractions !== undefined) {
        totalDistractions += parseFloat(session.distractions);
        distractionsCount++;
      }
      
      // Count task completions
      if (session.taskCompleted) {
        taskCompletionCount++;
      }
    });
    
    // Add a summary entry
    recentSessions.push({
      isSummary: true,
      count: olderSessions.length,
      avgDuration: olderSessions.length > 0 ? totalDuration / olderSessions.length : 0,
      avgRating: ratingCount > 0 ? totalRating / ratingCount : null,
      avgDistractions: distractionsCount > 0 ? totalDistractions / distractionsCount : null,
      taskCompletionRate: olderSessions.length > 0 ? taskCompletionCount / olderSessions.length : 0,
      dateRange: {
        earliest: formatTimestamp(olderSessions[olderSessions.length - 1].startTime),
        latest: formatTimestamp(olderSessions[0].startTime)
      }
    });
  }
  
  return recentSessions;
};

// Helper function to format timestamps consistently
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'unknown';
  
  try {
    // Return ISO string or just the date portion if it's a date string
    if (timestamp.includes('T')) {
      return timestamp;
    } else {
      return timestamp;
    }
  } catch (e) {
    return String(timestamp);
  }
};