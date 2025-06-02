import React from 'react';
import { 
  Mic, X, Check, Edit3, Trash2,  
  Paperclip, Smile,
} from 'lucide-react';

const JournalContent = ({
    selectedView,
    currentEntry,
    setCurrentEntry,
    entries,
    saveEntry,
    editingEntry,
    updateEntry,
    moods,
    emojis,
    sections,
    isListening,
    handleSpeechToText,
    formatDate,
    showEmojiPicker,
    setShowEmojiPicker,
    emojiPickerRef,
    entryTitleRef,
    entryContentRef,
    fileInputRef,
    handleFileUpload,
    removeAttachment,
    addEmojiToEntry,
    startEditingEntry,
    deleteEntry
  }) => {
    return (
      <div className="w-full p-6 bg-white overflow-y-auto">
        {selectedView === 'journal' ? (

          <div className="w-full">
            {/* Mood and Emoji Section */}
            <div className="mb-4 flex items-center space-x-2">
              {/* Mood Selection */}
              <div className="flex space-x-2">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setCurrentEntry(prev => ({
                      ...prev,
                      mood: mood.id
                    }))}
                    className={`
                      text-2xl p-1 rounded-full group relative
                      ${currentEntry.mood === mood.id 
                        ? 'bg-blue-200 scale-110' 
                        : 'hover:bg-blue-100'}
                    `}
                  >
                    {mood.icon}
                    <span className="
                      absolute bottom-full left-1/2 transform -translate-x-1/2
                      bg-gray-800 text-white text-xs p-1 rounded 
                      opacity-0 group-hover:opacity-100 transition-opacity
                      pointer-events-none
                    ">
                      {mood.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
  
            {/* Entry Input */}
            <input 
              ref={entryTitleRef}
              value={currentEntry.title}
              onChange={(e) => setCurrentEntry(prev => ({
                ...prev,
                title: e.target.value
              }))}
              placeholder="Entry Title"
              className="w-full p-2 text-xl font-white font-semibold mb-2 border-b border-blue-200"
            />
  
            {/* Textarea with Emoji Picker */}
            <div className="relative">
              <textarea
                ref={entryContentRef}
                value={currentEntry.content}
                onChange={(e) => setCurrentEntry(prev => ({
                  ...prev,
                  content: e.target.value
                }))}
                placeholder="Start writing your journal entry..."
                className="w-full min-h-[300px] p-2 border-none resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              
              {/* Emoji Picker */}
              <div 
                ref={emojiPickerRef}
                className="absolute top-2 right-5 w-[500px]" 
              >
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-blue-600 hover:text-blue-800 absolute right-0 top-1"
                  aria-label="Add Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
                
                {showEmojiPicker && (
                  <div className="
                    absolute top-10 right-0 
                    bg-white border border-blue-200 
                    rounded-md shadow-lg p-2 z-10 
                    max-w-[300px] grid grid-cols-5 gap-1
                  ">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          addEmojiToEntry(emoji);
                          setCurrentEntry(prev => ({
                            ...prev,
                            content: prev.content + emoji
                          }));
                        }}
                        className={`
                          text-2xl p-1 rounded-full
                          ${currentEntry.emojis.includes(emoji) 
                            ? 'bg-blue-200 scale-110' 
                            : 'hover:bg-blue-100'}
                        `}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
  
            {/* Attachments Preview */}
            {currentEntry.attachments.length > 0 && (
              <div className="mt-4 border-t pt-2">
                <h4 className="text-sm font-semibold mb-2">Attachments</h4>
                <div className="flex space-x-2">
                  {currentEntry.attachments.map((attachment) => (
                    <div 
                      key={attachment.id} 
                      className="bg-blue-100 p-2 rounded-md text-sm flex items-center"
                    >
                      <Paperclip className="w-4 h-4 mr-2" />
                      {attachment.name}
                      <button 
                        onClick={() => removeAttachment(attachment.id)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
  
            {/* Controls */}
            <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-800"
                aria-label="Add Attachment"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple 
                hidden 
              />
  
              <button
                onClick={handleSpeechToText}
                className={`
                  p-2 rounded-full transition-colors
                  ${isListening 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}
                `}
                aria-label="Speech to Text"
              >
                <Mic className="w-6 h-6" />
              </button>
  
              <button
                onClick={editingEntry ? updateEntry : saveEntry}
                className="
                  bg-green-100 text-green-600 p-2 rounded-full 
                  hover:bg-green-200 transition-colors
                  flex items-center
                "
                aria-label="Save Entry"
              >
                <Check className="w-6 h-6 mr-1" /> {editingEntry ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          // Journal History Section
          <div>
            <h2 className="text-2xl font-bold mb-6 text-blue-900">
              Journal Entries
            </h2>
            {entries.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                <p>No journal entries yet.</p>
                <p>Start writing to see your journal history!</p>
              </div>
            ) : (
              entries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-100 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-blue-900">
                      {entry.title || 'Untitled Entry'}
                    </h3>
                    <span className="text-sm text-blue-600">
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                  
                  {/* Mood and Emojis */}
                  <div className="flex items-center mb-2">
                    {entry.mood && (
                      <span className="mr-2">
                        {moods.find(m => m.id === entry.mood)?.icon}
                      </span>
                    )}
                  </div>
  
                  {/* Entry Content Preview */}
                  <p className="text-gray-700 mb-2 line-clamp-3">
                    {entry.content}
                  </p>
  
                  {/* Attachments */}
                  {entry.attachments && entry.attachments.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-blue-600">
                        Attachments: {entry.attachments.length}
                      </span>
                    </div>
                  )}
  
                  {/* Section Tag */}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {sections.find(s => s.id === entry.section)?.name || entry.section}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => startEditingEntry(entry)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  export default JournalContent