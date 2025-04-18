import React, { useState, useEffect } from 'react';
import { Award, ChevronDown, ChevronUp, Dumbbell, Clock, Route, Calendar } from 'lucide-react';
import { getPersonalRecords } from '../../utils/workoutUtils';
import { getWeightUnit, getDistanceUnit } from '../../utils/storage';

const PersonalRecords = ({ workoutType, exerciseFilter = [] }) => {
  const [records, setRecords] = useState({});
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [showComponent, setShowComponent] = useState(false);
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [distanceUnit, setDistanceUnit] = useState('km');

  // Load records on mount
  useEffect(() => {
    const personalRecords = getPersonalRecords();
    setRecords(personalRecords);
    
    // Set user preferences
    setWeightUnit(getWeightUnit());
    setDistanceUnit(getDistanceUnit());

    // Filter records if needed
    filterRecords(personalRecords);
  }, [workoutType, exerciseFilter]);

  // Filter records based on props
  const filterRecords = (allRecords) => {
    let filtered = Object.entries(allRecords).map(([name, record]) => ({
      name,
      ...record
    }));
    
    // Filter by workout type (strength vs cardio)
    if (workoutType) {
      const isCardioType = ['running', 'walking', 'cycling', 'swimming', 'cardio', 'hiit'].includes(workoutType);
      
      filtered = filtered.filter(record => 
        isCardioType ? record.isDurationBased : !record.isDurationBased
      );
    }
    
    // Filter by specific exercises if provided
    if (exerciseFilter && exerciseFilter.length > 0) {
      filtered = filtered.filter(record => 
        exerciseFilter.some(ex => ex.toLowerCase() === record.name.toLowerCase())
      );
    }
    
    // Sort by most recent records first
    filtered.sort((a, b) => {
      const dateA = new Date(Math.max(
        a.maxWeightDate || 0, 
        a.maxDurationDate || 0, 
        a.maxDistanceDate || 0,
        a.bestPaceDate || 0
      ));
      
      const dateB = new Date(Math.max(
        b.maxWeightDate || 0, 
        b.maxDurationDate || 0, 
        b.maxDistanceDate || 0,
        b.bestPaceDate || 0
      ));
      
      return dateB - dateA;
    });
    
    setFilteredRecords(filtered);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    return new Date(date).toLocaleDateString('default', {
      month: 'short',
      day: 'numeric',
      year: new Date(date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // Format time in seconds to mm:ss
  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format pace (seconds per distance unit)
  const formatPace = (secondsPerUnit) => {
    if (!secondsPerUnit) return 'N/A';
    
    const mins = Math.floor(secondsPerUnit / 60);
    const secs = Math.round(secondsPerUnit % 60);
    return `${mins}:${secs.toString().padStart(2, '0')} min/${distanceUnit}`;
  };

  // Check if we have any records to show
  const hasRecords = filteredRecords.length > 0;

  return (
    <div className="personal-records mb-4">
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {/* Header with toggle */}
        <div 
          className="p-4 bg-slate-50 dark:bg-slate-700/50 flex justify-between items-center cursor-pointer"
          onClick={() => setShowComponent(!showComponent)}
        >
          <h3 className="font-medium flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Award size={18} className="text-amber-500 dark:text-amber-400" />
            Personal Records
          </h3>
          {showComponent ? 
            <ChevronUp size={20} className="text-slate-500 dark:text-slate-400" /> :
            <ChevronDown size={20} className="text-slate-500 dark:text-slate-400" />
          }
        </div>

        {/* Records content */}
        {showComponent && (
          <div className="p-4">
            {!hasRecords ? (
              <div className="text-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-slate-600 dark:text-slate-400">
                  Complete more workouts to see your personal records.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Strength exercise records */}
                {filteredRecords.filter(record => !record.isDurationBased).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                      <Dumbbell size={16} className="text-blue-500 dark:text-blue-400" />
                      Strength Records
                    </h4>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white dark:bg-slate-800 text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                          <tr>
                            <th className="py-2 px-3 text-left">Exercise</th>
                            <th className="py-2 px-3 text-right">Max Weight</th>
                            <th className="py-2 px-3 text-right">Max Reps</th>
                            <th className="py-2 px-3 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {filteredRecords
                            .filter(record => !record.isDurationBased)
                            .map(record => (
                              <tr key={record.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <td className="py-2 px-3">{record.name}</td>
                                <td className="py-2 px-3 text-right font-medium">
                                  {record.maxWeight > 0 ? `${record.maxWeight} ${weightUnit}` : 'N/A'}
                                </td>
                                <td className="py-2 px-3 text-right font-medium">
                                  {record.maxReps > 0 ? record.maxReps : 'N/A'}
                                </td>
                                <td className="py-2 px-3 text-right text-slate-500 dark:text-slate-400">
                                  {formatDate(record.maxWeightDate || record.maxRepsDate)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Cardio/Duration exercise records */}
                {filteredRecords.filter(record => record.isDurationBased).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                      <Route size={16} className="text-green-500 dark:text-green-400" />
                      Cardio Records
                    </h4>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white dark:bg-slate-800 text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                          <tr>
                            <th className="py-2 px-3 text-left">Exercise</th>
                            <th className="py-2 px-3 text-right">Max Duration</th>
                            <th className="py-2 px-3 text-right">Max Distance</th>
                            <th className="py-2 px-3 text-right">Best Pace</th>
                            <th className="py-2 px-3 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {filteredRecords
                            .filter(record => record.isDurationBased)
                            .map(record => (
                              <tr key={record.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <td className="py-2 px-3">{record.name}</td>
                                <td className="py-2 px-3 text-right font-medium">
                                  {record.maxDuration > 0 ? formatTime(record.maxDuration) : 'N/A'}
                                </td>
                                <td className="py-2 px-3 text-right font-medium">
                                  {record.maxDistance > 0 ? `${record.maxDistance} ${distanceUnit}` : 'N/A'}
                                </td>
                                <td className="py-2 px-3 text-right font-medium">
                                  {formatPace(record.bestPace)}
                                </td>
                                <td className="py-2 px-3 text-right text-slate-500 dark:text-slate-400">
                                  {formatDate(record.maxDurationDate || record.maxDistanceDate || record.bestPaceDate)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Records are calculated from all your completed workouts</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalRecords;