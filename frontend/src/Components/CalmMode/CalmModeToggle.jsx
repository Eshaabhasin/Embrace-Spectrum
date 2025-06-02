import React from 'react';
import { useCalmMode } from '../Providers/CalmModeContext';
import { Moon, Sun } from 'lucide-react';

const CalmModeToggle = () => {
  const { isCalmMode, toggleCalmMode } = useCalmMode();

  return (
    <button
      onClick={toggleCalmMode}
      className={`flex items-center justify-center p-2 rounded-full transition-all duration-300 ${
        isCalmMode 
          ? 'bg-gray-700 text-yellow-100' 
          : 'bg-blue-500 text-white'
      }`}
      aria-label={isCalmMode ? 'Disable calm mode' : 'Enable calm mode'}
      title={isCalmMode ? 'Disable calm mode' : 'Enable calm mode'}
    >
      {isCalmMode ? (
        <Sun size={20} className="animate-none" />
      ) : (
        <Moon size={20} />
      )}
    </button>
  );
};

export default CalmModeToggle;