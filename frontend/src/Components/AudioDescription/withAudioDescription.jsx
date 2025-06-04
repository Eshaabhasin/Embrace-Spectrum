import React from 'react';
import { useAudioDescription } from './AudioDescriptionContext';

const withAudioDescription = (WrappedComponent) => {
  const WithAudioDescription = (props) => {
    const { isAudioDescriptionEnabled, speakText } = useAudioDescription();
    
    return (
      <WrappedComponent 
        {...props} 
        isAudioDescriptionEnabled={isAudioDescriptionEnabled} 
        speakText={speakText} 
      />
    );
  };
  
  WithAudioDescription.displayName = `WithAudioDescription(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithAudioDescription;
};

export default withAudioDescription;