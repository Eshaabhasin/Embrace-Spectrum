import { useState, useRef, useEffect } from 'react';
import { 
  Book, Target, Sparkles, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

import JournalSidebar from './JournalSideBar';
import JournalContent from './JournalContent';
import TasksPanel from './TaskPanel';
import GoogleAuthService from './GoogleCalendar/GoogleAuthService'

const JournalBoard = () => {
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
  const [googleAuthStatus, setGoogleAuthStatus] = useState({
    isLoading: true,
    isAuthenticated: false,
    error: null
  });
  
  const [sensoryProfile, setSensoryProfile] = useState({
    noise: false,
    light: false,
    movement: false,
    socialInteraction: false
  });
  
  // Notification state
  const [showNotification, setShowNotification] = useState(false);

  const entryTitleRef = useRef(null);
  const entryContentRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const checkGoogleAuth = async () => {
      try {
        setGoogleAuthStatus(prev => ({ ...prev, isLoading: true }));

        const authResult = await GoogleAuthService.silentSignIn();
        
        setGoogleAuthStatus({
          isLoading: false,
          isAuthenticated: authResult.success,
          error: authResult.error || null
        });
      } catch (error) {
        console.error("Error checking Google auth status:", error);
        setGoogleAuthStatus({
          isLoading: false,
          isAuthenticated: false,
          error: error.message
        });
      }
    };
    
    checkGoogleAuth();
    
    // Load tasks from localStorage if available
    const savedTasks = localStorage.getItem('journal-tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error("Error loading saved tasks:", error);
      }
    }
    
    // Show notification after a delay if not shown before
    const hasShownNotification = sessionStorage.getItem('journal_tasks_notification');
    if (!hasShownNotification) {
      const timer = setTimeout(() => {
        setShowNotification(true);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Save tasks to localStorage when they change
  useEffect(() => {
    localStorage.setItem('journal-tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  const closeNotification = () => {
    // Mark notification as shown for this session
    sessionStorage.setItem('journal_tasks_notification', 'true');
    setShowNotification(false);
  };

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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const addEmojiToEntry = (emoji) => {
    setCurrentEntry(prev => ({
      ...prev,
      emojis: prev.emojis.includes(emoji) 
        ? prev.emojis.filter(e => e !== emoji)
        : [...prev.emojis, emoji]
    }));
  };

  // Handle Google Auth
  const handleGoogleSignIn = async () => {
    try {
      const result = await GoogleAuthService.signIn();
      if (result.success) {
        setGoogleAuthStatus({
          isLoading: false,
          isAuthenticated: true,
          error: null
        });
      } else {
        setGoogleAuthStatus({
          isLoading: false,
          isAuthenticated: false,
          error: result.error || "Authentication failed"
        });
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setGoogleAuthStatus({
        isLoading: false,
        isAuthenticated: false,
        error: error.message
      });
    }
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
  
  // Show a notification for Google Calendar status
  const showGoogleAuthNotification = () => {
    if (googleAuthStatus.error) {
      return (
        <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm">Failed to connect to Google Calendar: {googleAuthStatus.error}</p>
              <button 
                onClick={handleGoogleSignIn}
                className="mt-2 px-2 py-1 text-xs bg-red-200 text-red-800 rounded hover:bg-red-300"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
    <div className={`
      absolute flex h-[83vh] top-27 left-4 w-[97vw] rounded-xl bg-gradient-to-br from-indigo-50 to-sky-100
      ${assistiveTools.textSize === 'small' ? 'text-sm' : 
        assistiveTools.textSize === 'large' ? 'text-lg' : 'text-base'}
    `}>
      <JournalSidebar 
        selectedView={selectedView}
        setSelectedView={setSelectedView}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        assistiveTools={assistiveTools}
        setAssistiveTools={setAssistiveTools}
        sections={sections}
      />

      <div className="flex-1 flex">
        <JournalContent 
          selectedView={selectedView}
          currentEntry={currentEntry}
          setCurrentEntry={setCurrentEntry}
          entries={entries}
          saveEntry={saveEntry}
          editingEntry={editingEntry}
          updateEntry={updateEntry}
          moods={moods}
          emojis={emojis}
          sections={sections}
          isListening={isListening}
          handleSpeechToText={handleSpeechToText}
          formatDate={formatDate}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          emojiPickerRef={emojiPickerRef}
          entryTitleRef={entryTitleRef}
          entryContentRef={entryContentRef}
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
          removeAttachment={removeAttachment}
          addEmojiToEntry={addEmojiToEntry}
          startEditingEntry={startEditingEntry}
          deleteEntry={deleteEntry}
        />

        {/* Tasks Panel Component with Google Calendar Integration */}
        <TasksPanel 
          tasks={tasks}
          setTasks={setTasks}
          newTask={newTask}
          setNewTask={setNewTask}
          draggedTask={draggedTask}
          setDraggedTask={setDraggedTask}
        />
      </div>

      {/* Google Auth Status Notification */}
      {showGoogleAuthNotification()}
      
      {/* Feature Notification */}
      {showNotification && (
        <div className="fixed bottom-5 right-5 max-w-sm bg-white rounded-lg shadow-lg p-4 border-l-4 border-[#6488e9] animate-fadeIn z-50">
          <div className="flex items-start">
            <div className="ml-3 w-70 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">Generate Personalized Tasks</p>
              <p className="mt-1 text-sm text-gray-500">
                Create personalized tasks that can improve your daily life and mental well-being.
              </p>
              <div className="mt-3 flex space-x-3">
                <Link
                  to="/tracker"
                  className="bg-[#6488e9] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#5070d0]"
                >
                  Try Tracker
                </Link>
                <button
                  type="button"
                  onClick={closeNotification}
                  className="bg-white text-gray-700 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={closeNotification}
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default JournalBoard;