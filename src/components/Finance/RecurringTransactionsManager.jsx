import React, { useState } from 'react';
import { RepeatIcon, Edit, Trash2, ChevronDown, ChevronUp, DollarSign, Calendar } from 'lucide-react';
import { getCategoryById, getCategoryIconComponent, deleteRecurringTransaction } from '../../utils/financeUtils';
import ConfirmationModal from './ConfirmationModal';
import EditRecurringModal from './EditRecurringModal';

const RecurringTransactionsManager = ({ recurringTransactions = [], onRefresh, currency = '€' }) => {
  const [expanded, setExpanded] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingRecurring, setEditingRecurring] = useState(null);

  // Sort by next date
  const sortedRecurring = [...recurringTransactions].sort((a, b) => {
    if (!a.nextDate) return 1;
    if (!b.nextDate) return -1;
    return new Date(a.nextDate) - new Date(b.nextDate);
  });

  // Format currency
  const formatCurrency = (amount) => {
    return `${currency}${Math.abs(parseFloat(amount)).toFixed(2)}`;
  };

  // Handle edit
  const handleEdit = (recurring) => {
    setEditingRecurring(recurring);
    console.log("Editing recurring transaction:", recurring); // Debug log
  };

  // Handle delete
  const handleDelete = (recurring) => {
    setConfirmDelete(recurring);
  };

  // Confirm deletion
  const confirmDeleteRecurring = () => {
    if (confirmDelete) {
      deleteRecurringTransaction(confirmDelete.id);
      setConfirmDelete(null);
      if (onRefresh) onRefresh();
    }
  };

  // Format frequency for display
  const formatFrequency = (frequency) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Every 2 weeks';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'annually': return 'Yearly';
      default: return frequency;
    }
  };

  if (sortedRecurring.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 bg-slate-700 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 text-white font-medium">
          <RepeatIcon size={18} className="text-amber-400" />
          <span>Recurring Transactions</span>
          <span className="text-sm text-slate-400">({sortedRecurring.length})</span>
        </div>
        <button className="text-slate-400 hover:text-white transition-colors">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Recurring Transactions List */}
      {expanded && (
        <div className="p-2 bg-slate-800">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedRecurring.map(recurring => {
              const category = getCategoryById(recurring.category);
              const isExpense = recurring.amount < 0;
              
              return (
                <div 
                  key={recurring.id}
                  className="bg-slate-700 rounded-lg p-3 border border-slate-600"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-white flex items-center gap-1">
                        {recurring.name}
                        <RepeatIcon size={14} className="text-amber-400" />
                      </div>

                      <div className="flex flex-wrap gap-2 mt-1 text-xs">
                        {/* Category */}
                        {category && (
                          <span className="bg-slate-600/70 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            {getCategoryIconComponent(recurring.category, 10)}
                            <span className="text-slate-300">{category.name}</span>
                          </span>
                        )}
                        
                        {/* Frequency */}
                        <span className="bg-amber-900/30 text-amber-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <RepeatIcon size={10} />
                          <span>{formatFrequency(recurring.frequency)}</span>
                        </span>
                        
                        {/* Next Date */}
                        {recurring.nextDate && (
                          <span className="bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <Calendar size={10} />
                            <span>Next: {new Date(recurring.nextDate).toLocaleDateString()}</span>
                          </span>
                        )}
                        
                        {/* Reminder */}
                        {recurring.createReminder && (
                          <span className="bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded-full">
                            {recurring.reminderDays 
                              ? `Reminder ${recurring.reminderDays} days before` 
                              : "Reminder on due date"}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`text-lg font-bold ${isExpense ? 'text-red-400' : 'text-green-400'}`}>
                        {isExpense ? '-' : '+'}
                        {formatCurrency(recurring.amount)}
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(recurring);
                          }}
                          className="p-1.5 rounded-full bg-slate-600 text-blue-400 hover:bg-slate-500 transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(recurring);
                          }}
                          className="p-1.5 rounded-full bg-slate-600 text-red-400 hover:bg-slate-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notes if available */}
                  {recurring.notes && (
                    <div className="mt-2 text-xs text-slate-400 bg-slate-800/50 p-2 rounded">
                      {recurring.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Edit Recurring Modal */}
      {editingRecurring && (
        <EditRecurringModal
          recurring={editingRecurring}
          onClose={() => setEditingRecurring(null)}
          onRecurringUpdated={() => {
            setEditingRecurring(null);
            if (onRefresh) onRefresh();
          }}
          currency={currency}
        />
      )}
      
      {/* Confirmation Modal */}
      {confirmDelete && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Recurring Transaction"
          message={`Are you sure you want to delete the recurring transaction "${confirmDelete.name}"? This will prevent future transactions from being generated. This action cannot be undone.`}
          onConfirm={confirmDeleteRecurring}
          onCancel={() => setConfirmDelete(null)}
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          confirmText="Delete"
        />
      )}
    </div>
  );
};

export default RecurringTransactionsManager;