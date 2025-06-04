import React, { useRef } from 'react';
import { 
  AudioDescriptionDirective, 
  useAudioHover, 
  useAudioDescription 
} from './index';

// Example component demonstrating different ways to use audio descriptions
const AudioDescriptionDemo = () => {
  const { isAudioDescriptionEnabled, speakText } = useAudioDescription();
  
  // Using useAudioHover hook
  const buttonRef = useRef(null);
  useAudioHover(buttonRef, "This is a button using the useAudioHover hook");
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Audio Description Demo</h2>
      
      {/* Method 1: Using AudioDescriptionDirective */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Method 1: Using Directive</h3>
        <AudioDescriptionDirective description="This button uses the AudioDescriptionDirective component">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Hover Me (Directive)
          </button>
        </AudioDescriptionDirective>
      </div>
      
      {/* Method 2: Using useAudioHover hook */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Method 2: Using Hook</h3>
        <button 
          ref={buttonRef}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Hover Me (Hook)
        </button>
      </div>
      
      {/* Method 3: Direct usage of context */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Method 3: Direct Context</h3>
        <button 
          className="bg-purple-500 text-white px-4 py-2 rounded"
          onMouseEnter={() => isAudioDescriptionEnabled && speakText("This button uses direct context access")}
        >
          Hover Me (Direct)
        </button>
      </div>
      
      <p className="mt-4 text-sm text-gray-600">
        Toggle audio descriptions in the navbar to test these examples.
      </p>
    </div>
  );
};

export default AudioDescriptionDemo;