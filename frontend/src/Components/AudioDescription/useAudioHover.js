import { useEffect } from 'react';
import { useAudioDescription } from './AudioDescriptionContext';

// Custom hook to add audio description to any element
const useAudioHover = (ref, description) => {
  const { isAudioDescriptionEnabled, speakText } = useAudioDescription();
  
  useEffect(() => {
    const element = ref.current;
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
  }, [ref, description, isAudioDescriptionEnabled, speakText]);
};

export default useAudioHover;