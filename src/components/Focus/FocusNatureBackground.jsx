import React, { useEffect, useState } from 'react';

// Create this as a separate file at src/components/Focus/FocusNatureBackground.jsx
const FocusNatureBackground = () => {
  const [elements, setElements] = useState({
    clouds: [],
    leaves: [],
    grass: [],
    fireflies: [],
    ripples: []
  });
  
  useEffect(() => {
    // Generate random elements
    const generateElements = () => {
      // Clouds
      const clouds = Array(5).fill().map((_, i) => ({
        id: `cloud-${i}`,
        top: `${10 + Math.random() * 40}%`,
        width: `${150 + Math.random() * 200}px`,
        height: `${80 + Math.random() * 60}px`,
        animationDuration: `${80 + Math.random() * 120}s`,
        opacity: 0.03 + Math.random() * 0.04
      }));
      
      // Leaves
      const leaves = Array(15).fill().map((_, i) => ({
        id: `leaf-${i}`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 15}s`,
        animationDuration: `${15 + Math.random() * 20}s`,
        size: `${10 + Math.random() * 10}px`
      }));
      
      // Grass blades
      const grass = Array(30).fill().map((_, i) => ({
        id: `grass-${i}`,
        left: `${(i / 30) * 100}%`,
        height: `${30 + Math.random() * 30}px`,
        width: `${4 + Math.random() * 6}px`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 4}s`
      }));
      
      // Fireflies
      const fireflies = Array(20).fill().map((_, i) => ({
        id: `firefly-${i}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 70 + 15}%`,
        animationDelay: `${Math.random() * 4}s`,
        animationDuration: `${3 + Math.random() * 3}s`,
        floatDuration: `${15 + Math.random() * 15}s`,
        floatDelay: `${Math.random() * 15}s`
      }));
      
      // Water ripples
      const ripples = Array(5).fill().map((_, i) => ({
        id: `ripple-${i}`,
        left: `${Math.random() * 100}%`,
        bottom: `${Math.random() * 40}px`,
        animationDelay: `${Math.random() * 7}s`,
        size: `${20 + Math.random() * 20}px`
      }));
      
      setElements({
        clouds,
        leaves,
        grass,
        fireflies,
        ripples
      });
    };
    
    generateElements();
  }, []);
  
  return (
    <div className="nature-background">
      {/* Stars in the sky */}
      <div className="stars"></div>
      
      {/* Clouds */}
      {elements.clouds.map(cloud => (
        <div
          key={cloud.id}
          className="cloud"
          style={{
            top: cloud.top,
            width: cloud.width,
            height: cloud.height,
            animationDuration: cloud.animationDuration,
            opacity: cloud.opacity
          }}
        />
      ))}
      
      {/* Tree */}
      <div className="tree"></div>
      
      {/* Leaves */}
      {elements.leaves.map(leaf => (
        <div
          key={leaf.id}
          className="leaf"
          style={{
            left: leaf.left,
            width: leaf.size,
            height: leaf.size,
            animationDelay: leaf.animationDelay,
            animationDuration: leaf.animationDuration
          }}
        />
      ))}
      
      {/* Grass */}
      <div className="grass-container">
        {elements.grass.map(blade => (
          <div
            key={blade.id}
            className="grass-blade"
            style={{
              left: blade.left,
              height: blade.height,
              width: blade.width,
              animationDelay: blade.animationDelay,
              animationDuration: blade.animationDuration
            }}
          />
        ))}
      </div>
      
      {/* Fireflies */}
      {elements.fireflies.map(firefly => (
        <div
          key={firefly.id}
          className="firefly"
          style={{
            left: firefly.left,
            top: firefly.top,
            animationDelay: firefly.animationDelay,
            animationDuration: firefly.animationDuration
          }}
        />
      ))}
      
      {/* Water ripples */}
      <div className="water-container">
        {elements.ripples.map(ripple => (
          <div
            key={ripple.id}
            className="water-ripple"
            style={{
              left: ripple.left,
              bottom: ripple.bottom,
              width: ripple.size,
              height: ripple.size,
              animationDelay: ripple.animationDelay
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FocusNatureBackground;