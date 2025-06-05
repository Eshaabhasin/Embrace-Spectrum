import { 
  Book, Clock, UserCheck, Lightbulb
} from 'lucide-react';

import React from "react"

const JournalSidebar = ({ 
  selectedView, 
  setSelectedView, 
  selectedSection, 
  setSelectedSection,
  assistiveTools,
  setAssistiveTools,
  sections,
  isAudioDescriptionEnabled,
  speakText
}) => {
  const toggleTextSize = () => {
    const sizes = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(assistiveTools.textSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setAssistiveTools(prev => ({
      ...prev,
      textSize: sizes[nextIndex]
    }));
  };

  return (
    <div className="w-64 rounded-xl bg-[#65729c] backdrop-blur-md border-r border-indigo-100 p-4 flex flex-col shadow-md" role="navigation" aria-label="Journal navigation">
      <div className="flex items-center mb-6">
        <h1 className="text-4xl font-bold text-white">Journal</h1>
      </div>

      {/* View Selection */}
      <div className="mt-4 space-y-2" role="group" aria-label="View selection">
        <button
          onClick={() => {
            setSelectedView('journal');
            if (isAudioDescriptionEnabled) {
              speakText("Switched to new entry view");
            }
          }}
          className={`
            w-full p-2 rounded-md flex items-center
            ${selectedView === 'journal' 
              ? 'text-white' 
              : 'hover:bg-blue-100 text-white'}
          `}
          aria-pressed={selectedView === 'journal'}
          aria-label="New Entry view"
        >
          <Book className="w-5 h-5 mr-2" aria-hidden="true" />
          New Entry
        </button>
        <button
          onClick={() => {
            setSelectedView('history');
            if (isAudioDescriptionEnabled) {
              speakText("Switched to journal history view");
            }
          }}
          className={`
            w-full p-2 rounded-md flex items-center
            ${selectedView === 'history' 
              ? 'text-white' 
              : 'hover:bg-blue-300 text-white'}
          `}
          aria-pressed={selectedView === 'history'}
          aria-label="Journal History view"
        >
          <Clock className="w-5 h-5 mr-2" aria-hidden="true" />
          Journal History
        </button>
      </div>

      {/* Assistive Tools Section */}
      <div className="mb-4 p-2 rounded-md mt-4" role="region" aria-labelledby="assistive-tools-heading">
        <h3 id="assistive-tools-heading" className="text-lg font-semibold text-white mb-2">
          Assistive Tools
        </h3>
        <div className="flex space-x-2" role="toolbar" aria-label="Accessibility options">
          <button 
            onClick={() => {
              toggleTextSize();
              if (isAudioDescriptionEnabled) {
                const nextSize = assistiveTools.textSize === 'small' ? 'medium' : 
                                assistiveTools.textSize === 'medium' ? 'large' : 'small';
                speakText(`Text size changed to ${nextSize}`);
              }
            }}
            className="bg-white border border-blue-300 p-2 rounded-md hover:bg-blue-100"
            aria-label={`Adjust Text Size (currently ${assistiveTools.textSize})`}
          >
            <Lightbulb className="w-5 h-5 text-blue-600" aria-hidden="true" />
          </button>
          <button 
            onClick={() => {
              setAssistiveTools(prev => ({
                ...prev,
                focusMode: !prev.focusMode
              }));
              if (isAudioDescriptionEnabled) {
                speakText(assistiveTools.focusMode ? "Focus mode disabled" : "Focus mode enabled");
              }
            }}
            className={`
              border border-blue-300 p-2 rounded-md
              ${assistiveTools.focusMode 
                ? 'bg-green-200 text-green-800' 
                : 'bg-white hover:bg-blue-100'}
            `}
            aria-label="Toggle Focus Mode"
            aria-pressed={assistiveTools.focusMode}
          >
            <UserCheck className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="space-y-2" aria-label="Journal sections">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setSelectedSection(section.id);
              if (isAudioDescriptionEnabled) {
                speakText(`Selected section: ${section.name}. ${section.description}`);
              }
            }}
            className={`
              flex items-center w-full p-2 rounded-md transition-colors
              ${selectedSection === section.id 
                ? 'bg-blue-400 text-white' 
                : 'hover:bg-blue-600 text-white'}
            `}
            aria-pressed={selectedSection === section.id}
            aria-label={section.name}
            aria-describedby={`section-desc-${section.id}`}
          >
            {section.icon}
            <span className="ml-2">{section.name}</span>
            <span id={`section-desc-${section.id}`} className="sr-only">{section.description}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default JournalSidebar