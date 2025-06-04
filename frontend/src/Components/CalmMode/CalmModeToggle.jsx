import React from 'react';
import { useCalmMode } from '../Providers/CalmModeContext';
import { useAudioDescription } from '../AudioDescription/AudioDescriptionContext';
import { EyeOff, Eye } from 'lucide-react';

const CalmModeToggle = () => {
  const { isCalmMode, toggleCalmMode } = useCalmMode();
  const { isAudioDescriptionEnabled, speakText } = useAudioDescription();

  const handleMouseEnter = () => {
    if (isAudioDescriptionEnabled) {
      speakText(isCalmMode ? 'Disable calm mode' : 'Enable calm mode');
    }
  };

  return (
    <button
      onClick={toggleCalmMode}
      onMouseEnter={handleMouseEnter}
      className={`flex items-center justify-center p-2 rounded-full transition-all duration-300 ${
        isCalmMode 
          ? 'bg-gray-700 text-yellow-100' 
          : 'bg-blue-500 text-white'
      }`}
      aria-label={isCalmMode ? 'Disable calm mode' : 'Enable calm mode'}
      title={isCalmMode ? 'Disable calm mode' : 'Enable calm mode'}
    >
      {isCalmMode ? (
        <Eye size={20} className="animate-none" />
      ) : (
        <EyeOff size={20} />
      )}
    </button>
  );
};

export default CalmModeToggle;
