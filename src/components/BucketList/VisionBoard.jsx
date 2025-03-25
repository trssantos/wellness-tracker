import React, { useState, useEffect } from 'react';
import { Plus, Image, Edit2, Trash2, X, Save, Info, MessageCircle, User, ExternalLink } from 'lucide-react';
import { getVisionBoardItems, addVisionBoardItem, updateVisionBoardItem, deleteVisionBoardItem } from '../../utils/bucketListUtils';

const VisionBoard = () => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#3b82f6',
    icon: 'default'
  });
  
  // Available color options and icons
  const colorOptions = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Green', value: '#10b981' },
    { name: 'Teal', value: '#14b8a6' }
  ];
  
  const iconOptions = [
    { name: 'Default', value: 'default' },
    { name: 'User', value: 'user' },
    { name: 'Message', value: 'message' },
    { name: 'Link', value: 'link' }
  ];
  
  // Load vision board items on component mount
  useEffect(() => {
    const loadedItems = getVisionBoardItems();
    setItems(loadedItems);
  }, []);
  
  // Get icon component based on icon name
  const getIconComponent = (iconName, size = 24) => {
    switch(iconName) {
      case 'user': return <User size={size} />;
      case 'message': return <MessageCircle size={size} />;
      case 'link': return <ExternalLink size={size} />;
      default: return <Info size={size} />;
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle starting to edit an item
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      color: item.color,
      icon: item.icon || 'default'
    });
    setIsAddingNew(true);
  };
  
  // Handle saving an item
  const handleSave = () => {
    if (!formData.title.trim()) return;
    
    if (editingItem) {
      // Update existing item
      const updatedItem = updateVisionBoardItem(editingItem.id, formData);
      setItems(items.map(item => item.id === editingItem.id ? updatedItem : item));
    } else {
      // Add new item
      const newItem = addVisionBoardItem(formData);
      setItems([...items, newItem]);
    }
    
    // Reset form and state
    setFormData({
      title: '',
      description: '',
      color: '#3b82f6',
      icon: 'default'
    });
    setEditingItem(null);
    setIsAddingNew(false);
  };
  
  // Handle deleting an item
  const handleDelete = (itemId) => {
    if (window.confirm('Are you sure you want to remove this item from your vision board?')) {
      deleteVisionBoardItem(itemId);
      setItems(items.filter(item => item.id !== itemId));
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
          Vision Board
        </h3>
        {!isAddingNew && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-3 py-1.5 bg-amber-500 dark:bg-amber-600 text-white rounded-lg flex items-center gap-1"
          >
            <Plus size={16} />
            Add Item
          </button>
        )}
      </div>
      
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Visualize your dreams and aspirations on your digital vision board. Add notes, inspiration, and reminders of what you're working toward.
      </p>
      
      {/* Add/Edit Item Form */}
      {isAddingNew && (
        <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-slate-800 dark:text-slate-200">
              {editingItem ? 'Edit Item' : 'Add Vision Board Item'}
            </h4>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingItem(null);
              }}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                placeholder="What is your vision or aspiration?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                placeholder="Why is this important to you?"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-6 h-6 rounded-full ${
                        formData.color === color.value ? 'ring-2 ring-offset-2 ring-slate-500' : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      title={color.name}
                    ></button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map(icon => (
                    <button
                      key={icon.value}
                      type="button"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        formData.icon === icon.value 
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, icon: icon.value }))}
                      title={icon.name}
                    >
                      {getIconComponent(icon.value, 16)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-3">
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-amber-500 dark:bg-amber-600 text-white rounded-lg hover:bg-amber-600 dark:hover:bg-amber-700 flex items-center gap-1"
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Vision Board Items */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
          <Image size={48} className="text-slate-400 dark:text-slate-500 mb-3" />
          <p className="text-center text-slate-500 dark:text-slate-400 mb-4">
            Your vision board is empty. Add items to visualize your goals and dreams.
          </p>
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-4 py-2 bg-amber-500 dark:bg-amber-600 text-white rounded-lg flex items-center gap-1"
          >
            <Plus size={16} />
            Add First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map(item => (
            <div 
              key={item.id}
              className="group relative border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              style={{ backgroundColor: item.color + '15', borderColor: item.color }}
            >
              <div className="p-4">
                <div className="flex items-start mb-2">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3"
                    style={{ backgroundColor: item.color + '30', color: item.color }}
                  >
                    {getIconComponent(item.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {item.title}
                    </h4>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                  {item.description}
                </p>
                
                {/* Actions - Shown on hover */}
                <div className="absolute top-2 right-2 hidden group-hover:flex bg-white dark:bg-slate-800 rounded p-1 shadow-sm">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1 text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisionBoard;