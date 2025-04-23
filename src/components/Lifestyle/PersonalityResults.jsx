import React, { useState, useRef, useEffect } from 'react';
import { Brain, Users, Briefcase, Heart, Coffee, ThumbsUp, ThumbsDown, Share2, Download, RefreshCw, FileText, ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';

const PersonalityResults = ({ results, onReset, onRetake }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  if (!results) return null;
  
  const { type, name, description, details, scores } = results;
  
  // Calculate percentages for each dimension
  const calculatePercentage = (score1, score2) => {
    const total = score1 + score2;
    return total === 0 ? 50 : Math.round((score1 / total) * 100);
  };
  
  const percentages = {
    E: calculatePercentage(scores.E, scores.I),
    I: calculatePercentage(scores.I, scores.E),
    S: calculatePercentage(scores.S, scores.N),
    N: calculatePercentage(scores.N, scores.S),
    T: calculatePercentage(scores.T, scores.F),
    F: calculatePercentage(scores.F, scores.T),
    J: calculatePercentage(scores.J, scores.P),
    P: calculatePercentage(scores.P, scores.J)
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  // Helper to get text color class based on personality dimension
  const getDimensionColor = (dimension) => {
    switch(dimension) {
      case 'E': case 'I': return 'text-blue-600 dark:text-blue-400';
      case 'S': case 'N': return 'text-green-600 dark:text-green-400';
      case 'T': case 'F': return 'text-purple-600 dark:text-purple-400';
      case 'J': case 'P': return 'text-amber-600 dark:text-amber-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };
  
  // Helper to get background color class based on personality dimension
  const getDimensionBgColor = (dimension) => {
    switch(dimension) {
      case 'E': case 'I': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'S': case 'N': return 'bg-green-100 dark:bg-green-900/30';
      case 'T': case 'F': return 'bg-purple-100 dark:bg-purple-900/30';
      case 'J': case 'P': return 'bg-amber-100 dark:bg-amber-900/30';
      default: return 'bg-slate-100 dark:bg-slate-700';
    }
  };
  
  // Tabs for results sections
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Brain size={18} /> },
    { id: 'career', label: 'Career', icon: <Briefcase size={18} /> },
    { id: 'relationships', label: 'Relationships', icon: <Users size={18} /> },
    { id: 'lifestyle', label: 'Lifestyle', icon: <Coffee size={18} /> },
  ];
  
  // Get current tab info
  const currentTab = tabs.find(tab => tab.id === activeTab);
  
  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 dark:bg-purple-900/30 p-4 sm:p-6 rounded-xl flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-purple-200 dark:border-purple-700 shadow-sm">
            <span className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{type}</span>
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 break-words">
            {name}
          </h3>
          <p className="text-purple-700 dark:text-purple-300 text-sm sm:text-base break-words">
            {description}
          </p>
          <div className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Test completed on {formatDate(results.timestamp)}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Brain className="text-purple-500 dark:text-purple-400" size={20} />
            Your Personality Dimensions
          </h3>
          
          <div className="space-y-4">
            {/* E-I Dimension */}
            <div>
              <div className="flex justify-between text-sm mb-1 flex-wrap">
                <span className={`font-medium ${getDimensionColor('E')} break-words`}>
                  Extraversion ({percentages.E}%)
                </span>
                <span className={`font-medium ${getDimensionColor('I')} break-words`}>
                  Introversion ({percentages.I}%)
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 dark:bg-blue-600 rounded-full"
                  style={{ width: `${percentages.E}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">
                {type.includes('E') ? 
                  "You gain energy from social interaction and the external world." : 
                  "You gain energy from solitude and your internal thoughts."}
              </p>
            </div>
            
            {/* S-N Dimension */}
            <div>
              <div className="flex justify-between text-sm mb-1 flex-wrap">
                <span className={`font-medium ${getDimensionColor('S')} break-words`}>
                  Sensing ({percentages.S}%)
                </span>
                <span className={`font-medium ${getDimensionColor('N')} break-words`}>
                  Intuition ({percentages.N}%)
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 dark:bg-green-600 rounded-full"
                  style={{ width: `${percentages.S}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">
                {type.includes('S') ? 
                  "You focus on concrete facts and present realities." : 
                  "You focus on patterns, possibilities, and future potential."}
              </p>
            </div>
            
            {/* T-F Dimension */}
            <div>
              <div className="flex justify-between text-sm mb-1 flex-wrap">
                <span className={`font-medium ${getDimensionColor('T')} break-words`}>
                  Thinking ({percentages.T}%)
                </span>
                <span className={`font-medium ${getDimensionColor('F')} break-words`}>
                  Feeling ({percentages.F}%)
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 dark:bg-purple-600 rounded-full"
                  style={{ width: `${percentages.T}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">
                {type.includes('T') ? 
                  "You make decisions based on logic and objective analysis." : 
                  "You make decisions based on values and how they affect people."}
              </p>
            </div>
            
            {/* J-P Dimension */}
            <div>
              <div className="flex justify-between text-sm mb-1 flex-wrap">
                <span className={`font-medium ${getDimensionColor('J')} break-words`}>
                  Judging ({percentages.J}%)
                </span>
                <span className={`font-medium ${getDimensionColor('P')} break-words`}>
                  Perceiving ({percentages.P}%)
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 dark:bg-amber-600 rounded-full"
                  style={{ width: `${percentages.J}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">
                {type.includes('J') ? 
                  "You prefer structure, planning, and organization." : 
                  "You prefer flexibility, adaptability, and spontaneity."}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ThumbsUp className="text-green-500 dark:text-green-400" size={20} />
            Core Strengths
          </h3>
          
          <div className="space-y-2">
            {details.strengths.split(', ').map((strength, index) => (
              <div 
                key={index}
                className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg px-3 py-2 text-green-800 dark:text-green-200 text-sm break-words"
              >
                {strength}
              </div>
            ))}
          </div>
          
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-4 flex items-center gap-2">
            <ThumbsDown className="text-red-500 dark:text-red-400" size={20} />
            Potential Blind Spots
          </h3>
          
          <div className="space-y-2">
            {details.weaknesses.split(', ').map((weakness, index) => (
              <div 
                key={index}
                className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg px-3 py-2 text-red-800 dark:text-red-200 text-sm break-words"
              >
                {weakness}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderCareerTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 break-words">
          <Briefcase className="text-blue-500 dark:text-blue-400 flex-shrink-0" size={20} />
          Career Insights for {type} ({name})
        </h3>
        
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm sm:text-base break-words">
          Your personality type tends to thrive in careers that align with your natural strengths and preferences.
          Here are some potential career paths and work environments that might be fulfilling for you:
        </p>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Recommended Career Paths
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {details.careers.split(', ').map((career, index) => (
                <div 
                  key={index}
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg px-3 py-2 text-blue-800 dark:text-blue-200 text-sm flex items-center break-words"
                >
                  <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 mr-2 flex-shrink-0"></div>
                  <span className="break-words">{career}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Work Environment Preferences
            </h4>
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
              <ul className="space-y-2 list-disc pl-5 text-slate-600 dark:text-slate-400 text-sm break-words">
                {type.includes('E') ? (
                  <li>You likely prefer collaborative, interactive workplaces</li>
                ) : (
                  <li>You likely prefer quieter workspaces with opportunities for deep focus</li>
                )}
                
                {type.includes('S') ? (
                  <li>You appreciate practical, structured work with clear expectations</li>
                ) : (
                  <li>You appreciate work that involves innovation and conceptual thinking</li>
                )}
                
                {type.includes('T') ? (
                  <li>You value logical systems and objective decision-making processes</li>
                ) : (
                  <li>You value harmonious workplace relationships and considering people's needs</li>
                )}
                
                {type.includes('J') ? (
                  <li>You prefer organized environments with clear schedules and deadlines</li>
                ) : (
                  <li>You prefer flexible environments that allow for adaptation and spontaneity</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderRelationshipsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 break-words">
          <Heart className="text-red-500 dark:text-red-400 flex-shrink-0" size={20} />
          Relationship Insights for {type} ({name})
        </h3>
        
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm sm:text-base break-words">
          Your personality type influences how you connect with others, communicate in relationships, and what you value in personal connections.
        </p>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Your Relationship Style
            </h4>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg p-4 text-red-800 dark:text-red-200 text-sm break-words">
              {details.relationships}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Compatibility With Other Types
            </h4>
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 text-slate-700 dark:text-slate-300 text-sm break-words">
              {details.compatibility}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Communication Tips
            </h4>
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
              <ul className="space-y-2 list-disc pl-5 text-slate-600 dark:text-slate-400 text-sm break-words">
                {type.includes('E') ? (
                  <li>You likely communicate openly and expressively, but may need to practice listening more</li>
                ) : (
                  <li>You likely think before speaking, but may need to express yourself more openly</li>
                )}
                
                {type.includes('S') ? (
                  <li>You appreciate practical, straightforward communication focused on facts</li>
                ) : (
                  <li>You appreciate discussions about possibilities and deeper meanings</li>
                )}
                
                {type.includes('T') ? (
                  <li>You value logical discussions and may need to acknowledge emotional aspects more</li>
                ) : (
                  <li>You value harmony and empathy in communication and may take criticism personally</li>
                )}
                
                {type.includes('J') ? (
                  <li>You prefer resolving issues directly and coming to clear conclusions</li>
                ) : (
                  <li>You prefer keeping options open and may delay difficult conversations</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderLifestyleTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 break-words">
          <Coffee className="text-amber-500 dark:text-amber-400 flex-shrink-0" size={20} />
          Lifestyle Insights for {type} ({name})
        </h3>
        
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm sm:text-base break-words">
          Your personality type influences your preferences for leisure activities, stress management, and overall lifestyle choices.
        </p>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Recommended Hobbies & Activities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {details.hobbies.split(', ').map((hobby, index) => (
                <div 
                  key={index}
                  className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg px-3 py-2 text-amber-800 dark:text-amber-200 text-sm flex items-center break-words"
                >
                  <div className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 mr-2 flex-shrink-0"></div>
                  <span className="break-words">{hobby}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Stress Management
            </h4>
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
              <ul className="space-y-2 list-disc pl-5 text-slate-600 dark:text-slate-400 text-sm break-words">
                {type.includes('E') ? (
                  <li>You may manage stress best by socializing and talking through your concerns</li>
                ) : (
                  <li>You may manage stress best by taking time alone to decompress and reflect</li>
                )}
                
                {type.includes('S') ? (
                  <li>Physical activities and practical problem-solving may help reduce your stress</li>
                ) : (
                  <li>Creative expression and exploring new ideas may help reduce your stress</li>
                )}
                
                {type.includes('T') ? (
                  <li>Analyzing problems logically and finding rational solutions helps you cope</li>
                ) : (
                  <li>Connecting with others and addressing emotional needs helps you cope</li>
                )}
                
                {type.includes('J') ? (
                  <li>Creating order and structure in your environment can reduce anxiety</li>
                ) : (
                  <li>Maintaining flexibility and going with the flow can reduce anxiety</li>
                )}
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Self-Care Recommendations
            </h4>
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
              <ul className="space-y-2 list-disc pl-5 text-slate-600 dark:text-slate-400 text-sm break-words">
                {type.includes('E') ? (
                  <li>Balance your social energy with occasional quiet time for reflection</li>
                ) : (
                  <li>Remember to connect with others even when you're inclined to withdraw</li>
                )}
                
                {type.includes('S') ? (
                  <li>Try to incorporate some creative activities to balance your practical focus</li>
                ) : (
                  <li>Ground yourself with practical routines to balance your abstract thinking</li>
                )}
                
                {type.includes('T') ? (
                  <li>Make time to check in with your emotional needs and those of others</li>
                ) : (
                  <li>Practice setting boundaries to avoid emotional burnout</li>
                )}
                
                {type.includes('J') ? (
                  <li>Allow yourself unstructured time to explore and be spontaneous</li>
                ) : (
                  <li>Implement some light structure to help manage important responsibilities</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
            <Brain className="text-purple-500 dark:text-purple-400 flex-shrink-0" size={24} />
            <span className="break-words">Your Personality Results</span>
          </h2>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onRetake}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
              title="Retake quiz"
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
        
        {/* Mobile Dropdown Selector */}
        <div className="sm:hidden mb-6 relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-4 py-3 rounded-lg"
          >
            <div className="flex items-center">
              {currentTab.icon}
              <span className="ml-2 font-medium">{currentTab.label}</span>
            </div>
            <ChevronDown 
              size={20} 
              className={`transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
            />
          </button>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg z-10 border border-slate-200 dark:border-slate-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left ${
                    activeTab === tab.id 
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Desktop Tabs */}
        <div className="hidden sm:flex overflow-x-auto no-scrollbar mb-6 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none min-w-[120px] ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </div>
            </button>
          ))}
        </div>
        
        {/* Tab content */}
        <div>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'career' && renderCareerTab()}
          {activeTab === 'relationships' && renderRelationshipsTab()}
          {activeTab === 'lifestyle' && renderLifestyleTab()}
        </div>
      </div>
      
     
    </div>
  );
};

export default PersonalityResults;