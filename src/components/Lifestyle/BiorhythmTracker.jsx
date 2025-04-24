// src/components/Lifestyle/BiorhythmTracker.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Activity, Heart, Brain, BarChart2, Info, ChevronDown, ChevronUp, X } from 'lucide-react';
import { calculateBiorhythm, getBiorhythmDescriptions } from '../../utils/biorhythmUtils';
import { getStorage, setStorage } from '../../utils/storage';
import { formatDateForStorage } from '../../utils/dateUtils';
import BiorhythmChart from './BiorhythmChart';
import BiorhythmInfoCard from './BiorhythmInfoCard';

const BiorhythmTracker = () => {
  const [birthDate, setBirthDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [biorhythmData, setBiorhythmData] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [activeCycles, setActiveCycles] = useState(['physical', 'emotional', 'intellectual']);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load saved birth date from storage
  useEffect(() => {
    const storage = getStorage();
    if (storage.lifestyle?.birthDate) {
      setBirthDate(storage.lifestyle.birthDate);
    }
  }, []);

  // Calculate biorhythm when birth date or selected date changes
  useEffect(() => {
    if (birthDate) {
      const data = calculateBiorhythm(birthDate, selectedDate);
      setBiorhythmData(data);
    }
  }, [birthDate, selectedDate]);

  // Save birth date to storage
  const saveBirthDate = (date) => {
    const storage = getStorage();
    if (!storage.lifestyle) {
      storage.lifestyle = {};
    }
    storage.lifestyle.birthDate = date;
    setStorage(storage);
    setBirthDate(date);
  };

  // Navigate to different dates
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(selectedDate.getDate() - 1);
    setSelectedDate(previousDay);
  };

  // Toggle cycle visibility
  const toggleCycle = (cycle) => {
    if (activeCycles.includes(cycle)) {
      setActiveCycles(activeCycles.filter(c => c !== cycle));
    } else {
      setActiveCycles([...activeCycles, cycle]);
    }
  };

  // Format selected date for display
  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if selected date is today
  const isToday = formatDateForStorage(selectedDate) === formatDateForStorage(new Date());

  // Get biorhythm descriptions
  const biorhythmDescriptions = getBiorhythmDescriptions();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
            <BarChart2 className="text-purple-500 dark:text-purple-400" size={24} />
            Biorhythm Tracker
          </h2>
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
            aria-label="Show information"
          >
            <Info size={18} />
          </button>
        </div>

        {showInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-100 dark:border-blue-800/30">
            <div className="flex justify-between items-start">
              <h3 className="text-blue-800 dark:text-blue-300 font-medium mb-2 flex items-center">
                <Info size={16} className="mr-2" />
                About Biorhythms
              </h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30 p-1 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Biorhythms are cyclical patterns believed to influence physical, emotional, and intellectual capabilities. 
              While not scientifically validated, many people find them useful for self-reflection and planning.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-blue-200 dark:border-blue-800/40">
                <div className="flex items-center mb-1">
                  <Activity className="text-red-500 dark:text-red-400 mr-2" size={14} />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Physical: 23 days</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Influences strength, coordination, and physical resilience
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-blue-200 dark:border-blue-800/40">
                <div className="flex items-center mb-1">
                  <Heart className="text-blue-500 dark:text-blue-400 mr-2" size={14} />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Emotional: 28 days</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Affects creativity, sensitivity, and emotional stability
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-blue-200 dark:border-blue-800/40">
                <div className="flex items-center mb-1">
                  <Brain className="text-green-500 dark:text-green-400 mr-2" size={14} />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Intellectual: 33 days</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Governs memory, alertness, and cognitive function
                </p>
              </div>
            </div>
          </div>
        )}

        {birthDate ? (
          <div className="space-y-6">
            {/* Date navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={goToPreviousDay}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
                  {isToday ? 'Today' : formatSelectedDate()}
                </h3>
                {!isToday && (
                  <button
                    onClick={goToToday}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Go to Today
                  </button>
                )}
              </div>
              
              <button
                onClick={goToNextDay}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            {/* Biorhythm Chart */}
            <BiorhythmChart 
              birthDate={birthDate}
              selectedDate={selectedDate}
              cycles={activeCycles}
            />
            
            {/* Biorhythm values and interpretations */}
            {biorhythmData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BiorhythmInfoCard biorhythmData={biorhythmData} type="physical" />
                <BiorhythmInfoCard biorhythmData={biorhythmData} type="emotional" />
                <BiorhythmInfoCard biorhythmData={biorhythmData} type="intellectual" />
                <BiorhythmInfoCard biorhythmData={biorhythmData} type="average" />
              </div>
            )}
            
            {/* Settings button */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-2">
                <button
                  onClick={() => toggleCycle('physical')}
                  className={`px-2 py-1 rounded-md text-xs flex items-center ${
                    activeCycles.includes('physical')
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Activity size={12} className="mr-1" />
                  Physical
                </button>
                <button
                  onClick={() => toggleCycle('emotional')}
                  className={`px-2 py-1 rounded-md text-xs flex items-center ${
                    activeCycles.includes('emotional')
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Heart size={12} className="mr-1" />
                  Emotional
                </button>
                <button
                  onClick={() => toggleCycle('intellectual')}
                  className={`px-2 py-1 rounded-md text-xs flex items-center ${
                    activeCycles.includes('intellectual')
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Brain size={12} className="mr-1" />
                  Intellectual
                </button>
              </div>
              
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="text-sm text-slate-600 dark:text-slate-400 flex items-center"
              >
                Settings
                {isSettingsOpen ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
              </button>
            </div>
            
            {/* Settings panel */}
            {isSettingsOpen && (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mt-2">
                <div className="mb-4">
                  <label htmlFor="birth-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Update Birth Date
                  </label>
                  <div className="flex">
                    <input
                      type="date"
                      id="birth-date"
                      value={birthDate}
                      onChange={(e) => saveBirthDate(e.target.value)}
                      className="flex-1 p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400 mr-2">Show Combined Average:</span>
                  <button
                    onClick={() => toggleCycle('average')}
                    className={`px-2 py-1 rounded-md text-xs flex items-center ${
                      activeCycles.includes('average')
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <BarChart2 size={12} className="mr-1" />
                    {activeCycles.includes('average') ? 'Shown' : 'Hidden'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-purple-500 dark:text-purple-400" />
            <h3 className="text-slate-800 dark:text-slate-100 font-medium mb-2">Enter Your Birth Date</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
              To calculate your biorhythm cycles, we need your birth date.
            </p>
            <div className="flex justify-center">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => saveBirthDate(e.target.value)}
                className="p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Biorhythm Theory Explanation */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Info className="text-blue-500 dark:text-blue-400" size={20} />
          Understanding Biorhythms
        </h3>
        
        <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm">
          <p>
            Biorhythm theory suggests that our physical, emotional, and intellectual capabilities follow regular sine wave cycles of different lengths, starting from birth.
          </p>
          
          <div className="space-y-3">
            {Object.keys(biorhythmDescriptions).filter(key => key !== 'average').map((key) => {
              const cycle = biorhythmDescriptions[key];
              return (
                <div key={key} className="flex items-start gap-2">
                  {key === 'physical' && <Activity className="text-red-500 dark:text-red-400 mt-1 flex-shrink-0" size={16} />}
                  {key === 'emotional' && <Heart className="text-blue-500 dark:text-blue-400 mt-1 flex-shrink-0" size={16} />}
                  {key === 'intellectual' && <Brain className="text-green-500 dark:text-green-400 mt-1 flex-shrink-0" size={16} />}
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {cycle.title} ({cycle.cycle})
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {cycle.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <p className="text-sm italic">
              <strong>Note:</strong> While biorhythms are popular in personal development, they are not scientifically validated. Use these insights as a complementary tool for self-awareness rather than definitive predictions.
            </p>
          </div>
        </div>
      </div>
      
      {/* How to Use Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          How to Use Biorhythm Insights
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">On Peak Days</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5">
              <li>Schedule activities matching your peak cycle (physical exercise, emotional connections, intellectual work)</li>
              <li>Take on more challenging tasks related to that dimension</li>
              <li>Use your natural strengths during these periods</li>
            </ul>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">On Critical Days</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5">
              <li>Be more cautious with decisions in that particular area</li>
              <li>Pay extra attention to details and double-check your work</li>
              <li>Consider postponing high-stakes activities if possible</li>
              <li>Practice mindfulness and self-awareness</li>
            </ul>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">For Physical Cycle</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5">
              <li>Plan workouts and physical activities around high days</li>
              <li>Schedule recovery and lighter activities on low days</li>
              <li>Be extra careful with sports and physical tasks on critical days</li>
            </ul>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">For Emotional Cycle</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5">
              <li>Schedule important social events on high days</li>
              <li>Practice extra self-care during low periods</li>
              <li>Be mindful of your reactions on critical days</li>
              <li>Use high days for creative expression and connection</li>
            </ul>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">For Intellectual Cycle</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5">
              <li>Schedule complex problem-solving on high days</li>
              <li>Save routine tasks for lower periods</li>
              <li>Double-check important decisions on critical days</li>
              <li>Take advantage of peak days for learning and strategy</li>
            </ul>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">For Personal Growth</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5">
              <li>Track patterns over time to better understand yourself</li>
              <li>Develop strategies for your personal low periods</li>
              <li>Learn to leverage your natural cycles rather than fight them</li>
              <li>Use this data alongside other wellness tracking for a complete picture</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiorhythmTracker;