import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Plus, Search, Calendar, Edit2, Trash2, ChevronDown, ChevronUp, X, 
  Save, PenTool, Lightbulb, Sparkles, RefreshCw, MessageSquare, Smile, Heart, Star,
  Users, Briefcase, Home, Brain, Moon, Sun, Filter, ArrowRight, BarChart2,
  Maximize2, Minimize2, Tag, ThumbsUp, ThumbsDown, Download, Upload, AlertTriangle,
  Info, CheckCircle, ArrowLeft, Eye, Clock, Award, Check, MoreHorizontal, ChevronRight, ChevronLeft,
  Activity, Hash, FileText, Frown, Zap, User
} from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import { handleDataChange } from '../../utils/dayCoachUtils';
import { generateContent } from '../../utils/ai-service';
import JournalStreakCalendar from './JournalStreakCalendar';
import MonthlyCalendar from './MonthlyCalendar';

const JournalHub = () => {
  // View state management
  const [activeView, setActiveView] = useState('entries'); // 'entries', 'calendar', 'insights'
  const [selectedDate, setSelectedDate] = useState(formatDateForStorage(new Date()));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  // Journal entries and data
  const [journalEntries, setJournalEntries] = useState([]);
  const [dailyNotes, setDailyNotes] = useState({});
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  
  // Entry creation/editing state
  const [newEntryText, setNewEntryText] = useState('');
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryMood, setNewEntryMood] = useState(3);
  const [newEntryEnergy, setNewEntryEnergy] = useState(2);
  const [newEntryTags, setNewEntryTags] = useState([]);
  const [newEntryCategories, setNewEntryCategories] = useState([]);
  const [showEntryEditor, setShowEntryEditor] = useState(false);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterByTags, setFilterByTags] = useState([]);
  const [filterByCategories, setFilterByCategories] = useState([]);
  const [filterByMoodRange, setFilterByMoodRange] = useState([1, 5]);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);
  
  // Guided journaling state
  const [activePrompt, setActivePrompt] = useState(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);
  
  // Journal analysis state
  const [journalAnalysis, setJournalAnalysis] = useState({
    topWords: [],
    topPeople: [],
    stressFactors: [],
    topTopics: [],
    moodCorrelations: [],
    loaded: false
  });
  
  // Refs
  const calendarRef = useRef(null);
  const editorRef = useRef(null);
  
  // Available categories
  const availableCategories = [
    { id: 'meditation', name: 'Meditation', icon: <Brain size={16} className="text-indigo-500 dark:text-indigo-400" /> },
    { id: 'gratitude', name: 'Gratitude', icon: <Heart size={16} className="text-rose-500 dark:text-rose-400" /> },
    { id: 'work', name: 'Work', icon: <Briefcase size={16} className="text-blue-500 dark:text-blue-400" /> },
    { id: 'relationships', name: 'Relationships', icon: <Users size={16} className="text-emerald-500 dark:text-emerald-400" /> },
    { id: 'personal', name: 'Personal', icon: <Star size={16} className="text-amber-500 dark:text-amber-400" /> },
    { id: 'health', name: 'Health', icon: <Heart size={16} className="text-red-500 dark:text-red-400" /> },
    { id: 'morning', name: 'Morning', icon: <Sun size={16} className="text-yellow-500 dark:text-yellow-400" /> },
    { id: 'evening', name: 'Evening', icon: <Moon size={16} className="text-purple-500 dark:text-purple-400" /> },
  ];
  
  // Popular tags
  const popularTags = [
    'reflection', 'progress', 'challenge', 'success', 'goal', 
    'habit', 'mindfulness', 'focus', 'peace', 'stress', 
    'sleep', 'energy', 'productivity', 'inspiration', 'growth'
  ];
  
  // Guided prompts
  const guidedPrompts = [
    {
      id: 'daily-reflection',
      title: 'Daily Reflection',
      description: 'Reflect on your day with guided questions to extract meaningful insights.',
      category: 'meditation',
      questions: [
        "What went well today and why?",
        "What challenged me today and how did I respond?",
        "What am I grateful for right now?",
        "What did I learn today about myself or others?",
        "What would make tomorrow even better?"
      ]
    },
    {
      id: 'emotional-awareness',
      title: 'Emotional Awareness',
      description: 'Explore your emotional landscape to better understand your feelings.',
      category: 'personal',
      questions: [
        "What emotions am I experiencing right now?",
        "Where do I feel these emotions in my body?",
        "What triggered these emotions?",
        "How are these emotions affecting my thoughts and behaviors?",
        "What do these emotions tell me about my needs or values?"
      ]
    },
    {
      id: 'gratitude-practice',
      title: 'Gratitude Practice',
      description: 'Cultivate appreciation for the gifts in your life, big and small.',
      category: 'gratitude',
      questions: [
        "What are 3 things I'm grateful for today?",
        "Who is someone I appreciate and why?",
        "What's something I often take for granted that I'm thankful for?",
        "What challenging situation am I actually grateful for?",
        "How can I express gratitude to others tomorrow?"
      ]
    },
    {
      id: 'goal-setting',
      title: 'Goal Setting & Review',
      description: 'Set meaningful goals and track your progress toward them.',
      category: 'work',
      questions: [
        "What are my top 3 priorities right now?",
        "What steps can I take tomorrow toward my important goals?",
        "What obstacles might I face and how can I prepare?",
        "What progress have I made recently that I'm proud of?",
        "How can I break down my bigger goals into manageable steps?"
      ]
    },
    {
      id: 'relationship-reflection',
      title: 'Relationship Reflection',
      description: 'Reflect on your connections with others and how they enrich your life.',
      category: 'relationships',
      questions: [
        "Which relationships are energizing me right now?",
        "Which relationships feel challenging and why?",
        "How am I showing up in my important relationships?",
        "What's one way I could strengthen a key relationship?",
        "Who do I appreciate but haven't told recently?"
      ]
    },
    {
      id: 'values-alignment',
      title: 'Values Alignment',
      description: 'Check in with your core values and how you\'re living them.',
      category: 'personal',
      questions: [
        "What are 3-5 core values that guide my life?",
        "When did my actions align with my values today?",
        "When did I feel disconnected from my values?",
        "What decision am I facing where my values can guide me?",
        "How can I honor my values more fully tomorrow?"
      ]
    },
    {
      id: 'stress-relief',
      title: 'Stress Relief Writing',
      description: 'Release tension and worry through expressive writing.',
      category: 'health',
      questions: [
        "What's weighing on my mind right now?",
        "If my stress could speak, what would it tell me?",
        "What elements of this situation are within my control?",
        "What self-care practices would help me feel more centered?",
        "What perspective might help me find peace with this situation?"
      ]
    }
  ];
  
  // AI insight prompts
  const aiInsightPrompts = [
    {
      id: 'emotional-patterns',
      title: 'Emotional Patterns',
      description: 'Analyze emotional patterns across your journal entries',
      systemPrompt: "You are an insightful, compassionate journaling assistant. Your role is to analyze the user's journal entries and identify patterns in their emotional state, offering thoughtful observations about recurring themes, triggers, and potential opportunities for growth. Please maintain a warm, supportive tone while providing specific, personalized insights that might help the user gain deeper self-awareness. Focus on being constructive and empathetic rather than diagnostic or prescriptive."
    },
    {
      id: 'journal-reflection',
      title: 'Reflection on Entries',
      description: 'Get thoughtful reflections on your journal content',
      systemPrompt: "You are a thoughtful, contemplative journaling companion. Your purpose is to help the user gain deeper insights from their journal entries by reflecting back key themes, growth opportunities, and connections they might not have noticed. Respond with warmth and depth, offering meaningful questions that might help them explore their experiences further. Avoid making judgments or giving advice. Instead, mirror back what you notice in a way that encourages self-discovery and personal insight."
    },
    {
      id: 'gratitude-insights',
      title: 'Gratitude Insights',
      description: 'Identify sources of gratitude in your journaling',
      systemPrompt: "You are a gentle, positive journaling companion focused on gratitude. Your role is to highlight moments of appreciation, joy, and gratitude that appear in the user's journal entries, even briefly or implicitly. Also note opportunities where gratitude could be cultivated or expanded. Maintain a genuine, warm tone while offering specific observations about what seems to bring the user fulfillment. Avoid generic platitudes or forced positivity—instead, reflect authentic appreciation that's already present in their writing."
    },
    {
      id: 'self-compassion',
      title: 'Self-Compassion',
      description: 'Encouragement for self-kindness in difficult moments',
      systemPrompt: "You are a warm, nurturing journaling companion focused on self-compassion. Your role is to identify moments in the user's journal entries where they might benefit from greater self-kindness, particularly when discussing challenges, perceived failures, or self-criticism. Respond with gentle encouragement that normalizes difficult emotions while offering perspective that might help them treat themselves with the same compassion they would offer a good friend. Maintain a tone that is supportive without dismissing their feelings."
    },
    {
      id: 'values-alignment',
      title: 'Values Alignment',
      description: 'Explore how your actions align with your core values',
      systemPrompt: "You are an insightful, non-judgmental journaling companion focused on values exploration. Your role is to identify potential core values reflected in the user's journal entries and note where their actions, choices, and feelings suggest alignment or misalignment with these values. Respond thoughtfully, offering observations rather than judgments, and pose questions that might help them clarify what matters most to them. Maintain a respectful, curious tone that honors the complexity of living in accordance with one's values."
    }
  ];
  
  // Format a date object to YYYY-MM-DD string for storage
  function formatDateForStorage(date) {
    return date.toISOString().split('T')[0];
  }
  
  // Format a date object as a readable string
  function formatDateReadable(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('default', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  }
  
  // Format a date string as a relative date (Today, Yesterday, etc.)
  function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      // For dates within the last week, show the day name
      const dayDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      if (dayDiff < 7) {
        return date.toLocaleDateString('default', { weekday: 'long' });
      }
      
      // Otherwise show the date
      return date.toLocaleDateString('default', { 
        month: 'short', 
        day: 'numeric'
      });
    }
  }
  
  // Load journal entries and daily notes from storage
  useEffect(() => {
    const storage = getStorage();
    const meditationData = storage.meditationData || {};
    
    // Get journal entries
    if (meditationData.journalEntries && Array.isArray(meditationData.journalEntries)) {
      // Sort entries by date
      const sortedEntries = meditationData.journalEntries.sort((a, b) => {
        const dateA = a.date || a.timestamp.split('T')[0];
        const dateB = b.date || b.timestamp.split('T')[0];
        return new Date(dateB) - new Date(dateA); // Newest first
      });
      
      setJournalEntries(sortedEntries);
      
      // Analyze journal content once entries are loaded
      if (sortedEntries.length > 0) {
        analyzeJournalContent(sortedEntries);
      }
    }
    
    // Get daily notes
    const allDailyNotes = {};
    Object.keys(storage).forEach(key => {
      // Check if key is a date (YYYY-MM-DD)
      if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
        if (storage[key].notes) {
          allDailyNotes[key] = storage[key].notes;
        }
      }
    });
    
    setDailyNotes(allDailyNotes);
  }, []);
  
  // Analyze journal content to extract insights
  const analyzeJournalContent = (entries) => {
    // Only analyze if we have entries
    if (!entries || entries.length === 0) return;
    
    // Extract all text from entries
    const allText = entries.map(entry => entry.text || '').join(' ');
    
    // Find people mentioned (names that start with capital letters)
    const peopleRegex = /\b([A-Z][a-z]+)(?:\s+[A-Z][a-z]+)?\b/g;
    const peopleMatches = [...allText.matchAll(peopleRegex)];
    
    // Count people mentions
    const peopleCounts = {};
    peopleMatches.forEach(match => {
      const name = match[0];
      peopleCounts[name] = (peopleCounts[name] || 0) + 1;
    });
    
    // Sort by frequency
    const topPeople = Object.entries(peopleCounts)
      .filter(([name]) => !['I', 'My', 'Me', 'We', 'Our', 'They', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(name)) // Filter out common words
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
    
    // Find common words
    const words = allText.toLowerCase()
      .replace(/[^\w\s]/gi, '') // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .filter(word => word.length > 3); // Only words with 4+ characters
    
    // Count word frequency
    const wordCounts = {};
    words.forEach(word => {
      if (!['this', 'that', 'with', 'from', 'have', 'about', 'would', 'could', 'should', 'there', 'their', 'they', 'were', 'when', 'what', 'then'].includes(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
    
    // Sort by frequency
    const topWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ text: word, value: count }));
    
    // Identify potential stress factors
    const stressWords = ['stress', 'anxiety', 'worried', 'nervous', 'tense', 'overwhelmed', 'exhausted', 'frustrated', 'angry', 'upset', 'tired', 'anxious', 'fear', 'scared', 'pressure', 'deadline', 'difficult'];
    
    const stressFactors = [];
    stressWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b|\\b${word}ed\\b|\\b${word}ing\\b`, 'gi');
      const matches = allText.match(regex);
      if (matches && matches.length > 0) {
        stressFactors.push({
          factor: word,
          count: matches.length,
          entries: entries.filter(entry => {
            const text = entry.text || '';
            const regex = new RegExp(`\\b${word}\\b|\\b${word}ed\\b|\\b${word}ing\\b`, 'gi');
            return text.match(regex);
          }).length
        });
      }
    });
    
    // Sort stress factors by frequency
    stressFactors.sort((a, b) => b.count - a.count);
    
    // Identify common topics
    const topics = [
      { name: 'Work', keywords: ['work', 'job', 'career', 'office', 'boss', 'colleague', 'project', 'meeting', 'deadline', 'client', 'email'] },
      { name: 'Relationships', keywords: ['friend', 'family', 'partner', 'relationship', 'date', 'love', 'together', 'conversation', 'talk', 'connect'] },
      { name: 'Health', keywords: ['health', 'exercise', 'workout', 'gym', 'run', 'sleep', 'rest', 'diet', 'food', 'eat', 'doctor', 'pain', 'tired', 'energy'] },
      { name: 'Personal Growth', keywords: ['learn', 'growth', 'improve', 'goal', 'progress', 'challenge', 'success', 'failure', 'better', 'change'] },
      { name: 'Mindfulness', keywords: ['mindful', 'meditation', 'calm', 'peace', 'relax', 'breath', 'present', 'awareness', 'focus', 'attention'] },
      { name: 'Creativity', keywords: ['create', 'creative', 'idea', 'inspire', 'write', 'art', 'music', 'design', 'project', 'make'] },
      { name: 'Stress', keywords: ['stress', 'anxiety', 'worry', 'pressure', 'overwhelm', 'tense', 'nervous', 'anxious', 'fear'] }
    ];
    
    // Count topic mentions
    const topicCounts = topics.map(topic => {
      let count = 0;
      let entryCount = 0;
      
      entries.forEach(entry => {
        const text = (entry.text || '').toLowerCase();
        const hasKeyword = topic.keywords.some(keyword => text.includes(keyword));
        if (hasKeyword) {
          entryCount++;
          topic.keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b|\\b${keyword}s\\b|\\b${keyword}ing\\b|\\b${keyword}ed\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) {
              count += matches.length;
            }
          });
        }
      });
      
      return {
        topic: topic.name,
        count,
        entries: entryCount
      };
    });
    
    // Sort topics by frequency
    topicCounts.sort((a, b) => b.count - a.count);
    
    // Find mood correlations
    const moodCorrelations = [];
    if (entries.some(entry => entry.mood !== undefined)) {
      // Group entries by mood
      const moodGroups = {
        low: entries.filter(entry => entry.mood <= 2),
        medium: entries.filter(entry => entry.mood === 3),
        high: entries.filter(entry => entry.mood >= 4)
      };
      
      // Find common words in each mood group
      Object.entries(moodGroups).forEach(([mood, moodEntries]) => {
        if (moodEntries.length > 0) {
          const moodText = moodEntries.map(entry => entry.text || '').join(' ').toLowerCase();
          
          // Create word frequency for this mood
          const moodWords = moodText
            .replace(/[^\w\s]/gi, '')
            .split(/\s+/)
            .filter(word => word.length > 3);
          
          const moodWordCounts = {};
          moodWords.forEach(word => {
            if (!['this', 'that', 'with', 'from', 'have', 'about', 'would', 'could', 'should', 'there', 'their', 'they', 'were', 'when'].includes(word)) {
              moodWordCounts[word] = (moodWordCounts[word] || 0) + 1;
            }
          });
          
          // Get top words for this mood
          const topMoodWords = Object.entries(moodWordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);
          
          moodCorrelations.push({
            mood,
            words: topMoodWords,
            count: moodEntries.length
          });
        }
      });
    }
    
    // Update state with analysis
    setJournalAnalysis({
      topWords,
      topPeople,
      stressFactors,
      topTopics: topicCounts,
      moodCorrelations,
      loaded: true
    });
  };
  
  // Save a new journal entry
  const saveJournalEntry = () => {
    if (!newEntryText.trim()) return;
    
    const storage = getStorage();
    
    // Ensure meditationData exists
    if (!storage.meditationData) {
      storage.meditationData = {};
    }
    
    // Ensure journalEntries array exists
    if (!storage.meditationData.journalEntries) {
      storage.meditationData.journalEntries = [];
    }
    
    // Create new entry object
    const newEntry = {
      id: editingEntry ? editingEntry.id : `journal-${Date.now()}`,
      title: newEntryTitle.trim() || 'Journal Entry',
      text: newEntryText.trim(),
      mood: newEntryMood,
      energy: newEntryEnergy,
      tags: newEntryTags,
      categories: newEntryCategories,
      timestamp: editingEntry ? editingEntry.timestamp : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      date: selectedDate
    };
    
    // Update or add the entry
    let updatedEntries;
    if (editingEntry) {
      // Update existing entry
      updatedEntries = journalEntries.map(entry => 
        entry.id === editingEntry.id ? newEntry : entry
      );
    } else {
      // Add new entry
      updatedEntries = [...journalEntries, newEntry];
    }
    
    // Update state
    setJournalEntries(updatedEntries);
    
    // Update storage
    storage.meditationData.journalEntries = updatedEntries;
    setStorage(storage);
    
    // Reset form
    resetEntryForm();
    
    // Re-analyze journal content with the new entry
    analyzeJournalContent(updatedEntries);
  };
  
  // Delete a journal entry
  const deleteJournalEntry = (entryId) => {
    const updatedEntries = journalEntries.filter(entry => entry.id !== entryId);
    setJournalEntries(updatedEntries);
    
    // Update storage
    const storage = getStorage();
    if (storage.meditationData) {
      storage.meditationData.journalEntries = updatedEntries;
      setStorage(storage);
    }
    
    // Close the entry if it was selected
    if (selectedEntry && selectedEntry.id === entryId) {
      setSelectedEntry(null);
    }
    
    // Clear the confirmation dialog
    setConfirmDeleteId(null);
    
    // Re-analyze journal content after deletion
    analyzeJournalContent(updatedEntries);
  };
  
  // Save daily note
  const saveDailyNote = (date, noteText) => {
    const storage = getStorage();
    const dayData = storage[date] || {};
    
    storage[date] = {
      ...dayData,
      notes: noteText.trim()
    };
    
    setStorage(storage);
    handleDataChange(date, 'journal', { notes: noteText });
    
    // Update the dailyNotes state
    setDailyNotes(prev => ({
      ...prev,
      [date]: noteText.trim()
    }));
  };
  
  // Reset the entry form
  const resetEntryForm = () => {
    setNewEntryText('');
    setNewEntryTitle('');
    setNewEntryMood(3);
    setNewEntryEnergy(2);
    setNewEntryTags([]);
    setNewEntryCategories([]);
    setActivePrompt(null);
    setEditingEntry(null);
    setShowEntryEditor(false);
  };
  
  // Edit an existing entry
  const editEntry = (entry) => {
    setEditingEntry(entry);
    setNewEntryTitle(entry.title || '');
    setNewEntryText(entry.text || '');
    setNewEntryMood(entry.mood || 3);
    setNewEntryEnergy(entry.energy || 2);
    setNewEntryTags(entry.tags || []);
    setNewEntryCategories(entry.categories || []);
    setSelectedDate(entry.date || formatDateForStorage(new Date()));
    setShowEntryEditor(true);
  };
  
  // Start a new guided journal entry
  const startGuidedJournal = (promptId) => {
    const prompt = guidedPrompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    setActivePrompt(prompt);
    setNewEntryTitle(prompt.title);
    setNewEntryText(prompt.questions.map(q => `${q}\n\n`).join('\n'));
    
    if (prompt.category) {
      setNewEntryCategories([prompt.category]);
    }
    
    setShowEntryEditor(true);
  };
  
  // Toggle a tag in the new entry
  const toggleTag = (tag) => {
    if (newEntryTags.includes(tag)) {
      setNewEntryTags(prev => prev.filter(t => t !== tag));
    } else {
      setNewEntryTags(prev => [...prev, tag]);
    }
  };
  
  // Toggle a category in the new entry
  const toggleCategory = (categoryId) => {
    if (newEntryCategories.includes(categoryId)) {
      setNewEntryCategories(prev => prev.filter(c => c !== categoryId));
    } else {
      setNewEntryCategories(prev => [...prev, categoryId]);
    }
  };
  
  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setDateFilter(date);
    
    // Switch to entries view to show filtered entries
    setActiveView('entries');
  };
  
  // Get AI insights
  const getAIInsights = async (promptId) => {
    const insightPrompt = aiInsightPrompts.find(p => p.id === promptId);
    if (!insightPrompt || journalEntries.length === 0) return;
    
    setIsLoadingAI(true);
    setSelectedInsight(insightPrompt);
    
    try {
      // Get most recent entries (limit to 5 for performance)
      const recentEntries = journalEntries
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5)
        .map(entry => `[${new Date(entry.timestamp).toLocaleDateString()}] ${entry.title}\n${entry.text}`);
      
      const prompt = `
${insightPrompt.systemPrompt}

Here are my recent journal entries:

${recentEntries.join('\n\n---\n\n')}

Please provide thoughtful insights based on these entries.
      `;
      
      const response = await generateContent(prompt);
      setAiResponse(response);
    } catch (error) {
      console.error('Error getting AI insights:', error);
      setAiResponse('Sorry, there was an error generating insights. Please try again later.');
    } finally {
      setIsLoadingAI(false);
    }
  };
  
  // Filter journal entries
  const filteredEntries = React.useMemo(() => {
    let filtered = [...journalEntries];
    
    // Apply date filter if set
    if (dateFilter) {
      filtered = filtered.filter(entry => {
        const entryDate = entry.date || entry.timestamp.split('T')[0];
        return entryDate === dateFilter;
      });
    }
    
    // Apply search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        (entry.title && entry.title.toLowerCase().includes(term)) ||
        (entry.text && entry.text.toLowerCase().includes(term))
      );
    }
    
    // Apply tag filters
    if (filterByTags.length > 0) {
      filtered = filtered.filter(entry => {
        if (!entry.tags || !Array.isArray(entry.tags)) return false;
        return filterByTags.some(tag => entry.tags.includes(tag));
      });
    }
    
    // Apply category filters
    if (filterByCategories.length > 0) {
      filtered = filtered.filter(entry => {
        if (!entry.categories || !Array.isArray(entry.categories)) return false;
        return filterByCategories.some(cat => entry.categories.includes(cat));
      });
    }
    
    // Apply mood range filter
    filtered = filtered.filter(entry => {
      if (entry.mood === undefined) return true;
      return entry.mood >= filterByMoodRange[0] && entry.mood <= filterByMoodRange[1];
    });
    
    // Apply sorting
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.date || a.timestamp || 0);
      const dateB = new Date(b.date || b.timestamp || 0);
      
      return sortBy === 'newest' 
        ? dateB - dateA // newest first
        : dateA - dateB; // oldest first
    });
    
    return filtered;
  }, [journalEntries, searchTerm, filterByTags, filterByCategories, filterByMoodRange, sortBy, dateFilter]);
  
  // Group entries by date for the list view
  const entriesByDate = React.useMemo(() => {
    const groupedEntries = {};
    
    filteredEntries.forEach(entry => {
      const date = entry.date || entry.timestamp.split('T')[0];
      if (!groupedEntries[date]) {
        groupedEntries[date] = [];
      }
      groupedEntries[date].push(entry);
    });
    
    return groupedEntries;
  }, [filteredEntries]);
  
  // Get all unique tags from journal entries
  const allTags = React.useMemo(() => {
    const tagSet = new Set();
    journalEntries.forEach(entry => {
      if (entry.tags && Array.isArray(entry.tags)) {
        entry.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [journalEntries]);
  
  // Get the mood emoji
  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 1: return '😔';
      case 2: return '😕';
      case 3: return '😐';
      case 4: return '🙂';
      case 5: return '😊';
      default: return '😐';
    }
  };
  
  // Get the color class for mood
  const getMoodColorClass = (mood) => {
    switch (mood) {
      case 1: return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 2: return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      case 3: return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 4: return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
      case 5: return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };
  
  // Get the color class for a category
  const getCategoryColorClass = (categoryId) => {
    switch (categoryId) {
      case 'meditation': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300';
      case 'gratitude': return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300';
      case 'work': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'relationships': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
      case 'personal': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
      case 'health': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'morning': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'evening': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };
  
  // Get daily note for a specific date
  const getDailyNote = (date) => {
    return dailyNotes[date] || '';
  };
  
  // Mood color gradient helper
  const getMoodGradient = (mood) => {
    switch (mood) {
      case 1: return 'from-red-500 to-red-600';
      case 2: return 'from-orange-500 to-orange-600';
      case 3: return 'from-yellow-500 to-yellow-600';
      case 4: return 'from-emerald-500 to-emerald-600';
      case 5: return 'from-green-500 to-green-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  // Render the entries list view - Guided journal experience
  const renderEntriesView = () => (
    <div className="space-y-6">
      {/* Filter indicator if filtering by date */}
      {dateFilter && (
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg flex justify-between items-center animate-pulse">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-indigo-500 dark:text-indigo-400" />
            <span className="text-sm text-indigo-600 dark:text-indigo-300">
              Showing entries for {formatDateReadable(dateFilter)}
            </span>
          </div>
          <button 
            onClick={() => setDateFilter(null)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
          >
            Clear filter
          </button>
        </div>
      )}
    
      {/* Search and journaling prompts */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 transition-colors">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          </div>
          
          {/* Quick add button */}
          <button
            onClick={() => {
              setSelectedDate(formatDateForStorage(new Date()));
              resetEntryForm();
              setShowEntryEditor(true);
            }}
            className="flex items-center gap-1 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>New Entry</span>
          </button>
          
          {/* Filter button */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                filterByTags.length > 0 || filterByCategories.length > 0
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Filter size={18} />
              <span>
                {filterByTags.length > 0 || filterByCategories.length > 0
                  ? `Filters (${filterByTags.length + filterByCategories.length})`
                  : 'Filter'}
              </span>
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showFilters && (
              <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 z-10 w-72 max-h-96 overflow-y-auto">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Filter by Category
                </h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {availableCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        if (filterByCategories.includes(category.id)) {
                          setFilterByCategories(filterByCategories.filter(c => c !== category.id));
                        } else {
                          setFilterByCategories([...filterByCategories, category.id]);
                        }
                      }}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                        filterByCategories.includes(category.id)
                          ? getCategoryColorClass(category.id)
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {category.icon}
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
                
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Filter by Tag
                </h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {allTags.length > 0 ? (
                    allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (filterByTags.includes(tag)) {
                            setFilterByTags(filterByTags.filter(t => t !== tag));
                          } else {
                            setFilterByTags([...filterByTags, tag]);
                          }
                        }}
                        className={`text-xs px-2 py-1 rounded-full transition-colors ${
                          filterByTags.includes(tag)
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No tags found in your journal entries.
                    </p>
                  )}
                </div>
                
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => {
                      setFilterByTags([]);
                      setFilterByCategories([]);
                      setFilterByMoodRange([1, 5]);
                    }}
                    className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-sm px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Journaling prompts */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-500 dark:text-amber-400" />
              Journaling Prompts
            </h4>
            <button
              onClick={() => {
                const randomPrompt = guidedPrompts[Math.floor(Math.random() * guidedPrompts.length)];
                startGuidedJournal(randomPrompt.id);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            >
              Try random prompt
            </button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-2 px-2 prompt-scroll-container">
            {guidedPrompts.map((prompt) => (
              <div
                key={prompt.id}
                onClick={() => startGuidedJournal(prompt.id)}
                className="flex-shrink-0 w-48 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors cursor-pointer border border-amber-100 dark:border-amber-800/30"
              >
                <h5 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                  {prompt.title}
                </h5>
                <p className="text-xs text-amber-700 dark:text-amber-400 line-clamp-2">
                  {prompt.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Streak Calendar */}
      <JournalStreakCalendar 
        journalEntries={journalEntries} 
        onSelectDate={handleDateSelect}
      />

      {/* Journal entries list */}
      {Object.entries(entriesByDate).length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 text-center transition-colors">
          <BookOpen size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-500" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            No journal entries found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            {searchTerm || filterByTags.length > 0 || filterByCategories.length > 0 || dateFilter
              ? "Try changing your search or filters to see more entries."
              : "Start writing in your journal to capture your thoughts, reflections, and experiences."}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setSelectedDate(formatDateForStorage(new Date()));
                resetEntryForm();
                setShowEntryEditor(true);
              }}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center gap-2"
            >
              <PenTool size={18} />
              Write New Entry
            </button>
            <button
              onClick={() => startGuidedJournal('daily-reflection')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-2"
            >
              <Lightbulb size={18} />
              Guided Journal
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(entriesByDate).map(([date, entries]) => (
            <div key={date} id={`date-section-${date}`} className="animate-slideIn">
              <div className="flex items-center mb-3 sticky top-0 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg z-10">
                <Calendar size={18} className="text-indigo-500 dark:text-indigo-400 mr-2" />
                <h3 className="text-md font-medium text-slate-700 dark:text-slate-300">
                  {formatRelativeDate(date)} - {formatDateReadable(date)}
                </h3>
              </div>
              
              {/* Daily note for this date (if exists) */}
              {dailyNotes[date] && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-4 border-l-4 border-amber-500 dark:border-amber-600 transition-colors">
                  <div className="flex items-start">
                    <div className="mr-2 mt-1">
                      <Lightbulb size={16} className="text-amber-500 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
                        Daily Note
                      </h4>
                      <p className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-wrap">
                        {dailyNotes[date]}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDate(date);
                        setActiveView('calendar');
                      }}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
              
              {/* Entries for this date */}
              <div className="space-y-4">
                {entries.map(entry => (
                  <div 
                    key={entry.id} 
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
                    onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                  >
                    {/* Entry header with mood gradient */}
                    <div className={`h-2 bg-gradient-to-r ${getMoodGradient(entry.mood)}`}></div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-medium text-slate-800 dark:text-slate-100 flex-1 mr-2">
                          {entry.title || 'Journal Entry'}
                        </h4>
                        
                        <div className="flex items-center gap-3">
                          {/* Mood indicator */}
                          {entry.mood && (
                            <div 
                              className={`rounded-full p-1 ${getMoodColorClass(entry.mood)}`} 
                              title={`Mood: ${entry.mood}/5`}
                            >
                              <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                            </div>
                          )}
                          
                          {/* Entry time */}
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Clock size={12} />
                            <span>
                              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Categories */}
                      {entry.categories && entry.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {entry.categories.map(categoryId => {
                            const category = availableCategories.find(c => c.id === categoryId);
                            return (
                              <span
                                key={categoryId}
                                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getCategoryColorClass(categoryId)}`}
                              >
                                {category?.icon}
                                <span>{category?.name || categoryId}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Entry content */}
                      <div className="mb-3">
                        <p className={`text-slate-600 dark:text-slate-400 whitespace-pre-wrap ${
                          selectedEntry?.id === entry.id ? '' : 'line-clamp-3'
                        }`}>
                          {entry.text}
                        </p>
                        
                        {!selectedEntry?.id === entry.id && entry.text.length > 300 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEntry(entry);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline mt-2"
                          >
                            Read more
                          </button>
                        )}
                      </div>
                      
                      {/* Tags */}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {entry.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Action buttons - shown when entry is selected */}
                      {selectedEntry?.id === entry.id && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              editEntry(entry);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(entry.id);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* More actions */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                setSelectedDate(formatDateForStorage(new Date()));
                resetEntryForm();
                setShowEntryEditor(true);
              }}
              className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg flex items-center gap-2 hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
            >
              <PenTool size={18} />
              Write New Entry
            </button>
          </div>
        </div>
      )}

      {/* CSS for custom scrollbar and animations */}
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        
        .prompt-scroll-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(99, 102, 241, 0.3) transparent;
        }
        
        .prompt-scroll-container::-webkit-scrollbar {
          height: 6px;
        }
        
        .prompt-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .prompt-scroll-container::-webkit-scrollbar-thumb {
          background-color: rgba(99, 102, 241, 0.3);
          border-radius: 6px;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
  
  // Render the calendar view with monthly calendar
  const renderCalendarView = () => (
    <div className="space-y-6">
      {/* Monthly calendar component */}
      <MonthlyCalendar 
        journalEntries={journalEntries}
        onSelectDate={handleDateSelect}
        selectedDate={selectedDate}
      />
      
      {/* Selected date section */}
      {selectedDate && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 xs:p-6 transition-colors">
          <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-3">
            {formatDateReadable(selectedDate)}
          </h4>
          
          {/* Daily notes for selected date */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-4 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h5 className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-500 dark:text-amber-400" />
                Daily Note
              </h5>
              
              <button
                onClick={() => {
                  const textArea = document.getElementById('daily-note-textarea');
                  if (textArea) {
                    textArea.focus();
                  }
                }}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
              >
                Edit
              </button>
            </div>
            
            <textarea
              id="daily-note-textarea"
              value={getDailyNote(selectedDate)}
              onChange={(e) => saveDailyNote(selectedDate, e.target.value)}
              placeholder="Add notes for this day..."
              className="w-full p-2 bg-white dark:bg-slate-800 rounded-lg text-amber-800 dark:text-amber-200 placeholder-amber-400 dark:placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 min-h-[80px] transition-colors"
            />
          </div>
          
          {/* Entries for selected date */}
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Journal Entries
              </h5>
              
              <button 
                onClick={() => {
                  resetEntryForm();
                  setShowEntryEditor(true);
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Plus size={14} />
                Add Entry
              </button>
            </div>
            
            {journalEntries.filter(entry => {
              const entryDate = entry.date || entry.timestamp.split('T')[0];
              return entryDate === selectedDate;
            }).map(entry => (
              <div 
                key={entry.id} 
                className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-4 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="text-md font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    {entry.title || 'Journal Entry'}
                    <span className="text-xl" title={`Mood: ${entry.mood}/5`}>
                      {getMoodEmoji(entry.mood)}
                    </span>
                  </h5>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => editEntry(entry)}
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(entry.id)}
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Entry content */}
                <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-2">
                  {entry.text}
                </p>
                
                {/* Categories */}
                {entry.categories && entry.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.categories.map(categoryId => {
                      const category = availableCategories.find(c => c.id === categoryId);
                      return (
                        <span
                          key={categoryId}
                          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getCategoryColorClass(categoryId)}`}
                        >
                          {category?.icon}
                          <span>{category?.name || categoryId}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
                
                {/* View entry button */}
                <button
                  onClick={() => {
                    setSelectedEntry(entry);
                    setDateFilter(selectedDate);
                    setActiveView('entries');
                  }}
                  className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Eye size={14} />
                  View full entry
                </button>
              </div>
            ))}
            
            {journalEntries.filter(entry => {
              const entryDate = entry.date || entry.timestamp.split('T')[0];
              return entryDate === selectedDate;
            }).length === 0 && (
              <div className="text-center py-6">
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  No journal entries for this date.
                </p>
                <button
                  onClick={() => {
                    resetEntryForm();
                    setShowEntryEditor(true);
                  }}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg inline-flex items-center gap-2 text-sm"
                >
                  <PenTool size={16} />
                  Write New Entry
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
  
  // Render the insights view with AI-powered analysis
  const renderInsightsView = () => (
    <div className="space-y-6">
      {/* Journal Stats Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <BarChart2 size={20} className="text-green-500 dark:text-green-400" />
          Journal Statistics
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Entries</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{journalEntries.length}</p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">This Month</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {journalEntries.filter(entry => {
                const entryDate = new Date(entry.timestamp);
                const now = new Date();
                return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Average Mood</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {journalEntries.length > 0 
                ? (journalEntries.reduce((sum, entry) => sum + (entry.mood || 3), 0) / journalEntries.length).toFixed(1)
                : "-"
              }
            </p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Categories</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {(() => {
                const categorySet = new Set();
                journalEntries.forEach(entry => {
                  if (entry.categories) {
                    entry.categories.forEach(cat => categorySet.add(cat));
                  }
                });
                return categorySet.size;
              })()}
            </p>
          </div>
        </div>
        
        {/* Journal analysis charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Topics */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-indigo-500 dark:text-indigo-400" />
              Top Topics
            </h4>
            
            {journalAnalysis.loaded && journalAnalysis.topTopics.length > 0 ? (
              journalAnalysis.topTopics.slice(0, 5).map(topic => (
                <div key={topic.topic} className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {topic.topic}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {topic.entries} entries
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                      style={{ width: `${Math.min(100, (topic.entries / journalEntries.length * 100))}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Add more journal entries to see topic analysis.
                </p>
              </div>
            )}
          </div>
          
          {/* Stress Factors */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Frown size={16} className="text-red-500 dark:text-red-400" />
              Stress Factors
            </h4>
            
            {journalAnalysis.loaded && journalAnalysis.stressFactors.length > 0 ? (
              journalAnalysis.stressFactors.slice(0, 5).map(factor => (
                <div key={factor.factor} className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {factor.factor}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {factor.count} mentions
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500" 
                      style={{ 
                        width: `${Math.min(100, (factor.count / Math.max(...journalAnalysis.stressFactors.map(f => f.count)) * 100))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  No stress indicators detected in your journal entries.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* People Mentioned */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Users size={16} className="text-emerald-500 dark:text-emerald-400" />
              People Mentioned
            </h4>
            
            {journalAnalysis.loaded && journalAnalysis.topPeople.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {journalAnalysis.topPeople.slice(0, 6).map(person => (
                  <div key={person.name} className="bg-slate-100 dark:bg-slate-600 p-2 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-500 dark:text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                        {person.name}
                      </span>
                    </div>
                    <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full">
                      {person.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  No people detected in your journal entries.
                </p>
              </div>
            )}
          </div>
          
          {/* Mood correlations */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Activity size={16} className="text-blue-500 dark:text-blue-400" />
              Mood Patterns
            </h4>
            
            {journalAnalysis.loaded && journalAnalysis.moodCorrelations.length > 0 ? (
              <div className="space-y-3">
                {journalAnalysis.moodCorrelations.map(mood => (
                  <div key={mood.mood} className="bg-slate-100 dark:bg-slate-600 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">
                        {mood.mood === 'low' ? '😔' : mood.mood === 'medium' ? '😐' : '😊'}
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {mood.mood === 'low' ? 'Low' : mood.mood === 'medium' ? 'Neutral' : 'High'} Mood ({mood.count} entries)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {mood.words.map(word => (
                        <span key={word} className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Add more journal entries with mood ratings to see patterns.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* AI Insights Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <Brain size={20} className="text-indigo-500 dark:text-indigo-400" />
          AI-Powered Journal Insights
        </h3>
        
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Get personalized insights from your journal entries to discover patterns, themes, and opportunities for growth.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {aiInsightPrompts.map(prompt => (
            <button
              key={prompt.id}
              onClick={() => getAIInsights(prompt.id)}
              className={`bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-left hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex flex-col ${
                selectedInsight?.id === prompt.id ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <span className="text-md font-medium text-slate-800 dark:text-slate-100 mb-1">
                {prompt.title}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {prompt.description}
              </span>
            </button>
          ))}
        </div>
        
        {/* AI Response */}
        {isLoadingAI ? (
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-slate-300 dark:bg-slate-600 h-12 w-12 mb-4"></div>
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/3"></div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-4">
              Analyzing your journal entries...
            </p>
          </div>
        ) : aiResponse ? (
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
            <div className="flex items-start">
              <Brain size={24} className="text-indigo-500 dark:text-indigo-400 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-md font-medium text-slate-800 dark:text-slate-100 mb-3">
                  {selectedInsight ? selectedInsight.title : 'Journal Insights'}
                </h4>
                <div className="text-slate-700 dark:text-slate-300 prose prose-sm dark:prose-invert">
                  {aiResponse.split('\n').map((paragraph, idx) => (
                    paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              {journalEntries.length === 0 
                ? "Add some journal entries first to get AI-powered insights."
                : "Select an insight type above to analyze your recent journal entries."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
  
  // Render entry editor modal
  const renderEntryEditor = () => (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center">
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-3xl mt-4 transition-all duration-300 ${
        isFullscreen ? 'fixed inset-2' : ''
      }`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
            {editingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={() => resetEntryForm()}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {/* Entry title */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Entry Title"
              value={newEntryTitle}
              onChange={(e) => setNewEntryTitle(e.target.value)}
              className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-lg font-medium transition-colors"
            />
          </div>
          
          {/* Mood and energy selectors */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mood
              </label>
              <div className="flex justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                {[1, 2, 3, 4, 5].map(mood => (
                  <button
                    key={mood}
                    onClick={() => setNewEntryMood(mood)}
                    className={`text-2xl p-1 rounded-full transition-colors ${
                      newEntryMood === mood 
                        ? 'bg-white dark:bg-slate-600 scale-110 transform'
                        : 'hover:bg-white/50 dark:hover:bg-slate-600/50'
                    }`}
                  >
                    {getMoodEmoji(mood)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 min-w-[120px]">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Energy
              </label>
              <div className="flex justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                {[1, 2, 3].map(energy => (
                  <button
                    key={energy}
                    onClick={() => setNewEntryEnergy(energy)}
                    className={`p-2 rounded-full transition-colors flex items-center justify-center ${
                      newEntryEnergy === energy 
                        ? 'bg-white dark:bg-slate-600 scale-110 transform'
                        : 'hover:bg-white/50 dark:hover:bg-slate-600/50'
                    }`}
                  >
                    {energy === 1 && <div className="w-6 h-6 bg-red-500 rounded-full"></div>}
                    {energy === 2 && <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>}
                    {energy === 3 && <div className="w-6 h-6 bg-green-500 rounded-full"></div>}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 min-w-[120px]">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
              />
            </div>
          </div>
          
          {/* Categories */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Categories
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              {availableCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    newEntryCategories.includes(category.id)
                      ? getCategoryColorClass(category.id)
                      : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Text editor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Journal Entry
            </label>
            <textarea
              ref={editorRef}
              value={newEntryText}
              onChange={(e) => setNewEntryText(e.target.value)}
              placeholder="Write your thoughts here..."
              className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 min-h-[200px] transition-colors"
            />
          </div>
          
          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              {allTags.concat(popularTags.filter(tag => !allTags.includes(tag))).slice(0, 15).map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    newEntryTags.includes(tag)
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  #{tag}
                </button>
              ))}
              
              {/* Custom tag input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Add tag..."
                  className="px-3 py-1 rounded-full text-xs bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      toggleTag(e.target.value.trim().toLowerCase());
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={resetEntryForm}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={saveJournalEntry}
              disabled={!newEntryText.trim()}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                newEntryText.trim()
                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save size={18} />
              {editingEntry ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render delete confirmation modal
  const renderDeleteConfirmationModal = () => {
    if (!confirmDeleteId) return null;
    
    const entryToDelete = journalEntries.find(entry => entry.id === confirmDeleteId);
    if (!entryToDelete) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-start mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mr-4">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
            </div>
            <div>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">
                Delete Journal Entry
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Are you sure you want to delete "{entryToDelete.title || 'this journal entry'}"? This action cannot be undone.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteJournalEntry(confirmDeleteId)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 size={18} />
              Delete Entry
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`space-y-6 w-full journal-container ${isFullscreen ? 'fixed inset-0 bg-white dark:bg-slate-900 z-50 p-6 overflow-auto' : ''}`}>
      {/* Journal Header with Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 relative transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="text-indigo-500 dark:text-indigo-400" size={22} />
            Journal & Reflections
          </h2>
          
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <Minimize2 size={18} />
            </button>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            className={`pb-3 px-2 relative transition-colors ${
              activeView === 'entries' 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            onClick={() => setActiveView('entries')}
          >
            <div className="flex items-center gap-1">
              <MessageSquare size={18} />
              <span className="font-medium hidden xs:inline">Entries</span>
            </div>
            {activeView === 'entries' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>
            )}
          </button>
          
          <button
            className={`pb-3 px-2 relative transition-colors ${
              activeView === 'calendar' 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            onClick={() => setActiveView('calendar')}
          >
            <div className="flex items-center gap-1">
              <Calendar size={18} />
              <span className="font-medium hidden xs:inline">Calendar</span>
            </div>
            {activeView === 'calendar' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>
            )}
          </button>
          
          <button
            className={`pb-3 px-2 relative transition-colors ${
              activeView === 'insights' 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            onClick={() => setActiveView('insights')}
          >
            <div className="flex items-center gap-1">
              <Brain size={18} />
              <span className="font-medium hidden xs:inline">Insights</span>
            </div>
            {activeView === 'insights' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>
            )}
          </button>
        </div>
      </div>
      
      {/* View Content */}
      {activeView === 'entries' && renderEntriesView()}
      {activeView === 'calendar' && renderCalendarView()}
      {activeView === 'insights' && renderInsightsView()}
      
      {/* Entry Editor Modal */}
      {showEntryEditor && renderEntryEditor()}
      
      {/* Delete Confirmation Modal */}
      {confirmDeleteId && renderDeleteConfirmationModal()}
    </div>
  );
};

export default JournalHub;