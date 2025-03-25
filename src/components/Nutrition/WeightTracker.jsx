import React, { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../../utils/storage';
import { Scale, TrendingUp, TrendingDown, Calendar, Target, PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WeightTracker = ({ planId = null }) => {
  const [weightEntries, setWeightEntries] = useState([]);
  const [weightGoal, setWeightGoal] = useState(null);
  const [newWeight, setNewWeight] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  
  // Load weight data on component mount
  useEffect(() => {
    loadWeightData();
  }, [planId]);
  
  // Load weight data from storage
  const loadWeightData = () => {
    const storage = getStorage();
    
    // Initialize weight data if not exists
    if (!storage.weightData) {
      storage.weightData = {
        entries: [],
        goals: {},
        unit: 'kg'
      };
      setStorage(storage);
    }
    
    // Load entries and goal
    setWeightEntries(storage.weightData.entries || []);
    setWeightGoal(planId ? storage.weightData.goals[planId] : storage.weightData.currentGoal);
    setWeightUnit(storage.weightData.unit || 'kg');
  };
  
  // Add a new weight entry
  const handleAddWeight = (e) => {
    e.preventDefault();
    
    if (!newWeight || isNaN(parseFloat(newWeight))) return;
    
    const storage = getStorage();
    
    if (!storage.weightData) {
      storage.weightData = { entries: [], goals: {}, unit: weightUnit };
    }
    
    const newEntry = {
      id: Date.now().toString(),
      weight: parseFloat(newWeight),
      date: new Date().toISOString(),
      unit: weightUnit
    };
    
    if (planId) {
      newEntry.planId = planId;
    }
    
    // Check if we're editing an existing entry
    if (editingEntry) {
      storage.weightData.entries = storage.weightData.entries.map(entry => 
        entry.id === editingEntry.id ? { ...newEntry, id: entry.id } : entry
      );
    } else {
      // Add new entry
      storage.weightData.entries.push(newEntry);
    }
    
    // Sort entries by date
    storage.weightData.entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Update storage
    setStorage(storage);
    
    // Update state
    setWeightEntries(storage.weightData.entries);
    setNewWeight('');
    setEditingEntry(null);
  };
  
  // Set weight goal
  const handleSetGoal = (e) => {
    e.preventDefault();
    
    if (!newGoal || isNaN(parseFloat(newGoal))) return;
    
    const storage = getStorage();
    
    if (!storage.weightData) {
      storage.weightData = { entries: [], goals: {}, unit: weightUnit };
    }
    
    if (!storage.weightData.goals) {
      storage.weightData.goals = {};
    }
    
    // Set goal for specific plan or as current goal
    if (planId) {
      storage.weightData.goals[planId] = parseFloat(newGoal);
    } else {
      storage.weightData.currentGoal = parseFloat(newGoal);
    }
    
    // Update storage
    setStorage(storage);
    
    // Update state
    setWeightGoal(parseFloat(newGoal));
    setNewGoal('');
    setShowGoalForm(false);
  };
  
  // Change weight unit
  const handleUnitChange = (unit) => {
    // Convert existing weights if unit changes
    const storage = getStorage();
    
    if (!storage.weightData) {
      storage.weightData = { entries: [], goals: {}, unit };
      setStorage(storage);
      setWeightUnit(unit);
      return;
    }
    
    const currentUnit = storage.weightData.unit || 'kg';
    
    if (currentUnit !== unit) {
      // Convert all weights
      storage.weightData.entries = storage.weightData.entries.map(entry => {
        const weight = entry.unit === unit ? entry.weight :
                      unit === 'kg' ? entry.weight * 0.453592 : // lbs to kg
                      entry.weight * 2.20462; // kg to lbs
        
        return {
          ...entry,
          weight: parseFloat(weight.toFixed(1)),
          unit
        };
      });
      
      // Convert goals
      if (storage.weightData.currentGoal) {
        storage.weightData.currentGoal = unit === 'kg' 
          ? storage.weightData.currentGoal * 0.453592
          : storage.weightData.currentGoal * 2.20462;
      }
      
      // Convert plan-specific goals
      if (storage.weightData.goals) {
        Object.keys(storage.weightData.goals).forEach(key => {
          storage.weightData.goals[key] = unit === 'kg'
            ? storage.weightData.goals[key] * 0.453592
            : storage.weightData.goals[key] * 2.20462;
        });
      }
      
      // Update unit
      storage.weightData.unit = unit;
      
      // Update storage
      setStorage(storage);
      
      // Update state
      setWeightEntries(storage.weightData.entries);
      setWeightGoal(planId ? storage.weightData.goals[planId] : storage.weightData.currentGoal);
      setWeightUnit(unit);
    }
  };
  
  // Delete weight entry
  const handleDeleteEntry = (entryId) => {
    if (!entryId) return;
    
    const storage = getStorage();
    
    if (!storage.weightData || !storage.weightData.entries) return;
    
    // Filter out the entry
    storage.weightData.entries = storage.weightData.entries.filter(entry => entry.id !== entryId);
    
    // Update storage
    setStorage(storage);
    
    // Update state
    setWeightEntries(storage.weightData.entries);
  };
  
  // Edit weight entry
  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setNewWeight(entry.weight.toString());
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Filter entries relevant to this plan if planId is provided
  const filteredEntries = planId 
    ? weightEntries.filter(entry => !entry.planId || entry.planId === planId)
    : weightEntries;
  
  // Calculate weight change stats
  const calculateWeightChange = () => {
    if (filteredEntries.length < 2) return { amount: 0, percentage: 0 };
    
    const firstEntry = filteredEntries[0];
    const lastEntry = filteredEntries[filteredEntries.length - 1];
    
    const change = lastEntry.weight - firstEntry.weight;
    const percentage = (change / firstEntry.weight) * 100;
    
    return {
      amount: parseFloat(change.toFixed(1)),
      percentage: parseFloat(percentage.toFixed(1))
    };
  };
  
  // Calculate progress towards goal
  const calculateGoalProgress = () => {
    if (!weightGoal || filteredEntries.length === 0) return 0;
    
    const lastEntry = filteredEntries[filteredEntries.length - 1];
    const firstEntry = filteredEntries[0];
    
    // If goal is higher than starting weight (gain)
    if (weightGoal > firstEntry.weight) {
      const totalToGain = weightGoal - firstEntry.weight;
      const gained = lastEntry.weight - firstEntry.weight;
      return Math.min(100, Math.max(0, (gained / totalToGain) * 100));
    } 
    // If goal is lower than starting weight (loss)
    else {
      const totalToLose = firstEntry.weight - weightGoal;
      const lost = firstEntry.weight - lastEntry.weight;
      return Math.min(100, Math.max(0, (lost / totalToLose) * 100));
    }
  };
  
  // Prepare data for chart
  const chartData = filteredEntries.map(entry => ({
    date: formatDate(entry.date),
    weight: entry.weight
  }));
  
  // Add goal line to chart if goal exists
  if (weightGoal) {
    chartData.forEach(data => {
      data.goal = weightGoal;
    });
  }
  
  const weightChange = calculateWeightChange();
  const goalProgress = calculateGoalProgress();
  
  return (
    <div className="space-y-6">
      {/* Weight Form */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Scale size={18} className="text-blue-500 dark:text-blue-400" />
            Track Your Weight
          </h3>
          <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
            <button
              onClick={() => handleUnitChange('kg')}
              className={`px-3 py-1 text-xs font-medium ${
                weightUnit === 'kg' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              kg
            </button>
            <button
              onClick={() => handleUnitChange('lbs')}
              className={`px-3 py-1 text-xs font-medium ${
                weightUnit === 'lbs' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              lbs
            </button>
          </div>
        </div>
        <div className="p-4">
          <form onSubmit={handleAddWeight} className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder={`Enter weight in ${weightUnit}`}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {editingEntry ? 'Update' : 'Add'}
            </button>
          </form>
          
          {/* Weight Goal */}
          <div className="mt-4">
            {!weightGoal && !showGoalForm ? (
              <button
                onClick={() => setShowGoalForm(true)}
                className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                <Target size={16} />
                Set Weight Goal
              </button>
            ) : showGoalForm ? (
              <form onSubmit={handleSetGoal} className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.1"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder={`Goal weight in ${weightUnit}`}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Set Goal
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-green-500 dark:text-green-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Goal: {weightGoal} {weightUnit}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowGoalForm(true);
                    setNewGoal(weightGoal.toString());
                  }}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Weight Stats */}
      {filteredEntries.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="bg-green-50 dark:bg-green-900/30 p-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-medium text-slate-800 dark:text-slate-100">Weight Summary</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-xs text-slate-500 dark:text-slate-400">Current</div>
                <div className="font-semibold text-slate-800 dark:text-slate-100">
                  {filteredEntries[filteredEntries.length - 1].weight} {weightUnit}
                </div>
              </div>
              
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-xs text-slate-500 dark:text-slate-400">Starting</div>
                <div className="font-semibold text-slate-800 dark:text-slate-100">
                  {filteredEntries[0].weight} {weightUnit}
                </div>
              </div>
              
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-xs text-slate-500 dark:text-slate-400">Change</div>
                <div className="font-semibold flex items-center">
                  {weightChange.amount === 0 ? (
                    <span className="text-slate-800 dark:text-slate-100">No change</span>
                  ) : weightChange.amount > 0 ? (
                    <>
                      <TrendingUp size={16} className="text-red-500 mr-1" />
                      <span className="text-red-500">+{weightChange.amount} {weightUnit}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown size={16} className="text-green-500 mr-1" />
                      <span className="text-green-500">{weightChange.amount} {weightUnit}</span>
                    </>
                  )}
                </div>
              </div>
              
              {weightGoal && (
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Goal Progress</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">
                    {goalProgress.toFixed(0)}%
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-green-500 dark:bg-green-600 rounded-full transition-all duration-300"
                      style={{ width: `${goalProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Weight Chart */}
            <div className="h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={['dataMin - 5', 'dataMax + 5']}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    name={`Weight (${weightUnit})`}
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ stroke: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                  {weightGoal && (
                    <Line 
                      type="monotone" 
                      dataKey="goal" 
                      name={`Goal (${weightUnit})`}
                      stroke="#10B981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      
      {/* Weight History */}
      {filteredEntries.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-700/50 p-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-medium text-slate-800 dark:text-slate-100">Weight History</h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-80 overflow-y-auto">
            {filteredEntries.slice().reverse().map((entry, index) => (
              <div key={entry.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <div className="flex items-center gap-3">
                  <div className="text-slate-500 dark:text-slate-400">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-slate-700 dark:text-slate-300">
                      {entry.weight} {weightUnit}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(entry.date)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditEntry(entry)}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightTracker;