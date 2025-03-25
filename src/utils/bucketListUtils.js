import { getStorage, setStorage } from './storage';

// Initialize default categories if they don't exist
const initializeDefaultCategories = () => {
  const storage = getStorage();
  
  // Check if we have the bucketList property
  if (!storage.bucketList) {
    storage.bucketList = {
      categories: [
        { id: 'experiences', name: 'Experiences' },
        { id: 'personal', name: 'Personal Growth' },
        { id: 'fitness', name: 'Health & Fitness' },
        { id: 'career', name: 'Career' },
        { id: 'finance', name: 'Financial' },
        { id: 'creative', name: 'Creative' }
      ],
      goals: [],
      visionBoard: []
    };
    
    setStorage(storage);
  } else if (!storage.bucketList.categories) {
    // Make sure categories array exists
    storage.bucketList.categories = [
      { id: 'experiences', name: 'Experiences' },
      { id: 'personal', name: 'Personal Growth' },
      { id: 'fitness', name: 'Health & Fitness' },
      { id: 'career', name: 'Career' },
      { id: 'finance', name: 'Financial' },
      { id: 'creative', name: 'Creative' }
    ];
    
    setStorage(storage);
  }
  
  return storage.bucketList;
};

// Generate a unique ID
const generateId = (prefix = 'goal') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Get all categories
export const getCategories = () => {
  const bucketList = initializeDefaultCategories();
  return bucketList.categories || [];
};

// Create a new category
export const createCategory = (categoryData) => {
  const storage = getStorage();
  
  if (!storage.bucketList) {
    initializeDefaultCategories();
  }
  
  const newCategory = {
    id: generateId('cat'),
    name: categoryData.name,
    createdAt: new Date().toISOString()
  };
  
  storage.bucketList.categories.push(newCategory);
  setStorage(storage);
  
  return newCategory;
};

// Update a category
export const updateCategory = (categoryId, updates) => {
  const storage = getStorage();
  
  if (!storage.bucketList || !storage.bucketList.categories) {
    return null;
  }
  
  const categoryIndex = storage.bucketList.categories.findIndex(c => c.id === categoryId);
  
  if (categoryIndex === -1) {
    return null;
  }
  
  const updatedCategory = {
    ...storage.bucketList.categories[categoryIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  storage.bucketList.categories[categoryIndex] = updatedCategory;
  setStorage(storage);
  
  return updatedCategory;
};

// Delete a category
export const deleteCategory = (categoryId) => {
  const storage = getStorage();
  
  if (!storage.bucketList || !storage.bucketList.categories) {
    return false;
  }
  
  const initialLength = storage.bucketList.categories.length;
  storage.bucketList.categories = storage.bucketList.categories.filter(c => c.id !== categoryId);
  
  // If we actually deleted something
  if (initialLength !== storage.bucketList.categories.length) {
    // Update any goals that used this category
    if (storage.bucketList.goals) {
      storage.bucketList.goals = storage.bucketList.goals.map(goal => {
        if (goal.category === categoryId) {
          return { ...goal, category: '' };
        }
        return goal;
      });
    }
    
    setStorage(storage);
    return true;
  }
  
  return false;
};

// Get all goals
export const getGoals = () => {
  const bucketList = initializeDefaultCategories();
  return bucketList.goals || [];
};

// Create a new goal
export const createGoal = (goalData) => {
  const storage = getStorage();
  
  if (!storage.bucketList) {
    initializeDefaultCategories();
  }
  
  // Calculate completed milestones if there are any
  let completedMilestones = 0;
  if (goalData.milestones && Array.isArray(goalData.milestones)) {
    completedMilestones = goalData.milestones.filter(m => m.completed).length;
  }
  
  const newGoal = {
    id: generateId('goal'),
    title: goalData.title,
    description: goalData.description || '',
    category: goalData.category || '',
    progressType: goalData.progressType || 'simple',
    progress: goalData.progress || 0,
    currentValue: goalData.currentValue || 0,
    targetValue: goalData.targetValue || 100,
    targetDate: goalData.targetDate || '',
    priority: goalData.priority || 'medium',
    completed: goalData.completed || false,
    milestones: goalData.milestones || [],
    completedMilestones: completedMilestones,
    integrations: goalData.integrations || {
      habitIds: [],
      financeGoalId: null
    },
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
  
  if (!storage.bucketList.goals) {
    storage.bucketList.goals = [];
  }
  
  storage.bucketList.goals.push(newGoal);
  setStorage(storage);
  
  return newGoal;
};

// Update a goal
export const updateGoal = (goalId, updates) => {
  const storage = getStorage();
  
  if (!storage.bucketList || !storage.bucketList.goals) {
    return null;
  }
  
  const goalIndex = storage.bucketList.goals.findIndex(g => g.id === goalId);
  
  if (goalIndex === -1) {
    return null;
  }
  
  // Calculate completed milestones if they are provided
  let completedMilestones = storage.bucketList.goals[goalIndex].completedMilestones;
  if (updates.milestones && Array.isArray(updates.milestones)) {
    completedMilestones = updates.milestones.filter(m => m.completed).length;
  }
  
  const updatedGoal = {
    ...storage.bucketList.goals[goalIndex],
    ...updates,
    completedMilestones,
    modifiedAt: new Date().toISOString()
  };
  
  storage.bucketList.goals[goalIndex] = updatedGoal;
  setStorage(storage);
  
  return updatedGoal;
};

// Delete a goal
export const deleteGoal = (goalId) => {
  const storage = getStorage();
  
  if (!storage.bucketList || !storage.bucketList.goals) {
    return false;
  }
  
  const initialLength = storage.bucketList.goals.length;
  storage.bucketList.goals = storage.bucketList.goals.filter(g => g.id !== goalId);
  
  if (initialLength !== storage.bucketList.goals.length) {
    setStorage(storage);
    return true;
  }
  
  return false;
};

// Get goals by category
export const getGoalsByCategory = (categoryId) => {
  const goals = getGoals();
  
  if (categoryId === 'all') {
    return goals;
  }
  
  return goals.filter(goal => goal.category === categoryId);
};

// Get goals by status
export const getGoalsByStatus = (status) => {
  const goals = getGoals();
  
  if (status === 'completed') {
    return goals.filter(goal => goal.completed);
  } else if (status === 'active') {
    return goals.filter(goal => !goal.completed);
  }
  
  return goals;
};

// Get goal stats for summary
export const getSummaryStats = () => {
  const goals = getGoals();
  
  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.completed).length;
  const inProgressGoals = totalGoals - completedGoals;
  
  let totalProgress = 0;
  let goalsWithProgress = 0;
  
  goals.forEach(goal => {
    if (goal.progressType === 'percentage') {
      totalProgress += goal.progress;
      goalsWithProgress++;
    } else if (goal.progressType === 'counter' && goal.targetValue > 0) {
      const progress = (goal.currentValue / goal.targetValue) * 100;
      totalProgress += progress;
      goalsWithProgress++;
    } else if (goal.progressType === 'milestone' && goal.milestones && goal.milestones.length > 0) {
      const completed = goal.milestones.filter(m => m.completed).length;
      const progress = (completed / goal.milestones.length) * 100;
      totalProgress += progress;
      goalsWithProgress++;
    } else if (goal.completed) {
      totalProgress += 100;
      goalsWithProgress++;
    }
  });
  
  const avgCompletionRate = goalsWithProgress > 0 ? Math.round(totalProgress / goalsWithProgress) : 0;
  
  return {
    totalGoals,
    completedGoals,
    inProgressGoals,
    avgCompletionRate
  };
};

// Vision Board functions
export const getVisionBoardItems = () => {
  const bucketList = initializeDefaultCategories();
  return bucketList.visionBoard || [];
};

export const addVisionBoardItem = (itemData) => {
  const storage = getStorage();
  
  if (!storage.bucketList) {
    initializeDefaultCategories();
  }
  
  const newItem = {
    id: generateId('vision'),
    title: itemData.title,
    description: itemData.description || '',
    color: itemData.color || '#3b82f6',
    icon: itemData.icon || 'default',
    createdAt: new Date().toISOString()
  };
  
  if (!storage.bucketList.visionBoard) {
    storage.bucketList.visionBoard = [];
  }
  
  storage.bucketList.visionBoard.push(newItem);
  setStorage(storage);
  
  return newItem;
};

export const updateVisionBoardItem = (itemId, updates) => {
  const storage = getStorage();
  
  if (!storage.bucketList || !storage.bucketList.visionBoard) {
    return null;
  }
  
  const itemIndex = storage.bucketList.visionBoard.findIndex(i => i.id === itemId);
  
  if (itemIndex === -1) {
    return null;
  }
  
  const updatedItem = {
    ...storage.bucketList.visionBoard[itemIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  storage.bucketList.visionBoard[itemIndex] = updatedItem;
  setStorage(storage);
  
  return updatedItem;
};

export const deleteVisionBoardItem = (itemId) => {
  const storage = getStorage();
  
  if (!storage.bucketList || !storage.bucketList.visionBoard) {
    return false;
  }
  
  const initialLength = storage.bucketList.visionBoard.length;
  storage.bucketList.visionBoard = storage.bucketList.visionBoard.filter(i => i.id !== itemId);
  
  if (initialLength !== storage.bucketList.visionBoard.length) {
    setStorage(storage);
    return true;
  }
  
  return false;
};