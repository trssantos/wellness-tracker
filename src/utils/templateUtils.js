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
    return templates[index];
  };
  
  // Delete a template
  export const deleteTemplate = (templateId) => {
    const templates = getTemplates();
    const filteredTemplates = templates.filter(t => t.id !== templateId);
    saveTemplates(filteredTemplates);
  };
  
  // Get template usage analytics
  // utils/templateUtils.js - update getTemplateAnalytics function to sync usage counts
export const getTemplateAnalytics = () => {
  const storage = JSON.parse(localStorage.getItem('wellnessTracker') || '{}');
  const templates = storage.templates || [];
  
  // Store calculated analytics that we'll return
  const templateAnalytics = templates.map(template => {
    return {
      id: template.id,
      name: template.name,
      difficulty: template.difficulty,
      usageCount: 0, // We'll calculate this from day data
      completionRate: 0,
      totalTasks: 0,
      completedTasks: 0
    };
  });
  
  // Get all dates from storage
  const dates = Object.keys(storage).filter(key => key.match(/^\d{4}-\d{2}-\d{2}$/));
  
  // Function to find template analytics by ID
  const findTemplateAnalytics = (id) => templateAnalytics.find(t => t.id === id);
  
  // Scan through all days to count template usage
  dates.forEach(date => {
    const dayData = storage[date];
    if (dayData.usedTemplates && Array.isArray(dayData.usedTemplates)) {
      // Count each template use
      dayData.usedTemplates.forEach(templateId => {
        const templateStats = findTemplateAnalytics(templateId);
        if (templateStats) {
          templateStats.usageCount++;
        }
      });
      
      // Calculate task completion
      if (dayData.checked) {
        templates.forEach(template => {
          if (!template.categories) return;
          
          const templateStats = findTemplateAnalytics(template.id);
          if (!templateStats) return;
          
          // Check if this template was used on this date
          if (!dayData.usedTemplates.includes(template.id)) return;
          
          // Count completed tasks from this template
          template.categories.forEach(category => {
            category.items.forEach(task => {
              templateStats.totalTasks++;
              if (dayData.checked[task] === true) {
                templateStats.completedTasks++;
              }
            });
          });
        });
      }
    }
  });
  
  // Calculate completion rates
  templateAnalytics.forEach(template => {
    template.completionRate = template.totalTasks > 0 
      ? (template.completedTasks / template.totalTasks) * 100 
      : 0;
  });
  
  // Now, update the template objects in storage with the correct usage counts
  let updated = false;
  templates.forEach((template, index) => {
    const analytics = findTemplateAnalytics(template.id);
    if (analytics && analytics.usageCount !== template.usageCount) {
      // Update the template usage count to match analytics
      storage.templates[index].usageCount = analytics.usageCount;
      updated = true;
    }
  });
  
  // Save updated templates back to storage if counts were updated
  if (updated) {
    localStorage.setItem('wellnessTracker', JSON.stringify(storage));
  }
  
  return templateAnalytics;
};
  
  // Record template usage when applying to a day
  // utils/templateUtils.js - fix the recordTemplateUsage function:
export const recordTemplateUsage = (dateStr, templateIds) => {
  console.log(`Recording template usage for date ${dateStr}: ${templateIds.join(', ')}`);
  
  // Directly access localStorage to ensure we have the most current data
  const storageString = localStorage.getItem('wellnessTracker') || '{}';
  const storage = JSON.parse(storageString);
  
  if (!storage[dateStr]) {
    storage[dateStr] = {};
  }
  
  // Ensure usedTemplates is tracked for this date
  if (!storage[dateStr].usedTemplates) {
    storage[dateStr].usedTemplates = [];
  }
  
  // Add template IDs to usedTemplates array for this date (avoid duplicates)
  const existingUsedTemplates = new Set(storage[dateStr].usedTemplates);
  templateIds.forEach(id => existingUsedTemplates.add(id));
  storage[dateStr].usedTemplates = Array.from(existingUsedTemplates);
  
  // Update usage count in the template objects
  if (!storage.templates) {
    storage.templates = [];
  }
  
  let updated = false;
  templateIds.forEach(id => {
    const index = storage.templates.findIndex(t => t.id === id);
    if (index !== -1) {
      // Increment the usageCount or initialize it
      storage.templates[index].usageCount = (storage.templates[index].usageCount || 0) + 1;
      console.log(`Updated template ${id} usage count to ${storage.templates[index].usageCount}`);
      updated = true;
    } else {
      console.warn(`Template ${id} not found when updating usage count`);
    }
  });
  
  // Save the entire storage object
  localStorage.setItem('wellnessTracker', JSON.stringify(storage));
  
  return updated;
};
  
  // Apply templates to a specific day
  // utils/templateUtils.js - update applyTemplatesToDay function:
// utils/templateUtils.js - update applyTemplatesToDay function:
export const applyTemplatesToDay = (dateStr, templateIds) => {
  // Get full storage data
  const storageString = localStorage.getItem('wellnessTracker') || '{}';
  const storage = JSON.parse(storageString);
  
  if (!storage[dateStr]) {
    storage[dateStr] = {};
  }
  
  // Get all templates 
  const templates = storage.templates || [];
  
  // Get existing data for this date - preserve any custom tasks
  const existingCategories = storage[dateStr].customTasks || [];
  
  // Start with existing categories to preserve user customizations
  let updatedCategories = JSON.parse(JSON.stringify(existingCategories));
  
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
        updatedCategories.push(JSON.parse(JSON.stringify(category)));
      }
    });
  });
  
  // Update checked status for new tasks
  let updatedChecked = {...(storage[dateStr].checked || {})};
  updatedCategories.forEach(category => {
    category.items.forEach(item => {
      if (updatedChecked[item] === undefined) {
        updatedChecked[item] = false;
      }
    });
  });
  
  // Save changes
  storage[dateStr].customTasks = updatedCategories;
  storage[dateStr].checked = updatedChecked;
  
  // Track which templates were used - ensuring no duplicates
  const existingTemplates = new Set(storage[dateStr].usedTemplates || []);
  templateIds.forEach(id => existingTemplates.add(id));
  storage[dateStr].usedTemplates = Array.from(existingTemplates);
  
  // Save all changes back to storage
  localStorage.setItem('wellnessTracker', JSON.stringify(storage));
  
  // Now record template usage to update usage counts
  recordTemplateUsage(dateStr, templateIds);
  
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