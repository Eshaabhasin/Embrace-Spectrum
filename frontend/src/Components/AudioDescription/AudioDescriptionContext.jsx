import React, { createContext, useState, useContext, useEffect } from 'react';

const AudioDescriptionContext = createContext();

export const useAudioDescription = () => useContext(AudioDescriptionContext);

export const AudioDescriptionProvider = ({ children }) => {
  // Check localStorage for saved preference
  const [isAudioDescriptionEnabled, setIsAudioDescriptionEnabled] = useState(() => {
    const saved = localStorage.getItem('audioDescription');
    return saved ? JSON.parse(saved) : false;
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('audioDescription', JSON.stringify(isAudioDescriptionEnabled));
    
    // Apply or remove audio description class to body
    if (isAudioDescriptionEnabled) {
      document.body.classList.add('audio-description-enabled');
    } else {
      document.body.classList.remove('audio-description-enabled');
    }
  }, [isAudioDescriptionEnabled]);

  // Function to speak text
  const speakText = (text) => {
    if (isAudioDescriptionEnabled && text && window.speechSynthesis) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create a new speech utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleAudioDescription = () => {
    setIsAudioDescriptionEnabled(prev => !prev);
  };

  return (
    <AudioDescriptionContext.Provider value={{ 
      isAudioDescriptionEnabled, 
      toggleAudioDescription,
      speakText 
    }}>
      {children}
    </AudioDescriptionContext.Provider>
  );
};