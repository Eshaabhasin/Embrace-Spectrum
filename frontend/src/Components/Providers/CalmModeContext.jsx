import React, { createContext, useState, useContext, useEffect } from 'react';

const CalmModeContext = createContext();

export const useCalmMode = () => useContext(CalmModeContext);

export const CalmModeProvider = ({ children }) => {
  // Check localStorage for saved preference
  const [isCalmMode, setIsCalmMode] = useState(() => {
    const saved = localStorage.getItem('calmMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('calmMode', JSON.stringify(isCalmMode));
    
    // Apply or remove calm mode class to body
    if (isCalmMode) {
      document.body.classList.add('calm-mode');
    } else {
      document.body.classList.remove('calm-mode');
    }
  }, [isCalmMode]);

  const toggleCalmMode = () => {
    setIsCalmMode(prev => !prev);
  };

  return (
    <CalmModeContext.Provider value={{ isCalmMode, toggleCalmMode }}>
      {children}
    </CalmModeContext.Provider>
  );
};