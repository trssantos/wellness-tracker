import React, { useState, useEffect, useRef } from 'react';
import { 
  StickyNote, Search, Plus, Tag, Trash2, Edit2, Check, X, Calendar, 
  EyeOff, Eye, Pin, Sun, Moon, Filter, ArrowUpDown, 
  LayoutGrid, LayoutList, Clock, Lock, Unlock, Star, StarOff, Save, 
  Download, Upload, Info, Bell, Copy, Palette, Heart, AlertTriangle
} from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';

// Main component for the Notes section
const NotesSection = () => {
  // State management
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('dateDesc'); // 'dateDesc', 'dateAsc', 'titleAsc'
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  
  // Container ref for the grid layout
  const notesContainerRef = useRef(null);
  
  // Color palette for notes
  const noteColors = [
    { name: 'yellow', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800/50', hover: 'hover:bg-amber-200 dark:hover:bg-amber-800/50' },
    { name: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800/50', hover: 'hover:bg-blue-200 dark:hover:bg-blue-800/50' },
    { name: 'green', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800/50', hover: 'hover:bg-green-200 dark:hover:bg-green-800/50' },
    { name: 'purple', bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800/50', hover: 'hover:bg-purple-200 dark:hover:bg-purple-800/50' },
    { name: 'red', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800/50', hover: 'hover:bg-red-200 dark:hover:bg-red-800/50' },
    { name: 'teal', bg: 'bg-teal-100 dark:bg-teal-900/30', border: 'border-teal-200 dark:border-teal-800/50', hover: 'hover:bg-teal-200 dark:hover:bg-teal-800/50' },
    { name: 'gray', bg: 'bg-slate-100 dark:bg-slate-700/50', border: 'border-slate-200 dark:border-slate-600', hover: 'hover:bg-slate-200 dark:hover:bg-slate-600/70' },
    { name: 'pink', bg: 'bg-pink-100 dark:bg-pink-900/30', border: 'border-pink-200 dark:border-pink-800/50', hover: 'hover:bg-pink-200 dark:hover:bg-pink-800/50' },
  ];

  // Mock function to help with dragging
  const [draggedNote, setDraggedNote] = useState(null);
  const [dragOverNoteId, setDragOverNoteId] = useState(null);

  // Load notes from storage on component mount
  useEffect(() => {
    loadNotes();
  }, []);

  // Update filtered notes when search query, active tag, or notes change
  useEffect(() => {
    filterNotes();
  }, [searchQuery, activeTag, notes, sortBy]);

  const loadNotes = () => {
    const storage = getStorage();
    
    // Initialize zenNotes in storage if it doesn't exist
    if (!storage.zenNotes) {
      storage.zenNotes = {
        notes: getSampleNotes(),
        settings: {
          viewMode: 'grid',
          sortBy: 'dateDesc'
        }
      };
      setStorage(storage);
    }
    
    const zenNotes = storage.zenNotes || { notes: [], settings: {} };
    
    // Apply settings
    setViewMode(zenNotes.settings.viewMode || 'grid');
    setSortBy(zenNotes.settings.sortBy || 'dateDesc');
    
    // Set notes state
    setNotes(zenNotes.notes || []);
    
    // Extract all unique tags
    const allTags = [];
    zenNotes.notes.forEach(note => {
      if (note.tags && note.tags.length > 0) {
        note.tags.forEach(tag => {
          if (!allTags.includes(tag)) {
            allTags.push(tag);
          }
        });
      }
    });
    
    setTags(allTags);
    setIsLoadingInitial(false);
  };

  const saveNotes = (updatedNotes, updatedSettings = null) => {
    const storage = getStorage();
    
    if (!storage.zenNotes) {
      storage.zenNotes = { notes: [], settings: {} };
    }
    
    // Save notes
    storage.zenNotes.notes = updatedNotes;
    
    // Save settings if provided
    if (updatedSettings) {
      storage.zenNotes.settings = {
        ...storage.zenNotes.settings,
        ...updatedSettings
      };
    }
    
    setStorage(storage);
    
    // Extract updated tags
    const allTags = [];
    updatedNotes.forEach(note => {
      if (note.tags && note.tags.length > 0) {
        note.tags.forEach(tag => {
          if (!allTags.includes(tag)) {
            allTags.push(tag);
          }
        });
      }
    });
    
    setTags(allTags);
  };

  const filterNotes = () => {
    let filtered = [...notes];
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Filter by active tag
    if (activeTag) {
      filtered = filtered.filter(note => 
        note.tags && note.tags.includes(activeTag)
      );
    }
    
    // Sort notes
    filtered = sortNotes(filtered, sortBy);
    
    setFilteredNotes(filtered);
  };

  const sortNotes = (notesToSort, sortType) => {
    const sortedNotes = [...notesToSort];
    
    switch (sortType) {
      case 'dateAsc':
        return sortedNotes.sort((a, b) => new Date(a.dateCreated) - new Date(b.dateCreated));
      case 'dateDesc':
        return sortedNotes.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
      case 'titleAsc':
        return sortedNotes.sort((a, b) => a.title.localeCompare(b.title));
      case 'titleDesc':
        return sortedNotes.sort((a, b) => b.title.localeCompare(a.title));
      case 'colorAsc':
        return sortedNotes.sort((a, b) => a.color.localeCompare(b.color));
      case 'pinned':
        return sortedNotes.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
      default:
        return sortedNotes;
    }
  };

  const handleAddNote = () => {
    setIsCreatingNote(true);
    setEditingNote({
      id: Date.now().toString(),
      title: '',
      content: '',
      color: 'yellow',
      tags: [],
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      isPinned: false,
      isPrivate: false
    });
  };

  const handleEditNote = (note) => {
    setIsCreatingNote(false);
    setEditingNote({...note});
  };

  const handleDeleteNote = (noteId) => {
    const noteToDelete = notes.find(note => note.id === noteId);
    if (!noteToDelete) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete the note "${noteToDelete.title}"?`);
    if (!confirmed) return;
    
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const handleSaveNote = (updatedNote) => {
    let updatedNotes;
    
    if (isCreatingNote) {
      // Add new note
      updatedNotes = [updatedNote, ...notes];
    } else {
      // Update existing note
      updatedNotes = notes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      );
    }
    
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setEditingNote(null);
    setIsCreatingNote(false);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setIsCreatingNote(false);
  };

  const handleTogglePin = (noteId) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId ? {...note, isPinned: !note.isPinned} : note
    );
    
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const handleTogglePrivate = (noteId) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId ? {...note, isPrivate: !note.isPrivate} : note
    );
    
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const handleChangeViewMode = (mode) => {
    setViewMode(mode);
    saveNotes(notes, { viewMode: mode });
  };

  const handleChangeSortBy = (sort) => {
    setSortBy(sort);
    saveNotes(notes, { sortBy: sort });
  };

  const handleDragStart = (e, note) => {
    // Store the dragged note in state
    setDraggedNote(note);
    
    // Set data to ensure compatibility across browsers
    e.dataTransfer.setData('text/plain', note.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a semi-transparent drag image of the actual note element
    // This provides better visual feedback than a transparent image
    const noteElement = e.currentTarget;
    
    // Give some time for the draggedNote state to be applied
    setTimeout(() => {
      // Add a dragging class for styling during drag
      noteElement.classList.add('note-dragging');
    }, 0);
  };

  const handleDragOver = (e, targetNoteId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedNote && targetNoteId !== draggedNote.id) {
      setDragOverNoteId(targetNoteId);
    }
  };

  const handleDrop = (e, targetNoteId) => {
    e.preventDefault();
    
    if (!draggedNote || targetNoteId === draggedNote.id) {
      setDraggedNote(null);
      setDragOverNoteId(null);
      return;
    }
    
    // Make a deep copy of the notes array
    const updatedNotes = JSON.parse(JSON.stringify(notes));
    
    // Find the source and target indices
    const draggedIndex = updatedNotes.findIndex(note => note.id === draggedNote.id);
    const targetIndex = updatedNotes.findIndex(note => note.id === targetNoteId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Extract the dragged item
      const [draggedItem] = updatedNotes.splice(draggedIndex, 1);
      
      // Insert at the target position
      updatedNotes.splice(targetIndex, 0, draggedItem);
      
      // Update the state and storage with the new order
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
      
      // Force the filtered notes to update as well
      filterNotes();
    }
    
    // Clear drag states
    setDraggedNote(null);
    setDragOverNoteId(null);
  };

  const handleDragEnd = (e) => {
    // Remove dragging class from all note elements
    const noteElements = document.querySelectorAll('.note-card');
    noteElements.forEach(el => {
      el.classList.remove('note-dragging');
    });
    
    // Clear drag states
    setDraggedNote(null);
    setDragOverNoteId(null);
    
    // Show animation for the note returning to position if drop failed
    if (e.dataTransfer.dropEffect === 'none') {
      // Add return animation class
      const noteElement = e.currentTarget;
      noteElement.classList.add('note-return-animation');
      
      // Remove the animation class after it completes
      setTimeout(() => {
        noteElement.classList.remove('note-return-animation');
      }, 300);
    }
  };

  const generateColorClass = (colorName) => {
    const color = noteColors.find(c => c.name === colorName) || noteColors[0];
    return `${color.bg} ${color.border}`;
  };

  // Sample notes for first-time users
  const getSampleNotes = () => {
    return [
      {
        id: '1',
        title: 'Welcome to ZenNotes',
        content: 'This is your new note-taking space! Add ideas, reminders, or anything you want to remember. Notes can be organized with tags, colors, and more.',
        color: 'blue',
        tags: ['welcome', 'getting-started'],
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        isPinned: true,
        isPrivate: false
      },
      {
        id: '2',
        title: 'Quick Tips',
        content: '• Pin important notes\n• Use colors to categorize\n• Add tags for easy filtering\n• Toggle private mode for sensitive notes\n• Drag and drop to rearrange',
        color: 'green',
        tags: ['tips', 'help'],
        dateCreated: new Date(Date.now() - 3600000).toISOString(),
        dateModified: new Date(Date.now() - 3600000).toISOString(),
        isPinned: false,
        isPrivate: false
      },
      {
        id: '3',
        title: 'Private Note Example',
        content: 'This is an example of a private note. Click the eye icon to toggle visibility.',
        color: 'purple',
        tags: ['example', 'private'],
        dateCreated: new Date(Date.now() - 7200000).toISOString(),
        dateModified: new Date(Date.now() - 7200000).toISOString(),
        isPinned: false,
        isPrivate: true
      }
    ];
  };

  // Render note card component
  const NoteCard = ({ note, onEdit, onDelete, onTogglePin, onTogglePrivate, isDragging, isDragOver }) => {
    const [isContentVisible, setIsContentVisible] = useState(!note.isPrivate);
    
    const colorClasses = generateColorClass(note.color);
    
    return (
      <div 
        className={`
          relative border rounded-lg p-3 shadow-sm transition-all duration-200 note-card
          ${colorClasses}
          ${note.isPinned ? 'ring-2 ring-amber-400 dark:ring-amber-500' : ''}
          ${isDragging ? 'opacity-50 note-dragging' : ''}
          ${isDragOver ? 'border-blue-500 dark:border-blue-400 border-2' : ''}
          ${viewMode === 'grid' ? 'hover:shadow-md' : 'mb-3 hover:shadow-md'}
        `}
        draggable
        onDragStart={(e) => handleDragStart(e, note)}
        onDragOver={(e) => handleDragOver(e, note.id)}
        onDrop={(e) => handleDrop(e, note.id)}
        onDragEnd={handleDragEnd}
        key={note.id}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-slate-800 dark:text-slate-200 truncate pr-6 flex-1">
            {note.title || 'Untitled Note'}
          </h3>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => onTogglePin(note.id)}
              className={`p-1 rounded-full transition-colors ${
                note.isPinned 
                  ? 'text-amber-500 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/30' 
                  : 'text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={note.isPinned ? "Unpin note" : "Pin note"}
            >
              <Pin size={14} className={note.isPinned ? "fill-current" : ""} />
            </button>
            <button 
              onClick={() => onTogglePrivate(note.id)}
              className={`p-1 rounded-full transition-colors ${
                note.isPrivate 
                  ? 'text-purple-500 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800/30' 
                  : 'text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={note.isPrivate ? "Make public" : "Make private"}
            >
              {note.isPrivate ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        
        {note.isPrivate && (
          <div className="flex justify-between items-center mb-2">
            <button 
              onClick={() => setIsContentVisible(!isContentVisible)}
              className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1"
            >
              {isContentVisible ? (
                <>
                  <EyeOff size={12} /> Hide content
                </>
              ) : (
                <>
                  <Eye size={12} /> Show content
                </>
              )}
            </button>
          </div>
        )}
        
        {(!note.isPrivate || isContentVisible) && (
          <div className="mb-3">
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line break-words max-h-32 overflow-y-auto">
              {note.content}
            </p>
          </div>
        )}
        
        {note.isPrivate && !isContentVisible && (
          <div className="mb-3 py-3">
            <p className="text-sm text-purple-500 dark:text-purple-400 text-center italic">
              [Private content hidden]
            </p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-1 mb-2">
          {note.tags && note.tags.map((tag, index) => (
            <span 
              key={index} 
              className="text-xs px-2 py-0.5 bg-white dark:bg-slate-700 bg-opacity-60 dark:bg-opacity-60 rounded-full text-slate-700 dark:text-slate-300"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTag(tag);
                setShowFilters(true);
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-auto">
          <div className="flex items-center">
            <Clock size={12} className="mr-1" />
            <span>
              {new Date(note.dateModified).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => onEdit(note)}
              className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 hover:bg-opacity-60 dark:hover:bg-opacity-60 transition-colors"
              title="Edit note"
            >
              <Edit2 size={14} />
            </button>
            <button 
              onClick={() => onDelete(note.id)}
              className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 hover:bg-opacity-60 dark:hover:bg-opacity-60 transition-colors"
              title="Delete note"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render note editor component
  const NoteEditor = ({ note, onSave, onCancel }) => {
    const [editedNote, setEditedNote] = useState(note);
    const [tagInput, setTagInput] = useState('');
    
    const handleAddTag = () => {
      if (tagInput.trim() === '') return;
      
      // Remove # if present and trim whitespace
      const formattedTag = tagInput.replace(/^#/, '').trim();
      
      if (formattedTag && !editedNote.tags.includes(formattedTag)) {
        setEditedNote({
          ...editedNote,
          tags: [...editedNote.tags, formattedTag]
        });
      }
      
      setTagInput('');
    };
    
    const handleRemoveTag = (tagToRemove) => {
      setEditedNote({
        ...editedNote,
        tags: editedNote.tags.filter(tag => tag !== tagToRemove)
      });
    };
    
    const handleColorChange = (color) => {
      setEditedNote({
        ...editedNote,
        color
      });
    };
    
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      }
    };
    
    const handleSave = () => {
      // Validate title and content
      if (!editedNote.title.trim()) {
        alert('Please enter a title for your note');
        return;
      }
      
      // Update dateModified
      const updatedNote = {
        ...editedNote,
        dateModified: new Date().toISOString()
      };
      
      onSave(updatedNote);
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto ${generateColorClass(editedNote.color)}`}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-slate-800 dark:text-slate-100">
                {isCreatingNote ? 'Create New Note' : 'Edit Note'}
              </h2>
              <button 
                onClick={onCancel}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editedNote.title}
                  onChange={(e) => setEditedNote({...editedNote, title: e.target.value})}
                  className="input-field"
                  placeholder="Note title"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Content
                </label>
                <textarea
                  value={editedNote.content}
                  onChange={(e) => setEditedNote({...editedNote, content: e.target.value})}
                  className="textarea-field h-32"
                  placeholder="Write your note here..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tags
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Tag size={16} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="input-field pl-10"
                      placeholder="Add tag..."
                    />
                  </div>
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                
                {editedNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editedNote.tags.map((tag, index) => (
                      <div 
                        key={index}
                        className="flex items-center bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full"
                      >
                        <span className="text-xs text-slate-700 dark:text-slate-300 mr-1">#{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Note Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {noteColors.map((color) => (
                    <button
                      key={color.name}
                      className={`h-8 rounded-md transition-all ${color.bg} ${color.border} ${
                        editedNote.color === color.name 
                          ? 'ring-2 ring-blue-500 dark:ring-blue-400' 
                          : color.hover
                      }`}
                      onClick={() => handleColorChange(color.name)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={editedNote.isPinned}
                    onChange={() => setEditedNote({...editedNote, isPinned: !editedNote.isPinned})}
                    className="mr-2 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  Pin Note
                </label>
                
                <label className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={editedNote.isPrivate}
                    onChange={() => setEditedNote({...editedNote, isPrivate: !editedNote.isPrivate})}
                    className="mr-2 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  Private Note
                </label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper components
  const FilterBar = () => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-4">
      <div className="flex flex-col sm:flex-row justify-between mb-3">
        <h2 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2 sm:mb-0 flex items-center">
          <StickyNote className="mr-2 text-amber-500 dark:text-amber-400" size={20} />
          ZenNotes
        </h2>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleChangeViewMode('grid')}
            className={`p-2 rounded ${
              viewMode === 'grid' 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Grid view"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => handleChangeViewMode('list')}
            className={`p-2 rounded ${
              viewMode === 'list' 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="List view"
          >
            <LayoutList size={18} />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded ${
              showFilters
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Show filters"
          >
            <Filter size={18} />
          </button>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`p-2 rounded ${
              showHelp
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Help"
          >
            <Info size={18} />
          </button>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
          placeholder="Search notes by title, content, or tags..."
        />
      </div>

      {showFilters && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Sort by
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleChangeSortBy('dateDesc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  sortBy === 'dateDesc'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <span className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  Newest First
                </span>
              </button>
              <button
                onClick={() => handleChangeSortBy('dateAsc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  sortBy === 'dateAsc'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <span className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  Oldest First
                </span>
              </button>
              <button
                onClick={() => handleChangeSortBy('titleAsc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  sortBy === 'titleAsc'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <span className="flex items-center">
                  <ArrowUpDown size={14} className="mr-1" />
                  Title (A-Z)
                </span>
              </button>
              <button
                onClick={() => handleChangeSortBy('pinned')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  sortBy === 'pinned'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <span className="flex items-center">
                  <Pin size={14} className="mr-1" />
                  Pinned First
                </span>
              </button>
            </div>
          </div>
          
          {tags.length > 0 && (
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Tag size={16} className="mr-1" /> 
                Filter by Tag
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTag(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    activeTag === null
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  All Tags
                </button>
                
                {tags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      activeTag === tag
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {showHelp && (
        <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-3">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300 flex items-center">
            <AlertTriangle size={16} className="mr-1" />
            Quick Tips
          </h3>
          <ul className="mt-2 text-xs text-amber-700 dark:text-amber-300 space-y-1 pl-5 list-disc">
            <li>Drag and drop notes to rearrange them</li>
            <li>Pin important notes to keep them at the top</li>
            <li>Use tags to organize and filter your notes</li>
            <li>Toggle private mode for sensitive notes</li>
            <li>Change note colors for quick visual organization</li>
            <li>Search for text in titles, content, or tags</li>
          </ul>
        </div>
      )}
    </div>
  );

  // Render the notes grid
  const NotesGrid = () => {
    if (isLoadingInitial) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mb-2"></div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Loading notes...</div>
          </div>
        </div>
      );
    }
    
    if (filteredNotes.length === 0) {
      return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center">
          <StickyNote size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No notes found</h3>
          {activeTag || searchQuery ? (
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Try changing your search or filter settings
            </p>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Create your first note to get started
            </p>
          )}
          <button
            onClick={handleAddNote}
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 inline-flex items-center"
          >
            <Plus size={18} className="mr-1" />
            New Note
          </button>
        </div>
      );
    }
    
    return (
      <div 
        ref={notesContainerRef}
        className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'}
      >
        {filteredNotes.map((note) => (
          <NoteCard 
            key={note.id}
            note={note}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
            onTogglePin={handleTogglePin}
            onTogglePrivate={handleTogglePrivate}
            isDragging={draggedNote?.id === note.id}
            isDragOver={dragOverNoteId === note.id}
          />
        ))}
      </div>
    );
  };

  // Render the main component
  return (
    <div className="space-y-4 p-1">
      <FilterBar />
      
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddNote}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 inline-flex items-center shadow-sm"
        >
          <Plus size={18} className="mr-1" />
          New Note
        </button>
      </div>
      
      <NotesGrid />
      
      {editingNote && (
        <NoteEditor 
          note={editingNote}
          onSave={handleSaveNote}
          onCancel={handleCancelEdit}
        />
      )}
      
      {/* Add styles for animations and drag and drop effects */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes returnToPosition {
          0% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .note-card-animation {
          animation: fadeIn 0.3s ease-out, slideUp 0.3s ease-out;
        }
        
        .note-dragging {
          cursor: grabbing !important;
          opacity: 0.65 !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
          transform: scale(1.02);
          z-index: 10;
        }
        
        .note-drag-over {
          box-shadow: 0 0 0 2px #3b82f6 !important;
          transform: scale(1.02);
          transition: all 0.2s ease-in-out;
        }
        
        .note-drag-indicator {
          position: absolute;
          height: 3px;
          background-color: #3b82f6;
          width: 100%;
          left: 0;
          z-index: 5;
          animation: fadeIn 0.2s ease-out;
        }
        
        .note-return-animation {
          animation: returnToPosition 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotesSection;