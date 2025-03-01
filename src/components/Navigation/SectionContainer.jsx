import React from 'react';

export const SectionContainer = ({ id, isActive, children }) => {
  if (!isActive) return null;
  
  return (
    <div 
      id={`section-${id}`} 
      className="w-full py-6 px-3 animate-fadeIn"
    >
      {children}
    </div>
  );
};

export default SectionContainer;