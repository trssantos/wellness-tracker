import React, { useState } from 'react';
import { Search, Grid, List, Brain, ArrowLeft, ChevronDown, ChevronUp, X, ThumbsUp, ThumbsDown, Briefcase, Users, Coffee } from 'lucide-react';

// This component will need the personality type data
// We can either import it or pass it as props
const PersonalityTypeLibrary = ({ personalityTypes, onClose, currentType = null }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(currentType);
  const [expandedSection, setExpandedSection] = useState(null);
  
  // Group personality types by categories
  const typeCategories = {
    'Analysts': ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
    'Diplomats': ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
    'Sentinels': ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
    'Explorers': ['ISTP', 'ISFP', 'ESTP', 'ESFP']
  };

  // Helper function to get background color class based on personality category
  const getTypeColorClass = (type) => {
    if (typeCategories.Analysts.includes(type)) return 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800/50';
    if (typeCategories.Diplomats.includes(type)) return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800/50';
    if (typeCategories.Sentinels.includes(type)) return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50';
    if (typeCategories.Explorers.includes(type)) return 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/50';
    return 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600';
  };

  // Helper function to get text color class based on personality category
  const getTypeTextColorClass = (type) => {
    if (typeCategories.Analysts.includes(type)) return 'text-purple-700 dark:text-purple-300';
    if (typeCategories.Diplomats.includes(type)) return 'text-green-700 dark:text-green-300';
    if (typeCategories.Sentinels.includes(type)) return 'text-blue-700 dark:text-blue-300';
    if (typeCategories.Explorers.includes(type)) return 'text-amber-700 dark:text-amber-300';
    return 'text-slate-700 dark:text-slate-300';
  };

  // Filter types based on search query
  const filteredTypes = Object.keys(personalityTypes).filter(type => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const typeData = personalityTypes[type];
    return (
      type.toLowerCase().includes(query) ||
      typeData.name.toLowerCase().includes(query) ||
      typeData.description.toLowerCase().includes(query)
    );
  });

  // Toggle section expansion
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Render type detail view
  const renderTypeDetail = () => {
    if (!selectedType) return null;
    
    const typeData = personalityTypes[selectedType];
    const colorClass = getTypeColorClass(selectedType);
    const textColorClass = getTypeTextColorClass(selectedType);
    
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setSelectedType(null)}
            className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back to All Types
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className={`${colorClass} p-6 rounded-xl flex flex-col md:flex-row items-center gap-6`}>
          <div className="flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{selectedType}</span>
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h3 className={`text-xl sm:text-2xl font-bold ${textColorClass} mb-2 break-words`}>
              {typeData.name}
            </h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base break-words">
              {typeData.description}
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
                <ThumbsUp size={18} className="mr-2" />
                Strengths
              </span>
              {expandedSection === 'strengths' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            
            {expandedSection === 'strengths' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-2 space-y-2">
                {typeData.details.strengths.split(', ').map((strength, index) => (
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
                <ThumbsDown size={18} className="mr-2" />
                Potential Blind Spots
              </span>
              {expandedSection === 'weaknesses' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            
            {expandedSection === 'weaknesses' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-2 space-y-2">
                {typeData.details.weaknesses.split(', ').map((weakness, index) => (
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
              onClick={() => toggleSection('careers')}
              className="w-full flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-700 dark:text-blue-300 font-medium"
            >
              <span className="flex items-center">
                <Briefcase size={18} className="mr-2" />
                Career Paths
              </span>
              {expandedSection === 'careers' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            
            {expandedSection === 'careers' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {typeData.details.careers.split(', ').map((career, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-2"
                    >
                      <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 mt-2"></div>
                      <p className="text-slate-700 dark:text-slate-300">{career}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div>
            <button
              onClick={() => toggleSection('relationships')}
              className="w-full flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-700 dark:text-purple-300 font-medium"
            >
              <span className="flex items-center">
                <Users size={18} className="mr-2" />
                Relationships
              </span>
              {expandedSection === 'relationships' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            
            {expandedSection === 'relationships' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-2 space-y-4">
                <p className="text-slate-700 dark:text-slate-300">{typeData.details.relationships}</p>
                <h4 className="font-medium text-slate-800 dark:text-slate-200 mt-2">Compatibility</h4>
                <p className="text-slate-700 dark:text-slate-300">{typeData.details.compatibility}</p>
              </div>
            )}
          </div>
          
          <div>
            <button
              onClick={() => toggleSection('hobbies')}
              className="w-full flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-700 dark:text-amber-300 font-medium"
            >
              <span className="flex items-center">
                <Coffee size={18} className="mr-2" />
                Hobbies & Activities
              </span>
              {expandedSection === 'hobbies' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            
            {expandedSection === 'hobbies' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {typeData.details.hobbies.split(', ').map((hobby, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-2"
                    >
                      <div className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 mt-2"></div>
                      <p className="text-slate-700 dark:text-slate-300">{hobby}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render grid or list view of all types
  const renderTypesList = () => {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 space-y-6">
        {/* Header with search and view toggles */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Brain className="text-purple-500 dark:text-purple-400" size={24} />
            Personality Type Library
          </h2>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search types..."
                className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 w-full sm:w-auto"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            </div>
            
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600' : ''}`}
                title="Grid view"
              >
                <Grid size={18} className="text-slate-600 dark:text-slate-300" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-600' : ''}`}
                title="List view"
              >
                <List size={18} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Category sections */}
        <div className="space-y-8">
          {Object.entries(typeCategories).map(([category, types]) => {
            const filteredCategoryTypes = types.filter(type => filteredTypes.includes(type));
            if (filteredCategoryTypes.length === 0) return null;
            
            return (
              <div key={category} className="space-y-3">
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                  {category}
                </h3>
                
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {filteredCategoryTypes.map(type => (
                      <div
                        key={type}
                        className={`${getTypeColorClass(type)} border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md`}
                        onClick={() => setSelectedType(type)}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 shadow-sm">
                            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{type}</span>
                          </div>
                          <h4 className={`font-medium ${getTypeTextColorClass(type)} mb-1`}>
                            {personalityTypes[type].name}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {personalityTypes[type].description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredCategoryTypes.map(type => (
                      <div
                        key={type}
                        className={`${getTypeColorClass(type)} border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md`}
                        onClick={() => setSelectedType(type)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mr-3 shadow-sm flex-shrink-0">
                            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{type}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${getTypeTextColorClass(type)}`}>
                              {personalityTypes[type].name}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                              {personalityTypes[type].description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredTypes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">No personality types found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {selectedType ? renderTypeDetail() : renderTypesList()}
    </div>
  );
};

export default PersonalityTypeLibrary;