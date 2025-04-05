import React, { useState, useRef, useEffect } from 'react';
import { 
  Book,Target, Sparkles
} from 'lucide-react';

import JournalSidebar from './JournalSideBar';
import JournalContent from './JournalContent';
import TasksPanel from './TaskPanel';

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
  
          {/* 3. Tasks Panel Component */}
          <TasksPanel 
            tasks={tasks}
            setTasks={setTasks}
            newTask={newTask}
            setNewTask={setNewTask}
            draggedTask={draggedTask}
            setDraggedTask={setDraggedTask}
          />
        </div>
      </div>
    );
  };
  
  export default JournalBoard;