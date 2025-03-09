// Get all templates
export const getTemplates = () => {
    const storage = localStorage.getItem('wellnessTracker') || '{}';
    const data = JSON.parse(storage);
    return data.templates || [];
  };
  
  // Save templates
  export const saveTemplates = (templates) => {
    const storage = localStorage.getItem('wellnessTracker') || '{}';
    const data = JSON.parse(storage);
    data.templates = templates;
    localStorage.setItem('wellnessTracker', JSON.stringify(data));
  };
  
  // Create a new template
  export const createTemplate = (template) => {
    const templates = getTemplates();
    const newTemplate = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      usageCount: 0,
      ...template,
    };
    templates.push(newTemplate);
    saveTemplates(templates);
    return newTemplate;
  };
  
  // Update a template
  export const updateTemplate = (templateId, updates) => {
    const templates = getTemplates();
    const index = templates.findIndex(t => t.id === templateId);
    if (index !== -1) {
      templates[index] = { ...templates[index], ...updates };
      saveTemplates(templates);
      return templates[index];
    }
    return null;
  };
  
  // Delete a template
  export const deleteTemplate = (templateId) => {
    const templates = getTemplates();
    const filteredTemplates = templates.filter(t => t.id !== templateId);
    saveTemplates(filteredTemplates);
  };
  
  // Get template usage analytics
  export const getTemplateAnalytics = () => {
    const storage = localStorage.getItem('wellnessTracker') || '{}';
    const data = JSON.parse(storage);
    const templates = data.templates || [];
    
    // Get all dates with task data
    const dates = Object.keys(data).filter(key => key.match(/^\d{4}-\d{2}-\d{2}$/));
    
    const templateAnalytics = templates.map(template => {
      let usageCount = 0;
      let taskCompletions = 0;
      let totalTasks = 0;
      
      // For each date, check if template was used
      dates.forEach(date => {
        const dayData = data[date];
        if (dayData.usedTemplates && dayData.usedTemplates.includes(template.id)) {
          usageCount++;
          
          // Check task completions
          if (dayData.checked) {
            template.categories.forEach(category => {
              category.items.forEach(task => {
                totalTasks++;
                if (dayData.checked[task]) {
                  taskCompletions++;
                }
              });
            });
          }
        }
      });
      
      return {
        id: template.id,
        name: template.name,
        difficulty: template.difficulty,
        usageCount,
        completionRate: totalTasks > 0 ? (taskCompletions / totalTasks) * 100 : 0,
        totalTasks,
        completedTasks: taskCompletions
      };
    });
    
    return templateAnalytics;
  };
  
  // Record template usage when applying to a day
  export const recordTemplateUsage = (dateStr, templateIds) => {
    const storage = localStorage.getItem('wellnessTracker') || '{}';
    const data = JSON.parse(storage);
    
    if (!data[dateStr]) {
      data[dateStr] = {};
    }
    
    // Update used templates for the day
    data[dateStr].usedTemplates = [...(data[dateStr].usedTemplates || []), ...templateIds];
    
    // Update usage count in the template objects
    const templates = getTemplates();
    let updated = false;
    
    templateIds.forEach(id => {
      const index = templates.findIndex(t => t.id === id);
      if (index !== -1) {
        templates[index].usageCount = (templates[index].usageCount || 0) + 1;
        updated = true;
      }
    });
    
    if (updated) {
      saveTemplates(templates);
    }
    
    localStorage.setItem('wellnessTracker', JSON.stringify(data));
  };
  
  // Apply templates to a specific day
  export const applyTemplatesToDay = (dateStr, templateIds) => {
    const storage = localStorage.getItem('wellnessTracker') || '{}';
    const data = JSON.parse(storage);
    const templates = getTemplates();
    
    if (!data[dateStr]) {
      data[dateStr] = {};
    }
    
    // Initialize or use existing tasks
    const existingCategories = data[dateStr].customTasks || [];
    let updatedCategories = [...existingCategories];
    
    // Get selected templates
    const selectedTemplates = templates.filter(t => templateIds.includes(t.id));
    
    // Add template categories and tasks
    selectedTemplates.forEach(template => {
      template.categories.forEach(category => {
        // Check if this category already exists
        const existingCategoryIndex = updatedCategories.findIndex(c => c.title === category.title);
        
        if (existingCategoryIndex !== -1) {
          // Add unique tasks to existing category
          const existingItems = updatedCategories[existingCategoryIndex].items;
          const newItems = category.items.filter(item => !existingItems.includes(item));
          updatedCategories[existingCategoryIndex].items = [...existingItems, ...newItems];
        } else {
          // Add new category
          updatedCategories.push({...category});
        }
      });
    });
    
    // Update checked status for new tasks
    let updatedChecked = {...(data[dateStr].checked || {})};
    updatedCategories.forEach(category => {
      category.items.forEach(item => {
        if (updatedChecked[item] === undefined) {
          updatedChecked[item] = false;
        }
      });
    });
    
    // Save changes
    data[dateStr].customTasks = updatedCategories;
    data[dateStr].checked = updatedChecked;
    
    // Record template usage
    recordTemplateUsage(dateStr, templateIds);
    
    localStorage.setItem('wellnessTracker', JSON.stringify(data));
    
    return updatedCategories;
  };
  
  // Get most frequently used templates
  export const getMostUsedTemplates = (limit = 3) => {
    const templates = getTemplates();
    return templates
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, limit);
  };
  
  // Get templates by difficulty
  export const getTemplatesByDifficulty = (difficulty) => {
    const templates = getTemplates();
    return templates.filter(t => t.difficulty === difficulty);
  };