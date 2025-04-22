import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Plus, Edit, Trash2, Eye, Image, 
  X, EyeOff, Heart, Star, Award, Sun, PlusCircle,
  Compass, Mountain, Brain, Dumbbell, Briefcase, 
  Wallet, Zap, Camera, Share2, DownloadCloud, Save
} from 'lucide-react';
import { getVisionBoardItems, addVisionBoardItem, updateVisionBoardItem, deleteVisionBoardItem } from '../../utils/bucketListUtils';

const VisionBoardComponent = () => {
  const [items, setItems] = useState([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    color: '#3b82f6', // Default blue
    icon: 'star'
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'flow'
  const [dragItem, setDragItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Available colors and icons
  const colors = [
    { id: 'blue', value: '#3b82f6' },
    { id: 'purple', value: '#8b5cf6' },
    { id: 'pink', value: '#ec4899' },
    { id: 'red', value: '#ef4444' },
    { id: 'orange', value: '#f97316' },
    { id: 'amber', value: '#f59e0b' },
    { id: 'yellow', value: '#eab308' },
    { id: 'lime', value: '#84cc16' },
    { id: 'green', value: '#22c55e' },
    { id: 'teal', value: '#14b8a6' },
    { id: 'cyan', value: '#06b6d4' },
    { id: 'indigo', value: '#6366f1' }
  ];
  
  const icons = [
    { id: 'star', component: <Star size={24} /> },
    { id: 'heart', component: <Heart size={24} /> },
    { id: 'award', component: <Award size={24} /> },
    { id: 'sun', component: <Sun size={24} /> },
    { id: 'compass', component: <Compass size={24} /> },
    { id: 'mountain', component: <Mountain size={24} /> },
    { id: 'brain', component: <Brain size={24} /> },
    { id: 'dumbbell', component: <Dumbbell size={24} /> },
    { id: 'briefcase', component: <Briefcase size={24} /> },
    { id: 'wallet', component: <Wallet size={24} /> },
    { id: 'sparkles', component: <Sparkles size={24} /> },
    { id: 'zap', component: <Zap size={24} /> }
  ];
  
  // Load vision board items
  useEffect(() => {
    loadItems();
  }, []);
  
  const loadItems = () => {
    const loadedItems = getVisionBoardItems();
    setItems(loadedItems);
  };
  
  // Handle add new vision item
  const handleAddItem = () => {
    if (!newItem.title.trim()) return;
    
    addVisionBoardItem(newItem);
    setNewItem({
      title: '',
      description: '',
      color: '#3b82f6',
      icon: 'star'
    });
    setIsAddingItem(false);
    loadItems();
  };
  
  // Handle update vision item
  const handleUpdateItem = () => {
    if (!newItem.title.trim() || !isEditingItem) return;
    
    updateVisionBoardItem(isEditingItem, newItem);
    setNewItem({
      title: '',
      description: '',
      color: '#3b82f6',
      icon: 'star'
    });
    setIsEditingItem(null);
    loadItems();
  };
  
  // Handle delete vision item
  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this vision board item?')) {
      deleteVisionBoardItem(itemId);
      loadItems();
    }
  };
  
  // Start editing an item
  const handleEditItem = (item) => {
    setNewItem({
      title: item.title,
      description: item.description || '',
      color: item.color || '#3b82f6',
      icon: item.icon || 'star'
    });
    setIsEditingItem(item.id);
  };
  
  // Render icon based on icon name
  const renderIcon = (iconName, color = 'currentColor') => {
    const icon = icons.find(i => i.id === iconName);
    if (!icon) return <Star size={24} style={{ color }} />;
    
    return React.cloneElement(icon.component, { style: { color } });
  };
  
  // Generate a random position for flow layout
  const getRandomPosition = () => {
    return {
      left: `${Math.floor(Math.random() * 65)}%`,
      top: `${Math.floor(Math.random() * 65)}%`,
      transform: `rotate(${Math.floor(Math.random() * 10 - 5)}deg)`
    };
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="text-amber-500" />
            <span>Vision Board</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Visualize your dreams and aspirations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid' 
                  ? 'bg-amber-500 dark:bg-amber-600 text-white' 
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
              title="Grid View"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => setViewMode('flow')}
              className={`p-2 ${
                viewMode === 'flow' 
                  ? 'bg-amber-500 dark:bg-amber-600 text-white' 
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
              title="Flow View"
            >
              <EyeOff size={18} />
            </button>
          </div>
          
          <button 
            onClick={() => {
              setIsAddingItem(true);
              setIsEditingItem(null);
              setNewItem({
                title: '',
                description: '',
                color: '#3b82f6',
                icon: 'star'
              });
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg shadow-sm flex items-center gap-2 transition-all"
          >
            <Plus size={18} />
            <span className="font-medium">Add Dream</span>
          </button>
        </div>
      </div>
      
      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
          {items.length === 0 && !isAddingItem ? (
            <div className="text-center py-12">
              <div className="bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image size={32} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                Your vision board is empty
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                Add your dreams, aspirations, and goals to create a visual representation of what you want to achieve.
              </p>
              <button
                onClick={() => {
                  setIsAddingItem(true);
                  setIsEditingItem(null);
                  setNewItem({
                    title: '',
                    description: '',
                    color: '#3b82f6',
                    icon: 'star'
                  });
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg inline-flex items-center gap-2"
              >
                <Plus size={18} />
                <span>Add Your First Dream</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* New Item Form */}
              {(isAddingItem || isEditingItem) && (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                      {isEditingItem ? 'Edit Dream' : 'Add Dream'}
                    </h3>
                    <button 
                      onClick={() => {
                        setIsAddingItem(false);
                        setIsEditingItem(null);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Title*
                      </label>
                      <input
                        type="text"
                        value={newItem.title}
                        onChange={e => setNewItem({...newItem, title: e.target.value})}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                        placeholder="e.g., Visit Paris"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={newItem.description}
                        onChange={e => setNewItem({...newItem, description: e.target.value})}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                        placeholder="Why is this important to you?"
                        rows="3"
                      ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {colors.map(color => (
                            <button
                              key={color.id}
                              type="button"
                              onClick={() => setNewItem({...newItem, color: color.value})}
                              className={`w-6 h-6 rounded-full ${
                                newItem.color === color.value ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500' : ''
                              }`}
                              style={{ backgroundColor: color.value }}
                            ></button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Icon
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {icons.map(icon => (
                            <button
                              key={icon.id}
                              type="button"
                              onClick={() => setNewItem({...newItem, icon: icon.id})}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                                newItem.icon === icon.id 
                                  ? 'bg-slate-200 dark:bg-slate-600' 
                                  : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                              }`}
                            >
                              {React.cloneElement(icon.component, { size: 18, color: newItem.color })}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingItem(false);
                          setIsEditingItem(null);
                        }}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={isEditingItem ? handleUpdateItem : handleAddItem}
                        disabled={!newItem.title.trim()}
                        className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
                          !newItem.title.trim()
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                            : 'bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-700'
                        }`}
                      >
                        <Save size={18} />
                        <span>{isEditingItem ? 'Update' : 'Save'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Vision Board Items */}
              {items.map(item => (
                <div 
                  key={item.id}
                  className="relative group overflow-hidden bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow"
                  style={{ borderTopColor: item.color, borderTopWidth: '4px' }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center">
                        {renderIcon(item.icon, item.color)}
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-1 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 bg-white dark:bg-slate-700 rounded-md"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-white dark:bg-slate-700 rounded-md"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                      {item.title}
                    </h3>
                    
                    {item.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Add Item Button (shown in grid view when there are already items) */}
              {items.length > 0 && !isAddingItem && !isEditingItem && (
                <button
                  onClick={() => setIsAddingItem(true)}
                  className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors h-full"
                >
                  <PlusCircle size={24} className="mb-2" />
                  <span>Add Dream</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        // Flow View - more creative, free-form layout
        <div className="bg-gradient-to-br from-amber-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 p-6 rounded-xl shadow-sm min-h-[400px] relative">
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
              title="Take Screenshot"
            >
              <Camera size={18} />
            </button>
            <button
              className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
              title="Share Vision Board"
            >
              <Share2 size={18} />
            </button>
            <button
              className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
              title="Download Vision Board"
            >
              <DownloadCloud size={18} />
            </button>
          </div>
          
          {items.length === 0 && !isAddingItem ? (
            <div className="text-center pt-16 pb-20">
              <div className="bg-white dark:bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Sparkles size={36} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                Your vision board awaits
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                Add your dreams and goals to create a beautiful vision board that inspires you daily.
              </p>
              <button
                onClick={() => setIsAddingItem(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg inline-flex items-center gap-2 shadow-md"
              >
                <Plus size={18} />
                <span>Start Creating</span>
              </button>
            </div>
          ) : (
            <div className="relative h-[600px] overflow-hidden">
              {/* New Item Form (centered in flow view) */}
              {(isAddingItem || isEditingItem) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-20">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg max-w-lg w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                        {isEditingItem ? 'Edit Dream' : 'Add Dream'}
                      </h3>
                      <button 
                        onClick={() => {
                          setIsAddingItem(false);
                          setIsEditingItem(null);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Title*
                        </label>
                        <input
                          type="text"
                          value={newItem.title}
                          onChange={e => setNewItem({...newItem, title: e.target.value})}
                          className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                          placeholder="e.g., Visit Paris"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Description
                        </label>
                        <textarea
                          value={newItem.description}
                          onChange={e => setNewItem({...newItem, description: e.target.value})}
                          className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                          placeholder="Why is this important to you?"
                          rows="3"
                        ></textarea>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Color
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {colors.map(color => (
                              <button
                                key={color.id}
                                type="button"
                                onClick={() => setNewItem({...newItem, color: color.value})}
                                className={`w-6 h-6 rounded-full ${
                                  newItem.color === color.value ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500' : ''
                                }`}
                                style={{ backgroundColor: color.value }}
                              ></button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Icon
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {icons.map(icon => (
                              <button
                                key={icon.id}
                                type="button"
                                onClick={() => setNewItem({...newItem, icon: icon.id})}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                                  newItem.icon === icon.id 
                                    ? 'bg-slate-200 dark:bg-slate-600' 
                                    : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                                }`}
                              >
                                {React.cloneElement(icon.component, { size: 18, color: newItem.color })}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingItem(false);
                            setIsEditingItem(null);
                          }}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={isEditingItem ? handleUpdateItem : handleAddItem}
                          disabled={!newItem.title.trim()}
                          className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
                            !newItem.title.trim()
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                              : 'bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-700'
                          }`}
                        >
                          <Save size={18} />
                          <span>{isEditingItem ? 'Update' : 'Save'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Randomly positioned vision items */}
              {items.map(item => {
                const randomPos = getRandomPosition();
                
                return (
                  <div
                    key={item.id}
                    className="absolute p-4 w-52 bg-white dark:bg-slate-700 rounded-xl shadow-lg cursor-move transition-all duration-200 hover:z-10 hover:shadow-xl"
                    style={{
                      ...randomPos,
                      borderLeft: `4px solid ${item.color}`,
                      zIndex: hoveredItem === item.id ? 10 : 1
                    }}
                    draggable={true}
                    onDragStart={() => setDragItem(item.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center">
                        {renderIcon(item.icon, item.color)}
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-1 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 bg-white dark:bg-slate-700 rounded-md"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-white dark:bg-slate-700 rounded-md"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">
                      {item.title}
                    </h3>
                    
                    {item.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })}
              
              {/* Add Button (for flow view) */}
              {!isAddingItem && !isEditingItem && (
                <button
                  onClick={() => setIsAddingItem(true)}
                  className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white shadow-lg flex items-center justify-center z-10"
                >
                  <Plus size={24} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisionBoardComponent;