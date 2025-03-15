import { getStorage, setStorage } from './storage';
import { 
  Banknote, Laptop, TrendingUp, Gift, PlusCircle,
  Home, Utensils, Car, Zap, Heart, Film, ShoppingBag,
  BookOpen, User, Repeat, CreditCard, MoreHorizontal
} from 'lucide-react';


// Get finance data
export const getFinanceData = () => {
  const storage = getStorage();
  if (!storage.finance) {
    // Initialize finance data structure
    storage.finance = {
      transactions: [],
      budgets: [],
      savingsGoals: [],
      recurringTransactions: [],
      categories: getDefaultCategories(),
      settings: {
        currency: 'EUR',
        currencySymbol: '€',
        dateFormat: 'DD/MM/YYYY'
      }
    };
    setStorage(storage);
  }
  return storage.finance;
};

// Save finance data
export const saveFinanceData = (financeData) => {
  const storage = getStorage();
  storage.finance = financeData;
  setStorage(storage);
};

// Add a transaction
export const addTransaction = (transaction) => {
  const financeData = getFinanceData();
  
  // Ensure transaction has an ID
  transaction.id = transaction.id || `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Make sure amount is stored as a number
  transaction.amount = parseFloat(transaction.amount);
  
  // Add timestamp if not provided
  transaction.timestamp = transaction.timestamp || new Date().toISOString();
  
  // Add to transactions array
  financeData.transactions.unshift(transaction);
  
  // Update budget spent amounts automatically
  if (transaction.amount < 0) {
    const budget = financeData.budgets.find(b => b.category === transaction.category);
    if (budget) {
      budget.spent = (parseFloat(budget.spent) || 0) + Math.abs(transaction.amount);
    }
  }
  
  // Save updated data
  saveFinanceData(financeData);
  
  return transaction;
};

// Update a transaction
export const updateTransaction = (transactionId, updatedData) => {
  const financeData = getFinanceData();
  const index = financeData.transactions.findIndex(t => t.id === transactionId);
  
  if (index !== -1) {
    const oldTransaction = financeData.transactions[index];
    
    // Update the transaction, converting amount to number if needed
    if (updatedData.amount !== undefined) {
      updatedData.amount = parseFloat(updatedData.amount);
    }
    
    // If category or amount changed, adjust budgets
    if ((updatedData.category && updatedData.category !== oldTransaction.category) || 
        (updatedData.amount !== undefined && updatedData.amount !== oldTransaction.amount)) {
        
      // If old transaction was an expense, remove its amount from the old budget
      if (oldTransaction.amount < 0) {
        const oldBudget = financeData.budgets.find(b => b.category === oldTransaction.category);
        if (oldBudget) {
          oldBudget.spent = Math.max(0, (parseFloat(oldBudget.spent) || 0) - Math.abs(oldTransaction.amount));
        }
      }
      
      // If new transaction is an expense, add its amount to the new budget
      if (updatedData.amount < 0) {
        const categoryToUse = updatedData.category || oldTransaction.category;
        const newBudget = financeData.budgets.find(b => b.category === categoryToUse);
        if (newBudget) {
          newBudget.spent = (parseFloat(newBudget.spent) || 0) + Math.abs(updatedData.amount);
        }
      }
    }
    
    financeData.transactions[index] = {
      ...financeData.transactions[index],
      ...updatedData
    };
    
    saveFinanceData(financeData);
    return financeData.transactions[index];
  }
  
  return null;
};

// Delete a transaction
export const deleteTransaction = (transactionId) => {
  const financeData = getFinanceData();
  const transaction = financeData.transactions.find(t => t.id === transactionId);
  
  if (transaction && transaction.amount < 0) {
    // If it was an expense, remove its amount from the budget
    const budget = financeData.budgets.find(b => b.category === transaction.category);
    if (budget) {
      budget.spent = Math.max(0, (parseFloat(budget.spent) || 0) - Math.abs(transaction.amount));
    }
  }
  
  financeData.transactions = financeData.transactions.filter(t => t.id !== transactionId);
  saveFinanceData(financeData);
};

export const CATEGORY_ICONS = {
  // Income categories
  'income-salary': { icon: 'banknote', component: Banknote },
  'income-freelance': { icon: 'laptop', component: Laptop },
  'income-investments': { icon: 'trending-up', component: TrendingUp },
  'income-gifts': { icon: 'gift', component: Gift },
  'income-other': { icon: 'plus-circle', component: PlusCircle },
  
  // Expense categories
  'expense-housing': { icon: 'home', component: Home },
  'expense-food': { icon: 'utensils', component: Utensils },
  'expense-transportation': { icon: 'car', component: Car },
  'expense-utilities': { icon: 'zap', component: Zap },
  'expense-healthcare': { icon: 'heart', component: Heart },
  'expense-entertainment': { icon: 'film', component: Film },
  'expense-shopping': { icon: 'shopping-bag', component: ShoppingBag },
  'expense-education': { icon: 'book-open', component: BookOpen },
  'expense-personal': { icon: 'user', component: User },
  'expense-subscriptions': { icon: 'repeat', component: Repeat },
  'expense-debt': { icon: 'credit-card', component: CreditCard },
  'expense-other': { icon: 'more-horizontal', component: MoreHorizontal }
};


// Get default expense/income categories with unique colors
export const getDefaultCategories = () => {
  return {
    income: [
      { id: 'income-salary', name: 'Salary & Wages', color: 'green', icon: 'banknote' },
      { id: 'income-freelance', name: 'Freelance', color: 'emerald', icon: 'laptop' },
      { id: 'income-investments', name: 'Investments', color: 'blue', icon: 'trending-up' },
      { id: 'income-gifts', name: 'Gifts', color: 'purple', icon: 'gift' },
      { id: 'income-other', name: 'Other Income', color: 'indigo', icon: 'plus-circle' }
    ],
    expense: [
      { id: 'expense-housing', name: 'Housing', color: 'amber', icon: 'home' },
      { id: 'expense-food', name: 'Food', color: 'green', icon: 'utensils' },
      { id: 'expense-transportation', name: 'Transportation', color: 'blue', icon: 'car' },
      { id: 'expense-utilities', name: 'Utilities', color: 'teal', icon: 'zap' },
      { id: 'expense-healthcare', name: 'Healthcare', color: 'rose', icon: 'heart' },
      { id: 'expense-entertainment', name: 'Entertainment', color: 'purple', icon: 'film' },
      { id: 'expense-shopping', name: 'Shopping', color: 'pink', icon: 'shopping-bag' },
      { id: 'expense-education', name: 'Education', color: 'indigo', icon: 'book-open' },
      { id: 'expense-personal', name: 'Personal Care', color: 'cyan', icon: 'user' },
      { id: 'expense-subscriptions', name: 'Subscriptions', color: 'violet', icon: 'repeat' },
      { id: 'expense-debt', name: 'Debt Payments', color: 'red', icon: 'credit-card' },
      { id: 'expense-other', name: 'Other Expenses', color: 'gray', icon: 'more-horizontal' }
    ]
  };
};

// Add a helper function to get category icon component
export const getCategoryIconComponent = (categoryId, size = 16) => {
  const category = CATEGORY_ICONS[categoryId];
  if (!category) return <MoreHorizontal size={size} />;
  
  const IconComponent = category.component;
  return <IconComponent size={size} />;
};

// Add a budget
export const addBudget = (budget) => {
  const financeData = getFinanceData();
  
  // Ensure budget has an ID
  budget.id = budget.id || `budget-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Make sure amount is stored as a number
  budget.allocated = parseFloat(budget.allocated);
  budget.spent = parseFloat(budget.spent || 0);
  
  // Add to budgets array
  financeData.budgets.push(budget);
  
  // Save updated data
  saveFinanceData(financeData);
  
  return budget;
};

// Update a budget
export const updateBudget = (budgetId, updatedData) => {
  const financeData = getFinanceData();
  const index = financeData.budgets.findIndex(b => b.id === budgetId);
  
  if (index !== -1) {
    // Update the budget, converting amount to number if needed
    if (updatedData.allocated !== undefined) {
      updatedData.allocated = parseFloat(updatedData.allocated);
    }
    
    if (updatedData.spent !== undefined) {
      updatedData.spent = parseFloat(updatedData.spent);
    }
    
    financeData.budgets[index] = {
      ...financeData.budgets[index],
      ...updatedData
    };
    
    saveFinanceData(financeData);
    return financeData.budgets[index];
  }
  
  return null;
};

// Delete a budget
export const deleteBudget = (budgetId) => {
  const financeData = getFinanceData();
  financeData.budgets = financeData.budgets.filter(b => b.id !== budgetId);
  saveFinanceData(financeData);
};

// Add a savings goal
export const addSavingsGoal = (goal) => {
  const financeData = getFinanceData();
  
  // Ensure goal has an ID
  goal.id = goal.id || `goal-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Make sure amounts are stored as numbers
  goal.target = parseFloat(goal.target);
  goal.current = parseFloat(goal.current) || 0;
  
  // Add creation date if not provided
  goal.createdAt = goal.createdAt || new Date().toISOString();
  
  // Add to goals array
  financeData.savingsGoals.push(goal);
  
  // Save updated data
  saveFinanceData(financeData);
  
  return goal;
};

// Update a savings goal
export const updateSavingsGoal = (goalId, updatedData) => {
  const financeData = getFinanceData();
  const index = financeData.savingsGoals.findIndex(g => g.id === goalId);
  
  if (index !== -1) {
    // Update the goal, converting amounts to numbers if needed
    if (updatedData.target !== undefined) {
      updatedData.target = parseFloat(updatedData.target);
    }
    if (updatedData.current !== undefined) {
      updatedData.current = parseFloat(updatedData.current);
    }
    
    financeData.savingsGoals[index] = {
      ...financeData.savingsGoals[index],
      ...updatedData
    };
    
    saveFinanceData(financeData);
    return financeData.savingsGoals[index];
  }
  
  return null;
};

// Contribute to a savings goal
export const contributeSavingsGoal = (goalId, amount) => {
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Invalid contribution amount');
  }
  
  const financeData = getFinanceData();
  const goal = financeData.savingsGoals.find(g => g.id === goalId);
  
  if (!goal) {
    throw new Error('Savings goal not found');
  }
  
  // Add to current amount
  goal.current = (parseFloat(goal.current) || 0) + parsedAmount;
  
  // Add to contribution history
  if (!goal.contributions) {
    goal.contributions = [];
  }
  
  goal.contributions.push({
    id: `contrib-${Date.now()}`,
    amount: parsedAmount,
    date: new Date().toISOString()
  });
  
  // Save updated data
  saveFinanceData(financeData);
  
  return goal;
};

// Delete a savings goal
export const deleteSavingsGoal = (goalId) => {
  const financeData = getFinanceData();
  financeData.savingsGoals = financeData.savingsGoals.filter(g => g.id !== goalId);
  saveFinanceData(financeData);
};

// Reset all budgets
export const resetAllBudgets = () => {
  const financeData = getFinanceData();
  
  financeData.budgets.forEach(budget => {
    budget.spent = 0;
  });
  
  saveFinanceData(financeData);
  return financeData.budgets;
};

// Add a recurring transaction
export const addRecurringTransaction = (recurring) => {
  const financeData = getFinanceData();
  
  // Ensure it has an ID
  recurring.id = recurring.id || `recurring-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Make sure amount is stored as a number
  recurring.amount = parseFloat(recurring.amount);
  
  // Add nextDate if not provided
  if (!recurring.nextDate) {
    recurring.nextDate = calculateNextOccurrence(recurring.frequency, recurring.startDate);
  }
  
  // Add to recurring array
  financeData.recurringTransactions.push(recurring);
  
  // Save updated data
  saveFinanceData(financeData);
  
  // Create a reminder for this recurring transaction
  if (recurring.createReminder) {
    createReminderForRecurring(recurring);
  }
  
  return recurring;
};

// Update a recurring transaction
export const updateRecurringTransaction = (id, updatedData) => {
  const financeData = getFinanceData();
  const index = financeData.recurringTransactions.findIndex(r => r.id === id);
  
  if (index !== -1) {
    // Update the recurring transaction, converting amount to number if needed
    if (updatedData.amount !== undefined) {
      updatedData.amount = parseFloat(updatedData.amount);
    }
    
    financeData.recurringTransactions[index] = {
      ...financeData.recurringTransactions[index],
      ...updatedData
    };
    
    saveFinanceData(financeData);
    
    // Update reminder if needed
    if (updatedData.createReminder !== undefined || updatedData.reminderDays !== undefined) {
      updateReminderForRecurring(financeData.recurringTransactions[index]);
    }
    
    return financeData.recurringTransactions[index];
  }
  
  return null;
};

// Delete a recurring transaction
export const deleteRecurringTransaction = (id) => {
  const financeData = getFinanceData();
  const recurring = financeData.recurringTransactions.find(r => r.id === id);
  
  if (recurring) {
    // Delete reminder associated with this recurring transaction
    deleteReminderForRecurring(recurring);
  }
  
  financeData.recurringTransactions = financeData.recurringTransactions.filter(r => r.id !== id);
  saveFinanceData(financeData);
};

