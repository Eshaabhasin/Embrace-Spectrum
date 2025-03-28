import React, { useState, useRef, useEffect } from 'react';
import { 
  Book, Mic, Target, Sparkles, X, Check, 
  PlusCircle, Clock, Edit3, Trash2, 
  Headphones, Sun, Move, UserCheck, 
  Paperclip, ArrowRight, Stars, Lightbulb, Smile, Brain
} from 'lucide-react';

const JournalBoard = () => {
  // Enhanced State Management
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    title: '',
    content: '',
    mood: null,
    tags: [],
    attachments: [],
    timestamp: null,
    emojis: [] 
  });
  const [isListening, setIsListening] = useState(false);
  const [selectedSection, setSelectedSection] = useState('daily');
  const [selectedView, setSelectedView] = useState('journal');
  const [assistiveTools, setAssistiveTools] = useState({
    textSize: 'medium',
    colorScheme: 'default',
    focusMode: false
  });
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    completed: []
  });
  const [newTask, setNewTask] = useState("");
  const [draggedTask, setDraggedTask] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  
  // Sensory and Emotional Support
  const [sensoryProfile, setSensoryProfile] = useState({
    noise: false,
    light: false,
    movement: false,
    socialInteraction: false
  });

  // Refs
  const entryTitleRef = useRef(null);
  const entryContentRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Mood Selection
  const moods = [
    { id: 'happy', icon: '😊', label: 'Happy' },
    { id: 'calm', icon: '😌', label: 'Calm' },
    { id: 'anxious', icon: '😰', label: 'Anxious' },
    { id: 'tired', icon: '😴', label: 'Tired' },
    { id: 'excited', icon: '🤩', label: 'Excited' }
  ];

  // Expanded Emoji Selection
  const emojis = [
    '😀', '😍', '😢', '😎', '🤔', 
    '😱', '🥳', '😴', '🤯', '❤️',
    '🌟', '🚀', '🌈', '🍕', '🐶', 
    '🎉', '💡', '🌺', '🏆', '🌙'
  ];

  // Sections
  const sections = [
    { 
      id: 'daily', 
      name: 'Daily Journal', 
      icon: <Book className="w-5 h-5" /> 
    },
    { 
      id: 'goals', 
      name: 'Goals', 
      icon: <Target className="w-5 h-5" /> 
    },
    { 
      id: 'reflections', 
      name: 'Reflections', 
      icon: <Sparkles className="w-5 h-5" /> 
    }
  ];

  // Format Date Helper
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Speech-to-Text Function
  const handleSpeechToText = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCurrentEntry(prev => ({
        ...prev,
        content: prev.content + " " + transcript
      }));
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Save Entry
  const saveEntry = () => {
    if (!currentEntry.content.trim() && !currentEntry.title.trim()) {
      alert("Please add a title or content before saving.");
      return;
    }

    const newEntry = {
      ...currentEntry,
      id: Date.now(),
      timestamp: new Date(),
      section: selectedSection
    };

    setEntries(prev => [newEntry, ...prev]);
    
    setCurrentEntry({
      title: '',
      content: '',
      mood: null,
      tags: [],
      attachments: [],
      timestamp: null,
      emojis: []
    });

    entryTitleRef.current?.focus();
    alert("Journal entry saved successfully!");
  };

  // Edit Entry Function
  const startEditingEntry = (entry) => {
    setEditingEntry(entry);
    setSelectedView('journal');
    setCurrentEntry({
      id: entry.id,
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags || [],
      attachments: entry.attachments || [],
      timestamp: entry.timestamp,
      emojis: entry.emojis || []
    });
  };

  // Update Existing Entry
  const updateEntry = () => {
    if (!currentEntry.content.trim() && !currentEntry.title.trim()) {
      alert("Please add a title or content before saving.");
      return;
    }

    setEntries(prev => prev.map(entry => 
      entry.id === currentEntry.id 
        ? { ...currentEntry, timestamp: new Date() } 
        : entry
    ));
    
    // Reset entry and editing state
    setCurrentEntry({
      title: '',
      content: '',
      mood: null,
      tags: [],
      attachments: [],
      timestamp: null,
      emojis: []
    });
    setEditingEntry(null);
    alert("Journal entry updated successfully!");
  };

  // Delete Entry Function
  const deleteEntry = (entryId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this journal entry?");
    if (confirmDelete) {
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
    }
  };

  // Add Attachment
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + file.name,
      name: file.name,
      type: file.type,
      size: file.size,
      preview: URL.createObjectURL(file)
    }));

    setCurrentEntry(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  // Remove Attachment
  const removeAttachment = (attachmentId) => {
    setCurrentEntry(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attachmentId)
    }));
  };

  // Task Drag and Drop
  const handleDragStart = (e, task, sourceColumn) => {
    setDraggedTask({ task, sourceColumn });
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    if (!draggedTask) return;

    const updatedTasks = { ...tasks };
    const sourceColumnTasks = updatedTasks[draggedTask.sourceColumn].filter(
      t => t.id !== draggedTask.task.id
    );
    updatedTasks[draggedTask.sourceColumn] = sourceColumnTasks;

    updatedTasks[targetColumn] = [
      ...updatedTasks[targetColumn], 
      draggedTask.task
    ];

    setTasks(updatedTasks);
    setDraggedTask(null);
  };

  // Assistive Tools
  const toggleTextSize = () => {
    const sizes = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(assistiveTools.textSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setAssistiveTools(prev => ({
      ...prev,
      textSize: sizes[nextIndex]
    }));
  };

  // Toggle Sensory Profile
  const toggleSensoryProfile = (key) => {
    setSensoryProfile(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Add Emoji to Entry
  const addEmojiToEntry = (emoji) => {
    setCurrentEntry(prev => ({
      ...prev,
      emojis: prev.emojis.includes(emoji) 
        ? prev.emojis.filter(e => e !== emoji)
        : [...prev.emojis, emoji]
    }));
  };

  // Add New Task
  const addNewTask = () => {
    if (newTask.trim()) {
      setTasks(prev => ({
        ...prev,
        todo: [...prev.todo, {
          id: `task-${Date.now()}`,
          content: newTask,
          priority: 'medium',
          createdAt: new Date()
        }]
      }));
      setNewTask("");
    }
  };

  // Remove Task
  const removeTask = (taskId, column) => {
    setTasks(prev => ({
      ...prev,
      [column]: prev[column].filter(task => task.id !== taskId)
    }));
  };

  // Close Emoji Picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showEmojiPicker && 
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <div className={`
      flex h-screen bg-gradient-to-br from-indigo-50 to-sky-100
      ${assistiveTools.textSize === 'small' ? 'text-sm' : 
        assistiveTools.textSize === 'large' ? 'text-lg' : 'text-base'}
    `}>
      {/* Sidebar */}
      <div className="w-64 bg-white/70 backdrop-blur-md border-r border-indigo-100 p-4 flex flex-col shadow-md">
        <div className="flex items-center mb-6">
          <Brain className="w-6 h-6 mr-2 text-blue-700" />
          <h1 className="text-xl font-bold text-blue-900">NeuroJournal</h1>
        </div>

        {/* View Selection */}
        <div className="mt-4 space-y-2">
          <button
            onClick={() => setSelectedView('journal')}
            className={`
              w-full p-2 rounded-md flex items-center
              ${selectedView === 'journal' 
                ? 'bg-blue-200 text-blue-800' 
                : 'hover:bg-blue-100 text-blue-600'}
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
                ? 'bg-blue-200 text-blue-800' 
                : 'hover:bg-blue-100 text-blue-600'}
            `}
          >
            <Clock className="w-5 h-5 mr-2" />
            Journal History
          </button>
        </div>

        {/* Assistive Tools Section */}
        <div className="mb-4 bg-blue-200 p-2 rounded-md mt-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
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
                  ? 'bg-blue-200 text-blue-800' 
                  : 'hover:bg-blue-100 text-blue-600'}
              `}
            >
              {section.icon}
              <span className="ml-2">{section.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {selectedView === 'journal' ? (
          // Journal Entry Section
          <div className="w-full p-6 bg-white">
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
              className="w-full p-2 text-xl font-semibold mb-2 border-b border-blue-200"
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
                className="absolute top-2 right-5 width-[0px]" 
              >
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-blue-600 hover:text-blue-800"
                  aria-label="Add Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
                
                {showEmojiPicker && (
                  <div className="
                    absolute top-full right-0 
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
                onClick={saveEntry}
                className="
                  bg-green-100 text-green-600 p-2 rounded-full 
                  hover:bg-green-200 transition-colors
                  flex items-center
                "
                aria-label="Save Entry"
              >
                <Check className="w-6 h-6 mr-1" /> Save
              </button>
            </div>
          </div>
        ) : (
          // Journal History Section
          <div className="w-full p-6 bg-white overflow-y-auto">
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
                  <div className="mt-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {sections.find(s => s.id === entry.section)?.name || entry.section}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tasks Section */}
        <div className="w-1/3 border-l border-blue-200 p-4 bg-blue-50 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-900">Tasks</h2>
            <button 
              onClick={() => {}}
              className="text-blue-600 hover:text-blue-800"
            >
              <PlusCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Task Input */}
          <div className="mb-4 flex">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task"
              className="flex-1 p-2 border border-blue-200 rounded-l-md focus:ring-2 focus:ring-blue-300"
              onKeyPress={(e) => e.key === 'Enter' && addNewTask()}
            />
            <button 
              onClick={addNewTask}
              className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>

          {/* Task Columns */}
          {['todo', 'inProgress', 'completed'].map((columnId) => (
            <div 
              key={columnId}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columnId)}
              className="mb-4 min-h-[100px] border-2 border-dashed border-blue-200 rounded-md p-2"
            >
              <h3 className="text-md font-medium mb-2 capitalize text-blue-800">
                {columnId.replace(/([A-Z])/g, ' $1')}
              </h3>
              {tasks[columnId].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task, columnId)}
                  className="
                    bg-white p-2 rounded-md mb-2 shadow-sm 
                    flex items-center cursor-move 
                    border border-blue-100 hover:bg-blue-50 
                    group relative
                  "
                >
                  <Move className="mr-2 text-blue-400" />
                  <span className="flex-1">{task.content}</span>
                  <button
                    onClick={() => removeTask(task.id, columnId)}
                    className="
                      text-red-500 hover:text-red-700 
                      opacity-0 group-hover:opacity-100 
                      transition-opacity ml-2
                    "
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JournalBoard;