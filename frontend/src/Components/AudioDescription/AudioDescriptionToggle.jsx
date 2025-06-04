import React from 'react';
import { useAudioDescription } from './AudioDescriptionContext';
import { Volume2, VolumeX } from 'lucide-react';

const AudioDescriptionToggle = () => {
  const { isAudioDescriptionEnabled, toggleAudioDescription } = useAudioDescription();

  return (
    <button
      onClick={toggleAudioDescription}
      className={`flex items-center justify-center p-2 rounded-full transition-all duration-300 ${
        isAudioDescriptionEnabled 
          ? 'bg-green-600 text-white' 
          : 'bg-gray-400 text-white'
      }`}
      aria-label={isAudioDescriptionEnabled ? 'Disable audio descriptions' : 'Enable audio descriptions'}
      title={isAudioDescriptionEnabled ? 'Disable audio descriptions' : 'Enable audio descriptions'}
    >
      {isAudioDescriptionEnabled ? (
        <Volume2 size={20} />
      ) : (
        <VolumeX size={20} />
      )}
    </button>
  );
};

export default AudioDescriptionToggle;