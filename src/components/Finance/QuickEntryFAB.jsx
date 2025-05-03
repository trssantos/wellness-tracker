import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import QuickTransactionModal from './QuickTransactionModal';

const QuickEntryFAB = ({ onTransactionAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Handle toggle
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Handle quick income entry
  const handleIncomeClick = () => {
    setShowIncomeModal(true);
    setIsOpen(false);
  };

  // Handle quick expense entry
  const handleExpenseClick = () => {
    setShowExpenseModal(true);
    setIsOpen(false);
  };

  // Handle transaction added
  const handleTransactionComplete = () => {
    setShowIncomeModal(false);
    setShowExpenseModal(false);
    
    if (onTransactionAdded) {
      onTransactionAdded();
    }
  };

  return (
    <>
      {/* FAB Container - Ensure proper fixed positioning */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Quick access buttons */}
        {isOpen && (
          <>
            <button
              onClick={handleIncomeClick}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-full px-4 py-2 shadow-lg animate-fadeIn"
              style={{ animationDelay: '0.1s' }}
            >
              <TrendingUp size={18} />
              <span className="font-medium">Income</span>
            </button>
            
            <button
              onClick={handleExpenseClick}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-full px-4 py-2 shadow-lg animate-fadeIn"
              style={{ animationDelay: '0.2s' }}
            >
              <TrendingDown size={18} />
              <span className="font-medium">Expense</span>
            </button>
          </>
        )}
        
        {/* Main FAB */}
        <button
          onClick={handleToggle}
          className={`p-4 rounded-full shadow-lg transition-all duration-300 ${
            isOpen 
              ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 rotate-45' 
              : 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700'
          }`}
        >
          <Plus size={24} className="text-white transition-transform duration-300" />
        </button>
      </div>
      
      {/* Quick Transaction Modals */}
      {showIncomeModal && (
        <QuickTransactionModal
          type="income"
          onClose={() => setShowIncomeModal(false)}
          onTransactionAdded={handleTransactionComplete}
        />
      )}
      
      {showExpenseModal && (
        <QuickTransactionModal
          type="expense"
          onClose={() => setShowExpenseModal(false)}
          onTransactionAdded={handleTransactionComplete}
        />
      )}
    </>
  );
};

export default QuickEntryFAB;