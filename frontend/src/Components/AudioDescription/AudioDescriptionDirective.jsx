import React, { useEffect, useRef } from 'react';
import { useAudioDescription } from './AudioDescriptionContext';

// This component adds audio description functionality to any element
const AudioDescriptionDirective = ({ children, description }) => {
  const { isAudioDescriptionEnabled, speakText } = useAudioDescription();
  const elementRef = useRef(null);

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

  // Clone the child element and add the ref
  return React.cloneElement(React.Children.only(children), {
    ref: elementRef,
    'aria-label': description || children.props['aria-label'],
  });
};

export default AudioDescriptionDirective;