// Calculate next occurrence based on frequency
export const calculateNextOccurrence = (frequency, startDate) => {
  const start = new Date(startDate || new Date());
  const today = new Date();
  
  // Ensure startDate is not in the future
  if (start > today) {
    return start.toISOString().split('T')[0];
  }
  
  let next = new Date(start);
  
  // Calculate next occurrence
  switch (frequency) {
    case 'daily':
      next.setDate(today.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(today.getDate() + (7 - today.getDay() + start.getDay()) % 7);
      if (next <= today) {
        next.setDate(next.getDate() + 7);
      }
      break;
    case 'biweekly':
      next.setDate(today.getDate() + (7 - today.getDay() + start.getDay()) % 7);
      if (next <= today) {
        next.setDate(next.getDate() + 14);
      }
      break;
    case 'monthly':
      next.setMonth(today.getMonth() + 1);
      next.setDate(Math.min(start.getDate(), daysInMonth(next.getFullYear(), next.getMonth() + 1)));
      break;
    case 'quarterly':
      next.setMonth(today.getMonth() + 3);
      next.setDate(Math.min(start.getDate(), daysInMonth(next.getFullYear(), next.getMonth() + 1)));
      break;
    case 'annually':
      next.setFullYear(today.getFullYear() + 1);
      break;
    default:
      next.setMonth(today.getMonth() + 1);
  }
  
  return next.toISOString().split('T')[0];
};

// Helper function to get days in month
const daysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

// Process recurring transactions for today
export const processRecurringTransactions = (date) => {
  const today = date || new Date().toISOString().split('T')[0];
  const financeData = getFinanceData();
  const processed = [];
  
  financeData.recurringTransactions.forEach(recurring => {
    if (recurring.nextDate === today) {
      // Create actual transaction from the recurring one
      const transaction = {
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: recurring.name,
        amount: recurring.amount,
        category: recurring.category,
        date: today,
        notes: `Auto-generated from recurring: ${recurring.name}`,
        recurring: recurring.id,
        timestamp: new Date().toISOString()
      };
      
      // Add the transaction
      financeData.transactions.unshift(transaction);
      processed.push(transaction);
      
      // Calculate and update next occurrence
      recurring.nextDate = calculateNextOccurrence(recurring.frequency, today);
    }
  });
  
  // Save updated data if any transactions were processed
  if (processed.length > 0) {
    saveFinanceData(financeData);
  }
  
  return processed;
};

// Create a reminder for a recurring transaction
export const createReminderForRecurring = (recurring) => {
  if (!window.reminderService) {
    console.error('Reminder service not available');
    return null;
  }
  
  const storage = getStorage();
  
  // Get or initialize reminder settings
  if (!storage.reminderSettings) {
    storage.reminderSettings = { enabled: true, reminders: [] };
  }
  
  // Create reminder for this recurring transaction
  const reminderDays = recurring.reminderDays || 3; // Default: 3 days before
  const nextDate = new Date(recurring.nextDate);
  
  // Calculate reminder date
  const reminderDate = new Date(nextDate);
  reminderDate.setDate(nextDate.getDate() - reminderDays);
  
  // Format reminder date for tasks
  const reminderDateStr = reminderDate.toISOString().split('T')[0];
  
  // Create task for this date
  const isExpense = recurring.amount < 0;
  const taskText = `${isExpense ? 'Pay' : 'Receive'}: ${recurring.name} (${isExpense ? '-' : '+'}$${Math.abs(recurring.amount).toFixed(2)})`;
  
  // Get the day data for the reminder date
  const dayData = storage[reminderDateStr] || {};
  
  // Create or update task list
  let taskList = dayData.customTasks || dayData.aiTasks || dayData.defaultTasks || JSON.parse(JSON.stringify(DEFAULT_TASKS));
  
  // Find or create Financial category
  let financialCategory = taskList.find(cat => cat.title === 'Financial');
  if (!financialCategory) {
    financialCategory = { title: 'Financial', items: [] };
    taskList.push(financialCategory);
  }
  
  // Add task if not already present
  if (!financialCategory.items.includes(taskText)) {
    financialCategory.items.push(taskText);
  }
  
  // Update day data with task list
  storage[reminderDateStr] = {
    ...dayData,
    customTasks: taskList,
    checked: { ...(dayData.checked || {}), [taskText]: false }
  };
  
  // Create reminder ID
  const reminderId = `finance-${recurring.id}`;
  
  // Add to reminders
  const existingReminderIndex = storage.reminderSettings.reminders.findIndex(r => r.id === reminderId);
  const reminderObj = {
    id: reminderId,
    label: `${isExpense ? 'Payment due' : 'Income expected'}: ${recurring.name} ($${Math.abs(recurring.amount).toFixed(2)})`,
    time: '09:00', // Default reminder time
    enabled: true,
    dateKey: reminderDateStr
  };
  
  if (existingReminderIndex >= 0) {
    storage.reminderSettings.reminders[existingReminderIndex] = reminderObj;
  } else {
    storage.reminderSettings.reminders.push(reminderObj);
  }
  
  setStorage(storage);
  
  // Reload reminders in reminder service
  if (window.reminderService.loadReminders) {
    window.reminderService.loadReminders();
  }
  
  return reminderObj;
};

// Update reminder for a recurring transaction
export const updateReminderForRecurring = (recurring) => {
  // If reminder was disabled, delete it
  if (!recurring.createReminder) {
    deleteReminderForRecurring(recurring);
    return null;
  }
  
  // Otherwise create/update it
  return createReminderForRecurring(recurring);
};

// Delete reminder for a recurring transaction
export const deleteReminderForRecurring = (recurring) => {
  const storage = getStorage();
  const reminderId = `finance-${recurring.id}`;
  
  if (storage.reminderSettings && storage.reminderSettings.reminders) {
    storage.reminderSettings.reminders = storage.reminderSettings.reminders.filter(r => r.id !== reminderId);
    setStorage(storage);
    
    // Reload reminders in reminder service
    if (window.reminderService.loadReminders) {
      window.reminderService.loadReminders();
    }
    
    return true;
  }
  
  return false;
};

// Calculate financial stats
export const calculateFinancialStats = (period = 'month') => {
  const financeData = getFinanceData();
  const now = new Date();
  let startDate;
  
  // Calculate start date based on period
  switch (period) {
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
  }
  
  const startDateIso = startDate.toISOString();
  
  // Filter transactions for the period
  const periodTransactions = financeData.transactions.filter(t => 
    new Date(t.timestamp) >= startDate
  );
  
  // Calculate total income
  const income = periodTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate total expenses
  const expenses = periodTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Calculate balance
  const balance = income - expenses;
  
  // Calculate category breakdown
  const categoryBreakdown = {};
  
  periodTransactions.forEach(transaction => {
    if (!transaction.category) return;
    
    const category = transaction.category;
    const amount = Math.abs(transaction.amount);
    
    if (!categoryBreakdown[category]) {
      categoryBreakdown[category] = 0;
    }
    
    categoryBreakdown[category] += amount;
  });
  
  // Calculate monthly change (compare with previous month)
  let monthlyChange = 0;
  
  if (period === 'month') {
    const previousMonth = new Date(startDate);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousMonthEnd = new Date(startDate);
    previousMonthEnd.setDate(previousMonthEnd.getDate() - 1);
    
    const previousMonthTransactions = financeData.transactions.filter(t => 
      new Date(t.timestamp) >= previousMonth && new Date(t.timestamp) <= previousMonthEnd
    );
    
    const prevIncome = previousMonthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const prevExpenses = previousMonthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const prevBalance = prevIncome - prevExpenses;
    
    monthlyChange = balance - prevBalance;
  }
  
  // Calculate budget progress
  const budgets = financeData.budgets.map(budget => {
    // Sum transactions in this category for the current period
    const spent = periodTransactions
      .filter(t => t.amount < 0 && t.category === budget.category)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      ...budget,
      spent,
      remaining: budget.allocated - spent,
      percentage: Math.min(100, Math.round((spent / budget.allocated) * 100))
    };
  });
  
  // Return compiled stats
  return {
    period,
    income,
    expenses,
    balance,
    monthlyChange,
    categoryBreakdown,
    budgets,
    startDate: startDateIso,
    endDate: now.toISOString()
  };
};

