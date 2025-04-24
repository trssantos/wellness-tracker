// src/components/Lifestyle/ZodiacResults.jsx
import React, { useState } from 'react';
import { Star, ChevronLeft, RefreshCw, FileText, Heart, Briefcase, User, Zap, Activity, BookOpen, Users, ThumbsUp, ThumbsDown } from 'lucide-react';
import { getZodiacColors, zodiacSigns } from '../../utils/zodiacData';
import { getStorage, setStorage } from '../../utils/storage';

const ZodiacResults = ({ results, onReset, onRetake, onViewLibrary }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!results || !results.sign) return null;

  const { sign, signData } = results;
  const colors = getZodiacColors(sign);

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Tabs for results sections
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Star size={18} /> },
    { id: 'personality', label: 'Personality', icon: <User size={18} /> },
    { id: 'career', label: 'Career', icon: <Briefcase size={18} /> },
    { id: 'love', label: 'Love', icon: <Heart size={18} /> },
    { id: 'wellness', label: 'Wellness', icon: <Activity size={18} /> }
  ];

  // Get current tab
  const currentTab = tabs.find(tab => tab.id === activeTab);

  // Render the overview tab
  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className={`${colors.bg} p-4 sm:p-6 rounded-xl flex flex-col md:flex-row items-center gap-6`}>
        <div className="flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
            <span className={`text-4xl ${colors.accent}`} dangerouslySetInnerHTML={{ __html: signData.symbol }}></span>
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <h3 className={`text-xl sm:text-2xl font-bold ${colors.text} mb-2`}>
            {signData.name}
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm mb-1">
            {signData.dates}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
            <span className="text-xs font-medium bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full">
              Element: {signData.element}
            </span>
            <span className="text-xs font-medium bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full">
              Planet: {signData.ruling_planet}
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {signData.description}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ThumbsUp className="text-green-500 dark:text-green-400" size={20} />
            Key Strengths
          </h3>
          
          <div className="space-y-2">
            {signData.details.strengths.split(', ').map((strength, index) => (
              <div 
                key={index}
                className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg px-3 py-2 text-green-800 dark:text-green-200 text-sm flex items-center"
              >
                <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 mr-2"></div>
                {strength}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ThumbsDown className="text-red-500 dark:text-red-400" size={20} />
            Areas for Growth
          </h3>
          
          <div className="space-y-2">
            {signData.details.weaknesses.split(', ').map((weakness, index) => (
              <div 
                key={index}
                className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg px-3 py-2 text-red-800 dark:text-red-200 text-sm flex items-center"
              >
                <div className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400 mr-2"></div>
                {weakness}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Users className="text-blue-500 dark:text-blue-400" size={20} />
          Compatibility
        </h3>
        
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You're most compatible with these signs:
        </p>
        
        <div className="flex flex-wrap gap-2">
          {signData.details.compatibility.split(', ').map((compatSign, index) => {
            const compatSignKey = compatSign.toLowerCase();
            const compatData = Object.entries(zodiacSigns).find(
              ([key, data]) => data.name.toLowerCase() === compatSignKey
            );
            
            // Use the found sign data, or fallback to just showing the name
            const signSymbol = compatData ? compatData[1].symbol : '';
            
            return (
              <div 
                key={index}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg px-3 py-2 text-blue-800 dark:text-blue-200 text-sm flex items-center"
              >
                {signSymbol && (
                  <span className="mr-2 text-blue-500 dark:text-blue-400" dangerouslySetInnerHTML={{ __html: signSymbol }}></span>
                )}
                {compatSign}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render the personality tab
  const renderPersonalityTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <User className={colors.icon} size={20} />
          {signData.name} Personality Traits
        </h3>
        
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {signData.description}
        </p>
        
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700 dark:text-slate-300 flex items-center">
            <span className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 mr-2"></span>
            Key Traits
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {signData.details.traits.split(', ').map((trait, index) => (
              <div 
                key={index}
                className={`${colors.bg} border ${colors.border} rounded-lg px-3 py-2 ${colors.text} text-sm`}
              >
                {trait}
              </div>
            ))}
          </div>
          
          <h4 className="font-medium text-slate-700 dark:text-slate-300 flex items-center mt-6">
            <span className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 mr-2"></span>
            Hobbies & Interests
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {signData.details.hobbies.split(', ').map((hobby, index) => (
              <div 
                key={index}
                className={`${colors.bg} border ${colors.border} rounded-lg px-3 py-2 ${colors.text} text-sm`}
              >
                {hobby}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render the career tab
  const renderCareerTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Briefcase className={colors.icon} size={20} />
          Career Insights for {signData.name}
        </h3>
        
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
              Recommended Career Paths
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              {signData.details.career.split(', ').map((career, index) => (
                <div 
                  key={index}
                  className="flex items-center"
                >
                  <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                  <span className="text-slate-600 dark:text-slate-400 text-sm">{career}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
              Workplace Strengths
            </h4>
            
            <ul className="space-y-2">
              {/* These are generic entries that could be customized for each sign */}
              <li className="flex items-start">
                <div className={`h-2 w-2 rounded-full ${colors.accent} mt-2 mr-2`}></div>
                <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">
                  {signData.element === "Fire" && "Brings energy and enthusiasm to projects"}
                  {signData.element === "Earth" && "Offers practical solutions and reliability"}
                  {signData.element === "Air" && "Contributes innovative ideas and communication skills"}
                  {signData.element === "Water" && "Provides emotional intelligence and intuitive insights"}
                </span>
              </li>
              <li className="flex items-start">
                <div className={`h-2 w-2 rounded-full ${colors.accent} mt-2 mr-2`}></div>
                <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">
                  {sign === "aries" && "Excels at initiating projects and taking the lead"}
                  {sign === "taurus" && "Excellent at maintaining focus and seeing things through"}
                  {sign === "gemini" && "Skilled at multitasking and adapting to new information"}
                  {sign === "cancer" && "Creates supportive team environments and remembers details"}
                  {sign === "leo" && "Natural leader who motivates and inspires others"}
                  {sign === "virgo" && "Highly organized with exceptional attention to detail"}
                  {sign === "libra" && "Diplomatic negotiator who creates harmonious work environments"}
                  {sign === "scorpio" && "Deep researcher who uncovers hidden truths and solutions"}
                  {sign === "sagittarius" && "Brings optimism and a broad perspective to challenges"}
                  {sign === "capricorn" && "Excels at strategic planning and managing resources"}
                  {sign === "aquarius" && "Innovative thinker who develops unique solutions"}
                  {sign === "pisces" && "Creative problem-solver with strong empathetic abilities"}
                </span>
              </li>
              <li className="flex items-start">
                <div className={`h-2 w-2 rounded-full ${colors.accent} mt-2 mr-2`}></div>
                <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">
                  {signData.details.strengths.split(', ')[0]} and {signData.details.strengths.split(', ')[1]} contribute to professional success
                </span>
              </li>
            </ul>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
              Work Challenges
            </h4>
            
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className={`h-2 w-2 rounded-full ${colors.accent} mt-2 mr-2`}></div>
                <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">
                  May struggle with {signData.details.weaknesses.split(', ')[0]} in professional settings
                </span>
              </li>
              <li className="flex items-start">
                <div className={`h-2 w-2 rounded-full ${colors.accent} mt-2 mr-2`}></div>
                <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">
                  {sign === "aries" && "Can become frustrated with slow-moving projects"}
                  {sign === "taurus" && "Might resist necessary changes in the workplace"}
                  {sign === "gemini" && "May lose interest in projects before completion"}
                  {sign === "cancer" && "Could take workplace criticism too personally"}
                  {sign === "leo" && "Might seek too much recognition for contributions"}
                  {sign === "virgo" && "Perfectionism can lead to procrastination or burnout"}
                  {sign === "libra" && "Decision-making may be delayed by considering all options"}
                  {sign === "scorpio" && "Tendency to become too intense or secretive with colleagues"}
                  {sign === "sagittarius" && "May overlook important details when focused on the big picture"}
                  {sign === "capricorn" && "Work-life balance can suffer due to professional ambition"}
                  {sign === "aquarius" && "Might resist traditional structures or authority"}
                  {sign === "pisces" && "Can become overwhelmed by workplace politics or conflict"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Render the love tab
  const renderLoveTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Heart className="text-red-500 dark:text-red-400" size={20} />
          Love & Relationships for {signData.name}
        </h3>
        
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-800/30">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-3">
              Relationship Style
            </h4>
            
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              {signData.details.love}
            </p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
              Most Compatible With
            </h4>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {signData.details.compatibility.split(', ').map((compatSign, index) => {
                const compatSignKey = compatSign.toLowerCase();
                const compatData = Object.entries(zodiacSigns).find(
                  ([key, data]) => data.name.toLowerCase() === compatSignKey
                );
                
                // Use the found sign data, or fallback to just showing the name
                const signSymbol = compatData ? compatData[1].symbol : '';
                
                return (
                  <div 
                    key={index}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 text-sm flex items-center"
                  >
                    {signSymbol && (
                      <span className="mr-2 text-amber-500 dark:text-amber-400" dangerouslySetInnerHTML={{ __html: signSymbol }}></span>
                    )}
                    {compatSign}
                  </div>
                );
              })}
            </div>
            
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mt-6 mb-3">
              Love Language
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-start">
                <div className={`h-2 w-2 rounded-full ${colors.accent} mt-2 mr-2`}></div>
                <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">
                  {sign === "aries" && "Physical touch and words of affirmation"}
                  {sign === "taurus" && "Physical touch and gifts of quality"}
                  {sign === "gemini" && "Words of affirmation and quality time with conversation"}
                  {sign === "cancer" && "Acts of service and quality time at home"}
                  {sign === "leo" && "Words of affirmation and quality time with full attention"}
                  {sign === "virgo" && "Acts of service and thoughtful attention to detail"}
                  {sign === "libra" && "Words of affirmation and creating beautiful experiences"}
                  {sign === "scorpio" && "Physical touch and emotional vulnerability"}
                  {sign === "sagittarius" && "Quality time on adventures and space for independence"}
                  {sign === "capricorn" && "Acts of service and practical expressions of love"}
                  {sign === "aquarius" && "Intellectual connection and accepting uniqueness"}
                  {sign === "pisces" && "Words of affirmation and emotional sensitivity"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
              Relationship Advice
            </h4>
            
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className={`h-2 w-2 rounded-full ${colors.accent} mt-2 mr-2`}></div>
                <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">
                  {sign === "aries" && "Practice patience and listen before reacting"}
                  {sign === "taurus" && "Be open to compromise and new experiences"}
                  {sign === "gemini" && "Develop emotional depth beyond surface conversations"}
                  {sign === "cancer" && "Communicate needs directly rather than expecting partners to read your mind"}
                  {sign === "leo" && "Show interest in your partner's achievements, not just your own"}
                  {sign === "virgo" && "Accept imperfection in yourself and others"}
                  {sign === "libra" && "Make decisions independently sometimes and stand your ground"}
                  {sign === "scorpio" && "Practice transparency and avoid testing partners"}
                  {sign === "sagittarius" && "Follow through on promises and consider partners' need for security"}
                  {sign === "capricorn" && "Make time for emotional connection, not just practical matters"}
                  {sign === "aquarius" && "Balance intellectual connection with emotional intimacy"}
                  {sign === "pisces" && "Set healthy boundaries and avoid codependent tendencies"}
                </span>
              </li>
              <li className="flex items-start">
                <div className={`h-2 w-2 rounded-full ${colors.accent} mt-2 mr-2`}></div>
                <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">
                  Work on balancing your {signData.details.weaknesses.split(', ')[0]} tendencies in relationships
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Render the wellness tab
  const renderWellnessTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Activity className={colors.icon} size={20} />
          Wellness Guide for {signData.name}
        </h3>
        
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
              Wellness Strengths
            </h4>
            
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {signData.details.wellness}
            </p>
            
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mt-6 mb-3">
              Recommended Activities
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Generate some wellness activities based on the sign */}
              {sign === "aries" && (
                <>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">High-intensity interval training</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Martial arts</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Competitive sports</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Short, intense meditation</span>
                  </div>
                </>
              )}
              {sign === "taurus" && (
                <>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Yoga and stretching</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Nature walks</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Gardening</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Massage therapy</span>
                  </div>
                </>
              )}
              {sign === "gemini" && (
                <>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Varied fitness routines</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Dance classes</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Group fitness activities</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Brain-training games</span>
                  </div>
                </>
              )}
              {sign === "cancer" && (
                <>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Swimming</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Journaling</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Home-based workouts</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Emotional release practices</span>
                  </div>
                </>
              )}
              {sign === "leo" && (
                <>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Group fitness classes</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Dance and movement</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Cardiovascular exercise</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Social sports</span>
                  </div>
                </>
              )}
              {sign === "virgo" && (
                <>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Structured fitness programs</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Pilates</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Digestive-focused nutrition</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Detailed health tracking</span>
                  </div>
                </>
              )}
              {sign === "libra" && (
                <>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Partner yoga</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Dance classes</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Balance-focused exercises</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Social wellness activities</span>
                  </div>
                </>
              )}
              {sign === "scorpio" && (
                <>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">High-intensity workouts</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Water sports</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Emotional processing activities</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Therapeutic practices</span>
                  </div>
                </>
              )}
              {sign === "sagittarius" && (
                <>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Outdoor adventures</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Long-distance running</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Travel-based wellness</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Philosophical exploration</span>
                  </div>
                </>
              )}
              {sign === "capricorn" && (
                <>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Progressive strength training</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Hiking and climbing</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Structured fitness regimens</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Stress management practices</span>
                  </div>
                </>
              )}
              {sign === "aquarius" && (
                <>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Innovative fitness approaches</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Group sports with a cause</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Technology-based health tracking</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Mental wellness practices</span>
                  </div>
                </>
              )}
              {sign === "pisces" && (
                <>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Swimming and water activities</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Gentle yoga and meditation</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Artistic expression for healing</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${colors.accent} mr-2`}></div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Spiritual wellness practices</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
              Wellness Tips
            </h4>
            
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className={`h-2 w-2 rounded-full ${colors.accent} mt-2 mr-2`}></div>
                <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">
                  {sign === "aries" && "Balance high-energy activities with short meditation sessions"}
                  {sign === "taurus" && "Create consistent routines that include sensory pleasures"}
                  {sign === "gemini" && "Try variety in your wellness routine to keep engaged"}
                  {sign === "cancer" && "Prioritize emotional health alongside physical wellness"}
                  {sign === "leo" && "Find activities that combine socializing with exercise"}
                  {sign === "virgo" && "Practice letting go of perfectionism in your health journey"}
                  {sign === "libra" && "Seek balance between exercise, nutrition, and relaxation"}
                  {sign === "scorpio" && "Use exercise as a positive outlet for intense emotions"}
                  {sign === "sagittarius" && "Combine learning with physical activity for maximum engagement"}
                  {sign === "capricorn" && "Allow yourself rest days and recovery as part of your regimen"}
                  {sign === "aquarius" && "Experiment with unconventional wellness approaches"}
                  {sign === "pisces" && "Connect mind-body practices with spiritual wellbeing"}
                </span>
              </li>
              <li className="flex items-start">
                <div className={`h-2 w-2 rounded-full ${colors.accent} mt-2 mr-2`}></div>
                <span className="text-slate-600 dark:text-slate-400 text-sm flex-1">
                  {sign === "aries" && "Include cooling practices to balance your fiery energy"}
                  {sign === "taurus" && "Incorporate movement throughout the day to counter tendency toward comfort"}
                  {sign === "gemini" && "Try mindfulness practices to help calm a busy mind"}
                  {sign === "cancer" && "Create a nurturing home environment that supports wellness"}
                  {sign === "leo" && "Focus on heart-healthy nutrition and cardiovascular exercise"}
                  {sign === "virgo" && "Pay attention to digestive health and gut-brain connection"}
                  {sign === "libra" && "Create beautiful environments that inspire healthy choices"}
                  {sign === "scorpio" && "Practice transparency with healthcare providers rather than keeping concerns private"}
                  {sign === "sagittarius" && "Develop consistent wellness routines even with your love of variety"}
                  {sign === "capricorn" && "Remember that wellness is a long-term investment, not just achievement"}
                  {sign === "aquarius" && "Connect your wellness practices to community wellbeing"}
                  {sign === "pisces" && "Set boundaries around wellness practices to avoid overwhelm"}
                </span>
              </li>
            </ul>
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
            <Star className="text-amber-500 dark:text-amber-400" size={24} />
            Your Zodiac Profile
          </h2>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onViewLibrary}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
              title="View all signs"
            >
              <FileText size={18} />
            </button>
            <button 
              onClick={onRetake}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
              title="Update birth date"
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
        
        {/* Mobile Tab Selector */}
        <div className="sm:hidden mb-6 overflow-x-auto no-scrollbar">
          <div className="flex space-x-2 w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  activeTab === tab.id 
                    ? `${colors.bg} ${colors.text}`
                    : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Desktop Tabs */}
        <div className="hidden sm:flex overflow-x-auto no-scrollbar mb-6 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none min-w-[120px] ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
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
          {activeTab === 'personality' && renderPersonalityTab()}
          {activeTab === 'career' && renderCareerTab()}
          {activeTab === 'love' && renderLoveTab()}
          {activeTab === 'wellness' && renderWellnessTab()}
        </div>
      </div>
    </div>
  );
};

export default ZodiacResults;