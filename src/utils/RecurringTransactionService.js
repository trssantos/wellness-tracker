// src/utils/RecurringTransactionService.js

import { getStorage, setStorage } from './storage';

// A safer, extremely limited service for generating future transactions
class RecurringTransactionService {
  constructor() {
    this.isProcessing = false;
    this.hasProcessedThisSession = false;
  }

  // Safe initialization with multiple safeguards
  init() {
    // Don't run if we've already processed this session
    if (this.hasProcessedThisSession) {
      console.log('Transaction service already processed this session, skipping');
      return;
    }

    // Skip if already processing
    if (this.isProcessing) {
      console.log('Transaction service is already processing, skipping');
      return;
    }

    // Get initialization timestamp from localStorage
    const lastInit = localStorage.getItem('lastTransactionServiceInit');
    const now = Date.now();
    
    // Only process at most once per hour
    if (lastInit && (now - parseInt(lastInit, 10)) < 3600000) {
      console.log('Transaction service was initialized in the last hour, skipping');
      return;
    }

    // Set processing flag
    this.isProcessing = true;
    
    // Process current month transactions
    try {
      console.log('Processing current month transactions - safely');
      this.processSafely();
      
      // Update flags to prevent reprocessing
      this.hasProcessedThisSession = true;
      localStorage.setItem('lastTransactionServiceInit', now.toString());
    } catch (error) {
      console.error('Error processing transactions:', error);
    } finally {
      // Always clear the processing flag
      this.isProcessing = false;
    }
  }

  // Extremely limited processing with multiple safety checks
  processSafely() {
    const storage = getStorage();
    
    // If finance data doesn't exist, return early
    if (!storage.finance) {
      console.log('No finance data found');
      return;
    }
    
    // Extract required data
    const { transactions = [], recurringTransactions = [] } = storage.finance;
    
    // If no recurring transactions, return early
    if (recurringTransactions.length === 0) {
      console.log('No recurring transactions found');
      return;
    }
    
    // Calculate current month dates
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    console.log(`Processing recurring transactions for ${firstDayOfMonth.toDateString()} to ${lastDayOfMonth.toDateString()}`);
    
    // Track new transactions
    const newTransactions = [];
    
    // STRICT LIMIT: Process maximum 100 items to prevent runaway processing
    const processLimit = 100;
    let processCount = 0;
    
    // Process each recurring transaction
    recurringTransactions.forEach(recurring => {
      // SAFETY CHECK: Skip if no nextDate
      if (!recurring.nextDate) return;
      
      try {
        // Parse the date
        const nextDate = new Date(recurring.nextDate);
        
        // SAFETY CHECK: Skip if invalid date
        if (isNaN(nextDate.getTime())) {
          console.log(`Invalid date for recurring transaction ${recurring.id}`);
          return;
        }
        
        // SAFETY CHECK: Skip if outside current month
        if (nextDate < firstDayOfMonth || nextDate > lastDayOfMonth) {
          return;
        }
        
        // SAFETY CHECK: Skip if we've reached our processing limit
        if (processCount >= processLimit) {
          console.log('Process limit reached, stopping');
          return;
        }
        
        // Format as YYYY-MM-DD for comparison
        const nextDateString = nextDate.toISOString().split('T')[0];
        
        // SAFETY CHECK: Check if we already have this transaction
        const exists = transactions.some(t => 
          t.recurring === recurring.id && 
          (t.date === nextDateString || 
           (t.timestamp && t.timestamp.split('T')[0] === nextDateString))
        );
        
        // Only create if it doesn't exist
        if (!exists) {
          const newTransaction = {
            id: `tx-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            name: recurring.name,
            amount: recurring.amount,
            category: recurring.category,
            date: nextDateString,
            recurring: recurring.id,
            notes: `Auto-generated from recurring: ${recurring.name}`,
            timestamp: new Date().toISOString()
          };
          
          newTransactions.push(newTransaction);
          processCount++;
          
          console.log(`Created transaction for ${recurring.name} on ${nextDateString}`);
        }
      } catch (error) {
        console.error(`Error processing recurring transaction ${recurring.id}:`, error);
      }
    });
    
    // If we created new transactions, save them
    if (newTransactions.length > 0) {
      console.log(`Created ${newTransactions.length} new transactions`);
      
      // Update storage with new transactions
      storage.finance = {
        ...storage.finance,
        transactions: [...newTransactions, ...transactions]
      };
      
      setStorage(storage);
    } else {
      console.log('No new transactions created');
    }
  }
}

// Single global instance
const recurringTransactionService = new RecurringTransactionService();
export default recurringTransactionService;