// Default task list for placeholders
const DEFAULT_TASKS = [
  {
    title: "Financial",
    items: [
      "Check bank account balance",
      "Review budget for the week"
    ]
  }
];

// Get category name from ID
export const getCategoryById = (categoryId) => {
  const categories = getFinanceData().categories;
  
  for (const type of ['income', 'expense']) {
    const found = categories[type].find(cat => cat.id === categoryId);
    if (found) return found;
  }
  
  return null;
};

// Get category color from ID
export const getCategoryColor = (categoryId) => {
  const category = getCategoryById(categoryId);
  return category ? category.color : 'gray';
};

// Get financial insights for the current user
export const getFinancialInsights = () => {
  const financeData = getFinanceData();
  const insights = [];
  
  // Get the monthly stats
  const stats = calculateFinancialStats('month');
  
  // Calculate financial health score (simple version)
  let financialHealthScore = 50; // Base score
  
  // If income > expenses, that's good
  if (stats.income > stats.expenses) {
    financialHealthScore += 20;
  } else {
    financialHealthScore -= 10;
  }
  
  // If saving at least 20% of income, that's great
  const savingsRate = stats.income > 0 ? (stats.income - stats.expenses) / stats.income : 0;
  if (savingsRate >= 0.2) {
    financialHealthScore += 20;
    insights.push({
      type: 'positive',
      title: 'Excellent Savings Rate',
      description: `You're saving ${Math.round(savingsRate * 100)}% of your income this month. Great job!`,
      icon: 'piggy-bank'
    });
  } else if (savingsRate > 0) {
    financialHealthScore += 10;
    insights.push({
      type: 'neutral',
      title: 'Positive Savings',
      description: `You're saving ${Math.round(savingsRate * 100)}% of your income this month.`,
      icon: 'piggy-bank'
    });
  } else {
    financialHealthScore -= 20;
    insights.push({
      type: 'negative',
      title: 'Negative Savings Rate',
      description: 'You spent more than you earned this month. Review your expenses to get back on track.',
      icon: 'alert-triangle'
    });
  }
  
  // Check budget adherence
  const budgetsOverLimit = stats.budgets.filter(b => b.spent > b.allocated);
  
  if (budgetsOverLimit.length > 0) {
    financialHealthScore -= 5 * budgetsOverLimit.length;
    
    insights.push({
      type: 'negative',
      title: 'Budget Alert',
      description: `You've exceeded your budget in ${budgetsOverLimit.length} categories.`,
      icon: 'alert-triangle',
      details: budgetsOverLimit.map(b => `${getCategoryById(b.category)?.name || b.category}: $${b.spent.toFixed(2)} / $${b.allocated.toFixed(2)}`)
    });
  }
  
  // Budget categories that are close to limit
  const budgetsNearLimit = stats.budgets.filter(b => b.spent < b.allocated && b.spent >= 0.8 * b.allocated);
  
  if (budgetsNearLimit.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Budget Warning',
      description: `You're approaching your budget limit in ${budgetsNearLimit.length} categories.`,
      icon: 'alert-circle',
      details: budgetsNearLimit.map(b => `${getCategoryById(b.category)?.name || b.category}: $${b.spent.toFixed(2)} / $${b.allocated.toFixed(2)}`)
    });
  }
  
  // Check recurring transactions due soon
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingRecurring = financeData.recurringTransactions.filter(r => {
    const nextDate = new Date(r.nextDate);
    return nextDate >= today && nextDate <= nextWeek && r.amount < 0;
  });
  
  if (upcomingRecurring.length > 0) {
    const totalAmount = upcomingRecurring.reduce((sum, r) => sum + Math.abs(r.amount), 0);
    
    insights.push({
      type: 'info',
      title: 'Upcoming Payments',
      description: `You have ${upcomingRecurring.length} payments totaling $${totalAmount.toFixed(2)} due in the next 7 days.`,
      icon: 'calendar',
      details: upcomingRecurring.map(r => `${r.name}: $${Math.abs(r.amount).toFixed(2)} due on ${new Date(r.nextDate).toLocaleDateString()}`)
    });
  }
  
  // Look for spending patterns (simple version)
  const categories = {};
  financeData.transactions
    .filter(t => t.amount < 0 && new Date(t.timestamp) >= stats.startDate)
    .forEach(t => {
      if (!t.category) return;
      
      if (!categories[t.category]) {
        categories[t.category] = 0;
      }
      
      categories[t.category] += Math.abs(t.amount);
    });
  
  // Find top spending category
  let topCategory = null;
  let topAmount = 0;
  
  for (const [category, amount] of Object.entries(categories)) {
    if (amount > topAmount) {
      topAmount = amount;
      topCategory = category;
    }
  }
  
  if (topCategory) {
    const categoryName = getCategoryById(topCategory)?.name || topCategory;
    const percentOfTotal = stats.expenses > 0 ? Math.round((topAmount / stats.expenses) * 100) : 0;
    
    if (percentOfTotal > 40) {
      insights.push({
        type: 'warning',
        title: 'High Category Spending',
        description: `${percentOfTotal}% of your expenses this month were in ${categoryName}.`,
        icon: 'pie-chart'
      });
      financialHealthScore -= 10;
    }
  }
  
  // Adjust score based on savings goals progress
  const activeGoals = financeData.savingsGoals.filter(g => g.current < g.target);
  if (activeGoals.length > 0) {
    // Check average progress
    const avgProgress = activeGoals.reduce((sum, g) => sum + (g.current / g.target), 0) / activeGoals.length;
    
    if (avgProgress > 0.7) {
      financialHealthScore += 10;
      insights.push({
        type: 'positive',
        title: 'Savings Goals Progress',
        description: 'You\'re making excellent progress on your savings goals!',
        icon: 'award'
      });
    }
  }
  
  // Cap the score between 0 and 100
  financialHealthScore = Math.max(0, Math.min(100, financialHealthScore));
  
  return {
    score: Math.round(financialHealthScore),
    insights
  };
};

// Get correlation between spending and mood
export const getSpendingMoodCorrelation = () => {
  const financeData = getFinanceData();
  const storage = getStorage();
  const correlations = [];
  
  // Only proceed if we have transactions and mood data
  if (!financeData.transactions.length) {
    return [];
  }
  
  // Get all dates with mood data
  const moodDates = Object.keys(storage).filter(key => {
    return key.match(/^\d{4}-\d{2}-\d{2}$/) && 
           (storage[key].morningMood || storage[key].eveningMood);
  });
  
  if (moodDates.length < 5) {
    // Not enough mood data for meaningful correlations
    return [];
  }
  
  // Group transactions by date
  const transactionsByDate = {};
  
  financeData.transactions.forEach(transaction => {
    const date = new Date(transaction.timestamp).toISOString().split('T')[0];
    
    if (!transactionsByDate[date]) {
      transactionsByDate[date] = [];
    }
    
    transactionsByDate[date].push(transaction);
  });
  
  // Find days with high expenses followed by mood change
  for (let i = 0; i < moodDates.length - 1; i++) {
    const currentDate = moodDates[i];
    const nextDate = moodDates[i + 1];
    
    // Skip if dates are not consecutive
    const currentDateObj = new Date(currentDate);
    const nextDateObj = new Date(nextDate);
    const dayDiff = (nextDateObj - currentDateObj) / (1000 * 60 * 60 * 24);
    
    if (dayDiff !== 1) continue;
    
    // Get mood values (0-5 scale)
    const currentMood = storage[currentDate].eveningMood || storage[currentDate].morningMood || 3;
    const nextMood = storage[nextDate].morningMood || 3;
    
    // Get expenses for current date
    const currentExpenses = transactionsByDate[currentDate] || [];
    const totalSpent = currentExpenses
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Check if this was a high spending day (arbitrary threshold: $100)
    const isHighSpending = totalSpent > 100;
    
    // Check if mood decreased
    const moodDecreased = nextMood < currentMood;
    
    // Check if a specific category had high spending
    if (currentExpenses.length > 0) {
      const categorySpending = {};
      
      currentExpenses.forEach(transaction => {
        if (!transaction.category || transaction.amount >= 0) return;
        
        if (!categorySpending[transaction.category]) {
          categorySpending[transaction.category] = 0;
        }
        
        categorySpending[transaction.category] += Math.abs(transaction.amount);
      });
      
      // Find categories with significant spending
      for (const [category, amount] of Object.entries(categorySpending)) {
        if (amount > 50) {
          const categoryName = getCategoryById(category)?.name || category;
          
          // Check if this specific category correlates with mood change
          if (moodDecreased) {
            correlations.push({
              type: 'negative',
              category: category,
              categoryName: categoryName,
              spending: amount,
              moodChange: currentMood - nextMood,
              date: currentDate
            });
          }
        }
      }
    }
    
    // General correlation between high spending and mood
    if (isHighSpending && moodDecreased) {
      correlations.push({
        type: 'general',
        spending: totalSpent,
        moodChange: currentMood - nextMood,
        date: currentDate
      });
    }
  }
  
  // Sort correlations by strength (mood change)
  correlations.sort((a, b) => b.moodChange - a.moodChange);
  
  return correlations.slice(0, 3); // Return top 3 correlations
};