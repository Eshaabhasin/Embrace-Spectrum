import React from 'react';
import { 
  AudioDescriptionWrapper, 
  AudioDescriptionDirective,
  useAudioDescription
} from './index';

// Example component showing how to use audio descriptions in different ways
const AudioDescriptionExample = () => {
  const { isAudioDescriptionEnabled, speakText } = useAudioDescription();
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Audio Description Examples</h2>
      
      {/* Example 1: Using AudioDescriptionWrapper */}
      <AudioDescriptionWrapper 
        description="This is a button that submits a form" 
        className="mb-4"
      >
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Submit Form
        </button>
      </AudioDescriptionWrapper>
      
      {/* Example 2: Using AudioDescriptionDirective */}
      <div className="mb-4">
        <AudioDescriptionDirective description="This button cancels the current operation">
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            Cancel
          </button>
        </AudioDescriptionDirective>
      </div>
      
      {/* Example 3: Using direct event handler */}
      <div className="mb-4">
        <button 
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          onMouseEnter={() => isAudioDescriptionEnabled && speakText("This button saves your progress")}
          aria-label="This button saves your progress"
        >
          Save Progress
        </button>
      </div>
      
      {/* Example 4: Using AudioDescriptionWrapper with a different element type */}
      <AudioDescriptionWrapper 
        description="This is a link to the help documentation" 
        elementType="a" 
        href="#" 
        className="text-blue-500 hover:underline block mb-4"
      >
        Help Documentation
      </AudioDescriptionWrapper>
      
      <p className="text-sm text-gray-600 mt-6">
        Toggle audio descriptions in the navbar to test these examples.
        When audio descriptions are enabled, hovering over these elements will read their descriptions aloud.
      </p>
    </div>
  );
};

export default AudioDescriptionExample;