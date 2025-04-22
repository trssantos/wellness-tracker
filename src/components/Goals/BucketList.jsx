import React, { useState, useEffect } from 'react';
import { getGoals, getSummaryStats } from '../../utils/bucketListUtils';

// Import all our components
import BucketListDashboard from './BucketListDashboard';
import GoalDetailView from './GoalDetailView';
import GoalEditorForm from './GoalEditorForm';
import GoalInspirationTab from './GoalInspirationTab';
import VisionBoardComponent from './VisionBoardComponent';
import GoalAnalytics from './GoalAnalytics';

const BucketList = () => {
  // Main state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [storageVersion, setStorageVersion] = useState(0);
  
  // For debugging UI interactions
  useEffect(() => {
    console.log("BucketList component loaded");
    
    // Log when modals open/close
    console.log("Detail modal open:", isDetailOpen);
    console.log("Editor modal open:", isEditorOpen);
    
    // Log when selectedGoal changes
    if (selectedGoal) {
      console.log("Selected goal:", selectedGoal.id, selectedGoal.title);
    }
  }, [isDetailOpen, isEditorOpen, selectedGoal]);

  // Load goals data on component mount and when storageVersion changes
  useEffect(() => {
    refreshData();
  }, [storageVersion]);

  // Function to refresh data from storage
  const refreshData = () => {
    const loadedGoals = getGoals();
    setGoals(loadedGoals);
  };

  // Handle selecting a goal to view/edit
  const handleSelectGoal = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    setSelectedGoal(goal);
    setIsDetailOpen(true);
  };

  // Handle closing goal detail view
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedGoal(null);
  };

  // Handle opening the editor form
  const handleOpenEditor = (goal = null) => {
    setSelectedGoal(goal); // Null for new goal
    setIsEditorOpen(true);
    
    if (isDetailOpen) {
      setIsDetailOpen(false);
    }
  };

  // Handle closing the editor form
  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    
    // If we were editing an existing goal, go back to detail view
    if (selectedGoal && !isDetailOpen) {
      setIsDetailOpen(true);
    } else {
      setSelectedGoal(null);
    }
  };

  // Handle saving a goal (new or edited)
  const handleSaveGoal = (goal) => {
    // Increment storage version to trigger a refresh
    setStorageVersion(prev => prev + 1);
    
    // If this was a new goal, show its details
    if (!selectedGoal) {
      setSelectedGoal(goal);
      setIsDetailOpen(true);
    }
  };

  // Handle goal updates from detail view
  const handleGoalUpdate = () => {
    // Increment storage version to trigger a refresh
    setStorageVersion(prev => prev + 1);
  };

  // Handle tab change
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <BucketListDashboard 
            onSelectGoal={handleSelectGoal}
            onCreateGoal={() => handleOpenEditor()}
            onChangeTab={handleTabChange}
          />
        );
      case 'goals':
        // We could add an all goals view here
        return (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">All Goals</h2>
            <p>Goals view is under development.</p>
          </div>
        );
      case 'inspiration':
        return (
          <GoalInspirationTab 
            onGoalAdded={(goal) => {
              setStorageVersion(prev => prev + 1);
              if (goal) {
                // Automatically show details of the newly added goal
                setSelectedGoal(goal);
                setIsDetailOpen(true);
              }
            }}
          />
        );
      case 'vision':
        return <VisionBoardComponent />;
      case 'analytics':
        return <GoalAnalytics />;
      default:
        return <BucketListDashboard 
          onSelectGoal={handleSelectGoal}
          onCreateGoal={() => handleOpenEditor()}
          onChangeTab={handleTabChange}
        />;
    }
  };

  return (
    <div className="relative">
      {/* Main Content */}
      <div className="space-y-6">
        {/* Navigation Tabs handled by child components */}
        {renderTabContent()}
      </div>
      
      {/* Goal Detail Modal */}
      {isDetailOpen && selectedGoal && (
        <GoalDetailView 
          goal={selectedGoal}
          onClose={handleCloseDetail}
          onUpdate={handleGoalUpdate}
          onOpenEditForm={() => handleOpenEditor(selectedGoal)}
        />
      )}
      
      {/* Goal Editor Modal */}
      {isEditorOpen && (
        <GoalEditorForm 
          goal={selectedGoal}
          onClose={handleCloseEditor}
          onSave={handleSaveGoal}
        />
      )}
    </div>
  );
};

export default BucketList;