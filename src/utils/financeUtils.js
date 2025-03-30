// src/utils/financeUtils.js
import { getStorage, setStorage } from './storage';
import { 
  Banknote, Laptop, TrendingUp, Gift, PlusCircle, Briefcase,
  Home, Utensils, Car, Zap, Heart, Film, ShoppingBag, Train, Package,
  BookOpen, User, Repeat, CreditCard, MoreHorizontal, Shield,
  Wrench, Droplet, ShoppingCart, Coffee, Wine, Smartphone, Wifi,
  Scissors, Smile, Activity, FileText, UserCheck, Music, Ticket,
  Gamepad, Undo, MapPin, Lamp, Stethoscope, Pill, Flame
} from 'lucide-react';
import { formatDateForStorage } from './dateUtils';


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
      settings: {
        currency: 'EUR',
        currencySymbol: '€',
        dateFormat: 'DD/MM/YYYY'
      }
    };
    setStorage(storage);
  }
  
  // Always use the categories from constants, not storage
  // This ensures new categories are always available without requiring resets
  return {
    ...storage.finance,
    categories: getCategoriesFromConstants()
  };
};

// Save finance data
export const saveFinanceData = (financeData) => {
  const storage = getStorage();
  
  // Save everything except categories to storage
  // Categories will always be loaded from getCategoriesFromConstants()
  const { categories, ...dataToSave } = financeData;
  
  storage.finance = dataToSave;
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
    // Only update the budget from past or today's transactions, not future ones
    const txDate = new Date(transaction.date || transaction.timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (txDate <= today) {
      const budget = financeData.budgets.find(b => b.category === transaction.category);
      if (budget) {
        budget.spent = (parseFloat(budget.spent) || 0) + Math.abs(transaction.amount);
      }
    }
  }
  
  // Save updated data
  saveFinanceData(financeData);
  
  // Create task if it's a future transaction
  createTaskFromTransaction(transaction);
  
  return transaction;
};

// Update a transaction
export const updateTransaction = (transactionId, updatedData) => {
  const financeData = getFinanceData();
  const index = financeData.transactions.findIndex(t => t.id === transactionId);
  
  if (index !== -1) {
    const oldTransaction = financeData.transactions[index];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Determine if old transaction was in the past or today
    const oldTxDate = new Date(oldTransaction.date || oldTransaction.timestamp);
    oldTxDate.setHours(0, 0, 0, 0);
    const oldTxInPast = oldTxDate <= today;
    
    // Determine if new transaction will be in the past or today
    let newTxDate = oldTxDate;
    if (updatedData.date) {
      newTxDate = new Date(updatedData.date);
      newTxDate.setHours(0, 0, 0, 0);
    }
    const newTxInPast = newTxDate <= today;
    
    // Update the transaction, converting amount to number if needed
    if (updatedData.amount !== undefined) {
      updatedData.amount = parseFloat(updatedData.amount);
    }
    
    // Handle budget adjustments
    // If category or amount changed, adjust budgets
    if ((updatedData.category && updatedData.category !== oldTransaction.category) || 
        (updatedData.amount !== undefined && updatedData.amount !== oldTransaction.amount) ||
        (oldTxInPast !== newTxInPast)) {
        
      // Only process budget changes for past transactions
      if (oldTxInPast) {
        // If old transaction was an expense and in the past, remove its amount from the old budget
        if (oldTransaction.amount < 0) {
          const oldBudget = financeData.budgets.find(b => b.category === oldTransaction.category);
          if (oldBudget) {
            oldBudget.spent = Math.max(0, (parseFloat(oldBudget.spent) || 0) - Math.abs(oldTransaction.amount));
          }
        }
      }
      
      // If new transaction is an expense and in the past, add its amount to the new budget
      if (newTxInPast && (updatedData.amount !== undefined ? updatedData.amount < 0 : oldTransaction.amount < 0)) {
        const amount = updatedData.amount !== undefined ? updatedData.amount : oldTransaction.amount;
        const categoryToUse = updatedData.category || oldTransaction.category;
        const newBudget = financeData.budgets.find(b => b.category === categoryToUse);
        
        if (newBudget) {
          newBudget.spent = (parseFloat(newBudget.spent) || 0) + Math.abs(amount);
        }
      }
    }
    
    // Create the updated transaction by merging old data with updates
    const updatedTransaction = {
      ...oldTransaction,
      ...updatedData
    };
    
    // Update timestamp for sorting if the date changed
    if (updatedData.date && updatedData.date !== oldTransaction.date) {
      // Keep the time portion of the original timestamp but update the date
      const originalTime = new Date(oldTransaction.timestamp).toISOString().split('T')[1];
      updatedTransaction.timestamp = `${updatedData.date}T${originalTime}`;
    }
    
    // Save the updated transaction
    financeData.transactions[index] = updatedTransaction;
    saveFinanceData(financeData);
    
    // If the transaction is now in the future, create a task for it
    const updatedTxDate = new Date(updatedTransaction.date || updatedTransaction.timestamp);
    updatedTxDate.setHours(0, 0, 0, 0);
    
    if (updatedTxDate > today) {
      createTaskFromTransaction(updatedTransaction);
    }
    
    return updatedTransaction;
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
  'income-bonus': { icon: 'banknote', component: Banknote },
  'income-freelance': { icon: 'laptop', component: Laptop },
  'income-business': { icon: 'briefcase', component: Briefcase },
  'income-dividends': { icon: 'trending-up', component: TrendingUp },
  'income-interest': { icon: 'trending-up', component: TrendingUp },
  'income-rental': { icon: 'home', component: Home },
  'income-gifts': { icon: 'gift', component: Gift },
  'income-refunds': { icon: 'undo', component: Undo },
  'income-other': { icon: 'plus-circle', component: PlusCircle },
  
  // Housing categories
  'expense-housing-rent': { icon: 'home', component: Home },
  'expense-housing-insurance': { icon: 'shield', component: Shield },
  'expense-housing-maintenance': { icon: 'wrench', component: Wrench },
  'expense-housing-furniture': { icon: 'lamp', component: Lamp },
  
  // Food categories
  'expense-food-groceries': { icon: 'shopping-cart', component: ShoppingCart },
  'expense-food-restaurants': { icon: 'utensils', component: Utensils },
  'expense-food-takeaway': { icon: 'package', component: Package },
  'expense-food-coffee': { icon: 'coffee', component: Coffee },
  'expense-food-alcohol': { icon: 'wine', component: Wine },
  
  // Transportation categories
  'expense-transport-public': { icon: 'train', component: Train },
  'expense-transport-taxi': { icon: 'car', component: Car },
  'expense-transport-fuel': { icon: 'droplet', component: Droplet },
  'expense-transport-maintenance': { icon: 'wrench', component: Wrench },
  'expense-transport-parking': { icon: 'map-pin', component: MapPin },
  
  // Utilities categories
  'expense-utilities-electricity': { icon: 'zap', component: Zap },
  'expense-utilities-water': { icon: 'droplet', component: Droplet },
  'expense-utilities-gas': { icon: 'flame', component: Flame },
  'expense-utilities-internet': { icon: 'wifi', component: Wifi },
  'expense-utilities-phone': { icon: 'smartphone', component: Smartphone },
  
  // Shopping categories
  'expense-shopping-clothes': { icon: 'shopping-bag', component: ShoppingBag },
  'expense-shopping-electronics': { icon: 'smartphone', component: Smartphone },
  'expense-shopping-gifts': { icon: 'gift', component: Gift },
  'expense-shopping-household': { icon: 'home', component: Home },
  
  // Healthcare categories
  'expense-health-doctor': { icon: 'stethoscope', component: Stethoscope },
  'expense-health-pharmacy': { icon: 'pill', component: Pill },
  'expense-health-insurance': { icon: 'shield', component: Shield },
  'expense-health-fitness': { icon: 'activity', component: Activity },
  
  // Entertainment categories
  'expense-entertainment-movies': { icon: 'film', component: Film },
  'expense-entertainment-music': { icon: 'music', component: Music },
  'expense-entertainment-games': { icon: 'gamepad', component: Gamepad },
  'expense-entertainment-events': { icon: 'ticket', component: Ticket },
  
  // Subscription categories
  'expense-subs-streaming': { icon: 'repeat', component: Repeat },
  'expense-subs-software': { icon: 'smartphone', component: Smartphone },
  'expense-subs-memberships': { icon: 'user-check', component: UserCheck },
  
  // Personal categories
  'expense-personal-hygiene': { icon: 'user', component: User },
  'expense-personal-haircut': { icon: 'scissors', component: Scissors },
  'expense-personal-spa': { icon: 'smile', component: Smile },
  
  // Other categories
  'expense-education': { icon: 'book-open', component: BookOpen },
  'expense-debt-payments': { icon: 'credit-card', component: CreditCard },
  'expense-taxes': { icon: 'file-text', component: FileText },
  'expense-charity': { icon: 'heart', component: Heart },
  'expense-other': { icon: 'more-horizontal', component: MoreHorizontal }
};

// This becomes the source of truth for categories
export const getCategoriesFromConstants = () => {
  return {
    income: [
      { id: 'income-salary', name: 'Salary & Wages', color: 'green', icon: 'banknote', group: 'Employment' },
      { id: 'income-bonus', name: 'Bonus', color: 'green', icon: 'banknote', group: 'Employment' },
      { id: 'income-freelance', name: 'Freelance', color: 'emerald', icon: 'laptop', group: 'Self-Employment' },
      { id: 'income-business', name: 'Business', color: 'emerald', icon: 'briefcase', group: 'Self-Employment' },
      { id: 'income-dividends', name: 'Dividends', color: 'blue', icon: 'trending-up', group: 'Investments' },
      { id: 'income-interest', name: 'Interest', color: 'blue', icon: 'trending-up', group: 'Investments' },
      { id: 'income-rental', name: 'Rental Income', color: 'blue', icon: 'home', group: 'Investments' },
      { id: 'income-gifts', name: 'Gifts', color: 'purple', icon: 'gift', group: 'Other Income' },
      { id: 'income-refunds', name: 'Refunds', color: 'purple', icon: 'undo', group: 'Other Income' },
      { id: 'income-other', name: 'Other Income', color: 'indigo', icon: 'plus-circle', group: 'Other Income' }
    ],
    expense: [
      // Housing group
      { id: 'expense-housing-rent', name: 'Rent/Mortgage', color: 'amber', icon: 'home', group: 'Housing' },
      { id: 'expense-housing-insurance', name: 'Home Insurance', color: 'amber', icon: 'shield', group: 'Housing' },
      { id: 'expense-housing-maintenance', name: 'Home Maintenance', color: 'amber', icon: 'wrench', group: 'Housing' },
      { id: 'expense-housing-furniture', name: 'Furniture', color: 'amber', icon: 'lamp', group: 'Housing' },
      
      // Food group
      { id: 'expense-food-groceries', name: 'Groceries', color: 'green', icon: 'shopping-cart', group: 'Food' },
      { id: 'expense-food-restaurants', name: 'Dining Out', color: 'green', icon: 'utensils', group: 'Food' },
      { id: 'expense-food-takeaway', name: 'Takeaway', color: 'green', icon: 'package', group: 'Food' },
      { id: 'expense-food-coffee', name: 'Coffee & Cafes', color: 'green', icon: 'coffee', group: 'Food' },
      { id: 'expense-food-alcohol', name: 'Alcohol & Bars', color: 'green', icon: 'wine', group: 'Food' },
      
      // Transportation group
      { id: 'expense-transport-public', name: 'Public Transit', color: 'blue', icon: 'train', group: 'Transportation' },
      { id: 'expense-transport-taxi', name: 'Taxi & Rideshare', color: 'blue', icon: 'car', group: 'Transportation' },
      { id: 'expense-transport-fuel', name: 'Fuel', color: 'blue', icon: 'droplet', group: 'Transportation' },
      { id: 'expense-transport-maintenance', name: 'Car Maintenance', color: 'blue', icon: 'wrench', group: 'Transportation' },
      { id: 'expense-transport-parking', name: 'Parking & Tolls', color: 'blue', icon: 'map-pin', group: 'Transportation' },
      
      // Utilities group
      { id: 'expense-utilities-electricity', name: 'Electricity', color: 'teal', icon: 'zap', group: 'Utilities' },
      { id: 'expense-utilities-water', name: 'Water', color: 'teal', icon: 'droplet', group: 'Utilities' },
      { id: 'expense-utilities-gas', name: 'Gas', color: 'teal', icon: 'flame', group: 'Utilities' },
      { id: 'expense-utilities-internet', name: 'Internet', color: 'teal', icon: 'wifi', group: 'Utilities' },
      { id: 'expense-utilities-phone', name: 'Phone', color: 'teal', icon: 'smartphone', group: 'Utilities' },
      
      // Shopping group
      { id: 'expense-shopping-clothes', name: 'Clothing', color: 'pink', icon: 'shopping-bag', group: 'Shopping' },
      { id: 'expense-shopping-electronics', name: 'Electronics', color: 'pink', icon: 'smartphone', group: 'Shopping' },
      { id: 'expense-shopping-gifts', name: 'Gifts', color: 'pink', icon: 'gift', group: 'Shopping' },
      { id: 'expense-shopping-household', name: 'Household Items', color: 'pink', icon: 'home', group: 'Shopping' },
      
      // Healthcare group
      { id: 'expense-health-doctor', name: 'Doctor & Medical', color: 'rose', icon: 'stethoscope', group: 'Healthcare' },
      { id: 'expense-health-pharmacy', name: 'Pharmacy', color: 'rose', icon: 'pill', group: 'Healthcare' },
      { id: 'expense-health-insurance', name: 'Health Insurance', color: 'rose', icon: 'shield', group: 'Healthcare' },
      { id: 'expense-health-fitness', name: 'Fitness', color: 'rose', icon: 'activity', group: 'Healthcare' },
      
      // Entertainment group
      { id: 'expense-entertainment-movies', name: 'Movies & TV', color: 'purple', icon: 'film', group: 'Entertainment' },
      { id: 'expense-entertainment-music', name: 'Music', color: 'purple', icon: 'music', group: 'Entertainment' },
      { id: 'expense-entertainment-games', name: 'Games', color: 'purple', icon: 'gamepad', group: 'Entertainment' },
      { id: 'expense-entertainment-events', name: 'Events & Concerts', color: 'purple', icon: 'ticket', group: 'Entertainment' },
      
      // Subscriptions group
      { id: 'expense-subs-streaming', name: 'Streaming Services', color: 'violet', icon: 'repeat', group: 'Subscriptions' },
      { id: 'expense-subs-software', name: 'Software & Apps', color: 'violet', icon: 'smartphone', group: 'Subscriptions' },
      { id: 'expense-subs-memberships', name: 'Memberships', color: 'violet', icon: 'user-check', group: 'Subscriptions' },
      
      // Personal group
      { id: 'expense-personal-hygiene', name: 'Personal Care', color: 'cyan', icon: 'user', group: 'Personal' },
      { id: 'expense-personal-haircut', name: 'Hair & Beauty', color: 'cyan', icon: 'scissors', group: 'Personal' },
      { id: 'expense-personal-spa', name: 'Spa & Massage', color: 'cyan', icon: 'smile', group: 'Personal' },
      
      // Other catch-all categories
      { id: 'expense-education', name: 'Education', color: 'indigo', icon: 'book-open', group: 'Other' },
      { id: 'expense-debt-payments', name: 'Debt Payments', color: 'red', icon: 'credit-card', group: 'Other' },
      { id: 'expense-taxes', name: 'Taxes', color: 'gray', icon: 'file-text', group: 'Other' },
      { id: 'expense-charity', name: 'Charity', color: 'green', icon: 'heart', group: 'Other' },
      { id: 'expense-other', name: 'Miscellaneous', color: 'gray', icon: 'more-horizontal', group: 'Other' }
    ]
  };
};

// For backward compatibility - redirects to the constant categories 
export const getDefaultCategories = () => {
  return getCategoriesFromConstants();
};

// Group categories by their group field - now using the constant categories
export const getCategoriesByGroup = () => {
  const categories = getCategoriesFromConstants();
  
  // Process income categories
  const incomeGroups = categories.income.reduce((groups, category) => {
    const group = category.group || 'Other';
    if (!groups[group]) groups[group] = [];
    groups[group].push(category);
    return groups;
  }, {});
  
  // Process expense categories
  const expenseGroups = categories.expense.reduce((groups, category) => {
    const group = category.group || 'Other';
    if (!groups[group]) groups[group] = [];
    groups[group].push(category);
    return groups;
  }, {});
  
  return { income: incomeGroups, expense: expenseGroups };
};

// Add a helper function to get category icon component
export const getCategoryIconComponent = (categoryId, size = 16) => {
  const category = CATEGORY_ICONS[categoryId];
  if (!category) return <MoreHorizontal size={size} />;
  
  const IconComponent = category.component;
  return <IconComponent size={size} />;
};

// Add a helper function to get category group by ID
export const getCategoryGroupById = (categoryId) => {
  const categories = getCategoriesFromConstants();
  
  // Look in income categories
  for (const category of categories.income) {
    if (category.id === categoryId) {
      return category.group || 'Other';
    }
  }
  
  // Look in expense categories
  for (const category of categories.expense) {
    if (category.id === categoryId) {
      return category.group || 'Other';
    }
  }
  
  return 'Uncategorized';
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
    return formatDateForStorage(start);
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
  
  return formatDateForStorage(next);
};

// Helper function to get days in month
const daysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

// Process recurring transactions for today
export const processRecurringTransactions = (date) => {
  const today = date ? new Date(date) : new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = formatDateForStorage(today);
  
  const financeData = getFinanceData();
  const processed = [];
  
  financeData.recurringTransactions.forEach(recurring => {
    // Process transactions that are due today
    if (recurring.nextDate === todayString) {
      // Create actual transaction from the recurring one
      const transaction = {
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: recurring.name,
        amount: recurring.amount,
        category: recurring.category,
        date: todayString,
        notes: `Auto-generated from recurring: ${recurring.name}`,
        recurring: recurring.id,
        timestamp: new Date().toISOString()
      };
      
      // Add the transaction
      financeData.transactions.unshift(transaction);
      processed.push(transaction);
      
      // Calculate and update next occurrence
      recurring.nextDate = calculateNextOccurrence(recurring.frequency, todayString);
    }
    
    // Process reminders for upcoming transactions
    const reminderDays = recurring.reminderDays || 3;
    const nextDueDate = new Date(recurring.nextDate);
    const reminderDate = new Date(nextDueDate);
    reminderDate.setDate(nextDueDate.getDate() - reminderDays);
    
    const reminderDateString = formatDateForStorage(reminderDate);
    if (reminderDateString === todayString && recurring.createReminder) {
      // Create a reminder/task for this upcoming transaction
      createReminderForRecurring(recurring);
    }
  });
  
  // Save updated data if any transactions were processed
  if (processed.length > 0) {
    saveFinanceData(financeData);
  }
  
  return processed;
};

// Get category name from ID - now using constant categories
export const getCategoryById = (categoryId) => {
  const categories = getCategoriesFromConstants();
  
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

// Group transactions by category group
export const groupTransactionsByCategoryGroup = (transactions) => {
  const groupedTransactions = {};
  
  transactions.forEach(transaction => {
    if (!transaction.category) return;
    
    const group = getCategoryGroupById(transaction.category);
    if (!groupedTransactions[group]) {
      groupedTransactions[group] = [];
    }
    
    groupedTransactions[group].push(transaction);
  });
  
  return groupedTransactions;
};

// Get spending breakdown by category group
export const getSpendingByGroup = (transactions, dateRange) => {
  const groups = {};
  
  // Filter transactions by date if provided
  let filteredTransactions = transactions;
  if (dateRange) {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    filteredTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.timestamp);
      return txDate >= startDate && txDate <= endDate;
    });
  }
  
  // Only include expense transactions
  filteredTransactions = filteredTransactions.filter(tx => tx.amount < 0);
  
  // Group by category group
  filteredTransactions.forEach(tx => {
    if (!tx.category) return;
    
    const group = getCategoryGroupById(tx.category);
    if (!groups[group]) {
      groups[group] = { total: 0, subcategories: {} };
    }
    
    const amount = Math.abs(tx.amount);
    groups[group].total += amount;
    
    // Track subcategory spending too
    const subcategoryId = tx.category;
    if (!groups[group].subcategories[subcategoryId]) {
      const category = getCategoryById(subcategoryId);
      groups[group].subcategories[subcategoryId] = {
        id: subcategoryId,
        name: category ? category.name : 'Unknown',
        total: 0,
        color: category ? category.color : 'gray'
      };
    }
    
    groups[group].subcategories[subcategoryId].total += amount;
  });
  
  // Convert to array format
  return Object.entries(groups).map(([name, data]) => ({
    name,
    total: data.total,
    subcategories: Object.values(data.subcategories).sort((a, b) => b.total - a.total)
  })).sort((a, b) => b.total - a.total);
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
  
  // Look for category group spending patterns
  const spendingByGroup = getSpendingByGroup(financeData.transactions);
  
  if (spendingByGroup.length > 0) {
    const topGroup = spendingByGroup[0];
    const percentOfTotal = stats.expenses > 0 ? Math.round((topGroup.total / stats.expenses) * 100) : 0;
    
    if (percentOfTotal > 40) {
      insights.push({
        type: 'warning',
        title: 'High Category Spending',
        description: `${percentOfTotal}% of your expenses this month were in the "${topGroup.name}" category group.`,
        icon: 'pie-chart',
        details: topGroup.subcategories.slice(0, 3).map(sub => 
          `${sub.name}: $${sub.total.toFixed(2)} (${Math.round((sub.total / topGroup.total) * 100)}% of ${topGroup.name} spending)`
        )
      });
      
      if (percentOfTotal > 60) {
        financialHealthScore -= 15;
      } else {
        financialHealthScore -= 5;
      }
    }
    
    // Look for subcategory insights
    if (topGroup.subcategories.length > 0) {
      const topSubcategory = topGroup.subcategories[0];
      const subcategoryPercent = Math.round((topSubcategory.total / topGroup.total) * 100);
      
      if (subcategoryPercent > 70) {
        insights.push({
          type: 'info',
          title: 'Spending Concentration',
          description: `${subcategoryPercent}% of your ${topGroup.name} spending goes to ${topSubcategory.name}.`,
          icon: 'focus'
        });
      }
    }
  }
  
  // Add food specific insights
  const foodGroup = spendingByGroup.find(group => group.name === 'Food');
  if (foodGroup && foodGroup.subcategories.length >= 2) {
    const groceries = foodGroup.subcategories.find(sub => sub.id === 'expense-food-groceries');
    const restaurants = foodGroup.subcategories.find(sub => sub.id === 'expense-food-restaurants');
    const takeaway = foodGroup.subcategories.find(sub => sub.id === 'expense-food-takeaway');
    
    // Calculate total spent on eating out (restaurants + takeaway)
    const eatingOutTotal = (restaurants?.total || 0) + (takeaway?.total || 0);
    const groceryTotal = groceries?.total || 0;
    
    if (eatingOutTotal > 0 && groceryTotal > 0) {
      const ratio = eatingOutTotal / groceryTotal;
      
      if (ratio > 1.5) {
        insights.push({
          type: 'warning',
          title: 'High Eating Out Expenses',
          description: `You're spending ${ratio.toFixed(1)}x more on eating out than on groceries.`,
          icon: 'utensils',
          details: [
            `Restaurants & Takeaway: $${eatingOutTotal.toFixed(2)}`,
            `Groceries: $${groceryTotal.toFixed(2)}`,
            'Consider cooking at home more often to reduce expenses.'
          ]
        });
        
        financialHealthScore -= 10;
      } else if (ratio < 0.5) {
        insights.push({
          type: 'positive',
          title: 'Good Grocery Habits',
          description: 'You\'re spending more on groceries than eating out, which is great for your budget.',
          icon: 'shopping-cart'
        });
        
        financialHealthScore += 5;
      }
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
    const date = formatDateForStorage(new Date(transaction.timestamp));
    
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
          const categoryObj = getCategoryById(category);
          const categoryName = categoryObj?.name || category;
          const categoryGroup = getCategoryGroupById(category);
          
          // Check if this specific category correlates with mood change
          if (moodDecreased) {
            correlations.push({
              type: 'negative',
              category: category,
              categoryName: categoryName,
              categoryGroup: categoryGroup,
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


// Calculate financial stats
export const calculateFinancialStats = (period = 'month') => {
  const financeData = getFinanceData();
  const now = new Date();
  now.setHours(0, 0, 0, 0);  // Normalize today's date to midnight
  
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
  const allTransactions = financeData.transactions || [];
  
  // Separate current (past + today) and future transactions
  const currentTransactions = allTransactions.filter(t => {
    const txDate = new Date(t.date || t.timestamp);
    txDate.setHours(0, 0, 0, 0);
    return txDate <= now;
  });
  
  const futureTransactions = allTransactions.filter(t => {
    const txDate = new Date(t.date || t.timestamp);
    txDate.setHours(0, 0, 0, 0);
    return txDate > now;
  });
  
  // Filter period transactions (as before)
  const periodTransactions = currentTransactions.filter(t => 
    new Date(t.timestamp) >= startDate
  );
  
  // Calculate current stats (only transactions up to today)
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
  
  // Calculate upcoming stats (future transactions)
  const upcomingIncome = futureTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const upcomingExpenses = futureTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const upcomingNet = upcomingIncome - upcomingExpenses;
  
  // Calculate projected balance (current + upcoming)
  const projectedBalance = balance + upcomingNet;
  
  // Calculate category breakdown (using only current transactions)
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
    
    const previousMonthTransactions = currentTransactions.filter(t => 
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
  
  // Calculate spending by category group
  const spendingByGroup = getSpendingByGroup(periodTransactions);
  
  // Return compiled stats with both current and upcoming data
  return {
    period,
    income,
    expenses,
    balance,
    monthlyChange,
    categoryBreakdown,
    budgets,
    spendingByGroup,
    startDate: startDateIso,
    endDate: now.toISOString(),
    // New properties for upcoming transactions
    current: {
      income,
      expenses,
      balance
    },
    upcoming: {
      income: upcomingIncome,
      expenses: upcomingExpenses,
      net: upcomingNet
    },
    projected: {
      balance: projectedBalance
    }
  };
};

// Create task from transaction
export const createTaskFromTransaction = (transaction) => {
  if (!transaction) return false;
  
  // Get transaction date
  const txDate = new Date(transaction.date || transaction.timestamp);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Skip if transaction is not in the future
  if (txDate <= today) return false;
  
  // Format the date as required for task storage
  const dateKey = formatDateForStorage(txDate);
  
  // Get existing storage
  const storage = getStorage();
  
  // Prepare day data
  if (!storage[dateKey]) {
    storage[dateKey] = {
      checked: {},
      date: dateKey
    };
  }
  
  // Get existing tasks or create a default structure
  let dayTasks = null;
  
  // Check for existing task lists in priority order
  if (storage[dateKey].customTasks) {
    dayTasks = storage[dateKey].customTasks;
  } else if (storage[dateKey].aiTasks) {
    dayTasks = storage[dateKey].aiTasks;
  } else if (storage[dateKey].defaultTasks) {
    dayTasks = storage[dateKey].defaultTasks;
  }
  
  // Create the default tasks if none exists
  if (!dayTasks) {
    dayTasks = [
      {
        title: "Daily Tasks",
        items: ["Complete morning routine", "Check email"]
      }
    ];
  }
  
  // Find or create the Finance category
  let financeCategory = dayTasks.find(category => category.title === "Finance");
  
  if (!financeCategory) {
    financeCategory = {
      title: "Finance",
      items: []
    };
    dayTasks.push(financeCategory);
  }
  
  // Create task text based on transaction type
  const isExpense = transaction.amount < 0;
  const formattedAmount = `$${Math.abs(transaction.amount).toFixed(2)}`;
  const taskText = `${isExpense ? 'Pay' : 'Receive'}: ${transaction.name} (${isExpense ? '-' : '+'}${formattedAmount})`;
  
  // Check if this task already exists
  if (!financeCategory.items.includes(taskText)) {
    financeCategory.items.push(taskText);
    
    // Add to the checked status
    if (!storage[dateKey].checked) {
      storage[dateKey].checked = {};
    }
    
    storage[dateKey].checked[taskText] = false;
    
    // Save the customTasks back to storage
    storage[dateKey].customTasks = dayTasks;
    setStorage(storage);
    
    return true;
  }
  
  return false;
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
  const reminderDateStr = formatDateForStorage(reminderDate);
  
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