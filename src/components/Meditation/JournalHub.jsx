import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Plus, Search, Calendar, Edit2, Trash2, ChevronDown, ChevronUp, X, 
  Save, PenTool, Lightbulb, Sparkles, RefreshCw, MessageSquare, Smile, 
  Brain, BarChart2, Maximize2, Minimize2, Tag, User, Heart, Briefcase, 
  Users, Star, Activity, Sun, Moon, Filter, Palette, Map, Eye, Award,
  ChevronRight, ChevronLeft, Clock, Zap, AlertTriangle
} from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import { handleDataChange } from '../../utils/dayCoachUtils';
import { 
  migrateLegacyNotes, 
  syncJournalToDayNotes, 
  getJournalEntriesForDate,
  getAllPeopleMentioned,
  getAllTags,
  initializeJournalSystem
} from '../../utils/journalMigration';
import { formatDateForStorage } from '../../utils/dateUtils';
import JournalEditor from './JournalEditor';
import MonthlyCalendar from './MonthlyCalendar';
import JournalInsights from './JournalInsights';

const JournalHub = () => {
  // View state management
  const [activeView, setActiveView] = useState('entries'); // 'entries', 'calendar', 'insights'
  const [selectedDate, setSelectedDate] = useState(formatDateForStorage(new Date()));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [showAllPrompts, setShowAllPrompts] = useState(false);

  const [touchStart, setTouchStart] = useState(null);
const [touchEnd, setTouchEnd] = useState(null);
  
  // Journal entries and data
  const [journalEntries, setJournalEntries] = useState([]);
  const [dailyNotes, setDailyNotes] = useState({});
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  
  // Entry creation/editing state
  const [showEntryEditor, setShowEntryEditor] = useState(false);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterByTags, setFilterByTags] = useState([]);
  const [filterByCategories, setFilterByCategories] = useState([]);
  const [filterByMoodRange, setFilterByMoodRange] = useState([1, 5]);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);
  
  // Available categories
  const availableCategories = [
    { id: 'meditation', name: 'Meditation', icon: <Brain size={16} className="text-indigo-500 dark:text-indigo-400" /> },
    { id: 'gratitude', name: 'Gratitude', icon: <Heart size={16} className="text-rose-500 dark:text-rose-400" /> },
    { id: 'work', name: 'Work', icon: <Briefcase size={16} className="text-blue-500 dark:text-blue-400" /> },
    { id: 'relationships', name: 'Relationships', icon: <Users size={16} className="text-emerald-500 dark:text-emerald-400" /> },
    { id: 'personal', name: 'Personal', icon: <Star size={16} className="text-amber-500 dark:text-amber-400" /> },
    { id: 'health', name: 'Health', icon: <Activity size={16} className="text-red-500 dark:text-red-400" /> },
    { id: 'morning', name: 'Morning', icon: <Sun size={16} className="text-yellow-500 dark:text-yellow-400" /> },
    { id: 'evening', name: 'Evening', icon: <Moon size={16} className="text-purple-500 dark:text-purple-400" /> },
    { id: 'social', name: 'Social', icon: <Users size={16} className="text-pink-500 dark:text-pink-400" /> },
    { id: 'hobbies', name: 'Hobbies', icon: <Palette size={16} className="text-teal-500 dark:text-teal-400" /> },
    { id: 'travel', name: 'Travel', icon: <Map size={16} className="text-cyan-500 dark:text-cyan-400" /> }
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
    }
  ];
  
  useEffect(() => {
    // Only activate keyboard navigation when viewing an entry
    if (!viewingEntry) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        // Navigate to previous entry
        navigateToPreviousEntry();
      } else if (e.key === 'ArrowRight') {
        // Navigate to next entry
        navigateToNextEntry();
      } else if (e.key === 'Escape') {
        // Close the modal on Escape
        setViewingEntry(null);
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewingEntry]); // Re-run when viewing entry changes

  const navigateToPreviousEntry = () => {
    if (!viewingEntry) return;
    
    const navigableEntries = filteredEntries;
    const currentIndex = navigableEntries.findIndex(entry => entry.id === viewingEntry.id);
    
    if (currentIndex > 0) {
      setViewingEntry(navigableEntries[currentIndex - 1]);
    }
  };
  
  const navigateToNextEntry = () => {
    if (!viewingEntry) return;
    
    const navigableEntries = filteredEntries;
    const currentIndex = navigableEntries.findIndex(entry => entry.id === viewingEntry.id);
    
    if (currentIndex < navigableEntries.length - 1) {
      setViewingEntry(navigableEntries[currentIndex + 1]);
    }
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50; // Minimum swipe distance (in px)
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && canNavigateToNext()) {
      navigateToNextEntry();
    } else if (isRightSwipe && canNavigateToPrevious()) {
      navigateToPreviousEntry();
    }
  };
  
  // Helper functions to check if navigation is possible
  const canNavigateToPrevious = () => {
    if (!viewingEntry) return false;
    const currentIndex = filteredEntries.findIndex(entry => entry.id === viewingEntry.id);
    return currentIndex > 0;
  };
  
  const canNavigateToNext = () => {
    if (!viewingEntry) return false;
    const currentIndex = filteredEntries.findIndex(entry => entry.id === viewingEntry.id);
    return currentIndex < filteredEntries.length - 1;
  };

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
  
  // Initialize journal system and load data on component mount
  useEffect(() => {
    // Run journal system initialization
    initializeJournalSystem();
    
    // Load journal entries and daily notes
    loadJournalEntries();
    loadDailyNotes();
  }, []);
  
  // Load journal entries from storage
  const loadJournalEntries = () => {
    const storage = getStorage();
    const meditationData = storage.meditationData || {};
    
    if (meditationData.journalEntries && Array.isArray(meditationData.journalEntries)) {
      // Sort entries by date, newest first
      const sortedEntries = meditationData.journalEntries.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB - dateA;
      });
      
      setJournalEntries(sortedEntries);
    }
  };
  
  // Load daily notes from storage
  const loadDailyNotes = () => {
    const storage = getStorage();
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
  };
  
  // Get a single daily note for a date
  const getDailyNote = (date) => {
    return dailyNotes[date] || '';
  };
  
  // Save a journal entry (new or edited)
  const saveJournalEntry = (entryData) => {
    const storage = getStorage();
    
    // Ensure meditationData exists
    if (!storage.meditationData) {
      storage.meditationData = {};
    }
    
    // Ensure journalEntries array exists
    if (!storage.meditationData.journalEntries) {
      storage.meditationData.journalEntries = [];
    }
    
    if (editingEntry) {
      // Update existing entry
      storage.meditationData.journalEntries = storage.meditationData.journalEntries.map(entry => 
        entry.id === editingEntry.id ? entryData : entry
      );
    } else {
      // Add new entry
      storage.meditationData.journalEntries.push(entryData);
    }
    
    // Update storage
    setStorage(storage);
    
    // Sync with day notes for backward compatibility
    const dateStr = entryData.date || entryData.timestamp.split('T')[0];
    const entriesForDate = storage.meditationData.journalEntries.filter(entry => {
      const entryDate = entry.date || entry.timestamp.split('T')[0];
      return entryDate === dateStr;
    });
    
    syncJournalToDayNotes(dateStr, entriesForDate);
    
    // Update local state
    loadJournalEntries();
    
    // Clear editing state
    setEditingEntry(null);
    setShowEntryEditor(false);
    
    // Notify other modules of the change
    handleDataChange(dateStr, 'journal', { 
      entriesCount: entriesForDate.length,
      recentEntry: entryData
    });
  };
  
  // Delete a journal entry
  const deleteJournalEntry = (entryId) => {
    const storage = getStorage();
    const meditationData = storage.meditationData || {};
    
    if (!meditationData.journalEntries) {
      return;
    }
    
    // Find the entry to get its date before removing it
    const entryToDelete = meditationData.journalEntries.find(entry => entry.id === entryId);
    const dateStr = entryToDelete ? (entryToDelete.date || entryToDelete.timestamp.split('T')[0]) : null;
    
    // Filter out the entry to delete
    const updatedEntries = meditationData.journalEntries.filter(entry => entry.id !== entryId);
    
    // Update storage
    storage.meditationData.journalEntries = updatedEntries;
    setStorage(storage);
    
    // Update local state
    setJournalEntries(updatedEntries);
    
    // Clear selected entry if it was deleted
    if (selectedEntry && selectedEntry.id === entryId) {
      setSelectedEntry(null);
    }
    
    // Close confirmation dialog
    setConfirmDeleteId(null);
    
    // If we have the date, resync day notes for that date
    if (dateStr) {
      const entriesForDate = updatedEntries.filter(entry => {
        const entryDate = entry.date || entry.timestamp.split('T')[0];
        return entryDate === dateStr;
      });
      
      syncJournalToDayNotes(dateStr, entriesForDate);
      
      // Notify other modules of the change
      handleDataChange(dateStr, 'journal', { 
        entriesCount: entriesForDate.length 
      });
    }
  };
  
  // Start a guided journal entry
  const startGuidedJournal = (promptId) => {
    const prompt = guidedPrompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    // Create entry data for the guided prompt
    const entryData = {
      id: `new-${Date.now()}`,
      title: prompt.title,
      text: prompt.questions.map(q => `${q}\n\n`).join('\n'),
      categories: prompt.category ? [prompt.category] : [],
      tags: ['guided', promptId],
      mood: 3,
      energy: 2,
      date: selectedDate,
      timestamp: new Date().toISOString(),
      people: []
    };
    
    setEditingEntry(entryData);
    setShowEntryEditor(true);
    
    return entryData;
  };
  
  // Handle date selection (from calendar or streak calendar)
  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setDateFilter(date);
    
    // Switch to entries view to show filtered entries
    setActiveView('entries');
  };
  
  // Add a new entry
  const handleAddEntry = () => {
    // Create a new empty entry with default values
    const newEntry = {
      id: `new-${Date.now()}`,
      title: '',
      text: '',
      mood: 3,
      energy: 2,
      categories: [],
      tags: [],
      people: [],
      date: selectedDate,
      timestamp: new Date().toISOString()
    };
    
    setEditingEntry(newEntry);
    setShowEntryEditor(true);
  };
  
  // Edit an existing entry
  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setShowEntryEditor(true);
  };

  // View a single entry in detail
  const handleViewEntry = (entry) => {
    setViewingEntry(entry);
  };
  
  // Filter journal entries based on search and filters
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
        (entry.text && entry.text.toLowerCase().includes(term)) ||
        (entry.people && entry.people.some(person => person.toLowerCase().includes(term)))
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
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      
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
  
  // Calculate current streak
  const calculateCurrentStreak = () => {
    if (!journalEntries || journalEntries.length === 0) return 0;
    
    // Get all entry dates
    const entryDates = new Set();
    journalEntries.forEach(entry => {
      const dateStr = entry.date || entry.timestamp.split('T')[0];
      entryDates.add(dateStr);
    });
    
    // Sort dates newest to oldest
    const sortedDates = Array.from(entryDates).sort().reverse();
    if (sortedDates.length === 0) return 0;
    
    // Check if most recent entry was today or yesterday
    const now = new Date();
    const today = formatDateForStorage(now);
    const yesterday = formatDateForStorage(new Date(now.setDate(now.getDate() - 1)));
    
    const lastEntryDate = sortedDates[0];
    if (lastEntryDate !== today && lastEntryDate !== yesterday) return 0;
    
    // Count streak
    let streak = 1;
    let currentDate = new Date(lastEntryDate);
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(currentDate.getDate() - 1);
      const prevDateStr = formatDateForStorage(prevDate);
      
      if (sortedDates[i] === prevDateStr) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  // Get last 7 days for streak display
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    const entryDates = new Set();
    
    // Collect all entry dates
    journalEntries.forEach(entry => {
      const dateStr = entry.date || entry.timestamp.split('T')[0];
      entryDates.add(dateStr);
    });
    
    // Get the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = formatDateForStorage(date);
      
      days.push({
        date: dateStr,
        day: date.getDate(),
        shortName: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()],
        hasEntry: entryDates.has(dateStr),
        isToday: i === 0
      });
    }
    
    return days;
  };

  // Helper function to get category color class
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
      case 'social': return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300';
      case 'hobbies': return 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300';
      case 'travel': return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };
  
  // Helper function to get mood color class
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
  
  // Helper function to get mood emoji
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
  
  // Helper function to get category name
  const getCategoryName = (categoryId) => {
    const category = availableCategories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };
  
  // Helper function to get category icon
  const getCategoryIcon = (categoryId) => {
    const category = availableCategories.find(c => c.id === categoryId);
    return category ? category.icon : <AlertTriangle size={16} className="text-amber-500" />;
  };
  
  // Format the timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Render the entries list view
  const renderEntriesView = () => (
    <div className="space-y-6">
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
            onClick={handleAddEntry}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>New Entry</span>
          </button>
          
          {/* Filter button */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                filterByTags.length > 0 || filterByCategories.length > 0
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Filter size={18} />
              <span className="hidden xs:inline">
                {filterByTags.length > 0 || filterByCategories.length > 0
                  ? `Filters (${filterByTags.length + filterByCategories.length})`
                  : 'Filter'}
              </span>
              {showFilters ? <ChevronUp size={16} className="hidden xs:block" /> : <ChevronDown size={16} className="hidden xs:block" />}
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
        
        {/* Journaling prompts - Mobile optimized */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-500 dark:text-amber-400" />
              Journaling Prompts
            </h4>
            <button
              onClick={() => {
                const randomPrompt = guidedPrompts[Math.floor(Math.random() * guidedPrompts.length)];
                const entryData = startGuidedJournal(randomPrompt.id);
                if (entryData) {
                  setEditingEntry({
                    ...entryData,
                    id: `new-${Date.now()}`
                  });
                }
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            >
              Random
            </button>
          </div>
          
          {/* Mobile view - simplified with "View all" button */}
          <div className="block md:hidden">
            <div className="grid grid-cols-2 gap-2 mb-2">
              {/* Show only first two prompts on mobile */}
              {guidedPrompts.slice(0, 2).map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => {
                    const entryData = startGuidedJournal(prompt.id);
                    if (entryData) {
                      setEditingEntry({
                        ...entryData,
                        id: `new-${Date.now()}`
                      });
                    }
                  }}
                  className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors cursor-pointer border border-amber-100 dark:border-amber-800/30"
                >
                  <h5 className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-1 truncate">
                    {prompt.title}
                  </h5>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAllPrompts(true)}
              className="w-full text-center text-xs text-indigo-600 dark:text-indigo-400 py-1 px-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800/30"
            >
              View all prompts
            </button>
          </div>
          
          {/* Desktop view - scrollable horizontal list */}
          <div className="hidden md:block">
            <div className="flex gap-3 overflow-x-auto pb-3 -mx-2 px-2 prompt-scroll-container">
              {guidedPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => {
                    const entryData = startGuidedJournal(prompt.id);
                    if (entryData) {
                      setEditingEntry({
                        ...entryData,
                        id: `new-${Date.now()}`
                      });
                    }
                  }}
                  className="flex-shrink-0 w-48 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors cursor-pointer border border-amber-100 dark:border-amber-800/30"
                >
                  <h5 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1 truncate">
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
      </div>
      
      {/* Mobile-optimized Journal Streak Calendar */}
      <div className="bg-slate-800 rounded-xl p-4 transition-colors mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-indigo-400" />
            <h4 className="text-sm font-medium text-white">Journal Streak</h4>
          </div>
          
          <div className="text-indigo-400 flex items-center">
            <Award size={14} className="mr-1" />
            <span className="font-medium text-lg mr-1">{calculateCurrentStreak()}</span>
            <span className="text-xs">days</span>
          </div>
        </div>
        
        {/* Last 7 days visualization - Single row for mobile */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {getLast7Days().map((day, i) => (
            <button
              key={i}
              onClick={() => handleSelectDate(day.date)}
              className={`p-1 rounded-md flex flex-col items-center justify-center ${
                day.isToday 
                  ? 'bg-indigo-600 text-white' 
                  : day.hasEntry 
                    ? 'bg-slate-700 text-white' 
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              <span className="text-xs leading-none mb-1">{day.shortName}</span>
              <span className="text-xs font-medium">{day.day}</span>
              {day.hasEntry && <div className="w-1 h-1 mt-1 rounded-full bg-green-500"></div>}
            </button>
          ))}
        </div>
        
        {/* Streak progress indicator */}
        <div className="mt-2">
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${(calculateCurrentStreak() / 14) * 100}%` }}
            ></div>
          </div>
          <div className="mt-1 flex justify-between items-center text-xs text-slate-400">
            <span>Current streak</span>
            <button
              onClick={() => setActiveView('calendar')}
              className="text-indigo-400 hover:underline text-xs"
            >
              View Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Filter indicator if filtering by date */}
      {dateFilter && (
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-indigo-500 dark:text-indigo-400" />
            <span className="text-sm text-indigo-600 dark:text-indigo-300 truncate">
              {formatDateReadable(dateFilter)}
            </span>
          </div>
          <button 
            onClick={() => setDateFilter(null)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
          >
            Clear
          </button>
        </div>
      )}

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
              onClick={handleAddEntry}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center gap-2"
            >
              <PenTool size={18} />
              Write New Entry
            </button>
            <button
              onClick={() => {
                const randomPrompt = guidedPrompts[Math.floor(Math.random() * guidedPrompts.length)];
                const entryData = startGuidedJournal(randomPrompt.id);
                if (entryData) {
                  setEditingEntry({
                    ...entryData,
                    id: `new-${Date.now()}`
                  });
                }
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-2"
            >
              <Lightbulb size={18} />
              Guided Journal
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(entriesByDate).map(([date, entries]) => (
            <div key={date} id={`date-section-${date}`}>
              <div className="flex items-center mb-3 sticky top-0 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg z-10">
                <Calendar size={18} className="text-indigo-500 dark:text-indigo-400 mr-2" />
                <h3 className="text-md font-medium text-slate-700 dark:text-slate-300">
                  {formatRelativeDate(date)}
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
                      <p className="text-sm text-amber-800 dark:text-amber-200 line-clamp-3 whitespace-pre-wrap">
                        {dailyNotes[date]}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Entries for this date - Mobile-friendly cards */}
              <div className="space-y-3">
                {entries.map(entry => (
                  <div 
                    key={entry.id}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 transition-colors cursor-pointer"
                    onClick={() => handleViewEntry(entry)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-md font-medium text-slate-800 dark:text-slate-100 flex-1 truncate">
                        {entry.title || 'Journal Entry'}
                      </h4>
                      
                      <div className="flex items-center gap-1 ml-2">
                        {/* Edit/Delete buttons */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEntry(entry);
                          }}
                          className="p-1 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(entry.id);
                          }}
                          className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Categories and mood */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {/* Mood indicator */}
                      {entry.mood && (
                        <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getMoodColorClass(entry.mood)}`}>
                          <Smile size={12} />
                          <span>{getMoodEmoji(entry.mood)}</span>
                        </div>
                      )}
                      
                      {/* Show first category if exists */}
                      {entry.categories && entry.categories.length > 0 && (
                        <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getCategoryColorClass(entry.categories[0])}`}>
                          {getCategoryIcon(entry.categories[0])}
                          <span>{getCategoryName(entry.categories[0])}</span>
                        </div>
                      )}
                      
                      {/* Show truncated tag list */}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                          <Tag size={12} />
                          <span>{entry.tags.length > 1 ? `${entry.tags.length} tags` : entry.tags[0]}</span>
                        </div>
                      )}
                      
                      {/* View indicator */}
                      <div className="ml-auto flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                        <Eye size={12} />
                        <span>View</span>
                      </div>
                    </div>
                    
                    {/* Preview text */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 whitespace-pre-wrap">
                      {entry.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* More actions */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleAddEntry}
              className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg flex items-center gap-2 hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
            >
              <PenTool size={18} />
              Write New Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
  // Render the calendar view with monthly calendar
  const renderCalendarView = () => {
    // Get entries for selected date
    const selectedDateEntries = journalEntries.filter(entry => {
      const entryDate = entry.date || entry.timestamp.split('T')[0];
      return entryDate === selectedDate;
    });
    
    return (
      <div className="space-y-6">
        {/* Monthly calendar component */}
        <MonthlyCalendar 
          journalEntries={journalEntries}
          onSelectDate={(date) => {
            setSelectedDate(date);
            // Don't switch to entries tab anymore
            // setActiveView('entries'); - removing this line
          }}
          onEditEntry={(entry) => {
            if (entry.isDeleting) {
              deleteJournalEntry(entry.id);
            } else {
              saveJournalEntry(entry);
            }
          }}
          selectedDate={selectedDate}
        />
        
        {/* Display entries for selected date below the calendar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium text-slate-800 dark:text-slate-100">
              Entries for {formatDateReadable(selectedDate)}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddEntry}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
              >
                <Plus size={14} />
                New Entry
              </button>
            </div>
          </div>
        
          {selectedDateEntries.length > 0 ? (
            <div className="space-y-3">
              {selectedDateEntries.map(entry => (
                <div 
                  key={entry.id}
                  className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-4 transition-colors cursor-pointer"
                  onClick={() => handleViewEntry(entry)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-100 flex-1 truncate">
                      {entry.title || 'Journal Entry'}
                    </h4>
                    
                    <div className="flex items-center gap-1 ml-2">
                      {/* Time indicator */}
                      <div className="text-xs text-slate-500 dark:text-slate-400 mr-2">
                        {formatTimestamp(entry.timestamp)}
                      </div>
                      
                      {/* Edit/Delete buttons */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEntry(entry);
                        }}
                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(entry.id);
                        }}
                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Categories and mood */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {/* Mood indicator */}
                    {entry.mood && (
                      <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getMoodColorClass(entry.mood)}`}>
                        <Smile size={12} />
                        <span>{getMoodEmoji(entry.mood)}</span>
                      </div>
                    )}
                    
                    {/* First category if exists */}
                    {entry.categories && entry.categories.length > 0 && (
                      <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getCategoryColorClass(entry.categories[0])}`}>
                        {getCategoryIcon(entry.categories[0])}
                        <span>{getCategoryName(entry.categories[0])}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Preview text */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 whitespace-pre-wrap">
                    {entry.text}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p className="text-slate-500 dark:text-slate-400">
                No journal entries for this date.
              </p>
              <button
                onClick={handleAddEntry}
                className="mt-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus size={16} />
                <span>Create Entry</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  
  // Render the insights view with analytics
  const renderInsightsView = () => (
    <JournalInsights journalEntries={journalEntries} />
  );

  // Complete renderEntryViewModal method:

  const renderEntryViewModal = () => {
    if (!viewingEntry) return null;
    
    // Determine which entries to navigate through based on current view/filters
    const navigableEntries = filteredEntries;
    
    // Find current entry index
    const currentIndex = navigableEntries.findIndex(entry => entry.id === viewingEntry.id);
    
    // Determine if we have previous/next entries
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < navigableEntries.length - 1;
    
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div 
          className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 truncate pr-4">
              {viewingEntry.title || 'Journal Entry'}
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEditEntry(viewingEntry)}
                className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => setViewingEntry(null)}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Entry navigation indicators with navigation buttons */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700/50 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
            {/* Entry count indicator */}
            <span>{currentIndex + 1} of {navigableEntries.length}</span>
            
            {/* Navigation controls */}
            <div className="flex items-center gap-2">
              {/* Previous button */}
              <button
                onClick={navigateToPreviousEntry}
                disabled={!hasPrevious}
                className={`p-1 rounded-lg flex items-center gap-1 transition-colors ${
                  hasPrevious 
                    ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20' 
                    : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
                aria-label="Previous entry"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              {/* Next button */}
              <button
                onClick={navigateToNextEntry}
                disabled={!hasNext}
                className={`p-1 rounded-lg flex items-center gap-1 transition-colors ${
                  hasNext 
                    ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20' 
                    : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
                aria-label="Next entry"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {/* Date and time */}
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4">
              <Calendar size={14} className="mr-1" />
              <span>
                {new Date(viewingEntry.timestamp).toLocaleDateString('default', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="mx-2">•</span>
              <Clock size={14} className="mr-1" />
              <span>
                {formatTimestamp(viewingEntry.timestamp)}
              </span>
            </div>
            
            {/* Categories and metadata */}
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Mood indicator */}
              {viewingEntry.mood && (
                <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${getMoodColorClass(viewingEntry.mood)}`}>
                  <Smile size={16} />
                  <span>{getMoodEmoji(viewingEntry.mood)} Mood: {viewingEntry.mood}/5</span>
                </div>
              )}
              
              {/* Energy indicator */}
              {viewingEntry.energy && (
                <div className="flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  <Zap size={16} />
                  <span>Energy: {viewingEntry.energy}/3</span>
                </div>
              )}
            </div>
            
            {/* Categories */}
            {viewingEntry.categories && viewingEntry.categories.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingEntry.categories.map(categoryId => (
                    <div 
                      key={categoryId}
                      className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${getCategoryColorClass(categoryId)}`}
                    >
                      {getCategoryIcon(categoryId)}
                      <span>{getCategoryName(categoryId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Entry content */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4">
              <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {viewingEntry.text}
              </p>
            </div>
            
            {/* People mentioned */}
            {viewingEntry.people && viewingEntry.people.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">People Mentioned</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingEntry.people.map(person => (
                    <div
                      key={person}
                      className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1"
                    >
                      <User size={14} />
                      {person}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tags */}
            {viewingEntry.tags && viewingEntry.tags.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingEntry.tags.map(tag => (
                    <div
                      key={tag}
                      className="text-sm px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full flex items-center gap-1"
                    >
                      <Tag size={14} />
                      #{tag}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setConfirmDeleteId(viewingEntry.id)}
                className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Delete
              </button>
              <button
                onClick={() => setViewingEntry(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  

  // Render delete confirmation modal
  const renderDeleteConfirmationModal = () => {
    if (!confirmDeleteId) return null;
    
    const entryToDelete = journalEntries.find(entry => entry.id === confirmDeleteId);
    if (!entryToDelete) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
              <Trash2 className="text-red-600 dark:text-red-400" size={24} />
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
              onClick={() => {
                setConfirmDeleteId(null);
                if (viewingEntry && viewingEntry.id === confirmDeleteId) {
                  setViewingEntry(null);
                }
              }}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteJournalEntry(confirmDeleteId);
                if (viewingEntry && viewingEntry.id === confirmDeleteId) {
                  setViewingEntry(null);
                }
              }}
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
  
  // Render the journal editor component
  const renderJournalEditor = () => {
    if (!showEntryEditor) return null;
    
    return (
      <JournalEditor
        entry={editingEntry}
        date={selectedDate}
        onSave={(entryData) => {
          saveJournalEntry(entryData);
        }}
        onCancel={() => {
          setShowEntryEditor(false);
          setEditingEntry(null);
        }}
        availableCategories={availableCategories}
        popularTags={popularTags}
      />
    );
  };
  
  // Render all prompts modal
  const renderAllPromptsModal = () => {
    if (!showAllPrompts) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-slate-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto m-4">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">Reflection Prompts</h3>
            <button
              onClick={() => setShowAllPrompts(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 space-y-2">
            {guidedPrompts.map((prompt) => (
              <div 
                key={prompt.id}
                className="bg-slate-700 p-3 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                onClick={() => {
                  setShowAllPrompts(false);
                  const entryData = startGuidedJournal(prompt.id);
                  if (entryData) {
                    setEditingEntry({
                      ...entryData,
                      id: `new-${Date.now()}`
                    });
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <Lightbulb size={16} className="text-amber-400 flex-shrink-0" />
                  <span className="text-white font-medium">{prompt.title}</span>
                </div>
                
                {/* Show the first question as a preview */}
                <p className="text-slate-300 text-sm mt-1 pl-6">
                  {prompt.questions[0]}
                </p>
              </div>
            ))}
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
            Journal
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
        
        {/* Tabs - Improved for mobile */}
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
          
          <button
            className="pb-3 px-2 ml-auto text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <div className="flex items-center gap-1">
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              <span className="font-medium hidden sm:inline">
                {isFullscreen ? "Exit" : "Fullscreen"}
              </span>
            </div>
          </button>
        </div>
      </div>
      
      {/* View Content */}
      {activeView === 'entries' && renderEntriesView()}
      {activeView === 'calendar' && renderCalendarView()}
      {activeView === 'insights' && renderInsightsView()}
      
      {/* Journal Entry Editor */}
      {showEntryEditor && renderJournalEditor()}
      
      {/* Entry View Modal */}
      {viewingEntry && renderEntryViewModal()}
      
      {/* Delete Confirmation Modal */}
      {confirmDeleteId && renderDeleteConfirmationModal()}
      
      {/* All Prompts Modal */}
      {showAllPrompts && renderAllPromptsModal()}
      
      {/* CSS for custom scrollbar and animations */}
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
};

export default JournalHub;