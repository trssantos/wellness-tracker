import React, { useState, useEffect } from 'react';
import { Trash2, Edit, GripVertical, ChevronUp, ChevronDown, Move } from 'lucide-react';

const DraggableExerciseList = ({ exercises, onReorder, onEdit, onRemove, weightUnit, distanceUnit }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [longPressItem, setLongPressItem] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  
  // Check if device is mobile based on screen width or touch capability
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Move an exercise up in the list
  const moveExerciseUp = (index) => {
    if (index === 0) return; // Already at the top
    
    const newExercises = [...exercises];
    const temp = newExercises[index];
    newExercises[index] = newExercises[index - 1];
    newExercises[index - 1] = temp;
    
    onReorder(newExercises);
  };

  // Move an exercise down in the list
  const moveExerciseDown = (index) => {
    if (index === exercises.length - 1) return; // Already at the bottom
    
    const newExercises = [...exercises];
    const temp = newExercises[index];
    newExercises[index] = newExercises[index + 1];
    newExercises[index + 1] = temp;
    
    onReorder(newExercises);
  };

  // TOUCH EVENT HANDLERS FOR MOBILE
  
  // Handle long press start for mobile reordering
  const handleTouchStart = (index) => {
    // Clear any existing timers
    if (longPressTimer) clearTimeout(longPressTimer);
    
    // Set a new timer for long press detection (500ms)
    const timer = setTimeout(() => {
      setLongPressItem(index);
      // Provide haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
    
    setLongPressTimer(timer);
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // If we had a longPressItem and dropTargetIndex, reorder exercises
    if (longPressItem !== null && dropTargetIndex !== null && longPressItem !== dropTargetIndex) {
      // Reorder the items
      const newExercises = [...exercises];
      const [removed] = newExercises.splice(longPressItem, 1);
      newExercises.splice(dropTargetIndex, 0, removed);
      onReorder(newExercises);
    }
    
    // Reset states
    setLongPressItem(null);
    setDropTargetIndex(null);
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    // Cancel long press if user is scrolling
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // If in reordering mode, prevent scrolling
    if (longPressItem !== null) {
      e.preventDefault();
      
      // Get touch position
      const touch = e.touches[0];
      const elements = document.querySelectorAll('.exercise-item');
      
      // Find the element under the touch position
      for (let i = 0; i < elements.length; i++) {
        const rect = elements[i].getBoundingClientRect();
        if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          setDropTargetIndex(i);
          break;
        }
      }
    }
  };

  // DESKTOP DRAG AND DROP HANDLERS
  
  // Start dragging an item
  const handleDragStart = (index, e) => {
    // Store the dragged item's index
    setDraggedIndex(index);
    
    // Make the drag image transparent but still visible
    if (e.dataTransfer.setDragImage) {
      const draggedEl = document.getElementById(`exercise-item-${index}`);
      if (draggedEl) {
        e.dataTransfer.setDragImage(draggedEl, 20, 20);
      }
    }
    
    // Store the index as data
    e.dataTransfer.setData('text/plain', index);
  };

  // Handle dragging over an item
  const handleDragOver = (index, e) => {
    e.preventDefault();
    setDropTargetIndex(index);
  };

  // Handle dropping an item
  const handleDrop = (targetIndex, e) => {
    e.preventDefault();
    
    // Get the dragged item index
    const draggedItemIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    // Don't do anything if dropped on itself
    if (draggedItemIndex === targetIndex) {
      setDraggedIndex(null);
      setDropTargetIndex(null);
      return;
    }
    
    // Reorder the items
    const newExercises = [...exercises];
    const [removed] = newExercises.splice(draggedItemIndex, 1);
    newExercises.splice(targetIndex, 0, removed);
    
    // Call the callback with the new order
    onReorder(newExercises);
    
    // Reset drag state
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  // Handle end of dragging
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  return (
    <div className="space-y-2">
      {exercises.map((exercise, index) => {
        // Determine various states and styles
        const isBeingDragged = index === draggedIndex;
        const isDropTarget = index === dropTargetIndex;
        const isLongPressed = index === longPressItem;
        
        // Base item style that gets expanded with conditional classes
        const itemClasses = `
          exercise-item
          flex items-start p-3 rounded-lg border
          ${isBeingDragged ? 'opacity-50' : ''}
          ${isDropTarget || isLongPressed ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700 shadow-md' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}
          ${isLongPressed ? 'transform scale-105 z-10 shadow-lg' : ''}
          transition-all duration-200
        `;
        
        // Generate an inline style object for any non-Tailwind styles
        const itemStyle = {
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease, background-color 0.2s ease',
          userSelect: isLongPressed ? 'none' : 'auto'
        };
        
        return (
          <div
            id={`exercise-item-${index}`}
            key={index}
            className={itemClasses}
            style={itemStyle}
            draggable={!isMobile}
            onDragStart={!isMobile ? (e) => handleDragStart(index, e) : null}
            onDragOver={!isMobile ? (e) => handleDragOver(index, e) : null}
            onDrop={!isMobile ? (e) => handleDrop(index, e) : null}
            onDragEnd={!isMobile ? handleDragEnd : null}
            onTouchStart={isMobile ? () => handleTouchStart(index) : null}
            onTouchEnd={isMobile ? handleTouchEnd : null}
            onTouchMove={isMobile ? handleTouchMove : null}
          >
            {/* For mobile: Up/Down buttons, For desktop: Drag handle */}
            {isMobile ? (
              <div className="flex flex-col mr-2">
                <button
                  type="button"
                  onClick={() => moveExerciseUp(index)}
                  disabled={index === 0}
                  className={`p-1 rounded-full ${
                    index === 0
                      ? 'text-slate-300 dark:text-slate-600 cursor-default'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer'
                  }`}
                  title="Move up"
                  style={isMobile ? { minHeight: '32px', minWidth: '32px' } : {}}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => moveExerciseDown(index)}
                  disabled={index === exercises.length - 1}
                  className={`p-1 rounded-full ${
                    index === exercises.length - 1
                      ? 'text-slate-300 dark:text-slate-600 cursor-default'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer'
                  }`}
                  title="Move down"
                  style={isMobile ? { minHeight: '32px', minWidth: '32px' } : {}}
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            ) : (
              <div 
                className="mr-2 p-1 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400"
                style={{ cursor: 'grab' }}
              >
                <GripVertical size={20} />
              </div>
            )}
            
            {/* Number badge */}
            <div className="w-8 h-8 mr-3 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-700 dark:text-blue-300 font-medium">{index + 1}</span>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0"> 
              {/* Exercise name with text wrapping */}
              <div className="font-medium text-slate-700 dark:text-slate-200 text-sm break-words">
                {exercise.name}
              </div>
              
              {/* Exercise details - Handles both exercise types */}
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">
                {exercise.isDurationBased ? (
                  // Duration-based exercise details with sets
                  <>
                    {exercise.sets > 1 ? 
                      `${exercise.sets}×${exercise.duration} ${exercise.durationUnit || 'min'}` : 
                      `${exercise.duration} ${exercise.durationUnit || 'min'}`}
                    {exercise.distance ? ` • ${exercise.distance}${!exercise.distance.includes('km') && !exercise.distance.includes('mi') && !exercise.distance.includes('m') ? ' ' + distanceUnit : ''} distance` : ''}
                    {exercise.restTime ? ` • ${exercise.restTime}s rest` : ''}
                  </>
                ) : (
                  // Traditional strength exercise details
                  <>
                    {exercise.sets}×{exercise.reps}
                    {exercise.weight ? ` • ${exercise.weight} ${weightUnit}` : ''}
                    {exercise.restTime ? ` • ${exercise.restTime}s rest` : ''}
                  </>
                )}
              </div>
              
              {/* Notes - with text wrapping, limited to 3 lines */}
              {exercise.notes && (
                <div className="text-xs italic text-slate-500 dark:text-slate-400 mt-1 overflow-hidden line-clamp-3">
                  {exercise.notes}
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-1 ml-2">
              <button
                type="button"
                onClick={() => onEdit(index)}
                className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full flex-shrink-0"
                title="Edit exercise"
                style={isMobile ? { minHeight: '32px', minWidth: '32px' } : {}}
              >
                <Edit size={16} />
              </button>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full flex-shrink-0"
                title="Delete exercise"
                style={isMobile ? { minHeight: '32px', minWidth: '32px' } : {}}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
      
      {/* Mobile reordering instructions */}
      {isMobile && exercises.length > 1 && (
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm flex items-center">
          <Move size={16} className="mr-2 flex-shrink-0" />
          <span>Use the up/down buttons to reorder exercises, or long-press and drag to reposition.</span>
        </div>
      )}
    </div>
  );
};

export default DraggableExerciseList;