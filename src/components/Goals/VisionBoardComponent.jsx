import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Plus, Edit, Trash2, Image, 
  X, Heart, Star, Award, Sun, PlusCircle,
  Compass, Mountain, Brain, Dumbbell, Briefcase, 
  Wallet, Zap, Camera, Share2, DownloadCloud, Save,
  // New icons for view modes
  LayoutGrid, Move, 
  // Info icon for help tooltip
  Info, HelpCircle, Target, AlertCircle
} from 'lucide-react';
import { getVisionBoardItems, addVisionBoardItem, updateVisionBoardItem, deleteVisionBoardItem } from '../../utils/bucketListUtils';
import { getStorage, setStorage } from '../../utils/storage';


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
  const [showExplanation, setShowExplanation] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // For improved drag and drop
  const [positions, setPositions] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Ref for the drag container
  const dragContainerRef = useRef(null);
  
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
  
  // Load saved positions on component mount
  useEffect(() => {
    const storage = getStorage();
    if (storage.bucketList?.visionBoardPositions) {
      setPositions(storage.bucketList.visionBoardPositions);
    }
  }, []);
  
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
  
  // Show delete confirmation modal
  const showDeleteModal = (itemId) => {
    setItemToDelete(itemId);
    setShowDeleteConfirm(true);
  };
  
  // Handle delete vision item
  const handleDeleteItem = () => {
    if (itemToDelete) {
      deleteVisionBoardItem(itemToDelete);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
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
      left: `${Math.floor(Math.random() * 85)}%`,
      top: `${Math.floor(Math.random() * 85)}%`,
      transform: `rotate(${Math.floor(Math.random() * 10 - 5)}deg)`
    };
  };
  
  // Load saved positions when items load
  useEffect(() => {
    // Create initial positions for items that don't have saved positions
    const initialPositions = {};
    items.forEach(item => {
      if (!positions[item.id]) {
        initialPositions[item.id] = getRandomPosition();
      }
    });
    
    if (Object.keys(initialPositions).length > 0) {
      setPositions(prev => ({
        ...prev,
        ...initialPositions
      }));
    }
  }, [items]);
  
  // Improved drag handlers for both mouse and touch events
  const handleDragStart = (e, itemId) => {
    e.preventDefault(); // Prevent default behavior
    
    const target = e.currentTarget;
    const boundingRect = target.getBoundingClientRect();
    
    // Calculate the offset from the mouse position or touch position to the top-left corner of the element
    let clientX, clientY;
    
    if (e.type === 'touchstart') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const offsetX = clientX - boundingRect.left;
    const offsetY = clientY - boundingRect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDragItem(itemId);
    setIsDragging(true);
    
    // Prevent scrolling on mobile during drag
    if (dragContainerRef.current) {
      dragContainerRef.current.style.overflow = 'hidden';
      dragContainerRef.current.style.touchAction = 'none';
    }
    
    // For mouse events, set the dataTransfer
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', itemId);
      
      // Make the drag image transparent
      const dragImage = document.createElement('div');
      dragImage.style.width = '1px';
      dragImage.style.height = '1px';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      
      // Remove the element after the drag starts
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }
  };
  
  const handleDragMove = (e) => {
    e.preventDefault(); // Prevent default behavior including scrolling
    
    if (dragItem && isDragging && dragContainerRef.current) {
      // Get the container position
      const container = dragContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      // Get client coordinates from mouse or touch event
      let clientX, clientY;
      
      if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      // Calculate the new position considering the drag offset
      const newX = ((clientX - containerRect.left - dragOffset.x) / containerRect.width) * 100;
      const newY = ((clientY - containerRect.top - dragOffset.y) / containerRect.height) * 100;
      
      // Clamp the values to keep the item within the container
      const clampedX = Math.max(0, Math.min(newX, 95));
      const clampedY = Math.max(0, Math.min(newY, 95));
      
      // Update the position
      setPositions(prev => ({
        ...prev,
        [dragItem]: {
          left: `${clampedX}%`,
          top: `${clampedY}%`,
          transform: prev[dragItem]?.transform || 'rotate(0deg)'
        }
      }));
    }
  };
  
  const handleDragEnd = (e) => {
    if (e) {
      e.preventDefault(); // Prevent default behavior
    }
    
    setIsDragging(false);
    setDragItem(null);
    
    // Re-enable scrolling
    if (dragContainerRef.current) {
      dragContainerRef.current.style.overflow = 'auto';
      dragContainerRef.current.style.touchAction = 'auto';
    }
    
    // Save positions to storage
    const storage = getStorage();
    if (!storage.bucketList) {
      storage.bucketList = {};
    }
    if (!storage.bucketList.visionBoardPositions) {
      storage.bucketList.visionBoardPositions = {};
    }
    storage.bucketList.visionBoardPositions = positions;
    setStorage(storage);
  };
  
  // Add event listeners for touch events
  useEffect(() => {
    const container = dragContainerRef.current;
    
    if (container && viewMode === 'flow') {
      // Passive: false is crucial to be able to preventDefault in the handlers
      container.addEventListener('touchmove', handleDragMove, { passive: false });
      
      return () => {
        container.removeEventListener('touchmove', handleDragMove);
      };
    }
  }, [dragItem, isDragging, dragOffset, viewMode]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="text-amber-500 flex-shrink-0" />
            <span className="truncate">Vision Board</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span className="truncate">Visualize your dreams</span>
            <button
              onClick={() => setShowExplanation(true)}
              className="text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 flex-shrink-0"
              title="Learn more about Vision Boards"
            >
              <Info size={14} />
            </button>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 flex items-center ${
                viewMode === 'grid' 
                  ? 'bg-amber-500 dark:bg-amber-600 text-white' 
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('flow')}
              className={`p-2 flex items-center ${
                viewMode === 'flow' 
                  ? 'bg-amber-500 dark:bg-amber-600 text-white' 
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
              title="Free Canvas View"
            >
              <Move size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-sm">
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
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Vision Board Items */}
              {items.map(item => (
                <div 
                  key={item.id}
                  className="relative group overflow-hidden bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow"
                  style={{ borderTopColor: item.color, borderTopWidth: '4px' }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
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
                          onClick={() => showDeleteModal(item.id)}
                          className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-white dark:bg-slate-700 rounded-md"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2 truncate">
                      {item.title}
                    </h3>
                    
                    {item.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
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
        <div className="bg-gradient-to-br from-amber-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 p-4 sm:p-6 rounded-xl shadow-sm min-h-[400px] relative">
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
            <div 
              ref={dragContainerRef}
              className="relative h-[600px] overflow-hidden bg-slate-50 dark:bg-slate-800/50 rounded-lg"
              onMouseMove={isDragging ? handleDragMove : null}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              onTouchEnd={handleDragEnd}
              onTouchCancel={handleDragEnd}
            >
              {/* Randomly positioned vision items with improved drag */}
              {items.map(item => (
                <div
                  key={item.id}
                  className={`absolute p-4 w-48 sm:w-52 bg-white dark:bg-slate-700 rounded-xl shadow-lg cursor-move transition-transform duration-200 hover:z-10 hover:shadow-xl ${isDragging && dragItem === item.id ? 'opacity-70' : 'opacity-100'}`}
                  style={{
                    ...positions[item.id],
                    zIndex: hoveredItem === item.id ? 10 : dragItem === item.id ? 20 : 1,
                    borderLeft: `4px solid ${item.color}`
                  }}
                  onMouseDown={(e) => handleDragStart(e, item.id)}
                  onTouchStart={(e) => handleDragStart(e, item.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
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
                        onClick={() => showDeleteModal(item.id)}
                        className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-white dark:bg-slate-700 rounded-md"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1 truncate">
                    {item.title}
                  </h3>
                  
                  {item.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
              
              {/* Info banner when empty in flow view */}
              {viewMode === 'flow' && items.length === 0 && !isAddingItem && (
                <div className="absolute bottom-24 left-0 right-0 mx-auto max-w-md bg-white dark:bg-slate-700 p-3 rounded-lg shadow-md border border-amber-200 dark:border-amber-800 text-center">
                  <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1">
                    <Info size={14} className="text-amber-500 flex-shrink-0" />
                    <span>Dreams are aspirational visions of what you want to manifest in your life</span>
                  </p>
                </div>
              )}
              
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
      
      {/* Vision Board Explanation Modal */}
      {showExplanation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={() => setShowExplanation(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-4 sm:p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sparkles className="text-amber-500 flex-shrink-0" size={20} />
                <span>Vision Board vs. Goals</span>
              </h3>
              <button 
                onClick={() => setShowExplanation(false)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1">
                  <Sparkles size={16} className="flex-shrink-0" />
                  <span>Vision Board: Dreams & Aspirations</span>
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Your Vision Board is a visual representation of what you want to manifest in your life. Dreams are aspirational, inspirational, and connect to the "why" behind your actions.
                </p>
              </div>
              
              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1">
                  <Target size={16} className="flex-shrink-0" />
                  <span>Bucket List: Goals & Plans</span>
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Your Bucket List contains specific, measurable goals with tracking methods, deadlines, and completion criteria. Goals focus on the "how" and "what" of achievement.
                </p>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Research shows that using both approaches together is powerful: The Vision Board keeps you inspired and connected to your "why," while the Bucket List provides the structure to turn those dreams into reality.
              </p>
              
              <div className="flex justify-between items-center mt-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <LayoutGrid size={14} className="flex-shrink-0" /> Grid
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Move size={14} className="flex-shrink-0" /> Canvas
                  </span>
                </div>
                <button
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  onClick={() => setShowExplanation(false)}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-4 sm:p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200">
                  Delete Dream
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Are you sure you want to delete this dream from your vision board?
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add/Edit Dream Modal (always shows as modal) */}
      {(isAddingItem || isEditingItem) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200">
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
              
              <div className="flex gap-2 justify-end">
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
    </div>
  );
};

export default VisionBoardComponent;