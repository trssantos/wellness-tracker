import React, { useState, useEffect } from 'react';
import { 
  PiggyBank, Edit, Trash2, Plus, CheckCircle, Calendar, ArrowUp,
  Banknote, Settings, Award, DollarSign
} from 'lucide-react';
import { 
  getFinanceData, deleteSavingsGoal, contributeSavingsGoal, getCategoryColor 
} from '../../utils/financeUtils';
import EditSavingsGoalModal from './EditSavingsGoalModal';
import ContributeModal from './ContributeModal';
import ConfirmationModal from './ConfirmationModal';
import './SavingsGoals.css'; // We'll create this file for the animations

const SavingsGoals = ({ compact = false, refreshTrigger = 0, onRefresh, currency = '$' }) => {
  // State variables
  const [goals, setGoals] = useState([]);
  const [editingGoal, setEditingGoal] = useState(null);
  const [contributingGoal, setContributingGoal] = useState(null);
  const [animatingGoal, setAnimatingGoal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch savings goals on initial render and when refreshTrigger changes
  useEffect(() => {
    const financeData = getFinanceData();
    setGoals(financeData.savingsGoals);
  }, [refreshTrigger]);

  // Handle delete goal
  const handleDeleteGoal = (goal) => {
    setConfirmDelete(goal);
  };

  // Confirm deletion
  const confirmDeleteGoal = () => {
    if (confirmDelete) {
      deleteSavingsGoal(confirmDelete.id);
      setConfirmDelete(null);
      if (onRefresh) onRefresh();
    }
  };

  // Handle edit goal
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
  };

  // Handle edit complete
  const handleEditComplete = () => {
    setEditingGoal(null);
    if (onRefresh) onRefresh();
  };

  // Handle contribute
  const handleContribute = (goal) => {
    setContributingGoal(goal);
  };

  // Handle contribution complete
  const handleContributionComplete = (goalId, amount) => {
    setContributingGoal(null);
    setAnimatingGoal(goalId);
    
    // Reset animation state after 3 seconds
    setTimeout(() => {
      setAnimatingGoal(null);
    }, 3000);
    
    if (onRefresh) onRefresh();
  };

  // Format currency amount
  const formatCurrency = (amount) => {
    return `${currency}${parseFloat(amount).toFixed(2)}`;
  };

  // Calculate percentage of goal completed
  const calculatePercentage = (current, target) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Handle color mapping for dark mode
  const getDarkModeBackground = (color) => {
    // Mapping from color name to appropriate dark mode background
    const darkModeColors = {
      'blue': 'bg-blue-900/40',
      'green': 'bg-green-900/40',
      'amber': 'bg-amber-900/40',
      'purple': 'bg-purple-900/40',
      'red': 'bg-red-900/40',
      'pink': 'bg-pink-900/40',
      'indigo': 'bg-indigo-900/40',
      'teal': 'bg-teal-900/40'
    };
    
    return darkModeColors[color] || 'bg-blue-900/40';
  };

  // Handle button color for dark mode
  const getDarkModeButtonBg = (color) => {
    // Mapping from color name to appropriate dark mode button background
    const buttonColors = {
      'blue': 'bg-blue-600',
      'green': 'bg-green-600',
      'amber': 'bg-amber-600',
      'purple': 'bg-purple-600',
      'red': 'bg-red-600',
      'pink': 'bg-pink-600',
      'indigo': 'bg-indigo-600',
      'teal': 'bg-teal-600'
    };
    
    return buttonColors[color] || 'bg-blue-600';
  };

  // If compact mode, show simplified view
  if (compact) {
    const displayGoals = goals.slice(0, 3);
    
    return (
      <div className="space-y-6 mb-6">
        {displayGoals.length > 0 ? (
          displayGoals.map((goal) => {
            const percentage = calculatePercentage(goal.current, goal.target);
            const isComplete = goal.current >= goal.target;
            const color = goal.color || 'blue';
            
            return (
              <div key={goal.id} className={`bg-${color}-100 dark:${getDarkModeBackground(color)} rounded-lg p-4 relative overflow-hidden ${animatingGoal === goal.id ? 'goal-contributing' : ''}`}>
                {/* Piggy bank animation */}
                {animatingGoal === goal.id && (
                  <div className="piggy-animation">
                    <PiggyBank size={40} className={`piggy text-${color}-500 dark:text-${color}-400`} />
                    <div className="coins">
                      <div className="coin"></div>
                      <div className="coin"></div>
                      <div className="coin"></div>
                    </div>
                  </div>
                )}
                
                {/* Visual coin pile - static view */}
                <div className="absolute right-4 bottom-4 opacity-10">
                  <PiggyBank size={60} className={`text-${color}-300 dark:text-${color}-400`} />
                </div>
                
                <div className="flex justify-between items-start mb-2">
                  <h5 className="text-sm text-slate-900 dark:text-white">{goal.name}</h5>
                  <div className="text-right">
                    <div className={`font-bold text-lg text-${color}-600 dark:text-${color}-300`}>
                      {formatCurrency(goal.current)}
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      of {formatCurrency(goal.target)} goal
                    </div>
                  </div>
                </div>
                
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full bg-${color}-500 dark:bg-${color}-500 rounded-full finance-shimmer-effect`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300">{percentage}% complete</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {formatCurrency(goal.target - goal.current)} to go
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-slate-700 dark:text-slate-300 p-2">
            No savings goals found
          </div>
        )}
        
        <button
          onClick={onRefresh}
          className="w-full py-2 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-lg text-amber-600 dark:text-amber-400 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          View All Savings Goals
        </button>
      </div>
    );
  }

  // Full savings goals view
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h4 className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
          <PiggyBank className="text-amber-600 dark:text-amber-400" size={20} />
          Savings Goals
        </h4>
      </div>
      
      {/* Savings Goals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {goals.length > 0 ? (
          goals.map((goal) => {
            const percentage = calculatePercentage(goal.current, goal.target);
            const isComplete = goal.current >= goal.target;
            const color = goal.color || 'blue';
            
            return (
              <div 
                key={goal.id} 
                className={`bg-${color}-100 dark:${getDarkModeBackground(color)} rounded-lg p-5 relative overflow-hidden ${animatingGoal === goal.id ? 'goal-contributing' : ''}`}
              >
                {/* Completed badge */}
                {isComplete && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <CheckCircle size={12} className="mr-1" />
                    Completed
                  </div>
                )}
                
                {/* Piggy bank animation */}
                {animatingGoal === goal.id && (
                  <div className="piggy-animation">
                    <PiggyBank size={60} className="piggy" />
                    <div className="coins">
                      <div className="coin"></div>
                      <div className="coin"></div>
                      <div className="coin"></div>
                      <div className="coin"></div>
                      <div className="coin"></div>
                    </div>
                  </div>
                )}
                
                {/* Visual coin pile - static view */}
                <div className="absolute right-6 bottom-6 opacity-10">
                  <PiggyBank size={80} className={`text-${color}-300 dark:text-${color}-400`} />
                </div>
                
                <div className="mb-4">
                  <h5 className="text-xl font-medium text-slate-900 dark:text-white mb-1">{goal.name}</h5>
                  <div className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                    <Calendar size={14} className="mr-1" />
                    <span>Started {formatDate(goal.createdAt)}</span>
                    
                    {goal.targetDate && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Target: {formatDate(goal.targetDate)}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-sm text-slate-700 dark:text-slate-300">Progress</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {percentage}%
                    </div>
                  </div>
                  
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full bg-${color}-500 dark:bg-${color}-500 rounded-full finance-shimmer-effect`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                    
                    {/* Milestone markers (example at 25%, 50%, 75%) */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 opacity-50" style={{ marginLeft: '25%' }}></div>
                      <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 opacity-50" style={{ marginLeft: '25%' }}></div>
                      <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 opacity-50" style={{ marginLeft: '25%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">Saved</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatCurrency(goal.current)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-slate-700 dark:text-slate-300">Target</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatCurrency(goal.target)}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                  {formatCurrency(goal.target - goal.current)} left to reach your goal
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleContribute(goal)}
                    className={`flex-1 xs:flex-none px-3 py-1.5 bg-${color}-500 hover:bg-${color}-600 dark:${getDarkModeButtonBg(color)} dark:hover:bg-${color}-700 text-white rounded-lg text-sm flex items-center justify-center`}
                    disabled={isComplete}
                  >
                    <Banknote size={14} className="mr-1" /> Add Funds
                  </button>
                  
                  <button
                    onClick={() => handleEditGoal(goal)}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg text-sm flex items-center"
                  >
                    <Settings size={14} className="mr-1" /> Edit Goal
                  </button>
                  
                  <button
                    onClick={() => handleDeleteGoal(goal)}
                    className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/40 text-red-600 dark:text-red-300 rounded-lg text-sm flex items-center"
                  >
                    <Trash2 size={14} className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="md:col-span-2 text-center p-10 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className="inline-block p-4 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 mb-4">
              <PiggyBank size={40} />
            </div>
            <h5 className="text-xl font-medium text-slate-900 dark:text-white mb-2">No Savings Goals Yet</h5>
            <p className="text-slate-700 dark:text-slate-300 mb-6 max-w-md mx-auto">
              Start saving for your future by creating a savings goal. Track your progress and stay motivated.
            </p>
          </div>
        )}
      </div>
      
      {/* Achievement Card - show if there are completed goals */}
      {goals.filter(g => g.current >= g.target).length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-lg p-4 mt-8 text-white">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-full mr-4">
              <Award size={24} className="text-white" />
            </div>
            <div>
              <h5 className="font-medium text-lg">Financial Milestone Achieved!</h5>
              <p className="text-white/80 text-sm">
                You've completed {goals.filter(g => g.current >= g.target).length} savings goals. Great job!
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Goal Modal */}
      {editingGoal && (
        <EditSavingsGoalModal
          goal={editingGoal}
          onClose={() => setEditingGoal(null)}
          onGoalUpdated={handleEditComplete}
          currency={currency}
        />
      )}
      
      {/* Contribute Modal */}
      {contributingGoal && (
        <ContributeModal
          goal={contributingGoal}
          onClose={() => setContributingGoal(null)}
          onContribute={handleContributionComplete}
          currency={currency}
        />
      )}

      {/* Confirmation Modal */}
      {confirmDelete && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Savings Goal"
          message={`Are you sure you want to delete the "${confirmDelete.name}" savings goal (${formatCurrency(confirmDelete.target)})? This action cannot be undone.`}
          onConfirm={confirmDeleteGoal}
          onCancel={() => setConfirmDelete(null)}
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          confirmText="Delete"
        />
      )}
    </div>
  );
};

export default SavingsGoals;