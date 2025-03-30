import React, { useState, useEffect } from 'react';
import {
  Users,BarChart2, PieChart, Calendar, Clock, Award, 
  ArrowUp, ArrowDown, Activity, Heart, Brain,
  User, Tag, FileText, Frown, Zap, Lightbulb,
  Smile, ThumbsUp, ThumbsDown, MessageSquare
} from 'lucide-react';
import { getStorage,setStorage } from '../../utils/storage';
import { analyzeSentiment } from '../../utils/sentimentAnalysis';
import { generateContent } from '../../utils/ai-service';
import { getAllPeopleMentioned, getAllTags } from '../../utils/journalMigration';

const JournalInsights = ({ journalEntries = [] }) => {
  const [timeframe, setTimeframe] = useState('all'); // 'week', 'month', 'year', 'all'
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [journalAnalysis, setJournalAnalysis] = useState({
    topWords: [],
    topPeople: [],
    stressFactors: [],
    topTopics: [],
    moodCorrelations: [],
    sentiment: null,
    loaded: false
  });
  
  // AI insights state
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [selectedInsightType, setSelectedInsightType] = useState(null);
  const [insightResult, setInsightResult] = useState('');
  
  // People management state
  const [peopleLists, setPeopleLists] = useState({ whitelist: [], blacklist: [] });
  
  // Available AI insight types
  const insightTypes = [
    {
      id: 'emotional-patterns',
      title: 'Emotional Patterns',
      icon: <Heart size={16} className="text-rose-500 dark:text-rose-400" />,
      description: 'Analyze emotional patterns across your entries'
    },
    {
      id: 'relationship-insights',
      title: 'Relationship Insights',
      icon: <Users size={16} className="text-blue-500 dark:text-blue-400" />,
      description: 'Analyze how people mentioned relate to your mood and activities'
    },
    {
      id: 'growth-opportunities',
      title: 'Growth Opportunities',
      icon: <Zap size={16} className="text-amber-500 dark:text-amber-400" />,
      description: 'Identify potential areas for personal growth'
    },
    {
      id: 'stress-patterns',
      title: 'Stress Patterns',
      icon: <Activity size={16} className="text-red-500 dark:text-red-400" />,
      description: 'Identify sources of stress and potential coping strategies'
    },
    {
      id: 'gratitude-summary',
      title: 'Gratitude Summary',
      icon: <ThumbsUp size={16} className="text-green-500 dark:text-green-400" />,
      description: 'Summarize positive aspects from your journal entries'
    }
  ];
  
  // Filter entries based on timeframe and analyze them
  useEffect(() => {
    filterEntriesByTimeframe();
  }, [journalEntries, timeframe]);
  
  // When filtered entries change, analyze them
  useEffect(() => {
    if (filteredEntries.length > 0) {
      analyzeJournalEntries();
    }
  }, [filteredEntries]);
  
  // Load people whitelists and blacklists
  useEffect(() => {
    loadPeopleLists();
  }, []);
  
  // Function to load people lists
  const loadPeopleLists = () => {
    const storage = getStorage();
    setPeopleLists({
      whitelist: storage.peopleWhitelist || [],
      blacklist: storage.peopleBlacklist || []
    });
  };
  
  // Filter entries based on selected timeframe
  const filterEntriesByTimeframe = () => {
    let filtered = [...journalEntries];
    
    if (timeframe !== 'all') {
      const now = new Date();
      let cutoffDate;
      
      if (timeframe === 'week') {
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 7);
      } else if (timeframe === 'month') {
        cutoffDate = new Date(now);
        cutoffDate.setMonth(now.getMonth() - 1);
      } else if (timeframe === 'year') {
        cutoffDate = new Date(now);
        cutoffDate.setFullYear(now.getFullYear() - 1);
      }
      
      filtered = journalEntries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= cutoffDate;
      });
    }
    
    setFilteredEntries(filtered);
  };
  
  // Analyze journal entries for insights
  const analyzeJournalEntries = () => {
    // This could become computationally expensive with many entries,
    // so you might want to add a loading state or perform on demand
    
    // Combine all text for analysis
    const allText = filteredEntries.map(entry => entry.text || '').join(' ');
    
    // Analyze sentiment
    const sentimentResult = analyzeSentiment(allText);
    
    // Find frequently used words (simple implementation)
    const words = allText.toLowerCase()
      .replace(/[^\w\s]/gi, '') // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .filter(word => word.length > 3) // Only words with 4+ characters
      .filter(word => !['this', 'that', 'with', 'from', 'have', 'about', 'would', 'could', 'should', 'there', 'their', 'they', 'were', 'when', 'what', 'then'].includes(word));
    
    // Count word frequency
    const wordCounts = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    // Sort by frequency
    const topWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ text: word, value: count }));
    
    // Get people mentioned
    const allPeople = [];
    
    filteredEntries.forEach(entry => {
      if (entry.people && Array.isArray(entry.people)) {
        entry.people.forEach(person => {
          if (!peopleLists.blacklist.includes(person)) {
            allPeople.push(person);
          }
        });
      }
    });
    
    // Count people mentions
    const peopleCounts = {};
    allPeople.forEach(person => {
      peopleCounts[person] = (peopleCounts[person] || 0) + 1;
    });
    
    // Sort by frequency
    const topPeople = Object.entries(peopleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([person, count]) => ({ 
        name: person, 
        count,
        isWhitelisted: peopleLists.whitelist.includes(person)
      }));
    
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
          entries: filteredEntries.filter(entry => {
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
      
      filteredEntries.forEach(entry => {
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
    if (filteredEntries.some(entry => entry.mood !== undefined)) {
      // Group entries by mood
      const moodGroups = {
        low: filteredEntries.filter(entry => entry.mood <= 2),
        medium: filteredEntries.filter(entry => entry.mood === 3),
        high: filteredEntries.filter(entry => entry.mood >= 4)
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
    
    // Update state with analysis results
    setJournalAnalysis({
      topWords,
      topPeople,
      stressFactors,
      topTopics: topicCounts,
      moodCorrelations,
      sentiment: sentimentResult,
      loaded: true
    });
  };
  
  // Get AI insights
  const getAIInsight = async (insightType) => {
    if (!insightType || filteredEntries.length === 0) return;
    
    setIsLoadingInsight(true);
    setSelectedInsightType(insightType);
    
    try {
      // Prepare entries data for the AI
      const recentEntries = filteredEntries
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10) // Limit to most recent 10 entries
        .map(entry => {
          // Format the entry data for the AI prompt
          const date = new Date(entry.timestamp).toLocaleDateString();
          const mood = entry.mood ? `Mood: ${entry.mood}/5` : '';
          const energy = entry.energy ? `Energy: ${entry.energy}/3` : '';
          const people = entry.people && entry.people.length > 0 ? 
            `People mentioned: ${entry.people.join(', ')}` : '';
          const categories = entry.categories && entry.categories.length > 0 ? 
            `Categories: ${entry.categories.join(', ')}` : '';
          const tags = entry.tags && entry.tags.length > 0 ? 
            `Tags: ${entry.tags.join(', ')}` : '';
          
          return `
[${date}] ${entry.title}
${mood} ${energy}
${people}
${categories}
${tags}

${entry.text}
          `;
        });
      
      // Create the prompt based on the insight type
      let promptText = '';
      
      switch (insightType.id) {
        case 'emotional-patterns':
          promptText = `
You are a thoughtful journal analysis assistant. Analyze these journal entries to identify emotional patterns:

${recentEntries.join('\n\n---\n\n')}

Please provide insights on:
1. Common emotional themes
2. How emotions change over time
3. Potential triggers for different emotional states
4. Patterns in mood ratings
5. Suggestions for emotional awareness

Format your response as a thoughtful, empathetic analysis that might help the person gain insights into their emotional patterns.
          `;
          break;
        
        case 'relationship-insights':
          promptText = `
You are a thoughtful journal analysis assistant. Analyze these journal entries focusing on relationships and people mentioned:

${recentEntries.join('\n\n---\n\n')}

Please provide insights on:
1. Key relationships mentioned and their apparent significance
2. How different people seem to affect the journal writer's mood
3. Patterns in social interactions
4. Potential opportunities for connection or relationship growth
5. Any relationship challenges that appear recurring

Format your response as a thoughtful, empathetic analysis that might help the person gain insights into their relationships.
          `;
          break;
        
        case 'growth-opportunities':
          promptText = `
You are a thoughtful journal analysis assistant. Analyze these journal entries to identify growth opportunities:

${recentEntries.join('\n\n---\n\n')}

Please provide insights on:
1. Areas where the journal writer seems to be making progress
2. Challenges that appear repeatedly and might benefit from focus
3. Interests or skills that could be developed further
4. Patterns that might be limiting growth
5. Personalized suggestions for development based on the journal content

Format your response as a thoughtful, supportive analysis that might help the person identify opportunities for growth.
          `;
          break;
        
        case 'stress-patterns':
          promptText = `
You are a thoughtful journal analysis assistant. Analyze these journal entries to identify stress patterns:

${recentEntries.join('\n\n---\n\n')}

Please provide insights on:
1. Common sources of stress mentioned
2. How stress seems to affect the journal writer
3. Current coping mechanisms mentioned (if any)
4. Patterns in when stress occurs
5. Potential strategies for stress management based on what seems to work for them

Format your response as a thoughtful, supportive analysis that might help the person better manage stress.
          `;
          break;
        
        case 'gratitude-summary':
          promptText = `
You are a thoughtful journal analysis assistant. Analyze these journal entries to highlight positive aspects and gratitude:

${recentEntries.join('\n\n---\n\n')}

Please provide insights on:
1. Things the journal writer seems to appreciate or value
2. Positive experiences mentioned
3. Sources of joy or satisfaction
4. Progress or achievements noted
5. How gratitude might be expanded based on what already brings them joy

Format your response as a thoughtful, uplifting summary that helps the person recognize positive elements in their journal.
          `;
          break;
        
        default:
          promptText = `
You are a thoughtful journal analysis assistant. Analyze these journal entries:

${recentEntries.join('\n\n---\n\n')}

Please provide general insights that might help the journal writer gain perspective on their entries.
          `;
      }
      
      // Call the AI service
      const response = await generateContent(promptText);
      
      setInsightResult(response);
    } catch (error) {
      console.error('Error getting AI insight:', error);
      setInsightResult('Sorry, there was an error analyzing your journal entries. Please try again later.');
    } finally {
      setIsLoadingInsight(false);
    }
  };
  
  // Format percentage for display
  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value}%`;
  };
  
  // Get mood emoji
  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'low': return '😕';
      case 'medium': return '😐';
      case 'high': return '😊';
      default: return '😐';
    }
  };
  
  // Handle approving a person (move to whitelist)
  const handleApprovePerson = (person) => {
    const storage = getStorage();
    
    // Add to whitelist if not already there
    if (!storage.peopleWhitelist) {
      storage.peopleWhitelist = [];
    }
    
    if (!storage.peopleWhitelist.includes(person)) {
      storage.peopleWhitelist.push(person);
      
      // Remove from blacklist if present
      if (storage.peopleBlacklist && storage.peopleBlacklist.includes(person)) {
        storage.peopleBlacklist = storage.peopleBlacklist.filter(p => p !== person);
      }
      
      setStorage(storage);
      
      // Update state
      setPeopleLists({
        whitelist: storage.peopleWhitelist,
        blacklist: storage.peopleBlacklist || []
      });
      
      // Refresh analysis
      analyzeJournalEntries();
    }
  };
  
  // Handle discarding a person (move to blacklist)
  const handleDiscardPerson = (person) => {
    const storage = getStorage();
    
    // Add to blacklist if not already there
    if (!storage.peopleBlacklist) {
      storage.peopleBlacklist = [];
    }
    
    if (!storage.peopleBlacklist.includes(person)) {
      storage.peopleBlacklist.push(person);
      
      // Remove from whitelist if present
      if (storage.peopleWhitelist && storage.peopleWhitelist.includes(person)) {
        storage.peopleWhitelist = storage.peopleWhitelist.filter(p => p !== person);
      }
      
      setStorage(storage);
      
      // Update state
      setPeopleLists({
        whitelist: storage.peopleWhitelist || [],
        blacklist: storage.peopleBlacklist
      });
      
      // Refresh analysis
      analyzeJournalEntries();
    }
  };
  
  // Empty state if no entries
  if (journalEntries.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 text-center transition-colors">
        <Brain size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-500" />
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
          No journal entries yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Start writing in your journal to see insights and analytics about your entries.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Time period selector */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 transition-colors">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart2 className="text-indigo-500 dark:text-indigo-400" size={20} />
            Journal Insights
          </h3>
          
          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg flex p-1">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === 'week' 
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === 'month' 
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('year')}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === 'year' 
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Year
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === 'all' 
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={20} className="text-indigo-500 dark:text-indigo-400" />
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Entries</div>
          </div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
            {filteredEntries.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {timeframe === 'week' ? 'this week' : 
             timeframe === 'month' ? 'this month' :
             timeframe === 'year' ? 'this year' : 'total'}
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Smile size={20} className="text-green-500 dark:text-green-400" />
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Avg Mood</div>
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {filteredEntries.some(e => e.mood !== undefined) ?
              (filteredEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / 
               filteredEntries.filter(e => e.mood !== undefined).length).toFixed(1) :
              '-'
            }
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            out of 5
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={20} className="text-blue-500 dark:text-blue-400" />
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Avg Energy</div>
          </div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {filteredEntries.some(e => e.energy !== undefined) ?
              (filteredEntries.reduce((sum, entry) => sum + (entry.energy || 0), 0) / 
               filteredEntries.filter(e => e.energy !== undefined).length).toFixed(1) :
              '-'
            }
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            out of 3
          </div>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Tag size={20} className="text-amber-500 dark:text-amber-400" />
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Categories</div>
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {(() => {
              const categorySet = new Set();
              filteredEntries.forEach(entry => {
                if (entry.categories && Array.isArray(entry.categories)) {
                  entry.categories.forEach(cat => categorySet.add(cat));
                }
              });
              return categorySet.size;
            })()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            used in entries
          </div>
        </div>
      </div>
      
      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sentiment Analysis */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <ThumbsUp size={18} className="text-blue-500 dark:text-blue-400" />
            Sentiment Analysis
          </h3>
          
          {journalAnalysis.loaded && journalAnalysis.sentiment ? (
            <div className="space-y-4">
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-red-500 dark:text-red-400">Negative</span>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {journalAnalysis.sentiment.total} words analyzed
                  </span>
                  <span className="text-sm font-medium text-green-500 dark:text-green-400">Positive</span>
                </div>
                
                {/* Sentiment bar */}
                <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden relative">
                  <div 
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-red-500 to-green-500 w-full"
                    style={{ 
                      transform: `translateX(${journalAnalysis.sentiment.score/2}%)`,
                      transition: 'transform 1s ease-out'
                    }}
                  ></div>
                  <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-slate-50 dark:bg-slate-300"></div>
                </div>
                
                {/* Score indicator */}
                <div className="text-center mt-2">
                  <span className={`text-lg font-bold ${
                    journalAnalysis.sentiment.score > 0 
                      ? 'text-green-500 dark:text-green-400' 
                      : journalAnalysis.sentiment.score < 0
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {formatPercentage(journalAnalysis.sentiment.score)}
                  </span>
                </div>
                
                {/* Word counts */}
                <div className="flex justify-between items-center mt-3">
                  <div className="text-center">
                    <span className="text-sm font-medium text-red-500 dark:text-red-400">
                      {journalAnalysis.sentiment.negative}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">negative words</p>
                  </div>
                  
                  <div className="text-center">
                    <span className="text-sm font-medium text-green-500 dark:text-green-400">
                      {journalAnalysis.sentiment.positive}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">positive words</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 dark:text-slate-400">
                Analyzing sentiment...
              </p>
            </div>
          )}
        </div>
        
        {/* Top Topics */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-blue-500 dark:text-blue-400" />
            Top Topics
          </h3>
          
          {journalAnalysis.loaded && journalAnalysis.topTopics.length > 0 ? (
            <div className="space-y-3">
              {journalAnalysis.topTopics.slice(0, 5).map((topic, index) => (
                <div key={topic.topic} className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {topic.topic}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {topic.entries} entries
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        index === 0 ? 'bg-indigo-500' :
                        index === 1 ? 'bg-blue-500' :
                        index === 2 ? 'bg-green-500' :
                        index === 3 ? 'bg-amber-500' :
                        'bg-purple-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (topic.entries / filteredEntries.length) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 dark:text-slate-400">
                No topics detected in your journal entries.
              </p>
            </div>
          )}
        </div>
        
        {/* People Mentioned */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <User size={18} className="text-blue-500 dark:text-blue-400" />
            People Mentioned
          </h3>
          
          {journalAnalysis.loaded && journalAnalysis.topPeople.length > 0 ? (
            <div className="space-y-2">
              {journalAnalysis.topPeople.slice(0, 5).map(person => (
                <div 
                  key={person.name}
                  className={`p-2 rounded-lg flex items-center justify-between ${
                    person.isWhitelisted 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500'
                      : 'bg-slate-50 dark:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User size={16} className={
                      person.isWhitelisted
                        ? 'text-emerald-500 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                    } />
                    <span className={`text-sm ${
                      person.isWhitelisted
                        ? 'text-emerald-700 dark:text-emerald-300 font-medium'
                        : 'text-slate-700 dark:text-slate-300'
                    } truncate max-w-[120px]`}>
                      {person.name}
                    </span>
                    <span className="text-xs bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full">
                      {person.count}
                    </span>
                  </div>
                  
                  {!person.isWhitelisted && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleApprovePerson(person.name)}
                        className="text-xs bg-slate-200 dark:bg-slate-600 hover:bg-green-100 dark:hover:bg-green-900/30 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-300 px-2 py-0.5 rounded-full transition-colors"
                        title="Confirm this is a person"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleDiscardPerson(person.name)}
                        className="text-xs bg-slate-200 dark:bg-slate-600 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-300 px-2 py-0.5 rounded-full transition-colors"
                        title="This is not a person"
                      >
                        Discard
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 dark:text-slate-400">
                No people detected in your journal entries.
              </p>
            </div>
          )}
        </div>
        
        {/* Stress Factors */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <Frown size={18} className="text-red-500 dark:text-red-400" />
            Stress Indicators
          </h3>
          
          {journalAnalysis.loaded && journalAnalysis.stressFactors.length > 0 ? (
            <div className="space-y-3">
              {journalAnalysis.stressFactors.slice(0, 5).map(factor => (
                <div key={factor.factor} className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium capitalize">
                      {factor.factor}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {factor.count} mentions
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ 
                        width: `${Math.min(100, (factor.count / Math.max(...journalAnalysis.stressFactors.map(f => f.count))) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 dark:text-slate-400">
                No stress indicators detected in your journal entries.
              </p>
            </div>
          )}
        </div>
        
        {/* Mood Words */}
        {journalAnalysis.loaded && journalAnalysis.moodCorrelations.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors md:col-span-2">
            <h3 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Smile size={18} className="text-amber-500 dark:text-amber-400" />
              Words Associated with Different Moods
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {journalAnalysis.moodCorrelations.map(correlation => (
                <div 
                  key={correlation.mood}
                  className={`p-4 rounded-lg ${
                    correlation.mood === 'low' ? 'bg-red-50 dark:bg-red-900/20' :
                    correlation.mood === 'medium' ? 'bg-amber-50 dark:bg-amber-900/20' :
                    'bg-green-50 dark:bg-green-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg">
                      {getMoodEmoji(correlation.mood)}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      correlation.mood === 'low' ? 'bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-300' :
                      correlation.mood === 'medium' ? 'bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300' :
                      'bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-300'
                    }`}>
                      {correlation.count} entries
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {correlation.words.map(word => (
                      <span
                        key={word}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          correlation.mood === 'low' ? 'bg-red-100 dark:bg-red-800/40 text-red-800 dark:text-red-200' :
                          correlation.mood === 'medium' ? 'bg-amber-100 dark:bg-amber-800/40 text-amber-800 dark:text-amber-200' :
                          'bg-green-100 dark:bg-green-800/40 text-green-800 dark:text-green-200'
                        }`}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* AI Insights */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <Brain size={20} className="text-indigo-500 dark:text-indigo-400" />
          AI-Powered Insights
        </h3>
        
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Get personalized insights from your journal entries to discover patterns, themes, and opportunities for growth.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {insightTypes.map(insight => (
            <button
              key={insight.id}
              onClick={() => getAIInsight(insight)}
              className={`bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-left hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex flex-col ${
                selectedInsightType?.id === insight.id ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {insight.icon}
                <span className="text-md font-medium text-slate-800 dark:text-slate-100">
                  {insight.title}
                </span>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {insight.description}
              </span>
            </button>
          ))}
        </div>
        
        {/* AI Response */}
        {isLoadingInsight ? (
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
        ) : insightResult ? (
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
            <div className="flex items-start">
              <Brain size={24} className="text-indigo-500 dark:text-indigo-400 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-md font-medium text-slate-800 dark:text-slate-100 mb-3">
                  {selectedInsightType ? selectedInsightType.title : 'Journal Insights'}
                </h4>
                <div className="text-slate-700 dark:text-slate-300 prose prose-sm dark:prose-invert">
                  {insightResult.split('\n').map((paragraph, idx) => (
                    paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              Select an insight type above to analyze your journal entries.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalInsights;