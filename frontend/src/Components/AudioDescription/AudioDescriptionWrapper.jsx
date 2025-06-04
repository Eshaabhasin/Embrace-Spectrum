import React, { useRef, useEffect } from 'react';
import { useAudioDescription } from './AudioDescriptionContext';

// This component adds audio description to any element it wraps
const AudioDescriptionWrapper = ({ children, description, elementType = 'div', ...props }) => {
  const { isAudioDescriptionEnabled, speakText } = useAudioDescription();
  const elementRef = useRef(null);
  const Element = elementType;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isAudioDescriptionEnabled) return;

    const handleMouseEnter = () => {
      if (description) {
        speakText(description);
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [description, isAudioDescriptionEnabled, speakText]);

  return (
    <Element 
      ref={elementRef}
      aria-label={description}
      {...props}
    >
      {children}
    </Element>
  );
};

export default AudioDescriptionWrapper;