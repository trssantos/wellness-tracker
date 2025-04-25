// src/components/Lifestyle/EnneagramResults.jsx
import React, { useState } from 'react';
import { Type, RefreshCw, ChevronDown, ChevronUp, ArrowLeft, Heart, BarChart2 } from 'lucide-react';

const EnneagramResults = ({ results, onReset, onRetake }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});
  
  if (!results) return null;
  
  const { primaryType, wing, typeName, typeDescription, wingName, wingInfluence, scores } = results;
  
  // Get information about the core type
  const typeData = enneagramTypes[primaryType];
  const wingData = enneagramTypes[wing];
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Tabs for results sections
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'details', label: 'Type Details' },
    { id: 'growth', label: 'Growth Path' },
    { id: 'compatibility', label: 'Compatibility' }
  ];
  
  // Get type color
  const getTypeColor = (type) => {
    const colors = {
      '1': { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
      '2': { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
      '3': { bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
      '4': { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
      '5': { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
      '6': { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
      '7': { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
      '8': { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
      '9': { bg: 'bg-teal-50 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' }
    };
    
    return colors[type] || colors['1'];
  };
  
  const mainTypeColor = getTypeColor(primaryType);
  
  // Render the overview tab
  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className={`${mainTypeColor.bg} p-6 rounded-xl flex flex-col md:flex-row items-center gap-6`}>
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{primaryType}w{wing}</span>
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <h3 className={`text-xl sm:text-2xl font-bold ${mainTypeColor.text} mb-2`}>
            Type {primaryType}: {typeName}
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
            with a Type {wing}: {wingName} wing
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {typeDescription}
          </p>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Test completed on {formatDate(results.timestamp)}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Type className="text-indigo-500 dark:text-indigo-400" size={20} />
            Your Type Profile
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Core Motivation</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {typeMotivations[primaryType]}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Key Strengths</h4>
              <div className="flex flex-wrap gap-2">
                {typeData.strengths.split(', ').map((strength, index) => (
                  <span 
                    key={index}
                    className={`px-2 py-1 rounded-full text-xs ${mainTypeColor.bg} ${mainTypeColor.text}`}
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Growth Areas</h4>
              <div className="flex flex-wrap gap-2">
                {typeData.weaknesses.split(', ').map((weakness, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    {weakness}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Wing Influence</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {wingInfluence}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <BarChart2 className="text-indigo-500 dark:text-indigo-400" size={20} />
            Type Breakdown
          </h3>
          
          <div className="space-y-3">
            {Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([type, score]) => (
              <div key={type} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Type {type}: {enneagramTypes[type].name}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{score}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getTypeColor(type).text.replace('text', 'bg')}`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render the details tab with more comprehensive information
  const renderDetailsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Type {primaryType}: {typeName} In-Depth
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Basic Fear</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {typeFears[primaryType]}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Basic Desire</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {typeDesires[primaryType]}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Key Characteristics</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {typeCharacteristics[primaryType]}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Communication Style</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {typeCommunication[primaryType]}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Wing {wing}: {wingName} Influence
        </h3>
        
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            A wing represents the adjacent type that influences how your main type expresses itself. Your wing adds nuance to your personality.
          </p>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">How Your Wing Affects You</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {wingInfluence}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Wing Characteristics</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {typeCharacteristics[wing]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render the growth path tab
  const renderGrowthTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Growth and Stress Patterns
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-300 mr-2">
                <ChevronUp size={16} />
              </div>
              Growth Direction: Type {typeGrowthDirections[primaryType]}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              {typeGrowthDescriptions[primaryType]}
            </p>
            <div className={`p-3 rounded-lg ${getTypeColor(typeGrowthDirections[primaryType]).bg}`}>
              <span className={`font-medium ${getTypeColor(typeGrowthDirections[primaryType]).text}`}>
                Type {typeGrowthDirections[primaryType]}: {enneagramTypes[typeGrowthDirections[primaryType]].name}
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {typeGrowthTraits[primaryType]}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
              <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-300 mr-2">
                <ChevronDown size={16} />
              </div>
              Stress Direction: Type {typeStressDirections[primaryType]}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              {typeStressDescriptions[primaryType]}
            </p>
            <div className={`p-3 rounded-lg ${getTypeColor(typeStressDirections[primaryType]).bg}`}>
              <span className={`font-medium ${getTypeColor(typeStressDirections[primaryType]).text}`}>
                Type {typeStressDirections[primaryType]}: {enneagramTypes[typeStressDirections[primaryType]].name}
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {typeStressTraits[primaryType]}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Personal Growth Recommendations
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Key Development Areas</h4>
            <ul className="space-y-2 list-disc pl-5 text-sm text-slate-600 dark:text-slate-400">
              {typeGrowthAreas[primaryType].split('. ').map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Self-Awareness Practices</h4>
            <ul className="space-y-2 list-disc pl-5 text-sm text-slate-600 dark:text-slate-400">
              {typePractices[primaryType].split('. ').map((practice, index) => (
                <li key={index}>{practice}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render the compatibility tab
  const renderCompatibilityTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Heart className="text-red-500 dark:text-red-400" size={20} />
          Relationship Compatibility
        </h3>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          The Enneagram offers insights into how different types interact. Here are the types that typically have the strongest compatibility with your type:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {typeData.compatibleWith.map(compatType => (
            <div 
              key={compatType}
              className={`p-4 rounded-lg border ${getTypeColor(compatType).border} ${getTypeColor(compatType).bg}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{compatType}</span>
                </div>
                <h4 className={`font-medium ${getTypeColor(compatType).text}`}>
                  {enneagramTypes[compatType].name}
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {typeCompatibilities[`${primaryType}-${compatType}`]}
              </p>
            </div>
          ))}
        </div>
        
        <div>
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Compatibility Overview</h4>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Most Compatible</div>
              <div className="flex flex-wrap justify-center gap-1">
                {[...typeData.compatibleWith].map(type => (
                  <span 
                    key={type} 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getTypeColor(type).bg} ${getTypeColor(type).text}`}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Neutral</div>
              <div className="flex flex-wrap justify-center gap-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].filter(type => 
                  !typeData.compatibleWith.includes(type) && 
                  !typeData.challengingWith.includes(type) &&
                  type !== primaryType
                ).map(type => (
                  <span 
                    key={type} 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Most Challenging</div>
              <div className="flex flex-wrap justify-center gap-1">
                {typeData.challengingWith && typeData.challengingWith.map(type => (
                  <span 
                    key={type} 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Your Relationship Approach</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {typeRelationshipApproaches[primaryType]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
            <Type className="text-indigo-500 dark:text-indigo-400" size={24} />
            Your Enneagram Results
          </h2>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onRetake}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
              title="Retake test"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={onReset}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors"
              title="Clear results"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Tab navigation */}
        <div className="flex overflow-x-auto no-scrollbar space-x-1 mb-6 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Tab content */}
        <div>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'growth' && renderGrowthTab()}
          {activeTab === 'compatibility' && renderCompatibilityTab()}
        </div>
      </div>
    </div>
  );
};

// Enneagram types information
const enneagramTypes = {
  '1': {
    name: "The Perfectionist",
    description: "Ethical, dedicated and reliable, they are motivated by a desire to live the right way, improve the world, and avoid fault and blame.",
    wingInfluence: "elements of creativity and emotional awareness to your perfectionistic tendencies.",
    strengths: "Honest, responsible, improvement-oriented, ethical, fair",
    weaknesses: "Critical, perfectionistic, judgmental, tense, controlling",
    compatibleWith: ["2", "7", "9"],
    challengingWith: ["8", "4"]
  },
  '2': {
    name: "The Helper",
    description: "Warm, caring and generous, they are motivated by a need to be loved and needed, and to avoid acknowledging their own needs.",
    wingInfluence: "a mix of supportiveness with either organization or self-expression.",
    strengths: "Caring, interpersonal, warm, supporting, giving",
    weaknesses: "People-pleasing, possessive, manipulative, emotional",
    compatibleWith: ["1", "4", "8"],
    challengingWith: ["5", "3"]
  },
  '3': {
    name: "The Achiever",
    description: "Success-oriented, image-conscious and wired for productivity, they are motivated by a need to be successful and to avoid failure.",
    wingInfluence: "either emotional depth or reflective inquiry to your achievement orientation.",
    strengths: "Efficient, practical, ambitious, inspiring, competent",
    weaknesses: "Image-conscious, competitive, narcissistic, workaholic",
    compatibleWith: ["6", "9", "1"],
    challengingWith: ["4", "7"]
  },
  '4': {
    name: "The Individualist",
    description: "Creative, sensitive and moody, they are motivated by a need to be understood, experience their oversized feelings and avoid being ordinary.",
    wingInfluence: "either a helping attitude or analytical thinking to your emotional depth.",
    strengths: "Creative, authentic, emotional depth, inspiration, compassion",
    weaknesses: "Moody, self-absorbed, melancholic, withdrawn, envious",
    compatibleWith: ["2", "9", "5"],
    challengingWith: ["3", "8"]
  },
  '5': {
    name: "The Investigator",
    description: "Analytical, detached and private, they are motivated by a need to gain knowledge, conserve energy and avoid relying on others.",
    wingInfluence: "either artistic sensitivity or methodical conscientiousness to your analytical nature.",
    strengths: "Analytical, thoughtful, innovative, objective, perceptive",
    weaknesses: "Detached, isolated, overthinking, provocative, stingy",
    compatibleWith: ["1", "7", "9"],
    challengingWith: ["2", "6"]
  },
  '6': {
    name: "The Loyalist",
    description: "Committed, practical and witty, they are motivated by fear and the need for security.",
    wingInfluence: "either adventurousness or methodical thinking to your loyalty-focused perspective.",
    strengths: "Loyal, responsible, committed, practical, problem-solving",
    weaknesses: "Anxious, doubtful, fearful, suspicious, indecisive",
    compatibleWith: ["3", "8", "9"],
    challengingWith: ["5", "1"]
  },
  '7': {
    name: "The Enthusiast",
    description: "Fun, spontaneous and versatile, they are motivated by a need to be happy, plan stimulating experiences and avoid pain.",
    wingInfluence: "either strategic thinking or responsible diligence to your enthusiastic outlook.",
    strengths: "Optimistic, enthusiastic, productive, versatile, adventurous",
    weaknesses: "Scattered, impulsive, escapist, undisciplined, excessive",
    compatibleWith: ["3", "5", "9"],
    challengingWith: ["1", "4"]
  },
  '8': {
    name: "The Challenger",
    description: "Commanding, intense and confrontational, they are motivated by a need to be strong and avoid feeling weak or vulnerable.",
    wingInfluence: "either adventure-seeking or purpose-driven loyalty to your powerful presence.",
    strengths: "Strong, assertive, protective, decisive, resilient",
    weaknesses: "Controlling, domineering, confrontational, aggressive",
    compatibleWith: ["2", "4", "6"],
    challengingWith: ["5", "1"]
  },
  '9': {
    name: "The Peacemaker",
    description: "Pleasant, laid back and accommodating, they are motivated by a need to keep the peace, merge with others and avoid conflict.",
    wingInfluence: "either assertiveness or perfectionism to your harmonious nature.",
    strengths: "Harmonious, accepting, stable, supportive, optimistic",
    weaknesses: "Complacent, conflict-avoidant, stubborn, disengaged",
    compatibleWith: ["1", "3", "5"],
    challengingWith: ["6", "8"]
  }
};

// Type motivations (expanded)
const typeMotivations = {
  '1': "Type 1s are motivated by a deep desire to be good, right, and above reproach. They strive to reform and improve the world according to their high internal standards.",
  '2': "Type 2s are motivated by a need to feel loved, appreciated, and connected to others. They focus on helping others to fulfill this need.",
  '3': "Type 3s are motivated by a desire to be successful, admired, and validated for their achievements. They adapt their image to be what they believe others will value.",
  '4': "Type 4s are motivated by a need to express their individuality and be understood for their authentic self. They seek deeper meaning and emotional connection.",
  '5': "Type 5s are motivated by a need to understand the world, master skills, and preserve their energy and resources. They gather knowledge to feel competent.",
  '6': "Type 6s are motivated by a need for security, guidance, and certainty in an unpredictable world. They seek safety through allegiance to people or belief systems.",
  '7': "Type 7s are motivated by a desire to experience all of life's possibilities and avoid pain or limitation. They seek variety, stimulation, and freedom.",
  '8': "Type 8s are motivated by a need to be strong, powerful, and in control of their own destiny. They protect themselves and others from being controlled or manipulated.",
  '9': "Type 9s are motivated by a desire for harmony, peace, and stability. They avoid conflict and merge with others' agendas to maintain connection."
};

// Type fears (core)
const typeFears = {
  '1': "Being corrupt, evil, defective, or imperfect",
  '2': "Being unworthy of love, unwanted, or unnecessary",
  '3': "Being worthless, unsuccessful, or exposed as incompetent",
  '4': "Having no identity, personal significance, or being fundamentally flawed",
  '5': "Being helpless, incapable, depleted, or overwhelmed by others' demands",
  '6': "Being without security, guidance, or support",
  '7': "Being trapped in emotional pain, deprived, or limited",
  '8': "Being harmed, controlled, violated, or vulnerable",
  '9': "Being in conflict, separate, or losing connection with others"
};

// Type desires (core)
const typeDesires = {
  '1': "To be good, right, balanced, and have integrity",
  '2': "To be loved, appreciated, and needed",
  '3': "To be valuable, successful, and admired",
  '4': "To be authentic, unique, and deeply understood",
  '5': "To be knowledgeable, competent, and self-sufficient",
  '6': "To be secure, safe, and supported",
  '7': "To be happy, satisfied, and fulfilled",
  '8': "To be strong, protective, and in control of their own life",
  '9': "To be at peace, comfortable, and unified with others"
};

// Type characteristics (detailed)
const typeCharacteristics = {
  '1': "Type 1s are conscientious and have strong personal convictions. They have a clear sense of right and wrong, are self-disciplined, and strive for improvement in themselves and the world. They notice errors and imperfections that others might miss.",
  '2': "Type 2s excel at anticipating others' needs and naturally look for ways to help. They're empathetic, generous, and relationship-oriented. They remember personal details about people and prioritize maintaining connections.",
  '3': "Type 3s are goal-oriented, efficient, and adaptable. They project confidence and competence, focus on achievement, and excel at reading social cues to adapt their self-presentation. They're practical and often charismatic.",
  '4': "Type 4s are self-aware, sensitive, and authentic. They value deep emotional experiences and creative expression. They're attuned to nuance and subtlety, and they search for personal meaning and significance in their lives.",
  '5': "Type 5s are curious, insightful, and analytical. They observe thoroughly before engaging, value their privacy and independence, and collect knowledge to better understand the world. They're often thoughtful and innovative.",
  '6': "Type 6s are loyal, responsible, and vigilant. They anticipate potential problems and work to create security. They're committed to groups they trust, question authority, and assess risks carefully.",
  '7': "Type 7s are enthusiastic, spontaneous, and versatile. They generate options and possibilities, maintain optimism in difficult situations, and bring high energy to projects. They're adventurous and quick-thinking.",
  '8': "Type 8s are strong, assertive, and protective. They speak directly, take decisive action, and defend people they care about. They're comfortable with confrontation and naturally take charge of situations.",
  '9': "Type 9s are accepting, patient, and supportive. They see multiple perspectives, mediate conflicts, and create harmonious environments. They're steady, non-judgmental, and easy to be around."
};

// Type communication styles
const typeCommunication = {
  '1': "Direct, precise, and principled. Type 1s focus on improvement and getting things right. They may sound critical or judgmental when giving feedback but are usually trying to be helpful.",
  '2': "Warm, personal, and supportive. Type 2s focus on relationships and making others feel comfortable. They communicate to connect and may avoid direct expressions of their own needs.",
  '3': "Practical, efficient, and goal-oriented. Type 3s focus on successful outcomes and positive impressions. They communicate to achieve results and may adjust their style based on their audience.",
  '4': "Emotionally expressive, nuanced, and authentic. Type 4s focus on depth and personal meaning. They communicate to express their unique perspective and can be sensitive to tone and subtext.",
  '5': "Precise, logical, and objective. Type 5s focus on accuracy and understanding. They communicate to exchange information and may seem detached or analytical in emotional situations.",
  '6': "Questioning, cautious, and analytical. Type 6s focus on potential problems and solutions. They communicate to build consensus and security, often playing devil's advocate.",
  '7': "Enthusiastic, quick, and entertaining. Type 7s focus on possibilities and positive framing. They communicate to generate excitement and may change topics frequently.",
  '8': "Direct, decisive, and powerful. Type 8s focus on control and action. They communicate to move things forward and may come across as blunt or confrontational.",
  '9': "Agreeable, inclusive, and diplomatic. Type 9s focus on harmony and multiple perspectives. They communicate to build consensus and may avoid expressing strong opinions."
};

// Growth directions (arrows)
const typeGrowthDirections = {
  '1': '7',
  '2': '4',
  '3': '6',
  '4': '1',
  '5': '8',
  '6': '9',
  '7': '5',
  '8': '2',
  '9': '3'
};

// Stress directions (arrows)
const typeStressDirections = {
  '1': '4',
  '2': '8',
  '3': '9',
  '4': '2',
  '5': '7',
  '6': '3',
  '7': '1',
  '8': '5',
  '9': '6'
};

// Growth descriptions
const typeGrowthDescriptions = {
  '1': "When moving toward growth, Type 1s integrate the positive qualities of Type 7. They become more spontaneous, playful, and open to multiple perspectives.",
  '2': "When moving toward growth, Type 2s integrate the positive qualities of Type 4. They become more authentic about their own feelings and needs, and develop deeper self-awareness.",
  '3': "When moving toward growth, Type 3s integrate the positive qualities of Type 6. They become more cooperative, loyal, and in touch with their fears and doubts.",
  '4': "When moving toward growth, Type 4s integrate the positive qualities of Type 1. They become more disciplined, objective, and focused on what's right rather than what's missing.",
  '5': "When moving toward growth, Type 5s integrate the positive qualities of Type 8. They become more confident, decisive, and willing to assert themselves in the world.",
  '6': "When moving toward growth, Type 6s integrate the positive qualities of Type 9. They become more trusting, relaxed, and able to find inner stability.",
  '7': "When moving toward growth, Type 7s integrate the positive qualities of Type 5. They become more focused, thoughtful, and able to delve deeply into subjects.",
  '8': "When moving toward growth, Type 8s integrate the positive qualities of Type 2. They become more caring, empathetic, and aware of others' needs.",
  '9': "When moving toward growth, Type 9s integrate the positive qualities of Type 3. They become more goal-oriented, self-developing, and able to prioritize their true desires."
};

// Growth traits
const typeGrowthTraits = {
  '1': "Developing spontaneity, joy, keeping perspective, exploring options, embracing imperfection, and enjoying the present moment",
  '2': "Developing emotional authenticity, self-awareness, depth of feeling, creativity, and the ability to nurture yourself",
  '3': "Developing deeper bonds, commitment to people over image, honesty about insecurities, and loyalty to your own values",
  '4': "Developing discipline, objectivity, a sense of purpose, acceptance of reality as it is, and the ability to create practical structure",
  '5': "Developing assertiveness, taking decisive action, trusting your instincts, being more physically present, and leading confidently",
  '6': "Developing inner peace, self-trust, the ability to see multiple perspectives, patience, and a meditative mindset",
  '7': "Developing focus, deep expertise in selected areas, thoughtfulness before action, and comfort with complex or difficult realities",
  '8': "Developing sensitivity to others' feelings, expressing vulnerability, nurturing others without control, and genuine empathy",
  '9': "Developing self-prioritization, healthy ambition, clarity about your desires, and the ability to take effective action"
};

// Stress descriptions
const typeStressDescriptions = {
  '1': "When moving toward stress, Type 1s take on the negative qualities of Type 4. They become moody, envious, and focused on what they're missing.",
  '2': "When moving toward stress, Type 2s take on the negative qualities of Type 8. They become controlling, confrontational, and domineering.",
  '3': "When moving toward stress, Type 3s take on the negative qualities of Type 9. They become disengaged, apathetic, and lose their sense of direction.",
  '4': "When moving toward stress, Type 4s take on the negative qualities of Type 2. They become overly clingy, manipulative, and lose touch with their own needs.",
  '5': "When moving toward stress, Type 5s take on the negative qualities of Type 7. They become scattered, impulsive, and superficially engaged with too many things.",
  '6': "When moving toward stress, Type 6s take on the negative qualities of Type 3. They become competitive, image-conscious, and overly focused on success.",
  '7': "When moving toward stress, Type 7s take on the negative qualities of Type 1. They become critical, rigid, and perfectionistic.",
  '8': "When moving toward stress, Type 8s take on the negative qualities of Type 5. They become withdrawn, secretive, and emotionally detached.",
  '9': "When moving toward stress, Type 9s take on the negative qualities of Type 6. They become anxious, suspicious, and catastrophize about potential problems."
};

// Stress traits
const typeStressTraits = {
  '1': "Becoming melancholic, feeling inadequate, comparing yourself unfavorably to others, dramatic emotional swings, and withdrawing",
  '2': "Becoming confrontational, controlling others, intimidating, demanding, and aggressive when feeling unappreciated",
  '3': "Becoming disengaged, procrastinating, numbing out, forgetting priorities, and avoiding challenges",
  '4': "Becoming people-pleasing, neglecting your own needs, manipulative, possessive, and losing your sense of self",
  '5': "Becoming scattered, impulsive, seeking constant distraction, excessive talking, and making rash decisions",
  '6': "Becoming competitive, workaholic, image-focused, dismissive of feelings, and excessively achievement-oriented",
  '7': "Becoming judgmental, critical, rigid, focused on flaws, and feeling that nothing measures up to your standards",
  '8': "Becoming detached, reclusive, cynical, intellectualizing emotions, and withdrawing from confrontation",
  '9': "Becoming anxious, doubtful, suspicious, seeing worst-case scenarios, and seeking constant reassurance"
};

// Growth areas for each type
const typeGrowthAreas = {
  '1': "Practice self-acceptance. Recognize that making mistakes is part of being human. Develop flexibility and playfulness. Learn to enjoy the journey, not just the perfect outcome. Explore relaxation techniques to release the constant inner tension",
  '2': "Acknowledge and prioritize your own needs. Practice saying no without guilt. Develop direct communication about your own feelings rather than focusing solely on others. Create boundaries in relationships. Recognize when you're seeking validation",
  '3': "Develop introspection about your authentic feelings and values. Practice being rather than just doing. Take time for self-reflection away from achievement. Cultivate relationships based on authenticity rather than impression management",
  '4': "Develop practical disciplines and routines. Practice presence with what is rather than longing for what's missing. Build resilience against emotional storms. Learn to recognize and appreciate the ordinary joys of life",
  '5': "Practice engagement with the physical world and your body. Develop comfort with emotions and interpersonal connection. Take action before feeling completely ready. Share your knowledge and insights with others even when it feels vulnerable",
  '6': "Develop self-trust and inner authority. Practice mindfulness to manage anxiety. Recognize your tendency to project worst-case scenarios. Build courage to act despite uncertainty. Cultivate calm and patience",
  '7': "Develop depth and focus in selected areas. Practice staying with uncomfortable emotions rather than seeking distraction. Build discipline in following through on commitments. Learn to appreciate the richness of the present moment",
  '8': "Develop emotional vulnerability and awareness of impact on others. Practice gentleness and restraint. Notice when you're controlling situations out of fear. Allow others to be strong for you sometimes. Listen more than you speak",
  '9': "Develop awareness of your own priorities and desires. Practice making decisions based on what you truly want. Build momentum through small, consistent actions. Learn to recognize and express healthy anger"
};

// Self-awareness practices
const typePractices = {
  '1': "Practice meditation to quiet the inner critic. Keep a journal of positive events and achievements. Schedule regular time for playful activities with no goal. Develop awareness of physical tension as a sign of self-judgment. Practice the phrase 'good enough'",
  '2': "Schedule regular self-care that isn't tied to others' needs. Keep a journal of your own feelings and desires. Practice receiving help without feeling obligated to return it. Notice when you're saying yes but feeling resentful",
  '3': "Take regular breaks from social media and external validation. Meditate on questions like 'Who am I when no one is watching?'. Share vulnerabilities with trusted friends. Notice when you're changing yourself to impress others",
  '4': "Develop daily routines that ground you. Practice gratitude for what's present rather than focusing on what's missing. Create a balanced perspective by listing both positives and negatives. Notice when you're amplifying emotional drama",
  '5': "Practice physical activities that connect you to your body. Schedule regular social connection even when you don't feel like it. Set a timer for research and reading to avoid overthinking. Share your thoughts before they feel completely formed",
  '6': "Practice mindfulness meditation to develop present-moment awareness. Keep a journal to track when fears didn't materialize. Develop awareness of your physical reactions to anxiety. Create a list of past successes to reference during doubt",
  '7': "Practice sitting with uncomfortable feelings without distraction. Commit to finishing projects before starting new ones. Keep a journal to track patterns of avoidance. Develop mindfulness of sensations in the body",
  '8': "Practice asking for others' perspectives before making decisions. Take time for quiet reflection on your vulnerabilities. Notice when your voice and posture become dominating. Meditate on compassion for those you find weak",
  '9': "Set an alarm to check in with yourself about your own needs and desires. Practice saying 'I want' or 'I prefer' in low-stakes situations. Keep a priority journal. Notice when you're merging with others' agendas"
};

// Relationship approaches
const typeRelationshipApproaches = {
  '1': "Type 1s are loyal and responsible partners who value honesty and integrity. They work hard to improve relationships but may struggle with expressing affection freely. Their criticism is usually intended to help, though it may not always feel that way to partners.",
  '2': "Type 2s are attentive and caring partners who excel at anticipating needs. They create warm, emotionally rich relationships but may struggle with directly expressing their own needs. They thrive with partners who actively appreciate their efforts.",
  '3': "Type 3s are energetic and committed partners who value shared goals and achievements. They show love through doing and accomplishing but may struggle with slowing down for emotional connection. They thrive with partners who appreciate their capabilities.",
  '4': "Type 4s are deeply committed to authentic connection and emotional intimacy. They bring creativity and depth to relationships but may struggle with idealizing partners and then feeling disappointed. They thrive with partners who appreciate their uniqueness while providing stability.",
  '5': "Type 5s are loyal and thoughtful partners who need significant personal space. They show love by sharing knowledge and insights but may struggle with emotional expressiveness. They thrive with partners who respect their boundaries and privacy.",
  '6': "Type 6s are dedicated and loyal partners who create secure, stable relationships. They show love through commitment and problem-solving but may struggle with persistent doubt and anxiety. They thrive with partners who are consistent and reassuring.",
  '7': "Type 7s are enthusiastic and adventurous partners who bring fun and spontaneity to relationships. They show love by creating experiences but may struggle with difficult emotions or commitment. They thrive with partners who enjoy variety while providing some structure.",
  '8': "Type 8s are protective and generous partners who create strong, passionate relationships. They show love through action and protection but may struggle with vulnerability and tenderness. They thrive with partners who can stand their ground while showing genuine care.",
  '9': "Type 9s are supportive and accommodating partners who create harmonious relationships. They show love through acceptance and stability but may struggle with asserting their own needs and desires. They thrive with partners who gently encourage their self-expression."
};

// Compatibility details
const typeCompatibilities = {
  '1-2': "Types 1 and 2 balance each other well. The 1 brings structure and clarity while the 2 brings warmth and attentiveness. Both types value helping others and personal growth.",
  '1-7': "Types 1 and 7 provide what the other lacks. The 1 brings structure and purpose to the 7, while the 7 helps the 1 lighten up and see multiple possibilities.",
  '1-9': "Types 1 and 9 both value harmony and improvement. The 1 helps the 9 find direction and purpose, while the 9 helps the 1 accept imperfection and find peace.",
  '2-1': "Types 2 and 1 share a desire to help others. The 2 brings emotional warmth to the 1, while the 1 provides structure and direction that can ground the 2.",
  '2-4': "Types 2 and 4 share a depth of emotion and creativity. The 2 offers support for the 4's emotional needs, while the 4 appreciates the 2's generosity in ways others might miss.",
  '2-8': "Types 2 and 8 create a powerful caring/protected dynamic. The 2 brings sensitivity to the 8, while the 8 provides strength and protection that makes the 2 feel secure.",
  '3-6': "Types 3 and 6 both value security and success. The 3 provides confidence and direction that reassures the 6, while the 6 offers loyalty and support for the 3's ambitions.",
  '3-9': "Types 3 and 9 create a balanced dynamic. The 3's drive gives direction to the 9, while the 9's relaxed acceptance helps the 3 slow down and find peace with themselves.",
  '3-1': "Types 3 and 1 share a goal-oriented approach to life. The 3 brings adaptability and charm, while the 1 contributes integrity and structure.",
  '4-2': "Types 4 and 2 share emotional depth and empathy. The 4 appreciates the 2's attention and care, while the 2 is drawn to the 4's authenticity and depth.",
  '4-9': "Types 4 and 9 both seek harmony but approach it differently. The 4 brings emotional depth and authenticity, while the 9 offers acceptance and peace that the 4 craves.",
  '4-5': "Types 4 and 5 share a rich inner world. The 4 brings emotional expression that helps the 5 connect with feelings, while the 5 offers objectivity that can stabilize the 4.",
  '5-1': "Types 5 and 1 share a quest for understanding. The 5 offers depth of knowledge, while the 1 contributes practical application and structure.",
  '5-7': "Types 5 and 7 balance each other's approaches to life. The 5 brings depth and focus to the 7, while the 7 helps the 5 engage more fully with experiences and possibilities.",
  '5-9': "Types 5 and 9 both value peace and space. The 5 brings intellectual depth, while the 9 offers acceptance and harmony that helps the 5 feel comfortable.",
  '6-3': "Types 6 and 3 complement each other well. The 6 offers loyalty and thoughtfulness, while the 3 brings confidence and direction that helps the 6 feel more secure.",
  '6-8': "Types 6 and 8 create a powerful loyalty dynamic. The 6 appreciates the 8's strength and protection, while the 8 values the 6's loyalty and support.",
  '6-9': "Types 6 and 9 both seek security and harmony. The 6 helps the 9 address problems directly, while the 9 helps the 6 find inner peace and reduce anxiety.",
  '7-3': "Types 7 and 3 create an energetic, ambitious partnership. The 7 brings creativity and enthusiasm, while the 3 contributes focus and practical goal-setting.",
  '7-5': "Types 7 and 5 balance each other intellectually. The 7 helps the 5 engage more with the world, while the 5 offers depth that satisfies the 7's curiosity.",
  '7-9': "Types 7 and 9 create a positive, harmonious dynamic. The 7 brings energy and enthusiasm to the 9, while the 9 offers acceptance and peace that grounds the 7.",
  '8-2': "Types 8 and 2 create a powerful dynamic of strength and care. The 8 protects and empowers the 2, while the 2 offers emotional connection that the 8 secretly craves.",
  '8-4': "Types 8 and 4 both value authenticity and intensity. The 8 provides strength and protection for the 4, while the 4 offers emotional depth that helps the 8 connect with vulnerability.",
  '8-6': "Types 8 and 6 form a natural alliance of strength and loyalty. The 8 provides protection and decisiveness, while the 6 offers commitment and thoughtful analysis.",
  '9-1': "Types 9 and 1 both seek improvement but approach it differently. The 9 brings acceptance and harmony, while the 1 offers structure and clarity that helps the 9 find direction.",
  '9-3': "Types 9 and 3 complement each other's approaches. The 9 helps the 3 slow down and find authentic satisfaction, while the 3 provides motivation and direction for the 9.",
  '9-5': "Types 9 and 5 both value calm and space. The 9 brings a harmonizing presence, while the 5 offers intellectual depth and clarity that the 9 appreciates."
};

export default EnneagramResults;