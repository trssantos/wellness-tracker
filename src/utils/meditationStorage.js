// src/utils/meditationStorage.js
import { getStorage, setStorage } from './storage';

/**
 * Get meditation data from storage
 * @returns {Object} Meditation data or default data structure
 */
export const getMeditationStorage = () => {
  const storage = getStorage();
  
  if (!storage.meditationData) {
    // Initialize with default structure
    const defaultData = {
      sessions: [],
      favorites: [],
      journalEntries: [],
      recentlyUsed: [],
      settings: {
        voiceEnabled: true,
        voiceVolume: 0.7,
        ambientVolume: 0.5,
        reminderEnabled: false,
        reminderTime: '21:00',
        theme: 'calm' // 'calm', 'focus', 'sleep'
      }
    };
    
    storage.meditationData = defaultData;
    setStorage(storage);
    return defaultData;
  }
  
  return storage.meditationData;
};

/**
 * Save meditation data to storage
 * @param {Object} data - Meditation data to save
 */
export const saveMeditationStorage = (data) => {
  const storage = getStorage();
  storage.meditationData = data;
  setStorage(storage);
  return true;
};

/**
 * Update meditation settings
 * @param {Object} settings - New settings object
 */
export const updateMeditationSettings = (settings) => {
  const data = getMeditationStorage();
  const updatedData = {
    ...data,
    settings: {
      ...data.settings,
      ...settings
    }
  };
  
  saveMeditationStorage(updatedData);
  return updatedData;
};

/**
 * Get meditation statistics
 * @param {Object} data - Meditation data (optional - will load from storage if not provided)
 * @returns {Object} Statistics object
 */
export const getMeditationStats = (data = null) => {
  const meditationData = data || getMeditationStorage();
  const { sessions } = meditationData;
  
  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      avgSessionLength: 0,
      totalBreathingSessions: 0,
      totalGuidedSessions: 0,
      totalGroundingSessions: 0,
      totalAmbientSessions: 0,
      totalSleepSessions: 0,
      totalQuickSessions: 0,
      mostUsedCategory: null,
      mostUsedExercise: null,
      weeklySessionCounts: [],
      sessionsByTimeOfDay: { morning: 0, afternoon: 0, evening: 0, night: 0 },
      moodImprovement: { before: 0, after: 0, delta: 0 }
    };
  }
  
  // Calculate total minutes
  const totalMinutes = sessions.reduce((total, session) => {
    return total + (session.duration || 0);
  }, 0);
  
  // Count sessions by category
  const categoryCounts = {
    breathing: 0,
    guided: 0,
    grounding: 0,
    ambient: 0,
    sleep: 0,
    quick: 0
  };
  
  sessions.forEach(session => {
    if (categoryCounts[session.category] !== undefined) {
      categoryCounts[session.category]++;
    }
  });
  
  // Find most used category
  const mostUsedCategory = Object.entries(categoryCounts)
    .reduce((max, [category, count]) => 
      count > max.count ? { category, count } : max, 
      { category: null, count: 0 }
    ).category;
  
  // Count sessions by exercise
  const exerciseCounts = {};
  sessions.forEach(session => {
    if (!exerciseCounts[session.exerciseId]) {
      exerciseCounts[session.exerciseId] = 0;
    }
    exerciseCounts[session.exerciseId]++;
  });
  
  // Find most used exercise
  const mostUsedExercise = Object.entries(exerciseCounts)
    .reduce((max, [exerciseId, count]) => 
      count > max.count ? { exerciseId, count } : max, 
      { exerciseId: null, count: 0 }
    ).exerciseId;
  
  // Get weekly session counts (last 4 weeks)
  const now = new Date();
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(now.getDate() - 28);
  
  const weeklySessionCounts = [];
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(fourWeeksAgo);
    weekStart.setDate(fourWeeksAgo.getDate() + (i * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekSessions = sessions.filter(session => {
      const sessionDate = new Date(session.timestamp);
      return sessionDate >= weekStart && sessionDate <= weekEnd;
    });
    
    weeklySessionCounts.push({
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      count: weekSessions.length,
      minutes: weekSessions.reduce((total, session) => total + (session.duration || 0), 0)
    });
  }
  
  // Sessions by time of day
  const sessionsByTimeOfDay = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  sessions.forEach(session => {
    if (!session.timestamp) return;
    
    const hour = new Date(session.timestamp).getHours();
    if (hour >= 5 && hour < 12) {
      sessionsByTimeOfDay.morning++;
    } else if (hour >= 12 && hour < 17) {
      sessionsByTimeOfDay.afternoon++;
    } else if (hour >= 17 && hour < 21) {
      sessionsByTimeOfDay.evening++;
    } else {
      sessionsByTimeOfDay.night++;
    }
  });
  
  // Mood improvement
  let moodBefore = 0;
  let moodAfter = 0;
  let moodCount = 0;
  
  sessions.forEach(session => {
    if (session.moodBefore !== undefined && session.moodAfter !== undefined) {
      moodBefore += session.moodBefore;
      moodAfter += session.moodAfter;
      moodCount++;
    }
  });
  
  const avgMoodBefore = moodCount > 0 ? moodBefore / moodCount : 0;
  const avgMoodAfter = moodCount > 0 ? moodAfter / moodCount : 0;
  
  return {
    totalSessions: sessions.length,
    totalMinutes,
    avgSessionLength: sessions.length > 0 ? totalMinutes / sessions.length : 0,
    totalBreathingSessions: categoryCounts.breathing,
    totalGuidedSessions: categoryCounts.guided,
    totalGroundingSessions: categoryCounts.grounding,
    totalAmbientSessions: categoryCounts.ambient,
    totalSleepSessions: categoryCounts.sleep,
    totalQuickSessions: categoryCounts.quick,
    mostUsedCategory,
    mostUsedExercise,
    weeklySessionCounts,
    sessionsByTimeOfDay,
    moodImprovement: {
      before: avgMoodBefore,
      after: avgMoodAfter,
      delta: avgMoodAfter - avgMoodBefore
    }
  };
};

export const getVoiceSettings = () => {
  const meditationData = getMeditationStorage();
  return meditationData.voiceSettings || {
    useExternalVoice: false,
    voiceType: 'female', // 'female', 'male', or 'system'
    voicePitch: 0.9,    // 0.5 to 1.5
    voiceRate: 0.85,    // 0.5 to 1.5
    voiceVolume: 0.8    // 0 to 1.0
  };
};

export const saveVoiceSettings = (settings) => {
  const meditationData = getMeditationStorage();
  meditationData.voiceSettings = settings;
  saveMeditationStorage(meditationData);
  return settings;
};

export default {
  getMeditationStorage,
  saveMeditationStorage,
  updateMeditationSettings,
  getMeditationStats
};