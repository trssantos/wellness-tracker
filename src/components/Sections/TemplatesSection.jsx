import React, { useState, useEffect } from 'react';
import { getTemplates } from '../../utils/templateUtils';
import TemplateList from '../Templates/TemplateList';
import TemplateDetail from '../Templates/TemplateDetail';
import TemplateForm from '../Templates/TemplateForm';
import TemplateAnalytics from '../Templates/TemplateAnalytics';

const TemplatesSection = () => {
  // Main view state
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'create', 'edit', 'analytics'
  
  // Initialize and load templates
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const templateData = getTemplates();
    setTemplates(templateData);
  };

  // Handle viewing analytics
  const handleViewAnalytics = () => {
    setViewMode('analytics');
    setActiveTemplate(null);
  };

  // Handle selecting a template
  const handleSelectTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    setActiveTemplate(template);
    setViewMode('detail');
  };

  // Handle creating a new template
  const handleCreateTemplate = () => {
    setActiveTemplate(null);
    setViewMode('create');
  };

  // Handle editing a template
  const handleEditTemplate = () => {
    setViewMode('edit');
  };

  // Handle saving a new template
  const handleTemplateSaved = () => {
    loadTemplates();
    setViewMode('list');
  };

  // Handle updating a template
  const handleTemplateUpdated = (updatedTemplate) => {
    loadTemplates();
    setActiveTemplate(updatedTemplate);
    setViewMode('detail');
  };

  // Handle going back to list
  const handleBackToList = () => {
    setActiveTemplate(null);
    setViewMode('list');
  };

  // Handle deleting a template
  const handleTemplateDeleted = () => {
    loadTemplates();
    setActiveTemplate(null);
    setViewMode('list');
  };

  // Render current view based on state
  const renderCurrentView = () => {
    switch (viewMode) {
      case 'detail':
        return (
          <TemplateDetail 
            template={activeTemplate}
            onEdit={handleEditTemplate}
            onBack={handleBackToList}
            onDelete={handleTemplateDeleted}
          />
        );
      case 'create':
        return (
          <TemplateForm 
            onSave={handleTemplateSaved}
            onCancel={handleBackToList}
          />
        );
      case 'edit':
        return (
          <TemplateForm 
            template={activeTemplate}
            onSave={handleTemplateUpdated}
            onCancel={() => setViewMode('detail')}
          />
        );
      case 'analytics':
        return (
          <TemplateAnalytics 
            onBack={handleBackToList}
          />
        );
      case 'list':
      default:
        return (
          <TemplateList 
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
            onCreateTemplate={handleCreateTemplate}
            onViewAnalytics={handleViewAnalytics}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderCurrentView()}
    </div>
  );
};

export default TemplatesSection;