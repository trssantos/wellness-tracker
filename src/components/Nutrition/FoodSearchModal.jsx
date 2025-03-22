import React, { useState } from 'react';
import { X, Search, PlusCircle } from 'lucide-react';

export const FoodSearchModal = ({ onClose, onSelectFood }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  
  // Common food items database with mood/energy impact info
  const commonFoodItems = [
    { name: 'Green Salad', category: 'Vegetables', emoji: '🥗', tags: ['healthy', 'raw'], moodImpact: 15, energyImpact: 20 },
    { name: 'Avocado Toast', category: 'Grains', emoji: '🥑', tags: ['healthy', 'breakfast'], moodImpact: 18, energyImpact: 25 },
    { name: 'Banana', category: 'Fruits', emoji: '🍌', tags: ['sweet', 'portable'], moodImpact: 12, energyImpact: 30 },
    { name: 'Greek Yogurt', category: 'Dairy', emoji: '🥛', tags: ['protein', 'probiotic'], moodImpact: 10, energyImpact: 15 },
    { name: 'Grilled Chicken', category: 'Proteins', emoji: '🍗', tags: ['protein', 'lean'], moodImpact: 5, energyImpact: 28 },
    { name: 'Salmon', category: 'Proteins', emoji: '🐟', tags: ['omega-3', 'dinner'], moodImpact: 22, energyImpact: 18 },
    { name: 'Quinoa Bowl', category: 'Grains', emoji: '🍚', tags: ['protein', 'grain'], moodImpact: 15, energyImpact: 22 },
    { name: 'Coffee', category: 'Beverages', emoji: '☕', tags: ['caffeine', 'morning'], moodImpact: 8, energyImpact: 35 },
    { name: 'Green Tea', category: 'Beverages', emoji: '🍵', tags: ['antioxidants', 'afternoon'], moodImpact: 12, energyImpact: 18 },
    { name: 'Dark Chocolate', category: 'Sweets', emoji: '🍫', tags: ['antioxidants', 'treat'], moodImpact: 20, energyImpact: 10 },
    { name: 'Almonds', category: 'Snacks', emoji: '🥜', tags: ['protein', 'fiber'], moodImpact: 8, energyImpact: 20 },
    { name: 'Blueberries', category: 'Fruits', emoji: '🫐', tags: ['antioxidants', 'sweet'], moodImpact: 18, energyImpact: 15 },
    { name: 'Sweet Potato', category: 'Vegetables', emoji: '🍠', tags: ['complex carbs', 'fiber'], moodImpact: 10, energyImpact: 25 },
    { name: 'Oatmeal', category: 'Grains', emoji: '🥣', tags: ['breakfast', 'fiber'], moodImpact: 12, energyImpact: 28 },
    { name: 'Eggs', category: 'Proteins', emoji: '🥚', tags: ['protein', 'breakfast'], moodImpact: 10, energyImpact: 22 },
    { name: 'Pizza', category: 'Fast Food', emoji: '🍕', tags: ['comfort food', 'dinner'], moodImpact: 18, energyImpact: -15 },
    { name: 'Burger', category: 'Fast Food', emoji: '🍔', tags: ['comfort food', 'lunch'], moodImpact: 15, energyImpact: -20 },
    { name: 'Ice Cream', category: 'Sweets', emoji: '🍦', tags: ['dessert', 'treat'], moodImpact: 20, energyImpact: -10 },
    { name: 'Pasta', category: 'Grains', emoji: '🍝', tags: ['dinner', 'carbs'], moodImpact: 12, energyImpact: -5 },
    { name: 'French Fries', category: 'Fast Food', emoji: '🍟', tags: ['side dish', 'fried'], moodImpact: 10, energyImpact: -25 }
  ];
  
  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.length > 0) {
      const filtered = commonFoodItems.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  };
  
  // Format impact badges
  const getImpactBadge = (label, value, isPositive) => {
    const baseClasses = "text-xs px-2 py-0.5 rounded-full flex items-center gap-1";
    let colorClasses = "";
    
    if (isPositive) {
      colorClasses = "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
    } else {
      colorClasses = "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
    }
    
    return (
      <span className={`${baseClasses} ${colorClasses}`}>
        {label}: {value > 0 ? '+' : ''}{value}%
      </span>
    );
  };

  return (
    <div className="modal-content max-w-md w-full" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3 className="modal-title">Quick Food Search</h3>
        <button onClick={onClose} className="modal-close-button">
          <X size={20} />
        </button>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search foods, categories, or tags..."
          className="w-full pl-10 p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors dark:bg-slate-700 dark:text-white"
          autoFocus
        />
      </div>
      
      <div className="mb-2 text-sm text-slate-500 dark:text-slate-400">
        {searchQuery ? `${filteredItems.length} results found` : 'Type to search common foods'}
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredItems.map((item, index) => (
          <div 
            key={index}
            className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            onClick={() => onSelectFood(item)}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{item.emoji}</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
              </div>
              <button className="text-red-500 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                <PlusCircle size={18} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-full">
                {item.category}
              </span>
              
              <div className="flex gap-1">
                {item.moodImpact && getImpactBadge("Mood", item.moodImpact, item.moodImpact > 0)}
                {item.energyImpact && getImpactBadge("Energy", item.energyImpact, item.energyImpact > 0)}
              </div>
            </div>
            
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.map((tag, tagIdx) => (
                  <span
                    key={tagIdx}
                    className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {searchQuery && filteredItems.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-2">No matching foods found</p>
            <button
              onClick={() => onSelectFood({ name: searchQuery, category: '', emoji: '🍽️', tags: [] })}
              className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors inline-flex items-center gap-1"
            >
              <PlusCircle size={16} />
              Add "{searchQuery}" as new item
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodSearchModal;