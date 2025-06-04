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
  sections
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
    <div className="w-64 rounded-xl bg-[#65729c] backdrop-blur-md border-r border-indigo-100 p-4 flex flex-col shadow-md">
      <div className="flex items-center mb-6">
        <h1 className="text-4xl font-bold text-white">Journal</h1>
      </div>

      {/* View Selection */}
      <div className="mt-4 space-y-2">
        <button
          onClick={() => setSelectedView('journal')}
          className={`
            w-full p-2 rounded-md flex items-center
            ${selectedView === 'journal' 
              ? 'text-white' 
              : 'hover:bg-blue-100 text-white'}
          `}
        >
          <Book className="w-5 h-5 mr-2" />
          New Entry
        </button>
        <button
          onClick={() => setSelectedView('history')}
          className={`
            w-full p-2 rounded-md flex items-center
            ${selectedView === 'history' 
              ? 'text-white' 
              : 'hover:bg-blue-300 text-white'}
          `}
        >
          <Clock className="w-5 h-5 mr-2" />
          Journal History
        </button>
      </div>

      {/* Assistive Tools Section */}
      <div className="mb-4 p-2 rounded-md mt-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          Assistive Tools
        </h3>
        <div className="flex space-x-2">
          <button 
            onClick={toggleTextSize}
            className="bg-white border border-blue-300 p-2 rounded-md hover:bg-blue-100"
            aria-label="Adjust Text Size"
          >
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </button>
          <button 
            onClick={() => setAssistiveTools(prev => ({
              ...prev,
              focusMode: !prev.focusMode
            }))}
            className={`
              border border-blue-300 p-2 rounded-md
              ${assistiveTools.focusMode 
                ? 'bg-green-200 text-green-800' 
                : 'bg-white hover:bg-blue-100'}
            `}
            aria-label="Toggle Focus Mode"
          >
            <UserCheck className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setSelectedSection(section.id)}
            className={`
              flex items-center w-full p-2 rounded-md transition-colors
              ${selectedSection === section.id 
                ? 'bg-blue-400 text-white' 
                : 'hover:bg-blue-600 text-white'}
            `}
          >
            {section.icon}
            <span className="ml-2">{section.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default JournalSidebar