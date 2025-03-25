import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronUp, ChevronDown,X, PlusCircle, Clock, Tag, Camera, Upload, Image, Trash2, 
  Check, Battery, Utensils, Info
} from 'lucide-react';
import { uploadImage } from '../../utils/imageUploadService';

export const FoodEntryForm = ({ entry, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    categories: [], // Always use an array for categories
    mealType: 'snack',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    emoji: '🍽️',
    notes: '',
    tags: [],
    imageUrl: '',
    // Fields for meal plan entries
    ingredients: [],
    instructions: '',
    description: '',
    benefits: '',
    fromMealPlan: false,
    mealPlanId: null
  });

  // Map of food categories to icons with more comprehensive options
  const categoryIcons = {
    'Fruits': '🍎',
    'Vegetables': '🥦',
    'Proteins': '🥩',
    'Dairy': '🥛',
    'Grains': '🍞',
    'Legumes': '🫘',
    'Nuts & Seeds': '🥜',
    'Seafood': '🐟',
    'Poultry': '🍗',
    'Red Meat': '🥩',
    'Eggs': '🥚',
    'Sweets': '🍫',
    'Beverages': '☕',
    'Snacks': '🥨',
    'Fast Food': '🍔',
    'Home Cooked': '🍲',
    'Breakfast Foods': '🥞',
    'Soups': '🍜',
    'Salads': '🥗',
    'High Protein': '💪',
    'Low Carb': '🥑',
    'Keto': '🥓',
    'Vegan': '🌱',
    'Vegetarian': '🥬',
    'Gluten Free': '🌾',
    'Dairy Free': '🥥',
    'Whole Foods': '🌽',
    'Processed Foods': '🥫',
    'Fermented': '🧀',
    'Planned Meal': '📝'
  };
  
  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [showMealPlanDetails, setShowMealPlanDetails] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Popular food emojis
  const foodEmojis = ['🍎', '🍌', '🥗', '🥪', '🍲', '🍚', '🍝', '🍔', '🥩', '🍗', '🥦', '🥕', '🥑', '🍞', '🥛', '🧀', '🍫', '🍵', '☕', '🍽️'];
  
  // Meal types
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  // Handle category toggling
  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const categories = [...prev.categories];
      
      if (categories.includes(category)) {
        return { ...prev, categories: categories.filter(c => c !== category) };
      } else {
        return { ...prev, categories: [...categories, category] };
      }
    });
  };
  
  // Add a custom category
  const handleAddCustomCategory = () => {
    if (newCategory.trim() && !customCategories.includes(newCategory.trim())) {
      setCustomCategories([...customCategories, newCategory.trim()]);
      handleCategoryToggle(newCategory.trim());
      setNewCategory('');
    }
  };
  
  // Initialize form when editing an entry
  useEffect(() => {
    if (entry) {
      // Determine if this is a meal plan entry
      const isFromMealPlan = !!(entry.ingredients || entry.description || entry.benefits);
      
      // Initialize form data with all possible fields
      setFormData({
        id: entry.id,
        name: entry.name || '',
        // Handle different types of category data
        categories: Array.isArray(entry.categories) 
          ? entry.categories 
          : entry.category 
            ? [entry.category] 
            : [],
        mealType: entry.mealType || 'snack',
        time: entry.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emoji: entry.emoji || '🍽️',
        notes: entry.notes || '',
        tags: entry.tags || [],
        imageUrl: entry.imageUrl || '',
        // Meal plan specific data
        ingredients: entry.ingredients || [],
        instructions: entry.instructions || '',
        description: entry.description || '',
        benefits: entry.benefits || '',
        fromMealPlan: isFromMealPlan,
        mealPlanId: entry.mealPlanId || null
      });
      
      // Show meal plan details section if this is from a meal plan
      setShowMealPlanDetails(isFromMealPlan);
      
      // Add any custom categories that aren't in our predefined list
      const customCats = [];
      if (Array.isArray(entry.categories)) {
        entry.categories.forEach(cat => {
          if (!categoryIcons[cat] && !customCats.includes(cat)) {
            customCats.push(cat);
          }
        });
      }
      
      if (customCats.length > 0) {
        setCustomCategories(customCats);
      }
    }
  }, [entry]);
  
  // Initialize camera when showCamera is true
  useEffect(() => {
    let stream = null;
    
    const setupCamera = async () => {
      if (showCamera && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' }
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error('Error accessing camera:', err);
          setUploadError('Could not access camera. Please check permissions.');
          setShowCamera(false);
        }
      }
    };
    
    setupCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera]);
  
  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Add a new tag
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };
  
  // Remove a tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };
  
  // Set emoji
  const handleEmojiSelect = (emoji) => {
    setFormData({
      ...formData,
      emoji
    });
  };
  
  // Add/edit an ingredient
  const handleIngredientChange = (index, value) => {
    const ingredients = [...formData.ingredients];
    ingredients[index] = value;
    setFormData({
      ...formData, 
      ingredients
    });
  };
  
  // Add new ingredient
  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, '']
    });
  };
  
  // Remove an ingredient
  const handleRemoveIngredient = (index) => {
    const ingredients = [...formData.ingredients];
    ingredients.splice(index, 1);
    setFormData({
      ...formData,
      ingredients
    });
  };
  
  // Auto-categorize based on ingredients and name
  const handleAutoCategorize = () => {
    const potentialCategories = [];
    const allItems = [
      formData.name.toLowerCase(),
      ...formData.ingredients.map(ing => ing.toLowerCase()),
      ...formData.tags.map(tag => tag.toLowerCase())
    ];
    
    // Simple keyword mapping to categories
    const keywordMap = {
      // Fruits
      'apple': 'Fruits', 'banana': 'Fruits', 'berry': 'Fruits', 'fruit': 'Fruits',
      'orange': 'Fruits', 'grape': 'Fruits', 'melon': 'Fruits', 'kiwi': 'Fruits',
      // Vegetables
      'vegetable': 'Vegetables', 'carrot': 'Vegetables', 'broccoli': 'Vegetables',
      'spinach': 'Vegetables', 'kale': 'Vegetables', 'lettuce': 'Vegetables',
      'tomato': 'Vegetables', 'cucumber': 'Vegetables', 'pepper': 'Vegetables',
      // Proteins
      'chicken': 'Poultry', 'turkey': 'Poultry', 'beef': 'Red Meat', 
      'steak': 'Red Meat', 'pork': 'Red Meat', 'tofu': 'Proteins',
      'tempeh': 'Proteins', 'seitan': 'Proteins', 'protein': 'Proteins',
      // Seafood
      'fish': 'Seafood', 'salmon': 'Seafood', 'tuna': 'Seafood', 
      'shrimp': 'Seafood', 'seafood': 'Seafood',
      // Dairy
      'milk': 'Dairy', 'cheese': 'Dairy', 'yogurt': 'Dairy', 
      'dairy': 'Dairy', 'cream': 'Dairy',
      // Grains
      'bread': 'Grains', 'pasta': 'Grains', 'rice': 'Grains', 
      'grain': 'Grains', 'wheat': 'Grains', 'oat': 'Grains',
      'cereal': 'Grains',
      // Legumes
      'bean': 'Legumes', 'lentil': 'Legumes', 'legume': 'Legumes',
      'pea': 'Legumes', 'chickpea': 'Legumes',
      // Nuts & Seeds
      'nut': 'Nuts & Seeds', 'seed': 'Nuts & Seeds', 'almond': 'Nuts & Seeds',
      'walnut': 'Nuts & Seeds', 'cashew': 'Nuts & Seeds',
      // Diet types
      'vegan': 'Vegan', 'vegetarian': 'Vegetarian', 'keto': 'Keto',
      'gluten free': 'Gluten Free', 'gluten-free': 'Gluten Free',
      'dairy free': 'Dairy Free', 'dairy-free': 'Dairy Free'
    };
    
    // Check for keywords in name, ingredients, and tags
    allItems.forEach(item => {
      Object.entries(keywordMap).forEach(([keyword, category]) => {
        if (item.includes(keyword) && !potentialCategories.includes(category)) {
          potentialCategories.push(category);
        }
      });
    });
    
    // Check meal type and add appropriate category
    if (formData.mealType === 'breakfast') {
      potentialCategories.push('Breakfast Foods');
    }
    
    // Add all found categories
    const newCategories = [...formData.categories];
    potentialCategories.forEach(category => {
      if (!newCategories.includes(category)) {
        newCategories.push(category);
      }
    });
    
    setFormData({
      ...formData,
      categories: newCategories
    });
  };
  
  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    uploadImageFile(file);
  };
  
  // Handle camera capture
  const handleCameraCapture = () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        setUploadError('Failed to capture image');
        return;
      }
      
      // Create a File object from the blob
      const file = new File([blob], `food-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Upload the file
      uploadImageFile(file);
      
      // Stop camera
      setShowCamera(false);
    }, 'image/jpeg', 0.8);
  };
  
  // Upload image file
  const uploadImageFile = async (file) => {
    setIsUploading(true);
    setUploadError('');
    setUploadProgress(0);
    
    try {
      // Create a progress handler
      const onProgress = (progress) => {
        setUploadProgress(progress);
      };
      
      // Upload the image
      const imageUrl = await uploadImage(file, onProgress);
      
      // Update form data with image URL
      setFormData({
        ...formData,
        imageUrl
      });
      
      setUploadProgress(100);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Remove image
  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      imageUrl: ''
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Make sure Planned Meal category is added if this is from a meal plan
    if (formData.fromMealPlan && !formData.categories.includes('Planned Meal')) {
      formData.categories.push('Planned Meal');
    }
    
    onSave(formData);
    // Make sure the modal is closed
    const modal = document.getElementById('food-entry-modal');
    if (modal) modal.close();
  };
  
  // Render all category buttons (predefined + custom)
  const renderCategoryButtons = () => {
    // Combine predefined categories and custom categories
    const allCategories = [
      ...Object.keys(categoryIcons),
      ...customCategories.filter(cat => !Object.keys(categoryIcons).includes(cat))
    ];
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto pb-2">
        {allCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => handleCategoryToggle(category)}
            className={`flex items-center p-2 rounded-lg border ${
              formData.categories.includes(category)
                ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <span className="text-xl mr-2">{categoryIcons[category] || '🏷️'}</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-left leading-tight">{category}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="modal-content max-w-lg w-full" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3 className="modal-title">{entry ? 'Edit Food Entry' : 'Add Food Entry'}</h3>
        <button 
          onClick={() => {
            onClose();
            const modal = document.getElementById('food-entry-modal');
            if (modal) modal.close();
          }} 
          className="modal-close-button"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mt-4">
          {/* Food Item Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Food Item
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="What did you eat?"
              required
            />
          </div>
          
          {/* Food Image */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Food Image
            </label>
            
            {!formData.imageUrl ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 p-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Upload size={20} className="text-slate-500 dark:text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Upload Photo</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="flex-1 flex items-center justify-center gap-2 p-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Camera size={20} className="text-slate-500 dark:text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Take Photo</span>
                </button>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img 
                  src={formData.imageUrl} 
                  alt={formData.name} 
                  className="w-full object-cover h-40"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-black/50 rounded-full text-red-500 hover:bg-white dark:hover:bg-black"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            
            {/* Camera View */}
            {showCamera && (
              <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="relative bg-black">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-center bg-black/50">
                    <button
                      type="button"
                      onClick={handleCameraCapture}
                      className="p-3 bg-white rounded-full text-red-500"
                    >
                      <Camera size={24} />
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setShowCamera(false)}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
            
            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Upload Error */}
            {uploadError && (
              <div className="mt-2 text-xs text-red-500 dark:text-red-400">
                {uploadError}
              </div>
            )}
          </div>
          
          {/* Emoji Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {foodEmojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className={`w-10 h-10 text-xl flex items-center justify-center rounded-lg transition-colors
                    ${formData.emoji === emoji 
                      ? 'bg-red-100 dark:bg-red-900/30 ring-2 ring-red-500' 
                      : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          {/* Meal Type & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Meal Type
              </label>
              <select
                name="mealType"
                value={formData.mealType}
                onChange={handleChange}
                className="input-field"
              >
                {mealTypes.map(type => (
                  <option key={type} value={type} className="capitalize">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock size={16} />
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
          
          {/* Food Categories */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Categories
              </label>
              <button
                type="button"
                onClick={handleAutoCategorize}
                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"
              >
                Auto-Categorize
              </button>
            </div>
            
            {renderCategoryButtons()}
            
            {/* Add custom category */}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add custom category..."
                className="input-field flex-1 text-sm p-2"
              />
              <button
                type="button"
                onClick={handleAddCustomCategory}
                className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
              >
                <PlusCircle size={20} />
              </button>
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Tag size={16} />
              Tags
            </label>
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="input-field flex-1"
                placeholder="Add tags (e.g., organic, homemade)"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="ml-2 p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
              >
                <PlusCircle size={20} />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Tags help track attributes like "organic", "homemade", "spicy", "gluten-free" or preparation methods.
            </p>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <div 
                    key={index} 
                    className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg text-sm flex items-center gap-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Meal Plan Details Toggle */}
          {(formData.fromMealPlan || formData.ingredients.length > 0) && (
            <div>
              <button
                type="button"
                onClick={() => setShowMealPlanDetails(!showMealPlanDetails)}
                className="flex items-center gap-2 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
              >
                <Utensils size={16} />
                <span>{showMealPlanDetails ? 'Hide' : 'Show'} Meal Details</span>
                {showMealPlanDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          )}
          
          {/* Meal Plan Details (Ingredients, etc.) */}
          {showMealPlanDetails && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Ingredients
                  </label>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="text-xs px-2 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded flex items-center gap-1"
                  >
                    <PlusCircle size={12} />
                    Add
                  </button>
                </div>
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleIngredientChange(index, e.target.value)}
                      className="input-field flex-1"
                      placeholder={`Ingredient ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {formData.ingredients.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                    No ingredients added yet
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="textarea-field h-20"
                  placeholder="Brief description of the meal..."
                  rows="2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nutritional Benefits
                </label>
                <input
                  type="text"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Nutritional benefits of this meal..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Preparation Instructions
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  className="textarea-field h-20"
                  placeholder="How to prepare this meal..."
                  rows="2"
                />
              </div>
            </div>
          )}
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="textarea-field h-20"
              placeholder="How did you feel after eating this? Any observations?"
              rows="3"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={() => {
              onClose();
              const modal = document.getElementById('food-entry-modal');
              if (modal) modal.close();
            }}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={!formData.name.trim()}
            className={`
              flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors
              ${!formData.name.trim() 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600' 
                : 'bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700'
              }`}
          >
            <Check size={18} />
            {entry ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FoodEntryForm;