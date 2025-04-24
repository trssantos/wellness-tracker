// src/components/Lifestyle/ZodiacLibrary.jsx
import React, { useState } from 'react';
import { Search, Grid, List, Star, ArrowLeft, Filter, Calendar, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { zodiacSigns, getZodiacColors } from '../../utils/zodiacData';

const ZodiacLibrary = ({ onBack, onSelectSign }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterElement, setFilterElement] = useState('');
  const [selectedSign, setSelectedSign] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  
  // Filter signs based on search query and element filter
  const filteredSigns = Object.entries(zodiacSigns).filter(([key, sign]) => {
    const matchesSearch = !searchQuery || 
      sign.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      sign.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesElement = !filterElement || 
      sign.element.toLowerCase() === filterElement.toLowerCase();
    
    return matchesSearch && matchesElement;
  });

  // Group signs by element
  const elementGroups = {
    'Fire': filteredSigns.filter(([_, sign]) => sign.element === 'Fire'),
    'Earth': filteredSigns.filter(([_, sign]) => sign.element === 'Earth'),
    'Air': filteredSigns.filter(([_, sign]) => sign.element === 'Air'),
    'Water': filteredSigns.filter(([_, sign]) => sign.element === 'Water')
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Get element color class
  const getElementColorClass = (element) => {
    switch (element.toLowerCase()) {
      case 'fire': return 'text-red-600 dark:text-red-400';
      case 'earth': return 'text-green-600 dark:text-green-400';
      case 'air': return 'text-blue-600 dark:text-blue-400';
      case 'water': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  // Get element background color class
  const getElementBgClass = (element) => {
    switch (element.toLowerCase()) {
      case 'fire': return 'bg-red-50 dark:bg-red-900/30';
      case 'earth': return 'bg-green-50 dark:bg-green-900/30';
      case 'air': return 'bg-blue-50 dark:bg-blue-900/30';
      case 'water': return 'bg-purple-50 dark:bg-purple-900/30';
      default: return 'bg-slate-50 dark:bg-slate-700';
    }
  };

  // Format date range
  const formatDateRange = (dateString) => {
    const [startMonth, startDay, endMonth, endDay] = dateString.match(/(\w+) (\d+) - (\w+) (\d+)/).slice(1);
    return { startMonth, startDay, endMonth, endDay };
  };

  // Render the library view of all signs
  const renderLibraryView = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <button 
            onClick={onBack}
            className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back
          </button>

          <div className="flex items-center w-full sm:w-auto space-x-2">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search zodiac signs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full sm:w-64 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            </div>
            
            <div className="flex items-center">
              <select
                value={filterElement}
                onChange={(e) => setFilterElement(e.target.value)}
                className="bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Elements</option>
                <option value="fire">Fire</option>
                <option value="earth">Earth</option>
                <option value="air">Air</option>
                <option value="water">Water</option>
              </select>
              
              <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 ml-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600' : ''}`}
                  title="Grid view"
                >
                  <Grid size={16} className="text-slate-600 dark:text-slate-300" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-600' : ''}`}
                  title="List view"
                >
                  <List size={16} className="text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {filteredSigns.length === 0 ? (
          <div className="text-center py-12">
            <Star className="mx-auto mb-4 text-amber-400" size={48} />
            <p className="text-slate-600 dark:text-slate-400 mb-2">No signs found matching your search.</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterElement('');
              }}
              className="text-amber-500 dark:text-amber-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(elementGroups).map(([element, signs]) => {
              if (signs.length === 0) return null;
              
              return (
                <div key={element} className="space-y-3">
                  <h3 className={`text-lg font-medium flex items-center ${getElementColorClass(element)}`}>
                    <span className={`w-3 h-3 rounded-full ${getElementBgClass(element)} border-2 ${element === 'Fire' ? 'border-red-400' : element === 'Earth' ? 'border-green-400' : element === 'Air' ? 'border-blue-400' : 'border-purple-400'} mr-2`}></span>
                    {element} Signs
                  </h3>
                  
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {signs.map(([key, sign]) => {
                        const colors = getZodiacColors(key);
                        return (
                          <div
                            key={key}
                            onClick={() => setSelectedSign(key)}
                            className={`${colors.bg} border ${colors.border} rounded-xl p-4 cursor-pointer hover:shadow-md transition-all`}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 shadow-sm">
                                <span className={`text-2xl ${colors.accent}`} dangerouslySetInnerHTML={{ __html: sign.symbol }}></span>
                              </div>
                              <h4 className={`font-medium ${colors.text} mb-1`}>
                                {sign.name}
                              </h4>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                {sign.dates}
                              </p>
                              <div className="flex justify-center gap-1">
                                <span className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded-full text-slate-600 dark:text-slate-400">
                                  {sign.element}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {signs.map(([key, sign]) => {
                        const colors = getZodiacColors(key);
                        return (
                          <div
                            key={key}
                            onClick={() => setSelectedSign(key)}
                            className={`${colors.bg} border ${colors.border} rounded-lg p-3 cursor-pointer hover:shadow-md transition-all`}
                          >
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mr-3 shadow-sm flex-shrink-0">
                                <span className={`text-xl ${colors.accent}`} dangerouslySetInnerHTML={{ __html: sign.symbol }}></span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className={`font-medium ${colors.text}`}>
                                    {sign.name}
                                  </h4>
                                  <span className="text-xs bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400">
                                    {sign.element}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {sign.dates}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render sign detail view when a sign is selected
  const renderSignDetail = () => {
    if (!selectedSign) return null;
    
    const signKey = selectedSign;
    const sign = zodiacSigns[signKey];
    const colors = getZodiacColors(signKey);
    
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedSign(null)}
          className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back to All Signs
        </button>
        
        <div className={`${colors.bg} p-6 rounded-xl flex flex-col md:flex-row items-center gap-6`}>
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
              <span className={`text-4xl ${colors.accent}`} dangerouslySetInnerHTML={{ __html: sign.symbol }}></span>
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h3 className={`text-xl sm:text-2xl font-bold ${colors.text} mb-2`}>
              {sign.name}
            </h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm mb-1">
              {sign.dates}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
              <span className="text-xs font-medium bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full">
                Element: {sign.element}
              </span>
              <span className="text-xs font-medium bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full">
                Planet: {sign.ruling_planet}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {sign.description}
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <button
              onClick={() => toggleSection('strengths')}
              className="w-full flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-300 font-medium"
            >
              <span className="flex items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                Strengths
              </span>
              {expandedSection === 'strengths' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            
            {expandedSection === 'strengths' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-2 space-y-2">
                {sign.details.strengths.split(', ').map((strength, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-2"
                  >
                    <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 mt-2"></div>
                    <p className="text-slate-700 dark:text-slate-300">{strength}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <button
              onClick={() => toggleSection('weaknesses')}
              className="w-full flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300 font-medium"
            >
              <span className="flex items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                </svg>
                Weaknesses
              </span>
              {expandedSection === 'weaknesses' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            
            {expandedSection === 'weaknesses' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-2 space-y-2">
                {sign.details.weaknesses.split(', ').map((weakness, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-2"
                  >
                    <div className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400 mt-2"></div>
                    <p className="text-slate-700 dark:text-slate-300">{weakness}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <button
              onClick={() => toggleSection('compatibility')}
              className="w-full flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-700 dark:text-blue-300 font-medium"
            >
              <span className="flex items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              Compatibility
            </span>
            {expandedSection === 'compatibility' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSection === 'compatibility' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-2">
              <p className="text-slate-700 dark:text-slate-300 mb-3">Most compatible with:</p>
              <div className="flex flex-wrap gap-2">
                {sign.details.compatibility.split(', ').map((compatSign, index) => {
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
            </div>
          )}
        </div>
        
        <div>
          <button
            onClick={() => toggleSection('love')}
            className="w-full flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300 font-medium"
          >
            <span className="flex items-center">
              <Heart size={18} className="mr-2" />
              Love & Relationships
            </span>
            {expandedSection === 'love' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSection === 'love' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-2">
              <p className="text-slate-700 dark:text-slate-300">{sign.details.love}</p>
            </div>
          )}
        </div>
        
        <div>
          <button
            onClick={() => toggleSection('career')}
            className="w-full flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-700 dark:text-amber-300 font-medium"
          >
            <span className="flex items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              Career
            </span>
            {expandedSection === 'career' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSection === 'career' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-2">
              <div className="grid grid-cols-2 gap-2">
                {sign.details.career.split(', ').map((career, index) => (
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
          )}
        </div>
        
        <div>
          <button
            onClick={() => toggleSection('wellness')}
            className="w-full flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-300 font-medium"
          >
            <span className="flex items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
              Wellness
            </span>
            {expandedSection === 'wellness' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSection === 'wellness' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-2">
              <p className="text-slate-700 dark:text-slate-300">{sign.details.wellness}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors">
      <div className="space-y-6">
        {selectedSign ? renderSignDetail() : renderLibraryView()}
      </div>
    </div>
  );
};

export default ZodiacLibrary;